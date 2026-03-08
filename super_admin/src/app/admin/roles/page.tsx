import { useSidebarStore } from "@/store/sidebarStore";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Building2,
  GraduationCap,
  Edit,
  BarChart3,
  Settings,
  Check,
  X,
  Plus,
  Save,
  RefreshCw,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Permission modules
const modules = [
  "Dashboard",
  "Organizations",
  "Question Bank",
  "Sets",
  "MockTests",
  "eBooks",
  "Students",
  "Teachers",
  "Analytics",
  "Billing",
  "Staff",
  "Settings",
  "Audit Log",
  "White-Label",
];

// Permission actions
const actions = ["view", "create", "edit", "delete", "export", "manage"];

// Role definitions
const roleDefinitions = [
  {
    id: "super_admin",
    name: "Super Admin",
    icon: Shield,
    color: "bg-red-100 text-red-700 border-red-300",
    description: "Full platform access — can manage everything including billing and system settings",
    isSystem: true,
    permissions: {
      Dashboard: ["view", "create", "edit", "delete", "export", "manage"],
      Organizations: ["view", "create", "edit", "delete", "export", "manage"],
      "Question Bank": ["view", "create", "edit", "delete", "export", "manage"],
      Sets: ["view", "create", "edit", "delete", "export", "manage"],
      MockTests: ["view", "create", "edit", "delete", "export", "manage"],
      eBooks: ["view", "create", "edit", "delete", "export", "manage"],
      Students: ["view", "create", "edit", "delete", "export", "manage"],
      Teachers: ["view", "create", "edit", "delete", "export", "manage"],
      Analytics: ["view", "create", "edit", "delete", "export", "manage"],
      Billing: ["view", "create", "edit", "delete", "export", "manage"],
      Staff: ["view", "create", "edit", "delete", "export", "manage"],
      Settings: ["view", "create", "edit", "delete", "export", "manage"],
      "Audit Log": ["view", "create", "edit", "delete", "export", "manage"],
      "White-Label": ["view", "create", "edit", "delete", "export", "manage"],
    },
  },
  {
    id: "org_admin",
    name: "Org Admin",
    icon: Building2,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    description: "Manage organization — teachers, students, content, and org settings",
    isSystem: true,
    permissions: {
      Dashboard: ["view", "export"],
      Organizations: ["view"],
      "Question Bank": ["view", "create", "edit", "delete", "export"],
      Sets: ["view", "create", "edit", "delete", "export"],
      MockTests: ["view", "create", "edit", "delete", "export"],
      eBooks: ["view", "create", "edit", "delete", "export"],
      Students: ["view", "create", "edit", "delete", "export"],
      Teachers: ["view", "create", "edit", "delete"],
      Analytics: ["view", "export"],
      Billing: ["view"],
      Staff: ["view", "create", "edit"],
      Settings: ["view", "edit"],
      "Audit Log": ["view"],
      "White-Label": [],
    },
  },
  {
    id: "teacher",
    name: "Teacher",
    icon: GraduationCap,
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Create and manage sets, mocktests, and help students",
    isSystem: true,
    permissions: {
      Dashboard: ["view"],
      Organizations: [],
      "Question Bank": ["view", "create", "edit"],
      Sets: ["view", "create", "edit", "delete"],
      MockTests: ["view", "create", "edit", "delete"],
      eBooks: ["view", "create", "edit"],
      Students: ["view"],
      Teachers: [],
      Analytics: ["view"],
      Billing: [],
      Staff: [],
      Settings: [],
      "Audit Log": [],
      "White-Label": [],
    },
  },
  {
    id: "content_manager",
    name: "Content Manager",
    icon: Edit,
    color: "bg-purple-100 text-purple-700 border-purple-300",
    description: "Manage Q-Bank, sets, mocktests, and eBooks content",
    isSystem: true,
    permissions: {
      Dashboard: ["view"],
      Organizations: [],
      "Question Bank": ["view", "create", "edit", "delete", "export"],
      Sets: ["view", "create", "edit", "delete", "export"],
      MockTests: ["view", "create", "edit", "delete", "export"],
      eBooks: ["view", "create", "edit", "delete", "export"],
      Students: [],
      Teachers: [],
      Analytics: ["view"],
      Billing: [],
      Staff: [],
      Settings: [],
      "Audit Log": [],
      "White-Label": [],
    },
  },
  {
    id: "analytics_viewer",
    name: "Analytics Viewer",
    icon: BarChart3,
    color: "bg-amber-100 text-amber-700 border-amber-300",
    description: "View reports and export data (read-only access)",
    isSystem: true,
    permissions: {
      Dashboard: ["view"],
      Organizations: ["view"],
      "Question Bank": ["view"],
      Sets: ["view"],
      MockTests: ["view"],
      eBooks: ["view"],
      Students: ["view"],
      Teachers: ["view"],
      Analytics: ["view", "export"],
      Billing: [],
      Staff: [],
      Settings: [],
      "Audit Log": ["view"],
      "White-Label": [],
    },
  },
  {
    id: "custom",
    name: "Custom Role",
    icon: Settings,
    color: "bg-gray-100 text-gray-700 border-gray-300",
    description: "Custom role with configurable permissions",
    isSystem: false,
    permissions: {
      Dashboard: ["view"],
      Organizations: [],
      "Question Bank": ["view"],
      Sets: ["view"],
      MockTests: ["view"],
      eBooks: ["view"],
      Students: [],
      Teachers: [],
      Analytics: ["view"],
      Billing: [],
      Staff: [],
      Settings: [],
      "Audit Log": [],
      "White-Label": [],
    },
  },
];

export default function RolesPermissionsPage() {
    const { isOpen } = useSidebarStore();
const [roles, setRoles] = useState(roleDefinitions);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string[]> | null>(null);
  const [showPermissionEditor, setShowPermissionEditor] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Get selected role data
  const getSelectedRoleData = () => roles.find((r) => r.id === selectedRole);

  // Toggle permission
  const togglePermission = (module: string, action: string) => {
    if (!editingPermissions) return;

    const currentPermissions = editingPermissions[module] || [];
    const hasPermission = currentPermissions.includes(action);

    setEditingPermissions({
      ...editingPermissions,
      [module]: hasPermission
        ? currentPermissions.filter((p) => p !== action)
        : [...currentPermissions, action],
    });
    setHasChanges(true);
  };

  // Save permissions
  const savePermissions = () => {
    if (!selectedRole || !editingPermissions) return;

    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRole ? { ...r, permissions: editingPermissions } : r
      )
    );

    toast.success("Permissions updated successfully");
    setShowPermissionEditor(false);
    setHasChanges(false);
  };

  // Open permission editor
  const openPermissionEditor = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role) {
      setSelectedRole(roleId);
      setEditingPermissions({ ...role.permissions });
      setShowPermissionEditor(true);
    }
  };

  // Reset permissions
  const resetPermissions = () => {
    const role = getSelectedRoleData();
    if (role) {
      setEditingPermissions({ ...role.permissions });
      setHasChanges(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                <p className="text-gray-500 text-sm">Configure role-based access control for the platform</p>
              </div>
              <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2">
                <Plus className="w-4 h-4" /> Create Custom Role
              </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Role-Based Access Control (RBAC)</p>
                  <p className="text-blue-600">
                    System roles (Super Admin, Org Admin, Teacher, etc.) have predefined permissions. 
                    You can create custom roles with specific permissions for your organization needs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Roles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const permissionCount = Object.values(role.permissions).reduce(
                  (acc, perms) => acc + perms.length,
                  0
                );
                const totalPermissions = modules.length * actions.length;

                return (
                  <Card
                    key={role.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedRole === role.id && "ring-2 ring-[#F4511E]"
                    )}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", role.color)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{role.name}</CardTitle>
                            {role.isSystem && (
                              <Badge variant="outline" className="text-xs">System Role</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-4">{role.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Permissions</span>
                          <span className="font-medium">{permissionCount} / {totalPermissions}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#F4511E] rounded-full transition-all"
                            style={{ width: `${(permissionCount / totalPermissions) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPermissionEditor(role.id);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-1" /> Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Permission Matrix View */}
            {selectedRole && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#F4511E]" />
                    Permission Matrix — {getSelectedRoleData()?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 font-medium text-gray-500">Module</th>
                          {actions.map((action) => (
                            <th key={action} className="text-center p-4 font-medium text-gray-500 capitalize">
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {modules.map((module) => {
                          const role = getSelectedRoleData();
                          const permissions = role?.permissions[module] || [];
                          return (
                            <tr key={module} className="border-b hover:bg-gray-50">
                              <td className="p-4 font-medium text-gray-900">{module}</td>
                              {actions.map((action) => (
                                <td key={action} className="p-4 text-center">
                                  {permissions.includes(action) ? (
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                      <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                      <X className="w-4 h-4 text-gray-400" />
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Permission Editor Dialog */}
      <Dialog open={showPermissionEditor} onOpenChange={setShowPermissionEditor}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permissions — {getSelectedRoleData()?.name}</DialogTitle>
            <DialogDescription>
              Configure which actions this role can perform for each module.
            </DialogDescription>
          </DialogHeader>

          {editingPermissions && (
            <div className="py-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-500">Module</th>
                      {actions.map((action) => (
                        <th key={action} className="text-center p-3 font-medium text-gray-500 capitalize text-sm">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr key={module} className="border-b">
                        <td className="p-3 font-medium text-gray-900">{module}</td>
                        {actions.map((action) => {
                          const hasPermission = editingPermissions[module]?.includes(action);
                          return (
                            <td key={action} className="p-3 text-center">
                              <button
                                onClick={() => togglePermission(module, action)}
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all",
                                  hasPermission
                                    ? "bg-green-100 hover:bg-green-200"
                                    : "bg-gray-100 hover:bg-gray-200"
                                )}
                              >
                                {hasPermission ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetPermissions} disabled={!hasChanges}>
              <RefreshCw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button variant="outline" onClick={() => setShowPermissionEditor(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
              onClick={savePermissions}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-1" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
