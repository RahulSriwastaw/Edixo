"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Edit,
  Layers,
  Download,
  Share2,
  Trash2,
  GripVertical,
  Zap,
  Globe,
  Lock,
  Building2,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ShareModal } from "@/components/set-system/ShareModal";
import { QuestionSetExportModal } from "@/components/set-system/QuestionSetExportModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WhiteboardSettings } from "@/components/set-system/WhiteboardSettings";

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
  return match ? match[1] : '';
}

// Strip HTML tags for preview
function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '').replace(/\\[()\\[\]]/g, '').trim();
}

// Mock linked content
const linkedMockTests = [
  { id: "MOCK-295018", name: "SSC CGL Full Mock — March 2026", attempts: 48 },
  { id: "MOCK-384729", name: "Railway NTPC Mock Test", attempts: 12 },
  { id: "MOCK-493820", name: "UPSC Prelims Practice", attempts: 0 },
];

const linkedEBooks = [
  { id: "BOOK-103847", name: "SSC Practice Book", downloads: 23 },
];

// Mock access log
const accessLog = [
  { id: "1", user: "Rahul Kumar", source: "PIN", ip: "192.168.1.1", timestamp: "Mar 2, 2026 14:30" },
  { id: "2", user: "Priya Singh", source: "Org Login", ip: "192.168.1.2", timestamp: "Mar 2, 2026 12:15" },
  { id: "3", user: "Amit Sharma", source: "Share", ip: "192.168.1.3", timestamp: "Mar 1, 2026 18:45" },
  { id: "4", user: "Guest", source: "PIN", ip: "192.168.1.4", timestamp: "Mar 1, 2026 10:20" },
];

// Difficulty badge
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    easy: "bg-green-50 text-green-700",
    medium: "bg-amber-50 text-amber-700",
    hard: "bg-red-50 text-red-700",
  };
  return <Badge className={styles[difficulty]}>{difficulty}</Badge>;
}

// Type badge
function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    mcq: "bg-blue-50 text-blue-700",
    integer: "bg-purple-50 text-purple-700",
  };
  return <Badge className={styles[type]}>{type.toUpperCase()}</Badge>;
}

// Visibility badge
function VisibilityBadge({ visibility }: { visibility: string }) {
  if (visibility === "public") {
    return <Badge className="bg-emerald-50 text-emerald-700 gap-1"><Globe className="w-3 h-3" /> Public</Badge>;
  } else if (visibility === "org_only") {
    return <Badge className="bg-blue-50 text-blue-700 gap-1"><Building2 className="w-3 h-3" /> Org-Only</Badge>;
  }
  return <Badge className="bg-gray-100 text-gray-600 gap-1"><Lock className="w-3 h-3" /> Private</Badge>;
}

export default function SetDetailPage() {
  const { isOpen } = useSidebarStore();
  const params = useParams();
  const router = useRouter();
  const setId = params.id as string;

  const [showPassword, setShowPassword] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("questions");

  const [setData, setSetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const token = getToken();
        // Use the whiteboard metadata endpoint to get visual settings too
        const res = await fetch(`${API_URL}/whiteboard/sets/${setId}/metadata`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Also fetch general qbank data if needed, but for now metadata is enough for settings
        const qbankRes = await fetch(`${API_URL}/qbank/sets/${setId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.ok && qbankRes.ok) {
          const resData = await res.json();
          const qbankData = await qbankRes.json();
          
          setSetData({
            ...qbankData.data,
            visualSettings: resData.data.visual_settings, // from whiteboard metadata
            questions: qbankData.data.items?.map((item: any) => ({
              id: item.question.id,
              text: stripHtml(item.question.textEn || item.question.textHi || 'Untitled'),
              difficulty: item.question.difficulty?.toLowerCase() || 'medium',
              type: item.question.type === 'MCQ_SINGLE' ? 'mcq' :
                item.question.type === 'MCQ_MULTIPLE' ? 'multi_select' :
                  item.question.type === 'DESCRIPTIVE' ? 'integer' : 'mcq',
              options: item.question.options || [],
              explanation: item.question.explanationEn || item.question.explanationHi || '',
              marks: item.question.pointCost || 2
            })) || []
          });
        }
      } catch (error) {
        console.error("Error fetching set details:", error);
        setError("Failed to load question set data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSet();
  }, [setId]);

  // Handler for saving whiteboard settings from the component
  const handleSaveWhiteboardSettings = async (settings: any) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/whiteboard/sets/${setId}/visual-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ visual_settings: settings })
    });

    if (!res.ok) {
      throw new Error('Failed to save settings');
    }
    
    // Update local state
    setSetData((prev: any) => ({ ...prev, visualSettings: settings }));
  };

  if (isLoading || !setData) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <Sidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            {error ? (
                <div className="text-center space-y-4">
                    <p className="text-red-500 font-medium">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            ) : (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4511E]"></div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Copy handlers
  const copyId = () => {
    navigator.clipboard.writeText(setData?.setId || "");
    toast.success("SET ID copied!");
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(setData?.pin || "");
    toast.success("Password copied!");
  };

  const resetPassword = () => {
    toast.success("Password reset! New Password: " + String(Math.floor(100000 + Math.random() * 900000)));
  };

  // Drag handlers
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };
  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/question-bank/sets" className="hover:text-[#F4511E]">Question Sets</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{setData.name}</span>
            </div>

            {/* Header Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">{setData.name}</h1>
                    <p className="text-gray-500">{setData.description || "No description provided."}</p>
                  </div>
                  <VisibilityBadge visibility={setData.isGlobal ? "public" : "private"} />
                </div>

                {/* ID and Password Row */}
                <div className="flex flex-wrap items-center gap-6 py-4 border-y">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">ID:</span>
                    <code className="font-mono text-lg bg-gray-50 px-3 py-1 rounded">{setData.setId}</code>
                    <Button variant="ghost" size="sm" onClick={copyId}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Password:</span>
                    <code className="font-mono text-lg bg-gray-50 px-3 py-1 rounded">
                      {showPassword ? setData.pin : "••••••"}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    {showPassword && (
                      <Button variant="ghost" size="sm" onClick={copyPassword}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={resetPassword}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Layers className="w-4 h-4" />
                    <span>{setData.totalQuestions || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>0 accesses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>0 downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(setData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {setData.pdf_notes && (
                  <Card>
                    <CardContent className="p-6 space-y-3 bg-orange-50 border-orange-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Whiteboard Notes PDF</h2>
                          <p className="text-sm text-gray-600">Downloaded from this set after PDF upload.</p>
                        </div>
                        <Link
                          href={`${API_URL.replace('/api', '')}${setData.pdf_notes.url}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-md border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50"
                        >
                          <Download className="w-4 h-4" /> Download PDF
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div>
                          <span className="block text-xs text-gray-500">Pages</span>
                          <span className="font-semibold">{setData.pdf_notes.totalPages || 0}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">File size</span>
                          <span className="font-semibold">{setData.pdf_notes.fileSize || 'N/A'} MB</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Uploaded</span>
                          <span className="font-semibold">{new Date(setData.pdf_notes.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" onClick={() => router.push(`/question-bank/sets/${setId}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="outline">
                    <Layers className="w-4 h-4 mr-2" /> Duplicate
                  </Button>
                  <Button variant="outline" onClick={() => setShowShareModal(true)}>
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                  <Link href={`/question-bank/sets/${setId}/export`}>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                  </Link>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                  <div className="flex-1" />
                  <Link href="/mocktests/create-from-sets">
                    <Button className="bg-[#F4511E] hover:bg-[#E64A19]">
                      <Plus className="w-4 h-4 mr-2" /> Create MockTest
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="used-in">Used In</TabsTrigger>
                <TabsTrigger value="share">Share</TabsTrigger>
                <TabsTrigger value="access-log">Access Log</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
              </TabsList>

              {/* Questions Tab */}
              <TabsContent value="questions" className="mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Questions ({setData.questions?.length})</h3>
                        <Badge className="bg-[#F4511E]">Drag to reorder</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Questions
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {setData.questions?.map((q: any, index: number) => (
                        <div
                          key={q.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "flex items-center gap-3 p-3 bg-white border rounded-lg cursor-move",
                            draggedIndex === index && "opacity-50 shadow-lg"
                          )}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500 w-12">Q{index + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{q.text}</p>
                          </div>
                          <TypeBadge type={q.type} />
                          <DifficultyBadge difficulty={q.difficulty} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Whiteboard Tab */}
              <TabsContent value="whiteboard" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <WhiteboardSettings 
                    setId={setId} 
                    initialSettings={setData.visualSettings} 
                    onSave={handleSaveWhiteboardSettings} 
                />
              </TabsContent>

              {/* Used In Tab */}
              <TabsContent value="used-in" className="mt-4 space-y-6">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Live-synced — Updates automatically reflect in all linked content</span>
                </div>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-medium text-gray-900">Linked MockTests ({linkedMockTests.length})</h3>
                    {linkedMockTests.map((mock) => (
                      <div key={mock.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Layers className="w-5 h-5 text-[#F4511E]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{mock.name}</p>
                            <p className="text-xs text-gray-500">{mock.id} • {mock.attempts} attempts</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Share Tab */}
              <TabsContent value="share" className="mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Shared With</h3>
                      <Button onClick={() => setShowShareModal(true)}>
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {["Rahul Kumar", "Amit Sharma"].map((user, i) => (
                        <div key={user} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                              {user[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user}</p>
                              <p className="text-xs text-gray-500">Shared on Mar {i + 1}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Access Log Tab */}
              <TabsContent value="access-log" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessLog.map((log) => (
                          <tr key={log.id} className="border-b last:border-0">
                            <td className="p-4 text-sm text-gray-600">{log.timestamp}</td>
                            <td className="p-4 text-sm font-medium">{log.user}</td>
                            <td className="p-4">
                              <Badge variant="outline">{log.source}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-medium mb-4">Visibility Settings</h3>
                      <div className="space-y-3">
                        {["private", "org_only", "public"].map((vis) => (
                          <label
                            key={vis}
                            className={cn(
                              "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                              (setData.isGlobal ? (vis === "public") : (vis === "private")) ? "border-[#F4511E] bg-orange-50" : "hover:border-gray-300"
                            )}
                          >
                            <input
                              type="radio"
                              name="visibility"
                              value={vis}
                              checked={setData.isGlobal ? (vis === "public") : (vis === "private")}
                              onChange={() => { }}
                              className="text-[#F4511E]"
                            />
                            <div>
                                <p className="font-medium capitalize">{vis.replace("_", "-")}</p>
                                <p className="text-sm text-gray-500">
                                    {vis === "private" && "Only accessible with PIN"}
                                    {vis === "org_only" && "Org members + PIN access"}
                                    {vis === "public" && "Listed on public website"}
                                </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        contentId={setData?.setId || ""}
        contentPassword={setData?.pin || ""}
        contentName={setData?.name || ""}
        contentType="set"
      />
    </div>
  );
}
