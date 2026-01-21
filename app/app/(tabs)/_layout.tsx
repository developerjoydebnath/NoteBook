import { Tabs } from 'expo-router';
import { FileText, LayoutDashboard, Link, LogOut, Moon, Sun, User } from 'lucide-react-native';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function TabsLayout() {
  const { clearAuth } = useAuthStore();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Add actual theme switching logic here if available
  };

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#3b82f6',
      headerShown: true,
      tabBarStyle: {
        paddingBottom: 10,
        paddingTop: 5,
        height: 65,
      },
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            {isDark ? <Sun size={22} color="#3b82f6" /> : <Moon size={22} color="#64748b" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAuth}>
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
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
