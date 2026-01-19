import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell, ChevronRight, LogOut, Palette, Settings, Shield, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: <User size={20} className="text-blue-500" />, label: 'Personal Info', sub: 'Manage your name and email' },
    { icon: <Shield size={20} className="text-green-500" />, label: 'Security', sub: 'Change password and account safety' },
    { icon: <Palette size={20} className="text-orange-500" />, label: 'Appearance', sub: 'Theme and color settings' },
    { icon: <Bell size={20} className="text-purple-500" />, label: 'Notifications', sub: 'Manage alerts and messages' },
    { icon: <Settings size={20} className="text-slate-500" />, label: 'Settings', sub: 'App preferences' },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 items-center bg-card mb-4 border-b border-border">
        <Avatar alt='cn' className="w-24 h-24 mb-4">
          <AvatarImage source={{ uri: `https://avatar.iran.liara.run/username?username=${user?.name}` }} />
          <AvatarFallback><Text className="text-2xl font-bold">{user?.name?.charAt(0)}</Text></AvatarFallback>
        </Avatar>
        <Text className="text-2xl font-bold">{user?.name}</Text>
        <Text className="text-muted-foreground">{user?.email}</Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full mt-2">
          <Text className="text-primary text-xs font-bold uppercase">{user?.role || 'User'}</Text>
        </View>
      </View>

      <View className="px-4 gap-y-2 mb-8">
        <Text className="text-xs font-bold text-muted-foreground uppercase ml-2 mb-1">Account Settings</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} className="flex-row items-center p-4 bg-card rounded-xl border border-border mb-2">
            <View className="w-10 h-10 rounded-lg bg-background items-center justify-center mr-4">
              {item.icon}
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-lg">{item.label}</Text>
              <Text className="text-muted-foreground text-xs">{item.sub}</Text>
            </View>
            <ChevronRight size={18} className="text-muted-foreground" />
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-4 mb-20">
        <Button variant="destructive" size="lg" className="w-full flex-row items-center gap-2" onPress={logout}>
          <LogOut size={20} color="white" />
          <Text className="text-white font-bold text-lg">Sign Out</Text>
        </Button>
        <Text className="text-center text-muted-foreground text-xs mt-4">Version 1.0.0 (Alpha)</Text>
      </View>
    </ScrollView>
  );
}
