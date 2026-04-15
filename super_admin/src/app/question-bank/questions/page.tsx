"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { QuestionsList } from "@/components/qbank/QuestionsList";
import { QuestionFolderSidebar } from "@/components/qbank/QuestionFolderSidebar";
import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderTree } from "lucide-react";

function QuestionsViewContent() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId") || null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleFolderSelect = useCallback((folderId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (folderId) {
      params.set("folderId", folderId);
    } else {
      params.delete("folderId");
    }
    params.delete("page"); // Reset to page 1 on folder change
    router.push(`/question-bank/questions?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
          {/* Folder Sidebar */}
          <QuestionFolderSidebar
            selectedFolderId={currentFolderId}
            onFolderSelect={handleFolderSelect}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1200px] mx-auto animate-fade-in">
              {/* Expand sidebar button when collapsed */}
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  Show Folders
                </button>
              )}
              <QuestionsList selectedFolderId={currentFolderId} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function QuestionsViewPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <QuestionsViewContent />
    </Suspense>
  );
}
