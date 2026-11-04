import { create } from "zustand";
import { persist } from "zustand/middleware";

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: ({ accessToken, user }) => set({ accessToken, user }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "fiano-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && isTokenExpired(state.accessToken)) {
          state.clearAuth();
        }
      },
    },
  ),
);
