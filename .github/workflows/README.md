# GitHub Actions Workflows

This directory contains GitHub Actions workflows for building and testing SmartWheelsMobile.

## Available Workflows

### 1. CI (`ci.yml`)
- **Triggers**: Push/PR to main, master, or develop
- **Purpose**: Run linting, tests, and type checking
- **Runs on**: Ubuntu
- **No setup required**: Works out of the box

### 2. iOS Build (`ios-build.yml`)
- **Triggers**: Push/PR to main/master, tags, or manual
- **Purpose**: Build iOS app archive and optionally export IPA
- **Runs on**: macOS (latest)
- **Requirements**:
  - `GoogleService-Info.plist` must be in `ios/SmartWheelsMobile/`
  - Optional: iOS signing secrets for IPA export

### 3. Android Build (`android-build.yml`)
- **Triggers**: Push/PR to main/master, tags, or manual
- **Purpose**: Build Android APK and AAB
- **Runs on**: Ubuntu
- **Requirements**:
  - `google-services.json` must be in `android/app/`
  - Optional: Android keystore secrets for signing

## Setup Instructions

### Basic Setup (No Signing)

1. **Commit Firebase config files**:
   - `ios/SmartWheelsMobile/GoogleService-Info.plist`
   - `android/app/google-services.json`

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Firebase config files and GitHub Actions"
   git push
   ```

3. **Workflows will run automatically** on push/PR

### iOS Signing Setup (Optional)

To export signed IPA files, add these GitHub Secrets:

1. Go to: Repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `IOS_SIGNING_CERTIFICATE_BASE64`: Base64-encoded .p12 certificate
   - `IOS_TEAM_ID`: Your Apple Developer Team ID
   - `IOS_PROVISIONING_PROFILE_NAME`: Name of provisioning profile

**To get certificate**:
```bash
# Export certificate to base64
openssl base64 -in certificate.p12 -out certificate_base64.txt
```

### Android Signing Setup (Optional)

To sign APK/AAB files, add these GitHub Secrets:

1. Go to: Repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `ANDROID_KEYSTORE_BASE64`: Base64-encoded keystore file
   - `ANDROID_KEYSTORE_PASSWORD`: Keystore password
   - `ANDROID_KEY_PASSWORD`: Key password

**To create base64 keystore**:
```bash
# Create keystore (if not exists)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias release-key \
  -keyalg RSA -keysize 2048 -validity 10000

# Convert to base64
base64 -i release.keystore -o keystore_base64.txt
```

## Manual Trigger

You can manually trigger builds:

1. Go to: Repository → Actions
2. Select workflow (iOS Build or Android Build)
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Artifacts

After builds complete:

1. Go to: Repository → Actions
2. Click on the workflow run
3. Scroll to "Artifacts" section
4. Download:
   - **iOS**: `ios-archive` (Xcode archive) or `ios-ipa` (if signed)
   - **Android**: `android-release-apk`, `android-release-aab`, or `android-signed-apk` (if signed)

## Troubleshooting

### iOS Build Fails

**Issue**: "GoogleService-Info.plist not found"
- **Solution**: Ensure file is committed to `ios/SmartWheelsMobile/GoogleService-Info.plist`

**Issue**: Pod install fails
- **Solution**: Check Podfile and ensure all dependencies are valid

**Issue**: Archive fails
- **Solution**: Check Xcode project configuration

### Android Build Fails

**Issue**: "google-services.json not found"
- **Solution**: Ensure file is committed to `android/app/google-services.json`

**Issue**: Gradle build fails
- **Solution**: Check `android/build.gradle` and `android/app/build.gradle`

**Issue**: Signing fails
- **Solution**: Verify keystore secrets are correct and base64 encoded

## Security Notes

- ⚠️ **Never commit** keystore files or certificates to git
- ✅ **Always use** GitHub Secrets for sensitive data
- ✅ Keystore files are in `.gitignore`

## Next Steps

1. ✅ Workflows are ready to use
2. ⏳ Commit Firebase config files
3. ⏳ Push to GitHub
4. ⏳ Workflows will run automatically
5. ⏳ Download artifacts from Actions tab

For more details, see:
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `FIREBASE_GA4_SETUP_COMPLETE.md` - Firebase setup
