"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, ChevronRight, Calendar, Trash2, Edit, Loader2,
  BookOpen, Clock, Target, CheckCircle2, GripVertical, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const getToken = () => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return m ? m[1] : "";
};

// Sample study plan structure
const sampleDays = [
  { day: 1, topic: "Number System", subject: "Math", duration: 2, questions: 30, type: "concept" },
  { day: 2, topic: "Percentage & Profit-Loss", subject: "Math", duration: 2, questions: 25, type: "practice" },
  { day: 3, topic: "Reading Comprehension", subject: "English", duration: 1.5, questions: 20, type: "concept" },
  { day: 4, topic: "Mini Mock — Quantitative", subject: "Mixed", duration: 3, questions: 50, type: "test" },
  { day: 5, topic: "Current Affairs — March 2026", subject: "GK", duration: 1, questions: 30, type: "revision" },
  { day: 6, topic: "Reasoning — Syllogism", subject: "Reasoning", duration: 2, questions: 25, type: "concept" },
  { day: 7, topic: "Weekly Full Mock", subject: "Mixed", duration: 3, questions: 100, type: "test" },
];

const TYPE_COLORS: Record<string, string> = {
  concept: "bg-blue-50 text-blue-700 border-blue-200",
  practice: "bg-orange-50 text-orange-700 border-orange-200",
  test: "bg-purple-50 text-purple-700 border-purple-200",
  revision: "bg-green-50 text-green-700 border-green-200",
};

const EMPTY_PLAN = { name: "", description: "", durationDays: 30, targetExam: "" };

export default function StudyPlansPage() {
  const { isOpen } = useSidebarStore();
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_PLAN });
  const [isSaving, setIsSaving] = useState(false);

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
          return;
        }
        // Demo plans for now — backend integration ready when StudyPlan model exists
        setPlans([
          { id: "sp1", name: "90-Day SSC CGL Preparation", description: "Complete prep plan for SSC CGL Tier-I exam", durationDays: 90, targetExam: "SSC CGL", enrolledStudents: 0, status: "active" },
          { id: "sp2", name: "30-Day Crash Course", description: "Quick revision for last-minute prep", durationDays: 30, targetExam: "SSC CHSL", enrolledStudents: 0, status: "draft" },
        ]);
      } catch { router.push("/mockbook"); }
      finally { setIsLoading(false); }
    };
    init();
  }, [orgId]);

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Plan name is required");
    setIsSaving(true);
    // When backend StudyPlan model is ready, post here
    const newPlan = { id: `sp_${Date.now()}`, ...form, enrolledStudents: 0, status: "draft" };
    setPlans(p => [newPlan, ...p]);
    toast.success("Study plan created!");
    setShowCreateDialog(false);
    setForm({ ...EMPTY_PLAN });
    setIsSaving(false);
  };

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  if (!selectedOrg) return <div className="min-h-screen flex items-center justify-center p-4"><MockBookOrgSwitcher open={true} onSelect={o => { setSelectedOrg(o); router.push(`/mockbook/org/${o.id}/study-plans`); }} /></div>;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <MockBookOrgBanner org={selectedOrg} onSwitch={() => setShowOrgSwitcher(true)} onExit={() => { setSelectedOrg(null); router.push("/mockbook"); }}>
          <main className="flex-1 p-6">
            <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/mockbook/org/${orgId}`} className="hover:text-orange-600">{selectedOrg.name}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Study Plans</span>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Study Plans</h1>
                  <p className="text-gray-500 text-sm mt-1">Create day-wise structured learning plans for students</p>
                </div>
                <Button className="btn-primary" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" /> New Study Plan
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Plans", value: plans.length },
                  { label: "Active Plans", value: plans.filter(p => p.status === "active").length },
                  { label: "Students Enrolled", value: plans.reduce((a, p) => a + (p.enrolledStudents || 0), 0) },
                ].map(s => (
                  <Card key={s.label} className="kpi-card">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 uppercase">{s.label}</div>
                      <div className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Plans list */}
              {isLoading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map(plan => (
                    <Card
                      key={plan.id}
                      className={cn("cursor-pointer hover:shadow-md transition-all border-2", selectedPlan?.id === plan.id ? "border-orange-400" : "hover:border-orange-200")}
                      onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <Badge variant="outline" className={plan.status === "active" ? "border-green-200 text-green-700" : "border-gray-200 text-gray-600"}>
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="font-bold text-gray-900 mb-1">{plan.name}</div>
                        <div className="text-sm text-gray-500 mb-4">{plan.description}</div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{plan.durationDays} days</span>
                          <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{plan.targetExam}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{plan.enrolledStudents} students</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add new plan card */}
                  <Card className="border-2 border-dashed border-gray-200 hover:border-orange-300 cursor-pointer transition-colors" onClick={() => setShowCreateDialog(true)}>
                    <CardContent className="p-5 flex flex-col items-center justify-center min-h-[160px]">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium text-gray-500">Create New Study Plan</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Day-by-day schedule preview */}
              {selectedPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      {selectedPlan.name} — Day-wise Schedule (First 7 days)
                    </CardTitle>
                    <CardDescription>Sample schedule preview. Full editing coming soon.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sampleDays.map(day => (
                      <div key={day.day} className="flex items-center gap-4 p-3 rounded-xl border hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 font-bold text-sm flex items-center justify-center shrink-0">
                          D{day.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{day.topic}</div>
                          <div className="text-xs text-gray-500">{day.subject} · {day.duration}h · {day.questions} questions</div>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", TYPE_COLORS[day.type])}>
                          {day.type}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </MockBookOrgBanner>
      </div>

      <MockBookOrgSwitcher open={showOrgSwitcher} onSelect={o => { setSelectedOrg(o); setShowOrgSwitcher(false); router.push(`/mockbook/org/${o.id}/study-plans`); }} recentOrgs={selectedOrg ? [selectedOrg] : []} />

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Study Plan</DialogTitle>
            <DialogDescription>Set up a structured day-wise learning plan for your students.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Plan Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. 90-Day SSC CGL Plan" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5"><Label>Description</Label>
              <Textarea placeholder="Brief plan overview..." className="input-field resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Duration (days)</Label>
                <Input type="number" className="input-field" value={form.durationDays} onChange={e => setForm(p => ({ ...p, durationDays: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5"><Label>Target Exam</Label>
                <Input placeholder="SSC CGL, NEET..." className="input-field" value={form.targetExam} onChange={e => setForm(p => ({ ...p, targetExam: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleCreate} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
