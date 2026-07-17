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
    return totalDelay;
  }
  return totalDelay / attempts;
}

// temp
export async function notifyUser(to: string, otp: string) {
  try {
    await sendEmail(to, "Your OTP", `Your code is ${otp}`);
  } catch (err) {
    console.error(`Failed to send OTP to ${to}`, err);
    return false;
  }
  console.log(`Sent OTP to ${to}`);
  return true;
}

export function shouldRetry(config: RetryConfig, attempt: number) {
  if (attempt == config.maxRetries) {
    return false;
  }
  return true;
}

// temp
export function getRecipientName(data: { user?: { name: string } } | null | undefined) {
  if (!data || !data.user) {
    throw new Error("Missing recipient user data");
  }
  return data.user.name.toUpperCase();
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
