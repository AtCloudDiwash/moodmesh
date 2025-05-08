import { Client, Account, Databases, Storage } from "appwrite";
import { Platform } from "react-native";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);
  

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

export { account, databases, storage };
