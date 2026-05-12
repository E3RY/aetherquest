import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useThemeStore } from "./store/theme";
import { useAuthStore } from "./store/auth";
import { AppShell } from "./components/AppShell";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { CharacterCreate } from "./pages/CharacterCreate";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/characters/new"
          element={
            <RequireAuth>
              <CharacterCreate />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
