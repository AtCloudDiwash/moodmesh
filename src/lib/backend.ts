import { Account, Client, Databases, Storage, ID, Permission, Role, Query } from 'appwrite';
import { backendReady, settings } from '../config';
import { Upload } from '../types';

const client = new Client();
if (backendReady) client.setEndpoint(settings.endpoint).setProject(settings.project);
export const account = new Account(client);
export const database = new Databases(client);
export const storage = new Storage(client);
export { ID, Permission, Role, Query };
export async function uploadFile(file: Upload, id: string, permissions: string[]) {
  const response = await fetch(file.uri);
  const blob = await response.blob();
  return storage.createFile(settings.bucket, id, new File([blob], file.name, { type: file.type }), permissions);
}
