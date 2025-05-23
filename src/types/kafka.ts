export interface ChatMessage {
  username: string;
  content: string;
  timestamp: number;
}

export interface DirectMessage {
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

export interface UserStatusMessage {
  username: string;
  consumerId: string;
  dmList: [string, string][]; // Array of [username, consumerId] pairs
}
