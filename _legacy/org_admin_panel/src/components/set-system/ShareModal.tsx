"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IDDisplay } from "@/components/set-system/PINEntry";
import { Copy, MessageCircle, Mail, Search, Users, Building2, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentPassword: string;
  contentName: string;
  contentType: "set" | "mocktest" | "ebook";
}

// Mock users
const mockUsers = [
  { id: "u1", name: "Rahul Kumar", email: "rahul@example.com", class: "Class 12A", role: "Student" },
  { id: "u2", name: "Priya Singh", email: "priya@example.com", class: "Class 12A", role: "Student" },
  { id: "u3", name: "Amit Sharma", email: "amit@example.com", class: "Class 12B", role: "Student" },
  { id: "u4", name: "Neha Gupta", email: "neha@example.com", class: "Class 11A", role: "Student" },
  { id: "u5", name: "Vikram Patel", email: "vikram@example.com", class: "Class 12C", role: "Student" },
];

// Mock orgs
const mockOrgs = [
  { id: "org-1", name: "Apex Academy", members: 48, isOwn: true },
  { id: "org-2", name: "Study Circle Academy", members: 32, isOwn: false },
  { id: "org-3", name: "Bright Future Institute", members: 25, isOwn: false },
];

// Mock already shared
const alreadySharedUsers = [
  { id: "u1", name: "Rahul Kumar", accessedAt: "Mar 1, 2026", accessCount: 2 },
  { id: "u3", name: "Amit Sharma", accessedAt: "Mar 2, 2026", accessCount: 5 },
];

const alreadySharedOrgs = [
  { id: "org-1", name: "Apex Academy", members: 48 },
];

export function ShareModal({
  open,
  onOpenChange,
  contentId,
  contentPassword,
  contentName,
  contentType,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState("copy");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchOrgs, setSearchOrgs] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Copy handlers
  const copyBoth = () => {
    navigator.clipboard.writeText(`ID: ${contentId}\nPassword: ${contentPassword}`);
    toast.success("ID and Password copied!");
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`📚 ${contentName}\n\nID: ${contentId}\nPassword: ${contentPassword}\n\nAccess at: eduhub.in/access`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    const emailSubject = encodeURIComponent(contentName);
    const body = encodeURIComponent(`Hi,\n\nHere's your access to "${contentName}":\n\nID: ${contentId}\nPassword: ${contentPassword}\n\nAccess at: eduhub.in/access\n\nBest regards`);
    window.open(`mailto:?subject=${emailSubject}&body=${body}`, "_blank");
  };

  // Filter users
  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  // Filter orgs
  const filteredOrgs = mockOrgs.filter(o =>
    o.name.toLowerCase().includes(searchOrgs.toLowerCase())
  );

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Toggle org selection
  const toggleOrg = (orgId: string) => {
    setSelectedOrgs(prev =>
      prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
    );
  };

  // Share with users
  const handleShareWithUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    toast.success(`Shared with ${selectedUsers.length} users`);
    setSelectedUsers([]);
    setMessage("");
  };

  // Share with orgs
  const handleShareWithOrgs = () => {
    if (selectedOrgs.length === 0) {
      toast.error("Please select at least one organization");
      return;
    }
    toast.success(`Shared with ${selectedOrgs.length} organizations`);
    setSelectedOrgs([]);
  };

  // Revoke access
  const handleRevokeUser = (userId: string) => {
    toast.success("Access revoked");
  };

  const handleRevokeOrg = (orgId: string) => {
    toast.success("Access revoked");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share Content
          </DialogTitle>
          <DialogDescription>
            {contentName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="copy" className="text-xs">Copy ID + Password</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Share with Users</TabsTrigger>
            <TabsTrigger value="orgs" className="text-xs">Share with Orgs</TabsTrigger>
          </TabsList>

          {/* Tab 1: Copy ID + Password */}
          <TabsContent value="copy" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <IDDisplay label="Content ID" value={contentId} />
              <IDDisplay
                label="Password"
                value={showPassword ? contentPassword : "••••••"}
                variant="pin"
                showCopyButton={showPassword}
              />
            </div>

            {!showPassword && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowPassword(true)}
              >
                Show Password
              </Button>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyBoth}>
                <Copy className="w-4 h-4 mr-2" /> Copy Both
              </Button>
              <Button variant="outline" className="flex-1" onClick={shareWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
              <Button variant="outline" className="flex-1" onClick={shareEmail}>
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Share with Users */}
          <TabsContent value="users" className="space-y-4 mt-4">
            {/* Already Shared */}
            {alreadySharedUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase">Currently Shared With</p>
                {alreadySharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.accessCount} accesses • {user.accessedAt}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRevokeUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* User List */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.includes(user.id);
                const isAlreadyShared = alreadySharedUsers.some(u => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => !isAlreadyShared && toggleUser(user.id)}
                    disabled={isAlreadyShared}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      isAlreadyShared && "opacity-50 cursor-not-allowed",
                      isSelected ? "border-[#F4511E] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center",
                        isSelected ? "border-[#F4511E] bg-[#F4511E]" : "border-gray-300"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.class} • {user.role}</p>
                      </div>
                      {isAlreadyShared && (
                        <Badge variant="outline" className="text-xs">Shared</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Message */}
            <div>
              <label className="text-xs text-gray-500">Message (optional)</label>
              <Input
                placeholder="e.g., SSC Mock ke liye practice karo..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Share Button */}
            <Button
              className="w-full bg-[#F4511E] hover:bg-[#E64A19]"
              disabled={selectedUsers.length === 0}
              onClick={handleShareWithUsers}
            >
              Share with {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""}
            </Button>
          </TabsContent>

          {/* Tab 3: Share with Orgs */}
          <TabsContent value="orgs" className="space-y-4 mt-4">
            {/* Already Shared */}
            {alreadySharedOrgs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase">Currently Shared With</p>
                {alreadySharedOrgs.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{org.name}</p>
                        <p className="text-xs text-gray-500">{org.members} members</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRevokeOrg(org.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search organizations..."
                value={searchOrgs}
                onChange={(e) => setSearchOrgs(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Org List */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredOrgs.map((org) => {
                const isSelected = selectedOrgs.includes(org.id);
                const isAlreadyShared = alreadySharedOrgs.some(o => o.id === org.id);
                return (
                  <button
                    key={org.id}
                    onClick={() => !isAlreadyShared && toggleOrg(org.id)}
                    disabled={isAlreadyShared}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      isAlreadyShared && "opacity-50 cursor-not-allowed",
                      isSelected ? "border-[#F4511E] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center",
                        isSelected ? "border-[#F4511E] bg-[#F4511E]" : "border-gray-300"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {org.name}
                          {org.isOwn && <Badge variant="outline" className="ml-2 text-xs">Your org</Badge>}
                        </p>
                        <p className="text-xs text-gray-500">{org.members} members</p>
                      </div>
                      {isAlreadyShared && (
                        <Badge variant="outline" className="text-xs">Shared</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Share Button */}
            <Button
              className="w-full bg-[#F4511E] hover:bg-[#E64A19]"
              disabled={selectedOrgs.length === 0}
              onClick={handleShareWithOrgs}
            >
              Share with {selectedOrgs.length} organization{selectedOrgs.length !== 1 ? "s" : ""}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
