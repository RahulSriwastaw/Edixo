import { useSidebarStore } from "@/store/sidebarStore";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronRight,
  BookOpen,
  Layers,
  FileUp,
  Globe,
  Sparkles,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrgAdminSidebar, OrgSidebarProvider } from "@/components/org-admin/OrgAdminSidebar";
import { OrgAdminTopBar } from "@/components/org-admin/OrgAdminTopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OrgContextBanner } from "@/components/org-admin/OrgContextBanner";

// Mock questions data
const questionsData = [
  { id: "Q-001", preview: "Which law states F = ma?", subject: "Physics", chapter: "Kinematics", difficulty: "Easy", type: "MCQ" },
  { id: "Q-002", preview: "What is the derivative of sin(x)?", subject: "Math", chapter: "Calculus", difficulty: "Medium", type: "MCQ" },
  { id: "Q-003", preview: "Balance: Fe + O2 → Fe2O3", subject: "Chemistry", chapter: "Reactions", difficulty: "Hard", type: "Integer" },
];

// Mock sets data
const setsData = [
  { id: "SET-482931", name: "Reasoning Set 1", questions: 25, usedIn: 3 },
  { id: "SET-671204", name: "GK Set A", questions: 20, usedIn: 1 },
  { id: "SET-891023", name: "Math Set 2", questions: 25, usedIn: 2 },
];

// Stats
const stats = [
  { label: "My Questions", value: "1,234", icon: BookOpen, color: "orange" },
  { label: "My Sets", value: "45", icon: Layers, color: "blue" },
  { label: "AI Credits", value: "342.5", icon: Sparkles, color: "purple" },
  { label: "Global Bank", value: "50K+", icon: Globe, color: "green" },
];

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    orange: "text-orange-600",
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-gray-600";
};

// Difficulty Badge
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, string> = {
    Easy: "bg-green-50 text-green-700",
    Medium: "bg-orange-50 text-orange-700",
    Hard: "bg-red-50 text-red-700",
  };
  return <Badge className={cn("text-[10px]", config[difficulty] || config.Medium)}>{difficulty}</Badge>;
}

export default function QBankPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);

  return (
    <OrgSidebarProvider>
      <div className="min-h-screen bg-neutral-bg">
        <OrgAdminSidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "lg:ml-60" : "ml-0")}>
          <OrgAdminTopBar />
          <OrgContextBanner>
            <main className="flex-1 p-4 lg:p-6">
              <div className="max-w-[1400px] mx-auto space-y-4 lg:space-y-6 animate-fade-in">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/org-admin" className="hover:text-orange-600">Dashboard</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Q-Bank</span>
              </div>

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Question Bank</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage your questions and sets
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">342.5 credits</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="kpi-card">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${getIconColor(stat.color)}`} />
                          </div>
                          <div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{stat.label}</div>
                            <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Tabs defaultValue="my-questions" className="w-full">
                <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
                  <TabsList className="bg-white border border-gray-200 rounded-lg p-1 inline-flex w-max lg:w-auto">
                    <TabsTrigger value="my-questions" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs lg:text-sm">
                      My Questions
                    </TabsTrigger>
                    <TabsTrigger value="my-sets" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs lg:text-sm">
                      My Sets
                    </TabsTrigger>
                    <TabsTrigger value="pdf-extract" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs lg:text-sm">
                      PDF Extract
                    </TabsTrigger>
                    <TabsTrigger value="global" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs lg:text-sm">
                      Global Bank
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* My Questions Tab */}
                <TabsContent value="my-questions" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <CardTitle className="text-base">My Questions</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowAIDialog(true)}>
                          <Sparkles className="w-4 h-4 mr-1" />
                          AI Generate
                        </Button>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-1" />
                          Import CSV
                        </Button>
                        <Button size="sm" className="btn-primary">
                          <Plus className="w-4 h-4 mr-1" />
                          Create Question
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input placeholder="Search questions..." className="pl-9 input-field" />
                        </div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-full sm:w-[130px] input-field">
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            <SelectItem value="physics">Physics</SelectItem>
                            <SelectItem value="chemistry">Chemistry</SelectItem>
                            <SelectItem value="math">Math</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-full sm:w-[130px] input-field">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase">Question</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase">Subject</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase">Difficulty</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questionsData.map((q) => (
                              <TableRow key={q.id} className="hover:bg-orange-50">
                                <TableCell>
                                  <div className="font-mono text-xs text-orange-600 mb-0.5">{q.id}</div>
                                  <div className="text-sm text-gray-900 max-w-[300px] truncate">{q.preview}</div>
                                </TableCell>
                                <TableCell className="text-sm">{q.subject} &gt; {q.chapter}</TableCell>
                                <TableCell><DifficultyBadge difficulty={q.difficulty} /></TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* My Sets Tab */}
                <TabsContent value="my-sets" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">My Question Sets</CardTitle>
                      <Button size="sm" className="btn-primary">
                        <Plus className="w-4 h-4 mr-1" />
                        Create Set
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {setsData.map((set) => (
                          <div key={set.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                              <Layers className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{set.name}</div>
                              <div className="text-xs text-gray-500">{set.questions} questions · Used in {set.usedIn} tests</div>
                            </div>
                            <div className="text-xs font-mono text-orange-600">{set.id}</div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* PDF Extract Tab */}
                <TabsContent value="pdf-extract" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-blue-600" />
                        PDF Extract
                      </CardTitle>
                      <CardDescription>Extract questions from PDF documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">Drag and drop PDF files here</p>
                        <p className="text-xs text-gray-400 mb-4">or</p>
                        <Button variant="outline">
                          Browse Files
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Global Bank Tab */}
                <TabsContent value="global" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="w-5 h-5 text-green-600" />
                        Global Question Bank
                      </CardTitle>
                      <CardDescription>Browse and use questions from the global bank</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input placeholder="Search 50,000+ questions..." className="pl-9 input-field" />
                        </div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-full sm:w-[150px] input-field">
                            <SelectValue placeholder="Exam Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Exams</SelectItem>
                            <SelectItem value="jee">JEE</SelectItem>
                            <SelectItem value="neet">NEET</SelectItem>
                            <SelectItem value="ssc">SSC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">SSC GD Reasoning Pack</span>
                            <Badge className="bg-green-50 text-green-700">500 questions</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">Comprehensive reasoning questions for SSC GD exam</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-600">50 AI credits</span>
                            <Button size="sm" variant="outline">
                              Use This Pack
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              </div>
            </main>
          </OrgContextBanner>
        </div>
      </div>
    </OrgSidebarProvider>
  );
}
