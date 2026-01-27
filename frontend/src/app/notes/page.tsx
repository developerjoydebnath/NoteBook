'use client';

import AppLayout from '@/components/AppLayout';
import CategoryModal from '@/components/CategoryModal';
import NoteModal from '@/components/NoteModal';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchApi } from '@/lib/api';
import { useDataStore } from '@/store/useDataStore';
import { useUIStore } from '@/store/useUIStore';
import { Calendar, Edit2, FolderPlus, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

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

export default function NotesPage() {
  const { status } = useSession();
  const { layoutMode } = useUIStore();
  const notes = useDataStore((state) => state.notes);
  const categories = useDataStore((state) => state.categories);
  const setNotes = useDataStore((state) => state.setNotes);
  const setCategories = useDataStore((state) => state.setCategories);

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  // AlertDialog state
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const { mutate } = useSWRConfig();
  const debouncedSearch = useDebounce(search, 1000);

  const catQuery = activeCategory === 'all' ? '' : `&category=${activeCategory}`;
  const searchQuery = debouncedSearch ? `&search=${debouncedSearch}` : '';
  const notesUrl = status === 'authenticated' ? `/notes?page=${page}${catQuery}${searchQuery}` : null;
  const categoriesUrl = status === 'authenticated' ? `/categories?type=note` : null;

  const { data: notesData, isLoading: notesLoading } = useSWR(notesUrl);
  const { data: categoriesData, isLoading: categoriesLoading } = useSWR(categoriesUrl);

  // Sync with store if needed, or just use local data
  useEffect(() => {
    if (notesData) {
      setNotes(notesData.notes || []);
      setTotalPages(notesData.totalPages || 1);
    }
  }, [notesData, setNotes]);

  useEffect(() => {
    if (categoriesData) {
      setCategories('note', categoriesData || []);
    }
  }, [categoriesData, setCategories]);

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/notes/${noteToDelete}`, {
        method: 'DELETE',
      });
      if (res && res.ok) mutate(notesUrl);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setNoteToDelete(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryToDelete._id}`, {
        method: 'DELETE',
      });
      if (res && res.ok) {
        if (activeCategory === categoryToDelete._id) setActiveCategory('all');
        mutate(categoriesUrl);
        mutate(notesUrl);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setCategoryToDelete(null);
    }
  };

  const openAddNote = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const openEditNote = (note: any) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const loading = notesLoading;

  return (
    <AppLayout>
      <div className="space-y-6 text-foreground">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">Manage and organize your thoughts</p>
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
              onClick={openAddNote}
              className="flex-1 sm:flex-none gap-2"
            >
              <Plus className="size-4" />
              <span>Add Note</span>
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
            {categoriesLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
              ))
            ) : (
              categories.note.map((cat: any) => (
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
                    className={`absolute right-2 p-1 cursor-pointer rounded-full opacity-0 group-hover/cat:opacity-100 transition-opacity ${activeCategory === cat._id ? 'opacity-100 text-background hover:bg-background/20' : 'text-destructive hover:bg-destructive/20'}`}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search notes..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`bg-card border border-border rounded-lg p-6 ${layoutMode === 'list' ? 'flex flex-row items-center gap-4' : 'h-full space-y-4'}`}>
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
                <div className={`pt-4 border-t border-border/50 flex gap-2 ${layoutMode === 'list' ? 'border-t-0 border-l pl-4 shrink-0 w-32' : ''}`}>
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {notes.map((note: any) => (
              <div
                key={note._id}
                className={`group bg-card border border-border rounded-lg shadow-xs hover:border-primary/50 transition-all flex flex-col ${layoutMode === 'list' ? 'flex-row items-center p-4' : 'p-6 h-full'
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{note.title}</h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditNote(note)}
                      ><Edit2 className="size-4" /></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setNoteToDelete(note._id)}
                      ><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                  <div
                    className={`text-muted-foreground text-sm line-clamp-3 mb-4 content-preview`}
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>

                <div className={`flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-border/50 text-xs text-muted-foreground ${layoutMode === 'list' ? 'mt-0 pt-0 border-t-0 border-l border-border pl-4 w-56 ml-4 shrink-0' : ''}`}>
                  <Badge variant="secondary" className="font-normal gap-1 px-2 py-0 h-5">
                    <Tag className="size-3" />
                    {note.categoryId?.name || 'Uncategorized'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
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

        {!loading && notes.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground">No notes found matching your criteria</p>
            <Button variant="link" onClick={openAddNote} className="mt-2">Create your first note</Button>
          </div>
        )}

        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSuccess={() => mutate(notesUrl)}
          note={editingNote}
          categories={categories.note}
        />

        <CategoryModal
          isOpen={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
          onSuccess={() => { mutate(categoriesUrl); mutate(notesUrl); }}
          type="note"
        />

        {/* Delete Note Dialog */}
        <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Note?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteNote} asChild>
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
                Deleting &quot;{categoryToDelete?.name}&quot; will move all its notes to &quot;Uncategorized&quot;. This action cannot be undone.
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
