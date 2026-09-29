import { SensorAccuracy, SensorStatus } from '../types/compass';
import { normalizeAngle, toDegrees } from './angleUtils';

export interface SensorVector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculates tilt-compensated heading in degrees (0..359) using
 * physical Accelerometer (gravity vector) and Magnetometer (magnetic vector) readings.
 */
export const calculateTiltCompensatedHeading = (
  accel: SensorVector3D,
  mag: SensorVector3D,
  orientation: 'portrait' | 'landscape' = 'portrait'
): { heading: number; pitch: number; roll: number } => {
  // Normalize accelerometer vector
  const normAccel = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
  if (normAccel === 0) {
    return { heading: 0, pitch: 0, roll: 0 };
  }

  const ax = accel.x / normAccel;
  const ay = accel.y / normAccel;
  const az = accel.z / normAccel;

  // Calculate Roll (phi) and Pitch (theta) in radians
  // Roll: rotation around Y axis (-pi to pi)
  // Pitch: rotation around X axis (-pi/2 to pi/2)
  const roll = Math.atan2(ay, az);
  const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));

  const cosRoll = Math.cos(roll);
  const sinRoll = Math.sin(roll);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);

  // Tilt-compensated magnetic vector components
  const Xh = mag.x * cosPitch + mag.y * sinRoll * sinPitch + mag.z * cosRoll * sinPitch;
  const Yh = mag.y * cosRoll - mag.z * sinRoll;

  // Compute magnetic azimuth (heading)
  let headingRad = Math.atan2(-Yh, Xh);
  let headingDeg = toDegrees(headingRad);

  // Apply device orientation offset if needed
  if (orientation === 'landscape') {
    headingDeg += 90;
  }

  return {
    heading: normalizeAngle(headingDeg),
    pitch: toDegrees(pitch),
    roll: toDegrees(roll),
  };
};

/**
 * Evaluates magnetometer accuracy level based on magnetic field strength magnitude.
 * Earth's magnetic field strength ranges from ~25 to ~65 microteslas (uT).
 */
export const evaluateSensorAccuracy = (mag: SensorVector3D): SensorAccuracy => {
  const fieldStrength = Math.sqrt(mag.x * mag.x + mag.y * mag.y + mag.z * mag.z);
  
  if (fieldStrength === 0) {
    return 'unreliable';
  }
  // Typical Earth magnetic field is between 25uT and 65uT
  if (fieldStrength >= 20 && fieldStrength <= 70) {
    return 'high';
  } else if (fieldStrength >= 10 && fieldStrength <= 90) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Maps SensorAccuracy to overall SensorStatus
 */
export const getSensorStatusFromAccuracy = (accuracy: SensorAccuracy, isAvailable: boolean): SensorStatus => {
  if (!isAvailable) {
    return 'unavailable';
  }
  if (accuracy === 'low' || accuracy === 'unreliable') {
    return 'needs_calibration';
  }
  return 'ready';
};
