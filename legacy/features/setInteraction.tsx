import { useState, useCallback, useEffect } from "react";
import { databases } from "@/lib/appwriteConfig";
import { useAuth } from "@/context/authContext";
import { Query } from "appwrite";

interface LikeInteraction {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  toggleLike: () => Promise<void>;
  error: string | null;
}

const useLikeInteraction = (
  postId: string,
  initialLikeCount: number,
  initialLikedBy: string[] = []
): LikeInteraction => {
  const { user } = useAuth() as { user: { name: string } };

  const [isLiked, setIsLiked] = useState(() =>
    initialLikedBy.includes(user?.name ?? "")
  );
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setIsLiked(initialLikedBy.includes(user.name));
    }
  }, [initialLikedBy, user?.name]);

  const toggleLike = useCallback(async () => {
    if (isLiking || !user?.name) return;

    setIsLiking(true);
    setError(null);

    try {
      // Fetch latest document to avoid stale data
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID!,
        [Query.equal("postId", postId)]
      );

      const document = response.documents[0];
      const documentId = document.$id;
      const likedBy: string[] = document.liked_by || [];
      const isUserLiked = likedBy.includes(user.name);

      let updatedLikedBy: string[] = [];
      let updatedLikeCount: number = document.like_counts;

      if (isUserLiked) {
        // User already liked — unlike it
        updatedLikedBy = likedBy.filter((name) => name !== user.name);
        updatedLikeCount = Math.max(0, updatedLikeCount - 1);
        setIsLiked(false);
        setLikeCount(updatedLikeCount);
      } else {
        // User hasn't liked — add like
        updatedLikedBy = [...likedBy, user.name];
        updatedLikeCount += 1;
        setIsLiked(true);
        setLikeCount(updatedLikeCount);
      }

      // Update Appwrite DB
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID!,
        documentId,
        {
          liked_by: updatedLikedBy,
          like_counts: updatedLikeCount,
        }
      );
    } catch (err) {
      console.error("[useLikeInteraction] Error updating like:", err);
      setError("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  }, [postId, isLiking, user?.name]);

  return { isLiked, likeCount, isLiking, toggleLike, error };
};

export default useLikeInteraction;
