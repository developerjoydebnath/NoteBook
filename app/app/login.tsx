import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, ...user } = response.data;
      setAuth(user, accessToken);
      // AuthStore effect in _layout will handle redirect
    } catch (error: any) {
      console.log('Login Error:', error);
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center p-6">
      <View className="space-y-4">
        <Text className="text-3xl font-bold text-gray-900 text-center mb-8">Welcome Back</Text>

        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-700">Email</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="space-y-2 mt-4">
          <Text className="text-sm font-medium text-gray-700">Password</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="mt-6 bg-blue-600 p-4 rounded-xl flex-row justify-center items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-bold">Register</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Link href="/forgot-password" asChild>
          <TouchableOpacity className="mt-4">
            <Text className="text-blue-600 text-center">Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
