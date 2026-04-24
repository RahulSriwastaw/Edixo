"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Shield,
  Building2,
  GraduationCap,
  BarChart3,
  Edit,
  User,
  Mail,
  Phone,
  Camera,
  RefreshCw,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Role options
const roles = [
  {
    value: "super_admin",
    label: "Super Admin",
    icon: Shield,
    description: "Full platform access — can manage everything",
    color: "border-red-500 bg-red-50",
    badge: "bg-red-100 text-red-700",
  },
  {
    value: "org_admin",
    label: "Org Admin",
    icon: Building2,
    description: "Manage organization & its content",
    color: "border-blue-500 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    value: "teacher",
    label: "Teacher",
    icon: GraduationCap,
    description: "Create sets, mocktests, manage students",
    color: "border-green-500 bg-green-50",
    badge: "bg-green-100 text-green-700",
  },
  {
    value: "content_manager",
    label: "Content Manager",
    icon: Edit,
    description: "Manage Q-Bank, sets, mocktests, eBooks",
    color: "border-purple-500 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    value: "analytics_viewer",
    label: "Analytics Viewer",
    icon: BarChart3,
    description: "View reports & export data (read-only)",
    color: "border-amber-500 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
  },
];

// Mock organizations
const organizations = [
  { id: "org-1", name: "Apex Academy" },
  { id: "org-2", name: "Study Circle" },
  { id: "org-3", name: "Bright Future Institute" },
];

// Departments
const departments = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "General Studies",
  "Administration",
  "Content",
  "Analytics",
];

export default function AddStaffMemberPage() {
    const { isOpen } = useSidebarStore();
const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  
  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    loginId: "",
    password: "",
    confirmPassword: "",
    role: "",
    orgId: "",
  });

  // Auto-generate login ID from name
  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      fullName: name,
      loginId: name
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(" ")
        .join("."),
    }));
  };

  // Generate random password
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password, confirmPassword: password }));
  };

  // Validate form
  const isValid =
    form.fullName.trim().length > 0 &&
    form.email.includes("@") &&
    form.loginId.length >= 3 &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword &&
    form.role.length > 0;

  // Submit
  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("Staff member created successfully!");
    if (sendWelcomeEmail) {
      toast.info(`Welcome email sent to ${form.email}`);
    }
    
    router.push("/admin/staff");
  };

  // Update form field
  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Link href="/admin/staff" className="hover:text-[#F4511E]">Staff Management</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[var(--text-primary)] font-medium">Add Staff Member</span>
            </div>

            {/* Form Header */}
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Add New Staff Member</h1>
              <p className="text-[var(--text-secondary)] text-sm">Create a new staff account with role-based access</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Personal Info */}
              <Card className="mb-6">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-[#F4511E]" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Photo + Name Row */}
                  <div className="flex gap-4 items-start">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 border-2 border-dashed border-[var(--border-input)]">
                        <AvatarFallback className="bg-[var(--bg-main)] text-[var(--text-muted)]">
                          <Camera className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Upload
                      </Button>
                    </div>
                    <div className="flex-1 grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="e.g., Rahul Kumar"
                          value={form.fullName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <div className="relative mt-1">
                          <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                          <Input
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label>Email Address *</Label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <Input
                        type="email"
                        placeholder="rahul@apexacademy.edu"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Department & Designation */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Department</Label>
                      <Select value={form.department} onValueChange={(v) => updateField("department", v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept.toLowerCase()}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Designation</Label>
                      <Input
                        placeholder="e.g., Senior Math Teacher"
                        value={form.designation}
                        onChange={(e) => updateField("designation", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Login Credentials */}
              <Card className="mb-6">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#F4511E]" />
                    Login Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    Staff member will receive login credentials via email. They can change their password on first login.
                  </div>

                  {/* Login ID */}
                  <div>
                    <Label>Login ID *</Label>
                    <Input
                      placeholder="e.g., rahul.kumar"
                      value={form.loginId}
                      onChange={(e) => updateField("loginId", e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Auto-generated from name. Used for login.
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <Label>Password *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="password"
                        placeholder="Min 8 characters"
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={generatePassword}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Auto Generate
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label>Confirm Password *</Label>
                    <Input
                      type="password"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      className="mt-1"
                    />
                    {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                    )}
                    {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Role Assignment */}
              <Card className="mb-6">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#F4511E]" />
                    Role Assignment *
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = form.role === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => updateField("role", role.value)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border-2 transition-all",
                            isSelected ? role.color : "border-[var(--border-input)] hover:border-[var(--border-input)] bg-white"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                                isSelected ? "border-[#F4511E] bg-[#F4511E]" : "border-[var(--border-input)]"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span className="font-medium text-[var(--text-primary)]">{role.label}</span>
                              </div>
                              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{role.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Organization Assignment */}
              <Card className="mb-6">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#F4511E]" />
                    Organization Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Assign to Organization</Label>
                    <Select value={form.orgId} onValueChange={(v) => updateField("orgId", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Staff member will have access to this organization&apos;s resources.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Send Welcome Email */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Send Welcome Email</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Send login credentials to {form.email || "the new staff member"}
                      </p>
                    </div>
                    <Switch checked={sendWelcomeEmail} onCheckedChange={setSendWelcomeEmail} />
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => router.push("/admin/staff")}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Staff Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
