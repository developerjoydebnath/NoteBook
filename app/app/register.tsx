import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Link, useRouter } from 'expo-router';
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-grow p-6 justify-center">
        <View className="mb-8 items-center">
          <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4">
            <User size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold">Create Account</Text>
          <Text className="text-muted-foreground text-center mt-2">
            Join us to start managing your daily workflow efficiently
          </Text>
        </View>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your details to create an account</CardDescription>
          </CardHeader>
          <CardContent className="gap-y-4">
            {error ? (
              <View className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <Text className="text-destructive text-sm text-center font-medium">{error}</Text>
              </View>
            ) : null}

            <View className="gap-y-2">
              <Label nativeID="name">Full Name</Label>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <User size={18} className="text-muted-foreground" />
                </View>
                <Input
                  placeholder="John Doe"
                  className="pl-10"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View className="gap-y-2">
              <Label nativeID="email">Email</Label>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Mail size={18} className="text-muted-foreground" />
                </View>
                <Input
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="gap-y-2">
              <Label nativeID="password">Password</Label>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Lock size={18} className="text-muted-foreground" />
                </View>
                <Input
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <Button size="lg" className="w-full mt-2" onPress={handleRegister} disabled={loading}>
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <Loader2 size={18} color="white" className="animate-spin" />
                  <Text className="text-primary-foreground font-semibold">Creating Account...</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-primary-foreground font-semibold">Sign Up</Text>
                  <ArrowRight size={18} color="white" />
                </View>
              )}
            </Button>
          </CardContent>
        </Card>

        <View className="flex-row justify-center mt-8 gap-x-2">
          <Text className="text-muted-foreground">Already have an account?</Text>
          <Link href="/login">
            <Text className="text-primary font-bold">Sign In</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
