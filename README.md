# XCrawl Scraper Docker Image

A lightweight container for scraping web pages via XCrawl Proxy.

## Usage

```bash
# Pull and run
docker run -e XCRAWL_API_KEY=your_key xcrawl/scraper https://example.com

# Run with specific format
docker run -e XCRAWL_API_KEY=your_key xcrawl/scraper \
  --format json https://example.com

# Batch mode (read URLs from stdin)
echo "https://example.com" | docker run -i -e XCRAWL_API_KEY=your_key xcrawl/scraper --batch

# Mount volume for output
docker run -v $(pwd)/output:/output -e XCRAWL_API_KEY=your_key \
  xcrawl/scraper --output /output https://example.com
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `XCRAWL_API_KEY` | Yes | Your XCrawl API key |
| `XCRAWL_API_URL` | No | API base URL (default: https://api.xcrawl.com/v1) |

## Building

```bash
docker build -t xcrawl/scraper .
```

## Publish to Docker Hub

```bash
docker tag xcrawl/scraper yourusername/xcrawl-scraper:latest
docker push yourusername/xcrawl-scraper:latest
```
