"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Calendar,
  BarChart3,
  Sparkles,
  Eye,
  AlertTriangle,
  Users,
  FileText,
  TrendingUp,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Mock org data
const orgData = {
  id: "GK-ORG-00142",
  name: "Apex Academy",
  plan: "Medium",
};

// Mock questions data for this org
const orgQuestions = [
  { id: 1, question: "What is the SI unit of force?", subject: "Physics", chapter: "Laws of Motion", difficulty: "Easy", visibility: "Private", usageCount: 45, createdBy: "Rajesh Kumar", createdAt: "Feb 20, 2026" },
  { id: 2, question: "Solve: ∫(x² + 2x + 1)dx", subject: "Mathematics", chapter: "Integration", difficulty: "Medium", visibility: "Private", usageCount: 32, createdBy: "Priya Sharma", createdAt: "Feb 18, 2026" },
  { id: 3, question: "Which of the following is a noble gas?", subject: "Chemistry", chapter: "Periodic Table", difficulty: "Easy", visibility: "Public", usageCount: 128, createdBy: "Amit Verma", createdAt: "Feb 15, 2026" },
  { id: 4, question: "A particle moves in a circle of radius r...", subject: "Physics", chapter: "Kinematics", difficulty: "Hard", visibility: "Private", usageCount: 23, createdBy: "Rajesh Kumar", createdAt: "Feb 12, 2026" },
  { id: 5, question: "Find the derivative of sin(x)cos(x)", subject: "Mathematics", chapter: "Differentiation", difficulty: "Medium", visibility: "Private", usageCount: 56, createdBy: "Priya Sharma", createdAt: "Feb 10, 2026" },
];

// Mock sets data
const orgSets = [
  { id: "SET-001", name: "JEE Physics Set 1", questions: 30, subject: "Physics", visibility: "Public", usageCount: 245, createdBy: "Rajesh Kumar", createdAt: "Feb 20, 2026" },
  { id: "SET-002", name: "NEET Biology Set 1", questions: 50, subject: "Biology", visibility: "Private", usageCount: 156, createdBy: "Priya Sharma", createdAt: "Feb 18, 2026" },
  { id: "SET-003", name: "Math Practice Set", questions: 25, subject: "Mathematics", visibility: "Private", usageCount: 89, createdBy: "Amit Verma", createdAt: "Feb 15, 2026" },
];

// Mock exams data
const orgExams = [
  { id: "EXAM-001", name: "JEE Mock Test 3", scheduledFor: "Mar 05, 2026 10:00 AM", duration: 180, questions: 90, registered: 245, status: "Scheduled" },
  { id: "EXAM-002", name: "NEET Practice Test", scheduledFor: "Mar 03, 2026 2:00 PM", duration: 200, questions: 200, registered: 189, status: "Scheduled" },
  { id: "EXAM-003", name: "Weekly Quiz 12", scheduledFor: "Mar 01, 2026 9:00 AM", duration: 60, questions: 30, registered: 312, status: "Completed" },
  { id: "EXAM-004", name: "Physics Test Series", scheduledFor: "Feb 28, 2026 11:00 AM", duration: 90, questions: 45, registered: 178, status: "Completed" },
];

// Mock AI usage data
const aiUsageData = {
  totalCredits: 500,
  usedCredits: 342,
  monthlyLimit: 500,
  usageHistory: [
    { teacher: "Rajesh Kumar", creditsUsed: 156, questionsGenerated: 28, lastUsed: "2 hours ago" },
    { teacher: "Priya Sharma", creditsUsed: 98, questionsGenerated: 18, lastUsed: "5 hours ago" },
    { teacher: "Amit Verma", creditsUsed: 52, questionsGenerated: 10, lastUsed: "1 day ago" },
    { teacher: "Suresh Patel", creditsUsed: 36, questionsGenerated: 7, lastUsed: "2 days ago" },
  ],
};

// Difficulty Badge
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    Easy: "bg-green-50 text-green-700",
    Medium: "bg-orange-50 text-orange-700",
    Hard: "bg-red-50 text-red-700",
  };
  return <span className={`badge ${styles[difficulty] || ""}`}>{difficulty}</span>;
}

// Visibility Badge
function VisibilityBadge({ visibility }: { visibility: string }) {
  const styles: Record<string, string> = {
    Public: "bg-orange-50 text-orange-700",
    Private: "bg-gray-100 text-gray-600",
  };
  return <span className={`badge ${styles[visibility] || ""}`}>{visibility}</span>;
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Scheduled: "bg-blue-50 text-blue-700",
    Completed: "badge-active",
    "In Progress": "bg-orange-50 text-orange-700",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

export default function OrgMockBookOversightPage() {
    const { isOpen } = useSidebarStore();
const params = useParams();
  const orgId = params.orgId as string;
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = () => {
    toast.success("Data refreshed");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Back Link */}
            <div className="flex items-center gap-4">
              <Link
                href={`/organizations/${orgId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">MockBook Oversight</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Read-only view of {orgData.name}&apos;s MockBook content and usage
                </p>
              </div>
              <Badge className="bg-gray-100 text-gray-600 text-sm">
                Read-Only Access
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Questions</div>
                      <div className="text-xl font-bold text-gray-900">{orgQuestions.length * 100}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Question Sets</div>
                      <div className="text-xl font-bold text-gray-900">{orgSets.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Scheduled Exams</div>
                      <div className="text-xl font-bold text-gray-900">{orgExams.filter(e => e.status === "Scheduled").length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">AI Credits Used</div>
                      <div className="text-xl font-bold text-gray-900">{aiUsageData.usedCredits} / {aiUsageData.monthlyLimit}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Credits Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">AI Credit Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{aiUsageData.usedCredits} credits used of {aiUsageData.monthlyLimit}</span>
                    <span className="font-medium text-gray-900">{Math.round((aiUsageData.usedCredits / aiUsageData.monthlyLimit) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(aiUsageData.usedCredits / aiUsageData.monthlyLimit) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="questions" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="questions" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Questions
                </TabsTrigger>
                <TabsTrigger value="sets" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Sets
                </TabsTrigger>
                <TabsTrigger value="exams" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Scheduled Exams
                </TabsTrigger>
                <TabsTrigger value="ai-usage" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Usage
                </TabsTrigger>
              </TabsList>

              {/* Questions Tab */}
              <TabsContent value="questions" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Questions Created by Org</CardTitle>
                    <div className="relative w-64">
                      <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Question</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Subject</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Chapter</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Difficulty</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Visibility</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Usage</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Created By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orgQuestions.map((q) => (
                          <TableRow key={q.id} className="hover:bg-gray-50">
                            <TableCell className="text-sm text-gray-900 max-w-[300px] truncate italic">
                              {q.question}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{q.subject}</TableCell>
                            <TableCell className="text-sm text-gray-600">{q.chapter}</TableCell>
                            <TableCell><DifficultyBadge difficulty={q.difficulty} /></TableCell>
                            <TableCell><VisibilityBadge visibility={q.visibility} /></TableCell>
                            <TableCell className="text-sm text-gray-900">{q.usageCount}</TableCell>
                            <TableCell className="text-sm text-gray-600">{q.createdBy}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sets Tab */}
              <TabsContent value="sets" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Question Sets</CardTitle>
                    <CardDescription>Question sets created by this organization</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Set Name</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Questions</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Subject</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Visibility</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Usage</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Created By</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orgSets.map((set) => (
                          <TableRow key={set.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{set.name}</TableCell>
                            <TableCell className="text-sm text-gray-900">{set.questions}</TableCell>
                            <TableCell className="text-sm text-gray-600">{set.subject}</TableCell>
                            <TableCell><VisibilityBadge visibility={set.visibility} /></TableCell>
                            <TableCell className="text-sm text-gray-900">{set.usageCount}</TableCell>
                            <TableCell className="text-sm text-gray-600">{set.createdBy}</TableCell>
                            <TableCell className="text-sm text-gray-500">{set.createdAt}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Exams Tab */}
              <TabsContent value="exams" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Scheduled Exams</CardTitle>
                    <CardDescription>Upcoming and completed exams by this organization</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Exam Name</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Scheduled For</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Duration</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Questions</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Registered</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orgExams.map((exam) => (
                          <TableRow key={exam.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{exam.name}</TableCell>
                            <TableCell className="text-sm text-gray-600">{exam.scheduledFor}</TableCell>
                            <TableCell className="text-sm text-gray-900">{exam.duration} min</TableCell>
                            <TableCell className="text-sm text-gray-900">{exam.questions}</TableCell>
                            <TableCell className="text-sm text-gray-900">{exam.registered}</TableCell>
                            <TableCell><StatusBadge status={exam.status} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Usage Tab */}
              <TabsContent value="ai-usage" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Teacher-wise AI Usage</CardTitle>
                      <CardDescription>AI credit consumption by teachers this month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Teacher</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Credits Used</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Questions Generated</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Used</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aiUsageData.usageHistory.map((usage, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-gray-900">{usage.teacher}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-900">{usage.creditsUsed}</span>
                                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-brand-primary rounded-full"
                                      style={{ width: `${(usage.creditsUsed / aiUsageData.usedCredits) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-900">{usage.questionsGenerated}</TableCell>
                              <TableCell className="text-sm text-gray-500">{usage.lastUsed}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-700 mb-1">Credits Remaining</div>
                        <div className="text-2xl font-bold text-orange-900">
                          {aiUsageData.monthlyLimit - aiUsageData.usedCredits}
                        </div>
                        <div className="text-xs text-orange-600 mt-1">of {aiUsageData.monthlyLimit} monthly limit</div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Questions Generated</span>
                          <span className="font-medium text-gray-900">63</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg Credits per Question</span>
                          <span className="font-medium text-gray-900">5.4</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Active Teachers</span>
                          <span className="font-medium text-gray-900">4</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-blue-900">Resets on</div>
                          <div className="text-xs text-blue-700">March 15, 2026</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
