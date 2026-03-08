"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Upload,
  FolderPlus,
  Grid,
  List,
  Folder,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Home,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

// Mock documents and folders data
const mockData = {
  folders: [
    { id: "f1", name: "SSC GD Papers", itemCount: 5, createdAt: "Mar 1, 2026" },
    { id: "f2", name: "JEE Mains 2025", itemCount: 12, createdAt: "Feb 15, 2026" },
    { id: "f3", name: "NEET Practice", itemCount: 8, createdAt: "Feb 10, 2026" },
  ],
  documents: [
    {
      id: "d1",
      name: "SSC GD Tier 1 - 2024 Question Paper.pdf",
      status: "completed",
      questionCount: 100,
      imageCount: 15,
      uploader: "admin@eduhub.in",
      uploadedAt: "Mar 4, 2026, 07:36 AM",
    },
    {
      id: "d2",
      name: "Physics Chapter Test - Mechanics.pdf",
      status: "processing",
      questionCount: 0,
      imageCount: 0,
      uploader: "admin@eduhub.in",
      uploadedAt: "Mar 4, 2026, 08:12 AM",
    },
    {
      id: "d3",
      name: "Chemistry Organic Questions.pdf",
      status: "failed",
      questionCount: 0,
      imageCount: 0,
      uploader: "admin@eduhub.in",
      uploadedAt: "Mar 3, 2026, 02:45 PM",
    },
    {
      id: "d4",
      name: "Math Previous Year - 2023.pdf",
      status: "completed",
      questionCount: 50,
      imageCount: 8,
      uploader: "admin@eduhub.in",
      uploadedAt: "Mar 2, 2026, 11:20 AM",
    },
    {
      id: "d5",
      name: "Reasoning Practice Set.pdf",
      status: "partial",
      questionCount: 35,
      imageCount: 3,
      uploader: "admin@eduhub.in",
      uploadedAt: "Mar 1, 2026, 09:00 AM",
    },
  ],
};

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    completed: {
      label: "Completed",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    },
    processing: {
      label: "Processing",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />,
    },
    failed: {
      label: "Failed",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: <AlertCircle className="w-3 h-3 mr-1" />,
    },
    partial: {
      label: "Partial",
      className: "bg-orange-50 text-orange-700 border-orange-200",
      icon: <AlertCircle className="w-3 h-3 mr-1" />,
    },
    uploaded: {
      label: "Ready",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
  };

  const { label, className, icon } = config[status] || config.uploaded;

  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", className)}>
      {icon}
      {label}
    </Badge>
  );
}

// Document Card component
function DocumentCard({
  doc,
  viewMode,
  onSelect,
}: {
  doc: typeof mockData.documents[0];
  viewMode: "grid" | "list";
  onSelect: () => void;
}) {
  if (viewMode === "list") {
    return (
      <div
        className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-orange-50 cursor-pointer transition-colors"
        onClick={onSelect}
      >
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{doc.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{doc.uploadedAt}</div>
        </div>
        <StatusBadge status={doc.status} />
        <div className="text-sm text-gray-600 w-20 text-center">
          {doc.questionCount > 0 ? `${doc.questionCount} Q` : "—"}
        </div>
        <div className="text-sm text-gray-600 w-16 text-center">
          {doc.imageCount > 0 ? `${doc.imageCount} img` : "—"}
        </div>
        <div className="text-sm text-gray-500 w-32 truncate">{doc.uploader}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>View Details</DropdownMenuItem>
            <DropdownMenuItem>Download PDF</DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Card className="kpi-card hover:shadow-md transition-shadow cursor-pointer group" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
            <FileText className="w-6 h-6 text-gray-500 group-hover:text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate text-sm" title={doc.name}>
              {doc.name}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={doc.status} />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>View Details</DropdownMenuItem>
              <DropdownMenuItem>Download PDF</DropdownMenuItem>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Move to...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          {doc.questionCount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Questions</span>
              <span className="font-medium text-gray-900">{doc.questionCount}</span>
            </div>
          )}
          {doc.imageCount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Images</span>
              <span className="font-medium text-gray-900">{doc.imageCount}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Uploaded</span>
            <span className="text-gray-600">{doc.uploadedAt.split(",")[0]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Folder Card component
function FolderCard({
  folder,
  viewMode,
  onClick,
}: {
  folder: typeof mockData.folders[0];
  viewMode: "grid" | "list";
  onClick: () => void;
}) {
  if (viewMode === "list") {
    return (
      <div
        className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-orange-50 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Folder className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{folder.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{folder.itemCount} items</div>
        </div>
        <div className="text-sm text-gray-500">{folder.createdAt}</div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="kpi-card hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Folder className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate text-sm" title={folder.name}>
              {folder.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">{folder.itemCount} items</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>Open</DropdownMenuItem>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Move to...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">Created {folder.createdAt}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PDFExtractPage() {
    const { isOpen } = useSidebarStore();
const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadDocName, setUploadDocName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter data
  const filteredFolders = mockData.folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDocuments = mockData.documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async () => {
    if (!uploadDocName || !uploadFile) {
      toast.error("Please provide document name and select a file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const token = getToken();
      const res = await fetch(`${API_URL}/upload/pdf`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        setUploadProgress(100);
        toast.success("PDF uploaded successfully! Ready to process.");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload PDF");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload PDF");
    } finally {
      setIsUploading(false);
      setShowUploadModal(false);
      setUploadDocName("");
      setUploadFile(null);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    toast.success(`Folder "${newFolderName}" created successfully`);
    setShowNewFolderModal(false);
    setNewFolderName("");
  };

  const handleDocumentClick = (docId: string) => {
    // Navigate to document detail page
    router.push(`/question-bank/pdf-extract/${docId}`);
  };

  const handleFolderClick = (folderId: string) => {
    // Navigate into folder
    toast.info("Opening folder...");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/question-bank" className="hover:text-orange-600">
                Q-Bank
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">PDF Extract</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PDF Extract</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Upload PDFs and extract questions using AI
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowNewFolderModal(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
                <Button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search documents and folders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" title="Go to root folder">
                      <Home className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Refresh">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <div className="h-6 w-px bg-gray-200 mx-1" />
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Total Documents</div>
                      <div className="text-xl font-bold text-gray-900">24</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Completed</div>
                      <div className="text-xl font-bold text-gray-900">18</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Processing</div>
                      <div className="text-xl font-bold text-gray-900">2</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Questions</div>
                      <div className="text-xl font-bold text-gray-900">1,247</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            {filteredFolders.length === 0 && filteredDocuments.length === 0 ? (
              /* Empty State */
              <Card className="kpi-card">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents or folders</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      This folder is empty. Upload a PDF or create a folder to get started.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button variant="outline" onClick={() => setShowNewFolderModal(true)}>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        New Folder
                      </Button>
                      <Button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="space-y-6">
                {filteredFolders.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Folders
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredFolders.map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          viewMode="grid"
                          onClick={() => handleFolderClick(folder.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {filteredDocuments.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Documents
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredDocuments.map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          doc={doc}
                          viewMode="grid"
                          onSelect={() => handleDocumentClick(doc.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <Card className="kpi-card overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase">
                    <div className="w-10" />
                    <div className="flex-1">Name</div>
                    <div className="w-20">Status</div>
                    <div className="w-20">Questions</div>
                    <div className="w-16">Images</div>
                    <div className="w-32">Uploader</div>
                    <div className="w-10" />
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      viewMode="list"
                      onClick={() => handleFolderClick(folder.id)}
                    />
                  ))}
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      viewMode="list"
                      onSelect={() => handleDocumentClick(doc.id)}
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Upload PDF Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload PDF</DialogTitle>
            <DialogDescription>
              Upload a PDF document to extract questions using AI
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input
                placeholder="e.g., SSC GD 2024 Question Paper"
                value={uploadDocName}
                onChange={(e) => setUploadDocName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label>PDF File *</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  uploadFile ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                )}
                onClick={() => document.getElementById("pdf-file-input")?.click()}
              >
                {uploadFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="font-medium text-gray-900">{uploadFile.name}</div>
                    <div className="text-sm text-gray-500">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-300 mx-auto" />
                    <div className="font-medium text-gray-900">Drop PDF here or click to browse</div>
                    <div className="text-sm text-gray-500">Maximum file size: 50MB</div>
                  </div>
                )}
                <input
                  id="pdf-file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 50 * 1024 * 1024) {
                        toast.error("File size must be less than 50MB");
                        return;
                      }
                      setUploadFile(file);
                    }
                  }}
                />
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              className="btn-primary"
              onClick={handleUpload}
              disabled={!uploadDocName || !uploadFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Modal */}
      <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="input-field"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderModal(false)}>
              Cancel
            </Button>
            <Button className="btn-primary" onClick={handleCreateFolder}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
