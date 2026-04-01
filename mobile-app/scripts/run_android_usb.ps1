$ErrorActionPreference = "Stop"

param(
  [string]$DeviceId = "",
  [string]$MapboxToken = ""
)

Write-Host "Starting adb server..."
adb start-server | Out-Null

if ([string]::IsNullOrWhiteSpace($DeviceId)) {
  $deviceLine = flutter devices | Select-String -Pattern "• android-" | Select-Object -First 1
  if ($null -eq $deviceLine) {
    Write-Error "No Android device detected. Check USB cable, USB debugging, and 'adb devices'."
    exit 1
  }

  $parts = $deviceLine.ToString().Split("•")
  if ($parts.Length -lt 2) {
    Write-Error "Could not parse Flutter device list. Run 'flutter devices' manually."
    exit 1
  }

  $DeviceId = $parts[1].Trim()
}

if ([string]::IsNullOrWhiteSpace($MapboxToken) -and $env:MAPBOX_ACCESS_TOKEN) {
  $MapboxToken = $env:MAPBOX_ACCESS_TOKEN
}

if ([string]::IsNullOrWhiteSpace($MapboxToken)) {
  Write-Host "MAPBOX_ACCESS_TOKEN not set. Map tab will show fallback message."
  flutter run -d $DeviceId
  exit $LASTEXITCODE
}

flutter run -d $DeviceId --dart-define=MAPBOX_ACCESS_TOKEN=$MapboxToken
exit $LASTEXITCODE
