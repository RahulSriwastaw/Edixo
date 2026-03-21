"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Clock, 
  MousePointer2, 
  X,
  Eye,
  Check,
  ChevronLeft,
  Loader2,
  PackageCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { API_URL, getAuthHeaders } from "@/lib/api-config";

// getToken removed

export function AdvancedSetBuilder() {
  // --- Filter State ---
  const [exams, setExams] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);

  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Questions & Selection State ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // --- Cart & Set Creation State ---
  const [showCart, setShowCart] = useState(false);
  const [setName, setSetName] = useState("");
  const [setDuration, setSetDuration] = useState("60");
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);

  // --- Fetch Filter Options ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await fetch(`${API_URL}/qbank/filter-options`, {
            headers
        });
        const result = await res.json();
        if (result.success) {
          setExams(result.data.exams);
          setSubjects(result.data.subjects);
          setYears(result.data.years);
          setShifts(result.data.shifts);
        }
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    };
    fetchOptions();
  }, []);

  // --- Fetch Chapters based on Subject ---
  useEffect(() => {
    const fetchChapters = async () => {
      if (selectedSubject === "all") {
        setChapters([]);
        setSelectedChapter("all");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/qbank/chapters?subject=${encodeURIComponent(selectedSubject)}`, {
            headers: getAuthHeaders()
        });
        const result = await res.json();
        if (result.success) {
          setChapters(result.data);
          setSelectedChapter("all");
        }
      } catch (err) {
        console.error("Failed to fetch chapters", err);
      }
    };
    fetchChapters();
  }, [selectedSubject]);

  // --- Fetch Questions ---
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(url.toString(), {
            headers: getAuthHeaders()
        });
        const result = await res.json();
        if (result.success) {
          setQuestions(result.data.questions);
          setTotalQuestions(result.data.total);
        }
      } catch (err) {
        console.error("Failed to fetch questions", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounce = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(debounce);
  }, [selectedExam, selectedSubject, selectedChapter, selectedYear, selectedShift, searchQuery, page]);

  // --- Selection Helpers ---
  const toggleSelection = (id: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateSet = async () => {
    if (!setName) {
      toast.error("Please enter a set name");
      return;
    }
    if (selectedQuestionIds.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    setIsCreatingSet(true);
    try {
      const res = await fetch(`${API_URL}/qbank/sets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: setName,
          durationMins: parseInt(setDuration),
          questionIds: selectedQuestionIds
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Set "${setName}" created successfully!`);
        setSelectedQuestionIds([]);
        setSetName("");
        setShowCart(false);
      } else {
        toast.error(result.message || "Failed to create set");
      }
    } catch (err) {
      toast.error("An error occurred while creating the set");
    } finally {
      setIsCreatingSet(false);
    }
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MousePointer2 className="w-6 h-6 text-brand-primary" />
            Advanced Set Builder
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and pick questions across categories to build your mock test sets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={selectedQuestionIds.length > 0 ? "default" : "outline"}
            className={cn(
              "relative transition-all",
              selectedQuestionIds.length > 0 && "bg-brand-primary hover:bg-brand-primary/90"
            )}
            onClick={() => setShowCart(true)}
          >
            <PackageCheck className="w-4 h-4 mr-2" />
            Selected Questions
            {selectedQuestionIds.length > 0 && (
              <Badge className="ml-2 bg-white text-brand-primary hover:bg-white px-1.5 min-w-[20px] h-5">
                {selectedQuestionIds.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <Card className="border-slate-200 shadow-sm sticky top-0">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Search Content</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Type to search..." 
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Exam Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Category</label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {exams.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter Select (Cascading) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chapter</label>
                <Select 
                    value={selectedChapter} 
                    onValueChange={setSelectedChapter}
                    disabled={selectedSubject === "all" || chapters.length === 0}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={selectedSubject === "all" ? "Select Subject first" : "All Chapters"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chapters</SelectItem>
                    {chapters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Shift Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shift / Section</label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    {shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-slate-500 h-8 text-xs hover:text-red-600"
                onClick={() => {
                  setSelectedExam("all");
                  setSelectedSubject("all");
                  setSelectedChapter("all");
                  setSelectedYear("all");
                  setSelectedShift("all");
                  setSearchQuery("");
                }}
              >
                Reset All Filters
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Question List Area */}
        <main className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200">
            <div className="p-4 border-b flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">Available Questions</span>
                <Badge variant="outline" className="bg-white">{totalQuestions}</Badge>
              </div>
              <div className="flex items-center gap-2">
                 {/* Selection controls if needed */}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="min-w-[400px]">Question Content</TableHead>
                    <TableHead>Metadata</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                          <p className="text-sm text-slate-500">Loading questions...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-12 h-12 text-slate-200" />
                          <p className="text-slate-500">No questions found matching these filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((q) => (
                      <TableRow 
                        key={q.id} 
                        className={cn(
                          "group hover:bg-slate-50 transition-colors cursor-pointer",
                          selectedQuestionIds.includes(q.id) && "bg-brand-primary/5 hover:bg-brand-primary/10"
                        )}
                        onClick={() => toggleSelection(q.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedQuestionIds.includes(q.id)}
                            onCheckedChange={() => toggleSelection(q.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 py-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                               {q.exam} • {q.subjectName} • {q.year || 'N/A'}
                            </span>
                            <p className="text-sm font-medium text-slate-700 line-clamp-2 leading-relaxed">
                               {stripHtml(q.textEn || q.textHi || "")}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                               {q.chapterName && (
                                 <Badge variant="secondary" className="text-[9px] h-4 bg-slate-100 text-slate-500 border-none font-normal">
                                   {q.chapterName}
                                 </Badge>
                               )}
                               <Badge className={cn(
                                 "text-[9px] h-4 border-none font-normal",
                                 q.difficulty === 'EASY' ? "bg-green-100 text-green-700" :
                                 q.difficulty === 'HARD' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                               )}>
                                 {q.difficulty}
                               </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {q.section || 'General'}
                              </span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> {q.type}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-brand-primary"
                            onClick={() => setPreviewQuestion(q)}
                           >
                             <Eye className="w-4 h-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t flex items-center justify-between shrink-0 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalQuestions)} of {totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm font-medium px-2">Page {page}</div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    disabled={page * 10 >= totalQuestions}
                    onClick={() => setPage(page + 1)}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Question Set</DialogTitle>
            <DialogDescription>
              Give your selection a name and duration to create a reusable set.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Set Name</label>
                 <Input 
                    placeholder="e.g., SSC CGL Math Practice" 
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (Mins)</label>
                 <Input 
                    type="number" 
                    value={setDuration}
                    onChange={(e) => setSetDuration(e.target.value)}
                 />
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected Questions ({selectedQuestionIds.length})</label>
                 <Button variant="link" className="h-auto p-0 text-red-600 text-[10px]" onClick={() => setSelectedQuestionIds([])}>Clear All</Button>
               </div>
               <div className="max-h-[300px] overflow-y-auto border rounded-xl divide-y">
                  {selectedQuestionIds.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No questions selected yet.</div>
                  ) : (
                    selectedQuestionIds.map(id => {
                        const question = questions.find(q => q.id === id);
                        return (
                          <div key={id} className="p-3 flex items-center justify-between group">
                            <span className="text-xs text-slate-600 font-medium line-clamp-1 flex-1">
                                {question ? stripHtml(question.textEn || question.textHi) : id}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                onClick={() => toggleSelection(id)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )
                    })
                  )}
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCart(false)}>Cancel</Button>
            <Button 
                className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px]"
                disabled={isCreatingSet || selectedQuestionIds.length === 0}
                onClick={handleCreateSet}
            >
              {isCreatingSet ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Set
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="text-lg font-medium text-slate-800 leading-relaxed">
                   {stripHtml(previewQuestion?.textEn || previewQuestion?.textHi || "")}
                </div>
             </div>

             {previewQuestion?.options && (
               <div className="space-y-3">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Answer Options</label>
                 <div className="grid grid-cols-1 gap-2">
                    {previewQuestion.options.map((opt: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-4 rounded-xl border flex items-center gap-3",
                          opt.isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-slate-200 text-slate-600"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                          opt.isCorrect ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm font-medium">{stripHtml(opt.textEn || opt.textHi)}</span>
                        {opt.isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto text-green-500" />}
                      </div>
                    ))}
                 </div>
               </div>
             )}

             {(previewQuestion?.explanationEn || previewQuestion?.explanationHi) && (
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Explanation</label>
                  <div className="p-4 bg-brand-primary/5 rounded-xl text-sm text-slate-600 leading-relaxed italic border border-brand-primary/10">
                    {stripHtml(previewQuestion.explanationEn || previewQuestion.explanationHi)}
                  </div>
               </div>
             )}
          </div>
          <DialogFooter>
            <Button 
                variant={selectedQuestionIds.includes(previewQuestion?.id || '') ? "outline" : "default"}
                className={cn(
                    "flex-1",
                    !selectedQuestionIds.includes(previewQuestion?.id || '') && "bg-brand-primary hover:bg-brand-primary/90 text-white"
                )}
                onClick={() => {
                   if (previewQuestion) toggleSelection(previewQuestion.id);
                   setPreviewQuestion(null);
                }}
            >
              {selectedQuestionIds.includes(previewQuestion?.id || '') ? "Remove from Selection" : "Add to Selection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
