import { FileText, Link as LinkIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
// import { BarChart, PieChart } from 'react-native-gifted-charts';
import { api } from '../../lib/api';
import { useDataStore } from '../../store/useDataStore';

export default function DashboardScreen() {
  const { stats, setStats } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const barData = stats?.activityData?.map((item: any) => ({
    value: item.notes + item.links,
    label: item.date,
    frontColor: '#3b82f6',
  })) || [];

  const pieData = stats?.categoryStats?.map((item: any, index: number) => ({
    value: item.count,
    text: item.name,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
  })) || [];

  return (
    <ScrollView
      className="flex-1 bg-gray-50 p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Overview</Text>
        <Text className="text-gray-500">Your activity at a glance</Text>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 mr-2 items-center">
          <View className="bg-blue-100 p-2 rounded-full mb-2">
            <FileText size={20} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{stats?.totalNotes || 0}</Text>
          <Text className="text-gray-500 text-xs">Total Notes</Text>
        </View>

        <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 ml-2 items-center">
          <View className="bg-green-100 p-2 rounded-full mb-2">
            <LinkIcon size={20} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{stats?.totalLinks || 0}</Text>
          <Text className="text-gray-500 text-xs">Total Links</Text>
        </View>
      </View>

      <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-4 flex-row items-center">
          Weekly Activity
        </Text>
        {/* {barData.length > 0 ? (
          <BarChart
            data={barData}
            barWidth={22}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="#3b82f6"
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
          />
        ) : (
          <Text className="text-gray-400 text-center py-10">No activity data</Text>
        )} */}
        <Text className="text-gray-400 text-center py-10">Chart disabled temporarily</Text>
      </View>

      <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <Text className="text-lg font-bold text-gray-900 mb-4">Categories</Text>
        <View className="items-center">
          {/* {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={60}
              innerCircleColor={'white'}
              centerLabelComponent={() => {
                return (
                  <View className="items-center justify-center">
                    <Text className="text-lg font-bold">{(stats?.totalNotes || 0) + (stats?.totalLinks || 0)}</Text>
                    <Text className="text-xs text-gray-500">Items</Text>
                  </View>
                );
              }}
            />
          ) : (
            <Text className="text-gray-400 text-center py-10">No category data</Text>
          )} */}
          <Text className="text-gray-400 text-center py-10">Chart disabled temporarily</Text>
        </View>
        <View className="mt-4">
          {pieData.map((item: any, index: number) => (
            <View key={index} className="flex-row items-center mb-1">
              <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full mr-2" />
              <Text className="text-gray-600 text-xs flex-1">{item.text}</Text>
              <Text className="text-gray-900 text-xs font-bold">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
