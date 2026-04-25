
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Settings,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Loader2,
  AlertTriangle,
  CreditCard,
  History,
  Zap,
  CheckCircle2,
  Coins,
  Gift,
  Copy,
  MessageCircle,
  Send,
  Users
} from "lucide-react";
import { useAuth, useUser, useFirestore, useDoc } from "@/firebase";
import { signOut, deleteUser } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("subscriptions");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [copied, setCopied] = useState(false);

  const userRef = user ? doc(db, "users", user.uid) : null;
  const { data: userData } = useDoc(userRef);

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    studyReminders: true,
    examUpdates: true
  });

  useEffect(() => {
    if (userData?.settings?.notifications) {
      setNotifications(userData.settings.notifications);
    }
  }, [userData]);

  const handleLogout = async () => {
    if (auth) { await signOut(auth); router.push("/login"); }
  };

  const handleToggleNotification = async (key: keyof typeof notifications) => {
    if (!user || !db) return;
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    setIsSaving(true);
    updateDoc(doc(db, "users", user.uid), {
      "settings.notifications": newNotifications,
      updatedAt: serverTimestamp()
    })
      .then(() => toast({ title: "Preference Saved" }))
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${user.uid}`, operation: 'update',
          requestResourceData: { "settings.notifications": newNotifications }
        }));
      })
      .finally(() => setIsSaving(false));
  };

  const handleDeleteAccount = async () => {
    if (!auth?.currentUser) return;
    setIsDeleting(true);
    try {
      await deleteUser(auth.currentUser);
      toast({ title: "Account Deleted" });
      router.push("/login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Required", description: "Please re-login to perform this action." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCode = () => {
    const code = user?.uid?.substring(0, 8).toUpperCase() || "MOCKBOOK10";
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Code Copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const plans = [
    {
      name: "Basic Plan",
      monthlyPrice: "₹499",
      yearlyPrice: "₹4,999",
      features: ["All Chapter Tests", "Basic AI Planner", "PDF Summary"],
      badge: "Individual",
      isPopular: false
    },
    {
      name: "Pro Member",
      monthlyPrice: "₹1,499",
      yearlyPrice: "₹14,999",
      features: ["Unlimited Mocks", "Advanced Insights", "Priority Support", "Video Solutions"],
      badge: "Best Value",
      isPopular: true
    }
  ];

  const navTabs = [
    { id: "subscriptions", icon: CreditCard, label: "Subscriptions" },
    { id: "refer", icon: Gift, label: "Refer & Earn" },
    { id: "billing", icon: History, label: "History" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "security", icon: Shield, label: "Security" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}>
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Manage your plan and preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                <Coins className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                <div>
                  <p className="text-[9px] font-bold uppercase leading-none" style={{ color: "var(--text-muted)" }}>Balance</p>
                  <p className="text-sm font-bold leading-none" style={{ color: "#FF6B2B" }}>{(userData?.totalPoints || 0).toLocaleString()} Coins</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Sidebar Nav */}
              <aside className="lg:col-span-3">
                <Card className="p-2 card-hover">
                  <div className="space-y-0.5">
                    {navTabs.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all",
                          activeTab === item.id
                            ? "text-[#FF6B2B]"
                            : "hover:opacity-80"
                        )}
                        style={activeTab === item.id ? { background: "rgba(255,107,43,0.08)" } : { color: "var(--text-secondary)", background: "transparent" }}
                      >
                        <item.icon className="h-4 w-4" style={{ color: activeTab === item.id ? "#FF6B2B" : "var(--text-muted)" }} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </aside>

              {/* Content Panel */}
              <div className="lg:col-span-9 space-y-5">

                {/* SUBSCRIPTIONS */}
                {activeTab === "subscriptions" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="overflow-hidden rounded-lg card-hover">
                      <div className="p-4 flex items-center justify-between" style={{ background: "rgba(255,107,43,0.08)", borderBottom: "var(--divider)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                            <Zap className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Plan: {userData?.plan === "premium" ? "Pro Member" : "Free"}</p>
                            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Management & status</p>
                          </div>
                        </div>
                        {userData?.plan === "premium" && (
                          <Badge className="text-[10px] font-bold">PRO ACTIVE</Badge>
                        )}
                      </div>
                      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Next Renewal</p>
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>12 Mar 2026</p>
                        </div>
                        <div className="sm:col-span-2 p-3 rounded-lg" style={{ background: "var(--bg-main)", border: "var(--border-card)" }}>
                          <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Payment Method</p>
                          <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>Visa ending in 4242</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-3 py-2">
                      <span className={cn("text-sm font-bold", billingCycle === 'monthly' ? "" : "")} style={{ color: billingCycle === 'monthly' ? "var(--text-primary)" : "var(--text-muted)" }}>Monthly</span>
                      <Switch
                        checked={billingCycle === 'yearly'}
                        onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                      />
                      <span className={cn("text-sm font-bold flex items-center gap-1.5", billingCycle === 'yearly' ? "" : "")} style={{ color: billingCycle === 'yearly' ? "var(--text-primary)" : "var(--text-muted)" }}>
                        Yearly <Badge variant="success" className="ml-1 text-[10px] h-5 font-bold">SAVE 20%</Badge>
                      </span>
                    </div>

                    {/* Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plans.map((plan) => (
                        <Card key={plan.name} className={cn(
                          "relative overflow-hidden transition-all rounded-lg card-hover",
                          plan.isPopular ? "ring-1" : ""
                        )} style={plan.isPopular ? { borderColor: "#FF6B2B" } : {}}>
                          {plan.isPopular && (
                            <div className="absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg" style={{ background: "#FF6B2B", color: "#fff" }}>
                              RECOMMENDED
                            </div>
                          )}
                          <CardHeader className="p-4">
                            <Badge variant="secondary" className="w-fit text-[10px] h-5 mb-2 rounded-full">{plan.badge}</Badge>
                            <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                                {billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                              </span>
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-4">
                            <ul className="space-y-2">
                              {plan.features.map((feat) => (
                                <li key={feat} className="flex items-center gap-2.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--badge-success-text)" }} />
                                  {feat}
                                </li>
                              ))}
                            </ul>
                            <Button className={cn("w-full font-bold h-9 rounded-lg text-[12px]", plan.isPopular ? "" : "")}
                              style={plan.isPopular ? { background: "#FF6B2B" } : { background: "var(--btn-secondary-border)", color: "var(--btn-secondary-text)" }}
                            >
                              {userData?.plan === (plan.isPopular ? "premium" : "free") ? "Current Plan" : "Upgrade Now"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* REFER */}
                {activeTab === "refer" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="overflow-hidden rounded-lg card-hover" style={{ background: "#FF6B2B" }}>
                      <CardContent className="p-6 space-y-5">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-white" />
                          <Badge className="text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }}>GIVE 500, GET 500</Badge>
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-2xl font-bold text-white">Invite Friends</h2>
                          <p className="text-white/70 text-sm">Both get 500 coins instantly when they join with your code.</p>
                        </div>
                        <div className="p-1 rounded-xl flex flex-col sm:flex-row items-center gap-2" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                          <div className="flex-1 px-4 py-2 text-center sm:text-left">
                            <p className="text-[10px] font-bold uppercase opacity-60 mb-0.5 text-white">Your Code</p>
                            <p className="text-xl font-mono font-bold text-white">{user?.uid?.substring(0, 8).toUpperCase() || "MOCKBOOK10"}</p>
                          </div>
                          <Button
                            onClick={handleCopyCode}
                            className="w-full sm:w-auto font-bold h-10 px-5 text-sm rounded-lg"
                            style={{ background: "#fff", color: "#FF6B2B" }}
                          >
                            {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="rounded-lg card-hover">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold">Quick Share</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 grid grid-cols-2 gap-2">
                          {[
                            { name: "WhatsApp", icon: MessageCircle, color: "bg-emerald-500" },
                            { name: "Telegram", icon: Send, color: "bg-blue-500" },
                          ].map((social) => (
                            <Button
                              key={social.name}
                              className={cn("h-11 flex flex-col items-center justify-center gap-0.5 border-none text-white rounded-lg", social.color)}
                            >
                              <social.icon className="h-4 w-4" />
                              <span className="text-[10px] font-bold">{social.name}</span>
                            </Button>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="rounded-lg card-hover">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold">Gold Milestone</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span style={{ color: "var(--text-muted)" }}>Progress</span>
                            <span style={{ color: "#FF6B2B" }}>8/20 Friends</span>
                          </div>
                          <Progress value={40} className="h-2" />
                          <p className="text-[11px] text-center" style={{ color: "var(--text-muted)" }}>Invite 12 more for Gold Badge!</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === "notifications" && (
                  <Card className="rounded-lg card-hover animate-in fade-in">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Bell className="h-4 w-4" style={{ color: "#FF6B2B" }} /> Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      {[
                        { id: "push", label: "Push Alerts", desc: "Mobile & browser notifications" },
                        { id: "studyReminders", label: "Study Reminders", desc: "Keep your streak alive every day" },
                        { id: "examUpdates", label: "Exam Updates", desc: "New mock tests and series alerts" }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 last:border-0" style={{ borderBottom: "var(--divider)" }}>
                          <div className="space-y-0.5">
                            <Label className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</Label>
                            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                          </div>
                          <Switch
                            checked={notifications[item.id as keyof typeof notifications]}
                            onCheckedChange={() => handleToggleNotification(item.id as keyof typeof notifications)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* BILLING */}
                {activeTab === "billing" && (
                  <Card className="rounded-lg card-hover animate-in fade-in">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <History className="h-4 w-4" style={{ color: "#FF6B2B" }} /> Billing History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-center py-12 space-y-3">
                        <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto" style={{ background: "var(--bg-main)" }}>
                          <History className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No recent transactions found.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SECURITY */}
                {activeTab === "security" && (
                  <div className="space-y-4 animate-in fade-in">
                    <Card className="rounded-lg card-hover">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <Shield className="h-4 w-4" style={{ color: "var(--badge-success-text)" }} /> Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button variant="outline" className="w-full sm:w-auto h-9 text-[12px] font-semibold rounded-lg" style={{ borderColor: "var(--btn-secondary-border)", color: "var(--btn-secondary-text)" }} onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" /> Log Out
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-lg card-hover" style={{ background: "var(--badge-error-bg)", borderColor: "rgba(198,40,40,0.2)" }}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: "var(--badge-error-text)" }}>
                          <AlertTriangle className="h-4 w-4" /> Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <p className="text-[12px] leading-relaxed" style={{ color: "var(--badge-error-text)", opacity: 0.8 }}>
                          Deleting your account will permanently remove all your progress, test attempts, and active subscriptions. This action cannot be undone.
                        </p>
                        <Button variant="destructive" className="h-9 text-[12px] font-bold rounded-lg" onClick={handleDeleteAccount} disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                          Delete My Account
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
