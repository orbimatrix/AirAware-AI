'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Map, HeartPulse, Footprints, Trophy, ShieldAlert, MessageSquarePlus, BookHeart, GraduationCap, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, tooltip: 'Dashboard' },
  { href: '/hazard-zones', label: 'Hazard Zones', icon: ShieldAlert, tooltip: 'Hazard Zones' },
  { href: '/health-journal', label: 'Health Journal', icon: BookHeart, tooltip: 'Health Journal' },
  { href: '/carbon-footprint', label: 'Carbon Footprint', icon: Footprints, tooltip: 'Carbon Footprint' },
  { href: '/challenges', label: 'Eco-Challenges', icon: Trophy, tooltip: 'Eco-Challenges' },
  { href: '/eco-map', label: 'Eco-Map', icon: MessageSquarePlus, tooltip: 'Eco-Map' },
  { href: '/education', label: 'Education', icon: GraduationCap, tooltip: 'Education' },
  { href: '/profile', label: 'Profile', icon: User, tooltip: 'Profile' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton 
            asChild 
            isActive={pathname.startsWith(item.href)}
            tooltip={item.tooltip}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
