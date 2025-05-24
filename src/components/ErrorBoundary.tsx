import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface CustomError extends Error {
  status?: number;
  statusText?: string;
  data?: {
    message?: string;
  };
}

interface ErrorBoundaryProps {
  error?: CustomError;
}

export default function ErrorBoundary({ error }: ErrorBoundaryProps) {
  if (!error) {
    return null;
  }

  let title = "Something went wrong";
  let message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  let actions = (
    <>
      <Button onClick={() => window.history.back()}>Go Back</Button>
      <Button variant="outline" asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </>
  );

  if ("status" in error) {
    if (error.status === 404) {
      title = "Page not found";
      message = "Sorry, we couldn't find the page you're looking for.";
    } else if (error.status === 401) {
      title = "Unauthorized";
      message = "Please sign in to access this page.";
      actions = (
        <Button asChild>
          <Link to="/login">Sign In</Link>
        </Button>
      );
    } else {
      title = `${error.status} - ${error.statusText}`;
      message =
        error.data?.message ||
        "An error occurred while processing your request.";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        <p className="text-lg text-gray-600">{message}</p>
        <div className="space-x-4">{actions}</div>
      </div>
    </div>
  );
}
