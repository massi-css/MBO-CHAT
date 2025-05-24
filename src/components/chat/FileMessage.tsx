import React from "react";
import { PaperclipIcon } from "lucide-react";
import { FileContent } from "@/types/kafka";

interface FileMessageProps {
  fileContent: FileContent;
  isCurrentUser: boolean;
}

export const FileMessage: React.FC<FileMessageProps> = ({
  fileContent,
  isCurrentUser,
}) => {
  const { mimeType, data, filename, isChunked } = fileContent;

  if (isChunked) {
    return (
      <div className="text-sm italic">
        {isCurrentUser ? "Sending" : "Receiving"} {filename}...
      </div>
    );
  }

  if (mimeType.startsWith("image/")) {
    return (
      <img
        src={`data:${mimeType};base64,${data}`}
        alt={filename}
        className="max-w-full rounded-lg"
        style={{ maxHeight: "200px" }}
      />
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <video
        controls
        className="max-w-full rounded-lg"
        style={{ maxHeight: "300px" }}
      >
        <source src={`data:${mimeType};base64,${data}`} type={mimeType} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg ${
        isCurrentUser
          ? "bg-white/20 hover:bg-white/30"
          : "bg-blue-500/10 hover:bg-blue-500/20"
      } transition-colors`}
    >
      <PaperclipIcon
        className={`h-4 w-4 ${
          isCurrentUser ? "text-white/80" : "text-blue-500"
        }`}
      />
      <a
        href={`data:${mimeType};base64,${data}`}
        download={filename}
        className={`text-sm ${
          isCurrentUser
            ? "text-white/90 hover:text-white"
            : "text-blue-600 hover:text-blue-700"
        } font-medium hover:underline transition-colors`}
      >
        {filename}
      </a>
    </div>
  );
};
