'use client';
import Link from "next/link";
import { Leaf, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "About", href: "/about" },
    { label: "Features", href: "/#features" },
];

const DesktopNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
  
    return (
        <Link href={href}>
          <span className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            isActive ? "text-primary" : "text-muted-foreground"
          )}>
            {children}
          </span>
        </Link>
    );
};

const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
  
    return (
      <SheetClose asChild>
        <Link href={href}>
          <span className={cn(
            "text-lg font-medium transition-colors hover:text-primary",
            isActive ? "text-primary" : "text-muted-foreground"
          )}>
            {children}
          </span>
        </Link>
      </SheetClose>
    );
};


export function Header() {
  const { user, isUserLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2.5 mr-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-xl font-headline font-bold hidden sm:inline-block">Saaf Hawa</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          {navItems.map(item => <DesktopNavLink key={item.href} href={item.href}>{item.label}</DesktopNavLink>)}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
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
                {navItems.map(item => <MobileNavLink key={item.href} href={item.href}>{item.label}</MobileNavLink>)}
              </nav>
              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
                 {!isUserLoading && !user && (
                    <>
                        <SheetClose asChild>
                            <Button asChild variant="outline">
                                <Link href="/login">Log In</Link>
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                             <Button asChild>
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
