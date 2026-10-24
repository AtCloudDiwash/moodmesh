import { useState, useEffect } from "react";
import { databases } from "@/lib/appwriteConfig";
import { Query } from "appwrite";

const useLeaguesInformation = (
  page: number = 1,
  limit: number = 10,
  refreshKey: any = null
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true);
      setHasMore(true); // Reset hasMore when refreshing

      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_LEAGUES_COLLECTION_ID!,
           [
             Query.orderDesc("$createdAt"),
             Query.limit(limit),
             Query.offset((page - 1) * limit),
           ]
        );

        // If the response has fewer documents than `limit`, it means no more data
        setHasMore(response.documents.length === limit);

        if (page === 1) {
          setData(response.documents); // Reset data when refreshing
        } else {
          setData((prevData) => [...prevData, ...response.documents]); // Append to existing data
        }
      } catch (err) {
        setError("Failed to fetch leagues information");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [page, limit, refreshKey]); // Refetch when `page`, `limit`, or `refreshKey` changes

  return { data, loading, error, hasMore };
};

export default useLeaguesInformation;
