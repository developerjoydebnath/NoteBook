'use client';

import AppLayout from '@/components/AppLayout';
import { fetchApi } from '@/lib/api';
import { useDataStore } from '@/store/useDataStore';
import { Activity, FileText, Link as LinkIcon, PieChart as PieChartIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const stats = useDataStore((state) => state.stats);
  const statsFetched = useDataStore((state) => state.fetched.stats);
  const setStats = useDataStore((state) => state.setStats);
  const [loading, setLoading] = useState(!statsFetched);

  const fetchStats = useCallback(async (force = false) => {
    if (status !== 'authenticated' || !session) return;
    if (statsFetched && !force) return;

    if (force) setLoading(true);
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      }, (session as any)?.accessToken);

      if (res && res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user, status, statsFetched, setStats]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, fetchStats]);

  if (loading) return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-8 text-foreground">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your productivity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalNotes || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Stored securely</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Website Links</CardTitle>
              <LinkIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLinks || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Your bookmarks</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center gap-2">
              <Activity className="size-4 text-primary" />
              <CardTitle className="text-lg">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.activityData || []}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--foreground)',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                    />
                    <Bar dataKey="notes" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="links" fill="currentColor" className="fill-muted-foreground/30" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center gap-2">
              <PieChartIcon className="size-4 text-primary" />
              <CardTitle className="text-lg">Categories Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {stats?.categoryStats?.map((cat: any) => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold">{cat.name}</span>
                      <Badge variant="outline" className="w-fit text-[10px] h-4 mt-1 uppercase font-bold px-1.5">
                        {cat.type}
                      </Badge>
                    </div>
                    <span className="font-bold text-xl">{cat.count}</span>
                  </div>
                ))}
                {(!stats?.categoryStats || stats.categoryStats.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <PieChartIcon className="size-12 opacity-10 mb-2" />
                    <p>No category data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
