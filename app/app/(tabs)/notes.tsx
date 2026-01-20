import { useRouter } from 'expo-router';
import { ChevronRight, FileText, Plus, Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../lib/api';
import { useDataStore } from '../../store/useDataStore';

export default function NotesScreen() {
  const { notes, setNotes } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  const renderNote = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3"
      onPress={() => router.push({ pathname: '/modal', params: { type: 'note', id: item._id } })}
    >
      <View className="flex-row items-start">
        <View className="bg-blue-100 p-2 rounded-lg mr-3">
          <FileText size={20} color="#3b82f6" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={1}>{item.title}</Text>
          <Text className="text-gray-500 text-sm" numberOfLines={2}>{item.content}</Text>
          <View className="flex-row items-center mt-2">
            <View className="bg-gray-100 px-2 py-0.5 rounded-md">
              <Text className="text-gray-500 text-[10px]">{item.categoryId?.name || 'General'}</Text>
            </View>
            <Text className="text-gray-400 text-[10px] ml-auto">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#cbd5e1" className="ml-2" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 px-3 rounded-xl border border-gray-200">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 p-2 text-gray-900"
            placeholder="Search notes..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item._id}
        renderItem={renderNote}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center mt-10">
              <Text className="text-gray-400">No notes found</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full shadow-lg items-center justify-center"
        onPress={() => router.push({ pathname: '/modal', params: { type: 'note', action: 'add' } })}
      >
        <Plus size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
