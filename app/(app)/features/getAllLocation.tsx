import { useEffect, useState } from "react";
import { databases } from "@/lib/appwriteConfig";

const useAllLocations = (refreshKey: number) => {
  const [postedLocations, setPostedLocations] = useState<string[][]>([]);
  const [postedMoods, setPostedMoods] = useState<string[][]>([]);
  const [allCreators, setAllCreators] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID!
        );

        if (response.total === 0) {
          console.warn("No posts found");
          setPostedLocations([]);
          setPostedMoods([]);
          return;
        }


        const allLocations = response.documents.map((doc) => doc.location);
        const allMoods = response.documents.map((doc) => doc.mood);
        const allCreators = response.documents.map((doc) => doc.username);

        setPostedLocations(allLocations);
        setPostedMoods(allMoods);
        setAllCreators(allCreators);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, [refreshKey]);

  return { postedLocations, postedMoods, allCreators, loading, error };
};

export default useAllLocations;
