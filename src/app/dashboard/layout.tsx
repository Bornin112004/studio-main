"use client";

import {
  FileText,
  LayoutDashboard,
  LogOut,
  Plug,
  Settings,
  User,
  Megaphone,
  GitMerge,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { KpiDataProvider } from "@/context/kpi-data-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <KpiDataProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  isActive={pathname === '/dashboard'}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Marketing" isActive={pathname === '/dashboard/marketing'}>
                  <Link href="/dashboard/marketing">
                    <Megaphone />
                    <span>Marketing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Engineering" isActive={pathname === '/dashboard/engineering'}>
                  <Link href="/dashboard/engineering">
                    <GitMerge />
                    <span>Engineering</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Testing" isActive={pathname === '/dashboard/testing'}>
                  <Link href="/dashboard/testing">
                    <ListChecks />
                    <span>Testing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Reports" isActive={pathname === '/dashboard/reports'}>
                  <Link href="/dashboard/reports">
                    <FileText />
                    <span>Monthly Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Integrations" isActive={pathname === '/dashboard/integrations'}>
                  <Link href="/dashboard/integrations">
                    <Plug />
                    <span>Integrations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex-1 cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent flex">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://picsum.photos/seed/1/32/32" alt="User avatar" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium">
                        Alex Denton
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        alex.denton@insightboard.com
                      </span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Alex Denton</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        alex.denton@insightboard.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </KpiDataProvider>
  );
}
