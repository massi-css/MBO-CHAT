import { ReactNode, useState } from "react";
import { UserContext } from "../context/UserContext";

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [username, setUsernameState] = useState<string | null>(
    sessionStorage.getItem("username")
  );

  const setUsername = (newUsername: string) => {
    sessionStorage.setItem("username", newUsername);
    setUsernameState(newUsername);
  };

  const checkUsername = (): boolean => {
    return sessionStorage.getItem("username") !== null;
  };

  return (
    <UserContext.Provider value={{ username, setUsername, checkUsername }}>
      {children}
    </UserContext.Provider>
  );
}
