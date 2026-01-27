import axiosInstance from "./axiosInstance";

export async function fetchApi(url: string, options: RequestInit = {}) {
  try {
    const res = await axiosInstance({
      url,
      method: options.method || 'GET',
      data: options.body,
      headers: options.headers as any,
    });
    return {
      ok: true,
      status: res.status,
      json: async () => res.data,
    } as any;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
       // Handled by NextAuth session refresh or signout if needed
       // But axiosInstance doesn't handle signout yet.
    }
    return {
      ok: false,
      status: error.response?.status,
      json: async () => error.response?.data,
    } as any;
  }
}
