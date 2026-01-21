import { useFocusEffect } from 'expo-router';
import { FileText, Link as LinkIcon, Mail, ShieldAlert, Trash2, User as UserIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../lib/api';

export default function AdminScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Could not fetch users list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Update Role',
      `Change role to ${newRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await api.patch(`/admin/users/${userId}/role`, { role: newRole });
              setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } catch (error) {
              Alert.alert('Error', 'Could not update role');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${username}? This will also delete all their notes and links.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/users/${userId}`);
              setUsers(users.filter(u => u._id !== userId));
            } catch (error) {
              Alert.alert('Error', 'Could not delete user');
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }: { item: any }) => (
    <View className="bg-white dark:bg-slate-800 p-5 rounded-3xl mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl mr-4">
          <UserIcon size={24} color="#3b82f6" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{item.username}</Text>
          <View className="flex-row items-center mt-1">
            <Mail size={12} color="#94a3b8" />
            <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{item.email}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleUpdateRole(item._id, item.role)}
          className={`px-3 py-1.5 rounded-full ${item.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}
        >
          <Text className={`text-[10px] font-bold uppercase ${item.role === 'admin' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {item.role}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center pt-4 border-t border-gray-50 dark:border-slate-700/50">
        <View className="flex-row gap-x-4">
          <View className="flex-row items-center">
            <View className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg mr-2">
              <FileText size={14} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-gray-900 dark:text-white font-bold text-sm">{item.notesCount || 0}</Text>
              <Text className="text-gray-400 text-[10px]">Notes</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-green-50 dark:bg-green-900/20 p-1.5 rounded-lg mr-2">
              <LinkIcon size={14} color="#10b981" />
            </View>
            <View>
              <Text className="text-gray-900 dark:text-white font-bold text-sm">{item.linksCount || 0}</Text>
              <Text className="text-gray-400 text-[10px]">Links</Text>
            </View>
          </View>
        </View>

        {item?.role !== 'admin' && <TouchableOpacity
          onPress={() => handleDeleteUser(item._id, item.username)}
          className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-full"
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">Manage registered users</Text>
        </View>
        <View className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
          <ShieldAlert size={20} color="#3b82f6" />
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-gray-400 dark:text-gray-600">No users found</Text>
          </View>
        }
      />
    </View>
  );
}
