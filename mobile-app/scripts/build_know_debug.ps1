param(
  [string]$ProjectRoot = "C:\Kien\Web\doantotnghiep\mobile-app",
  [string]$ApiBaseUrl = "http://localhost:1002",
  [string]$MapboxToken = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "ProjectRoot does not exist: $ProjectRoot"
}

$pubspecPath = Join-Path $ProjectRoot "pubspec.yaml"
if (-not (Test-Path $pubspecPath)) {
  throw "Invalid Flutter project root (missing pubspec.yaml): $ProjectRoot"
}

$flutterCmd = Get-Command flutter -ErrorAction Stop

Push-Location $ProjectRoot
try {
  & $flutterCmd.Source pub get
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

  $buildArgs = @(
    "build",
    "apk",
    "--debug",
    "--dart-define=API_BASE_URL=$ApiBaseUrl"
  )

  if (-not [string]::IsNullOrWhiteSpace($MapboxToken)) {
    $buildArgs += "--dart-define=MAPBOX_ACCESS_TOKEN=$MapboxToken"
  }

  & $flutterCmd.Source @buildArgs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

  $sourceApk = Join-Path $ProjectRoot "build\app\outputs\flutter-apk\app-debug.apk"
  if (-not (Test-Path $sourceApk)) {
    throw "APK not found after build: $sourceApk"
  }

  $outputApk = Join-Path $ProjectRoot "know_debug.apk"
  Copy-Item -Path $sourceApk -Destination $outputApk -Force

  Write-Host ""
  Write-Host "Build completed."
  Write-Host "Source APK: $sourceApk"
  Write-Host "Output APK: $outputApk"
}
finally {
  Pop-Location
}
