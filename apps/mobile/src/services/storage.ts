import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'vonue.accessToken',
  refreshToken: 'vonue.refreshToken',
  user: 'vonue.user',
} as const;

// SecureStore não existe na web. Usa localStorage no navegador e o
// keychain seguro no nativo — mesma interface.
const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storage = {
  async saveSession(accessToken: string, refreshToken: string, user: unknown) {
    await Promise.all([
      setItem(KEYS.accessToken, accessToken),
      setItem(KEYS.refreshToken, refreshToken),
      setItem(KEYS.user, JSON.stringify(user)),
    ]);
  },

  async loadSession() {
    const [accessToken, refreshToken, rawUser] = await Promise.all([
      getItem(KEYS.accessToken),
      getItem(KEYS.refreshToken),
      getItem(KEYS.user),
    ]);
    if (!accessToken || !refreshToken || !rawUser) return null;
    return { accessToken, refreshToken, user: JSON.parse(rawUser) };
  },

  async clear() {
    await Promise.all([
      removeItem(KEYS.accessToken),
      removeItem(KEYS.refreshToken),
      removeItem(KEYS.user),
    ]);
  },
};
