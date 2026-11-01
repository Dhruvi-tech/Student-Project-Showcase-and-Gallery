# Starts the API against the preserved 320-project SQLite database in the repository root.
$projectRoot = Split-Path -Parent $PSScriptRoot
$databasePath = (Join-Path $projectRoot 'showcase.db') -replace '\\', '/'
$env:DATABASE_URL = "sqlite:///$databasePath"
$env:ENVIRONMENT = 'development'
$env:DEMO_MODE = 'true'
Set-Location (Join-Path $projectRoot 'backend')
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload


