import { useState, useEffect } from 'react';
import { CompassData, NorthReference, HeadingLockState } from '../types/compass';
import { compassService } from '../services/compassService';
import { shortestAngleDifference } from '../utils/angleUtils';
import { loadUserPreferences, saveUserPreferences } from '../services/storageService';

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

export const useCompass = (declination: number = 0) => {
  const [compassData, setCompassData] = useState<CompassData>(initialCompassData);
  const [northReference, setNorthReferenceState] = useState<NorthReference>('magnetic');
  const [lockState, setLockState] = useState<HeadingLockState>({
    isLocked: false,
    lockedHeading: null,
  });
  const [debugMode, setDebugModeState] = useState<boolean>(false);

  useEffect(() => {
    loadUserPreferences().then((prefs) => {
      if (prefs.northReference) setNorthReferenceState(prefs.northReference);
      if (prefs.debugMode !== undefined) setDebugModeState(prefs.debugMode);
    });
  }, []);

  useEffect(() => {
    compassService.setDeclination(declination);
  }, [declination]);

  useEffect(() => {
    const unsubscribe = compassService.subscribe((data) => {
      const activeHeading =
        northReference === 'true' ? data.trueHeading : data.magneticHeading;

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
    lockState,
    toggleHeadingLock,
    headingDifference,
    debugMode,
    setDebugMode,
  };
};
