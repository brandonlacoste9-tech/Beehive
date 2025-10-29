#!/bin/bash
set -e

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example"
fi

if ! command -v pnpm &> /dev/null; then
  npm install -g pnpm
fi

pnpm install || npm install
