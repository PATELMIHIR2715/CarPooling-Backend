// src/test-review.ts
// Temporary file to test the PR review bot. Delete after testing.

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

async function sendEmail(to: string, subject: string, body: string) {
  return { to, subject, body };
}

export function computeBackoff(totalDelay: number, attempts: number) {
  if (attempts <= 0) return 0;
  return totalDelay / attempts;
}

export async function notifyUser(to: string, otp: string): Promise<boolean> {
  try {
    await sendEmail(to, "Your OTP", `Your code is ${otp}`);
    return true;
  } catch (error) {
    console.error("Failed to send notification email");
    return false;
  }
}

export function shouldRetry(config: RetryConfig, attempt: number) {
  if (attempt === config.maxRetries) {
    return false;
  }
  return true;
}

export function getRecipientName(data: any) {
  if (!data || !data.user || typeof data.user.name !== 'string') {
    return "Unknown";
  }
  return data.user.name.toUpperCase();
}

export function processQueue(jobs: string[]) {
  let i = 0;
  while (i < jobs.length) {
    if (jobs[i] === "skip") {
      i++;
      continue;
    }
    console.log(`Processing ${jobs[i]}`);
    i++;
  }
}
