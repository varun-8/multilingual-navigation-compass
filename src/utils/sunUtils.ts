import * as SunCalc from 'suncalc';
import { normalizeAngle, toDegrees } from './angleUtils';

export interface SolarData {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dawn: Date;
  dusk: Date;
  sunriseAzimuth: number; // degrees 0..359
  sunsetAzimuth: number;  // degrees 0..359
  currentSunAzimuth: number; // degrees 0..359
  currentSunElevation: number; // degrees (-90 to +90)
  isDaytime: boolean;
  phase: 'dawn' | 'sunrise' | 'day' | 'golden_hour' | 'sunset' | 'dusk' | 'night';
}

/**
 * Calculates real-time solar positioning, sunrise/sunset times & azimuth angles
 * for a given GPS location (lat, lon) and timestamp (defaults to now).
 */
export const calculateSolarData = (
  lat: number = 28.6139,
  lon: number = 77.2090,
  date: Date = new Date()
): SolarData => {
  const times = SunCalc.getTimes(date, lat, lon);

  const sunriseDate = times.sunrise || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0);
  const sunsetDate = times.sunset || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0);
  const solarNoonDate = times.solarNoon || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0);
  const dawnDate = times.dawn || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 30);
  const duskDate = times.dusk || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 30);

  // Convert SunCalc azimuth (South = 0) to Compass Azimuth (North = 0)
  const getCompassAzimuth = (targetDate: Date) => {
    const pos = SunCalc.getPosition(targetDate, lat, lon);
    const azDeg = toDegrees(pos.azimuth) + 180;
    return Math.round(normalizeAngle(azDeg));
  };

  const currentPos = SunCalc.getPosition(date, lat, lon);
  const currentSunAzimuth = Math.round(normalizeAngle(toDegrees(currentPos.azimuth) + 180));
  const currentSunElevation = Math.round(toDegrees(currentPos.altitude));

  const sunriseAzimuth = getCompassAzimuth(sunriseDate);
  const sunsetAzimuth = getCompassAzimuth(sunsetDate);

  const nowMs = date.getTime();
  const sunriseMs = sunriseDate.getTime();
  const sunsetMs = sunsetDate.getTime();
  const dawnMs = dawnDate.getTime();
  const duskMs = duskDate.getTime();
  const goldenHourMs = times.goldenHour ? times.goldenHour.getTime() : sunsetMs - 45 * 60 * 1000;

  const isDaytime = currentSunElevation > 0;

  let phase: SolarData['phase'] = 'day';
  if (nowMs >= dawnMs && nowMs < sunriseMs) {
    phase = 'dawn';
  } else if (Math.abs(nowMs - sunriseMs) < 15 * 60 * 1000) {
    phase = 'sunrise';
  } else if (nowMs >= goldenHourMs && nowMs < sunsetMs) {
    phase = 'golden_hour';
  } else if (Math.abs(nowMs - sunsetMs) < 15 * 60 * 1000) {
    phase = 'sunset';
  } else if (nowMs >= sunsetMs && nowMs < duskMs) {
    phase = 'dusk';
  } else if (isDaytime) {
    phase = 'day';
  } else {
    phase = 'night';
  }

  return {
    sunrise: sunriseDate,
    sunset: sunsetDate,
    solarNoon: solarNoonDate,
    dawn: dawnDate,
    dusk: duskDate,
    sunriseAzimuth,
    sunsetAzimuth,
    currentSunAzimuth,
    currentSunElevation,
    isDaytime,
    phase,
  };
};

export const formatSolarTime = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
