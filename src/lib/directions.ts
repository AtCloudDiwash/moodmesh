import { Linking } from 'react-native';
import { Coordinates } from '../types';
import { validCoordinates } from './validation';
export async function openDirections(location: Coordinates | null) {
  if (!validCoordinates(location))
    throw new Error('This place does not have a valid map location.');
  await Linking.openURL(
    'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(location.latitude + ',' + location.longitude),
  );
}
