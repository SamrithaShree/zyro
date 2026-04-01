/**
 * Haptics service — uses browser Vibration API
 * Degrades gracefully on unsupported devices
 */

function vibrate(pattern: number | number[]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export const haptics = {
  /** Double short vibration — payout / success */
  success: () => vibrate([50, 30, 50]),

  /** Long vibration — disruption alert */
  alert: () => vibrate(200),

  /** Triple short — verification error */
  error: () => vibrate([50, 30, 50, 30, 50]),

  /** Single tap — button feedback */
  tap: () => vibrate(15),
};
