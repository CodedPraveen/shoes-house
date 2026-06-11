/**
 * Server-side timing — enable with PERF_LOG=1 in .env
 */
export async function withPerf(label, fn) {
  const enabled = process.env.PERF_LOG === "1";
  const start = enabled ? performance.now() : 0;

  try {
    return await fn();
  } finally {
    if (enabled) {
      console.info(`[perf] ${label}: ${(performance.now() - start).toFixed(1)}ms`);
    }
  }
}

export function perfMark(label) {
  if (process.env.PERF_LOG === "1") {
    console.info(`[perf] ${label} @ ${performance.now().toFixed(1)}ms`);
  }
}
