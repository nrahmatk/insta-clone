import { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export const authContext = createContext(null);

export default function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usernameLogin, setUsernameLogin] = useState("");

  const checkLogin = async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      const username = await SecureStore.getItemAsync("username");
      setIsSignedIn(!!token);
      setUsernameLogin(username || null);
    } catch (error) {
      console.error("Error checking login status", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("username");
    setIsSignedIn(false);
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <authContext.Provider
      value={{
        isSignedIn,
        setIsSignedIn,
        loading,
        usernameLogin,
        setUsernameLogin,
        logout,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
