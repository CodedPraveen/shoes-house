function randomKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function getCheckoutIdempotencyKey(ref, payload) {
  const fingerprint = JSON.stringify(payload);
  if (!ref.current || ref.current.fingerprint !== fingerprint) {
    ref.current = { fingerprint, key: randomKey() };
  }
  return ref.current.key;
}
