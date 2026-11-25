import { useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { getMe } from "../api/profileApi";

export const useProfile = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    const controller = new AbortController();

    getMe({ signal: controller.signal })
      .then(updateUser)
      .catch(() => {});

    return () => controller.abort();
  }, [updateUser]);

  return user;
};
