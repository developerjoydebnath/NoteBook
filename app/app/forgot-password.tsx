import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import api from '@/lib/api';
import { Link } from 'expo-router';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleForgot = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-background p-6 justify-center items-center">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-primary" />
        </View>
        <Text className="text-2xl font-bold text-center">Check Your Email</Text>
        <Text className="text-muted-foreground text-center mt-3 mb-8">
          We&apos;ve sent a password reset link to <Text className="font-bold text-foreground">{email}</Text>. Please follow the instructions in the email.
        </Text>
        <Link href="/login" asChild>
          <Button variant="outline" className="w-full">
            <ArrowLeft size={18} className="mr-2" />
            <Text>Back to Login</Text>
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
            <Mail size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold">Forgot Password</Text>
          <Text className="text-muted-foreground text-center mt-2">
            No worries! Enter your email and we&apos;ll send you a link to reset your password.
          </Text>
        </View>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your registered email address</CardDescription>
          </CardHeader>
          <CardContent className="gap-y-4">
            {error ? (
              <View className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <Text className="text-destructive text-sm text-center font-medium">{error}</Text>
              </View>
            ) : null}

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

            <Button size="lg" className="w-full mt-2" onPress={handleForgot} disabled={loading}>
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <Loader2 size={18} color="white" className="animate-spin" />
                  <Text className="text-primary-foreground font-semibold">Sending Link...</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-primary-foreground font-semibold">Send Reset Link</Text>
                  <Send size={18} color="white" />
                </View>
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
