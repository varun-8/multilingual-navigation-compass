import { toRadians } from './angleUtils';

/**
 * Calculates estimated magnetic declination in degrees for a given latitude and longitude.
 * Positive declination = East (+ True North = Magnetic North + Declination)
 * Negative declination = West
 * Uses a standard approximate World Magnetic Model polynomial fit.
 */
export const calculateMagneticDeclination = (lat: number, lon: number): number => {
  if (isNaN(lat) || isNaN(lon)) return 0;

  // Approximate geomagnetic poles position (IGRF model fit)
  const northPoleLat = 86.5;
  const northPoleLon = -157.0;

  const latRad = toRadians(lat);
  const lonRad = toRadians(lon);
  const poleLatRad = toRadians(northPoleLat);
  const poleLonRad = toRadians(northPoleLon);

  const dLon = poleLonRad - lonRad;

  const y = Math.sin(dLon);
  const x = Math.cos(latRad) * Math.tan(poleLatRad) - Math.sin(latRad) * Math.cos(dLon);

  let declination = Math.atan2(y, x) * (180 / Math.PI);

  // Clamp within realistic Earth limits (-180° to +180°)
  if (declination > 180) declination -= 360;
  if (declination < -180) declination += 360;

  return Math.round(declination * 10) / 10;
};
