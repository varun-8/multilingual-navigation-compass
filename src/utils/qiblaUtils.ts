import { normalizeAngle, toDegrees, toRadians } from './angleUtils';

export const KAABA_LAT = 21.422487;
export const KAABA_LON = 39.826206;

export interface QiblaData {
  qiblaAzimuth: number; // degrees 0..359 relative to True North
  distanceKm: number;   // Distance to Kaaba in kilometers
}

/**
 * Calculates initial Great Circle Qibla bearing towards Kaaba in Mecca
 * and total distance in kilometers from current GPS coordinates.
 */
export const calculateQiblaData = (lat: number, lon: number): QiblaData => {
  if (isNaN(lat) || isNaN(lon)) {
    return { qiblaAzimuth: 0, distanceKm: 0 };
  }

  const phi1 = toRadians(lat);
  const phi2 = toRadians(KAABA_LAT);
  const dLon = toRadians(KAABA_LON - lon);

  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);

  const qiblaRad = Math.atan2(y, x);
  const qiblaAzimuth = Math.round(normalizeAngle(toDegrees(qiblaRad)));

  // Haversine formula for distance in km
  const R = 6371; // Earth radius in km
  const dLat = phi2 - phi1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return {
    qiblaAzimuth,
    distanceKm,
  };
};
