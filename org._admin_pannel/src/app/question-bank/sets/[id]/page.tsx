"use client";

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

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

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
  const params = useParams();
  const router = useRouter();
  const setId = params.id as string;

  const [showPassword, setShowPassword] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [data, setData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const token = getToken();
        setIsLoading(true);
        const res = await fetch(`${API_URL}/qbank/sets/${setId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data?.set);
          setQuestions(json.data?.questions || []);
        } else {
          toast.error("Failed to fetch set details");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("An error occurred while fetching details");
      } finally {
        setIsLoading(false);
      }
    };
    if (setId) {
      fetchSet();
    }
  }, [setId]);

  // Copy handlers
  const copyId = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.code);
    toast.success("SET ID copied!");
  };

  const copyPassword = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.password);
    toast.success("Password copied!");
  };

  const resetPassword = () => {
    toast.success("Password reset! New Password: " + String(Math.floor(100000 + Math.random() * 900000)));
  };

  // Drag handlers
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    // Reorder logic would go here
  };
  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/question-bank/sets" className="hover:text-[#F4511E]">Question Sets</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{data?.name || "Loading..."}</span>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-12">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : !data ? (
              <div className="text-center p-12 text-gray-500">Set not found</div>
            ) : (
              <>
                {/* Header Card */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
                        <p className="text-gray-500">{data.description || "No description"}</p>
                      </div>
                      <VisibilityBadge visibility={data.isGlobal === false ? "org_only" : "public"} />
                    </div>

                    {/* ID and Password Row */}
                    <div className="flex flex-wrap items-center gap-6 py-4 border-y">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">ID:</span>
                        <code className="font-mono text-lg bg-gray-50 px-3 py-1 rounded">{data.code}</code>
                        <Button variant="ghost" size="sm" onClick={copyId}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Password:</span>
                        <code className="font-mono text-lg bg-gray-50 px-3 py-1 rounded">
                          {showPassword ? data.password : "••••••"}
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
                        <span>{questions.length} Questions</span>
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
                        <span>Created {new Date(data.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

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
                  </TabsList>

                  {/* Questions Tab */}
                  <TabsContent value="questions" className="mt-4">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Questions ({questions.length})</h3>
                            <Badge className="bg-[#F4511E]">Drag to reorder</Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Add Questions
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {questions.map((q, index) => (
                            <div
                              key={q.id || index}
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
                                <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: q.question_eng || q.question_hin || "Question text" }} />
                              </div>
                              <TypeBadge type={q.type || 'mcq'} />
                              <DifficultyBadge difficulty={q.difficulty || 'medium'} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Used In Tab */}
                  <TabsContent value="used-in" className="mt-4 space-y-6">
                    {/* Live Sync Badge */}
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Zap className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Live-synced — Updates automatically reflect in all linked content</span>
                    </div>

                    {/* MockTests */}
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-medium text-gray-900">Linked MockTests (0)</h3>
                        <div className="text-sm text-gray-500 italic">No mock tests currently linked to this set.</div>
                      </CardContent>
                    </Card>

                    {/* eBooks */}
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-medium text-gray-900">Linked eBooks (0)</h3>
                        <div className="text-sm text-gray-500 italic">No eBooks currently linked to this set.</div>
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
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Users (2)</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Rahul Kumar</p>
                                    <p className="text-xs text-gray-500">Mar 1 • 2 accesses</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Amit Sharma</p>
                                    <p className="text-xs text-gray-500">Mar 2 • 5 accesses</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 mb-2">Organizations (1)</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Apex Academy</p>
                                    <p className="text-xs text-gray-500">48 members</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                              </div>
                            </div>
                          </div>
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
                              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">IP</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b last:border-0">
                              <td colSpan={4} className="p-8 text-center text-gray-500">No access logs available for this set.</td>
                            </tr>
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
                                  (data?.isGlobal ? "public" : "org_only") === vis ? "border-[#F4511E] bg-orange-50" : "hover:border-gray-300"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="visibility"
                                  value={vis}
                                  checked={(data?.isGlobal ? "public" : "org_only") === vis}
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

                        <div className="border-t pt-6">
                          <h3 className="font-medium mb-4">Permissions</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Allow PDF Download</p>
                                <p className="text-sm text-gray-500">Users can download content as PDF</p>
                              </div>
                              <Switch checked={true} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Show Solutions</p>
                                <p className="text-sm text-gray-500">Display solutions after submission</p>
                              </div>
                              <Switch checked={false} />
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h3 className="font-medium mb-4">Expiry</h3>
                          <div className="flex items-center gap-4">
                            <Switch />
                            <div className="flex-1">
                              <Input type="datetime-local" disabled />
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h3 className="font-medium mb-4 text-red-600">Danger Zone</h3>
                          <div className="flex gap-3">
                            <Button variant="outline">Archive Set</Button>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              Delete Set
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Share Modal */}
      {data && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          contentId={data?.code}
          contentPassword={data?.password}
          contentName={data?.name}
          contentType="set"
        />
      )}


    </div>
  );
}
