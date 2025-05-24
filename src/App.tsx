import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./components/layouts/MainLayout";
import { MessagesProvider } from "./providers/MessageProvider";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { UserProvider } from "./providers/UserProvider";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  return (
    <UserProvider>
      <MessagesProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/chat/global" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat" element={<MainLayout />}>
              <Route path="global" element={<HomePage />} />
              <Route path=":id" element={<HomePage />} />
            </Route>
            <Route
              path="*"
              element={<ErrorBoundary error={new Error("Page not found")} />}
            />
          </Routes>
        </HashRouter>
      </MessagesProvider>
    </UserProvider>
  );
};

export default App;
