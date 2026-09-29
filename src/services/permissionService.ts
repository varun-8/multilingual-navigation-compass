import * as Location from 'expo-location';

export interface PermissionStatusResult {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export const checkLocationPermission = async (): Promise<PermissionStatusResult> => {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
      status,
    };
  } catch (error) {
    console.warn('[PermissionService] Error checking location permission:', error);
    return { granted: false, canAskAgain: true, status: 'undetermined' };
  }
};

export const requestLocationPermission = async (): Promise<PermissionStatusResult> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
      status,
    };
  } catch (error) {
    console.warn('[PermissionService] Error requesting location permission:', error);
    return { granted: false, canAskAgain: true, status: 'denied' };
  }
};
