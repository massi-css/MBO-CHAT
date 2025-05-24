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
    <div className="flex items-center gap-2">
      <PaperclipIcon className="h-4 w-4" />
      <a
        href={`data:${mimeType};base64,${data}`}
        download={filename}
        className={`${
          isCurrentUser ? "text-white" : "text-blue-500"
        } hover:underline`}
      >
        {filename}
      </a>
    </div>
  );
};
