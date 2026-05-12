import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/auth";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function AppShell({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/60 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-2 grid place-items-center text-bg font-bold shadow-[var(--glow)]"
            >
              <span className="font-display text-lg">Æ</span>
            </motion.div>
            <span className="font-display text-xl tracking-wider text-text">Aetherquest</span>
          </Link>

          <nav className="flex items-center gap-2">
            {token ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm transition ${
                      isActive ? "bg-surface-2 text-text" : "text-text-dim hover:text-text"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/campaigns"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm transition ${
                      isActive ? "bg-surface-2 text-text" : "text-text-dim hover:text-text"
                    }`
                  }
                >
                  Campaigns
                </NavLink>
                <NavLink
                  to="/characters/new"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm transition ${
                      isActive ? "bg-surface-2 text-text" : "text-text-dim hover:text-text"
                    }`
                  }
                >
                  New Character
                </NavLink>
                <ThemeSwitcher />
                <button
                  onClick={() => {
                    clear();
                    navigate("/");
                  }}
                  className="ml-2 px-3 py-1.5 rounded-md text-sm text-text-dim hover:text-danger transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <ThemeSwitcher />
                <Link to="/login" className="px-3 py-1.5 rounded-md text-sm text-text-dim hover:text-text">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="ml-1 px-4 py-1.5 rounded-md text-sm font-medium bg-accent text-bg hover:brightness-110 transition shadow-[var(--glow)]"
                >
                  Start
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">{children}</main>

      <footer className="border-t border-border py-4 text-center text-text-dim text-xs">
        Aetherquest · local AI · self-hosted · MIT
      </footer>
    </div>
  );
}
