"use client";

// Utility to generate and persist a unique flow/session ID per user device.
// Uses localStorage so the same user keeps the same ID across the flow.

export function getOrCreateFlowId(forceNew = false) {
  const storageKey = "login_mock_flow_id";
  try {
    // If forceNew is true, always generate a new ID
    if (forceNew) {
      const newId = generateFlowId();
      localStorage.setItem(storageKey, newId);
      return newId;
    }

    const existing = localStorage.getItem(storageKey);
    if (existing && typeof existing === "string" && existing.length > 0) {
      return existing;
    }
    const newId = generateFlowId();
    localStorage.setItem(storageKey, newId);
    return newId;
  } catch (_e) {
    return generateFlowId();
  }
}

function generateFlowId() {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
}
