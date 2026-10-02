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

  // Pitch (theta): tilt around X axis (forward/backward)
  // Roll (phi): tilt around Y axis (left/right)
  const pitch = Math.atan2(ay, Math.sqrt(ax * ax + az * az));
  const roll = Math.atan2(-ax, az);

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosRoll = Math.cos(roll);
  const sinRoll = Math.sin(roll);

  // Tilt-compensated magnetic vector projected onto horizontal plane
  // Xh: forward horizontal component (along top of device)
  // Yh: rightward horizontal component (along right of device)
  const Xh = mag.x * sinRoll * sinPitch + mag.y * cosPitch - mag.z * cosRoll * sinPitch;
  const Yh = mag.x * cosRoll + mag.z * sinRoll;

  // Compute magnetic azimuth in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  let headingRad = Math.atan2(-Yh, Xh);
  let headingDeg = toDegrees(headingRad);

  // Apply device orientation offset if landscape
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
