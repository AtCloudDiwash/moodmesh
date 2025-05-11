import { useContext, createContext, useState, useEffect } from "react";
import { Text, SafeAreaView } from "react-native";
import { account } from "@/lib/appwriteConfig";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(false);
  const [user, setUser] = useState<null | boolean>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    checkAuth();
  };

  const checkAuth = async () => {
    try {
      const responseSession = await account.getSession("current");
      setSession(responseSession);
      const responseUser = await account.get();

      setUser(responseUser);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const responseSession = await account.createEmailPasswordSession(
        email,
        password
      );
      setSession(responseSession);
      const responseUser = await account.get();
      setUser(responseUser);
    } catch (error) {
      if (error.response) {
        console.error("API error response:", error.response);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    setLoading(false);
  };

  const signout = async () => {
    setLoading(true);
    account.deleteSession("current");
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  const contextData = { session, user, login, signout };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
          <Text style={{color:"white"}}>moodmesh loading...</Text>
        </SafeAreaView>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { useAuth, AuthContext, AuthProvider };
