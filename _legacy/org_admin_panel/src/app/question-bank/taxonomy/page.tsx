"use client";

import { useState, useEffect } from "react";
import {
  Tags,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  MoreHorizontal,
  BookOpen,
  FileText,
  FolderOpen,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
interface Topic {
  id: string;
  name: string;
  questions: number;
}

interface Chapter {
  id: string;
  name: string;
  questions: number;
  topics: Topic[];
  expanded?: boolean;
}

interface Subject {
  id: string;
  name: string;
  questions: number;
  chapters: Chapter[];
  expanded?: boolean;
}

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function TaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [addDialog, setAddDialog] = useState<{ type: "subject" | "chapter" | "topic"; parentId?: string; parentName?: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        setIsLoading(true);
        const res = await fetch(`${API_URL}/qbank/taxonomy`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const { data } = await res.json();
          setTaxonomy(data || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSubject = (subjectId: string) => {
    setTaxonomy(taxonomy.map(s => s.id === subjectId ? { ...s, expanded: !s.expanded } : s));
  };

  const toggleChapter = (subjectId: string, chapterId: string) => {
    setTaxonomy(taxonomy.map(s => s.id === subjectId ? {
      ...s,
      chapters: s.chapters.map(c => c.id === chapterId ? { ...c, expanded: !c.expanded } : c),
    } : s));
  };

  const handleAdd = () => {
    if (!newItemName.trim() || !addDialog) return;
    // In real app, this would call API
    setNewItemName("");
    setAddDialog(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subject Taxonomy</h1>
                <p className="text-gray-500 text-sm">Manage subjects, chapters, and topics</p>
              </div>
              <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2" onClick={() => setAddDialog({ type: "subject" })}>
                <Plus className="w-4 h-4" /> Add Subject
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{taxonomy.length}</div>
                  <div className="text-sm text-gray-500">Subjects</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{taxonomy.reduce((sum, s) => sum + s.chapters.length, 0)}</div>
                  <div className="text-sm text-gray-500">Chapters</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{taxonomy.reduce((sum, s) => sum + s.chapters.reduce((cSum, c) => cSum + c.topics.length, 0), 0)}</div>
                  <div className="text-sm text-gray-500">Topics</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-[#F4511E]">{taxonomy.reduce((sum, s) => sum + s.questions, 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Questions</div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search taxonomy..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
              </CardContent>
            </Card>

            {/* Taxonomy Tree */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Tags className="w-5 h-5 text-[#F4511E]" />
                  <CardTitle>Taxonomy Structure</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {isLoading ? (
                    <div className="text-center py-20 text-gray-400 italic">
                      Loading taxonomy...
                    </div>
                  ) : taxonomy.length > 0 ? (
                    taxonomy.map((subject) => (
                      <div key={subject.id}>
                        {/* Subject Level */}
                        <div className="flex items-center gap-2 p-4 hover:bg-gray-50">
                          <button onClick={() => toggleSubject(subject.id)} className="p-1 hover:bg-gray-200 rounded">
                            {subject.expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                          </button>
                          <BookOpen className="w-5 h-5 text-purple-500" />
                          <span className="font-medium text-gray-900 flex-1">{subject.name}</span>
                          <Badge className="bg-purple-50 text-purple-700">{subject.questions} questions</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setAddDialog({ type: "chapter", parentId: subject.id, parentName: subject.name })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Chapter
                              </DropdownMenuItem>
                              <DropdownMenuItem><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Chapters Level */}
                        {subject.expanded && subject.chapters.map((chapter) => (
                          <div key={chapter.id}>
                            <div className="flex items-center gap-2 pl-10 pr-4 py-3 hover:bg-gray-50 border-l-4 border-purple-200 ml-4">
                              <button onClick={() => toggleChapter(subject.id, chapter.id)} className="p-1 hover:bg-gray-200 rounded">
                                {chapter.expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                              </button>
                              <FolderOpen className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-700 flex-1">{chapter.name}</span>
                              <Badge className="bg-blue-50 text-blue-700 text-xs">{chapter.questions}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setAddDialog({ type: "topic", parentId: chapter.id, parentName: chapter.name })}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Topic
                                  </DropdownMenuItem>
                                  <DropdownMenuItem><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Topics Level */}
                            {chapter.expanded && chapter.topics.map((topic) => (
                              <div key={topic.id} className="flex items-center gap-2 pl-[72px] pr-4 py-2 hover:bg-gray-50 border-l-4 border-blue-200 ml-8">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                <span className="text-gray-600 text-sm flex-1">{topic.name}</span>
                                <Badge className="bg-gray-100 text-gray-600 text-xs">{topic.questions}</Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-gray-400 italic">
                      No taxonomy data found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Dialog */}
      <Dialog open={!!addDialog} onOpenChange={() => setAddDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {addDialog?.type === "subject" ? "Subject" : addDialog?.type === "chapter" ? "Chapter" : "Topic"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {addDialog?.parentName && (
              <p className="text-sm text-gray-500">Under: {addDialog.parentName}</p>
            )}
            <Input
              placeholder={`Enter ${addDialog?.type} name...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(null)}>Cancel</Button>
            <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white" onClick={handleAdd}>
              <Save className="w-4 h-4 mr-2" /> Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
