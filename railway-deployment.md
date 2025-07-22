# 🚂 Deploy to Railway - Complete Guide

## Step 1: Prepare Your Project

1. **Create a start script in package.json** (already done ✅)
2. **Add a Procfile** (Railway will detect Node.js automatically)

## Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Telegram bot ready for deployment"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy on Railway

1. **Go to Railway.app**
   - Visit: https://railway.app
   - Sign up with GitHub account (free)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your telegram bot repository

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these variables:
     ```
     BOT_TOKEN=8114313056:AAEFMfh-wW7xxvLMBKNb7bkooRG8NZ43mzY
     ADMIN_ID=1792802789
     NODE_ENV=production
     ```

4. **Deploy**
   - Railway will automatically detect it's a Node.js project
   - It will run `npm install` and `npm start`
   - Your bot will be live in 2-3 minutes!

## Step 4: Monitor Your Bot
- Check logs in Railway dashboard
- Bot will restart automatically if it crashes
- Uses your $5/month free credit

---

## 🎯 Quick Deploy Commands:

```bash
# 1. Navigate to project
cd telegram-bot-project

# 2. Initialize git and push to GitHub
git init
git add .
git commit -m "Deploy telegram bot"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 3. Then deploy on Railway.app using the web interface
``` 