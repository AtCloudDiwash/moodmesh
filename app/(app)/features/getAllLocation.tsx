import { useEffect, useState } from "react";
import { databases } from "@/lib/appwriteConfig";

const useAllLocations = () => {
  const [postedLocations, setPostedLocations] = useState<string[][]>([]);
  const [postedMoods, setPostedMoods] = useState<string[][]>([]);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID!
        );

        if (response.total === 0) {
          console.warn("No posts found");
          return;
        }

        const allLocations = response.documents.map((doc) => doc.location);
        const allMoods = response.documents.map((doc) => doc.mood);

        setPostedLocations(allLocations);
        setPostedMoods(allMoods);
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    fetchAllPosts();
  }, []);
  return { postedLocations, postedMoods };
};

export default useAllLocations;
