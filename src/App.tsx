import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./components/layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { UserProvider } from "./providers/UserProvider";
import { HashRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <UserProvider>
      <HashRouter>
        <Routes>
          {/* Define your routes here */}
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          {/* the rest will return error boundary */}
          <Route path="*" element={<ErrorBoundary />} />
        </Routes>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
