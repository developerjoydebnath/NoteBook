import { Bell, ChevronRight, LogOut, Settings, Shield, User } from 'lucide-react-native';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
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
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-6 items-center border-b border-gray-200">
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
          <User size={50} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{user?.username || 'User'}</Text>
        <Text className="text-gray-500">{user?.email || 'email@example.com'}</Text>
      </View>

      <View className="mt-6">
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} className="flex-row items-center bg-white px-6 py-4 border-b border-gray-100">
            {item.icon}
            <Text className="flex-1 ml-4 text-gray-700 font-medium">{item.title}</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="flex-row items-center bg-white px-6 py-4 mt-6 border-y border-gray-200"
        onPress={handleLogout}
      >
        <LogOut size={20} color="#ef4444" />
        <Text className="flex-1 ml-4 text-red-500 font-bold">Logout</Text>
      </TouchableOpacity>

      <View className="mt-auto p-6 items-center">
        <Text className="text-gray-400 text-xs">NoteBook App v1.0.0</Text>
      </View>
    </View>
  );
}
