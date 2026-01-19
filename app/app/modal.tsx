import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Loader2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function ModalScreen() {
  const { type } = useLocalSearchParams<{ type: 'note' | 'link' }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!title || (type === 'note' && !content) || (type === 'link' && !url)) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      if (type === 'note') {
        await api.post('/notes', { title, content, categoryId });
      } else {
        await api.post('/links', { title, url, description, categoryId });
      }
      router.back();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <Stack.Screen options={{ title: type === 'note' ? 'New Note' : 'New Link' }} />
      
      <ScrollView className="p-4">
        <View className="gap-y-6">
          <View className="gap-y-2">
            <Label nativeID="title">Title *</Label>
            <Input
              placeholder="Enter title..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {type === 'note' ? (
            <View className="gap-y-2">
              <Label nativeID="content">Content *</Label>
              <Textarea
                placeholder="Write your note here..."
                value={content}
                onChangeText={setContent}
                className="min-h-[200]"
              />
            </View>
          ) : (
            <>
              <View className="gap-y-2">
                <Label nativeID="url">URL *</Label>
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
              <View className="gap-y-2">
                <Label nativeID="description">Description (Optional)</Label>
                <Textarea
                  placeholder="Brief description of the link..."
                  value={description}
                  onChangeText={setDescription}
                  className="min-h-[100]"
                />
              </View>
            </>
          )}

          <View className="gap-y-2">
            <Label nativeID="category">Category</Label>
            <Select onValueChange={(val) => setCategoryId(val?.value || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories
                    .filter(c => c.type === (type === 'note' ? 'note' : 'link'))
                    .map((cat) => (
                    <SelectItem key={cat._id} label={cat.name} value={cat._id}>
                      <Text>{cat.name}</Text>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>

          <View className="flex-row gap-x-4 mt-4 mb-20">
            <Button variant="outline" className="flex-1" onPress={() => router.back()} disabled={loading}>
              <X size={18} className="mr-2" />
              <Text>Cancel</Text>
            </Button>
            <Button className="flex-1" onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <Loader2 size={18} color="white" className="animate-spin" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Check size={18} color="white" />
                  <Text className="text-white font-bold">Create</Text>
                </View>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
