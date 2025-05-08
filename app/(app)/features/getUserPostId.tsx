import { useEffect, useState } from "react";
import { databases } from "@/lib/appwriteConfig";

const useUserPostIds = () => {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [loadingUserPost, setLoadingUserPost] = useState(true);
  const [errorLoadingPost, setErrorLoadingPost] = useState<null | string>(null);

  useEffect(() => {
    const fetchPostIds = async () => {
      setLoadingUserPost(true);
      setErrorLoadingPost(null);

      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID!
        );

        const ids = response.documents.map((doc) => doc.postId);
        setPostIds(ids);
      } catch (err: any) {
        console.error("Failed to fetch post IDs:", err);
        setErrorLoadingPost("Could not load posts.");
      } finally {
        setLoadingUserPost(false);
      }
    };

    fetchPostIds();
  }, []);

  return { postIds, loadingUserPost, errorLoadingPost };
};

export default useUserPostIds;
