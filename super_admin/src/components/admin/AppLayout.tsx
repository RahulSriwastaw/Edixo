"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isOpen } = useSidebarStore();

    // Exclude auth routes and other non-dashboard routes from layout
    const isExcluded = pathname.startsWith("/login") || pathname === "/forgot-password" || pathname.startsWith("/public-website");

    if (isExcluded) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-4 lg:p-5">
                    {children}
                </main>
            </div>
        </>
    );
}
