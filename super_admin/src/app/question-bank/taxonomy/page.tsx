"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
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

// Mock data
const mockTaxonomy: Subject[] = [
  {
    id: "1",
    name: "Physics",
    questions: 847,
    expanded: true,
    chapters: [
      {
        id: "1-1",
        name: "Kinematics",
        questions: 124,
        expanded: true,
        topics: [
          { id: "1-1-1", name: "Uniform Motion", questions: 34 },
          { id: "1-1-2", name: "Non-uniform Motion", questions: 28 },
          { id: "1-1-3", name: "Projectile Motion", questions: 41 },
          { id: "1-1-4", name: "Circular Motion", questions: 21 },
        ],
      },
      {
        id: "1-2",
        name: "Laws of Motion",
        questions: 89,
        topics: [
          { id: "1-2-1", name: "Newton's First Law", questions: 22 },
          { id: "1-2-2", name: "Newton's Second Law", questions: 35 },
          { id: "1-2-3", name: "Newton's Third Law", questions: 32 },
        ],
      },
      {
        id: "1-3",
        name: "Work, Energy, Power",
        questions: 67,
        topics: [
          { id: "1-3-1", name: "Work Done", questions: 20 },
          { id: "1-3-2", name: "Kinetic Energy", questions: 25 },
          { id: "1-3-3", name: "Potential Energy", questions: 22 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Mathematics",
    questions: 623,
    chapters: [
      { id: "2-1", name: "Algebra", questions: 156, topics: [] },
      { id: "2-2", name: "Calculus", questions: 234, topics: [] },
      { id: "2-3", name: "Coordinate Geometry", questions: 145, topics: [] },
      { id: "2-4", name: "Trigonometry", questions: 88, topics: [] },
    ],
  },
  {
    id: "3",
    name: "Chemistry",
    questions: 412,
    chapters: [
      { id: "3-1", name: "Physical Chemistry", questions: 145, topics: [] },
      { id: "3-2", name: "Organic Chemistry", questions: 156, topics: [] },
      { id: "3-3", name: "Inorganic Chemistry", questions: 111, topics: [] },
    ],
  },
  {
    id: "4",
    name: "Biology",
    questions: 289,
    chapters: [
      { id: "4-1", name: "Botany", questions: 145, topics: [] },
      { id: "4-2", name: "Zoology", questions: 144, topics: [] },
    ],
  },
];

export default function TaxonomyPage() {
    const { isOpen } = useSidebarStore();
const [taxonomy, setTaxonomy] = useState<Subject[]>(mockTaxonomy);
  const [search, setSearch] = useState("");
  const [addDialog, setAddDialog] = useState<{ type: "subject" | "chapter" | "topic"; parentId?: string; parentName?: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");

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
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
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
                  {taxonomy.map((subject) => (
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
                  ))}
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
