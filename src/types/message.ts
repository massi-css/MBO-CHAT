export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isCurrentUser: boolean;
  isSystemMessage?: boolean;
}
