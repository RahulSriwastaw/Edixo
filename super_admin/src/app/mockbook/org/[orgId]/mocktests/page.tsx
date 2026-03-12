"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  FileText,
  CheckCircle2,
  Play,
  Pause,
  Copy,
  BarChart3,
  Download,
  KeyRound,
  Folder,
  FolderPlus,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";



// Type Badge
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { className: string }> = {
    "Full Mock": { className: "bg-purple-50 text-purple-700" },
    "Chapter Test": { className: "bg-blue-50 text-blue-700" },
    "PYQ": { className: "bg-green-50 text-green-700" },
    "Mini Mock": { className: "bg-orange-50 text-orange-700" },
    "Speed Test": { className: "bg-red-50 text-red-700" },
    "Practice": { className: "bg-gray-50 text-gray-700" },
  };
  const { className } = config[type] || config["Practice"];
  return <Badge className={cn("text-[10px]", className)}>{type}</Badge>;
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    published: { label: "Published", className: "bg-green-50 text-green-700 border-green-200" },
    scheduled: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
    draft: { label: "Draft", className: "bg-gray-50 text-gray-600 border-gray-200" },
    archived: { label: "Archived", className: "bg-red-50 text-red-700 border-red-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={cn("text-[10px]", className)}>{label}</Badge>;
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-gray-600";
};

export default function MockTestsPage() {
    const { isOpen } = useSidebarStore();
const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [mockTestsList, setMockTestsList] = useState<any[]>([]);

  // Hierarchy Navigation States
  const [examFolders, setExamFolders] = useState<any[]>([]); // Level 1 (SSC, Railway)
  const [testSeries, setTestSeries] = useState<any[]>([]); // Level 2 (SSC CGL 2026)
  const [testFolders, setTestFolders] = useState<any[]>([]); // Level 3+ (Tier 1, Sectional)
  
  const [activeExamFolder, setActiveExamFolder] = useState<any>(null);
  const [activeTestSeries, setActiveTestSeries] = useState<any>(null);
  const [activeTestFolder, setActiveTestFolder] = useState<any>(null);
  const [navigationPath, setNavigationPath] = useState<any[]>([]); // Breadcrumbs
  
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [newFolderType, setNewFolderType] = useState<"category" | "series" | "folder">("category");
  const [newFolderName, setNewFolderName] = useState("");

  // New states for form and Q-Bank browser
  const [showQBankBrowser, setShowQBankBrowser] = useState(false);
  const [qBankSets, setQBankSets] = useState<any[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [testForm, setTestForm] = useState({
    name: "",
    type: "Full Mock",
    description: "",
    instructions: "",
    setId: "",
    setPassword: "",
    duration: 180,
    totalMarks: 360,
    negativeMarking: "yes",
    shuffleQuestions: "yes",
    showResult: "immediate",
    maxAttempts: "unlimited",
    accessType: "free",
    status: "draft",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Dynamic fetch: load org and tests
    const fetchData = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
        const token = tokenMatch ? tokenMatch[1] : '';
        
        // Fetch Org Details
        const orgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/super-admin/organizations/${orgId}`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const orgData = await orgRes.json();
        
        if (orgData.success) {
          const orgInfo = orgData.data;
          setSelectedOrg({
            id: orgInfo.orgId,
            name: orgInfo.name,
            plan: orgInfo.plan || "SMALL",
            status: orgInfo.status || "ACTIVE",
            students: orgInfo._count?.students || orgInfo.studentCount || 0,
            mockTests: orgInfo._count?.testAttempts || 0,
            aiCredits: orgInfo.aiCredits || 0,
          });
        } else {
          router.push('/mockbook');
          return;
        }

        // Fetch Initial Hierarchy (Exam Folders / Categories)
        const foldersRes = await fetch(`http://localhost:4000/api/mockbook/folders?orgId=${orgId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const foldersData = await foldersRes.json();
        if (foldersData.success) {
          setExamFolders(foldersData.data || []);
        }

        // Fetch MockTests for this level (initially top level if any)
        fetchTests(null);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
    
  }, [orgId]);

  const fetchTests = async (folderId: string | null) => {
    try {
      const testsRes = await fetch(`http://localhost:4000/api/mockbook/admin/tests?orgId=${orgId}${folderId ? `&categoryId=${folderId}` : ''}`, {
        headers: { 'Authorization': `Bearer ${document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1] || ''}` }
      });
      const testsData = await testsRes.json();
      if (testsData.success) {
        setMockTestsList(testsData.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch tests", err);
    }
  };

  const fetchSeries = async (examFolderId: string) => {
    try {
      const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      const res = await fetch(`http://localhost:4000/api/mockbook/categories?folderId=${examFolderId}&orgId=${orgId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTestSeries(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch series", err);
    }
  };

  const fetchSubFolders = async (seriesId: string, parentId: string | null = null) => {
    try {
      const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      const res = await fetch(`http://localhost:4000/api/mockbook/subcategories?categoryId=${seriesId}${parentId ? `&parentId=${parentId}` : '&parentId=null'}&orgId=${orgId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTestFolders(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch folders", err);
    }
  };

  const navigateToExamFolder = (folder: any) => {
    setActiveExamFolder(folder);
    setActiveTestSeries(null);
    setActiveTestFolder(null);
    setNavigationPath([{ type: 'examFolder', name: folder.name, id: folder.id }]);
    fetchSeries(folder.id);
    setMockTestsList([]);
  };

  const navigateToSeries = (series: any) => {
    setActiveTestSeries(series);
    setActiveTestFolder(null);
    setNavigationPath([
      ...navigationPath.filter(p => p.type === 'examFolder'),
      { type: 'series', name: series.name, id: series.id }
    ]);
    fetchSubFolders(series.id, null);
    setMockTestsList([]);
  };

  const navigateToFolder = (folder: any) => {
    setActiveTestFolder(folder);
    const newPath = [...navigationPath];
    const folderIndex = newPath.findIndex(p => p.id === folder.id);
    if (folderIndex !== -1) {
      newPath.splice(folderIndex + 1);
    } else {
      newPath.push({ type: 'folder', name: folder.name, id: folder.id });
    }
    setNavigationPath(newPath);
    fetchSubFolders(activeTestSeries.id, folder.id);
    fetchTests(folder.id);
  };

  const goBackInPath = (index: number) => {
    const item = navigationPath[index];
    if (item.type === 'examFolder') {
      navigateToExamFolder(item);
    } else if (item.type === 'series') {
      navigateToSeries(item);
    } else if (item.type === 'folder') {
      navigateToFolder(item);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      let url = 'http://localhost:4000/api/mockbook/';
      let body: any = { name: newFolderName, orgId };

      if (newFolderType === 'category') {
        url += 'folders';
      } else if (newFolderType === 'series') {
        url += 'categories';
        body.folderId = activeExamFolder.id;
      } else if (newFolderType === 'folder') {
        url += 'subcategories';
        body.categoryId = activeTestSeries.id;
        body.parentId = activeTestFolder?.id || null;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${newFolderType} created!`);
        setShowAddFolderDialog(false);
        setNewFolderName("");
        // Refresh current level
        if (newFolderType === 'category') {
          const foldersRes = await fetch(`http://localhost:4000/api/mockbook/folders?orgId=${orgId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const foldersData = await foldersRes.json();
          setExamFolders(foldersData.data || []);
        } else if (newFolderType === 'series') {
          fetchSeries(activeExamFolder.id);
        } else {
          fetchSubFolders(activeTestSeries.id, activeTestFolder?.id || null);
        }
      }
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const handleDeleteHierarchy = async (id: string, type: "category" | "series" | "folder", e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (!confirm(`Are you sure you want to delete this ${type}? All nested content will be lost.`)) return;

    try {
      const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      let url = `http://localhost:4000/api/mockbook/`;
      if (type === 'category') url += `folders/${id}`;
      else if (type === 'series') url += `categories/${id}`;
      else url += `subcategories/${id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${type} deleted!`);
        // Refresh current level
        if (type === 'category') {
          setExamFolders(examFolders.filter(f => f.id !== id));
        } else if (type === 'series') {
          setTestSeries(testSeries.filter(s => s.id !== id));
        } else {
          setTestFolders(testFolders.filter(f => f.id !== id));
        }
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred during deletion");
    }
  };

  const fetchQBankSets = async () => {
    try {
      setIsLoadingSets(true);
      const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      const response = await fetch(`http://localhost:4000/api/qbank/sets?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const resData = await response.json();
        setQBankSets(resData.data?.sets || []);
      }
    } catch (error) {
      console.error("Error fetching sets:", error);
    } finally {
      setIsLoadingSets(false);
    }
  };

  const [selectedSetInfo, setSelectedSetInfo] = useState<any>(null);

  const handleSelectSet = (set: any) => {
    setTestForm({
      ...testForm,
      setId: set.code || set.setId || set.id,
      setPassword: set.password || "",
    });
    setSelectedSetInfo(set);
    setShowQBankBrowser(false);
    toast.success(`Selected Set: ${set.name}`);
  };

  const handleCreateTest = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      const payload = {
        name: testForm.name,
        orgId: orgId,
        subCategoryId: activeTestFolder?.id || undefined,
        durationMins: testForm.duration,
        totalMarks: testForm.totalMarks,
        description: testForm.description,
        isPublic: testForm.accessType === "free",
        shuffleQuestions: testForm.shuffleQuestions === "yes",
      };

      const response = await fetch(`http://localhost:4000/api/mockbook/admin/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("MockTest created successfully!");
        setMockTestsList([data.data, ...mockTestsList]);
        setShowCreateDialog(false);
        setCreateStep(1);
        setSelectedSetInfo(null); // Reset selected set info
        // Reset form
        setTestForm({
          name: "",
          type: "Full Mock",
          description: "",
          instructions: "",
          setId: "",
          setPassword: "",
          duration: 180,
          totalMarks: 360,
          negativeMarking: "yes",
          shuffleQuestions: "yes",
          showResult: "immediate",
          maxAttempts: "unlimited",
          accessType: "free",
          status: "draft",
          startDate: "",
          endDate: "",
        });
      } else {
        toast.error(data.message || "Failed to create MockTest");
      }
    } catch (err) {
      console.error("Create test error:", err);
      toast.error("An error occurred while creating the test");
    }
  };

  const handleOrgSelect = (org: MockBookOrg) => {
    setSelectedOrg(org);
    setShowOrgSwitcher(false);
    router.push(`/mockbook/org/${org.id}/mocktests`);
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    router.push("/mockbook");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all";

  // Filter tests
  const filteredTests = mockTestsList.filter((test: any) => {
    const name = test.name || "";
    const id = test.id || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    const matchesType = typeFilter === "all" || test.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!selectedOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-4">
        <MockBookOrgSwitcher open={true} onSelect={handleOrgSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <MockBookOrgBanner
          org={selectedOrg}
          onSwitch={() => setShowOrgSwitcher(true)}
          onExit={handleExitOrg}
        >
          <main className="flex-1 p-6">
            <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/mockbook/org/${orgId}`} className="hover:text-orange-600">{selectedOrg.name}</Link>
                <ChevronRight className="w-4 h-4" />
                <button 
                  onClick={() => {
                    setActiveExamFolder(null);
                    setActiveTestSeries(null);
                    setActiveTestFolder(null);
                    setNavigationPath([]);
                    fetchTests(null);
                  }}
                  className={cn("hover:text-orange-600", navigationPath.length === 0 ? "text-gray-900 font-medium" : "")}
                >
                  MockTests
                </button>
                {navigationPath.map((item, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4" />
                    <button 
                      onClick={() => goBackInPath(index)}
                      className={cn("hover:text-orange-600", index === navigationPath.length - 1 ? "text-gray-900 font-medium" : "")}
                    >
                      {item.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {activeTestFolder?.name || activeTestSeries?.name || activeExamFolder?.name || "MockTests"}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {activeTestFolder ? "Manage tests in this folder" : 
                     activeTestSeries ? "Manage folders and tests in this series" :
                     activeExamFolder ? "Manage test series in this category" :
                     "Create and manage mock tests from Question Sets"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (!activeExamFolder) setNewFolderType("category");
                      else if (!activeTestSeries) setNewFolderType("series");
                      else setNewFolderType("folder");
                      setShowAddFolderDialog(true);
                    }}
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    {!activeExamFolder ? "New Category" : !activeTestSeries ? "New Series" : "New Folder"}
                  </Button>
                  <Button 
                    onClick={() => setShowCreateDialog(true)} 
                    className="btn-primary"
                    disabled={!activeTestSeries}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create MockTest
                  </Button>
                </div>
              </div>

              {/* Folders/Hierarchy Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {!activeExamFolder && examFolders.map((folder) => (
                  <Card key={folder.id} className="hover:border-orange-300 cursor-pointer transition-all group relative" onClick={() => navigateToExamFolder(folder)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <LayoutGrid className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{folder.name}</div>
                        <div className="text-xs text-gray-500">Exam Category</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => handleDeleteHierarchy(folder.id, 'category', e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </CardContent>
                  </Card>
                ))}

                {activeExamFolder && !activeTestSeries && testSeries.map((series) => (
                  <Card key={series.id} className="hover:border-orange-300 cursor-pointer transition-all group relative" onClick={() => navigateToSeries(series)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{series.name}</div>
                        <div className="text-xs text-gray-500">Test Series</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => handleDeleteHierarchy(series.id, 'series', e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </CardContent>
                  </Card>
                ))}

                {activeTestSeries && testFolders.map((folder) => (
                  <Card key={folder.id} className="hover:border-orange-300 cursor-pointer transition-all group relative" onClick={() => navigateToFolder(folder)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Folder className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{folder.name}</div>
                        <div className="text-xs text-gray-500">Folder</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => handleDeleteHierarchy(folder.id, 'folder', e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const dynamicStats = [
                    { label: "Tests in this folder", value: mockTestsList.length, icon: FileText, color: "purple" },
                    { label: "Published", value: mockTestsList.filter(t => t.status === "published").length, icon: CheckCircle2, color: "green" },
                    { label: "Total Attempts", value: mockTestsList.reduce((acc, curr) => acc + (curr.attempts || 0), 0), icon: Users, color: "blue" },
                    { label: "Avg Score", value: "0%", icon: BarChart3, color: "orange" },
                  ];
                  return dynamicStats;
                })().map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="kpi-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Filter Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search mock tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 input-field"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px] input-field">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px] input-field">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Full Mock">Full Mock</SelectItem>
                        <SelectItem value="Chapter Test">Chapter Test</SelectItem>
                        <SelectItem value="PYQ">PYQ</SelectItem>
                        <SelectItem value="Mini Mock">Mini Mock</SelectItem>
                        <SelectItem value="Speed Test">Speed Test</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* MockTests Table */}
              {activeTestSeries && (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Test Name</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Set Code</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Questions</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Duration</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Attempts</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTestsList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                              No tests found in this {activeTestFolder ? "folder" : "series"}.
                            </TableCell>
                          </TableRow>
                        ) : filteredTests.map((test: any) => (
                          <TableRow key={test.id} className="hover:bg-orange-50">
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{test.name}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="font-mono">{test.id}</span>
                                  <span>•</span>
                                  <span>{test.marks} marks</span>
                                  {test.accessType === "pack" && (
                                    <Badge variant="outline" className="text-[10px]">Pack Only</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <TypeBadge type={test.type} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{test.setCode}</span>
                                <span className="text-gray-400">/</span>
                                <span className="font-mono text-sm text-gray-500">••••••</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">{test.questions}</TableCell>
                            <TableCell className="text-center text-sm text-gray-600">{test.duration} min</TableCell>
                            <TableCell className="text-center">
                              <div>
                                <span className="font-medium">{(test.attempts || 0).toLocaleString()}</span>
                                {test.avgScore > 0 && (
                                  <div className="text-xs text-gray-500">Avg: {test.avgScore}%</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={test.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {test.status === "published" && (
                                  <Button variant="outline" size="sm" className="h-8">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Results
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" /> Edit Test
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="w-4 h-4 mr-2" /> Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <KeyRound className="w-4 h-4 mr-2" /> View Set ID/Password
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {test.status === "published" && (
                                      <DropdownMenuItem>
                                        <Pause className="w-4 h-4 mr-2" /> Unpublish
                                      </DropdownMenuItem>
                                    )}
                                    {test.status === "draft" && (
                                      <DropdownMenuItem>
                                        <Play className="w-4 h-4 mr-2" /> Publish
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem>
                                      <Download className="w-4 h-4 mr-2" /> Export Results
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </MockBookOrgBanner>
      </div>

      {/* Org Switcher */}
      <MockBookOrgSwitcher
        open={showOrgSwitcher}
        onSelect={handleOrgSelect}
        recentOrgs={selectedOrg ? [selectedOrg] : []}
      />

      {/* Create MockTest Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New MockTest</DialogTitle>
            <DialogDescription>
              Step {createStep} of 4 — {createStep === 1 && "Basic Info"}
              {createStep === 2 && "Question Source"}
              {createStep === 3 && "Exam Settings"}
              {createStep === 4 && "Access & Schedule"}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex-1 h-1 rounded-full",
                  step <= createStep ? "bg-orange-500" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {createStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Name *</Label>
                  <Input 
                    placeholder="JEE Main Full Mock 1" 
                    className="input-field" 
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select 
                    value={testForm.type} 
                    onValueChange={(v) => setTestForm({ ...testForm, type: v })}
                  >
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Mock">Full Mock</SelectItem>
                      <SelectItem value="Chapter Test">Chapter Test</SelectItem>
                      <SelectItem value="PYQ">PYQ</SelectItem>
                      <SelectItem value="Mini Mock">Mini Mock</SelectItem>
                      <SelectItem value="Speed Test">Speed Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Complete syllabus mock test..." 
                  className="input-field" 
                  rows={2} 
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Instructions (shown before test)</Label>
                <Textarea 
                  placeholder="Read carefully, negative marking applies..." 
                  className="input-field" 
                  rows={3} 
                  value={testForm.instructions}
                  onChange={(e) => setTestForm({ ...testForm, instructions: e.target.value })}
                />
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                <div className="font-medium mb-3">Link Question Set</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Set ID *</Label>
                    <Input 
                      placeholder="482931" 
                      className="input-field font-mono" 
                      value={testForm.setId}
                      onChange={(e) => setTestForm({ ...testForm, setId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input 
                      placeholder="738291" 
                      className="input-field font-mono" 
                      type="password" 
                      value={testForm.setPassword}
                      onChange={(e) => setTestForm({ ...testForm, setPassword: e.target.value })}
                    />
                  </div>
                </div>
                <Button variant="outline" className="mt-3" size="sm">
                  Verify Set
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                <div className="text-sm font-medium mb-1">Or browse from Question Sets</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowQBankBrowser(true);
                    fetchQBankSets();
                  }}
                >
                  Browse Q-Bank
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium mb-2">Questions Loaded</div>
                {selectedSetInfo ? (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{selectedSetInfo.questions || 0} Questions</span>
                    <span>•</span>
                    <span>{selectedSetInfo.marks || 120} Marks</span>
                    <span>•</span>
                    <span>{selectedSetInfo.subject}: {selectedSetInfo.name}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">
                    Link a question set or browse Q-Bank to load questions.
                  </div>
                )}
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input 
                    type="number" 
                    className="input-field" 
                    value={testForm.duration}
                    onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input 
                    type="number" 
                    className="input-field" 
                    value={testForm.totalMarks}
                    onChange={(e) => setTestForm({ ...testForm, totalMarks: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Negative Marking</div>
                  <div className="text-sm text-gray-500">Deduct marks for wrong answers</div>
                </div>
                <Select 
                  value={testForm.negativeMarking} 
                  onValueChange={(v) => setTestForm({ ...testForm, negativeMarking: v })}
                >
                  <SelectTrigger className="w-28 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes (-1)</SelectItem>
                    <SelectItem value="0.25">Yes (-0.25)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Shuffle Questions</div>
                </div>
                <Select 
                  value={testForm.shuffleQuestions} 
                  onValueChange={(v) => setTestForm({ ...testForm, shuffleQuestions: v })}
                >
                  <SelectTrigger className="w-24 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Show Result</div>
                </div>
                <Select 
                  value={testForm.showResult} 
                  onValueChange={(v) => setTestForm({ ...testForm, showResult: v })}
                >
                  <SelectTrigger className="w-32 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="deadline">After Deadline</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Select 
                  value={testForm.maxAttempts} 
                  onValueChange={(v) => setTestForm({ ...testForm, maxAttempts: v })}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="1">1 Attempt</SelectItem>
                    <SelectItem value="2">2 Attempts</SelectItem>
                    <SelectItem value="3">3 Attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {createStep === 4 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Access Type *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className={cn("h-auto py-3 flex-col", testForm.accessType === "free" && "border-orange-300 bg-orange-50")}
                    onClick={() => setTestForm({ ...testForm, accessType: "free" })}
                  >
                    <span className="text-sm font-medium">Free</span>
                    <span className="text-xs text-gray-500">All org students</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className={cn("h-auto py-3 flex-col", testForm.accessType === "pack" && "border-orange-300 bg-orange-50")}
                    onClick={() => setTestForm({ ...testForm, accessType: "pack" })}
                  >
                    <span className="text-sm font-medium">Pack Only</span>
                    <span className="text-xs text-gray-500">Select packs below</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include in Packs</Label>
                <div className="flex flex-wrap gap-2">
                  {["JEE Gold Pack", "JEE Platinum Pack", "NEET Complete"].map((pack) => (
                    <Badge
                      key={pack}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-50"
                    >
                      {pack}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Schedule</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Start Date/Time</Label>
                    <Input 
                      type="datetime-local" 
                      className="input-field" 
                      value={testForm.startDate}
                      onChange={(e) => setTestForm({ ...testForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">End Date/Time</Label>
                    <Input 
                      type="datetime-local" 
                      className="input-field" 
                      value={testForm.endDate}
                      onChange={(e) => setTestForm({ ...testForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Leave empty for always available</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={testForm.status} 
                  onValueChange={(v) => setTestForm({ ...testForm, status: v })}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="published">Publish Now</SelectItem>
                    <SelectItem value="scheduled">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {createStep > 1 && (
              <Button variant="outline" onClick={() => setCreateStep(createStep - 1)} className="w-full sm:w-auto">
                Back
              </Button>
            )}
            {createStep < 4 ? (
              <Button onClick={() => setCreateStep(createStep + 1)} className="btn-primary w-full sm:w-auto">
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateTest} className="btn-primary w-full sm:w-auto">
                Create MockTest
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Set Browser Dialog */}
      <Dialog open={showQBankBrowser} onOpenChange={setShowQBankBrowser}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Browse Question Sets</DialogTitle>
            <DialogDescription>
              Select a question set to link with your mock test
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search question sets..." className="pl-9 input-field" />
            </div>

            {isLoadingSets ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
                <p>Loading question sets...</p>
              </div>
            ) : qBankSets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No question sets found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qBankSets.map((set) => (
                  <Card key={set.id} className="cursor-pointer hover:border-orange-300 transition-colors" onClick={() => handleSelectSet(set)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-900">{set.name}</div>
                        <Badge variant="outline" className="text-[10px]">{set.subject}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                         <span className="font-mono">{set.code || set.setId}</span>
                         <span>•</span>
                         <span>{set.questions || 0} Questions</span>
                       </div>
                       <div className="mt-3 flex items-center justify-between">
                         <div className="text-[10px] text-gray-400">Created {set.created || new Date(set.createdAt).toLocaleDateString()}</div>
                         <Button variant="ghost" size="sm" className="h-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 px-2">
                           Select
                         </Button>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category/Series/Folder Dialog */}
      <Dialog open={showAddFolderDialog} onOpenChange={setShowAddFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {newFolderType === 'category' ? 'Create Exam Category' : 
               newFolderType === 'series' ? 'Create Test Series' : 'Create Folder'}
            </DialogTitle>
            <DialogDescription>
              {newFolderType === 'category' ? 'Add a new high-level category (e.g., SSC, Railway)' : 
               newFolderType === 'series' ? `Add a new series under ${activeExamFolder?.name}` : 
               `Add a new folder under ${activeTestSeries?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder={newFolderType === 'category' ? "SSC" : newFolderType === 'series' ? "SSC CGL 2026" : "Tier 1"}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFolderDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} className="btn-primary">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
