# Firebase & GA4 Setup Guide - Complete

This guide provides step-by-step instructions to complete Firebase Analytics (GA4) integration for SmartWheelsMobile.

## Prerequisites

- Firebase account (or create one at https://console.firebase.google.com)
- Google Analytics 4 property
- Access to iOS App Store Connect and Google Play Console (for production)

---

## Step 1: Create/Configure Firebase Project

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or select existing project
3. Enter project name: `SmartWheelers` (or your preferred name)
4. Enable Google Analytics (if not already enabled)
5. Select or create a GA4 property
6. Click **"Create project"**

### 1.2 Add iOS App to Firebase

1. In Firebase Console, click **"Add app"** → Select **iOS**
2. Enter iOS bundle ID: `com.smartwheelsmobile`
3. Enter app nickname: `SmartWheelsMobile iOS` (optional)
4. Enter App Store ID (if available, otherwise skip)
5. Click **"Register app"**
6. Download `GoogleService-Info.plist`
7. **Place file at**: `SmartWheelsMobile/ios/SmartWheelsMobile/GoogleService-Info.plist`

### 1.3 Add Android App to Firebase

1. In Firebase Console, click **"Add app"** → Select **Android**
2. Enter Android package name: `com.smartwheelsmobile`
3. Enter app nickname: `SmartWheelsMobile Android` (optional)
4. Enter SHA-1 certificate fingerprint (for production, see below)
5. Click **"Register app"**
6. Download `google-services.json`
7. **Place file at**: `SmartWheelsMobile/android/app/google-services.json`

### 1.4 Link Firebase to GA4

1. In Firebase Console, go to **Project Settings** → **Integrations**
2. Find **Google Analytics** section
3. Click **"Manage"** or **"Link"**
4. Select your GA4 property
5. Click **"Link"**

---

## Step 2: Configure iOS

### 2.1 Add GoogleService-Info.plist to Xcode

1. Open `SmartWheelsMobile/ios/SmartWheelsMobile.xcworkspace` in Xcode
2. Right-click on `SmartWheelsMobile` folder in Project Navigator
3. Select **"Add Files to SmartWheelsMobile..."**
4. Navigate to and select `GoogleService-Info.plist`
5. ✅ Check **"Copy items if needed"**
6. ✅ Check **"SmartWheelsMobile"** target
7. Click **"Add"**

### 2.2 Verify iOS Configuration

1. In Xcode, select `GoogleService-Info.plist` in Project Navigator
2. Verify it's included in the **SmartWheelsMobile** target
3. Verify the file contains:
   - `PROJECT_ID`
   - `BUNDLE_ID` (should be `com.smartwheelsmobile`)
   - `CLIENT_ID`
   - `API_KEY`

### 2.3 Install iOS Dependencies

```bash
cd SmartWheelsMobile/ios
pod install
cd ../..
```

---

## Step 3: Configure Android

### 3.1 Verify google-services.json

1. Open `SmartWheelsMobile/android/app/google-services.json`
2. Verify it contains:
   - `project_number`
   - `package_name` (should be `com.smartwheelsmobile`)
   - `client` array with configuration

### 3.2 Verify Android Build Configuration

The Android build is already configured:
- ✅ `google-services` plugin in `android/app/build.gradle` (line 4)
- ✅ Google Services classpath in `android/build.gradle` (line 18)

No additional configuration needed.

### 3.3 Get SHA-1 Fingerprint (For Production)

For production builds, you'll need to add your release keystore SHA-1 to Firebase:

```bash
# Debug keystore (for testing)
cd SmartWheelsMobile/android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android

# Production keystore (create one first)
keytool -list -v -keystore release.keystore -alias release-key
```

Then add the SHA-1 fingerprint to Firebase Console → Project Settings → Your Android App → Add fingerprint.

---

## Step 4: Verify Integration

### 4.1 Build and Run

```bash
# iOS
cd SmartWheelsMobile
npm run ios

# Android
npm run android
```

### 4.2 Test Analytics Events

1. Open the app
2. Navigate through screens (should trigger screen view events)
3. Perform actions (login, scan, etc.)

### 4.3 Verify in Firebase/GA4

1. **Firebase Console**:
   - Go to **Analytics** → **DebugView**
   - You should see events in real-time

2. **GA4 Dashboard**:
   - Go to **Reports** → **Realtime**
   - You should see active users and events

### 4.4 Expected Events

The app automatically tracks:
- Screen views (via `useScreenTracking` hook)
- User identification (on login)
- User properties (admin status)

---

## Step 5: Production Configuration

### 5.1 iOS Production

1. Create App Store Connect app (if not exists)
2. Configure App Store certificates and provisioning profiles
3. Build release version:
   ```bash
   cd ios
   xcodebuild -workspace SmartWheelsMobile.xcworkspace \
     -scheme SmartWheelsMobile \
     -configuration Release \
     -archivePath build/SmartWheelsMobile.xcarchive \
     archive
   ```

### 5.2 Android Production

1. Create release keystore:
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore release.keystore \
     -alias release-key \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure `android/app/build.gradle`:
   ```gradle
   signingConfigs {
     release {
       storeFile file('release.keystore')
       storePassword 'YOUR_PASSWORD'
       keyAlias 'release-key'
       keyPassword 'YOUR_PASSWORD'
     }
   }
   buildTypes {
     release {
       signingConfig signingConfigs.release
       // ... other config
     }
   }
   ```

3. Build release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

---

## Troubleshooting

### iOS Issues

**Issue**: Pod install fails
- **Solution**: Run `pod repo update` then `pod install`

**Issue**: GoogleService-Info.plist not found
- **Solution**: Verify file is in Xcode project and target membership is checked

**Issue**: Analytics not working
- **Solution**: Check that Firebase Analytics is enabled in Firebase Console

### Android Issues

**Issue**: google-services.json not found
- **Solution**: Verify file is at `android/app/google-services.json`

**Issue**: Build fails with Google Services error
- **Solution**: Verify `google-services` plugin is applied in `build.gradle`

**Issue**: Analytics not working
- **Solution**: Check that Firebase Analytics is enabled and SHA-1 is added

### General Issues

**Issue**: Events not appearing in GA4
- **Solution**: 
  - Wait 24-48 hours for standard reports (Realtime should work immediately)
  - Check DebugView for immediate verification
  - Verify app is connected to internet

**Issue**: User properties not set
- **Solution**: Check that `setAnalyticsUserProperties` is called after login

---

## File Checklist

After setup, verify these files exist:

- [ ] `ios/SmartWheelsMobile/GoogleService-Info.plist`
- [ ] `android/app/google-services.json`
- [ ] iOS Pods installed (`ios/Pods/` directory exists)
- [ ] Android build.gradle has google-services plugin

---

## Next Steps

After Firebase/GA4 setup is complete:

1. ✅ Test on physical devices (see `TESTING_GUIDE.md`)
2. ✅ Prepare app store assets (see `APP_STORE_PREPARATION.md`)
3. ✅ Deploy to app stores (see `DEPLOYMENT_GUIDE.md`)

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [React Native Firebase](https://rnfirebase.io/)

---

**Status**: Ready for Firebase configuration files. Once `GoogleService-Info.plist` and `google-services.json` are added, the app will automatically start sending analytics events.
