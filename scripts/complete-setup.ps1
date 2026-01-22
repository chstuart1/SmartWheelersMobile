# SmartWheelsMobile Complete Setup Script
# This script helps you complete the final setup steps

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SmartWheelsMobile Complete Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify setup
Write-Host "Step 1: Verifying setup..." -ForegroundColor Yellow
& "$PSScriptRoot/verify-setup.ps1"

Write-Host ""
Write-Host "Press any key to continue with git operations..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 2: Check git status
Write-Host ""
Write-Host "Step 2: Checking git status..." -ForegroundColor Yellow
Write-Host ""

try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Files ready to commit:" -ForegroundColor Green
        Write-Host $gitStatus -ForegroundColor Gray
        Write-Host ""
        
        $response = Read-Host "Do you want to commit and push these changes? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host ""
            Write-Host "Committing changes..." -ForegroundColor Yellow
            git add .
            
            $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
            if ([string]::IsNullOrWhiteSpace($commitMessage)) {
                $commitMessage = "Complete mobile app setup: Add Firebase config, GitHub Actions, and documentation"
            }
            
            git commit -m $commitMessage
            
            Write-Host ""
            Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
            git push
            
            Write-Host ""
            Write-Host "✅ Changes pushed to GitHub!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next Steps:" -ForegroundColor Yellow
            Write-Host "  1. Go to your GitHub repository" -ForegroundColor White
            Write-Host "  2. Click the 'Actions' tab" -ForegroundColor White
            Write-Host "  3. Watch your workflows run automatically!" -ForegroundColor White
        } else {
            Write-Host "Skipped commit. You can commit manually later." -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ No uncommitted changes. Everything is up to date!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Git operations failed. Make sure you're in a git repository." -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
