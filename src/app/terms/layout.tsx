import { Footer } from "@/components/layout/footer";

export default function StaticPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
