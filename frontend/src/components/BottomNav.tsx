'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from '@/store/useUIStore';
import { LayoutGrid, Link as LinkIcon, List, LogOut, Moon, MoreHorizontal, Shield, Sun, Youtube } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useUIStore();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutGrid },
    { name: 'Notes', path: '/notes', icon: List },
    { name: 'Videos', path: '/videos', icon: Youtube },
    { name: 'Links', path: '/links', icon: LinkIcon },
  ];

  if ((session?.user as any)?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 flex items-center justify-around z-50 pb-safe">
      {navItems.map((item) => (
        <Link
          prefetch={false}
          key={item.path}
          href={item.path}
          className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${pathname === item.path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <item.icon className="size-5" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </Link>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="size-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mb-2">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme} className="justify-between">
            Appearance
            {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-destructive focus:text-destructive gap-2"
          >
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
