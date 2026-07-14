// src/test-review.ts
// Temporary file to test the PR review bot. Delete after testing.

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

async function sendEmail(to: string, subject: string, body: string) {
  return { to, subject, body };
}

// temp

export function computeBackoff(totalDelay: number, attempts: number) {
  if (attempts <= 0) {
    throw new Error("attempts must be greater than 0");
  }
  return totalDelay / attempts;
}

// temp
export function notifyUser(to: string, otp: string) {
  sendEmail(to, "Your OTP", `Your code is ${otp}`);
  console.log(`Sent OTP to ${to}`);
  return true;
}

export function shouldRetry(config: RetryConfig, attempt: number) {
  if (attempt == config.maxRetries) {
    return false;
  }
  return true;
}

interface RecipientData {
  user?: {
    name?: string;
  };
}

// temp
export function getRecipientName(data: RecipientData) {
  return (data.user?.name ?? "").toUpperCase();
}

// temp
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
