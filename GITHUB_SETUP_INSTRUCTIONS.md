# 🚣 Complete Setup Instructions: Rowing Tracker on iPhone via GitHub Pages

This guide will walk you through every step to get your rowing tracker working on your iPhone using GitHub Pages.

---

## 📋 PREREQUISITES

Before starting, make sure you have:
- A GitHub account (free - sign up at github.com if needed)
- Your `rowing-tracker-iphone` folder ready
- About 30-45 minutes for the initial setup

---

## PART 1: CREATE GITHUB REPOSITORY

### Step 1: Sign in to GitHub
1. Go to **github.com** in your web browser
2. Sign in to your account (or create one if needed)

### Step 2: Create a New Repository
1. Click the **"+"** icon in the top-right corner
2. Select **"New repository"**
3. Fill in the repository details:
   - **Repository name**: `rowing-tracker` (or any name you prefer)
   - **Description**: "Personal rowing journey tracker" (optional)
   - **Visibility**: Select **"Private"** (so only you can see it)
   - **DO NOT** check "Add a README file"
   - **DO NOT** add .gitignore or license
4. Click **"Create repository"**

### Step 3: Note Your Repository URL
- After creating, GitHub will show you a page with setup instructions
- **Copy and save this URL** - it will look like:
  - `https://github.com/YOUR-USERNAME/rowing-tracker.git`
  - You'll need this later!

---

## PART 2: UPLOAD FILES TO GITHUB

You have two options. Choose the one that's easier for you:

### OPTION A: Using GitHub Web Interface (Easiest - No software needed)

#### Step 1: Navigate to Your Repository
1. Go to your repository page on GitHub
2. You should see a page that says "Quick setup" or shows your repository is empty

#### Step 2: Upload Files
1. Click the **"uploading an existing file"** link (or the **"Add file"** button → **"Upload files"**)
2. In the upload area, you can either:
   - **Drag and drop** all files from your `rowing-tracker-iphone` folder, OR
   - Click **"choose your files"** and select all files

#### Step 3: Select All Files
You need to upload these files:
- `index.html`
- `app.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`
- `ICON_GENERATOR.html` (optional, for generating icons)

**Important**: Upload files directly to the root of the repository (not in a subfolder)

#### Step 4: Create Icons Folder
1. After uploading the main files, click **"Add file"** → **"Create new file"**
2. Type: `icons/icon-192x192.png` (this creates the folder)
3. Click **"Cancel"** (we'll add icons later)
4. The `icons` folder is now created

#### Step 5: Generate Icons
1. Open `ICON_GENERATOR.html` in your browser (double-click it)
2. Click **"Generate All Icons"** button
3. This will download 8 icon files to your Downloads folder
4. Go back to GitHub
5. Click **"Add file"** → **"Upload files"**
6. Upload all 8 icon files (icon-72x72.png through icon-512x512.png) to the `icons` folder
7. Click **"Commit changes"**

#### Step 6: Commit Your Files
1. Scroll down to the bottom of the page
2. In the "Commit changes" section:
   - **Commit message**: Type "Initial commit - Rowing Tracker PWA"
   - Click **"Commit changes"** (green button)

---

### OPTION B: Using GitHub Desktop (If you prefer a desktop app)

#### Step 1: Install GitHub Desktop
1. Go to **desktop.github.com**
2. Download and install GitHub Desktop for Windows
3. Sign in with your GitHub account

#### Step 2: Clone Your Repository
1. In GitHub Desktop, click **"File"** → **"Clone repository"**
2. Go to the **"GitHub.com"** tab
3. Find your `rowing-tracker` repository
4. Click **"Clone"**
5. Choose where to save it on your computer

#### Step 3: Copy Files
1. Open the cloned repository folder on your computer
2. Copy ALL files from your `rowing-tracker-iphone` folder into this repository folder
3. Make sure to include:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `manifest.json`
   - `service-worker.js`
   - Create an `icons` folder and add all icon files

#### Step 4: Generate Icons (if needed)
1. Open `ICON_GENERATOR.html` in your browser
2. Click **"Generate All Icons"**
3. Move the downloaded icons to the `icons` folder in your repository

#### Step 5: Commit and Push
1. In GitHub Desktop, you'll see all your files listed
2. At the bottom, type a commit message: "Initial commit - Rowing Tracker PWA"
3. Click **"Commit to main"**
4. Click **"Push origin"** (to upload to GitHub)

---

## PART 3: ENABLE GITHUB PAGES

### Step 1: Go to Repository Settings
1. On your GitHub repository page, click the **"Settings"** tab (top menu)
2. Scroll down to **"Pages"** in the left sidebar (under "Code and automation")

### Step 2: Configure GitHub Pages
1. Under **"Source"**, click the dropdown
2. Select **"Deploy from a branch"**
3. Under **"Branch"**:
   - Select **"main"** (or "master" if that's what you have)
   - Select **"/ (root)"** for the folder
4. Click **"Save"**

### Step 3: Wait for Deployment
1. GitHub will show: "Your site is ready to be published at..."
2. **Wait 1-2 minutes** for GitHub to build your site
3. Refresh the page - you should see a green checkmark and your site URL
4. Your URL will be: `https://YOUR-USERNAME.github.io/rowing-tracker/`
   - **Save this URL!** You'll need it for your iPhone

---

## PART 4: SET UP ON YOUR IPHONE

### Step 1: Open the App in Safari
1. On your iPhone, open the **Safari** browser (not Chrome)
2. Go to your GitHub Pages URL: `https://YOUR-USERNAME.github.io/rowing-tracker/`
3. Wait for the page to load completely

### Step 2: Add to Home Screen
1. Tap the **Share button** (square with arrow pointing up) at the bottom of Safari
2. Scroll down in the share menu
3. Tap **"Add to Home Screen"**
4. You can customize the name (e.g., "Rowing Tracker")
5. Tap **"Add"** in the top-right corner

### Step 3: Test the App
1. You should now see a new icon on your home screen
2. Tap it to open the app
3. It should open like a native app (no Safari browser bars)
4. Try logging a test session to make sure everything works!

---

## PART 5: UPDATING THE APP (When you make changes)

### If Using GitHub Web Interface:
1. Go to your repository on GitHub
2. Click on the file you want to update (e.g., `app.js`)
3. Click the **pencil icon** (✏️) to edit
4. Make your changes
5. Scroll down and click **"Commit changes"**
6. Wait 1-2 minutes for GitHub Pages to update
7. On your iPhone, close and reopen the app (or refresh)

### If Using GitHub Desktop:
1. Make changes to files in your local repository folder
2. In GitHub Desktop, you'll see the changes listed
3. Type a commit message
4. Click **"Commit to main"**
5. Click **"Push origin"**
6. Wait 1-2 minutes for GitHub Pages to update
7. On your iPhone, close and reopen the app

---

## 🎯 TROUBLESHOOTING

### Problem: Icons don't show up
**Solution**: Make sure all icon files are in the `icons/` folder and have the correct names (icon-192x192.png, etc.)

### Problem: Service worker not working
**Solution**: 
- Make sure you're accessing via HTTPS (GitHub Pages provides this automatically)
- Clear your browser cache on iPhone: Settings → Safari → Clear History and Website Data

### Problem: App doesn't work offline
**Solution**: 
- Maps require internet connection (this is normal)
- The app itself should work offline for logging sessions
- Make sure service worker is registered (check browser console)

### Problem: Changes not showing up
**Solution**:
- GitHub Pages can take 1-2 minutes to update
- On iPhone, force-close the app and reopen it
- Or clear Safari cache

### Problem: Can't find "Add to Home Screen"
**Solution**:
- Make sure you're using Safari (not Chrome or other browsers)
- The option appears in the Share menu (square with arrow)
- If it doesn't appear, try scrolling down in the share menu

---

## ✅ CHECKLIST

Before you're done, verify:
- [ ] All files uploaded to GitHub
- [ ] Icons folder created with all 8 icon files
- [ ] GitHub Pages enabled and showing your URL
- [ ] App opens correctly in browser
- [ ] App added to iPhone home screen
- [ ] App works when opened from home screen
- [ ] Can log a test session successfully

---

## 🎉 YOU'RE DONE!

Your rowing tracker is now:
- ✅ Accessible from anywhere (via GitHub Pages URL)
- ✅ Installable on your iPhone home screen
- ✅ Works offline (except maps, which need internet)
- ✅ Private (if you set repository to private)
- ✅ Easy to update (just push changes to GitHub)

**Your app URL**: `https://YOUR-USERNAME.github.io/rowing-tracker/`

Enjoy tracking your rowing journey! 🚣‍♂️💪

