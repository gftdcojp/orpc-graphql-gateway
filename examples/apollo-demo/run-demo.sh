#!/bin/bash

# Apollo Demo実行スクリプト

echo "=== Apollo Demo Setup ==="
echo ""

# ビルド確認
if [ ! -d "../../dist" ]; then
  echo "Building library..."
  cd ../..
  pnpm build
  cd examples/apollo-demo
fi

echo "Starting Apollo Server..."
echo "Server will be available at http://localhost:4000"
echo "Press Ctrl+C to stop"
echo ""

# サーバーを起動
pnpm server

