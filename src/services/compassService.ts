import { Magnetometer, Accelerometer } from 'expo-sensors';
import { AppState, AppStateStatus } from 'react-native';
import { CompassData, SensorAccuracy, SensorStatus } from '../types/compass';
import { interpolateAngle, normalizeAngle, shortestAngleDifference } from '../utils/angleUtils';
import {
  calculateTiltCompensatedHeading,
  evaluateSensorAccuracy,
  getSensorStatusFromAccuracy,
  SensorVector3D,
} from '../utils/sensorUtils';

export type CompassListener = (data: CompassData) => void;

interface SensorSubscription {
  remove: () => void;
}

class CompassService {
  private magSubscription: SensorSubscription | null = null;
  private accelSubscription: SensorSubscription | null = null;
  private appStateSubscription: SensorSubscription | null = null;


  private listeners: Set<CompassListener> = new Set();

  private latestMag: SensorVector3D = { x: 0, y: 0, z: 0 };
  private latestAccel: SensorVector3D = { x: 0, y: 0, z: 1 }; // Default upright gravity

  private currentSmoothedMagneticHeading: number = 0;
  private declination: number = 0;
  private isAvailable: boolean = false;
  private isRunning: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const magAvailable = await Magnetometer.isAvailableAsync();
      const accelAvailable = await Accelerometer.isAvailableAsync();
      this.isAvailable = magAvailable && accelAvailable;
    } catch (e) {
      this.isAvailable = false;
    }
  }

  public setDeclination(declination: number) {
    this.declination = declination;
  }

  public async start(updateIntervalMs: number = 50) {
    if (this.isRunning) return;

    const magAvailable = await Magnetometer.isAvailableAsync();
    const accelAvailable = await Accelerometer.isAvailableAsync();
    this.isAvailable = magAvailable && accelAvailable;

    if (!this.isAvailable) {
      this.notifyListeners({
        magneticHeading: 0,
        trueHeading: 0,
        heading: 0,
        pitch: 0,
        roll: 0,
        accuracy: 'unreliable',
        sensorStatus: 'unavailable',
        isAvailable: false,
        orientation: 'portrait',
      });
      return;
    }

    Magnetometer.setUpdateInterval(updateIntervalMs);
    Accelerometer.setUpdateInterval(updateIntervalMs);

    this.magSubscription = Magnetometer.addListener((data) => {
      this.latestMag = data;
      this.processSensorReading();
    });

    this.accelSubscription = Accelerometer.addListener((data) => {
      this.latestAccel = data;
      this.processSensorReading();
    });

    // App state listener to pause when backgrounded
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    this.isRunning = true;
  }

  public stop() {
    if (this.magSubscription) {
      this.magSubscription.remove();
      this.magSubscription = null;
    }
    if (this.accelSubscription) {
      this.accelSubscription.remove();
      this.accelSubscription = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.isRunning = false;
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      if (!this.isRunning && this.listeners.size > 0) {
        this.start();
      }
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.stop();
    }
  };

  private processSensorReading() {
    // 1. Calculate tilt-compensated raw magnetic heading
    const { heading: rawMagHeading, pitch, roll } = calculateTiltCompensatedHeading(
      this.latestAccel,
      this.latestMag
    );

    // 2. Adaptive low-pass filter: scale alpha based on angular delta velocity
    // Small delta (holding steady) -> low alpha (0.06) for rock-solid zero jitter
    // Large delta (turning quickly) -> high alpha (0.35) for instantaneous responsiveness
    const delta = Math.abs(shortestAngleDifference(this.currentSmoothedMagneticHeading, rawMagHeading));
    const adaptiveAlpha = Math.min(0.35, Math.max(0.06, delta / 45));

    this.currentSmoothedMagneticHeading = interpolateAngle(
      this.currentSmoothedMagneticHeading,
      rawMagHeading,
      adaptiveAlpha
    );

    const magneticHeading = Math.round(this.currentSmoothedMagneticHeading);
    const trueHeading = Math.round(normalizeAngle(magneticHeading + this.declination));

    // 3. Evaluate sensor accuracy
    const accuracy = evaluateSensorAccuracy(this.latestMag);
    const sensorStatus = getSensorStatusFromAccuracy(accuracy, this.isAvailable);

    const compassData: CompassData = {
      magneticHeading,
      trueHeading,
      heading: magneticHeading, // will be overridden by hook depending on north reference
      pitch: Math.round(pitch),
      roll: Math.round(roll),
      accuracy,
      sensorStatus,
      isAvailable: this.isAvailable,
      orientation: 'portrait',
    };

    this.notifyListeners(compassData);
  }

  public subscribe(listener: CompassListener): () => void {
    this.listeners.add(listener);
    if (!this.isRunning && this.listeners.size > 0) {
      this.start();
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  private notifyListeners(data: CompassData) {
    this.listeners.forEach((listener) => listener(data));
  }
}

export const compassService = new CompassService();
