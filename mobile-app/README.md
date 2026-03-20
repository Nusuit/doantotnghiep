# Knowledge Share (Mobile)

Flutter mobile scaffold for Knowledge Share with 4 tabs:

- Home: search-only UI with suggestions.
- Explore: simple feed cards.
- Map: Mapbox map (shows fallback when token is missing).
- Profile: basic account management UI.

## Architecture Notes

- [Mobile Architecture](./docs/MOBILE_ARCHITECTURE.md)
- [Mobile API Design](./docs/MOBILE_API_DESIGN.md)
- [Supabase Schema Proposal](./docs/SUPABASE_SCHEMA_PROPOSAL.sql)

## Run on Android device via USB

Prerequisites:

- Enable Developer Options + USB Debugging on the phone.
- Install Android SDK Platform Tools (`adb`) and Flutter SDK.
- Confirm device visibility with `adb devices`.

PowerShell:

```powershell
cd mobile-app
.\scripts\run_android_usb.ps1
```

With explicit token:

```powershell
.\scripts\run_android_usb.ps1 -MapboxToken "YOUR_MAPBOX_PUBLIC_TOKEN"
```

Bash:

```bash
cd mobile-app
./scripts/run_android_usb.sh
```

With explicit token:

```bash
./scripts/run_android_usb.sh "" "YOUR_MAPBOX_PUBLIC_TOKEN"
```

## Direct Flutter command

```powershell
flutter run -d <android-device-id> --dart-define=MAPBOX_ACCESS_TOKEN=YOUR_MAPBOX_PUBLIC_TOKEN
```

With backend API URL:

```powershell
flutter run -d <android-device-id> --dart-define=API_BASE_URL=http://<your-lan-ip>:1002 --dart-define=MAPBOX_ACCESS_TOKEN=YOUR_MAPBOX_PUBLIC_TOKEN
```

OAuth mobile callback currently uses:

- Scheme: `knowledgeshare`
- Host: `auth`
- Callback URI: `knowledgeshare://auth/callback`

## Build Debug APK (know_debug.apk)

PowerShell (run from any folder):

```powershell
& "C:\Kien\Web\doantotnghiep\mobile-app\scripts\build_know_debug.ps1" -MapboxToken "YOUR_MAPBOX_PUBLIC_TOKEN"
```

Output file:

- `C:\Kien\Web\doantotnghiep\mobile-app\know_debug.apk`
