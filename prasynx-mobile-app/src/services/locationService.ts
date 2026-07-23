import * as Location from 'expo-location';

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function getCurrentAddress(): Promise<string | null> {
  try {
    const location = await getCurrentLocation();
    if (!location) return null;

    const addresses = await Location.reverseGeocodeAsync(location);
    if (addresses.length > 0) {
      const addr = addresses[0];
      return [addr.street, addr.city, addr.region, addr.country].filter(Boolean).join(', ');
    }
    return null;
  } catch {
    return null;
  }
}
