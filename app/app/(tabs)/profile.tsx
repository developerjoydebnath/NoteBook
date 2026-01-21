import { Bell, ChevronRight, LogOut, Settings, Shield, User } from 'lucide-react-native';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: clearAuth }
    ]);
  };

  const menuItems = [
    { icon: <Bell size={20} color="#64748b" />, title: 'Notifications' },
    { icon: <Shield size={20} color="#64748b" />, title: 'Privacy & Security' },
    { icon: <Settings size={20} color="#64748b" />, title: 'Settings' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-slate-800 p-8 items-center border-b border-gray-200 dark:border-slate-700">
        <View className="w-28 h-28 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4 border-4 border-white dark:border-slate-700 shadow-sm">
          <User size={60} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username || 'User'}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-1">{user?.email || 'email@example.com'}</Text>
        <View className="bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full mt-3">
          <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">{user?.role || 'User'}</Text>
        </View>
      </View>

      <View className="mt-6">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center bg-white dark:bg-slate-800 px-6 py-4 border-b border-gray-100 dark:border-slate-700/50"
          >
            {item.icon}
            <Text className="flex-1 ml-4 text-gray-700 dark:text-gray-300 font-medium">{item.title}</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="flex-row items-center bg-white dark:bg-slate-800 px-6 py-4 mt-6 border-y border-gray-200 dark:border-slate-700"
        onPress={handleLogout}
      >
        <LogOut size={20} color="#ef4444" />
        <Text className="flex-1 ml-4 text-red-500 font-bold">Logout</Text>
      </TouchableOpacity>

      <View className="p-10 items-center">
        <Text className="text-gray-400 dark:text-gray-600 text-xs">NoteBook App v1.1.0</Text>
        <Text className="text-gray-400 dark:text-gray-600 text-xs mt-1">Made with Love</Text>
      </View>
    </ScrollView>
  );
}
