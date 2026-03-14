export function clamp(v, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

export function mapRange(v, inMin, inMax, outMin, outMax) {
  if (inMax - inMin === 0) return outMin;
  const t = (v - inMin) / (inMax - inMin);
  return outMin + clamp(t, 0, 1) * (outMax - outMin);
}

export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

export function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
