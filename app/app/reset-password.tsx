import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import api from '@/lib/api';
import { Link, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Loader2, Lock, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { token, password });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-background p-6 justify-center items-center">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
          <ShieldCheck size={40} className="text-green-600" />
        </View>
        <Text className="text-2xl font-bold text-center">Password Reset Successful</Text>
        <Text className="text-muted-foreground text-center mt-3 mb-8">
          Your password has been successfully reset. You can now sign in with your new password.
        </Text>
        <Link href="/login" asChild>
          <Button className="w-full">
            <Text>Sign In Now</Text>
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6 justify-center">
        <View className="mb-8 items-center">
          <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4">
            <Lock size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold">Reset Password</Text>
          <Text className="text-muted-foreground text-center mt-2">
            Create a strong new password for your account
          </Text>
        </View>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>New Password</CardTitle>
            <CardDescription>Enter and confirm your new password</CardDescription>
          </CardHeader>
          <CardContent className="gap-y-4">
            {error ? (
              <View className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <Text className="text-destructive text-sm text-center font-medium">{error}</Text>
              </View>
            ) : null}

            <View className="gap-y-2">
              <Label nativeID="password">New Password</Label>
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

            <View className="gap-y-2">
              <Label nativeID="confirmPassword">Confirm Password</Label>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Lock size={18} className="text-muted-foreground" />
                </View>
                <Input
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <Button size="lg" className="w-full mt-2" onPress={handleReset} disabled={loading}>
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <Loader2 size={18} color="white" className="animate-spin" />
                  <Text className="text-primary-foreground font-semibold">Resetting Password...</Text>
                </View>
              ) : (
                <Text className="text-primary-foreground font-semibold">Reset Password</Text>
              )}
            </Button>
          </CardContent>
        </Card>

        <View className="flex-row justify-center mt-8">
          <Link href="/login" asChild>
            <TouchableOpacity className="flex-row items-center gap-2">
              <ArrowLeft size={16} className="text-primary" />
              <Text className="text-primary font-bold">Back to Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
