// Server-side Anti-Bot Protection for API Routes
// Zero tolerance for automated requests

export class ServerAntiBotSystem {
  constructor() {
    this.bannedUserAgents = [
      // Search Engine Bots
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,

      // Social Media Crawlers
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,

      // Automation Tools
      /selenium/i,
      /webdriver/i,
      /puppeteer/i,
      /playwright/i,
      /headlesschrome/i,
      /phantomjs/i,

      // HTTP Clients
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i,
      /perl/i,
      /ruby/i,
      /go-http/i,
      /axios/i,
      /fetch/i,
      /httpie/i,
      /postman/i,
      /insomnia/i,

      // Monitoring Services
      /pingdom/i,
      /uptimerobot/i,
      /gtmetrix/i,
      /lighthouse/i,
      /pagespeed/i,

      // Generic Bot Patterns
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /scanner/i,
      /checker/i,
    ];

    this.bannedIPs = [
      // Common bot IP ranges (add more as needed)
      "66.249.", // Google
      "40.77.", // Bing
      "157.55.", // Bing
      "207.46.", // Bing
      "199.30.", // Facebook
      "173.252.", // Facebook
      "69.63.", // Facebook
    ];

    this.suspiciousHeaders = [
      "x-forwarded-for",
      "x-real-ip",
      "x-cluster-client-ip",
      "cf-connecting-ip",
    ];
  }

  // Main validation function for API routes
  validateRequest(request) {
    const userAgent = request.headers.get("user-agent") || "";
    const ip = this.getClientIP(request);
    const referer = request.headers.get("referer") || "";

    // Check user agent
    if (this.isBot(userAgent)) {
      return {
        isBot: true,
        reason: "Bot user agent detected",
        action: "block",
      };
    }

    // Check IP address
    if (this.isBannedIP(ip)) {
      return {
        isBot: true,
        reason: "Banned IP address",
        action: "block",
      };
    }

    // Check for missing required headers
    if (this.hasSuspiciousHeaders(request)) {
      return {
        isBot: true,
        reason: "Suspicious request headers",
        action: "block",
      };
    }

    // Check referer (should come from same domain)
    if (this.hasInvalidReferer(referer, request)) {
      return {
        isBot: true,
        reason: "Invalid referer",
        action: "block",
      };
    }

    // Check for automation indicators in headers
    if (this.hasAutomationHeaders(request)) {
      return {
        isBot: true,
        reason: "Automation headers detected",
        action: "block",
      };
    }

    return {
      isBot: false,
      reason: "Legitimate request",
      action: "allow",
    };
  }

  // Extract client IP from request
  getClientIP(request) {
    // Try various headers for IP detection
    const headers = [
      "cf-connecting-ip", // Cloudflare
      "x-forwarded-for",
      "x-real-ip",
      "x-cluster-client-ip",
      "x-forwarded",
      "forwarded-for",
      "forwarded",
    ];

    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        // Take first IP if comma-separated
        return value.split(",")[0].trim();
      }
    }

    return "unknown";
  }

  // Check if user agent indicates a bot
  isBot(userAgent) {
    if (!userAgent || userAgent.length < 10) {
      return true; // Too short or missing
    }

    // Allow official Telegram webhooks
    if (
      userAgent.toLowerCase().includes("telegram") ||
      userAgent.toLowerCase().includes("tgbotapi")
    ) {
      return false; // Allow Telegram
    }

    // Check against banned patterns
    return this.bannedUserAgents.some((pattern) => pattern.test(userAgent));
  }

  // Check if IP is banned
  isBannedIP(ip) {
    if (!ip || ip === "unknown") {
      return false; // Don't block unknown IPs
    }

    return this.bannedIPs.some((bannedIP) => ip.startsWith(bannedIP));
  }

  // Check for suspicious headers
  hasSuspiciousHeaders(request) {
    // Check for automation tool headers
    const automationHeaders = [
      "x-selenium",
      "x-webdriver",
      "x-puppeteer",
      "x-playwright",
      "x-automation",
    ];

    return automationHeaders.some((header) => request.headers.has(header));
  }

  // Check referer validity
  hasInvalidReferer(referer, request) {
    // Allow requests without referer for legitimate browser API calls
    if (!referer) {
      return false; // Don't block requests without referer
    }

    try {
      const refererUrl = new URL(referer);
      const requestUrl = new URL(request.url);

      // Must be from same domain
      return refererUrl.hostname !== requestUrl.hostname;
    } catch (error) {
      return false; // Don't block requests with invalid referer URLs
    }
  }

  // Check for automation-specific headers
  hasAutomationHeaders(request) {
    const headers = request.headers;

    // Check for common automation indicators (more specific)
    if (
      headers.get("sec-ch-ua-mobile") === "?0" &&
      headers.get("sec-ch-ua-platform") === '"Linux"' &&
      !headers.get("accept-language") // Missing language header is suspicious
    ) {
      return true; // Common headless Chrome signature
    }

    // Check for missing common browser headers (less strict)
    const requiredHeaders = ["accept"]; // Only require accept header

    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.has(header)
    );
    return missingHeaders.length > 0; // Block only if accept header is missing
  }

  // Generate error response for blocked requests
  generateBlockResponse() {
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        code: "SERVICE_UNAVAILABLE",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  // Log blocked request (for monitoring)
  logBlockedRequest(request, reason) {
    const logData = {
      timestamp: new Date().toISOString(),
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      url: request.url,
      method: request.method,
      reason: reason,
      headers: Object.fromEntries(request.headers.entries()),
    };

    console.log("🚫 BLOCKED REQUEST:", JSON.stringify(logData, null, 2));
  }
}

// Middleware function for API routes
export function withServerAntiBotProtection(handler) {
  return async (request) => {
    const antiBot = new ServerAntiBotSystem();
    const validation = antiBot.validateRequest(request);

    if (validation.isBot) {
      antiBot.logBlockedRequest(request, validation.reason);
      return antiBot.generateBlockResponse();
    }

    // Call the original handler if validation passes
    return handler(request);
  };
}

// Quick validation function for simple checks
export function isRequestFromBot(request) {
  const antiBot = new ServerAntiBotSystem();
  const validation = antiBot.validateRequest(request);
  return validation.isBot;
}
