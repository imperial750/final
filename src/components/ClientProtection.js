"use client";

import { useEffect, useState } from "react";
import { AntiBotSystem } from "../lib/antibot";

export default function ClientProtection({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAccess = async () => {
      try {
        // Check localStorage whitelist key first (for testing only)
        const whitelistKey = localStorage.getItem("antibot_whitelist_key");
        if (whitelistKey === "ALLOW_TESTING_ACCESS_2024") {
          console.log(
            "🧪 Testing mode enabled - bypassing all anti-bot checks"
          );
          setIsWhitelisted(true);
          setLoading(false);
          return;
        }

        // Auto-enable testing mode for localhost
        if (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        ) {
          console.log("🏠 Localhost detected - enabling testing mode");
          localStorage.setItem(
            "antibot_whitelist_key",
            "ALLOW_TESTING_ACCESS_2024"
          );
          setIsWhitelisted(true);
          setLoading(false);
          return;
        }

        // Initialize comprehensive anti-bot system
        const antiBot = new AntiBotSystem();
        const isLegitimate = await antiBot.initialize();

        if (!isLegitimate) {
          setIsBlocked(true);
          // Immediate redirect for bots - zero tolerance
          setTimeout(() => {
            window.location.href = "https://www.google.com";
          }, 500);
          return;
        }

        // Additional real-time checks
        await performAdvancedChecks();

        setLoading(false);
      } catch (error) {
        console.error("Protection check failed:", error);
        // On error, block access (zero tolerance)
        setIsBlocked(true);
        setTimeout(() => {
          window.location.href = "https://www.google.com";
        }, 1000);
      }
    };

    // Advanced checks for zero tolerance
    const performAdvancedChecks = async () => {
      // Check for automation tools
      if (
        window.navigator.webdriver ||
        window.callPhantom ||
        window._phantom ||
        window.Buffer ||
        window.emit ||
        window.spawn ||
        window.process ||
        window.require ||
        window.global
      ) {
        setIsBlocked(true);
        window.location.href = "https://www.google.com";
        return;
      }

      // Check user agent more strictly
      const userAgent = navigator.userAgent.toLowerCase();
      const strictBotPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i,
        /php/i,
        /perl/i,
        /ruby/i,
        /go-http/i,
        /postman/i,
        /insomnia/i,
        /httpie/i,
        /axios/i,
        /fetch/i,
        /googlebot/i,
        /bingbot/i,
        /slurp/i,
        /duckduckbot/i,
        /baiduspider/i,
        /yandexbot/i,
        /facebookexternalhit/i,
        /twitterbot/i,
        /linkedinbot/i,
        /whatsapp/i,
        /headlesschrome/i,
        /phantomjs/i,
        /selenium/i,
        /webdriver/i,
        /chrome-lighthouse/i,
        /gtmetrix/i,
        /pingdom/i,
        /uptimerobot/i,
      ];

      // Temporarily disable strict bot patterns for testing
      // if (strictBotPatterns.some((pattern) => pattern.test(userAgent))) {
      //   setIsBlocked(true);
      //   window.location.href = "https://www.google.com";
      //   return;
      // }

      // Check for missing browser features (headless detection) - Made less aggressive
      let suspiciousFeatures = 0;
      if (!navigator.languages || navigator.languages.length === 0)
        suspiciousFeatures++;
      if (!navigator.plugins || navigator.plugins.length === 0)
        suspiciousFeatures++;
      if (!window.chrome) suspiciousFeatures++;
      if (!window.speechSynthesis) suspiciousFeatures++;

      // Only block if ALL features are missing (very lenient)
      if (suspiciousFeatures >= 5) {
        setIsBlocked(true);
        window.location.href = "https://www.google.com";
        return;
      }

      // Temporarily disable screen dimension check
      // if (
      //   (screen.width === 0 && screen.height === 0) ||
      //   (screen.availWidth === 0 && screen.availHeight === 0)
      // ) {
      //   setIsBlocked(true);
      //   window.location.href = "https://www.google.com";
      //   return;
      // }

      // Timing check disabled - was too sensitive and causing false positives
      // const start = performance.now();
      // await new Promise((resolve) => setTimeout(resolve, 1));
      // const end = performance.now();
      // if (end - start < 0.5) {
      //   setIsBlocked(true);
      //   window.location.href = "https://www.google.com";
      //   return;
      // }
    };

    checkAccess();
  }, [isClient]);

  // Don't render anything during SSR
  if (!isClient) {
    return children;
  }

  // Show loading during security checks
  if (loading && !isWhitelisted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying security...</p>
        </div>
      </div>
    );
  }

  // Show blocked message (should rarely be seen due to immediate redirect)
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-700 mb-4">
            Automated access detected. Redirecting...
          </p>
          <div className="animate-spin w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render content with optional testing indicator
  return <>{children}</>;
}
