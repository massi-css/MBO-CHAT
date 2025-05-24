import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ErrorAlert } from "./ErrorAlert";

interface LoginFormProps {
  error: string;
  isLoading: boolean;
  usernameInput: string;
  onUsernameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  error,
  isLoading,
  usernameInput,
  onUsernameChange,
  onSubmit,
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter a name to join the chat</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 px-8">
          {error && <ErrorAlert message={error} />}
          <div className="gap-4 flex items-center">
            <Label htmlFor="username">Username :</Label>
            <Input
              className="flex-1 text-black dark:text-white border-0 bg-slate-200 focus-visible:ring-blue-500"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={usernameInput}
              onChange={(e) => onUsernameChange(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Chat"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
