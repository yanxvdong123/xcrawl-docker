FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install --production

# Copy app
COPY scrape.js .

# Default command
ENTRYPOINT ["node", "/app/scrape.js"]
CMD ["--help"]
