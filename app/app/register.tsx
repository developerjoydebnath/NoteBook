import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password });
      Alert.alert('Success', 'Account created successfully', [
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 justify-center p-6 mt-10">
        <Text className="text-3xl font-bold text-gray-900 text-center mb-8">Create Account</Text>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">Username</Text>
            <TextInput
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
              placeholder="username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View className="space-y-2 mt-4">
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
            className="mt-8 bg-blue-600 p-4 rounded-xl flex-row justify-center items-center"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Register</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-bold">Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
