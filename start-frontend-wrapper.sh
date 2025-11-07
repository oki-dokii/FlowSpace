#!/bin/bash
cd /app
export HOST="0.0.0.0"
export PORT="3000"
export NODE_OPTIONS="--max-old-space-size=2048"
exec pnpm dev
