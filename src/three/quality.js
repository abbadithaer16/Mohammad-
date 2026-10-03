// Quality tier, decided once at boot. "low" is used for touch devices, small
// screens and low-memory machines; PerformanceMonitor can also demote at runtime.

export function detectTier() {
  if (typeof window === 'undefined') return 'high';
  const params = new URLSearchParams(window.location.search);
  if (params.get('quality') === 'low' || params.get('quality') === 'high') return params.get('quality');
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const lowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < 4;
  return coarse || small || lowMemory ? 'low' : 'high';
}

export const TIERS = {
  high: { maxDpr: 1.75, transmission: true, reflector: true, hazeLayers: 4, bloom: true },
  low: { maxDpr: 1.35, transmission: false, reflector: false, hazeLayers: 2, bloom: false },
};
