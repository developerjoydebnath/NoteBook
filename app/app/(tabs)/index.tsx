import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import api from '@/lib/api';
import { FileText, Link as LinkIcon, Loader2, PieChart as PieChartIcon, TrendingUp } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

type ActivityData = {
  date: string;
  notes: number;
  [key: string]: any;
};

type CategoryStat = {
  _id: string;
  name: string;
  count: number;
  [key: string]: any;
};

type DashboardStats = {
  totalNotes: number;
  totalLinks: number;
  activityData: ActivityData[];
  categoryStats: CategoryStat[];
};

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const activityData = stats?.activityData || [];
  const categoryColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const categoryStats = stats?.categoryStats || [];

  // Prepare bar chart data
  const barChartData = {
    labels: activityData.slice(-7).map((d) => d.date.slice(-5)), // Last 7 days, show MM-DD
    datasets: [
      {
        data: activityData.slice(-7).map((d) => d.notes || 0),
      },
    ],
  };

  // Prepare pie chart data
  const pieChartData = categoryStats.slice(0, 6).map((cat, i) => ({
    name: cat.name,
    population: cat.count,
    color: categoryColors[i % categoryColors.length],
    legendFontColor: theme === 'dark' ? '#94a3b8' : '#64748b',
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    backgroundGradientFrom: theme === 'dark' ? '#1e293b' : '#ffffff',
    backgroundGradientTo: theme === 'dark' ? '#1e293b' : '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => (theme === 'dark' ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`),
    labelColor: (opacity = 1) => (theme === 'dark' ? `rgba(148, 163, 184, ${opacity})` : `rgba(100, 116, 139, ${opacity})`),
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme === 'dark' ? '#334155' : '#e2e8f0',
    },
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold">Workspace Overview</Text>
        <Text className="text-muted-foreground">Keep track of your productivity</Text>
      </View>

      <View className="flex-row gap-4 mb-6">
        <Card className="flex-1 border-border">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Notes</CardTitle>
            <FileText size={16} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <Text className="text-2xl font-bold">{stats?.totalNotes || 0}</Text>
          </CardContent>
        </Card>

        <Card className="flex-1 border-border">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Links</CardTitle>
            <LinkIcon size={16} className="text-green-500" />
          </CardHeader>
          <CardContent>
            <Text className="text-2xl font-bold">{stats?.totalLinks || 0}</Text>
          </CardContent>
        </Card>
      </View>

      <Card className="mb-6 border-border">
        <CardHeader className="flex-row items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          <CardTitle>Activity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {activityData.length > 0 ? (
            <BarChart
              data={barChartData}
              width={screenWidth - 64}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={{ borderRadius: 8 }}
              fromZero
            />
          ) : (
            <View className="h-[200] items-center justify-center">
              <Text className="text-muted-foreground">No recent activity</Text>
            </View>
          )}
        </CardContent>
      </Card>

      <Card className="mb-10 border-border">
        <CardHeader className="flex-row items-center gap-2">
          <PieChartIcon size={18} className="text-primary" />
          <CardTitle>Content Distribution</CardTitle>
        </CardHeader>
        <CardContent className="items-center">
          {categoryStats.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={screenWidth - 64}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          ) : (
            <View className="h-[150] items-center justify-center">
              <Text className="text-muted-foreground">No data available</Text>
            </View>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}
