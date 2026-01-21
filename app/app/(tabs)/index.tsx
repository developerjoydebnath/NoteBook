import { useFocusEffect } from 'expo-router';
import { FileText, Link as LinkIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { api } from '../../lib/api';
import { useDataStore } from '../../store/useDataStore';

export default function DashboardScreen() {
  const { stats, setStats } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 110;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const barData = stats?.activityData?.map((item: any) => ({
    value: item.notes + item.links,
    label: item.date,
    frontColor: '#3b82f6',
    labelTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 },
  })) || [];

  const pieData = stats?.categoryStats?.map((item: any, index: number) => ({
    value: item.count,
    text: item.name,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
  })) || [];

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900 p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Overview</Text>
        <Text className="text-gray-500 dark:text-gray-400">Your activity at a glance</Text>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-1 mr-2 items-center">
          <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
            <FileText size={20} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalNotes || 0}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">Total Notes</Text>
        </View>

        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-1 ml-2 items-center">
          <View className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mb-2">
            <LinkIcon size={20} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalLinks || 0}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">Total Links</Text>
        </View>
      </View>

      <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 overflow-hidden">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Weekly Activity
        </Text>
        <View className="items-center">
          {barData.length > 0 ? (
            <BarChart
              data={barData}
              width={chartWidth}
              barWidth={18}
              spacing={15}
              initialSpacing={10}
              noOfSections={3}
              barBorderRadius={6}
              frontColor="#3b82f6"
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              yAxisTextStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              backgroundColor="transparent"
              isAnimated
              disableScroll
            />
          ) : (
            <Text className="text-gray-400 dark:text-gray-500 text-center py-10">No activity data</Text>
          )}
        </View>
      </View>

      <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-10">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-6">Categories</Text>
        <View className="items-center">
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              donut
              radius={80}
              innerRadius={55}
              innerCircleColor={isDark ? '#1e293b' : 'white'}
              centerLabelComponent={() => {
                return (
                  <View className="items-center justify-center">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                      {(stats?.totalNotes || 0) + (stats?.totalLinks || 0)}
                    </Text>
                    <Text className="text-[10px] text-gray-500 dark:text-gray-400">Total Items</Text>
                  </View>
                );
              }}
            />
          ) : (
            <Text className="text-gray-400 dark:text-gray-500 text-center py-10">No category data</Text>
          )}
        </View>
        <View className="mt-8 flex-row flex-wrap justify-center">
          {pieData.map((item: any, index: number) => (
            <View key={index} className="flex-row items-center mr-4 mb-2">
              <View style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full mr-2" />
              <Text className="text-gray-600 dark:text-gray-400 text-xs mr-1">{item.text}</Text>
              <Text className="text-gray-900 dark:text-white text-xs font-bold">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
