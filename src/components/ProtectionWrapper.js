"use client";

import { useEffect, useState } from "react";
import { useAntiBot, useAdvancedProtection } from "@/lib/antibot";

export default function ProtectionWrapper({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  // Always call hooks - React requirement
  const { isProtected, isBot, loading } = useAntiBot();
  const protectionActive = useAdvancedProtection();

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for IP whitelist
  useEffect(() => {
    if (isClient) {
      const checkWhitelist = async () => {
        try {
          // Check if user has whitelisted themselves
          const whitelistKey = localStorage.getItem("antibot_whitelist_key");
          if (whitelistKey === "ALLOW_TESTING_ACCESS_2024") {
            setIsWhitelisted(true);
            setShowContent(true);
            return;
          }

          // Get user IP and check against whitelist
          const response = await fetch("https://api.ipify.org?format=json");
          const data = await response.json();
          const userIP = data.ip;

          // Add your IP here for testing
          const testingIPs = [
            "127.0.0.1",
            "::1",
            "localhost",
            // Add your actual IP here when testing
          ];

          if (testingIPs.includes(userIP)) {
            setIsWhitelisted(true);
            setShowContent(true);
            return;
          }
        } catch (error) {
          console.error("Whitelist check failed:", error);
        }
      };

      checkWhitelist();
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    if (isWhitelisted) {
      setShowContent(true);
      return;
    }

    if (!loading) {
      // Temporarily disable bot redirect for testing
      // if (isBot && !isWhitelisted) {
      //   // Redirect bots away
      //   window.location.href = "https://www.google.com";
      //   return;
      // }

      if (isProtected || isWhitelisted) {
        // Add a small delay to ensure all protections are active
        setTimeout(() => {
          setShowContent(true);
        }, 500);
      }
    }
  }, [isClient, loading, isBot, isProtected, isWhitelisted]);

  // Show loading screen while protection is initializing (only on client)
  if (!isClient || (isClient && !isWhitelisted && (loading || !showContent))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d71f27] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          {isClient && (
            <div className="mt-4 text-xs text-gray-500">
              <p>For testing, open browser console and run:</p>
              <code className="bg-gray-100 px-2 py-1 rounded">
                localStorage.setItem(&apos;antibot_whitelist_key&apos;,
                &apos;ALLOW_TESTING_ACCESS_2024&apos;)
              </code>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show access denied for detected bots (but not whitelisted users)
  if (isClient && isBot && !isWhitelisted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-700">
            Your request has been blocked due to suspicious activity.
          </p>
          <div className="mt-4 text-xs text-gray-500">
            <p>For testing, open browser console and run:</p>
            <code className="bg-gray-100 px-2 py-1 rounded">
              localStorage.setItem(&apos;antibot_whitelist_key&apos;,
              &apos;ALLOW_TESTING_ACCESS_2024&apos;)
            </code>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content
  return (
    <div
      style={{
        userSelect: isWhitelisted ? "auto" : "none",
        WebkitUserSelect: isWhitelisted ? "auto" : "none",
        MozUserSelect: isWhitelisted ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
