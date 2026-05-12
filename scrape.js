#!/usr/bin/env node
/**
 * XCrawl Docker Scraper — CLI entry point
 * 
 * Usage: docker run -e XCRAWL_API_KEY=key xcrawl/scraper https://example.com
 */

const https = require('https');
const API_KEY = process.env.XCRAWL_API_KEY;
const API_URL = process.env.XCRAWL_API_URL || 'https://api.xcrawl.com/v1';

if (!API_KEY) {
  console.error('Error: XCRAWL_API_KEY environment variable is required');
  process.exit(1);
}

const args = process.argv.slice(2);
const urlArg = args.find(a => !a.startsWith('--'));
const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'markdown';
const batchMode = args.includes('--batch');
const outputDir = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;

if (!urlArg && !batchMode) {
  console.log('XCrawl Scraper — Docker Edition');
  console.log('');
  console.log('Usage:');
  console.log('  docker run -e XCRAWL_API_KEY=key xcrawl/scraper <URL>');
  console.log('  docker run -e XCRAWL_API_KEY=key xcrawl/scraper --format json <URL>');
  console.log('  docker run -i -e XCRAWL_API_KEY=key xcrawl/scraper --batch < urls.txt');
  console.log('  docker run -v $(pwd)/output:/output -e XCRAWL_API_KEY=key xcrawl/scraper --output /output <URL>');
  process.exit(0);
}

function scrape(url) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ url, format });
    const opts = {
      hostname: new URL(API_URL).hostname,
      path: '/scrape',
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve({ success: false, error: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  let urls = [];

  if (batchMode) {
    // Read URLs from stdin
    const stdin = await new Promise(resolve => {
      let data = '';
      process.stdin.on('data', c => data += c);
      process.stdin.on('end', () => resolve(data.trim().split('\n').filter(Boolean)));
    });
    urls = stdin;
  } else {
    urls = [urlArg];
  }

  const results = [];
  for (const url of urls) {
    process.stderr.write(`Scraping: ${url}\n`);
    const result = await scrape(url);
    results.push(result);
  }

  if (outputDir) {
    const fs = require('fs');
    const output = JSON.stringify(results, null, 2);
    const filePath = `${outputDir}/results.json`;
    fs.writeFileSync(filePath, output);
    process.stderr.write(`Results saved to ${filePath}\n`);
  } else {
    console.log(JSON.stringify(results, null, 2));
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
