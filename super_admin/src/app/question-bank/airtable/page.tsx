"use client";

import React, { useState, useEffect } from "react";
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
  Info,
  Plus,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_URL, getAuthHeaders } from "@/lib/api-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AirtableFolder {
  id: string;
  name: string;
  slug: string;
  totalQuestions?: number;
  updatedAt: string;
}

interface AirtableMetaTable {
  id: string;
  name: string;
}

export default function AirtableSyncPage() {
  const { isOpen } = useSidebarStore();
  
  // State
  const [folders, setFolders] = useState<AirtableFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<AirtableFolder | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetFolder, setTargetFolder] = useState<AirtableFolder | null>(null);
  
  // Fetching Base Tables
  const [baseTables, setBaseTables] = useState<AirtableMetaTable[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  
  // Form states
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedBaseTable, setSelectedBaseTable] = useState("");

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setIsLoadingFolders(true);
      const res = await fetch(`${API_URL}/qbank/airtable-folders`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setFolders(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch custom airtable folders", err);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const fetchBaseTables = async () => {
    try {
      setIsLoadingTables(true);
      const res = await fetch(`${API_URL}/qbank/airtable/tables`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setBaseTables(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch tables from Airtable");
      }
    } catch (err) {
      toast.error("Network error fetching tables");
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleOpenAddModal = () => {
    if (baseTables.length === 0) fetchBaseTables();
    setNewFolderName("");
    setSelectedBaseTable("");
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async () => {
    if (!newFolderName || !selectedBaseTable) {
      return toast.error("Please provide a name and select a table");
    }
    const toastId = toast.loading("Adding folder...");
    try {
      const res = await fetch(`${API_URL}/qbank/airtable-folders`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, airtableTableName: selectedBaseTable }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Folder added!", { id: toastId });
        setFolders([data.data, ...folders]);
        setIsAddModalOpen(false);
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (err) {
      toast.error("Error adding folder", { id: toastId });
    }
  };

  const handleEditSubmit = async () => {
    if (!targetFolder || !newFolderName) return;
    const toastId = toast.loading("Updating...");
    try {
      const res = await fetch(`${API_URL}/qbank/airtable-folders/${targetFolder.id}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Folder renamed!", { id: toastId });
        setFolders(folders.map(f => f.id === targetFolder.id ? { ...f, name: newFolderName } : f));
        setIsEditModalOpen(false);
        if (selectedFolder?.id === targetFolder.id) setSelectedFolder({ ...selectedFolder, name: newFolderName });
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (err) {
      toast.error("Error updating folder", { id: toastId });
    }
  };

  const handleDeleteSubmit = async () => {
    if (!targetFolder) return;
    const toastId = toast.loading("Deleting folder and local questions...");
    try {
      const res = await fetch(`${API_URL}/qbank/airtable-folders/${targetFolder.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Folder and local questions deleted!", { id: toastId });
        setFolders(folders.filter(f => f.id !== targetFolder.id));
        if (selectedFolder?.id === targetFolder.id) setSelectedFolder(null);
        setIsDeleteModalOpen(false);
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (err) {
      toast.error("Error deleting folder", { id: toastId });
    }
  };

  const handleSync = async (folder: AirtableFolder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSyncing(folder.id);
    const toastId = toast.loading(`Syncing ${folder.name}...`);
    try {
      const response = await fetch(`${API_URL}/qbank/sync-airtable`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: folder.slug }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`${folder.name} synced: ${data.data.createdCount} new, ${data.data.updatedCount} updated`, { id: toastId });
        // Refresh folders to update question count and sync date
        fetchFolders();
      } else {
        toast.error(data.message || "Sync failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error during sync", { id: toastId });
    } finally {
      setIsSyncing(null);
    }
  };

  const handleSyncBase = async () => {
    if (folders.length === 0) {
      return toast.info("No folders to sync. Please add some tables first.");
    }
    const toastId = toast.loading(`Starting Base Sync for ${folders.length} tables...`);
    let successCount = 0;
    let failCount = 0;

    for (const folder of folders) {
      setIsSyncing(folder.id);
      try {
        const response = await fetch(`${API_URL}/qbank/sync-airtable`, {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ tableName: folder.slug }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }
    setIsSyncing(null);
    fetchFolders(); // Refresh counts and dates after base sync
    if (failCount === 0) {
      toast.success(`Base Sync Complete! Synced ${successCount} tables successfully.`, { id: toastId });
    } else {
      toast.warning(`Base Sync finished: ${successCount} successful, ${failCount} failed.`, { id: toastId });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFolder && (
                  <Button variant="outline" size="icon" onClick={() => setSelectedFolder(null)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedFolder ? `${selectedFolder.name} Questions` : "Airtable Question Source"}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {selectedFolder 
                      ? `Sync and manage questions from the "${selectedFolder.slug}" table.`
                      : "Manage your question bank tables synced directly from Airtable."}
                  </p>
                </div>
              </div>
              
              {!selectedFolder && (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSyncBase} 
                    variant="outline"
                    disabled={isSyncing !== null || folders.length === 0}
                    className="border-brand-primary text-brand-primary hover:bg-brand-primary/10"
                  >
                    <Database className={cn("w-4 h-4 mr-2", isSyncing !== null && "animate-pulse")} />
                    {isSyncing !== null ? "Syncing Base..." : "Sync All Tables (Base)"}
                  </Button>
                  <Button onClick={handleOpenAddModal} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Table Folder
                  </Button>
                </div>
              )}
            </div>

            {/* Content Area */}
            {selectedFolder ? (
              <div className="flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl border flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-4">
                      <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 px-3 py-1">
                        Display: {selectedFolder.name}
                      </Badge>
                      <span className="text-sm text-gray-500 font-mono">
                        Airtable: {selectedFolder.slug}
                      </span>
                   </div>
                   <Button 
                    disabled={isSyncing === selectedFolder.id} 
                    onClick={() => handleSync(selectedFolder)}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                   >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing === selectedFolder.id && "animate-spin")} />
                    Sync Table Now
                   </Button>
                </div>
                
                <QuestionsList 
                  defaultFilters={[
                    { id: "airtable-filter", field: "airtableTableName", operator: "equals", value: selectedFolder.slug }
                  ]} 
                />
              </div>
            ) : (
              <>
                {isLoadingFolders ? (
                  <div className="text-center py-10 text-gray-500 animate-pulse">Loading synced folders...</div>
                ) : folders.length === 0 ? (
                  <div className="text-center py-20 bg-white border rounded-xl shadow-sm">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Airtable tables added yet</h3>
                    <p className="text-gray-500 mt-1 mb-6">Click "Add Table Folder" to select a table from your Airtable base.</p>
                    <Button onClick={handleOpenAddModal} className="bg-brand-primary text-white">
                      <Plus className="w-4 h-4 mr-2" /> Add Your First Table
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                    {folders.map((folder) => (
                      <Card 
                        key={folder.id} 
                        className="hover:border-brand-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-md relative"
                        onClick={() => setSelectedFolder(folder)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                              <Folder className="w-6 h-6" />
                           </div>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               disabled={isSyncing === folder.id}
                               onClick={(e) => handleSync(folder, e)}
                             >
                               <RefreshCw className={cn("w-4 h-4", isSyncing === folder.id && "animate-spin")} />
                             </Button>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                   <MoreVertical className="w-4 h-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setTargetFolder(folder); setNewFolderName(folder.name); setIsEditModalOpen(true); }}>
                                   <Edit2 className="w-4 h-4 mr-2" /> Rename Folder
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => { e.stopPropagation(); setTargetFolder(folder); setIsDeleteModalOpen(true); }}>
                                   <Trash2 className="w-4 h-4 mr-2" /> Delete Folder
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                           </div>
                        </CardHeader>
                        <CardContent>
                          <CardTitle className="text-lg font-bold truncate">{folder.name}</CardTitle>
                          <CardDescription className="mt-1 flex flex-col gap-1.5">
                             <div className="flex items-center gap-2">
                               <Badge variant="outline" className="text-[10px] font-normal truncate max-w-[150px]">
                                 Airtable: {folder.slug}
                               </Badge>
                             </div>
                             
                             <div className="flex flex-col gap-1 py-1">
                               <div className="flex items-center justify-between text-xs">
                                 <span className="text-gray-500 font-medium">Total Questions:</span>
                                 <span className="text-brand-primary font-bold">{folder.totalQuestions || 0}</span>
                               </div>
                               <div className="flex items-center justify-between text-[10px]">
                                 <span className="text-gray-400">Last Sync:</span>
                                 <span className="text-gray-500">{formatDate(folder.updatedAt)}</span>
                               </div>
                             </div>

                             <span className="text-[11px] text-gray-400 font-medium group-hover:text-brand-primary transition-colors mt-1">Click to view/manage questions →</span>
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* How it Works Footer */}
            {!selectedFolder && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 mt-8">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold">How it works:</p>
                  <p className="mt-1">Add folders connecting to specific tables in your Airtable Base. Clicking "Sync" natively fetches new and updated questions from that table. Renaming or deleting the local folder here <strong>only affects EduHub</strong> and does not touch your data in Airtable.</p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Add Folder Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Airtable Source</DialogTitle>
            <DialogDescription>
              Fetch questions from an Airtable table. This creates a local folder representation without modifying the base.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Airtable Table</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedBaseTable}
                onChange={(e) => {
                  setSelectedBaseTable(e.target.value);
                  if (!newFolderName && e.target.value) setNewFolderName(e.target.value); // Auto-fill name
                }}
                disabled={isLoadingTables}
              >
                <option value="" disabled>
                  {isLoadingTables ? "Loading tables from base..." : "Select a table..."}
                </option>
                {baseTables.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              {isLoadingTables && <p className="text-xs text-blue-500">Connecting to Airtable Metadata API...</p>}
            </div>
            <div className="space-y-2">
              <Label>Display Name (Local Folder)</Label>
              <Input 
                placeholder="e.g. General Awareness Quiz" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={!selectedBaseTable || !newFolderName || isLoadingTables} className="bg-brand-primary hover:bg-brand-primary/90">Add Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Local Folder</DialogTitle>
            <DialogDescription>
              Change how this folder appears in EduHub. (Airtable table "{targetFolder?.slug}" remains unaffected).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Display Name</Label>
              <Input 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} className="bg-brand-primary">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Local Sync Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the local folder <strong>{targetFolder?.name}</strong>? 
              This will also remove all local questions synced from the Airtable table "{targetFolder?.slug}".
              <br/><br/>
              <em>Note: Your data in Airtable itself will be left untouched.</em>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>Yes, Remove Local Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
