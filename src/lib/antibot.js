"use client";

import { useState, useEffect, useCallback } from "react";

// Advanced Anti-Bot Protection System
export class AntiBotSystem {
  constructor() {
    this.isBot = false;
    this.suspiciousActivity = 0;
    this.deviceFingerprint = null;
    this.startTime = Date.now();
    this.mouseMovements = [];
    this.keystrokes = [];
    this.clickCount = 0;
    this.scrollCount = 0;
    this.focusEvents = 0;
    this.bannedIPs = [];
    this.bannedUserAgents = [];
    this.bannedReferrers = [];
    this.whitelistedIPs = ["127.0.0.1", "::1"]; // Add your IPs here
  }

  // Initialize all protection mechanisms
  async initialize() {
    await this.loadBannedLists();
    this.generateDeviceFingerprint();
    this.setupEventListeners();
    this.performInitialChecks();
    this.startBehaviorAnalysis();
    return !this.isBot;
  }

  // Load banned lists from public files
  async loadBannedLists() {
    try {
      // Load banned IPs
      const badIpsResponse = await fetch("/bad_ips.txt");
      const badIpsText = await badIpsResponse.text();
      this.bannedIPs = badIpsText
        .split("\n")
        .map((ip) => ip.trim())
        .filter(Boolean);

      // Load banned user agents
      const botAgentsResponse = await fetch("/botUserAgents.txt");
      const botAgentsText = await botAgentsResponse.text();
      this.bannedUserAgents = botAgentsText
        .split("\n")
        .map((ua) => ua.trim())
        .filter(Boolean);

      // Load banned referrers
      const bannedRefResponse = await fetch("/bannedReferrers.txt");
      const bannedRefText = await bannedRefResponse.text();
      this.bannedReferrers = bannedRefText
        .split("\n")
        .map((ref) => ref.trim())
        .filter(Boolean);

      // Load spider list
      const spidersResponse = await fetch("/spiders.txt");
      const spidersText = await spidersResponse.text();
      const spiders = spidersText
        .split("\n")
        .map((spider) => spider.trim())
        .filter(Boolean);
      this.bannedUserAgents = [...this.bannedUserAgents, ...spiders];
    } catch (error) {
      console.error("Failed to load anti-bot lists:", error);
    }
  }

  // Generate unique device fingerprint
  generateDeviceFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);

    this.deviceFingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint(),
      plugins: Array.from(navigator.plugins)
        .map((p) => p.name)
        .join(","),
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory || "unknown",
      connection: navigator.connection
        ? navigator.connection.effectiveType
        : "unknown",
    };
  }

  // Get WebGL fingerprint
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "no-webgl";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      return debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "webgl-available";
    } catch (e) {
      return "webgl-error";
    }
  }

  // Setup event listeners for behavior analysis
  setupEventListeners() {
    // Mouse movement tracking
    document.addEventListener("mousemove", (e) => {
      this.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
      if (this.mouseMovements.length > 100) {
        this.mouseMovements = this.mouseMovements.slice(-50);
      }
    });

    // Click tracking
    document.addEventListener("click", () => {
      this.clickCount++;
    });

    // Scroll tracking
    document.addEventListener("scroll", () => {
      this.scrollCount++;
    });

    // Keystroke tracking
    document.addEventListener("keydown", () => {
      this.keystrokes.push(Date.now());
      if (this.keystrokes.length > 50) {
        this.keystrokes = this.keystrokes.slice(-25);
      }
    });

    // Focus events
    window.addEventListener("focus", () => this.focusEvents++);
    window.addEventListener("blur", () => this.focusEvents++);

    // Detect developer tools
    this.detectDevTools();
  }

  // Perform initial bot checks
  async performInitialChecks() {
    // Check IP address
    await this.checkIPAddress();

    // Check user agent
    this.checkUserAgent();

    // Check referrer
    this.checkReferrer();

    // Check for automation indicators
    this.checkAutomationIndicators();

    // Check browser features
    this.checkBrowserFeatures();

    // Check timing attacks
    this.checkTimingAttacks();
  }

  // Check IP address against banned lists
  async checkIPAddress() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      const userIP = data.ip;

      // Check if IP is whitelisted
      if (this.whitelistedIPs.includes(userIP)) {
        return;
      }

      // Check if IP is banned
      if (
        this.bannedIPs.some((bannedIP) => this.isIPInRange(userIP, bannedIP))
      ) {
        this.flagAsBot("Banned IP address");
        return;
      }

      // Check IP reputation
      await this.checkIPReputation(userIP);
    } catch (error) {
      console.error("IP check failed:", error);
    }
  }

  // Check if IP is in range (supports CIDR notation)
  isIPInRange(ip, range) {
    if (range.includes("/")) {
      // CIDR notation - simplified check
      const [rangeIP, mask] = range.split("/");
      return ip.startsWith(
        rangeIP
          .split(".")
          .slice(0, Math.floor(parseInt(mask) / 8))
          .join(".")
      );
    }
    return ip === range;
  }

  // Check IP reputation using multiple sources
  async checkIPReputation(ip) {
    try {
      // Check against known VPN/proxy ranges
      const vpnRanges = [
        "10.",
        "172.16.",
        "172.17.",
        "172.18.",
        "172.19.",
        "172.20.",
        "172.21.",
        "172.22.",
        "172.23.",
        "172.24.",
        "172.25.",
        "172.26.",
        "172.27.",
        "172.28.",
        "172.29.",
        "172.30.",
        "172.31.",
        "192.168.",
      ];

      if (vpnRanges.some((range) => ip.startsWith(range))) {
        this.suspiciousActivity += 2;
      }
    } catch (error) {
      console.error("IP reputation check failed:", error);
    }
  }

  // Check user agent against banned patterns
  checkUserAgent() {
    const userAgent = navigator.userAgent.toLowerCase();

    // Check against banned user agents
    if (
      this.bannedUserAgents.some((banned) =>
        userAgent.includes(banned.toLowerCase())
      )
    ) {
      this.flagAsBot("Banned user agent");
      return;
    }

    // Check for bot patterns
    const botPatterns = [
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
    ];

    if (botPatterns.some((pattern) => pattern.test(userAgent))) {
      this.flagAsBot("Bot-like user agent");
      return;
    }

    // Check for missing common browser features
    if (!userAgent.includes("mozilla") && !userAgent.includes("webkit")) {
      this.suspiciousActivity += 3;
    }
  }

  // Check referrer against banned patterns
  checkReferrer() {
    const referrer = document.referrer.toLowerCase();

    if (
      this.bannedReferrers.some((banned) =>
        referrer.includes(banned.toLowerCase())
      )
    ) {
      this.flagAsBot("Banned referrer");
    }
  }

  // Check for automation indicators
  checkAutomationIndicators() {
    // Check for Selenium/WebDriver
    if (
      window.navigator.webdriver ||
      window.callPhantom ||
      window._phantom ||
      window.Buffer ||
      window.emit ||
      window.spawn
    ) {
      this.flagAsBot("Automation tool detected");
      return;
    }

    // Check for headless browser indicators
    if (
      navigator.webdriver === true ||
      navigator.languages === "" ||
      navigator.languages === undefined ||
      !navigator.languages ||
      navigator.languages.length === 0
    ) {
      this.suspiciousActivity += 5;
    }

    // Check for missing window properties
    const expectedProperties = [
      "outerHeight",
      "outerWidth",
      "innerHeight",
      "innerWidth",
    ];
    const missingProperties = expectedProperties.filter(
      (prop) => !window[prop]
    );
    if (missingProperties.length > 0) {
      this.suspiciousActivity += missingProperties.length;
    }
  }

  // Check browser features
  checkBrowserFeatures() {
    // Check for missing APIs that real browsers have
    const requiredAPIs = [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "WebSocket",
      "fetch",
      "Promise",
      "MutationObserver",
      "requestAnimationFrame",
    ];

    const missingAPIs = requiredAPIs.filter((api) => !window[api]);
    this.suspiciousActivity += missingAPIs.length * 2;

    // Check for suspicious plugin configurations
    if (navigator.plugins.length === 0) {
      this.suspiciousActivity += 2;
    }
  }

  // Check for timing attacks
  checkTimingAttacks() {
    const start = performance.now();

    // Perform some calculations
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += Math.random();
    }

    const end = performance.now();
    const executionTime = end - start;

    // If execution is too fast, might be a bot
    if (executionTime < 0.1) {
      this.suspiciousActivity += 3;
    }
  }

  // Detect developer tools
  detectDevTools() {
    let devtools = { open: false, orientation: null };

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > 200 ||
        window.outerWidth - window.innerWidth > 200
      ) {
        if (!devtools.open) {
          devtools.open = true;
          this.suspiciousActivity += 5;
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  // Start behavior analysis
  startBehaviorAnalysis() {
    setTimeout(() => {
      this.analyzeBehavior();
    }, 5000); // Analyze after 5 seconds

    setInterval(() => {
      this.analyzeBehavior();
    }, 30000); // Check every 30 seconds
  }

  // Analyze user behavior patterns
  analyzeBehavior() {
    const timeSpent = Date.now() - this.startTime;

    // Check mouse movement patterns
    if (this.mouseMovements.length < 5 && timeSpent > 10000) {
      this.suspiciousActivity += 3;
    }

    // Check for too perfect mouse movements (straight lines)
    if (this.mouseMovements.length > 10) {
      const straightLines = this.detectStraightLines();
      if (straightLines > 5) {
        this.suspiciousActivity += 2;
      }
    }

    // Check click patterns
    if (this.clickCount === 0 && timeSpent > 15000) {
      this.suspiciousActivity += 2;
    }

    // Check scroll behavior
    if (this.scrollCount === 0 && timeSpent > 20000) {
      this.suspiciousActivity += 1;
    }

    // Check keystroke patterns
    if (this.keystrokes.length > 10) {
      const avgInterval = this.calculateAverageKeystrokeInterval();
      if (avgInterval < 50 || avgInterval > 2000) {
        // Too fast or too slow
        this.suspiciousActivity += 2;
      }
    }

    // Final decision
    if (this.suspiciousActivity >= 10) {
      this.flagAsBot("Suspicious behavior pattern");
    }
  }

  // Detect straight line mouse movements
  detectStraightLines() {
    let straightLines = 0;
    for (let i = 2; i < this.mouseMovements.length; i++) {
      const p1 = this.mouseMovements[i - 2];
      const p2 = this.mouseMovements[i - 1];
      const p3 = this.mouseMovements[i];

      // Calculate if points are in a straight line
      const slope1 = (p2.y - p1.y) / (p2.x - p1.x);
      const slope2 = (p3.y - p2.y) / (p3.x - p2.x);

      if (Math.abs(slope1 - slope2) < 0.1) {
        straightLines++;
      }
    }
    return straightLines;
  }

  // Calculate average keystroke interval
  calculateAverageKeystrokeInterval() {
    if (this.keystrokes.length < 2) return 0;

    let totalInterval = 0;
    for (let i = 1; i < this.keystrokes.length; i++) {
      totalInterval += this.keystrokes[i] - this.keystrokes[i - 1];
    }

    return totalInterval / (this.keystrokes.length - 1);
  }

  // Flag as bot and take action
  flagAsBot(reason) {
    this.isBot = true;
    console.log(`Bot detected: ${reason}`);

    // Log to console for debugging
    console.log("Device Fingerprint:", this.deviceFingerprint);
    console.log("Suspicious Activity Score:", this.suspiciousActivity);

    // Redirect to a safe page
    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 1000);
  }

  // Get current status
  getStatus() {
    return {
      isBot: this.isBot,
      suspiciousActivity: this.suspiciousActivity,
      deviceFingerprint: this.deviceFingerprint,
    };
  }
}

// React hook for anti-bot protection
export const useAntiBot = () => {
  const [isProtected, setIsProtected] = useState(false);
  const [isBot, setIsBot] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const initializeProtection = async () => {
      try {
        const antiBot = new AntiBotSystem();
        const isLegitimate = await antiBot.initialize();

        setIsBot(!isLegitimate);
        setIsProtected(isLegitimate);
        setLoading(false);

        if (!isLegitimate) {
          // Additional actions for detected bots
          console.warn("Bot detected - access denied");
        }
      } catch (error) {
        console.error("Anti-bot initialization failed:", error);
        // On error, allow access but log the issue
        setIsProtected(true);
        setIsBot(false);
        setLoading(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    setTimeout(initializeProtection, 100);
  }, []);

  return { isProtected, isBot, loading };
};

// Additional React-specific protections
export const useAdvancedProtection = () => {
  const [protectionActive, setProtectionActive] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, etc.
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "a") ||
        (e.ctrlKey && e.key === "c")
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable drag and drop
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);

    // Disable console access
    Object.defineProperty(window, "console", {
      value: {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {},
        debug: () => {},
        trace: () => {},
        dir: () => {},
        dirxml: () => {},
        table: () => {},
        clear: () => {},
        count: () => {},
        time: () => {},
        timeEnd: () => {},
        group: () => {},
        groupEnd: () => {},
        groupCollapsed: () => {},
      },
      writable: false,
      configurable: false,
    });

    setProtectionActive(true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return protectionActive;
};
