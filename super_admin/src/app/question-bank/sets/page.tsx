"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers, Plus, Search, MoreHorizontal, Eye, Edit, Copy, Trash2, Globe, Lock,
  ArrowUpDown, Filter, Download, Building2, Share2, BookOpen, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShareModal } from "@/components/set-system/ShareModal";
import { QuestionSetExportModal } from "@/components/set-system/QuestionSetExportModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetFoldersManager } from "@/components/qbank/SetFoldersManager";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

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
  const [activeTab, setActiveTab] = useState("all-sets");
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
    const subjectMatch = set.subject ? set.subject.toLowerCase() : "unknown";
    const matchesSubject = subjectFilter === "all" || subjectMatch === subjectFilter;
    const visibilityMatch = set.isGlobal ? "public" : "private";
    const matchesVisibility = visibilityFilter === "all" || visibilityMatch === visibilityFilter;
    return matchesSearch && matchesSubject && matchesVisibility;
  });

  const allSelected = selectedSets.length === filteredSets.length && filteredSets.length > 0;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedSets([]);
    else setSelectedSets(filteredSets.map(s => s.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedSets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedSets.length === 0) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/qbank/sets`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ids: selectedSets }),
      });
      if (!response.ok) throw new Error("Failed to delete sets");
      toast.success(`Deleted ${selectedSets.length} sets successfully`);
      setSelectedSets([]);
      fetchSets();
    } catch (error: any) { toast.error(error.message || "Error deleting sets"); }
  };

  const handleDeleteSet = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/qbank/sets/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Set deleted");
      fetchSets();
    } catch (error: any) { toast.error(error.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 bg-white border shadow-sm">
                <TabsTrigger value="all-sets" className="px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all">
                  All Sets
                </TabsTrigger>
                <TabsTrigger value="folder-view" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  Folder Wise Organize
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all-sets" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Sets</h1>
                    <p className="text-gray-500 text-sm">Manage all sets in a flat list</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/question-bank/sets/create">
                      <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2">
                        <Plus className="w-4 h-4" /> Create Set
                      </Button>
                    </Link>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="Search sets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                    </div>
                    {selectedSets.length > 0 && (
                      <Button variant="outline" className="text-red-600 border-red-200" onClick={handleBulkDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete {selectedSets.length}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="w-12 p-4 text-center"><Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} /></th>
                          <th className="text-left p-4 font-medium">Set Name</th>
                          <th className="text-left p-4 font-medium">ID / Password</th>
                          <th className="text-center p-4 font-medium">Questions</th>
                          <th className="text-center p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSets.map((set) => (
                          <tr key={set.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 text-center"><Checkbox checked={selectedSets.includes(set.id)} onCheckedChange={() => toggleSelect(set.id)} /></td>
                            <td className="p-4 font-medium">{set.name}</td>
                            <td className="p-4">
                              <code className="text-xs bg-gray-100 px-1 rounded block">{set.setId}</code>
                              <code className="text-xs text-gray-400 block">PWD: {set.pin}</code>
                            </td>
                            <td className="p-4 text-center"><Badge variant="outline">{set._count?.items || set.totalQuestions || 0}</Badge></td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/question-bank/sets/${set.id}`)}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/question-bank/sets/${set.id}/edit`)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDeleteSet(set.id)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="folder-view" className="mt-0">
                <SetFoldersManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {shareSet && (
        <ShareModal open={showShareModal} onOpenChange={setShowShareModal} contentId={shareSet.setId} contentPassword={shareSet.pin} contentName={shareSet.name} contentType="set" />
      )}
      {exportSet && (
        <QuestionSetExportModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          questionSet={{
            id: exportSet.id,
            set_code: exportSet.setId,
            name: exportSet.name,
            description: exportSet.description || "",
            subject: exportSet.subject || "General",
            chapter: exportSet.chapter || "Mixed",
            questions: []
          }}
        />
      )}
    </div>
  );
}
