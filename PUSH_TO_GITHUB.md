# Push to GitHub - Instructions

## Option 1: Create New Repository on GitHub (Recommended)

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `SmartWheelersMobile` (or your preferred name)
3. Description: "SmartWheelers Mobile App - React Native"
4. Visibility: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
cd SmartWheelsMobile

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/SmartWheelersMobile.git

# Push to GitHub
git push -u origin main
```

**If you get authentication errors**, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

---

## Option 2: Add to Existing Main Repository

If you want SmartWheelsMobile as part of the main SmartWheelers repo:

### Option 2A: As a Subdirectory (Remove separate git repo)

```bash
cd SmartWheelsMobile

# Remove the .git directory to make it part of parent repo
Remove-Item -Recurse -Force .git

# Go to parent directory
cd ..

# Add SmartWheelsMobile to main repo
git add SmartWheelsMobile/
git commit -m "Add SmartWheelsMobile app"
git push
```

### Option 2B: As a Git Submodule

```bash
cd ..  # Go to SmartWheelsMobile parent directory

# First, push SmartWheelsMobile to its own repo (Option 1)
# Then add as submodule:
git submodule add https://github.com/YOUR_USERNAME/SmartWheelersMobile.git SmartWheelsMobile
git commit -m "Add SmartWheelsMobile as submodule"
git push
```

---

## Option 3: Use GitHub CLI (If Installed)

```bash
# Create repo and push in one command
gh repo create SmartWheelersMobile --public --source=. --remote=origin --push
```

---

## Quick Commands After Repository Created

Once you have the repository URL:

```bash
cd SmartWheelsMobile

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/SmartWheelersMobile.git

# Push
git push -u origin main
```

---

## Authentication

### Using Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

### Using SSH (Recommended)

1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
3. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/SmartWheelersMobile.git
   git push -u origin main
   ```

---

## After Successful Push

1. ✅ Go to your GitHub repository
2. ✅ Click **"Actions"** tab
3. ✅ Watch workflows run automatically:
   - CI (linting and tests)
   - iOS Build
   - Android Build
4. ✅ Download build artifacts from Actions tab

---

**Need help?** Choose Option 1 (create new repo) - it's the simplest!
