'use client';
import Link from 'next/link';
import { Leaf, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
    { label: "Features", href: "/#features" },
    { label: "About", href: "/about" },
];

export function Header() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
      <div className="container flex h-16 items-center p-0">
        <Link href="/" className="flex items-center gap-2 mr-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-xl font-headline font-bold hidden sm:inline-block">Saaf Hawa</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto sm:ml-6">
          {!isUserLoading && (
            user ? (
              <Button asChild>
                <Link href="/dashboard">Go to App</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )
          )}

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-6 mt-8">
                {navItems.map(item => (
                   <SheetClose asChild key={item.href}>
                     <Link
                      href={item.href}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
                 {!isUserLoading && !user && (
                    <>
                        <SheetClose asChild>
                            <Button asChild variant="outline" className='w-full'>
                                <Link href="/login">Log In</Link>
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                             <Button asChild className='w-full'>
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </SheetClose>
                    </>
                 )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
