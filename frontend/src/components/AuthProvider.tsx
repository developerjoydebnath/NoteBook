'use client';

import { useAuthStore } from "@/store/useAuthStore";
import { getSession, SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const initAuth = async () => {
      const session = await getSession();
      if (session?.user) {
        setAuth(session.user, (session as any).accessToken);
      }
    };
    initAuth();
  }, [setAuth]);

  return <SessionProvider>{children}</SessionProvider>;
}
