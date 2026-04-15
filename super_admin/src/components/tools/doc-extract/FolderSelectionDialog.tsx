"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, FolderOpen, ChevronRight, ChevronDown, Search, Loader2, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL, getAuthHeaders } from '@/lib/api-config';
import { toast } from 'sonner';

interface FolderNode {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  depth: number;
  parentId: string | null;
  children: FolderNode[];
  questionCount?: number;
}

interface FolderSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (folderId: string, folderName: string) => void;
  questionCount: number;
}

function FolderTreeNode({
  node,
  level,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  searchTerm,
  onCreateSubfolder,
}: {
  node: FolderNode;
  level: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  searchTerm: string;
  onCreateSubfolder: (parentId: string) => void;
}) {
  const isSelected = selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearch && !node.children?.some(c => shouldShowNode(c, searchTerm))) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer text-sm transition-all duration-100 select-none",
          isSelected
            ? "bg-primary/15 text-primary font-semibold border border-primary/30"
            : "text-slate-700 hover:bg-slate-100"
        )}
        style={{ marginLeft: `${level * 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand/Collapse chevron */}
        <span
          className="shrink-0 w-4 h-4 flex items-center justify-center transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )
          ) : (
            <div className="w-4" />
          )}
        </span>

        {/* Folder icon */}
        <span className={cn("shrink-0", isSelected ? "text-primary" : "text-slate-500")}>
          {isExpanded && hasChildren ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </span>

        {/* Folder name */}
        <span className="flex-1 truncate font-medium">{node.name}</span>

        {/* Question count badge */}
        {(node.questionCount ?? 0) > 0 && (
          <span className={cn(
            "text-xs px-2 py-1 rounded-full font-semibold shrink-0",
            isSelected
              ? "bg-primary/20 text-primary"
              : "bg-slate-100 text-slate-600"
          )}>
            {node.questionCount}
          </span>
        )}

        {/* Create subfolder button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateSubfolder(node.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600"
          title="Create subfolder"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <FolderTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              searchTerm={searchTerm}
              onCreateSubfolder={onCreateSubfolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function shouldShowNode(node: FolderNode, searchTerm: string): boolean {
  if (!searchTerm) return true;
  const matches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
  if (matches) return true;
  return node.children?.some(c => shouldShowNode(c, searchTerm)) ?? false;
}

export function FolderSelectionDialog({
  open,
  onClose,
  onSelect,
  questionCount,
}: FolderSelectionDialogProps) {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch folders on dialog open
  const fetchFolders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/qbank/folders?tree=true`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch folders");

      const data = await res.json();
      const tree: FolderNode[] = data.data || [];
      setFolders(tree);

      // Auto-expand top-level folders
      const topIds = tree.map((f: FolderNode) => f.id);
      setExpandedIds(new Set(topIds));
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchFolders();
  }, [open]);

  const findFolderName = (id: string, nodes: FolderNode[]): string => {
    for (const node of nodes) {
      if (node.id === id) return node.name;
      const found = findFolderName(id, node.children || []);
      if (found) return found;
    }
    return "Unknown Folder";
  };

  const handleSelect = () => {
    if (!selectedId) {
      toast.error("Please select a folder");
      return;
    }

    const folderName = findFolderName(selectedId, folders);
    onSelect(selectedId, folderName);
    handleClose();
  };

  const handleClose = () => {
    setSelectedId(null);
    setSearchTerm('');
    onClose();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/qbank/folders`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: createParentId,
          scope: "GLOBAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create folder");

      toast.success(`Folder "${newFolderName}" created successfully!`);
      
      // Refresh folders and select the new one
      await fetchFolders();
      if (data.data?.id) {
        setSelectedId(data.data.id);
        // Auto-expand parent if subfolder created
        if (createParentId) {
          setExpandedIds(prev => new Set([...prev, createParentId]));
        }
      }
      
      // Reset create form
      setShowCreateFolder(false);
      setNewFolderName('');
      setCreateParentId(null);
    } catch (error: any) {
      console.error("Create folder error:", error);
      toast.error(error.message || "Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateDialog = (parentId: string | null = null) => {
    setCreateParentId(parentId);
    setShowCreateFolder(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Select Folder for Questions</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Choose where to save {questionCount} question{questionCount !== 1 ? 's' : ''} in the Question Bank
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Search and Create Buttons */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-lg border-slate-200 bg-slate-50 text-sm"
                autoFocus
              />
            </div>
            <Button
              onClick={() => openCreateDialog(null)}
              variant="outline"
              size="sm"
              className="w-full h-8 rounded-lg border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-semibold text-xs gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Create New Folder
            </Button>
          </div>

          {/* Folder Tree */}
          <ScrollArea className="h-64 border border-slate-200 rounded-lg bg-white p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  <p className="text-xs text-slate-500">Loading folders...</p>
                </div>
              </div>
            ) : folders.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-500">No folders available</p>
              </div>
            ) : (
              <div className="space-y-1">
                {folders.map(node => (
                  <FolderTreeNode
                    key={node.id}
                    node={node}
                    level={0}
                    selectedId={selectedId}
                    expandedIds={expandedIds}
                    onSelect={setSelectedId}
                    onToggleExpand={toggleExpand}
                    searchTerm={searchTerm}
                    onCreateSubfolder={openCreateDialog}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected folder info */}
          {selectedId && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs font-semibold text-slate-600">Selected Folder:</p>
              <p className="text-sm font-bold text-primary mt-1">
                📁 {findFolderName(selectedId, folders)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-lg border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedId || loading}
            className="rounded-lg bg-primary text-white hover:bg-primary/90 font-semibold"
          >
            Save to Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Create New Folder Dialog */}
    <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Create New Folder</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {createParentId
              ? "Create a subfolder in the selected parent folder"
              : "Create a new top-level folder in the Question Bank"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Folder Name
            </label>
            <Input
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  handleCreateFolder();
                }
              }}
              className="h-9 rounded-lg border-slate-200 bg-slate-50 text-sm"
              autoFocus
              disabled={isCreating}
            />
          </div>

          {createParentId && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-slate-600">Parent Folder:</p>
              <p className="text-sm font-bold text-blue-700 mt-1">
                📁 {findFolderName(createParentId, folders)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateFolder(false);
              setNewFolderName('');
              setCreateParentId(null);
            }}
            disabled={isCreating}
            className="rounded-lg border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || isCreating}
            className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold gap-1.5"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="w-3.5 h-3.5" />
                Create Folder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
