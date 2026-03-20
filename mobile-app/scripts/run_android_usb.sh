#!/usr/bin/env bash
set -euo pipefail

DEVICE_ID="${1:-}"
MAPBOX_TOKEN="${2:-${MAPBOX_ACCESS_TOKEN:-}}"

adb start-server >/dev/null

if [[ -z "$DEVICE_ID" ]]; then
  DEVICE_ID="$(flutter devices | awk -F '•' '/android-/{gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit}')"
fi

if [[ -z "$DEVICE_ID" ]]; then
  echo "No Android device detected. Check USB cable, USB debugging, and 'adb devices'." >&2
  exit 1
fi

if [[ -z "$MAPBOX_TOKEN" ]]; then
  echo "MAPBOX_ACCESS_TOKEN not set. Map tab will show fallback message."
  flutter run -d "$DEVICE_ID"
  exit $?
fi

flutter run -d "$DEVICE_ID" --dart-define="MAPBOX_ACCESS_TOKEN=$MAPBOX_TOKEN"
