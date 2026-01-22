## SmartWheelsMobile GA4 setup

This app uses Firebase Analytics to send events to GA4.

### 1) Create/confirm Firebase + GA4
- Create a Firebase project (or use existing)
- Add an iOS app and Android app with bundle IDs:
  - iOS: `com.smartwheelsmobile`
  - Android: `com.smartwheelsmobile`
- Link Firebase to the correct GA4 property

### 2) Download config files
- iOS: `GoogleService-Info.plist`
  - Place at `SmartWheelsMobile/ios/SmartWheelsMobile/GoogleService-Info.plist`
  - Add the file to the Xcode project (Copy items if needed)
- Android: `google-services.json`
  - Place at `SmartWheelsMobile/android/app/google-services.json`

### 3) Install iOS pods
- `cd ios`
- `pod install`

### 4) Verify
- Run app on device or emulator
- Check GA4 Realtime and Firebase DebugView
