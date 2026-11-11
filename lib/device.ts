/** Device capability heuristics used to scale visual effects. Client-only. */

export type QualityTier = 'low' | 'medium' | 'high';

let webglCache: boolean | null = null;

export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    webglCache = !!gl;
    // Release the probe context immediately.
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}

export function getQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium';
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const narrow = window.matchMedia('(max-width: 760px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (nav.connection?.saveData) return 'low';
  if (cores <= 4 || memory <= 2) return 'low';
  if (narrow || coarse || cores <= 6) return 'medium';
  return 'high';
}

export const particleBudget: Record<QualityTier, number> = {
  low: 6000,
  medium: 11000,
  high: 18000,
};

export const dprCap: Record<QualityTier, number> = {
  low: 1,
  medium: 1.5,
  high: 1.75,
};
