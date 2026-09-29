import { useState, useEffect } from 'react';
import { LocationData } from '../types/compass';
import { getCurrentLocationData, subscribeLocationData } from '../services/locationService';
import { checkLocationPermission, requestLocationPermission } from '../services/permissionService';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshLocation = async () => {
    setIsLoading(true);
    const perm = await checkLocationPermission();
    setHasPermission(perm.granted);

    if (perm.granted) {
      const data = await getCurrentLocationData();
      if (data) {
        setLocation(data);
      }
    }
    setIsLoading(false);
  };

  const askPermission = async (): Promise<boolean> => {
    const perm = await requestLocationPermission();
    setHasPermission(perm.granted);
    if (perm.granted) {
      await refreshLocation();
    }
    return perm.granted;
  };

  useEffect(() => {
    refreshLocation();

    const unsubscribe = subscribeLocationData((data) => {
      setLocation(data);
      setHasPermission(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    location,
    hasPermission,
    isLoading,
    refreshLocation,
    askPermission,
  };
};
