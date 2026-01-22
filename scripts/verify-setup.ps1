# SmartWheelsMobile Setup Verification Script
# Run this script to verify your setup is complete

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SmartWheelsMobile Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Firebase config files
Write-Host "Checking Firebase Configuration Files..." -ForegroundColor Yellow
Write-Host ""

# iOS Config
$iosConfig = "ios/SmartWheelsMobile/GoogleService-Info.plist"
if (Test-Path $iosConfig) {
    Write-Host "  ✅ iOS: GoogleService-Info.plist found" -ForegroundColor Green
} else {
    Write-Host "  ❌ iOS: GoogleService-Info.plist NOT found" -ForegroundColor Red
    Write-Host "     Expected at: $iosConfig" -ForegroundColor Gray
    $allGood = $false
}

# Android Config
$androidConfig = "android/app/google-services.json"
if (Test-Path $androidConfig) {
    Write-Host "  ✅ Android: google-services.json found" -ForegroundColor Green
} else {
    Write-Host "  ❌ Android: google-services.json NOT found" -ForegroundColor Red
    Write-Host "     Expected at: $androidConfig" -ForegroundColor Gray
    $allGood = $false
}

Write-Host ""

# Check GitHub Actions
Write-Host "Checking GitHub Actions Workflows..." -ForegroundColor Yellow
Write-Host ""

$workflows = @(
    ".github/workflows/ci.yml",
    ".github/workflows/ios-build.yml",
    ".github/workflows/android-build.yml"
)

foreach ($workflow in $workflows) {
    if (Test-Path $workflow) {
        $name = Split-Path $workflow -Leaf
        Write-Host "  ✅ $name found" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $workflow NOT found" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Check package.json
Write-Host "Checking Dependencies..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "package.json") {
    Write-Host "  ✅ package.json found" -ForegroundColor Green
    
    # Check if node_modules exists
    if (Test-Path "node_modules") {
        Write-Host "  ✅ node_modules found (dependencies installed)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  node_modules NOT found" -ForegroundColor Yellow
        Write-Host "     Run: npm install" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ package.json NOT found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check key source files
Write-Host "Checking Key Source Files..." -ForegroundColor Yellow
Write-Host ""

$keyFiles = @(
    "App.tsx",
    "src/app/AppRoot.tsx",
    "src/services/analytics/analytics.ts",
    "src/services/api/apiClient.ts"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file found" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT found" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ Setup Verification: PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Commit and push to GitHub:" -ForegroundColor White
    Write-Host "     git add ." -ForegroundColor Gray
    Write-Host "     git commit -m 'Complete mobile app setup'" -ForegroundColor Gray
    Write-Host "     git push" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Check GitHub Actions tab for automated builds" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. Test Android locally:" -ForegroundColor White
    Write-Host "     npm run android" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Setup Verification: ISSUES FOUND" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor White
    Write-Host ""
    Write-Host "See FIREBASE_GA4_SETUP_COMPLETE.md for Firebase setup help." -ForegroundColor Gray
}
Write-Host "========================================" -ForegroundColor Cyan
