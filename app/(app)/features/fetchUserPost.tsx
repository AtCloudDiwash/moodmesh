import { useEffect, useState } from "react";
import { databases, storage } from "@/lib/appwriteConfig";
import { Query } from "appwrite";

const useUserPost = (postId: string, refreshKey?:number) => {
  const [post, setPost] = useState<any>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID!,
          [Query.equal("postId", postId)]
        );

        if (response.total === 0) {
          console.warn("No post found with postId:", postId);
          return;
        }

        const postData = response.documents[0];
        setPost(postData);

        // Generate public URLs for each file in the img_urls array
        const urls = postData.img_urls.map((fileId: string) => {
          return `https://fra.cloud.appwrite.io/v1/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_USERPOST_IMAGES_BUCKET_ID}/files/${fileId}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
        });

        setImageUrls(urls);
      } catch (error) {
        console.log("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId, refreshKey]);

  return { post, imageUrls };
};

export default useUserPost;
