# Testing Guide - SmartWheelsMobile

Comprehensive testing guide for SmartWheelsMobile app before production deployment.

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Device Testing](#device-testing)
3. [Feature Testing](#feature-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)
6. [Test Checklist](#test-checklist)

---

## Pre-Testing Setup

### Prerequisites

- [ ] Firebase config files installed (`GoogleService-Info.plist`, `google-services.json`)
- [ ] Dependencies installed (`npm install`, `pod install`)
- [ ] Backend API accessible
- [ ] Test accounts created
- [ ] Physical devices available (iOS and Android)

### Environment Setup

```bash
# Install dependencies
cd SmartWheelsMobile
npm install

# iOS
cd ios
pod install
cd ..

# Verify build
npm run ios    # iOS Simulator
npm run android # Android Emulator
```

---

## Device Testing

### iOS Testing

#### Required Devices
- [ ] iPhone (latest iOS version)
- [ ] iPad (if supporting tablet)
- [ ] iOS Simulator (for quick tests)

#### Test on Physical Device

```bash
# Connect iPhone via USB
# Trust computer on iPhone
# Run:
npm run ios -- --device "Your iPhone Name"
```

#### iOS Test Scenarios

1. **Installation**
   - [ ] App installs successfully
   - [ ] App launches without crashes
   - [ ] Permissions requested correctly (Camera, Photos)

2. **Basic Functionality**
   - [ ] App opens to login screen
   - [ ] Navigation works smoothly
   - [ ] No memory leaks during extended use

3. **Device-Specific**
   - [ ] Works on different screen sizes
   - [ ] Handles orientation changes
   - [ ] Respects safe areas (notch, home indicator)

### Android Testing

#### Required Devices
- [ ] Android phone (latest Android version)
- [ ] Android tablet (if supporting tablet)
- [ ] Android Emulator (for quick tests)

#### Test on Physical Device

```bash
# Enable USB debugging on Android device
# Connect via USB
# Run:
npm run android
```

#### Android Test Scenarios

1. **Installation**
   - [ ] APK installs successfully
   - [ ] App launches without crashes
   - [ ] Permissions requested correctly

2. **Basic Functionality**
   - [ ] App opens to login screen
   - [ ] Navigation works smoothly
   - [ ] Back button works correctly

3. **Device-Specific**
   - [ ] Works on different screen sizes
   - [ ] Handles orientation changes
   - [ ] Works with different Android versions (API 24+)

---

## Feature Testing

### Authentication Testing

#### Login Flow
- [ ] **Valid Credentials**
  - Enter valid email/password
  - Verify successful login
  - Verify user data loaded
  - Verify token stored

- [ ] **Invalid Credentials**
  - Enter invalid email/password
  - Verify error message displayed
  - Verify no token stored

- [ ] **2FA Flow**
  - Login with 2FA-enabled account
  - Verify 2FA screen appears
  - Enter valid 2FA code
  - Verify successful login
  - Enter invalid 2FA code
  - Verify error message

- [ ] **reCAPTCHA (Production)**
  - Verify reCAPTCHA token generated
  - Verify login works with token
  - Test in production build only

- [ ] **Session Persistence**
  - Login successfully
  - Close app completely
  - Reopen app
  - Verify still logged in

#### Logout Flow
- [ ] Click sign out
- [ ] Verify token cleared
- [ ] Verify user data cleared
- [ ] Verify redirected to login screen

### Tether Feature Testing

#### Connection Management
- [ ] **Device Registration**
  - Verify device ID generated
  - Verify device type detected correctly
  - Verify device registered with backend

- [ ] **Initiate Connection**
  - Open web app on PC
  - Open mobile app
  - Initiate connection from mobile
  - Verify connection request sent
  - Verify connection established

- [ ] **Accept Connection**
  - Initiate from PC
  - Verify request received on mobile
  - Accept connection
  - Verify connection established

- [ ] **Reject Connection**
  - Initiate from PC
  - Reject on mobile
  - Verify connection not established

- [ ] **Disconnect**
  - Establish connection
  - Disconnect from mobile
  - Verify connection terminated

#### Photo Upload
- [ ] **Upload Front Image**
  - Connect to PC
  - Capture front image
  - Upload via tether
  - Verify upload successful on PC

- [ ] **Upload Back Image**
  - Capture back image
  - Upload via tether
  - Verify upload successful on PC

- [ ] **Form Session Integration**
  - Start form session on PC
  - Connect mobile
  - Upload images
  - Verify images appear in form

### Smart Scan Testing

#### Image Capture
- [ ] **Front Image**
  - Tap "Capture front"
  - Verify camera opens
  - Capture image
  - Verify image preview shown
  - Verify quick crop processed

- [ ] **Back Image**
  - Tap "Capture back"
  - Verify camera opens
  - Capture image
  - Verify image preview shown
  - Verify quick crop processed

#### Processing
- [ ] **Full Processing**
  - Capture both images
  - Tap "Process Scan"
  - Verify processing indicator shown
  - Verify results displayed
  - Verify match results shown
  - Verify confidence scores shown

- [ ] **Error Handling**
  - Process with invalid images
  - Verify error message displayed
  - Verify app doesn't crash

### Smart Crop Testing

#### Image Capture
- [ ] Capture front image
- [ ] Capture back image
- [ ] Verify previews shown
- [ ] Verify quick crop processed

#### Upload to Tether
- [ ] Enter form session ID
- [ ] Capture images
- [ ] Upload to tether
- [ ] Verify upload successful
- [ ] Verify images appear on PC

### Analytics Testing

- [ ] **Screen Tracking**
  - Navigate through all screens
  - Verify screen views in Firebase DebugView
  - Verify screen views in GA4 Realtime

- [ ] **Event Tracking**
  - Perform key actions
  - Verify events in Firebase DebugView
  - Verify custom events tracked

- [ ] **User Identification**
  - Login
  - Verify user ID set in analytics
  - Verify user properties set

---

## Performance Testing

### App Launch
- [ ] **Cold Start**
  - Force close app
  - Launch app
  - Measure time to login screen (< 3 seconds)

- [ ] **Warm Start**
  - Background app
  - Resume app
  - Verify quick resume

### Network Performance
- [ ] **API Response Times**
  - Test all API endpoints
  - Verify responses < 2 seconds (normal)
  - Verify timeout handling works

- [ ] **Image Upload**
  - Upload large images
  - Verify progress indication
  - Verify upload completes

- [ ] **Offline Handling**
  - Disable network
  - Attempt API calls
  - Verify error handling
  - Re-enable network
  - Verify retry works

### Memory & Battery
- [ ] **Memory Usage**
  - Use app for extended period
  - Monitor memory usage
  - Verify no memory leaks

- [ ] **Battery Usage**
  - Use app normally
  - Verify reasonable battery usage
  - Verify no excessive background activity

---

## Security Testing

### Authentication Security
- [ ] **Token Storage**
  - Verify tokens stored securely
  - Verify tokens not logged
  - Verify tokens cleared on logout

- [ ] **API Security**
  - Verify HTTPS used (production)
  - Verify Bearer token authentication
  - Verify unauthorized requests rejected

### Data Security
- [ ] **Sensitive Data**
  - Verify passwords not stored
  - Verify sensitive data not logged
  - Verify user data encrypted in transit

### Network Security
- [ ] **Certificate Pinning** (if implemented)
  - Verify certificate validation
  - Verify connection security

---

## Test Checklist

### Pre-Production Checklist

#### Functionality
- [ ] All features work on iOS
- [ ] All features work on Android
- [ ] No crashes during normal use
- [ ] Error handling works correctly
- [ ] Offline handling works

#### Performance
- [ ] App launches quickly
- [ ] Navigation is smooth
- [ ] Images load efficiently
- [ ] No memory leaks
- [ ] Battery usage acceptable

#### Security
- [ ] Authentication secure
- [ ] Data encrypted in transit
- [ ] No sensitive data exposed
- [ ] Permissions requested correctly

#### Analytics
- [ ] Events tracked correctly
- [ ] Screen views tracked
- [ ] User identification works
- [ ] Data appears in GA4

#### UI/UX
- [ ] UI consistent across screens
- [ ] Text readable on all devices
- [ ] Buttons accessible
- [ ] Error messages clear
- [ ] Loading states shown

### Device Coverage

#### iOS
- [ ] iPhone 12/13/14 (iOS 15+)
- [ ] iPhone 15 (iOS 17+)
- [ ] iPad (if supported)
- [ ] Different screen sizes

#### Android
- [ ] Android 8.0+ (API 24+)
- [ ] Android 12+ (API 31+)
- [ ] Android 14+ (API 34+)
- [ ] Different screen sizes

---

## Automated Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- apiClient.test.ts
```

### Test Coverage Goals

- [ ] API client: > 80%
- [ ] Auth context: > 80%
- [ ] Critical flows: > 70%

---

## Bug Reporting Template

When reporting bugs, include:

```
**Device**: iPhone 14 Pro / Samsung Galaxy S21
**OS Version**: iOS 17.1 / Android 13
**App Version**: 1.0.0
**Steps to Reproduce**:
1. 
2. 
3. 
**Expected Behavior**:
**Actual Behavior**:
**Screenshots**: (if applicable)
**Logs**: (if applicable)
```

---

## Sign-Off

After completing all tests:

- [ ] All critical bugs fixed
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Analytics working
- [ ] Ready for app store submission

**Tested By**: _________________  
**Date**: _________________  
**Status**: ✅ Ready for Production / ⚠️ Issues Found

---

## Next Steps

After testing is complete:

1. ✅ Fix any critical bugs
2. ✅ Prepare app store assets (see `APP_STORE_PREPARATION.md`)
3. ✅ Deploy to app stores (see `DEPLOYMENT_GUIDE.md`)
