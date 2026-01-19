'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/store/useUIStore';
import { LayoutGrid, Link as LinkIcon, List, LogOut, Moon, Shield, Sun } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { data: session } = useSession();
  const { theme, toggleTheme, layoutMode, setLayoutMode } = useUIStore();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Notes', path: '/notes', icon: List },
    { name: 'Links', path: '/links', icon: LinkIcon },
  ];

  if ((session?.user as any)?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col p-4 z-50">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold italic">K</span>
        </div>
        <span className="text-xl font-bold tracking-tight">Keep-Notes</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={pathname === item.path ? "default" : "ghost"}
            className="w-full justify-start font-medium gap-3"
          >
            <Link href={item.path}>
              <item.icon className="size-4" />
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-4 shrink-0">
        <Separator className="mb-4" />
        <div className="flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="size-[1.2rem]" /> : <Sun className="size-[1.2rem]" />}
          </Button>
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={layoutMode === 'grid' ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setLayoutMode('grid')}
              className={`h-7 w-7 ${layoutMode === 'grid' ? 'bg-card shadow-sm' : ''}`}
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant={layoutMode === 'list' ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setLayoutMode('list')}
              className={`h-7 w-7 ${layoutMode === 'list' ? 'bg-card shadow-sm' : ''}`}
            >
              <List className="size-3.5" />
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
        >
          <LogOut className="size-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
