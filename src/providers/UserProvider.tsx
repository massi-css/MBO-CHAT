import { ReactNode, useState } from "react";
import { UserContext } from "../context/UserContext";

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [username, setUsernameState] = useState<string | null>(
    sessionStorage.getItem("username")
  );
  const [isConnected, setIsConnected] = useState(false);

  const setUsername = (newUsername: string) => {
    sessionStorage.setItem("username", newUsername);
    setUsernameState(newUsername);
  };

  const checkUsername = (): boolean => {
    return sessionStorage.getItem("username") !== null;
  };

  const connect = async (name: string): Promise<{ success: boolean }> => {
    try {
      const result = await window.kafka.init(name);
      if (result.success) {
        setIsConnected(true);
      }
      return result;
    } catch (error) {
      console.error("Failed to connect to Kafka:", error);
      return { success: false };
    }
  };

  return (
    <UserContext.Provider
      value={{ username, setUsername, checkUsername, isConnected, connect }}
    >
      {children}
    </UserContext.Provider>
  );
}
