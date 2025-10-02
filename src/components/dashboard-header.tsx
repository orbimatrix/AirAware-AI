'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Trophy } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUserScore } from '@/hooks/use-user-score';

export function DashboardHeader() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'userAvatar');
  const { score } = useUserScore();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent-foreground">
            <Trophy className="h-5 w-5 text-accent" />
            <span>{score.toLocaleString()} Points</span>
        </div>
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
