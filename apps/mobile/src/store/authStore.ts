import { create } from 'zustand';
import { storage } from '../services/storage';
import { setApiToken, type AuthUser, type AuthResponse, type NucleoType } from '../services/api';

type Status = 'loading' | 'unauth' | 'authed';

interface AuthState {
  status: Status;
  user: AuthUser | null;
  refreshToken: string | null;
  hydrate: () => Promise<void>;
  setAuth: (res: AuthResponse) => Promise<void>;
  applyNucleo: (nucleoType: NucleoType) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  refreshToken: null,

  hydrate: async () => {
    const session = await storage.loadSession();
    if (session) {
      setApiToken(session.accessToken);
      set({
        status: 'authed',
        user: session.user as AuthUser,
        refreshToken: session.refreshToken,
      });
    } else {
      set({ status: 'unauth' });
    }
  },

  setAuth: async (res) => {
    setApiToken(res.tokens.accessToken);
    await storage.saveSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
    set({ status: 'authed', user: res.user, refreshToken: res.tokens.refreshToken });
  },

  applyNucleo: async (nucleoType) => {
    const { user, refreshToken } = get();
    if (!user) return;
    const updated = { ...user, nucleoType };
    const session = await storage.loadSession();
    if (session) {
      await storage.saveSession(session.accessToken, session.refreshToken, updated);
    }
    set({ user: updated, refreshToken });
  },

  logout: async () => {
    setApiToken(null);
    await storage.clear();
    set({ status: 'unauth', user: null, refreshToken: null });
  },
}));
