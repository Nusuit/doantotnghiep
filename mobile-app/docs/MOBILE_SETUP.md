# MOBILE SETUP

Setup and configuration guide for the Flutter mobile app.

---

## Requirements

| Tool | Version |
|---|---|
| Flutter SDK | >= 3.10.4 (Dart SDK ^3.10.4) |
| Android Studio or Xcode | For Android / iOS targets |
| Chrome | For web target |

Check your Flutter version:

```bash
flutter doctor
```

---

## Install dependencies

```bash
cd mobile-app
flutter pub get
```

---

## Configuration

All runtime configuration is injected via `--dart-define` at build/run time. No `.env` file — secrets stay out of the source tree.

### API base URL

Defined in `lib/src/core/config/app_config.dart`:

```dart
static const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:1002',
);
```

The default (`http://localhost:1002`) works when the backend Docker stack is running locally.

To override:

```bash
flutter run --dart-define=API_BASE_URL=http://your-backend-url
```

### Mapbox token

Defined in `lib/src/core/config/mapbox_config.dart`:

```dart
const String _mapboxToken = String.fromEnvironment(
  'MAPBOX_ACCESS_TOKEN',
  defaultValue: '',
);
```

Pass the token at run time:

```bash
flutter run --dart-define=MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

Without a token, the map will not render.

### OAuth callback

Defined in `lib/src/core/config/app_config.dart`:

- Scheme: `knowledgeshare` (default)
- Host: `auth` (default)
- Full callback URI: `knowledgeshare://auth/callback`

To use a custom scheme:

```bash
flutter run --dart-define=OAUTH_CALLBACK_SCHEME=yourscheme --dart-define=OAUTH_CALLBACK_HOST=auth
```

---

## Platform-specific OAuth setup

### Android

Add an intent filter to `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="knowledgeshare" android:host="auth" />
</intent-filter>
```

### iOS

Add a URL scheme entry to `ios/Runner/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>knowledgeshare</string>
    </array>
  </dict>
</array>
```

**Note:** Neither of these is wired yet (see [docs/PROBLEMS.md](../../docs/PROBLEMS.md)).

---

## Web target (Mapbox GL JS)

Mapbox on Flutter Web requires the Mapbox GL JS script to be loaded in `web/index.html`. Without it, the map will not render on web.

Add to `web/index.html` `<head>`:

```html
<link href="https://api.mapbox.com/mapbox-gl-js/v3.x.x/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.x.x/mapbox-gl.js"></script>
```

Then run:

```bash
flutter run -d chrome --dart-define=MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

---

## Token storage

The app uses `flutter_secure_storage` for sensitive values (JWT tokens).
Do **not** use `shared_preferences` for tokens — it is not encrypted on all platforms.

Storage keys are defined in the auth feature's service layer.

---

## Run commands

```bash
flutter run                    # default device
flutter run -d chrome          # web
flutter build apk              # Android release APK
flutter build ios              # iOS release
flutter analyze                # static analysis
flutter test                   # run tests
```
