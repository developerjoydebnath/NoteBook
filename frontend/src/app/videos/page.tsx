'use client';

import AppLayout from '@/components/AppLayout';
import CategoryModal from '@/components/CategoryModal';
import VideoModal from '@/components/VideoModal';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchApi } from '@/lib/api';
import { useDataStore } from '@/store/useDataStore';
import { Edit2, FolderPlus, Play, Plus, Search, Trash2, Youtube } from 'lucide-react';
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

export default function VideosPage() {
  const { status } = useSession();
  const videos = useDataStore((state) => state.videos);
  const categories = useDataStore((state) => state.categories);
  const setVideos = useDataStore((state) => state.setVideos);
  const setCategories = useDataStore((state) => state.setCategories);

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Modal states
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  // AlertDialog state
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const { mutate } = useSWRConfig();
  const debouncedSearch = useDebounce(search, 1000);

  const catQuery = activeCategory === 'all' ? '' : `&category=${activeCategory}`;
  const searchQuery = debouncedSearch ? `&search=${debouncedSearch}` : '';
  const videosUrl = status === 'authenticated' ? `/videos?limit=100${catQuery}${searchQuery}` : null;
  const categoriesUrl = status === 'authenticated' ? `/categories?type=video` : null;

  const { data: videosData, isLoading: videosLoading } = useSWR(videosUrl);
  const { data: categoriesData, isLoading: categoriesLoading } = useSWR(categoriesUrl);

  useEffect(() => {
    if (videosData) {
      setVideos(videosData.videos || []);
      if (videosData.videos?.length > 0 && !selectedVideo) {
        setSelectedVideo(videosData.videos[0]);
      }
    }
  }, [videosData, setVideos, selectedVideo]);

  useEffect(() => {
     setIsDescExpanded(false);
  }, [selectedVideo]);

  useEffect(() => {
    if (categoriesData) {
      setCategories('video', categoriesData || []);
    }
  }, [categoriesData, setCategories]);

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    try {
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/videos/${videoToDelete}`, {
        method: 'DELETE',
      });
      if (res && res.ok) {
        mutate(videosUrl);
        if (selectedVideo?._id === videoToDelete) {
           setSelectedVideo(videos.find(v => v._id !== videoToDelete) || null);
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setVideoToDelete(null);
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
        mutate(videosUrl);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setCategoryToDelete(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-foreground pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">YouTube Playlist</h1>
            <p className="text-muted-foreground">Catch up on your favorite videos</p>
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
              onClick={() => { setEditingVideo(null); setIsVideoModalOpen(true); }}
              className="flex-1 sm:flex-none gap-2"
            >
              <Plus className="size-4" />
              <span>Add Video</span>
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center px-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide max-w-full">
            <Button
              variant={activeCategory === 'all' ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="rounded-full px-4 h-8 shrink-0"
            >
              All
            </Button>
            {categoriesLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
              ))
            ) : (
              categories.video.map((cat: any) => (
                <div key={cat._id} className="group/cat relative flex items-center shrink-0">
                  <Button
                    variant={activeCategory === cat._id ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveCategory(cat._id)}
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
              placeholder="Search videos..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-4">
          {/* Player side */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl bg-black border border-border/40">
                  <iframe
                    src={`${selectedVideo.embedUrl}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="flex justify-between items-start gap-4 p-2">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold line-clamp-2">{selectedVideo.title}</h2>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="px-1.5 py-0 h-5 font-bold uppercase text-[10px] text-primary bg-primary/5">
                        {selectedVideo.categoryId?.name || 'Uncategorized'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Added on {new Date(selectedVideo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => { setEditingVideo(selectedVideo); setIsVideoModalOpen(true); }}
                    ><Edit2 className="size-4" /></Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setVideoToDelete(selectedVideo._id)}
                    ><Trash2 className="size-4" /></Button>
                  </div>
                </div>

                {/* Video Description */}
                <div className="bg-muted/40 rounded-xl p-4 transition-all group/desc">
                  {selectedVideo.description ? (
                    <>
                      <p className={`text-sm whitespace-pre-wrap ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
                        {selectedVideo.description}
                      </p>
                      <button 
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-xs font-bold mt-2 text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                      >
                        {isDescExpanded ? 'Show less' : '...more'}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No description available for this video.
                    </p>
                  )}
                </div>
              </div>
            ) : videosLoading ? (
              <div className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ) : (
                <div className="aspect-video w-full rounded-xl bg-muted/30 flex flex-col items-center justify-center border-2 border-dashed border-border p-10 text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Youtube className="size-12 text-primary opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No videos found</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">Select a video from the list or add a new YouTube link to start building your collection.</p>
                  <Button onClick={() => setIsVideoModalOpen(true)}>Add Your First Video</Button>
                </div>
            )}
          </div>

          {/* Sidebar list */}
          <div className="xl:col-span-4 flex flex-col gap-4">
             <div className="flex items-center gap-2 mb-2">
                <Play className="size-4 text-primary fill-primary" />
                <h3 className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Up Next</h3>
             </div>
             
             <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin">
               {videosLoading ? (
                 [...Array(6)].map((_, i) => (
                   <div key={i} className="flex gap-3">
                     <Skeleton className="w-40 h-24 rounded-lg shrink-0" />
                     <div className="flex-1 space-y-2 py-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                     </div>
                   </div>
                 ))
               ) : (
                 videos.map((vid: any) => (
                   <div
                    key={vid._id}
                    onClick={() => setSelectedVideo(vid)}
                    className={`flex gap-3 group cursor-pointer transition-all p-2 rounded-xl hover:bg-muted/50 ${selectedVideo?._id === vid._id ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                   >
                     <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm border border-border/30">
                        <img 
                          src={vid.thumbnailUrl} 
                          alt={vid.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${selectedVideo?._id === vid._id ? 'opacity-40' : ''}`}>
                          <Play className="size-6 text-white" />
                        </div>
                        {selectedVideo?._id === vid._id && (
                           <div className="absolute bottom-1 right-1 bg-primary px-1 rounded text-[8px] font-bold text-white uppercase tracking-tighter">Now Playing</div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0 py-1">
                        <h4 className={`text-sm font-bold line-clamp-2 leading-tight ${selectedVideo?._id === vid._id ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                          {vid.title}
                        </h4>
                        <div className="flex items-center gap-1 mt-2">
                           <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] font-medium bg-muted group-hover:bg-primary/10 transition-colors">
                            {vid.categoryId?.name || 'Uncategorized'}
                          </Badge>
                        </div>
                     </div>
                   </div>
                 ))
               )}
               {!videosLoading && videos.length === 0 && search && (
                 <div className="py-10 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                    No results for &quot;{search}&quot;
                 </div>
               )}
             </div>
          </div>
        </div>

        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          onSuccess={() => mutate(videosUrl)}
          video={editingVideo}
          categories={categories.video}
        />

        <CategoryModal
          isOpen={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
          onSuccess={() => { mutate(categoriesUrl); mutate(videosUrl); }}
          type="video"
        />

        {/* Delete Video Dialog */}
        <AlertDialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Playlist?</AlertDialogTitle>
              <AlertDialogDescription>
                This video will be removed from your custom playlist. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteVideo} asChild>
                <Button variant="destructive">Remove</Button>
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
                Deleting &quot;{categoryToDelete?.name}&quot; will move all its videos to &quot;Uncategorized&quot;. This action cannot be undone.
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
