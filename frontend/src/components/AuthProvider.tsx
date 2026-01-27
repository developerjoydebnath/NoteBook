'use client';

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import { getSession, SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { SWRConfig } from 'swr';

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

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          fetcher: (url: string) => axiosInstance.get(url).then(res => res.data)
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
