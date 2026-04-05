"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, FileText, BookOpen, Search, Eye, EyeOff, Download, Share2, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PINEntry } from "@/components/set-system/PINEntry";
import { cn } from "@/lib/utils";

type ContentType = "set" | "mocktest" | "ebook";

// Mock public content
const publicContent = [
  { id: "1", type: "set", name: "SSC CGL 2026 Practice Set", org: "Apex Academy", questions: 100, accesses: 1234 },
  { id: "2", type: "mocktest", name: "Railway NTPC Full Mock", org: "Study Circle", questions: 150, accesses: 856 },
  { id: "3", type: "ebook", name: "JEE Chemistry Practice Book", org: "Bright Future", questions: 200, accesses: 432 },
  { id: "4", type: "set", name: "NEET Biology Quick Revision", org: "MedPrep Academy", questions: 75, accesses: 2341 },
];

// Mock verification data
const mockVerificationData: Record<string, { type: ContentType; password: string; data: Record<string, unknown> }> = {
  "482931": { type: "set", password: "738291", data: { id: "482931", name: "Mathematics — Algebra & Calculus", questions: 25, subject: "Mathematics", org: "Apex Academy" } },
  "591047": { type: "set", password: "492018", data: { id: "591047", name: "English Grammar & Comprehension", questions: 25, subject: "English", org: "Apex Academy" } },
  "295018": { type: "mocktest", password: "847362", data: { id: "295018", name: "SSC CGL Full Mock — March 2026", questions: 100, duration: 60, org: "Apex Academy" } },
  "103847": { type: "ebook", password: "293847", data: { id: "103847", name: "SSC Practice Book", chapters: 4, questions: 100, org: "Apex Academy" } },
};

export default function PublicAccessPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>("set");
  const [contentId, setContentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [verifiedContent, setVerifiedContent] = useState<Record<string, unknown> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lock countdown
  useEffect(() => {
    if (lockSeconds > 0) {
      const timer = setTimeout(() => setLockSeconds(lockSeconds - 1), 1000);
      return () => clearTimeout(timer);
    } else if (locked) {
      const raf = requestAnimationFrame(() => {
        setLocked(false);
        setAttempts(0);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [lockSeconds, locked]);

  // Handle content ID auto-submit
  const handleContentIdComplete = (value: string) => {
    // Just store the value, wait for Password
  };

  // Handle Password verification
  const handlePasswordComplete = async (value: string) => {
    if (!contentId || contentId.length < 6) {
      setError("Please enter Content ID first");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const verification = mockVerificationData[contentId];

    if (!verification) {
      setError("Content not found. Please check ID.");
      setIsLoading(false);
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= 5) {
        setLocked(true);
        setLockSeconds(1800); // 30 min lockout
      }
      return;
    }

    if (verification.password !== value) {
      setError(`Incorrect Password. ${4 - attempts} attempts remaining.`);
      setIsLoading(false);
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= 5) {
        setLocked(true);
        setLockSeconds(1800);
      }
      return;
    }

    // Success!
    setVerifiedContent({ ...verification.data, type: verification.type, password: value });
    setIsLoading(false);
  };

  // Content type options
  const contentTypes: { value: ContentType; label: string; icon: typeof Layers }[] = [
    { value: "set", label: "SET", icon: Layers },
    { value: "mocktest", label: "MOCKTEST", icon: FileText },
    { value: "ebook", label: "eBOOK", icon: BookOpen },
  ];

  // Filter public content
  const filteredContent = publicContent.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset form
  const handleReset = () => {
    setContentId("");
    setPassword("");
    setError("");
    setVerifiedContent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F4511E] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-xl text-gray-900">EduHub</span>
          </Link>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Login
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        {!verifiedContent ? (
          <>
            {/* Access Form */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">ACCESS YOUR CONTENT</h1>
              <p className="text-gray-500 mt-2">Enter your Set, MockTest, or eBook ID & Password</p>
            </div>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6 space-y-6">
                {/* Content Type Selector */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Content Type</label>
                  <div className="flex gap-2 mt-2">
                    {contentTypes.map((ct) => {
                      const Icon = ct.icon;
                      return (
                        <button
                          key={ct.value}
                          onClick={() => setContentType(ct.value)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all",
                            contentType === ct.value
                              ? "border-[#F4511E] bg-orange-50 text-[#F4511E]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{ct.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content ID */}
                <PINEntry
                  label="Content ID (6 digits)"
                  value={contentId}
                  onChange={setContentId}
                  onComplete={handleContentIdComplete}
                  disabled={isLoading || locked}
                  error={error && !contentId ? " " : undefined}
                />

                {/* Password */}
                <PINEntry
                  label="Access Password (6 digits)"
                  value={password}
                  onChange={setPassword}
                  onComplete={handlePasswordComplete}
                  disabled={isLoading || locked}
                  error={error}
                  locked={locked}
                  lockSeconds={lockSeconds}
                  isLoading={isLoading}
                />

                {/* Submit Button */}
                <Button
                  className="w-full bg-[#F4511E] hover:bg-[#E64A19] text-white py-6 text-base"
                  disabled={isLoading || locked || contentId.length < 6 || password.length < 6}
                  onClick={() => handlePasswordComplete(password)}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>🔓 Access Content</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 border-t" />
              <span className="text-sm text-gray-400">OR BROWSE FREE CONTENT</span>
              <div className="flex-1 border-t" />
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search question papers, practice sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Trending Content */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">TRENDING</h3>
              {filteredContent.map((item) => {
                const Icon = item.type === "set" ? Layers : item.type === "mocktest" ? FileText : BookOpen;
                return (
                  <button
                    key={item.id}
                    className="w-full text-left p-4 bg-white rounded-xl border hover:border-[#F4511E] hover:shadow-md transition-all"
                    onClick={() => {
                      setContentId(item.id);
                      setContentType(item.type as ContentType);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#F4511E]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.org} • {item.questions} questions</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.type.toUpperCase()}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Verified Content View */
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{verifiedContent.name as string}</h1>
              <p className="text-gray-500 mt-1">
                {verifiedContent.id as string} • By: {verifiedContent.org as string}
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Questions</span>
                  <Badge className="bg-blue-50 text-blue-700">{verifiedContent.questions as number}</Badge>
                </div>
                {verifiedContent.type === "mocktest" && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{verifiedContent.duration as number} minutes</span>
                  </div>
                )}
                {verifiedContent.type === "ebook" && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Chapters</span>
                    <span className="font-medium">{verifiedContent.chapters as number}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Type</span>
                  <Badge className="bg-[#F4511E]">{(verifiedContent.type as string).toUpperCase()}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-[#F4511E] hover:bg-[#E64A19] text-white py-6">
                <Play className="w-5 h-5 mr-2" />
                Attempt Online
              </Button>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="flex-col py-4">
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs">PDF</span>
                </Button>
                <Button variant="outline" className="flex-col py-4">
                  <Eye className="w-5 h-5 mb-1" />
                  <span className="text-xs">Preview</span>
                </Button>
                <Button variant="outline" className="flex-col py-4">
                  <Share2 className="w-5 h-5 mb-1" />
                  <span className="text-xs">Share</span>
                </Button>
              </div>
            </div>

            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Preview</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">Q1. If α and β are roots of x²-5x+6=0, find α²+β²</p>
                  <p>(A) 25  (B) 13  (C) 11  (D) 12</p>
                  <p className="font-medium text-gray-900 mt-3">Q2. The value of ∫₀¹ x² dx is...</p>
                  <p>(A) 1/3  (B) 1/2  (C) 2/3  (D) 1</p>
                  <p className="text-gray-400 text-center py-4">...</p>
                </div>
              </CardContent>
            </Card>

            {/* Reset */}
            <Button variant="ghost" className="w-full" onClick={handleReset}>
              Access Another Content
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2026 EduHub. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-[#F4511E]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#F4511E]">Privacy</Link>
            <Link href="/help" className="hover:text-[#F4511E]">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
