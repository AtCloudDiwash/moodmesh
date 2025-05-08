import { useEffect, useState } from "react";
import { databases } from "@/lib/appwriteConfig";
import { Query } from "appwrite";

const useUserPostIds = (
  page: number = 1,
  limit: number = 10,
  refreshKey?: number
) => {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [loadingUserPost, setLoadingUserPost] = useState(true);
  const [errorLoadingPost, setErrorLoadingPost] = useState<null | string>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPostIds = async () => {
      setLoadingUserPost(true);
      setErrorLoadingPost(null);

      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID!,
          [
            Query.orderDesc("$createdAt"),
            Query.limit(limit),
            Query.offset((page - 1) * limit),
          ]
        );

        const ids = response.documents.map((doc) => doc.postId);
        setPostIds((prev) => (page === 1 ? ids : [...prev, ...ids]));
        setHasMore(response.documents.length === limit);
      } catch (err: any) {
        console.error("Failed to fetch post IDs:", err);
        setErrorLoadingPost("Could not load posts.");
      } finally {
        setLoadingUserPost(false);
      }
    };

    fetchPostIds();
  }, [page, limit, refreshKey]); // 👈 Added refreshKey here

  return { postIds, loadingUserPost, errorLoadingPost, hasMore };
};

export default useUserPostIds;
