"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Phone, Target, Calendar, Award, ShieldCheck, Loader2, Save, BookOpen, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    primaryExam: "JEE",
    targetYear: new Date().getFullYear() + 1,
    studentId: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/students/me");
        const data = res.data;
        if (data) {
          setProfileData({
            name: data.name || "",
            email: data.email || data.user?.email || "",
            phone: data.mobile || "",
            primaryExam: "JEE",
            targetYear: new Date().getFullYear() + 1,
            studentId: data.studentId || "",
          });
        }
      } catch (err: any) {
        console.warn("Could not fetch student profile:", err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/students/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          primaryExam: profileData.primaryExam,
          targetYear: profileData.targetYear,
        }),
      });
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.message || "Could not save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const achievements = [
    { icon: Flame, label: "18-Day Streak", color: "text-[#FF6B2B]" },
    { icon: BookOpen, label: "50 Tests Done", color: "text-[var(--badge-info-text)]" },
    { icon: Award, label: "Silver League", color: "text-[var(--text-muted)]" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-body)" }}>
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin mx-auto" style={{ color: "#FF6B2B" }} />
              <p className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Loading your profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-5 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Header */}
            <div>
              <h1 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>My Profile</h1>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Manage your personal information and exam goals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Avatar + Info */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="card-hover">
                  <div className="h-14 rounded-t-lg" style={{ background: "rgba(255,107,43,0.08)" }} />
                  <CardContent className="px-4 pb-4 -mt-9">
                    <div className="flex flex-col items-center text-center space-y-2.5">
                      <div className="ring-4 rounded-full" style={{ borderColor: "var(--bg-card)" }}>
                        <ProfilePictureUpload
                          currentPhotoURL={null}
                          displayName={profileData.name}
                          email={profileData.email}
                          size="lg"
                          onUploadSuccess={() => {
                            toast({ title: "Photo Updated!", description: "Your profile picture has been updated." });
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h2 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{profileData.name || "Student"}</h2>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{profileData.email}</p>
                        {profileData.studentId && (
                          <p
                            className="text-[10px] font-bold px-2 py-[1px] rounded-full inline-block mt-1"
                            style={{ background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}
                          >
                            ID: {profileData.studentId}
                          </p>
                        )}
                      </div>
                      <Badge variant="default">
                        <Award className="h-3 w-3 mr-1" /> Silver League
                      </Badge>
                      {/* Level progress */}
                      <div className="w-full pt-2 space-y-1.5" style={{ borderTop: "var(--divider)" }}>
                        <div className="flex items-center justify-between text-[10px]">
                          <span style={{ color: "var(--text-muted)" }}>Level 12</span>
                          <span className="font-bold" style={{ color: "#FF6B2B" }}>65%</span>
                        </div>
                        <Progress value={65} className="h-1.5" />
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>350 XP to Level 13</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="card-hover">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1.5">
                    {achievements.map((a) => (
                      <div key={a.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--bg-main)" }}>
                        <a.icon className={cn("h-4 w-4 shrink-0", a.color)} />
                        <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{a.label}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Form */}
              <Card className="lg:col-span-2 card-hover">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" style={{ color: "var(--badge-success-text)" }} /> Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-3">
                  <form onSubmit={handleSave} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                          <Input
                            id="name"
                            className="pl-9 h-9 rounded-lg"
                            placeholder="Your full name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                          <Input
                            id="email"
                            className="pl-9 h-9 rounded-lg"
                            disabled
                            value={profileData.email}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                          <Input
                            id="phone"
                            className="pl-9 h-9 rounded-lg"
                            placeholder="+91 9876543210"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="exam" className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Primary Exam</Label>
                        <div className="relative">
                          <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: "var(--text-muted)" }} />
                          <Select value={profileData.primaryExam} onValueChange={(v) => setProfileData({ ...profileData, primaryExam: v })}>
                            <SelectTrigger id="exam" className="pl-9 h-9 rounded-lg">
                              <SelectValue placeholder="Select Exam" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="JEE">JEE Mains</SelectItem>
                              <SelectItem value="NEET">NEET</SelectItem>
                              <SelectItem value="UPSC">UPSC</SelectItem>
                              <SelectItem value="SSC">SSC CGL</SelectItem>
                              <SelectItem value="Railway">Railway RRB</SelectItem>
                              <SelectItem value="Banking">Banking (IBPS)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="year" className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Target Year</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: "var(--text-muted)" }} />
                        <Select value={profileData.targetYear.toString()} onValueChange={(v) => setProfileData({ ...profileData, targetYear: parseInt(v) })}>
                          <SelectTrigger id="year" className="pl-9 h-9 rounded-lg">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-9 font-bold mt-1 text-[13px] rounded-lg" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
