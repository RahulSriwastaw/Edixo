"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { API_URL, getAuthHeaders } from "@/lib/api-config";
import { toast } from "sonner";
import {
  Folder, FolderOpen, FolderPlus, ChevronRight, ChevronDown,
  MoreHorizontal, Pencil, Trash2, Plus, RefreshCw, Layers,
  Inbox, FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";

interface FolderNode {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  depth: number;
  parentId: string | null;
  children: FolderNode[];
  setCount?: number;
  totalSetCount?: number;
  questionCount?: number;
}

interface QuestionFolderSidebarProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// — Inline folder rename dialog —
function RenameFolderDialog({
  folder, open, onClose, onRename,
}: { folder: FolderNode | null; open: boolean; onClose: () => void; onRename: (id: string, name: string) => void }) {
  const [name, setName] = useState(folder?.name || "");
  useEffect(() => setName(folder?.name || ""), [folder]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl" aria-describedby="rename-folder-description">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">Rename Folder</DialogTitle>
          <DialogDescription id="rename-folder-description" className="sr-only">
            Enter a new name for the select folder.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Folder name" className="rounded-lg text-sm"
          onKeyDown={e => { if (e.key === "Enter" && name.trim() && folder) { onRename(folder.id, name.trim()); onClose(); } }}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="rounded-lg text-xs bg-primary text-white" onClick={() => { if (name.trim() && folder) { onRename(folder.id, name.trim()); onClose(); } }}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// — New folder dialog —
function NewFolderDialog({
  open, onClose, onCreate, parentId, parentName,
}: { open: boolean; onClose: () => void; onCreate: (name: string, parentId: string | null) => void; parentId: string | null; parentName?: string }) {
  const [name, setName] = useState("");
  useEffect(() => { if (open) setName(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl" aria-describedby="new-folder-description">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            {parentName ? `New Subfolder in "${parentName}"` : "New Folder"}
          </DialogTitle>
          <DialogDescription id="new-folder-description" className="sr-only">
            Provide a name for the new folder.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Folder name" className="rounded-lg text-sm"
          onKeyDown={e => { if (e.key === "Enter" && name.trim()) { onCreate(name.trim(), parentId); onClose(); } }}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="rounded-lg text-xs bg-primary text-white"
            onClick={() => { if (name.trim()) { onCreate(name.trim(), parentId); onClose(); } }}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// — Single folder tree node —
function FolderItem({
  node, level, selectedId, expandedIds, onSelect, onToggleExpand,
  onRename, onDelete, onNewSubfolder,
}: {
  node: FolderNode; level: number; selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRename: (node: FolderNode) => void;
  onDelete: (node: FolderNode) => void;
  onNewSubfolder: (node: FolderNode) => void;
}) {
  const isSelected = selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer text-xs font-medium transition-all duration-100 select-none",
          isSelected
            ? "bg-primary/10 text-primary font-bold"
            : "text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]",
        )}
        style={{ paddingLeft: `${8 + level * 14}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand chevron */}
        <span
          className="shrink-0 w-4 h-4 flex items-center justify-center text-[var(--text-muted)]"
          onClick={e => { e.stopPropagation(); if (hasChildren) onToggleExpand(node.id); }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
          ) : <span className="w-3" />}
        </span>

        {/* Folder icon */}
        <span className={cn("shrink-0", isSelected ? "text-primary" : "text-[var(--text-muted)]")}>
          {isExpanded && hasChildren
            ? <FolderOpen className="w-3.5 h-3.5" />
            : <Folder className="w-3.5 h-3.5" />}
        </span>

        {/* Name */}
        <span className="flex-1 truncate">{node.name}</span>

        {/* Question count */}
        {(node.questionCount ?? 0) > 0 && (
          <span className={cn(
            "shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-bold",
            isSelected ? "bg-primary/20 text-primary" : "bg-slate-100 text-[var(--text-muted)]"
          )}>
            {node.questionCount}
          </span>
        )}

        {/* Actions menu */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 rounded-xl shadow-xl text-xs">
              <DropdownMenuItem onClick={() => onNewSubfolder(node)} className="gap-2 text-xs py-1.5">
                <FolderPlus className="w-3.5 h-3.5" /> Add Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRename(node)} className="gap-2 text-xs py-1.5">
                <Pencil className="w-3.5 h-3.5" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(node)} className="gap-2 text-xs py-1.5 text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <FolderItem
              key={child.id} node={child} level={level + 1}
              selectedId={selectedId} expandedIds={expandedIds}
              onSelect={onSelect} onToggleExpand={onToggleExpand}
              onRename={onRename} onDelete={onDelete} onNewSubfolder={onNewSubfolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function QuestionFolderSidebar({
  selectedFolderId, onFolderSelect, collapsed = false, onToggleCollapse,
}: QuestionFolderSidebarProps) {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [draftsFolder, setDraftsFolder] = useState<FolderNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [renameTarget, setRenameTarget] = useState<FolderNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FolderNode | null>(null);
  const [deleteContent, setDeleteContent] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState<{ id: string | null; name?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derive total question counts per folder from the loaded tree
  const enrichFolderCounts = useCallback(async (tree: FolderNode[]): Promise<FolderNode[]> => {
    return tree; // Counts come from backend setCount; question counts fetched separately if needed
  }, []);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/qbank/folders?tree=true`, { headers: getAuthHeaders() });
      if (!res.ok) {
        const errorMsg = await res.text().catch(() => "Failed to fetch folders");
        throw new Error(errorMsg);
      }
      const data = await res.json();
      const tree: FolderNode[] = data.data || [];

      // Separate out Drafts to pin it
      const drafts = findDrafts(tree);
      setDraftsFolder(drafts);
      setFolders(tree);

      // Auto-expand top-level folders
      const topIds = tree.map((f: FolderNode) => f.id);
      setExpandedIds(prev => new Set([...prev, ...topIds]));
    } catch (e) {
      console.error("Error fetching folders:", e);
      toast.error("Failed to load folders. Please try again.", {
        description: e instanceof Error ? e.message : "Unknown error occurred"
      });
      // Set empty state so UI doesn't hang
      setFolders([]);
      setDraftsFolder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  function findDrafts(tree: FolderNode[]): FolderNode | null {
    for (const n of tree) {
      if (n.name.toLowerCase() === "drafts" && !n.parentId) return n;
    }
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // — Create folder —
  const handleCreate = async (name: string, parentId: string | null) => {
    try {
      const res = await fetch(`${API_URL}/qbank/folders`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId, scope: "GLOBAL" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create folder");
      toast.success(`Folder "${name}" created`);
      fetchFolders();
      if (data.data?.id) {
        onFolderSelect(data.data.id);
        if (parentId) setExpandedIds(prev => new Set([...prev, parentId]));
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create folder");
    }
  };

  // — Rename folder —
  const handleRename = async (id: string, name: string) => {
    try {
      const res = await fetch(`${API_URL}/qbank/folders/${id}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename folder");
      toast.success("Folder renamed");
      fetchFolders();
    } catch (e: any) {
      toast.error(e.message || "Failed to rename");
    }
  };

  // — Delete folder —
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const params = deleteContent ? "?deleteContent=true&confirm=true" : "";
      const res = await fetch(`${API_URL}/qbank/folders/${deleteTarget.id}${params}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete folder");
      }
      toast.success(`"${deleteTarget.name}" deleted`);
      if (selectedFolderId === deleteTarget.id) onFolderSelect(null);
      setDeleteTarget(null);
      setDeleteContent(false);
      fetchFolders();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  if (collapsed) {
    return (
      <div className="w-10 flex flex-col items-center pt-4 gap-3 border-r border-[var(--divider)]">
        <button onClick={onToggleCollapse} className="p-2 rounded-lg hover:bg-slate-100 text-[var(--text-muted)] hover:text-primary transition-colors" title="Expand sidebar">
          <FolderTree className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 flex flex-col border-r border-[var(--divider)] bg-white shrink-0 h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="px-3 py-3 border-b border-slate-50 flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Folders</span>
        <div className="flex items-center gap-1">
          <button onClick={fetchFolders} className="p-1 rounded hover:bg-slate-100 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" title="Refresh">
            <RefreshCw className="w-3 h-3" />
          </button>
          <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-slate-100 text-[var(--text-muted)] transition-colors" title="Collapse">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* System: All questions + Drafts */}
      <div className="px-2 pt-2 space-y-0.5">
        {/* All Questions */}
        <button
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
            selectedFolderId === null
              ? "bg-primary/10 text-primary font-bold"
              : "text-[var(--text-secondary)] hover:bg-slate-100"
          )}
          onClick={() => onFolderSelect(null)}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">All Questions</span>
        </button>

        {/* Drafts — pinned */}
        {draftsFolder && (
          <button
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
              selectedFolderId === draftsFolder.id
                ? "bg-primary/10 text-primary font-bold"
                : "text-[var(--text-secondary)] hover:bg-slate-100"
            )}
            onClick={() => onFolderSelect(draftsFolder.id)}
          >
            <Inbox className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="flex-1 text-left">Drafts</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-600">
              {draftsFolder.questionCount ?? ""}
            </span>
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-[var(--divider)]" />

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Folder className="w-8 h-8 text-slate-200 mx-auto" />
            <p className="text-[11px] text-[var(--text-muted)]">No folders yet</p>
          </div>
        ) : (
          folders
            .filter(f => !(draftsFolder && f.id === draftsFolder.id)) // Drafts shown above
            .map(node => (
              <FolderItem
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedFolderId}
                expandedIds={expandedIds}
                onSelect={onFolderSelect}
                onToggleExpand={toggleExpand}
                onRename={n => setRenameTarget(n)}
                onDelete={n => setDeleteTarget(n)}
                onNewSubfolder={n => setNewFolderParent({ id: n.id, name: n.name })}
              />
            ))
        )}
      </div>

      {/* Footer: New Root Folder */}
      <div className="px-3 py-3 border-t border-[var(--divider)]">
        <button
          onClick={() => setNewFolderParent({ id: null })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-primary/5 hover:text-primary border border-dashed border-[var(--border-input)] hover:border-primary/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Folder
        </button>
      </div>

      {/* Dialogs */}
      <RenameFolderDialog
        folder={renameTarget} open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
      />
      <NewFolderDialog
        open={!!newFolderParent} parentId={newFolderParent?.id ?? null}
        parentName={newFolderParent?.name}
        onClose={() => setNewFolderParent(null)}
        onCreate={handleCreate}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => !isDeleting && setDeleteTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl" aria-describedby="delete-folder-description">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Folder
            </DialogTitle>
          </DialogHeader>
          <DialogDescription id="delete-folder-description" className="text-sm text-[var(--text-secondary)] pb-2">
            Are you sure you want to delete <span className="font-bold text-[var(--text-primary)]">"{deleteTarget?.name}"</span>?
          </DialogDescription>
          
          <div className="py-2 space-y-4">
            
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="deleteContent"
                  checked={deleteContent}
                  onChange={e => setDeleteContent(e.target.checked)}
                  className="w-4 h-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="deleteContent" className="text-xs font-bold text-rose-700 cursor-pointer">
                  Delete all questions and sub-folders inside
                </label>
              </div>
              <p className="text-[10px] text-rose-500 pl-7 leading-relaxed">
                If unchecked, all contents will be moved to the parent folder (Safe Delete).
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="rounded-xl bg-rose-600" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
