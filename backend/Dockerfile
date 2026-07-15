FROM node:18-slim

# Install system dependencies for Puppeteer (Chromium)
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && apt-get install -y \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        fonts-freefont-ttf \
        libxss1 \
        libasound2 \
        libatk1.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgbm1 \
        libgcc1 \
        libgconf-2-4 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxtst6 \
        --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Skip downloading Chromium in Puppeteer install (we can use the installed chromium or let puppeteer download it, but here we can let puppeteer download if we don't install chrome system-wide, or install system-wide chrome)
# To make it simple and reliable, we'll install chromium-browser via apt or let Puppeteer download it inside the container (default behavior) by NOT skipping download, but we need the system deps above so it runs correctly.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

WORKDIR /app

COPY package*.json ./

RUN npm install

# Install nodemon globally in case it is used by package.json scripts
RUN npm install -g nodemon

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
