import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';

export default function ResetPasswordScreen() {
  const { token: initialToken } = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(initialToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!token || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center p-6">
      <View className="space-y-4">
        <Text className="text-3xl font-bold text-gray-900 text-center mb-8">Reset Password</Text>

        {!initialToken && (
          <View className="space-y-2 mb-4">
            <Text className="text-sm font-medium text-gray-700">Reset Token</Text>
            <TextInput
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
              placeholder="Enter token"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />
          </View>
        )}

        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-700">New Password</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View className="space-y-2 mt-4">
          <Text className="text-sm font-medium text-gray-700">Confirm Password</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="mt-8 bg-blue-600 p-4 rounded-xl flex-row justify-center items-center"
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
