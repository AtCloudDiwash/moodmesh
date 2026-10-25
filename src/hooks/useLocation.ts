import { useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '../types';
export function useLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null),
    [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const locate = async () => {
    if (lock.current) return null;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Location access is off. You can still browse or choose a place manually.');
        return null;
      }
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinates = { latitude: result.coords.latitude, longitude: result.coords.longitude };
      setLocation(coordinates);
      return coordinates;
    } catch {
      setError('Could not find your location. Try again or choose a place manually.');
      return null;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { location, error, busy, locate };
}
