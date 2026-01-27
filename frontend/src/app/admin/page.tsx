'use client';

import AppLayout from '@/components/AppLayout';
import { fetchApi } from '@/lib/api';
import { useDataStore } from '@/store/useDataStore';
import { FileText, Link as LinkIcon, Trash2, User as UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const users = useDataStore((state) => state.users);
  const usersFetched = useDataStore((state) => state.fetched.users);
  const setUsers = useDataStore((state) => state.setUsers);
  const [loading, setLoading] = useState(!usersFetched);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const fetchUsers = useCallback(async (force = false) => {
    if (status !== 'authenticated' || !session) return;
    if (usersFetched && !force) return;

    if (force) setLoading(true);
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });

      if (res && res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [session, status, usersFetched, setUsers]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status, fetchUsers]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });
      if (res && res.ok) {
        fetchUsers(true);
      }
    } catch (err) {
      console.error('Delete user failed:', err);
    } finally {
      setUserToDelete(null);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res && res.ok) {
        fetchUsers(true);
      }
    } catch (err) {
      console.error('Update role failed:', err);
    }
  };

  if (loading) return (
    <AppLayout>
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 text-muted-foreground" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Monitor system users and their activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any) => (
            <div key={user._id} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <UserIcon size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight truncate">{user.username}</h3>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                {user._id !== (session?.user as any)?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => setUserToDelete(user)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Notes</p>
                    <p className="font-bold">{user.notesCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Links</p>
                    <p className="font-bold">{user.linksCount}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleUpdateRole(user._id, value)}
                    disabled={user._id === (session?.user as any)?.id}
                  >
                    <SelectTrigger className="h-7 w-24 text-[10px] font-bold uppercase">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">USER</SelectItem>
                      <SelectItem value="admin">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete User Dialog */}
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{userToDelete?.username}&quot;?
                This will permanently delete their account and all associated notes, links, and categories. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} asChild>
                <Button variant="destructive">Delete User</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
