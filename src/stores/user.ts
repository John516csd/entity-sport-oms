import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/services/user';

type UserInfo = User & {
  access_token: string;
  token_type: string;
};

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  setToken: (token: string) => void;
  setUserInfo: (userInfo: UserInfo) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      setToken: (token: string) => set({ token }),
      setUserInfo: (userInfo: UserInfo) => {
        set({ userInfo });
      },
      clearUser: () => set({ token: null, userInfo: null }),
    }),
    {
      name: 'user-storage',
    },
  ),
);

export default useUserStore;
