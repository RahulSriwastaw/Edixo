"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Save,
  Building2,
  Zap,
  Monitor,
  Globe,
  Lock,
  BarChart3,
  Users,
  Calendar,
  Settings,
  BookOpen,
  Video,
  Award,
  CreditCard,
  FileText,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Feature definitions
const featureGroups = [
  {
    title: "MockBook & Content",
    features: [
      { key: "mockbook", label: "MockBook Control Panel", icon: BookOpen, description: "Teachers can create questions & exams", enabled: true },
      { key: "aiGeneration", label: "AI Question Generation", icon: Zap, description: "Teachers can use AI to generate", enabled: true },
      { key: "contentUpload", label: "Content Upload (Videos/PDFs)", icon: Video, description: "Upload learning materials", enabled: true },
    ],
  },
  {
    title: "Operations",
    features: [
      { key: "classManagement", label: "Class Management", icon: Users, description: "Batches and class creation", enabled: true },
      { key: "scheduleBuilder", label: "Schedule Builder", icon: Calendar, description: "Timetable and exam scheduling", enabled: true },
      { key: "studentEnrollment", label: "Student Enrollment", icon: Users, description: "Manage student access", enabled: true },
    ],
  },
  {
    title: "Features",
    features: [
      { key: "digitalBoard", label: "Digital Board Access", icon: Monitor, description: "Whiteboard app access", enabled: true },
      { key: "advancedAnalytics", label: "Advanced Analytics", icon: BarChart3, description: "Medium+ plan only", enabled: false, locked: true },
      { key: "leaderboard", label: "Student Leaderboard", icon: Award, description: "Competition features", enabled: true },
      { key: "certificates", label: "Certificate Generation", icon: FileText, description: "Auto-generate certificates", enabled: false },
      { key: "parentPortal", label: "Parent Portal", icon: Users, description: "Parent access dashboard", enabled: false },
      { key: "customBranding", label: "Custom Branding", icon: Globe, description: "Logo and colors", enabled: true },
      { key: "billingView", label: "Billing View (read-only)", icon: CreditCard, description: "View invoices", enabled: true },
    ],
  },
  {
    title: "Security",
    features: [
      { key: "twoFactorAuth", label: "Two-Factor Authentication", icon: Shield, description: "Require 2FA for admin users", enabled: false },
      { key: "ipRestriction", label: "IP Restriction", icon: Lock, description: "Restrict access by IP range", enabled: false },
    ],
  },
];

// Mock organization data
const orgData = {
  id: "GK-ORG-00142",
  name: "Apex Academy",
  plan: "Medium",
  status: "Active",
};

export default function OrgFeatureFlagsPage() {
    const { isOpen } = useSidebarStore();
const params = useParams();
  const orgId = params.orgId as string;
  
  const [featureStates, setFeatureStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    featureGroups.forEach(group => {
      group.features.forEach(feature => {
        states[feature.key] = feature.enabled;
      });
    });
    return states;
  });

  const [hasChanges, setHasChanges] = useState(false);

  const toggleFeature = (key: string, locked?: boolean) => {
    if (locked) {
      toast.error("This feature requires a plan upgrade");
      return;
    }
    setFeatureStates(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success("Feature flags saved successfully");
    setHasChanges(false);
  };

  const handleReset = () => {
    const states: Record<string, boolean> = {};
    featureGroups.forEach(group => {
      group.features.forEach(feature => {
        states[feature.key] = feature.enabled;
      });
    });
    setFeatureStates(states);
    setHasChanges(false);
    toast.info("Changes discarded");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/org-admin" className="hover:text-[#F4511E]">Org Admin Control</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{orgData.name}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Feature Flags</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/org-admin">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    {orgData.name}
                    <Badge className="badge-medium">{orgData.plan}</Badge>
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">{orgData.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Button variant="outline" onClick={handleReset}>
                    Discard Changes
                  </Button>
                )}
                <Button 
                  className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                  disabled={!hasChanges}
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </Button>
              </div>
            </div>

            {/* Info Banner */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Configure what Org Admin can access in their panel</p>
                    <p className="text-blue-600 mt-1">
                      Changes will affect all users in this organization immediately after saving.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Groups */}
            {featureGroups.map((group) => (
              <Card key={group.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {group.features.map((feature) => {
                    const Icon = feature.icon;
                    const isEnabled = featureStates[feature.key];
                    const isLocked = feature.locked;
                    
                    return (
                      <div
                        key={feature.key}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          isLocked 
                            ? "bg-gray-50 border-gray-200 opacity-75" 
                            : isEnabled 
                              ? "bg-green-50 border-green-200" 
                              : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isEnabled && !isLocked ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              isEnabled && !isLocked ? "text-green-600" : "text-gray-400"
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${
                                isLocked ? "text-gray-500" : "text-gray-900"
                              }`}>
                                {feature.label}
                              </p>
                              {isLocked && (
                                <Badge className="bg-yellow-50 text-yellow-700 text-[10px]">
                                  Requires Upgrade
                                </Badge>
                              )}
                              {isEnabled && !isLocked && (
                                <Badge className="bg-green-100 text-green-700 text-[10px]">
                                  ON
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isLocked && (
                            <Button variant="outline" size="sm" className="text-xs">
                              Upgrade Plan
                            </Button>
                          )}
                          <button
                            onClick={() => toggleFeature(feature.key, feature.locked)}
                            disabled={isLocked}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                              isEnabled && !isLocked ? "bg-[#F4511E]" : "bg-gray-300"
                            } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                                isEnabled && !isLocked ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <RefreshCw className="w-5 h-5" />
                    <span className="text-xs">Reset to Defaults</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Building2 className="w-5 h-5" />
                    <span className="text-xs">View Org Details</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs">View Staff</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
