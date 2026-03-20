param(
  [Parameter(Mandatory = $true)][string]$InputPbf,
  [Parameter(Mandatory = $false)][string]$OutputDir = "backend\data\osm"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command osmium -ErrorAction SilentlyContinue)) {
  throw "Missing 'osmium' command. Install osmium-tool first."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$reviewablePbf = Join-Path $OutputDir "vn-reviewable.osm.pbf"
$reviewableGeoJson = Join-Path $OutputDir "vn-reviewable.geojson"

$filters = @(
  "nwr/amenity=restaurant,cafe,fast_food,bar,pub,biergarten,food_court,nightclub",
  "nwr/leisure=amusement_arcade,water_park,theme_park",
  "nwr/tourism=attraction,museum,zoo,aquarium"
)

Write-Host "[1/2] Filter reviewable places from OSM PBF..."
osmium tags-filter $InputPbf $filters -o $reviewablePbf --overwrite

Write-Host "[2/2] Export GeoJSON..."
osmium export $reviewablePbf -o $reviewableGeoJson --overwrite

Write-Host "Done:"
Write-Host "  PBF:     $reviewablePbf"
Write-Host "  GeoJSON: $reviewableGeoJson"
