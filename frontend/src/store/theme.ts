import { create } from "zustand";

export type ThemeName = "classic_fantasy" | "pirate" | "futuristic" | "post_apoc";

export const THEME_META: Record<ThemeName, { label: string; tagline: string }> = {
  classic_fantasy: { label: "Classic Fantasy", tagline: "Dragons, dungeons, arcane fire." },
  pirate: { label: "High Seas", tagline: "Cursed tides, kraken-haunted depths." },
  futuristic: { label: "Neon Frontier", tagline: "Mech suits, neon stations, alien factions." },
  post_apoc: { label: "Scorched Earth", tagline: "Ruins, raiders, and rusted hope." },
};

interface ThemeState {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const KEY = "aetherquest.theme";

const initial: ThemeName =
  (typeof localStorage !== "undefined" && (localStorage.getItem(KEY) as ThemeName)) || "classic_fantasy";

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initial,
  setTheme: (t) => {
    localStorage.setItem(KEY, t);
    set({ theme: t });
  },
}));
