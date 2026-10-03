import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { CompassData, NorthReference, HeadingLockState } from '../types/compass';
import { compassService } from '../services/compassService';
import { shortestAngleDifference } from '../utils/angleUtils';
import { loadUserPreferences, saveUserPreferences } from '../services/storageService';
import { calculateSolarData, SolarData } from '../utils/sunUtils';

const initialCompassData: CompassData = {
  magneticHeading: 0,
  trueHeading: 0,
  heading: 0,
  pitch: 0,
  roll: 0,
  accuracy: 'unknown',
  sensorStatus: 'ready',
  isAvailable: true,
  orientation: 'portrait',
};

export const useCompass = (lat: number = 0, lon: number = 0, declination: number = 0) => {
  const [compassData, setCompassData] = useState<CompassData>(initialCompassData);
  const [northReference, setNorthReferenceState] = useState<NorthReference>('magnetic');
  const [nightVision, setNightVisionState] = useState<boolean>(false);
  const [lockState, setLockState] = useState<HeadingLockState>({
    isLocked: false,
    lockedHeading: null,
  });
  const [debugMode, setDebugModeState] = useState<boolean>(false);
  const [solarData, setSolarData] = useState<SolarData | null>(null);

  const lastCardinalRef = useRef<number>(-1);

  useEffect(() => {
    loadUserPreferences().then((prefs) => {
      if (prefs.northReference) setNorthReferenceState(prefs.northReference);
      if (prefs.debugMode !== undefined) setDebugModeState(prefs.debugMode);
    });
  }, []);

  useEffect(() => {
    compassService.setDeclination(declination);
  }, [declination]);

  // Compute solar data when location changes or on interval
  useEffect(() => {
    const updateCalculations = () => {
      if (lat !== 0 || lon !== 0) {
        setSolarData(calculateSolarData(lat, lon));
      } else {
        // Default calculation for fallback
        setSolarData(calculateSolarData(28.6139, 77.2090));
      }
    };

    updateCalculations();
    const interval = setInterval(updateCalculations, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [lat, lon]);

  useEffect(() => {
    const unsubscribe = compassService.subscribe((data) => {
      const activeHeading =
        northReference === 'true' ? data.trueHeading : data.magneticHeading;

      // Haptic tick when passing cardinal directions (0, 90, 180, 270)
      const currentCardinalSector = Math.floor((activeHeading + 2.5) / 90) % 4;
      if (lastCardinalRef.current !== -1 && lastCardinalRef.current !== currentCardinalSector) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
      }
      lastCardinalRef.current = currentCardinalSector;

      setCompassData({
        ...data,
        heading: activeHeading,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [northReference]);

  const setNorthReference = async (ref: NorthReference) => {
    setNorthReferenceState(ref);
    await saveUserPreferences({ northReference: ref });
  };

  const toggleNightVision = () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    setNightVisionState((prev) => !prev);
  };

  const toggleHeadingLock = () => {
    if (lockState.isLocked) {
      setLockState({ isLocked: false, lockedHeading: null });
    } else {
      setLockState({ isLocked: true, lockedHeading: compassData.heading });
    }
  };

  const setDebugMode = async (enabled: boolean) => {
    setDebugModeState(enabled);
    await saveUserPreferences({ debugMode: enabled });
  };

  const headingDifference =
    lockState.isLocked && lockState.lockedHeading !== null
      ? shortestAngleDifference(lockState.lockedHeading, compassData.heading)
      : 0;

  return {
    compassData,
    northReference,
    setNorthReference,
    nightVision,
    toggleNightVision,
    lockState,
    toggleHeadingLock,
    headingDifference,
    debugMode,
    setDebugMode,
    solarData,
  };
};
