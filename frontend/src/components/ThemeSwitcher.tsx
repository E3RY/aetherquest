import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { THEME_META, type ThemeName, useThemeStore } from "../store/theme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const meta = THEME_META[theme];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 rounded-md text-sm text-text-dim hover:text-text border border-border hover:border-accent/60 transition flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-accent" />
        {meta.label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 rounded-xl bg-surface border border-border shadow-2xl overflow-hidden z-50"
          >
            {(Object.keys(THEME_META) as ThemeName[]).map((name) => {
              const m = THEME_META[name];
              const active = name === theme;
              return (
                <button
                  key={name}
                  onClick={() => {
                    setTheme(name);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-surface-2 transition flex items-start gap-3 ${
                    active ? "bg-surface-2" : ""
                  }`}
                  data-theme={name}
                >
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                  <span>
                    <div className="text-sm text-text font-medium">{m.label}</div>
                    <div className="text-xs text-text-dim">{m.tagline}</div>
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
