import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import '../global.css';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const { accessToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'modal';

    if (!accessToken && inAuthGroup) {
      router.replace('/login');
    } else if (accessToken && segments[0] !== '(tabs)') {
      router.replace('/(tabs)');
    }
  }, [accessToken, segments]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Details' }} />
    </Stack>
  );
}
