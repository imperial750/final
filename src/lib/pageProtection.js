"use client";

import { useEffect, useState } from "react";

// Page-specific protection hooks
export const usePageProtection = (pageName) => {
  const [isProtected, setIsProtected] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    // Track page visits
    const visitCount =
      parseInt(localStorage.getItem(`${pageName}_visits`) || "0") + 1;
    localStorage.setItem(`${pageName}_visits`, visitCount.toString());

    // Check for suspicious rapid visits
    if (visitCount > 10) {
      console.warn(`Suspicious activity: ${visitCount} visits to ${pageName}`);
      // Could implement additional checks here
    }

    // Add page-specific protections
    const protections = [
      disableImageDragging(),
      preventAutofill(),
      detectScreenRecording(),
      monitorNetworkRequests(),
      checkPageIntegrity(),
    ];

    setIsProtected(true);

    return () => {
      // Cleanup protections
      protections.forEach((cleanup) => cleanup && cleanup());
    };
  }, [pageName]);

  return isProtected;
};

// Disable image dragging
const disableImageDragging = () => {
  const handleDragStart = (e) => {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener("dragstart", handleDragStart);
  return () => document.removeEventListener("dragstart", handleDragStart);
};

// Prevent autofill detection
const preventAutofill = () => {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.setAttribute("autocomplete", "new-password");
    input.setAttribute("data-lpignore", "true");
  });
};

// Detect screen recording
const detectScreenRecording = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    // Monitor for screen capture attempts
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
    navigator.mediaDevices.getDisplayMedia = function () {
      console.warn("Screen recording attempt detected");
      // Could block or redirect here
      return originalGetDisplayMedia.apply(this, arguments);
    };
  }
};

// Monitor network requests
const monitorNetworkRequests = () => {
  const originalFetch = window.fetch;
  let requestCount = 0;
  const startTime = Date.now();

  window.fetch = function () {
    requestCount++;
    const timeElapsed = Date.now() - startTime;

    // Check for too many requests in short time
    if (requestCount > 50 && timeElapsed < 60000) {
      console.warn("Suspicious network activity detected");
      // Could implement rate limiting here
    }

    return originalFetch.apply(this, arguments);
  };

  return () => {
    window.fetch = originalFetch;
  };
};

// Check page integrity
const checkPageIntegrity = () => {
  // Monitor DOM mutations for suspicious changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            // Check for suspicious script injections
            if (
              node.tagName === "SCRIPT" &&
              !node.src.includes(window.location.origin)
            ) {
              console.warn("Suspicious script injection detected");
              node.remove();
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};

// Form protection hook
export const useFormProtection = () => {
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    // Prevent form auto-submission
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      let submitCount = 0;
      const originalSubmit = form.submit;

      form.submit = function () {
        submitCount++;
        if (submitCount > 3) {
          console.warn("Suspicious form submission detected");
          return false;
        }
        return originalSubmit.apply(this, arguments);
      };

      // Add honeypot fields
      const honeypot = document.createElement("input");
      honeypot.type = "text";
      honeypot.name = "website";
      honeypot.style.display = "none";
      honeypot.tabIndex = -1;
      honeypot.autocomplete = "off";
      form.appendChild(honeypot);

      // Check honeypot on submit
      form.addEventListener("submit", (e) => {
        if (honeypot.value !== "") {
          console.warn("Bot detected via honeypot");
          e.preventDefault();
          window.location.href = "https://www.google.com";
          return false;
        }
      });
    });

    setIsProtected(true);
  }, []);

  return isProtected;
};

// Mouse behavior analysis
export const useMouseBehaviorAnalysis = () => {
  const [isHuman, setIsHuman] = useState(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    let mouseEvents = [];
    let startTime = Date.now();

    const handleMouseMove = (e) => {
      mouseEvents.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });

      // Keep only recent events
      if (mouseEvents.length > 100) {
        mouseEvents = mouseEvents.slice(-50);
      }
    };

    const analyzeMouseBehavior = () => {
      if (mouseEvents.length < 10) {
        setIsHuman(false);
        return;
      }

      // Calculate movement entropy
      let totalDistance = 0;
      let straightLines = 0;

      for (let i = 1; i < mouseEvents.length; i++) {
        const prev = mouseEvents[i - 1];
        const curr = mouseEvents[i];

        const distance = Math.sqrt(
          Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
        );
        totalDistance += distance;

        // Check for perfectly straight lines (bot behavior)
        if (i > 1) {
          const prevPrev = mouseEvents[i - 2];
          const slope1 = (prev.y - prevPrev.y) / (prev.x - prevPrev.x);
          const slope2 = (curr.y - prev.y) / (curr.x - prev.x);

          if (Math.abs(slope1 - slope2) < 0.01) {
            straightLines++;
          }
        }
      }

      const avgDistance = totalDistance / mouseEvents.length;
      const straightLineRatio = straightLines / mouseEvents.length;

      // Human-like behavior: varied movement, not too many straight lines
      const isLikelyHuman = avgDistance > 5 && straightLineRatio < 0.3;
      setIsHuman(isLikelyHuman);

      if (!isLikelyHuman) {
        console.warn("Non-human mouse behavior detected");
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Analyze after 10 seconds
    const analysisTimer = setTimeout(analyzeMouseBehavior, 10000);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(analysisTimer);
    };
  }, []);

  return isHuman;
};

// Timing attack protection
export const useTimingProtection = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    // Add random delays to prevent timing attacks
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;

    window.setTimeout = function (callback, delay, ...args) {
      const randomDelay = delay + Math.random() * 100; // Add 0-100ms random delay
      return originalSetTimeout(callback, randomDelay, ...args);
    };

    window.setInterval = function (callback, delay, ...args) {
      const randomDelay = delay + Math.random() * 50; // Add 0-50ms random delay
      return originalSetInterval(callback, randomDelay, ...args);
    };

    return () => {
      window.setTimeout = originalSetTimeout;
      window.setInterval = originalSetInterval;
    };
  }, []);
};
