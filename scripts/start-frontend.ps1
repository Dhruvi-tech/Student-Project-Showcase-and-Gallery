# Starts the Vite development server. Its proxy forwards API calls to port 8000.
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $projectRoot 'frontend')
npm run dev -- --host 127.0.0.1 --port 5173


