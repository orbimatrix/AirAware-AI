
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Leaf } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { MainNav } from "@/components/main-nav";
import { Badge } from "@/components/ui/badge";
import { AuthLayout } from "@/components/auth-layout";
import { Footer } from "@/components/layout/footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Leaf className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-headline font-bold">Saaf Hawa</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
          <SidebarFooter>
             <Badge variant="outline">Version 1.1</Badge>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="p-4 sm:p-6">{children}</main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </AuthLayout>
  );
}
