/**
 * Shared duration/time-of-day helpers, extracted so any tool dealing with elapsed time
 * (Playback Speed Calculator, Time Sheet Calculator, and any future one) can format and
 * convert durations consistently without reimplementing rounding/formatting logic.
 */

/**
 * Converts an H/M/S structured duration into total seconds.
 */
export function hmsToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Converts a total number of seconds into an H/M/S structure, rounding to the nearest whole
 * second first so floating-point division (e.g. dividing a duration by a playback speed)
 * never produces a display like "39.9999s" - the seconds field is always a clean integer.
 */
export function secondsToHms(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return { hours, minutes, seconds };
}

/**
 * Formats a total number of seconds as a clean "Xh Ym Zs" string, omitting any leading
 * zero-valued units (e.g. 90 seconds -> "1m 30s", not "0h 1m 30s").
 */
export function formatHms(totalSeconds: number): string {
  const { hours, minutes, seconds } = secondsToHms(totalSeconds);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (hours > 0 || minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

/**
 * Formats a total number of minutes (may be fractional, e.g. from summing hour:minute shifts)
 * as a clean "Xh Ym" string, rounding to the nearest whole minute first.
 */
export function formatHoursMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return `${hours}h ${minutes}m`;
}
