import { Client, Account } from "appwrite";
import { Platform } from "react-native";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);
  


const account = new Account(client);

export { account };
