import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Edit3, ExternalLink, Folder, FolderPlus, Save, Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Skeleton from '../components/Skeleton';
import { api } from '../lib/api';

export default function ModalScreen() {
  const { type, id, action } = useLocalSearchParams<{ type: 'note' | 'link'; id?: string; action?: 'add' }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isViewing, setIsViewing] = useState(!!id && action !== 'add');

  // Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [categoryName, setCategoryName] = useState('Uncategorized');

  const isEditing = id && !action;

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const catType = type === 'note' ? 'note' : 'website';
      const response = await api.get(`/categories?type=${catType}`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      setShowNewCatInput(false);
      return;
    }
    try {
      const catType = type === 'note' ? 'note' : 'website';
      const response = await api.post('/categories', { name: newCatName.trim(), type: catType });
      setCategories([...categories, response.data]);
      setSelectedCategory(response.data._id);
      setCategoryName(response.data.name);
      setNewCatName('');
      setShowNewCatInput(false);
    } catch (error) {
      Alert.alert('Error', 'Could not create category');
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${catName}"? Associated items will become uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categories/${catId}`);
              setCategories(categories.filter(c => c._id !== catId));
              if (selectedCategory === catId) {
                setSelectedCategory('');
                setCategoryName('Uncategorized');
              }
            } catch (error) {
              Alert.alert('Error', 'Could not delete category');
            }
          }
        }
      ]
    );
  };

  const fetchItem = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'note' ? `/notes/${id}` : `/links/${id}`;
      const response = await api.get(endpoint);
      const data = response.data;
      setTitle(data.title || data.name || '');
      setSelectedCategory(data.categoryId?._id || data.categoryId || '');
      setCategoryName(data.categoryId?.name || 'Uncategorized');
      setCreatedAt(data.createdAt);
      if (type === 'note') setContent(data.content);
      if (type === 'link') setUrl(data.url);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Could not fetch details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isViewing) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-4 bg-white dark:bg-slate-800 flex-row justify-between items-center border-b border-gray-100 dark:border-slate-700">
          <Skeleton width={80} height={20} />
          <Skeleton width={100} height={36} borderRadius={18} />
        </View>
        <ScrollView className="flex-1 p-6">
          <Skeleton width="40%" height={24} borderRadius={12} className="mb-4" />
          <Skeleton width="80%" height={32} className="mb-8" />

          <View className="flex-row items-center mb-8">
            <View className="flex-row items-center mr-6">
              <Skeleton width={16} height={16} borderRadius={8} className="mr-2" />
              <Skeleton width={100} height={16} />
            </View>
            <View className="flex-row items-center">
              <Skeleton width={16} height={16} borderRadius={8} className="mr-2" />
              <Skeleton width={80} height={16} />
            </View>
          </View>

          <Skeleton width="100%" height={20} className="mb-2" />
          <Skeleton width="100%" height={20} className="mb-2" />
          <Skeleton width="90%" height={20} className="mb-2" />
          <Skeleton width="100%" height={20} className="mb-2" />
          <Skeleton width="70%" height={20} className="mb-8" />
        </ScrollView>
      </View>
    );
  }

  const handleSave = async () => {
    if (!title || (type === 'note' && !content) || (type === 'link' && !url)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        categoryId: selectedCategory || null
      };

      if (type === 'note') {
        payload.title = title;
        payload.content = content;
      } else {
        payload.name = title;
        payload.url = url;
      }

      if (id && action !== 'add') {
        const endpoint = type === 'note' ? `/notes/${id}` : `/links/${id}`;
        const res = await api.patch(endpoint, payload);
        // Update local state for view mode
        const updated = res.data;
        setTitle(updated.title || updated.name || '');
        setCategoryName(updated.categoryId?.name || 'Uncategorized');
        if (type === 'note') setContent(updated.content);
        if (type === 'link') setUrl(updated.url);
        setIsViewing(true);
      } else {
        const endpoint = type === 'note' ? '/notes' : '/links';
        await api.post(endpoint, payload);
        router.back();
      }
    } catch (error) {
      console.error('Save error:', error);
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

  const openLink = () => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open URL'));
    }
  };

  if (loading && !isViewing) {
    return <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900"><ActivityIndicator size="large" color="#3b82f6"></ActivityIndicator></View >
  }

  if (isViewing) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-6 bg-white dark:bg-slate-800 rounded-3xl m-4 shadow-sm border border-gray-100 dark:border-slate-700">
          <View className="flex-col justify-between items-start mb-6">
            <View className="flex-1 mr-4 flex-row justify-between items-center w-full">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{title}</Text>
              <View className="flex-row flex gap-2">
                <TouchableOpacity
                  onPress={handleDelete}
                  className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full"
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsViewing(false)}
                  className="bg-gray-100 dark:bg-slate-700 p-3 rounded-full"
                >
                  <Edit3 size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-4 w-full">
              <View className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full flex-row items-center">
                <Folder size={14} color="#3b82f6" />
                <Text className="text-blue-500 dark:text-blue-400 text-xs font-bold ml-1.5">{categoryName}</Text>
              </View>
              <View className="flex-row items-center">
                <Calendar size={14} color="#94a3b8" />
                <Text className="text-gray-400 dark:text-gray-500 text-xs ml-1.5">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View className="h-[1px] bg-gray-100 dark:bg-slate-700 w-full mb-6" />

          {type === 'note' ? (
            <Text className="text-gray-700 dark:text-gray-300 text-lg leading-7">{content}</Text>
          ) : (
            <View className="flex-col gap-y-4">
              <TouchableOpacity
                onPress={openLink}
                className="bg-blue-600 p-4 rounded-xl flex-row justify-center items-center shadow-sm"
              >
                <ExternalLink size={20} color="white" />
                <Text className="text-white font-bold ml-2">Open Website</Text>
              </TouchableOpacity>
              <View className="bg-gray-100 dark:bg-slate-700/50 p-4 rounded-xl">
                <Text className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1">URL</Text>
                <Text className="text-blue-600 dark:text-blue-400 font-medium" numberOfLines={1}>{url}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-6 space-y-6 pb-20">
        <View className="gap-y-2">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
            placeholder="Enter title"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="gap-y-2 mt-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Text>
            <TouchableOpacity onPress={() => setShowNewCatInput(!showNewCatInput)}>
              <View className="flex-row items-center gap-x-1">
                <FolderPlus size={16} color="#3b82f6" />
                <Text className="text-blue-500 dark:text-blue-400 text-sm font-bold ml-1">{showNewCatInput ? 'Cancel' : 'New'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {showNewCatInput && (
            <View className="flex-row items-center mt-2 gap-x-2">
              <TextInput
                className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white"
                placeholder="New category name"
                placeholderTextColor="#94a3b8"
                value={newCatName}
                onChangeText={setNewCatName}
                autoFocus
              />
              <TouchableOpacity
                onPress={handleAddCategory}
                className="bg-blue-600 px-4 py-3 rounded-xl"
              >
                <Text className="text-white font-bold text-sm">Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row mt-2"
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              onPress={() => { setSelectedCategory(''); setCategoryName('Uncategorized'); }}
              className={`px-4 py-2 rounded-full mr-2 border ${selectedCategory === '' ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
            >
              <Text className={`${selectedCategory === '' ? 'text-white' : 'text-gray-600 dark:text-gray-400'} text-xs font-medium`}>Uncategorized</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <View
                key={cat._id}
                className={`flex-row items-center rounded-full mr-2 border ${selectedCategory === cat._id ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
              >
                <TouchableOpacity
                  onPress={() => { setSelectedCategory(cat._id); setCategoryName(cat.name); }}
                  className="px-4 py-2"
                >
                  <Text className={`${selectedCategory === cat._id ? 'text-white' : 'text-gray-600 dark:text-gray-400'} text-xs font-medium`}>{cat.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(cat._id, cat.name)}
                  className="pr-3 pl-1 justify-center"
                >
                  <X size={14} color={selectedCategory === cat._id ? 'white' : '#94a3b8'} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {type === 'note' ? (
          <View className="gap-y-2 mt-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</Text>
            <TextInput
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl min-h-[200px] text-gray-900 dark:text-white"
              placeholder="Enter content"
              placeholderTextColor="#94a3b8"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        ) : (
          <View className="gap-y-2 mt-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">URL</Text>
            <TextInput
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
              placeholder="https://example.com"
              placeholderTextColor="#94a3b8"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        )}

        <View className="flex-row mt-10 gap-x-4">
          <TouchableOpacity
            className="flex-1 bg-gray-100 dark:bg-slate-800 p-4 rounded-xl flex-row justify-center items-center border border-gray-200 dark:border-slate-700"
            onPress={() => id && action !== 'add' ? setIsViewing(true) : router.back()}
          >
            <Text className="text-gray-600 dark:text-gray-400 font-bold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 ${type === 'note' ? 'bg-blue-600' : 'bg-green-600'} p-4 rounded-xl flex-row justify-center items-center`}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color="white" />
            <Text className="text-white font-bold ml-2">{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
