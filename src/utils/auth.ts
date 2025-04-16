import useUserStore from '@/stores/user';

const TOKEN_KEY = 'user-storage';

export function getToken(): string | null {
  try {
    const userState = JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}');
    return userState.state?.token || null;
  } catch (error) {
    return null;
  }
}

export function getUserId(): string | null {
  try {
    const userState = JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}');
    return userState.state?.userInfo?.uid || null;
  } catch (error) {
    return null;
  }
}

export function setToken(token: string): void {
  useUserStore.getState().setToken(token);
}

export function removeToken(): void {
  useUserStore.getState().clearUser();
}

export function getAuthHeader(): { Authorization?: string } {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
