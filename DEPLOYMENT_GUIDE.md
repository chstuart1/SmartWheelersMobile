# Deployment Guide - SmartWheelsMobile

Complete guide for deploying SmartWheelsMobile to iOS App Store and Google Play Store.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [iOS Deployment](#ios-deployment)
3. [Android Deployment](#android-deployment)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests passed (see `TESTING_GUIDE.md`)
- [ ] Firebase/GA4 configured (see `FIREBASE_GA4_SETUP_COMPLETE.md`)
- [ ] App store assets prepared (see `APP_STORE_PREPARATION.md`)
- [ ] Version number updated
- [ ] Build number incremented
- [ ] No debug code in production
- [ ] Analytics verified
- [ ] Error handling tested
- [ ] Performance acceptable

---

## iOS Deployment

### Step 1: Update Version Information

#### Update app.json
```json
{
  "name": "SmartWheelsMobile",
  "displayName": "SmartWheelsMobile",
  "version": "1.0.0"
}
```

#### Update Xcode Project
1. Open `ios/SmartWheelsMobile.xcworkspace` in Xcode
2. Select **SmartWheelsMobile** project in Navigator
3. Select **SmartWheelsMobile** target
4. Go to **General** tab
5. Update:
   - **Version**: 1.0.0
   - **Build**: 1 (increment for each build)

### Step 2: Configure Signing & Capabilities

1. In Xcode, select **SmartWheelsMobile** target
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account)
4. Verify **Bundle Identifier**: `com.smartwheelsmobile`
5. Xcode will automatically manage provisioning profiles

### Step 3: Build Archive

#### Option A: Using Xcode GUI

1. Select **Any iOS Device** or **Generic iOS Device** as target
2. Go to **Product** → **Archive**
3. Wait for archive to complete
4. **Organizer** window will open automatically

#### Option B: Using Command Line

```bash
cd SmartWheelsMobile/ios

# Clean build folder
xcodebuild clean -workspace SmartWheelsMobile.xcworkspace \
  -scheme SmartWheelsMobile

# Create archive
xcodebuild archive \
  -workspace SmartWheelsMobile.xcworkspace \
  -scheme SmartWheelsMobile \
  -configuration Release \
  -archivePath build/SmartWheelsMobile.xcarchive \
  -destination 'generic/platform=iOS'
```

### Step 4: Validate Archive

1. In Xcode **Organizer**, select your archive
2. Click **Validate App**
3. Sign in with Apple ID
4. Select **Automatically manage signing**
5. Wait for validation to complete
6. Fix any issues if validation fails

### Step 5: Upload to App Store Connect

#### Option A: Using Xcode GUI

1. In **Organizer**, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Click **Next**
5. Select **Upload**
6. Click **Next**
7. Select **Automatically manage signing**
8. Click **Next**
9. Review options and click **Upload**
10. Wait for upload to complete (10-30 minutes)

#### Option B: Using Command Line

```bash
# Upload using xcodebuild
xcodebuild -exportArchive \
  -archivePath build/SmartWheelsMobile.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export
```

Create `ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

#### Option C: Using Transporter App

1. Download **Transporter** from Mac App Store
2. Export archive from Xcode as `.ipa` file
3. Open Transporter
4. Drag `.ipa` file to Transporter
5. Click **Deliver**
6. Wait for upload to complete

### Step 6: Submit for Review in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **My Apps** → **SmartWheels Mobile**
3. Go to **App Store** tab
4. Select version (1.0.0)
5. Wait for build to appear (10-30 minutes after upload)
6. Select the build
7. Complete all required information:
   - [ ] Export compliance (if required)
   - [ ] Advertising identifier (if used)
   - [ ] Content rights
8. Click **Submit for Review**
9. App will be in **Waiting for Review** status

### Step 7: Monitor Review Status

- **Waiting for Review**: 1-3 days typically
- **In Review**: Being reviewed
- **Pending Developer Release**: Approved, waiting for release
- **Ready for Sale**: Live in App Store
- **Rejected**: Fix issues and resubmit

---

## Android Deployment

### Step 1: Update Version Information

#### Update app.json
```json
{
  "name": "SmartWheelsMobile",
  "displayName": "SmartWheelsMobile",
  "version": "1.0.0"
}
```

#### Update build.gradle
Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 1        // Increment for each release
        versionName "1.0.0"  // User-facing version
    }
}
```

### Step 2: Create Release Keystore

```bash
cd SmartWheelsMobile/android/app

keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias release-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Important**: 
- Store keystore file securely
- Never commit to git
- Keep password safe
- Back up keystore file

### Step 3: Configure Release Signing

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "YOUR_PASSWORD"
            keyAlias "release-key"
            keyPassword System.getenv("KEY_PASSWORD") ?: "YOUR_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

**Better**: Use environment variables or `keystore.properties` (gitignored):

Create `android/keystore.properties`:
```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=release-key
storeFile=release.keystore
```

Update `android/app/build.gradle`:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
}
```

### Step 4: Build Release APK/AAB

#### Build APK (for testing)
```bash
cd SmartWheelsMobile/android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

#### Build AAB (for Play Store - Recommended)
```bash
cd SmartWheelsMobile/android
./gradlew bundleRelease
```

AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 5: Test Release Build

```bash
# Install on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or test AAB locally (convert to APK)
bundletool build-apks \
  --bundle=app-release.aab \
  --output=app-release.apks \
  --ks=release.keystore \
  --ks-key-alias=release-key
```

### Step 6: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **SmartWheels Mobile** app
3. Go to **Production** (or **Internal testing** / **Closed testing** first)
4. Click **Create new release**
5. Upload **AAB file** (recommended) or APK
6. Fill in **Release name**: `1.0.0`
7. Fill in **Release notes**:
   ```
   Initial release of SmartWheels Mobile
   - Smart Scan feature
   - Tether connectivity
   - Smart Crop functionality
   - Two-factor authentication
   ```
8. Click **Save**
9. Click **Review release**

### Step 7: Complete Store Listing

Ensure all required information is complete:
- [ ] Store listing complete
- [ ] Screenshots uploaded
- [ ] Content rating completed
- [ ] Privacy policy linked
- [ ] Data safety completed

### Step 8: Submit for Review

1. Review all information
2. Click **Start rollout to Production**
3. App will be in **Review** status
4. Wait for review (1-7 days typically)

---

## Post-Deployment

### Monitor Releases

#### iOS
- [ ] Monitor App Store Connect for review status
- [ ] Respond to reviewer questions
- [ ] Check crash reports in App Store Connect
- [ ] Monitor analytics in Firebase/GA4

#### Android
- [ ] Monitor Play Console for review status
- [ ] Check crash reports in Play Console
- [ ] Monitor analytics in Firebase/GA4
- [ ] Review user feedback

### Update Process

#### Version Updates

**iOS**:
1. Update version in Xcode
2. Increment build number
3. Create new archive
4. Upload to App Store Connect
5. Submit update

**Android**:
1. Update `versionCode` and `versionName` in `build.gradle`
2. Build new AAB
3. Upload to Play Console
4. Submit update

### Rollback Plan

#### iOS
- Can't rollback once approved
- Must submit new version to fix issues
- Can pause new downloads if critical issue

#### Android
- Can rollback to previous version in Play Console
- Can pause rollout if issues found
- Can release staged rollout (percentage of users)

---

## Troubleshooting

### iOS Issues

**Issue**: Archive fails
- **Solution**: Clean build folder, check signing configuration

**Issue**: Upload fails
- **Solution**: Check internet connection, verify Apple ID access

**Issue**: Validation fails
- **Solution**: Fix errors shown, ensure all requirements met

**Issue**: Rejected by Apple
- **Solution**: Read rejection reason, fix issues, resubmit

### Android Issues

**Issue**: Build fails
- **Solution**: Check keystore configuration, verify gradle setup

**Issue**: AAB upload fails
- **Solution**: Verify AAB format, check file size limits

**Issue**: Rejected by Google
- **Solution**: Read policy violations, fix issues, resubmit

### General Issues

**Issue**: App crashes after release
- **Solution**: 
  - Check crash reports
  - Release hotfix if critical
  - Monitor analytics

**Issue**: Analytics not working
- **Solution**: 
  - Verify Firebase config files
  - Check network connectivity
  - Review Firebase console

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passed
- [ ] Version numbers updated
- [ ] Build numbers incremented
- [ ] No debug code
- [ ] Analytics configured
- [ ] Assets prepared

### iOS Deployment
- [ ] Archive created
- [ ] Archive validated
- [ ] Uploaded to App Store Connect
- [ ] Build selected in App Store Connect
- [ ] All metadata complete
- [ ] Submitted for review

### Android Deployment
- [ ] Release keystore created
- [ ] Release build created (AAB)
- [ ] Uploaded to Play Console
- [ ] Store listing complete
- [ ] Content rating complete
- [ ] Submitted for review

### Post-Deployment
- [ ] Monitoring setup
- [ ] Crash reporting configured
- [ ] Analytics verified
- [ ] Support channels ready

---

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [React Native Deployment](https://reactnative.dev/docs/signed-apk-android)

---

**Status**: Ready for deployment. Follow steps in order and complete all checkboxes.
