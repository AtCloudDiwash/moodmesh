import { useState, useEffect } from "react";
import { databases } from "@/lib/appwriteConfig";


const useLeagueDetails = (
  league_id: string | undefined,
  refreshKey: number
) => {
  const [data, setData] = useState<LeagueDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!league_id) return;

    const fetchLeagueDetails = async () => {
      setLoading(true);
      try {
        const response = await databases.getDocument(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_LEAGUES_COLLECTION_ID!,
          league_id
        );
        console.log(response)

        setData({
          title: response.title,
          description: response.description,
          end_time: response.end_time,
          author: response.author,
        });
        setError(null); // Clear error if fetch succeeds
      } catch (error) {
        console.error("Fetch League Error:", error);
        setError("Failed to fetch league details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [league_id, refreshKey]); // 👈 refreshKey added here

  return { data, loading, error };
};

export default useLeagueDetails;
