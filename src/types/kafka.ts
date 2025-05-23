export interface ChatMessage {
  username: string;
  content: string;
  timestamp: number;
}

export interface DirectMessage extends ChatMessage {
  to: string;
}

export interface UserStatusMessage {
  username: string;
  consumerId: string;
  dmList: [string, string][]; // Array of [username, consumerId] pairs
}
