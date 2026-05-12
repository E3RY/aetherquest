import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clear: () => void;
  hydrate: () => void;
}

const KEY = "aetherquest.tokens";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (access, refresh) => {
    localStorage.setItem(KEY, JSON.stringify({ access, refresh }));
    set({ accessToken: access, refreshToken: refresh });
  },
  clear: () => {
    localStorage.removeItem(KEY);
    set({ accessToken: null, refreshToken: null });
  },
  hydrate: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const { access, refresh } = JSON.parse(raw);
      if (access && refresh) set({ accessToken: access, refreshToken: refresh });
    } catch {
      /* ignore */
    }
  },
}));
