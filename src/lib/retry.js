/**
 * withRetry — wraps any async function with exponential-backoff retry logic.
 *
 * Useful for catching cold-start failures from Supabase / Vercel serverless
 * functions, where the first request may time out or return a 5xx error.
 *
 * @param {() => Promise<any>} fn        — the async function to call
 * @param {object}             options
 * @param {number}             options.retries    — max retry attempts (default 3)
 * @param {number}             options.baseDelay  — initial delay in ms (default 500)
 * @param {number}             options.maxDelay   — cap on delay in ms (default 8000)
 * @param {(err: any) => boolean} options.shouldRetry — predicate; return false to abort early
 */
export async function withRetry(fn, options = {}) {
  const {
    retries = 3,
    baseDelay = 500,
    maxDelay = 8000,
    shouldRetry = () => true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isLastAttempt = attempt === retries;
      if (isLastAttempt || !shouldRetry(err)) {
        throw err;
      }

      // Exponential backoff with jitter: 500ms → 1000ms → 2000ms → …
      const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
      const jitter = Math.random() * 200; // ±100 ms jitter
      console.warn(
        `[retry] Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay + jitter)}ms…`,
        err?.message || err
      );
      await sleep(delay + jitter);
    }
  }

  throw lastError;
}

/** Returns true if the error looks like a transient network / cold-start issue */
export function isTransientError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const status = err.status || err.statusCode || 0;

  return (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('enotfound') ||
    msg.includes('failed to fetch') ||
    status === 503 ||
    status === 504 ||
    status === 502
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
