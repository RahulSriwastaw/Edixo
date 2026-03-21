
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

  // Fetch profile from backend on mount
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
            primaryExam: "JEE", // Will be stored in backend metadata once the field is added
            targetYear: new Date().getFullYear() + 1,
            studentId: data.studentId || "",
          });
        }
      } catch (err: any) {
        // Student profile might not exist if this is a Firebase-auth user
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
    { icon: Flame, label: "18-Day Streak", color: "text-orange-500 bg-orange-50" },
    { icon: BookOpen, label: "50 Tests Done", color: "text-blue-500 bg-blue-50" },
    { icon: Award, label: "Silver League", color: "text-slate-500 bg-slate-50" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage your personal information and exam goals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left: Avatar + Info */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden">
                  <div className="h-20 bg-gradient-to-r from-primary/20 via-orange-100 to-accent/10" />
                  <CardContent className="px-5 pb-5 -mt-10">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="ring-4 ring-white rounded-full shadow-lg">
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
                        <h2 className="text-lg font-bold text-slate-900">{profileData.name || "Student"}</h2>
                        <p className="text-xs text-slate-400">{profileData.email}</p>
                        {profileData.studentId && (
                          <p className="text-[11px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-full inline-block mt-1">
                            ID: {profileData.studentId}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 border text-xs font-bold px-3">
                        <Award className="h-3 w-3 mr-1.5" /> Silver League
                      </Badge>
                      {/* Level progress */}
                      <div className="w-full pt-3 border-t border-slate-50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-semibold">Level 12</span>
                          <span className="font-bold text-primary">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <p className="text-[10px] text-slate-400">350 XP to Level 13</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="shadow-sm border-none bg-white rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    {achievements.map((a) => (
                      <div key={a.label} className={`flex items-center gap-2.5 p-2.5 rounded-xl ${a.color}`}>
                        <a.icon className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-semibold">{a.label}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Form */}
              <Card className="lg:col-span-2 shadow-sm border-none bg-white rounded-2xl">
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" /> Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <Input
                            id="name"
                            className="pl-10 h-11 text-sm rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-primary"
                            placeholder="Your full name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <Input
                            id="email"
                            className="pl-10 h-11 text-sm rounded-xl bg-slate-50 border-slate-100"
                            disabled
                            value={profileData.email}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <Input
                            id="phone"
                            className="pl-10 h-11 text-sm rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-primary"
                            placeholder="+91 9876543210"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="exam" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Primary Exam</Label>
                        <div className="relative">
                          <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                          <Select value={profileData.primaryExam} onValueChange={(v) => setProfileData({ ...profileData, primaryExam: v })}>
                            <SelectTrigger id="exam" className="pl-10 h-11 text-sm rounded-xl bg-slate-50 border-slate-100">
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

                    <div className="space-y-1.5">
                      <Label htmlFor="year" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Target Year</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                        <Select value={profileData.targetYear.toString()} onValueChange={(v) => setProfileData({ ...profileData, targetYear: parseInt(v) })}>
                          <SelectTrigger id="year" className="pl-10 h-11 text-sm rounded-xl bg-slate-50 border-slate-100">
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

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11 font-bold mt-2 text-sm rounded-xl shadow-sm shadow-primary/20" disabled={saving}>
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
