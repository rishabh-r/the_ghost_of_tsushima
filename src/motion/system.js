export const ease = {
  premium: [0.22, 1, 0.36, 1],
  soft: [0.33, 1, 0.68, 1],
};

export const timing = {
  fast: 0.16,
  standard: 0.36,
  slow: 0.62,
};

export const springs = {
  interaction: { type: 'spring', stiffness: 320, damping: 24, mass: 0.7 },
  panel: { type: 'spring', stiffness: 220, damping: 26, mass: 0.9 },
  settle: { type: 'spring', stiffness: 180, damping: 22, mass: 0.9 },
};

export function enterUp(shouldReduceMotion, distance = 18) {
  if (shouldReduceMotion) return { opacity: 1, y: 0, filter: 'blur(0px)' };
  return { opacity: 0, y: distance, filter: 'blur(6px)' };
}

export function enterDown(shouldReduceMotion, distance = 18) {
  if (shouldReduceMotion) return { opacity: 1, y: 0, filter: 'blur(0px)' };
  return { opacity: 0, y: -distance, filter: 'blur(6px)' };
}
