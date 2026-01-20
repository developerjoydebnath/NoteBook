import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';

export default function ModalScreen() {
  const { type, id, action } = useLocalSearchParams<{ type: 'note' | 'link'; id?: string; action?: 'add' }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Note fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Link fields
  const [url, setUrl] = useState('');

  const isEditing = id && !action;

  useEffect(() => {
    if (isEditing) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'note' ? `/notes/${id}` : `/links/${id}`;
      const response = await api.get(endpoint);
      const data = response.data;
      setTitle(data.title);
      if (type === 'note') setContent(data.content);
      if (type === 'link') setUrl(data.url);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || (type === 'note' && !content) || (type === 'link' && !url)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const endpoint = type === 'note' ? `/notes/${id}` : `/links/${id}`;
        await api.put(endpoint, type === 'note' ? { title, content } : { title, url });
      } else {
        const endpoint = type === 'note' ? '/notes' : '/links';
        await api.post(endpoint, type === 'note' ? { title, content } : { title, url });
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not save item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const endpoint = type === 'note' ? `/notes/${id}` : `/links/${id}`;
            await api.delete(endpoint);
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Could not delete item');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  if (loading && isEditing) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="space-y-6">
        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-700">Title</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {type === 'note' ? (
          <View className="space-y-2 mt-4">
            <Text className="text-sm font-medium text-gray-700">Content</Text>
            <TextInput
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl min-h-[200px]"
              placeholder="Enter content"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        ) : (
          <View className="space-y-2 mt-4">
            <Text className="text-sm font-medium text-gray-700">URL</Text>
            <TextInput
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
              placeholder="https://example.com"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        )}

        <View className="flex-row mt-10 space-x-3">
          {isEditing && (
            <TouchableOpacity
              className="flex-1 bg-red-100 p-4 rounded-xl flex-row justify-center items-center border border-red-200"
              onPress={handleDelete}
              disabled={loading}
            >
              <Trash2 size={20} color="#ef4444" className="mr-2" />
              <Text className="text-red-500 font-bold ml-2">Delete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className={`flex-1 ${type === 'note' ? 'bg-blue-600' : 'bg-green-600'} p-4 rounded-xl flex-row justify-center items-center`}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold ml-2">{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
