import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import api from '@/lib/api';
import { useRouter } from 'expo-router';
import { ExternalLink, Link as LinkIcon, Loader2, MoreVertical, Plus, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Linking, RefreshControl, TouchableOpacity, View } from 'react-native';

export default function LinksScreen() {
  const router = useRouter();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLinks = useCallback(async () => {
    try {
      const res = await api.get('/links', { params: { search } });
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLinks();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchLinks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLinks();
  }, [fetchLinks]);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open link:', err));
  };

  const renderLink = ({ item }: { item: any }) => (
    <Card className="mb-4 border-border">
      <CardHeader className="flex-row justify-between items-start pb-2">
        <View className="flex-1">
          <CardTitle className="text-lg" numberOfLines={1}>{item.title}</CardTitle>
          <TouchableOpacity onPress={() => openLink(item.url)} className="flex-row items-center gap-1 mt-1">
            <Text className="text-xs text-primary" numberOfLines={1}>
              {item.url}
            </Text>
            <ExternalLink size={12} className="text-primary" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="p-1">
          <MoreVertical size={20} className="text-muted-foreground" />
        </TouchableOpacity>
      </CardHeader>
      <CardContent>
        {item.description ? (
          <Text className="text-sm text-muted-foreground mb-3" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View className="flex-row justify-between items-center">
          <Badge variant="outline">
            <Text className="text-[10px] font-bold uppercase">{item.category?.name || 'General'}</Text>
          </Badge>
          <Button variant="ghost" size="sm" onPress={() => openLink(item.url)}>
            <Text className="text-primary">Visit Link</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 gap-y-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold">Safe Links</Text>
            <Text className="text-muted-foreground">Manage your bookmarks</Text>
          </View>
          <Button size="icon" className="rounded-full" onPress={() => router.push('/modal?type=link')}>
            <Plus size={24} color="white" />
          </Button>
        </View>

        <View className="relative">
          <View className="absolute left-3 top-3 z-10">
            <Search size={18} className="text-muted-foreground" />
          </View>
          <Input
            placeholder="Search links..."
            className="pl-10"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <Loader2 size={32} className="text-primary animate-spin" />
        </View>
      ) : (
        <FlatList
          data={links}
          renderItem={renderLink}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <LinkIcon size={48} className="text-muted-foreground/20 mb-4" />
              <Text className="text-muted-foreground">No links found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
