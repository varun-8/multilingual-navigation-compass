import * as Location from 'expo-location';
import { LocationData } from '../types/compass';
import { calculateMagneticDeclination } from '../utils/geomagneticUtils';

export const getCurrentLocationData = async (): Promise<LocationData | null> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    const declination = calculateMagneticDeclination(lat, lon);

    return {
      latitude: lat,
      longitude: lon,
      altitude: location.coords.altitude != null ? Math.round(location.coords.altitude) : null,
      accuracy: location.coords.accuracy != null ? Math.round(location.coords.accuracy) : null,
      heading: location.coords.heading != null ? Math.round(location.coords.heading) : null,
      declination,
    };
  } catch (error) {
    console.warn('[LocationService] Error fetching location:', error);
    return null;
  }
};

export const subscribeLocationData = (
  onLocation: (data: LocationData) => void,
  onError?: (err: any) => void
): (() => void) => {
  let subscription: Location.LocationSubscription | null = null;

  (async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          const lat = loc.coords.latitude;
          const lon = loc.coords.longitude;
          const declination = calculateMagneticDeclination(lat, lon);

          onLocation({
            latitude: lat,
            longitude: lon,
            altitude: loc.coords.altitude != null ? Math.round(loc.coords.altitude) : null,
            accuracy: loc.coords.accuracy != null ? Math.round(loc.coords.accuracy) : null,
            heading: loc.coords.heading != null ? Math.round(loc.coords.heading) : null,
            declination,
          });
        }
      );
    } catch (err) {
      if (onError) onError(err);
    }
  })();

  return () => {
    if (subscription) {
      subscription.remove();
    }
  };
};
