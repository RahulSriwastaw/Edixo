"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, Loader2, Tags } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function TagsPage() {
  const { isOpen } = useSidebarStore();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const loadTags = () => {
    fetch("/api/sarkari/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTags();
  }, []);

  const createTag = async () => {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/sarkari/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Tag created");
      setName("");
      loadTags();
    } catch {
      toast.error("Failed");
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    try {
      const res = await fetch(`/api/sarkari/tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setTags(tags.filter((t) => t.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          isOpen ? "md:ml-60" : "ml-0",
        )}
      >
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/sarkari-result">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    Tags
                  </h1>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Manage post tags
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="New tag name"
                    className="input-field"
                    onKeyDown={(e) => e.key === "Enter" && createTag()}
                  />
                  <Button
                    className="bg-[#2563EB] text-white"
                    onClick={createTag}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Badge
                        key={t.id}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-default group flex items-center gap-1.5"
                      >
                        {t.name}
                        <button
                          onClick={() => deleteTag(t.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-current"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <p className="text-center text-[var(--text-muted)] py-6 w-full">
                        No tags yet
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
