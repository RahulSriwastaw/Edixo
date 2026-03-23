"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { QuestionsList } from "@/components/qbank/QuestionsList";
import { 
  Folder, 
  RefreshCw, 
  ArrowLeft, 
  Database, 
  Search,
  ExternalLink,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_URL, getAuthHeaders } from "@/lib/api-config";

const SUBJECTS = [
  "General Awareness",
  "Advanced mathematics",
  "Math Arithmetic",
  "Current Affairs",
  "Hindi",
  "English",
  "Reasoning",
  "Science",
  "Computer",
  "Lucent's Book",
  "UPPCL Previous Year",
  "Sk Jha Science Book"
];

export default function AirtableSyncPage() {
  const { isOpen } = useSidebarStore();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const handleSync = async (tableName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setIsSyncing(tableName);
    const toastId = toast.loading(`Syncing ${tableName}...`);
    
    try {
      const response = await fetch(`${API_URL}/qbank/sync-airtable`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`${tableName} synced: ${data.data.createdCount} new, ${data.data.updatedCount} updated`, { id: toastId });
      } else {
        toast.error(data.message || "Sync failed", { id: toastId });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Network error during sync", { id: toastId });
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedTable && (
                  <Button variant="outline" size="icon" onClick={() => setSelectedTable(null)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedTable ? `${selectedTable} Questions` : "Airtable Question Source"}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {selectedTable 
                      ? `Sync and manage questions from the ${selectedTable} table.`
                      : "Manage your question bank tables synced directly from Airtable."}
                  </p>
                </div>
              </div>
              
              {!selectedTable && (
                <div className="flex gap-3">
                   <Button variant="outline" className="btn-secondary" onClick={() => window.open('https://airtable.com', '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Airtable
                  </Button>
                </div>
              )}
            </div>

            {/* Content Area */}
            {selectedTable ? (
              <div className="flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl border flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-4">
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 px-3 py-1">
                        Table: {selectedTable}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Source: Airtable Sync
                      </span>
                   </div>
                   <Button 
                    disabled={!!isSyncing} 
                    onClick={() => handleSync(selectedTable)}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                   >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing === selectedTable && "animate-spin")} />
                    Sync Table Now
                   </Button>
                </div>
                
                <QuestionsList 
                  defaultFilters={[
                    { id: "airtable-filter", field: "airtableTableName", operator: "equals", value: selectedTable }
                  ]} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                {SUBJECTS.map((subject) => (
                  <Card 
                    key={subject} 
                    className="hover:border-brand-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                    onClick={() => setSelectedTable(subject)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                          <Folder className="w-6 h-6" />
                       </div>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={!!isSyncing}
                        onClick={(e) => handleSync(subject, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                        <RefreshCw className={cn("w-4 h-4", isSyncing === subject && "animate-spin")} />
                       </Button>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg font-bold truncate">{subject}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                         <Badge variant="outline" className="text-[10px] font-normal">Table</Badge>
                         <span className="text-xs text-gray-400">Click to view questions</span>
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Footer / Help */}
            {!selectedTable && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 mt-8">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold">How it works:</p>
                  <p className="mt-1">Each subject corresponds to a table in your Airtable Base. Clicking "Sync" will fetch/update all questions from that specific table into your local database. You can then edit them or make them public for students.</p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
