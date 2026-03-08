"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Globe,
  Lock,
  ArrowUpDown,
  Filter,
  Download,
  Building2,
  Share2,
  BookOpen,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShareModal } from "@/components/set-system/ShareModal";
import { QuestionSetExportModal } from "@/components/set-system/QuestionSetExportModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

// Visibility badge component
function VisibilityBadge({ visibility }: { visibility: string }) {
  if (visibility === "public") {
    return <Badge className="bg-emerald-50 text-emerald-700 gap-1"><Globe className="w-3 h-3" /> Public</Badge>;
  } else if (visibility === "org_only") {
    return <Badge className="bg-blue-50 text-blue-700 gap-1"><Building2 className="w-3 h-3" /> Org</Badge>;
  }
  return <Badge className="bg-gray-100 text-gray-600 gap-1"><Lock className="w-3 h-3" /> Private</Badge>;
}

export default function QuestionSetsPage() {
    const { isOpen } = useSidebarStore();
const router = useRouter();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSet, setShareSet] = useState<any | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSet, setExportSet] = useState<any | null>(null);

  const [sets, setSets] = useState<any[]>([]);
  const [totalSets, setTotalSets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSets = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      // Assume default limit of 50 for table display
      const response = await fetch(`${API_URL}/qbank/sets?page=${page}&limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const resData = await response.json();
        setSets(resData.data?.sets || []);
        setTotalSets(resData.data?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching sets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [page]);

  const filteredSets = sets.filter(set => {
    const nameStr = set.name || "";
    const codeStr = set.setId || "";
    const matchesSearch = nameStr.toLowerCase().includes(search.toLowerCase()) || codeStr.toLowerCase().includes(search.toLowerCase());
    // Basic filter assumptions, if subjects are stored or derived differently, handle it gracefully
    const subjectMatch = set.subject ? set.subject.toLowerCase() : "unknown";
    const matchesSubject = subjectFilter === "all" || subjectMatch === subjectFilter;
    const visibilityMatch = set.isGlobal ? "public" : "private";
    const matchesVisibility = visibilityFilter === "all" || visibilityMatch === visibilityFilter;
    return matchesSearch && matchesSubject && matchesVisibility;
  });

  // Select all
  const allSelected = selectedSets.length === filteredSets.length && filteredSets.length > 0;
  const someSelected = selectedSets.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSets([]);
    } else {
      setSelectedSets(filteredSets.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedSets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Bulk actions
  const handleCreateMockTest = () => {
    if (selectedSets.length === 0) {
      toast.error("Please select at least one set");
      return;
    }
    toast.success(`Creating MockTest with ${selectedSets.length} sets`);
    router.push("/mocktests/create-from-sets");
  };

  const handleCreateEBook = () => {
    if (selectedSets.length === 0) {
      toast.error("Please select at least one set");
      return;
    }
    toast.success(`Creating eBook with ${selectedSets.length} sets`);
  };

  const handleBulkDelete = async () => {
    if (selectedSets.length === 0) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/qbank/sets`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids: selectedSets }),
      });

      if (!response.ok) throw new Error("Failed to delete sets");

      toast.success(`Deleted ${selectedSets.length} sets successfully`);
      setSelectedSets([]);
      fetchSets(); // refresh data
    } catch (error: any) {
      toast.error(error.message || "Error deleting sets");
    }
  };

  const handleDeleteSet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question set?")) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/qbank/sets/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error("Failed to delete set");

      toast.success("Set deleted successfully");
      fetchSets(); // refresh data
    } catch (error: any) {
      toast.error(error.message || "Error deleting set");
    }
  };

  // Open share modal
  const openShareModal = (set: any) => {
    setShareSet(set);
    setShowShareModal(true);
  };

  // Open export modal
  const openExportModal = (set: any) => {
    setExportSet(set);
    setShowExportModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Question Sets</h1>
                <p className="text-gray-500 text-sm">Manage organized question collections with ID + Password access</p>
              </div>
              <div className="flex gap-3">
                <Link href="/mocktests/create-from-sets">
                  <Button variant="outline" className="gap-2">
                    <Layers className="w-4 h-4" /> Create MockTest
                  </Button>
                </Link>
                <Link href="/question-bank/sets/create">
                  <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2">
                    <Plus className="w-4 h-4" /> Create Set
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{totalSets}</div>
                  <div className="text-sm text-gray-500">Total Sets</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">-</div>
                  <div className="text-sm text-gray-500">Public Sets</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-[#F4511E]">-</div>
                  <div className="text-sm text-gray-500">Total Questions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-sm text-gray-500">Times Used</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="Search sets by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="computer science">Computer Science</SelectItem>
                      <SelectItem value="general studies">General Studies</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="org_only">Org-Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Action Bar */}
            {selectedSets.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedSets.length} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleCreateMockTest}>
                    <Layers className="w-4 h-4 mr-1" /> Create MockTest
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCreateEBook}>
                    <BookOpen className="w-4 h-4 mr-1" /> Create eBook
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSets([])}>
                  Clear
                </Button>
              </div>
            )}

            {/* Sets Table */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#F4511E]" />
                  <CardTitle>Question Sets</CardTitle>
                  <Badge className="bg-gray-100 text-gray-600">{filteredSets.length} sets</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="w-12 p-4">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all"
                          />
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">
                          <button className="flex items-center gap-1 hover:text-gray-700">Set Name <ArrowUpDown className="w-3 h-3" /></button>
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">ID / Password</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Subject</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Questions</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Visibility</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Used By</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Created</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSets.map((set) => (
                        <tr
                          key={set.id}
                          className={cn(
                            "border-b transition-colors cursor-pointer",
                            selectedSets.includes(set.id) ? "bg-orange-50" : "hover:bg-gray-50"
                          )}
                          onClick={() => router.push(`/question-bank/sets/${set.id}`)}
                        >
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedSets.includes(set.id)}
                              onCheckedChange={() => toggleSelect(set.id)}
                              aria-label={`Select ${set.name}`}
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{set.name}</div>
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-1">
                              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono block">{set.setId}</code>
                              <code className="text-xs text-gray-500 font-mono block">PWD: {set.pin}</code>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{set.subject || "N/A"}</td>
                          <td className="p-4 text-center">
                            <Badge className="bg-blue-50 text-blue-700">{set._count?.items || set.totalQuestions || 0}</Badge>
                          </td>
                          <td className="p-4 text-center">
                            <VisibilityBadge visibility={set.isGlobal ? "public" : "private"} />
                          </td>
                          <td className="p-4 text-center text-gray-600">-</td>
                          <td className="p-4 text-gray-500 text-sm">{new Date(set.createdAt).toLocaleDateString()}</td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/question-bank/sets/${set.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/question-bank/sets/${set.id}/edit`)}>
                                    <Edit className="w-4 h-4 mr-2" />Edit Set
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openShareModal(set)}>
                                    <Share2 className="w-4 h-4 mr-2" />Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2" />Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openExportModal(set)}>
                                    <Download className="w-4 h-4 mr-2" />Export
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSet(set.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredSets.length} sets
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Share Modal */}
      {shareSet && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          contentId={shareSet.setId}
          contentPassword={shareSet.pin}
          contentName={shareSet.name}
          contentType="set"
        />
      )}

      {/* Export Modal */}
      {exportSet && (
        <QuestionSetExportModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          questionSet={{
            id: exportSet.id,
            set_code: exportSet.setId,
            name: exportSet.name,
            description: `${exportSet._count?.items || 0} questions`,
            subject: exportSet.subject || "General",
            chapter: "General",
            questions: Array.from({ length: Math.min(exportSet._count?.items || 0, 10) }, (_, i) => ({
              id: `Q-${i + 1}`,
              text: `Sample question ${i + 1} from ${exportSet.name}`,
              difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
              type: i % 2 === 0 ? "mcq" : "integer",
              options: i % 2 === 0 ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
              answer: i % 2 === 0 ? "A" : String(Math.floor(Math.random() * 100)),
              explanation: "This is the explanation for this question.",
              marks: 2,
            })),
          }}
        />
      )}
    </div>
  );
}
