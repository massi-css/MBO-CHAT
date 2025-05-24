import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/layouts/Logo";
import { useUser } from "../hooks/useUser";
import { useKafka } from "@/hooks/useKafka";
import { LoginForm } from "@/components/auth/LoginForm";
import { ConnectionErrorDialog } from "@/components/auth/ConnectionErrorDialog";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUsername, checkUsername } = useUser();
  const { connect } = useKafka();
  const [usernameInput, setUsernameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConnectionError, setShowConnectionError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!usernameInput.trim()) {
        throw new Error("Username is required");
      }

      // Try to connect to Kafka first
      const result = await connect(usernameInput.trim());
      if (!result.success) {
        setShowConnectionError(true);
        return;
      }

      // If connection successful, set username and navigate
      setUsername(usernameInput.trim());
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-6 flex items-center justify-center w-full max-w-xs">
        <Logo flexPosition="center" />
      </div>

      <LoginForm
        error={error}
        isLoading={isLoading}
        usernameInput={usernameInput}
        onUsernameChange={setUsernameInput}
        onSubmit={handleSubmit}
      />

      <ConnectionErrorDialog
        isOpen={showConnectionError}
        onOpenChange={setShowConnectionError}
        onRetry={() => handleSubmit(new Event("submit") as any)}
      />
    </div>
  );
}
