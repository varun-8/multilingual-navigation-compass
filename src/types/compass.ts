export type SupportedLanguage = 'en' | 'ta' | 'hi';

export type NorthReference = 'magnetic' | 'true';

export type ThemeMode = 'system' | 'light' | 'dark';

export type SensorAccuracy = 'high' | 'medium' | 'low' | 'unreliable' | 'unknown';

export type SensorStatus = 'ready' | 'needs_calibration' | 'unavailable';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  declination: number; // Magnetic declination in degrees (+ East, - West)
}

export interface CompassData {
  magneticHeading: number; // 0..359
  trueHeading: number;     // 0..359
  heading: number;         // Active heading depending on NorthReference
  pitch: number;           // Device tilt around X axis (radians or degrees)
  roll: number;            // Device tilt around Y axis (radians or degrees)
  accuracy: SensorAccuracy;
  sensorStatus: SensorStatus;
  isAvailable: boolean;
  orientation: 'portrait' | 'landscape';
}

export interface HeadingLockState {
  isLocked: boolean;
  lockedHeading: number | null;
}

export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface DirectionInfo {
  code: CardinalDirection;
  nameKey: string;
  degrees: number;
}

export interface UserPreferences {
  language: SupportedLanguage;
  northReference: NorthReference;
  themeMode: ThemeMode;
  headingLock: boolean;
  debugMode: boolean;
}
