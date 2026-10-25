import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Upload } from '../types';
import { MAX_IMAGE_BYTES } from './validation';

export async function preparePhoto(asset: ImagePickerAsset): Promise<Upload> {
  if (asset.fileSize && asset.fileSize > 25 * 1024 * 1024)
    throw new Error('Choose an image smaller than 25 MB.');
  const resize =
    asset.width >= asset.height
      ? { width: Math.min(asset.width, 1600) }
      : { height: Math.min(asset.height, 1600) };
  // Re-encode to JPEG to normalize file types, reduce upload size, and omit source EXIF.
  const image = await ImageManipulator.manipulateAsync(asset.uri, [{ resize }], {
    compress: 0.82,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  let size: number;
  if (Platform.OS === 'web') size = (await (await fetch(image.uri)).blob()).size;
  else {
    const info = await FileSystem.getInfoAsync(image.uri);
    size = info.exists && !info.isDirectory ? info.size : 0;
  }
  if (!size || size > MAX_IMAGE_BYTES)
    throw new Error('This photo is too large. Choose a smaller image.');
  return { uri: image.uri, name: 'moodmesh-' + Date.now() + '.jpg', type: 'image/jpeg', size };
}
