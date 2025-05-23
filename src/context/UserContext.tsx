import { createContext } from "react";

export interface UserContextType {
  username: string | null;
  setUsername: (username: string) => void;
  checkUsername: () => boolean;
  isConnected: boolean;
  connect: (name: string) => Promise<{ success: boolean }>;
  initialActiveUsers: Map<string, string>;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
