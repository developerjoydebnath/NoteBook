import { Tabs } from 'expo-router';
import { FileText, LayoutDashboard, Link, LogOut, Moon, Shield, Sun, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function TabsLayout() {
  const { clearAuth, user } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#3b82f6',
      headerShown: true,
      tabBarStyle: {
        paddingBottom: 10,
        paddingTop: 5,
        height: 65,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderTopColor: isDark ? '#334155' : '#e2e8f0',
      },
      headerStyle: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
      },
      headerTitleStyle: {
        color: isDark ? '#ffffff' : '#000000',
      },
      headerRight: () => (
        <View className='flex-row items-center mr-4'>
          <TouchableOpacity onPress={toggleColorScheme} className="mr-4 rounded-md p-1">
            {isDark ? <Sun size={22} color="#3b82f6" /> : <Moon size={22} color="#64748b" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAuth} className="rounded-md p-1">
            <LogOut size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ),
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="links"
        options={{
          title: 'Links',
          tabBarIcon: ({ color }) => <Link size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin ? '/admin' : null,
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
