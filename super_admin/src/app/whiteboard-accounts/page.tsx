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

export default function WhiteboardAccountsPage() {
  const { isOpen } = useSidebarStore();
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
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
  });

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whiteboard-accounts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (result.success) {
        setAccounts(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching whiteboard accounts:", error);
      toast.error("Failed to load whiteboard accounts");
      // Fallback for development
      setAccounts([
            { id: "1", username: "teacher1", loginId: "teacher1", name: "Math Teacher", isActive: true, createdAt: new Date().toISOString() },
            { id: "2", username: "teacher2", loginId: "teacher2", name: "Science Teacher", isActive: true, createdAt: new Date().toISOString() },
      ]);
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
    if (!newAccount.username) {
      toast.error("Username is required");
        return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whiteboard-accounts`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify(newAccount)
      });
      const result = await response.json();
      if (result.success) {
        const creds = result?.data?.credentials;
        if (creds?.username && creds?.password) {
          setCreatedCredentials({ username: creds.username, password: creds.password });
          setShowCredentialsDialog(true);
        } else {
          toast.success("Whiteboard account created");
        }
        setShowAddDialog(false);
        setNewAccount({ username: "", password: "", name: "" });
        fetchAccounts();
      } else {
        toast.error(result.message || "Failed to create account");
      }
    } catch (error) {
      toast.error("Failed to create account");
    }
  };

  const handleDelete = async () => {
    if (accountToDelete) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whiteboard-accounts/${accountToDelete}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        if (result.success) {
            toast.success("Account deleted");
            setShowDeleteDialog(false);
            setAccountToDelete(null);
            fetchAccounts();
        }
      } catch (error) {
        toast.error("Failed to delete account");
      }
    }
  };

  const filteredAccounts = accounts.filter((acc) =>
    (acc.username || acc.loginId || '').toLowerCase().includes(search.toLowerCase()) ||
    (acc.name && acc.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleResetPassword = async (accountId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whiteboard-accounts/${accountId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      const result = await response.json();
      if (result.success) {
        const creds = result?.data?.credentials;
        if (creds?.username && creds?.password) {
          setCreatedCredentials({ username: creds.username, password: creds.password });
          setShowCredentialsDialog(true);
        }
        toast.success('Password reset successful');
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch {
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
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
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Created At</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">Loading accounts...</td>
                        </tr>
                      ) : filteredAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">No accounts found</td>
                        </tr>
                      ) : filteredAccounts.map((acc) => (
                        <tr key={acc.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{acc.username || acc.loginId}</td>
                          <td className="p-4 text-gray-600">{acc.name || "N/A"}</td>
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
