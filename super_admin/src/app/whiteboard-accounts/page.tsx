"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Key,
  Trash2,
  Monitor,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type ApiResult<T = any> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type WhiteboardAccount = {
  id: string;
  username?: string;
  loginId?: string;
  name?: string | null;
  isActive: boolean;
  createdAt: string;
  activeLoginCount?: number;
  maxConcurrentLogins?: number;
};

const isAuthError = (message?: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("invalid token") ||
    normalized.includes("unauthorized") ||
    normalized.includes("session expired") ||
    normalized.includes("jwt")
  );
};

const forceReLogin = () => {
  if (typeof document !== "undefined") {
    document.cookie = "sb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("sb_token");
    window.location.href = "/login";
  }
};

export default function WhiteboardAccountsPage() {
  const { isOpen } = useSidebarStore();
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<WhiteboardAccount[]>([]);
  const [limitDrafts, setLimitDrafts] = useState<Record<string, string>>({});
  const [savingLimitId, setSavingLimitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);

  const [newAccount, setNewAccount] = useState({
    username: "",
    password: "",
    name: "",
    maxConcurrentLogins: "1",
  });

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const result = await api.get<ApiResult<WhiteboardAccount[]>>("/whiteboard-accounts");
      if (result.success) {
        const fetchedAccounts = result.data || [];
        setAccounts(fetchedAccounts);
        setLimitDrafts(
          Object.fromEntries(
            fetchedAccounts.map((account) => [
              account.id,
              String(account.maxConcurrentLogins ?? 1),
            ]),
          ),
        );
      } else {
        if (isAuthError(result.message)) {
          toast.error("Session expired. Please log in again.");
          forceReLogin();
          return;
        }
        throw new Error(result.message || "Failed to fetch whiteboard accounts");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (isAuthError(message)) {
        toast.error("Session expired. Please log in again.");
        forceReLogin();
        return;
      }
      toast.error(message || "Failed to load whiteboard accounts");
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setNotice(params.get("notice"));
    }
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    const username = newAccount.username.trim();
    const password = newAccount.password.trim();
    const name = newAccount.name.trim();
    const maxConcurrentLogins = Number(newAccount.maxConcurrentLogins);

    if (!username) {
      toast.error("Username is required");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!Number.isInteger(maxConcurrentLogins) || maxConcurrentLogins < 1 || maxConcurrentLogins > 10) {
      toast.error("Max active logins must be between 1 and 10");
      return;
    }

    const payload: { username: string; password?: string; name?: string; maxConcurrentLogins: number } = {
      username,
      maxConcurrentLogins,
    };
    if (password) payload.password = password;
    if (name) payload.name = name;

    try {
      const result = await api.post<ApiResult<any>>("/whiteboard-accounts", payload);
      if (result.success) {
        const creds = result?.data?.credentials;
        if (creds?.username && creds?.password) {
          setCreatedCredentials({ username: creds.username, password: creds.password });
          setShowCredentialsDialog(true);
        } else {
          toast.success("Whiteboard account created");
        }
        setShowAddDialog(false);
        setNewAccount({ username: "", password: "", name: "", maxConcurrentLogins: "1" });
        fetchAccounts();
      } else {
        if (isAuthError(result.message)) {
          toast.error("Session expired. Please log in again.");
          forceReLogin();
          return;
        }
        toast.error(result.message || "Failed to create account");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (isAuthError(message)) {
        toast.error("Session expired. Please log in again.");
        forceReLogin();
        return;
      }
      toast.error(message || "Failed to create account");
    }
  };

  const handleDelete = async () => {
    if (accountToDelete) {
      try {
        const result = await api.delete<ApiResult<any>>(`/whiteboard-accounts/${accountToDelete}`);
        if (result.success) {
            toast.success("Account deleted");
            setShowDeleteDialog(false);
            setAccountToDelete(null);
            fetchAccounts();
        } else if (isAuthError(result.message)) {
            toast.error("Session expired. Please log in again.");
            forceReLogin();
        } else {
            toast.error(result.message || "Failed to delete account");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (isAuthError(message)) {
          toast.error("Session expired. Please log in again.");
          forceReLogin();
          return;
        }
        toast.error("Failed to delete account");
      }
    }
  };

  const filteredAccounts = accounts.filter((acc) =>
    (acc.username || acc.loginId || '').toLowerCase().includes(search.toLowerCase()) ||
    (acc.name && acc.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaveLoginLimit = async (account: WhiteboardAccount) => {
    const draftValue = Number(limitDrafts[account.id] ?? account.maxConcurrentLogins ?? 1);
    if (!Number.isInteger(draftValue) || draftValue < 1 || draftValue > 10) {
      toast.error("Max active logins must be between 1 and 10");
      return;
    }

    setSavingLimitId(account.id);
    try {
      const result = await api.patch<ApiResult<WhiteboardAccount>>(`/whiteboard-accounts/${account.id}`, {
        maxConcurrentLogins: draftValue,
      });

      if (result.success && result.data) {
        setAccounts((prev) =>
          prev.map((item) => (item.id === account.id ? { ...item, ...result.data } : item)),
        );
        setLimitDrafts((prev) => ({ ...prev, [account.id]: String(draftValue) }));
        toast.success("Login limit updated");
      } else if (isAuthError(result.message)) {
        toast.error("Session expired. Please log in again.");
        forceReLogin();
      } else {
        toast.error(result.message || "Failed to update login limit");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (isAuthError(message)) {
        toast.error("Session expired. Please log in again.");
        forceReLogin();
        return;
      }
      toast.error(message || "Failed to update login limit");
    } finally {
      setSavingLimitId(null);
    }
  };

  const handleResetPassword = async (accountId: string) => {
    try {
      const result = await api.post<ApiResult<any>>(`/whiteboard-accounts/${accountId}/reset-password`);
      if (result.success) {
        const creds = result?.data?.credentials;
        if (creds?.username && creds?.password) {
          setCreatedCredentials({ username: creds.username, password: creds.password });
          setShowCredentialsDialog(true);
        }
        toast.success('Password reset successful');
      } else if (isAuthError(result.message)) {
        toast.error("Session expired. Please log in again.");
        forceReLogin();
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (isAuthError(message)) {
        toast.error("Session expired. Please log in again.");
        forceReLogin();
        return;
      }
      toast.error(message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {notice === "single-owner-mode" && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
                Organization-based pages are disabled in single-owner mode. Use whiteboard accounts and system-level flows here.
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Whiteboard Accounts</h1>
                <p className="text-gray-500 text-sm">Manage login IDs and passwords for direct whiteboard access</p>
              </div>
              <Button 
                className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="w-4 h-4" /> Create Account
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by ID or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-[#F4511E]" />
                  <CardTitle>Accounts</CardTitle>
                  <Badge className="bg-gray-100 text-gray-600">{filteredAccounts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Username</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Teacher Name</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Active Logins</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Max Allowed</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Created At</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">Loading accounts...</td>
                        </tr>
                      ) : filteredAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">No accounts found</td>
                        </tr>
                      ) : filteredAccounts.map((acc) => (
                        <tr key={acc.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{acc.username || acc.loginId}</td>
                          <td className="p-4 text-gray-600">{acc.name || "N/A"}</td>
                          <td className="p-4 text-center">
                            <Badge className="bg-blue-100 text-blue-700 font-normal">
                              {acc.activeLoginCount ?? 0}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                value={limitDrafts[acc.id] ?? String(acc.maxConcurrentLogins ?? 1)}
                                onChange={(e) =>
                                  setLimitDrafts((prev) => ({
                                    ...prev,
                                    [acc.id]: e.target.value,
                                  }))
                                }
                                className="h-8 w-20 text-center"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveLoginLimit(acc)}
                                disabled={savingLimitId === acc.id}
                                className="h-8 px-2"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge className={acc.isActive ? "bg-green-100 text-green-700 font-normal" : "bg-red-100 text-red-700 font-normal"}>
                              {acc.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(acc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => handleResetPassword(acc.id)}>
                                    <Key className="w-4 h-4 mr-2" /> Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setAccountToDelete(acc.id);
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Whiteboard Account</DialogTitle>
            <DialogDescription>
              This account will allow direct login to the Whiteboard application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input 
                placeholder="e.g. math_01" 
                value={newAccount.username}
                onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password (Optional)</label>
              <Input 
                type="password" 
                placeholder="Auto-generated if blank" 
                value={newAccount.password}
                onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teacher Name (Optional)</label>
              <Input 
                placeholder="e.g. Mr. Sharma" 
                value={newAccount.name}
                onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Active Logins</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={newAccount.maxConcurrentLogins}
                onChange={(e) => setNewAccount({ ...newAccount, maxConcurrentLogins: e.target.value })}
              />
              <p className="text-xs text-gray-500">1 recommended. Isse same ID se multiple devices login control hoga.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button className="bg-[#F4511E]" onClick={handleAddAccount}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credentials Generated</DialogTitle>
            <DialogDescription>
              Save these credentials now. Password will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-md border p-3">
              <p className="text-xs text-gray-500">Username</p>
              <p className="font-mono text-sm">{createdCredentials?.username}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-gray-500">Password</p>
              <p className="font-mono text-sm">{createdCredentials?.password}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this whiteboard account? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
