import * as ImagePicker from "expo-image-picker";
import { ID } from "appwrite";

const uploadImages = async (assets: ImagePicker.ImagePickerAsset[]) => {
  const uploaded = [];

  for (const asset of assets) {
    try {
      const fileId = ID.unique();

      const formData = new FormData();
      formData.append("fileId", fileId); // 👈 REQUIRED
      formData.append("file", {
        uri: asset.uri,
        name: asset.fileName || `upload-${fileId}.jpg`,
        type: asset.mimeType || "image/jpeg",
      } as any);

      const result = await fetch(
        `https://fra.cloud.appwrite.io/v1/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_USERPOST_IMAGES_BUCKET_ID}/files`,
        {
          method: "POST",
          headers: {
            "X-Appwrite-Project": process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!result.ok) {
        const error = await result.text();
        console.error("Failed to upload:", error);
        throw new Error(error);
      }

      const resJson = await result.json();
      console.log("Upload success:", resJson);
      uploaded.push(resJson.$id);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  }

  return uploaded;
};

export {uploadImages}
