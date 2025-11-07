#!/bin/bash
cd /app
export HOST="0.0.0.0"
export PORT="3000"
exec pnpm dev
