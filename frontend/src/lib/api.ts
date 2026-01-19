import { signOut } from "next-auth/react";

export async function fetchApi(url: string, options: RequestInit = {}, accessToken?: string) {
  const headers = new Headers(options.headers || {});
  
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    console.error("Session expired or unauthorized. Logging out...");
    signOut({ callbackUrl: "/login" });
    return null;
  }

  return res;
}
