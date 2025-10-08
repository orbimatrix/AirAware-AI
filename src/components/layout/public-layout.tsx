
'use client'
import { usePathname } from 'next/navigation'
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/hazard-zones') || pathname.startsWith('/recommendations') || pathname.startsWith('/health-journal') || pathname.startsWith('/carbon-footprint') || pathname.startsWith('/challenges') || pathname.startsWith('/eco-map') || pathname.startsWith('/education');

    // Don't render public layout for auth pages or app pages
    if(pathname.startsWith('/login') || pathname.startsWith('/signup') || isAppPage) {
        return <>{children}</>;
    }
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
