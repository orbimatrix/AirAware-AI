'use client';
import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";

export function LandingNavbar() {
  const { user, isUserLoading } = useUser();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 md:px-8 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-xl font-headline font-bold">Saaf Hawa</span>
        </Link>
        <div className="flex items-center gap-4">
          {!isUserLoading &&
            (user ? (
              <Button asChild>
                <Link href="/dashboard">Go to App</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
