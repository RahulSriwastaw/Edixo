"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Search,
  Grid,
  List,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  File,
  FileText,
  FileVideo,
  FileAudio,
  FolderOpen,
  X,
  Check,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  cdnUrl: string;
  altText?: string;
  caption?: string;
  folder: string;
  createdAt: string;
}

// Mock media data
const mockMedia: MediaItem[] = [
  {
    id: "1",
    filename: "jee-study-plan-2026.jpg",
    originalName: "JEE Study Plan 2026.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 245678,
    width: 1200,
    height: 630,
    cdnUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200",
    altText: "JEE 2026 Study Plan Cover",
    caption: "Comprehensive study plan for JEE aspirants",
    folder: "/blog",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "2",
    filename: "neet-biology-topics.png",
    originalName: "NEET Biology Topics.png",
    mimeType: "image/png",
    sizeBytes: 512345,
    width: 1200,
    height: 800,
    cdnUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200",
    altText: "NEET Biology Important Topics",
    folder: "/blog",
    createdAt: "2026-02-28T14:30:00Z",
  },
  {
    id: "3",
    filename: "ai-learning-platform.jpg",
    originalName: "AI Learning Platform.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 345678,
    width: 1600,
    height: 900,
    cdnUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
    altText: "AI Powered Learning Platform",
    folder: "/blog",
    createdAt: "2026-02-27T09:15:00Z",
  },
  {
    id: "4",
    filename: "coaching-institutes.jpg",
    originalName: "Top Coaching Institutes.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 278901,
    width: 1200,
    height: 630,
    cdnUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200",
    altText: "Top Coaching Institutes in Maharashtra",
    folder: "/blog",
    createdAt: "2026-02-25T16:45:00Z",
  },
  {
    id: "5",
    filename: "jee-syllabus-2026.pdf",
    originalName: "JEE Syllabus 2026.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1024567,
    cdnUrl: "/files/jee-syllabus-2026.pdf",
    folder: "/documents",
    createdAt: "2026-02-20T11:00:00Z",
  },
  {
    id: "6",
    filename: "eduhub-logo.svg",
    originalName: "EduHub Logo.svg",
    mimeType: "image/svg+xml",
    sizeBytes: 12345,
    width: 200,
    height: 60,
    cdnUrl: "/logo.svg",
    altText: "EduHub Logo",
    folder: "/branding",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "7",
    filename: "tutorial-video-thumbnail.jpg",
    originalName: "Tutorial Video Thumbnail.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 198765,
    width: 1280,
    height: 720,
    cdnUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
    altText: "Tutorial Video Thumbnail",
    folder: "/videos",
    createdAt: "2026-02-22T13:20:00Z",
  },
  {
    id: "8",
    filename: "student-success-story.jpg",
    originalName: "Student Success Story.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 287654,
    width: 1200,
    height: 800,
    cdnUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200",
    altText: "Student Success Story",
    folder: "/blog",
    createdAt: "2026-02-18T15:30:00Z",
  },
];

const folders = [
  { name: "All Files", path: "/" },
  { name: "Blog", path: "/blog" },
  { name: "Documents", path: "/documents" },
  { name: "Videos", path: "/videos" },
  { name: "Branding", path: "/branding" },
];

const fileTypes = [
  { value: "all", label: "All Types" },
  { value: "image", label: "Images" },
  { value: "document", label: "Documents" },
  { value: "video", label: "Videos" },
];

export default function MediaLibraryPage() {
    const { isOpen } = useSidebarStore();
const [media, setMedia] = useState<MediaItem[]>(mockMedia);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentFolder, setCurrentFolder] = useState("/");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editDialog, setEditDialog] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for edit
  const [editForm, setEditForm] = useState({
    altText: "",
    caption: "",
  });

  // Filter media
  const filteredMedia = media.filter((item) => {
    const matchesSearch = 
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = currentFolder === "/" || item.folder === currentFolder;
    const matchesType = typeFilter === "all" || 
      (typeFilter === "image" && item.mimeType.startsWith("image/")) ||
      (typeFilter === "document" && !item.mimeType.startsWith("image/")) ||
      (typeFilter === "video" && item.mimeType.startsWith("video/"));
    return matchesSearch && matchesFolder && matchesType;
  });

  // Stats
  const stats = {
    total: media.length,
    images: media.filter(m => m.mimeType.startsWith("image/")).length,
    documents: media.filter(m => !m.mimeType.startsWith("image/") && !m.mimeType.startsWith("video/")).length,
    totalSize: media.reduce((sum, m) => sum + m.sizeBytes, 0),
  };

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return ImageIcon;
    if (mimeType.startsWith("video/")) return FileVideo;
    if (mimeType.startsWith("audio/")) return FileAudio;
    if (mimeType.includes("pdf")) return FileText;
    return File;
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Toggle select
  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMedia.map(m => m.id));
    }
  };

  // Copy URL
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  // Delete item
  const deleteItem = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
    setSelectedItems(selectedItems.filter(i => i !== id));
    toast.success('Media deleted');
  };

  // Bulk delete
  const bulkDelete = () => {
    if (selectedItems.length === 0) return;
    setMedia(media.filter(m => !selectedItems.includes(m.id)));
    setSelectedItems([]);
    toast.success(`${selectedItems.length} items deleted`);
  };

  // Handle edit
  const handleEdit = (item: MediaItem) => {
    setEditDialog(item);
    setEditForm({
      altText: item.altText || "",
      caption: item.caption || "",
    });
  };

  // Save edit
  const saveEdit = () => {
    if (!editDialog) return;
    setMedia(media.map(m => 
      m.id === editDialog.id 
        ? { ...m, altText: editForm.altText, caption: editForm.caption }
        : m
    ));
    toast.success('Media updated');
    setEditDialog(null);
  };

  // Handle file upload simulation
  const handleFileUpload = () => {
    toast.success('File upload simulated - would upload to S3/CDN in production');
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                  <p className="text-gray-500 text-sm">Manage images, documents, and files</p>
                </div>
              </div>
              <Button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Files</div>
                      <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Images</div>
                      <div className="text-xl font-bold text-gray-900">{stats.images}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Documents</div>
                      <div className="text-xl font-bold text-gray-900">{stats.documents}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Download className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Size</div>
                      <div className="text-xl font-bold text-gray-900">{formatSize(stats.totalSize)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & View Toggle */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Folder Selector */}
                    <Select value={currentFolder} onValueChange={setCurrentFolder}>
                      <SelectTrigger className="w-[150px] input-field">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder.path} value={folder.path}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[130px] input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fileTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Search */}
                    <div className="relative w-[250px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 input-field"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                      <>
                        <span className="text-sm text-gray-500">{selectedItems.length} selected</span>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={bulkDelete}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}

                    {/* View Toggle */}
                    <div className="flex items-center border rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredMedia.map((item) => {
                  const FileIcon = getFileIcon(item.mimeType);
                  const isImage = item.mimeType.startsWith("image/");
                  
                  return (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        selectedItems.includes(item.id) ? 'ring-2 ring-brand-primary' : ''
                      }`}
                      onClick={() => toggleSelect(item.id)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                          {isImage ? (
                            <img
                              src={item.cdnUrl}
                              alt={item.altText || item.filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          
                          {selectedItems.includes(item.id) && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                            <div className="text-xs text-white truncate">{formatSize(item.sizeBytes)}</div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <div className="text-sm font-medium text-gray-900 truncate" title={item.originalName}>
                            {item.originalName}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(item.createdAt)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === filteredMedia.length && filteredMedia.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">File</th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Size</th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="p-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredMedia.map((item) => {
                        const FileIcon = getFileIcon(item.mimeType);
                        const isImage = item.mimeType.startsWith("image/");
                        
                        return (
                          <tr 
                            key={item.id} 
                            className={`hover:bg-gray-50 cursor-pointer ${
                              selectedItems.includes(item.id) ? 'bg-brand-primary-tint' : ''
                            }`}
                            onClick={() => toggleSelect(item.id)}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                  {isImage ? (
                                    <img src={item.cdnUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <FileIcon className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.originalName}</div>
                                  <div className="text-xs text-gray-500 mono">{item.filename}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary" className="text-xs">
                                {item.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-gray-500">{formatSize(item.sizeBytes)}</td>
                            <td className="p-3 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                            <td className="p-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyUrl(item.cdnUrl); }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy URL
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {filteredMedia.length === 0 && (
              <div className="p-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-1">No files found</h3>
                <p className="text-gray-500 text-sm">
                  Upload your first file to get started
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Media Details</DialogTitle>
            <DialogDescription>
              Update alt text and caption for better SEO
            </DialogDescription>
          </DialogHeader>

          {editDialog && (
            <div className="py-4 space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {editDialog.mimeType.startsWith("image/") ? (
                  <img src={editDialog.cdnUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <File className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Filename:</span>
                  <div className="font-medium mono">{editDialog.filename}</div>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <div className="font-medium">{formatSize(editDialog.sizeBytes)}</div>
                </div>
                {editDialog.width && editDialog.height && (
                  <div>
                    <span className="text-gray-500">Dimensions:</span>
                    <div className="font-medium">{editDialog.width} × {editDialog.height}</div>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Type:</span>
                  <div className="font-medium">{editDialog.mimeType}</div>
                </div>
              </div>

              <div>
                <Label>Alt Text (for SEO)</Label>
                <Input
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                  placeholder="Describe the image for screen readers..."
                  className="input-field mt-1"
                />
              </div>

              <div>
                <Label>Caption</Label>
                <Input
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  placeholder="Image caption..."
                  className="input-field mt-1"
                />
              </div>

              <div>
                <Label>URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={editDialog.cdnUrl}
                    readOnly
                    className="input-field mono text-sm bg-gray-50"
                  />
                  <Button variant="outline" size="sm" onClick={() => copyUrl(editDialog.cdnUrl)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button className="btn-primary" onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{previewItem?.originalName}</DialogTitle>
          </DialogHeader>
          
          {previewItem && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {previewItem.mimeType.startsWith("image/") ? (
                  <img src={previewItem.cdnUrl} alt={previewItem.altText || ""} className="w-full" />
                ) : (
                  <div className="p-12 text-center">
                    <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Preview not available for this file type</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-xs">Type</div>
                  <div className="font-medium">{previewItem.mimeType}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-xs">Size</div>
                  <div className="font-medium">{formatSize(previewItem.sizeBytes)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-xs">Uploaded</div>
                  <div className="font-medium">{formatDate(previewItem.createdAt)}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewItem(null)}>Close</Button>
            <Button variant="outline" onClick={() => previewItem && copyUrl(previewItem.cdnUrl)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
