/**
 * Normalizes an angle in degrees to the range [0, 360)
 */
export const normalizeAngle = (angle: number): number => {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
};

/**
 * Calculates the shortest angular difference between two angles in degrees (-180 to +180)
 */
export const shortestAngleDifference = (fromAngle: number, toAngle: number): number => {
  const diff = (toAngle - fromAngle + 540) % 360 - 180;
  return diff;
};

/**
 * Interpolates between current angle and target angle using shortest arc path
 * Handles crossing 359° -> 0° boundary smoothly without spinning 358° around.
 */
export const interpolateAngle = (current: number, target: number, factor: number = 0.15): number => {
  const diff = shortestAngleDifference(current, target);
  return normalizeAngle(current + diff * factor);
};

/**
 * Converts degrees to radians
 */
export const toRadians = (deg: number): number => {
  return (deg * Math.PI) / 180;
};

/**
 * Converts radians to degrees
 */
export const toDegrees = (rad: number): number => {
  return (rad * 180) / Math.PI;
};
