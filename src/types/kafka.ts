export interface FileContent {
  filename: string;
  data: string; // Base64 encoded file data
  mimeType: string;
  fileId?: string;
  chunkIndex?: number;
  totalChunks?: number;
  isChunked?: boolean;
}

export interface ChatMessage {
  username: string;
  content: string | FileContent;
  type: "text" | "file";
  timestamp: number;
}

export interface DirectMessage {
  from: string;
  to: string;
  content: string | FileContent;
  type: "text" | "file";
  timestamp: number;
}

export interface UserStatusMessage {
  username: string;
  consumerId: string;
  dmList: [string, string][]; // Array of [username, consumerId] pairs
}
