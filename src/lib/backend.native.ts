import 'react-native-url-polyfill/auto';
import {
  Account,
  Client,
  Databases,
  Storage,
  Functions,
  ID,
  Permission,
  Role,
  Query,
} from 'react-native-appwrite';
import { backendReady, settings } from '../config';
import { Upload } from '../types';

const client = new Client();
if (backendReady)
  client
    .setEndpoint(settings.endpoint)
    .setProject(settings.project)
    .setPlatform('com.diwashkuskusmiya.MoodMesh');
export const account = new Account(client);
export const database = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export { ID, Permission, Role, Query };
export async function uploadFile(file: Upload, id: string, permissions: string[]) {
  return storage.createFile(settings.bucket, id, file, permissions);
}
