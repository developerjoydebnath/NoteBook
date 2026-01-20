import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const router = useRouter();

  const handleForgot = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setResetToken(response.data.resetToken);
      Alert.alert('Success', 'Reset token generated (Development mode)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center p-6">
      <View className="space-y-4">
        <Text className="text-3xl font-bold text-gray-900 text-center mb-4">Forgot Password</Text>
        <Text className="text-gray-500 text-center mb-8">Enter your email to receive a reset token</Text>

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

        <TouchableOpacity
          className="mt-6 bg-blue-600 p-4 rounded-xl flex-row justify-center items-center"
          onPress={handleForgot}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Send Token</Text>
          )}
        </TouchableOpacity>

        {resetToken ? (
          <View className="mt-8 p-4 bg-gray-100 rounded-xl border border-gray-200">
            <Text className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Reset Token (Dev Mode)</Text>
            <Text className="text-blue-600 font-mono mb-4">{resetToken}</Text>
            <TouchableOpacity
              className="bg-gray-800 p-3 rounded-lg"
              onPress={() => router.push({ pathname: '/reset-password', params: { token: resetToken } })}
            >
              <Text className="text-white text-center font-bold">Go to Reset Page</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Link href="/login" asChild>
          <TouchableOpacity className="mt-6">
            <Text className="text-blue-600 text-center font-bold">Back to Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
