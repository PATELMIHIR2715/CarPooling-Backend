/**
 * Redis Circuit Breaker & Fallback Utility
 * 
 * Prevents tight-loop command spam when Upstash Redis reaches its request limit
 * (e.g. ERR max requests limit exceeded on the 500k free tier limit).
 * Provides automatic fallback to direct SMTP email delivery.
 */

import env from "../config/env.js";

const DEFAULT_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown

interface CircuitState {
  isOpen: boolean;
  trippedAt: number | null;
  reason: string | null;
}

const state: CircuitState = {
  isOpen: false,
  trippedAt: null,
  reason: null,
};

/**
 * Checks if an error is an Upstash Redis request limit error.
 */
export const isUpstashLimitError = (error: unknown): boolean => {
  if (!error) return false;

  const errMsg =
    typeof error === "string"
      ? error
      : (error as any)?.message || (error as any)?.toString?.() || "";

  return (
    errMsg.includes("ERR max requests limit exceeded") ||
    errMsg.includes("max requests limit exceeded") ||
    errMsg.includes("max_requests_limit") ||
    errMsg.includes("Daily request limit exceeded") ||
    errMsg.includes("QuotaExceeded")
  );
};

/**
 * Trips the circuit breaker, switching the system to direct SMTP fallback mode.
 */
export const tripCircuit = (reason: string = "Upstash request limit exceeded"): void => {
  if (!state.isOpen) {
    state.isOpen = true;
    state.trippedAt = Date.now();
    state.reason = reason;
    console.warn(
      `\n[Circuit Breaker] TRIPPED: ${reason}. Bypassing Redis and switching to direct SMTP delivery for ${
        DEFAULT_COOLDOWN_MS / 60000
      } minutes.\n`
    );
  }
};

/**
 * Resets the circuit breaker, allowing BullMQ / Redis queue operations to resume.
 */
export const resetCircuit = (): void => {
  if (state.isOpen) {
    console.log("[Circuit Breaker] RESET: Resuming standard BullMQ queue operations.");
    state.isOpen = false;
    state.trippedAt = null;
    state.reason = null;
  }
};

/**
 * Checks whether direct email mode is active.
 * Returns true if:
 * 1. Explicitly enabled via DISABLE_EMAIL_QUEUE=true or EMAIL_DIRECT_FALLBACK=true
 * 2. Circuit breaker is currently tripped (open) and within the cooldown period.
 */
export const isDirectEmailModeEnabled = (): boolean => {
  // Check explicit environment variables
  if (
    env.DISABLE_EMAIL_QUEUE === "true" ||
    env.EMAIL_DIRECT_FALLBACK === "true" ||
    process.env.DISABLE_EMAIL_QUEUE === "true" ||
    process.env.EMAIL_DIRECT_FALLBACK === "true"
  ) {
    return true;
  }

  // Check circuit breaker status
  if (state.isOpen) {
    const elapsed = Date.now() - (state.trippedAt || 0);
    if (elapsed > DEFAULT_COOLDOWN_MS) {
      console.log(
        "[Circuit Breaker] Cooldown elapsed. Testing Redis queue reconnection..."
      );
      resetCircuit();
      return false;
    }
    return true;
  }

  return false;
};

/**
 * Get current circuit breaker status for diagnostics.
 */
export const getCircuitBreakerStatus = () => {
  return {
    isOpen: state.isOpen,
    trippedAt: state.trippedAt ? new Date(state.trippedAt).toISOString() : null,
    reason: state.reason,
    directModeForced:
      env.DISABLE_EMAIL_QUEUE === "true" ||
      env.EMAIL_DIRECT_FALLBACK === "true" ||
      process.env.DISABLE_EMAIL_QUEUE === "true" ||
      process.env.EMAIL_DIRECT_FALLBACK === "true",
  };
};
