"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import {
  Store,
  Search,
  Filter,
  Coins,
  Users,
  Eye,
  ShoppingCart,
  TrendingUp,
  Package,
  Globe,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockMarketplaceItems = [
  { id: "1", type: "question", title: "Newton's Laws of Motion - Complete Set", subject: "Physics", difficulty: "Medium", points: 5, usedBy: 124, rating: 4.8 },
  { id: "2", type: "set", title: "JEE Main 2025 Physics Package", subject: "Physics", difficulty: "Mixed", points: 150, usedBy: 45, rating: 4.9 },
  { id: "3", type: "question", title: "Organic Chemistry Reaction Mechanisms", subject: "Chemistry", difficulty: "Hard", points: 10, usedBy: 89, rating: 4.7 },
  { id: "4", type: "set", title: "NEET Biology Complete Course", subject: "Biology", difficulty: "Mixed", points: 200, usedBy: 78, rating: 4.6 },
  { id: "5", type: "question", title: "Calculus Integration Problems", subject: "Mathematics", difficulty: "Hard", points: 8, usedBy: 156, rating: 4.5 },
  { id: "6", type: "set", title: "UPSC Prelims GS Package", subject: "General Studies", difficulty: "Medium", points: 250, usedBy: 234, rating: 4.8 },
];

export default function MarketplacePage() {
    const { isOpen } = useSidebarStore();
const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const filteredItems = mockMarketplaceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesSubject = subjectFilter === "all" || item.subject.toLowerCase() === subjectFilter;
    return matchesSearch && matchesType && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
                <p className="text-gray-500 text-sm">Public catalog for organizations</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-sm text-emerald-600 font-medium">Platform Revenue</div>
                  <div className="text-lg font-bold text-emerald-700">48,201 pts</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">847</div>
                    <div className="text-sm text-gray-500">Public Items</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">52</div>
                    <div className="text-sm text-gray-500">Orgs Using</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F4511E]/10 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-[#F4511E]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">3,842</div>
                    <div className="text-sm text-gray-500">Total Uses</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">4.7</div>
                    <div className="text-sm text-gray-500">Avg Rating</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="Search marketplace..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                      <SelectItem value="set">Sets</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge className={item.type === "set" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}>
                          {item.type === "set" ? "Set" : "Question"}
                        </Badge>
                        <Badge className={
                          item.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" :
                          item.difficulty === "Hard" ? "bg-rose-50 text-rose-700" :
                          "bg-amber-50 text-amber-700"
                        }>
                          {item.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{item.subject}</p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-semibold text-[#F4511E]">{item.points} pts</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Users className="w-4 h-4" />
                        {item.usedBy} uses
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Eye className="w-4 h-4" /> Preview
                      </Button>
                      <Button size="sm" className="flex-1 bg-[#F4511E] hover:bg-[#E64A19] text-white gap-1">
                        <ShoppingCart className="w-4 h-4" /> Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
