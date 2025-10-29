# Beehive DevContainer base image
FROM mcr.microsoft.com/devcontainers/javascript-node:20-bookworm

# Install system deps
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Install playwright browsers
RUN npx playwright install --with-deps

# Install netlify-cli globally
RUN npm install -g netlify-cli

# Install pnpm
RUN npm install -g pnpm

# Set up workdir
WORKDIR /workspace
