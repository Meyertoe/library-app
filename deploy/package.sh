#!/usr/bin/env bash
# Run from any directory. Builds a Linux x64 release with its own .NET 9 runtime.
set -euo pipefail
cd "$(dirname "$0")/.."
npm --prefix frontend ci
npm --prefix frontend run build
dotnet publish backend/Library.Api -c Release -r linux-x64 --self-contained true \
  -p:DebugType=None -p:DebugSymbols=false -o artifacts/linux
mkdir -p artifacts/linux/wwwroot
cp -R frontend/dist/frontend/browser/. artifacts/linux/wwwroot/
# Development configuration must never be distributed.
python3 - <<'PY'
from pathlib import Path
for path in Path('artifacts/linux').glob('appsettings.*.json'):
    path.unlink()
PY
printf 'Package ready in artifacts/linux/\n'
