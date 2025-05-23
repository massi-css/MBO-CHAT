import { createContext } from "react";

export interface UserContextType {
  username: string | null;
  setUsername: (username: string) => void;
  checkUsername: () => boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
