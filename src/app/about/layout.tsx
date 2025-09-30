import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function StaticPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}
