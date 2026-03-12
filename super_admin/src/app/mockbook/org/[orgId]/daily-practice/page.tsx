"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target, ChevronRight, Loader2, Plus, BarChart3,
  BookOpen, Clock, Settings, Zap, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const getToken = () => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return m ? m[1] : "";
};

const SUBJECTS = ["Math", "English", "Reasoning", "GK", "Science", "Economics"];

export default function DailyPracticePage() {
  const { isOpen } = useSidebarStore();
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Config state
  const [config, setConfig] = useState({
    questionsPerDay: 20,
    enabled: true,
    difficulty: "mixed",
    schedule: "08:00",
    subjects: { Math: 25, English: 20, Reasoning: 25, GK: 20, Science: 5, Economics: 5 },
    showExplanations: true,
    allowRetake: false,
    negativeMarking: false,
    streak: true,
  });

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        const token = getToken();
        const orgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/super-admin/organizations/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orgData = await orgRes.json();
        if (orgData.success) {
          const o = orgData.data;
          setSelectedOrg({ id: o.orgId, name: o.name, plan: o.plan || "SMALL", status: o.status || "ACTIVE", students: o._count?.students || 0, mockTests: 0, aiCredits: o.aiCredits || 0 });
        } else {
          router.push("/mockbook");
        }
      } catch { router.push("/mockbook"); }
    };
    init();
  }, [orgId]);

  const handleSave = async () => {
    setIsSaving(true);
    // When backend endpoint for DailyPractice config is ready, POST here
    await new Promise(r => setTimeout(r, 800));
    toast.success("Daily practice settings saved!");
    setIsSaving(false);
  };

  const updateSubjectWeight = (subject: string, value: number) => {
    setConfig(c => ({ ...c, subjects: { ...c.subjects, [subject]: value } }));
  };

  const totalWeight = Object.values(config.subjects).reduce((a, b) => a + b, 0);

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  if (!selectedOrg) return <div className="min-h-screen flex items-center justify-center p-4"><MockBookOrgSwitcher open={true} onSelect={o => { setSelectedOrg(o); router.push(`/mockbook/org/${o.id}/daily-practice`); }} /></div>;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <MockBookOrgBanner org={selectedOrg} onSwitch={() => setShowOrgSwitcher(true)} onExit={() => { setSelectedOrg(null); router.push("/mockbook"); }}>
          <main className="flex-1 p-6">
            <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/mockbook/org/${orgId}`} className="hover:text-orange-600">{selectedOrg.name}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Daily Practice</span>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Daily Practice Configuration</h1>
                  <p className="text-gray-500 text-sm mt-1">Configure daily question sets and engagement settings for {selectedOrg.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Daily Practice</span>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={v => setConfig(c => ({ ...c, enabled: v }))}
                  />
                  <Badge variant="outline" className={config.enabled ? "border-green-200 text-green-700" : "border-gray-200 text-gray-600"}>
                    {config.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Settings */}
                <div className="lg:col-span-2 space-y-5">

                  {/* Basic config */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4 text-orange-500" />Basic Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Questions per Day</Label>
                          <Input
                            type="number"
                            min={5} max={100}
                            className="input-field"
                            value={config.questionsPerDay}
                            onChange={e => setConfig(c => ({ ...c, questionsPerDay: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Send Time</Label>
                          <Input
                            type="time"
                            className="input-field"
                            value={config.schedule}
                            onChange={e => setConfig(c => ({ ...c, schedule: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Difficulty Level</Label>
                        <Select value={config.difficulty} onValueChange={v => setConfig(c => ({ ...c, difficulty: v }))}>
                          <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subject weights */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" />Subject Distribution</CardTitle>
                      <CardDescription>
                        Set percentage weights. Total: <span className={cn("font-semibold", totalWeight === 100 ? "text-green-600" : "text-red-600")}>{totalWeight}%</span>
                        {totalWeight !== 100 && <span className="text-red-500 ml-2">(must equal 100%)</span>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {SUBJECTS.map(sub => (
                        <div key={sub} className="flex items-center gap-4">
                          <div className="w-24 text-sm text-gray-700 font-medium">{sub}</div>
                          <div className="flex-1">
                            <Progress value={config.subjects[sub as keyof typeof config.subjects] || 0} className="h-2" />
                          </div>
                          <Input
                            type="number"
                            min={0} max={100}
                            className="w-20 h-8 text-sm input-field"
                            value={config.subjects[sub as keyof typeof config.subjects]}
                            onChange={e => updateSubjectWeight(sub, Number(e.target.value))}
                          />
                          <span className="text-sm text-gray-500 w-4">%</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right column: Toggles & Preview */}
                <div className="space-y-5">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Feature Toggles</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { key: "showExplanations", label: "Show Explanations", desc: "After answering each question" },
                        { key: "allowRetake", label: "Allow Retake", desc: "Students can retake daily practice" },
                        { key: "negativeMarking", label: "Negative Marking", desc: "-0.25 for wrong answers" },
                        { key: "streak", label: "Streak Tracker", desc: "Show daily streak counter" },
                      ].map(t => (
                        <div key={t.key} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{t.label}</div>
                            <div className="text-xs text-gray-500">{t.desc}</div>
                          </div>
                          <Switch
                            checked={config[t.key as keyof typeof config] as boolean}
                            onCheckedChange={v => setConfig(c => ({ ...c, [t.key]: v }))}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Preview card */}
                  <Card className="border-orange-100 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">Preview</div>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            <div>{config.questionsPerDay} questions at {config.schedule}</div>
                            <div>Difficulty: {config.difficulty}</div>
                            <div>{config.showExplanations ? "With explanations" : "No explanations"}</div>
                            {config.streak && <div>🔥 Streak tracking enabled</div>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="btn-primary w-full" onClick={handleSave} disabled={isSaving || totalWeight !== 100}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </MockBookOrgBanner>
      </div>

      <MockBookOrgSwitcher open={showOrgSwitcher} onSelect={o => { setSelectedOrg(o); setShowOrgSwitcher(false); router.push(`/mockbook/org/${o.id}/daily-practice`); }} recentOrgs={selectedOrg ? [selectedOrg] : []} />
    </div>
  );
}
