'use client';

import AppLayout from '@/components/AppLayout';
import CategoryModal from '@/components/CategoryModal';
import LinkModal from '@/components/LinkModal';
import { fetchApi } from '@/lib/api';
import { useDataStore } from '@/store/useDataStore';
import { Edit2, ExternalLink, FolderPlus, Link as LinkIcon, Plus, Search, Tag, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function LinksPage() {
  const { data: session, status } = useSession();
  const links = useDataStore((state) => state.links);
  const categories = useDataStore((state) => state.categories);
  const linksFetched = useDataStore((state) => state.fetched.links);
  const setLinks = useDataStore((state) => state.setLinks);
  const setCategories = useDataStore((state) => state.setCategories);

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!linksFetched);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);

  // AlertDialog state
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const fetchLinks = useCallback(async () => {
    if (status !== 'authenticated' || !session) return;

    setLoading(true);
    try {
      const catQuery = activeCategory === 'all' ? '' : `&category=${activeCategory}`;
      const searchQuery = search ? `&search=${search}` : '';
      const res = await fetchApi(
        `${process.env.NEXT_PUBLIC_API_URL}/links?page=${page}${catQuery}${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
        },
        (session as any)?.accessToken
      );
      if (res && res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user, status, activeCategory, search, page, setLinks]);

  const fetchCategories = useCallback(async () => {
    if (status !== 'authenticated' || !session) return;
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/categories?type=website`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      }, (session as any)?.accessToken);
      if (res && res.ok) {
        const data = await res.json();
        setCategories('website', data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, [session?.user, status, setCategories]);

  const handleDeleteLink = async () => {
    if (!linkToDelete) return;
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/links/${linkToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      }, (session as any)?.accessToken);
      if (res && res.ok) fetchLinks();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLinkToDelete(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      }, (session as any)?.accessToken);
      if (res && res.ok) {
        if (activeCategory === categoryToDelete._id) setActiveCategory('all');
        fetchCategories();
        fetchLinks();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setCategoryToDelete(null);
    }
  };

  const openAddLink = () => {
    setEditingLink(null);
    setIsLinkModalOpen(true);
  };

  const openEditLink = (link: any) => {
    setEditingLink(link);
    setIsLinkModalOpen(true);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLinks();
    }
  }, [status, fetchLinks]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCategories();
    }
  }, [status, fetchCategories]);

  return (
    <AppLayout>
      <div className="space-y-6 text-foreground">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Website Links</h1>
            <p className="text-muted-foreground">Manage your favorite bookmarks</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsCatModalOpen(true)}
              className="flex-1 sm:flex-none gap-2"
            >
              <FolderPlus className="size-4" />
              <span>New Category</span>
            </Button>
            <Button
              onClick={openAddLink}
              className="flex-1 sm:flex-none gap-2"
            >
              <Plus className="size-4" />
              <span>Add Link</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide max-w-full">
            <Button
              variant={activeCategory === 'all' ? "default" : "secondary"}
              size="sm"
              onClick={() => { setActiveCategory('all'); setPage(1); }}
              className="rounded-full px-4 h-8 shrink-0"
            >
              All
            </Button>
            {categories.website.map((cat: any) => (
              <div key={cat._id} className="group/cat relative flex items-center shrink-0">
                <Button
                  variant={activeCategory === cat._id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => { setActiveCategory(cat._id); setPage(1); }}
                  className={`rounded-full h-8 whitespace-nowrap ${activeCategory === cat._id ? 'pr-8' : 'group-hover/cat:pr-8'} transition-all`}
                >
                  {cat.name}
                </Button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategoryToDelete(cat);
                  }}
                  className={`absolute right-2 p-1 rounded-full hover:bg-destructive/20 text-destructive opacity-0 group-hover/cat:opacity-100 transition-opacity ${activeCategory === cat._id ? 'opacity-100' : ''}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search links..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 h-full space-y-6">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="size-8 rounded-md shrink-0" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <Skeleton className="size-8 rounded-md shrink-0" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link: any) => (
              <div
                key={link._id}
                className="group bg-card border border-border rounded-lg shadow-xs p-6 hover:border-primary/50 transition-all flex flex-col h-full overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-md shrink-0">
                      <LinkIcon className="text-primary size-4" />
                    </div>
                    <h3 className="font-bold text-lg truncate">{link.name}</h3>
                  </div>
                  <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                  {link.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal gap-1 px-2 py-0 h-5">
                      <Tag className="size-3" />
                      {link.categoryId?.name || 'Uncategorized'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditLink(link)}
                    ><Edit2 className="size-4" /></Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setLinkToDelete(link._id)}
                    ><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className="w-9 h-9 p-0"
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}

        {!loading && links.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground">No links found matching your criteria</p>
            <Button variant="link" onClick={openAddLink} className="mt-2 text-primary font-medium hover:underline">Add your first website link</Button>
          </div>
        )}

        <LinkModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          onSuccess={() => fetchLinks()}
          link={editingLink}
          categories={categories.website}
          accessToken={(session as any)?.accessToken}
        />

        <CategoryModal
          isOpen={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
          onSuccess={() => fetchCategories()}
          type="website"
          accessToken={(session as any)?.accessToken}
        />

        {/* Delete Link Dialog */}
        <AlertDialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Website Link?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your website link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteLink} asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Category Dialog */}
        <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
              <AlertDialogDescription>
                Deleting &quot;{categoryToDelete?.name}&quot; will move all its links to &quot;Uncategorized&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCategory} asChild>
                <Button variant="destructive">Delete Category</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
