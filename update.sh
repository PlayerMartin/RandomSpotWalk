#!/usr/bin/env bash
# Pull the latest code and rebuild/restart the app with Docker.
# Usage: ./update.sh
set -euo pipefail

# Run from this script's directory, wherever it is invoked from.
cd "$(dirname "$0")"

echo "==> Pulling latest code"
git pull origin main

echo "==> Rebuilding and restarting containers"
docker compose up --build -d

echo "==> Done. App is up to date and running."
