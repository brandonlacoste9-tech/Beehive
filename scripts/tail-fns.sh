#!/bin/bash

# Tail Netlify Functions logs with color-coded output
# Usage: ./tail-fns.sh

set -e

echo -e "\033[36m🐝 Tailing Netlify Functions logs...\033[0m"
echo -e "\033[33mPress Ctrl+C to stop\n\033[0m"

# Function to colorize output
colorize_github() {
    while IFS= read -r line; do
        echo -e "\033[32m[github-webhook] $line\033[0m"
    done
}

colorize_telemetry() {
    while IFS= read -r line; do
        echo -e "\033[35m[webhook-telemetry] $line\033[0m"
    done
}

# Cleanup function
cleanup() {
    echo -e "\n\033[36m✅ Stopped tailing logs\033[0m"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM

# Tail both functions in parallel
netlify functions:log github-webhook 2>&1 | colorize_github &
netlify functions:log webhook-telemetry 2>&1 | colorize_telemetry &

# Wait for background processes
wait
