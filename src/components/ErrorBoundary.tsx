import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-6 p-8">
            <h1 className="text-4xl font-bold text-gray-900">Page not found</h1>
            <p className="text-lg text-gray-600">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="space-x-4">
              <Button onClick={() => window.history.back()}>Go Back</Button>
              <Button variant="outline" asChild>
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-6 p-8">
            <h1 className="text-4xl font-bold text-gray-900">Unauthorized</h1>
            <p className="text-lg text-gray-600">
              Please sign in to access this page.
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {error.status} - {error.statusText}
          </h1>
          <p className="text-lg text-gray-600">
            {error.data?.message ||
              "An error occurred while processing your request."}
          </p>
          <div className="space-x-4">
            <Button onClick={() => window.history.back()}>Go Back</Button>
            <Button variant="outline" asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // For non-route errors (runtime errors)
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="text-lg text-gray-600">{errorMessage}</p>
        <div className="space-x-4">
          <Button onClick={() => window.history.back()}>Go Back</Button>
          <Button variant="outline" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
