export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isCurrentUser: boolean;
  isSystemMessage?: boolean;
  fileContent?: {
    filename: string;
    data: string; // Base64 encoded file data
    mimeType: string;
    fileId?: string;
    chunkIndex?: number;
    totalChunks?: number;
    isChunked?: boolean;
  };
  type: "text" | "file";
}
