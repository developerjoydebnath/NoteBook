import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import api from '@/lib/api';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Calendar, FileText, Loader2, MoreVertical, Plus, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';

export default function NotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get('/notes', { params: { search } });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchNotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotes();
  }, [fetchNotes]);

  const renderNote = ({ item }: { item: any }) => (
    <Card className="mb-4 border-border">
      <CardHeader className="flex-row justify-between items-start pb-2">
        <View className="flex-1">
          <CardTitle className="text-lg" numberOfLines={1}>{item.title}</CardTitle>
          <View className="flex-row items-center gap-2 mt-1">
            <Calendar size={12} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {format(new Date(item.createdAt), 'MMM dd, yyyy')}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="p-1">
          <MoreVertical size={20} className="text-muted-foreground" />
        </TouchableOpacity>
      </CardHeader>
      <CardContent>
        <Text className="text-sm text-muted-foreground" numberOfLines={3}>
          {item.content}
        </Text>
        <View className="flex-row justify-between items-center mt-4">
          <Badge variant="secondary">
            <Text className="text-[10px] font-bold uppercase">{item.category?.name || 'Uncategorized'}</Text>
          </Badge>
          <TouchableOpacity onPress={() => {/* Edit note */}}>
            <Text className="text-primary text-sm font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 gap-y-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold">My Notes</Text>
            <Text className="text-muted-foreground">Manage your documents</Text>
          </View>
          <Button size="icon" className="rounded-full" onPress={() => router.push('/modal?type=note')}>
            <Plus size={24} color="white" />
          </Button>
        </View>

        <View className="relative">
          <View className="absolute left-3 top-3 z-10">
            <Search size={18} className="text-muted-foreground" />
          </View>
          <Input
            placeholder="Search notes..."
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
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <FileText size={48} className="text-muted-foreground/20 mb-4" />
              <Text className="text-muted-foreground">No notes found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
