'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function DashboardHeader() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'userAvatar');

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-9 w-9">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
          <AvatarFallback>UP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
