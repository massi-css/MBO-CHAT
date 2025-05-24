import React from "react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
      {message}
    </div>
  );
};
