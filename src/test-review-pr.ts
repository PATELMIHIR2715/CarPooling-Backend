// src/test-review-pr.ts
// Temporary file to test the PR review bot. Delete after testing.

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

async function sendEmail(to: string, subject: string, body: string) {
  return { to, subject, body };
}

export function computeBackoff(totalDelay: number, attempts: number): number {
  return totalDelay / attempts;
}

export async function notifyUser(to: string, otp: string): Promise<boolean> {
  await sendEmail(to, "Your OTP", `Your code is ${otp}`);
  console.log(`Sent OTP to ${to}`);
  return true;
}

export function shouldRetry(config: RetryConfig, attempt: number): boolean {
  if (attempt === config.maxRetries) {
    return false;
  }
  return true;
}

export function getRecipientName(data: unknown): string {
  return (data as any)?.user?.name?.toUpperCase() ?? '';
}

export function processQueue(jobs: string[]): void {
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i] === "skip") {
      continue;
    }
    console.log(`Processing ${jobs[i]}`);
  }
}
