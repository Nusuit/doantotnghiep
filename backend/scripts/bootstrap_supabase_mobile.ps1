param(
  [string]$DatabaseUrl = "",
  [string]$PsqlPath = "psql"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$schemaPath = Join-Path $projectRoot "prisma\schema.prisma"
$sql07Path = Join-Path $projectRoot "prisma\sql_groups\07_search_map_mobile_supabase.sql"
$sql08Path = Join-Path $projectRoot "prisma\sql_groups\08_hcm_food_mock_seed.sql"

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  $DatabaseUrl = $env:DATABASE_URL
}

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  throw "Missing DatabaseUrl. Pass -DatabaseUrl or set DATABASE_URL."
}

if ($DatabaseUrl -match ":6543/") {
  throw "DatabaseUrl appears to use Supabase transaction pooler (:6543). Use direct connection or session pooler (:5432) for Prisma migrations."
}

if (-not (Test-Path $schemaPath)) {
  throw "Prisma schema not found: $schemaPath"
}

if (-not (Test-Path $sql07Path)) {
  throw "Missing file: $sql07Path"
}

if (-not (Test-Path $sql08Path)) {
  throw "Missing file: $sql08Path"
}

$env:DATABASE_URL = $DatabaseUrl

Push-Location $projectRoot
try {
  Write-Host "Applying Prisma migrations to Supabase..."
  npx prisma migrate deploy --schema $schemaPath
  if ($LASTEXITCODE -ne 0) {
    throw "Prisma migrate deploy failed."
  }

  $psqlCmd = Get-Command $PsqlPath -ErrorAction SilentlyContinue
  if ($null -eq $psqlCmd) {
    Write-Host ""
    Write-Host "Prisma migrations completed."
    Write-Host "psql was not found, so run these two files manually in Supabase SQL Editor in order:"
    Write-Host "1. $sql07Path"
    Write-Host "2. $sql08Path"
    exit 0
  }

  Write-Host "Applying Search/Map optimization layer (07)..."
  & $psqlCmd.Source $DatabaseUrl -v ON_ERROR_STOP=1 -f $sql07Path
  if ($LASTEXITCODE -ne 0) {
    throw "Running 07_search_map_mobile_supabase.sql failed."
  }

  Write-Host "Applying HCM mock seed (08)..."
  & $psqlCmd.Source $DatabaseUrl -v ON_ERROR_STOP=1 -f $sql08Path
  if ($LASTEXITCODE -ne 0) {
    throw "Running 08_hcm_food_mock_seed.sql failed."
  }

  Write-Host ""
  Write-Host "Supabase mobile bootstrap completed successfully."
}
finally {
  Pop-Location
}
