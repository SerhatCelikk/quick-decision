import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Returns true when the user has enabled Reduce Motion in system accessibility settings.
 * Use this to skip or simplify animations for users who are sensitive to motion.
 *
 * iOS:  Settings → Accessibility → Motion → Reduce Motion
 * Android: Settings → Accessibility → Remove Animations
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  return reduceMotion;
}
