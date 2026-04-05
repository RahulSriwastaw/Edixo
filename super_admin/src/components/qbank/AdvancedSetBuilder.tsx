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
  PackageCheck,
  ListFilter,
  Globe2
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
import { SuperPagination } from "@/components/ui/super-pagination";

// getToken removed

const FILTER_FIELDS = [
  { value: "textEn", label: "Question Text (English)" },
  { value: "textHi", label: "Question Text (Hindi)" },
  { value: "subjectName", label: "Subject" },
  { value: "chapterName", label: "Chapter" },
  { value: "exam", label: "Exam Category" },
  { value: "type", label: "Question Type" },
  { value: "difficulty", label: "Difficulty/Level" },
  { value: "year", label: "Year" },
  { value: "shift", label: "Shift/Section" },
  { value: "tags", label: "Tags/Keywords" },
  { value: "airtableTableName", label: "Airtable Source" },
];

const FILTER_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
  { value: "isEmpty", label: "Is Empty" },
  { value: "isNotEmpty", label: "Is Not Empty" },
];

export function AdvancedSetBuilder() {
  // --- Filter State ---
  const [exams, setExams] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filters, setFilters] = useState<Array<{ id: string, field: string, operator: string, value: string }>>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  const addFilter = () => {
    setFilters([...filters, { id: Math.random().toString(36).substr(2, 9), field: "subjectName", operator: "equals", value: "" }]);
  };

  const updateFilter = (id: string, key: string, value: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  // --- Questions & Selection State ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [displayLanguage, setDisplayLanguage] = useState<'both' | 'en' | 'hi'>('both');

  // --- Cart & Set Creation State ---
  const [showCart, setShowCart] = useState(false);
  const [setName, setSetName] = useState("");
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);

  // --- Fetch Filter Options ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log("[AdvancedSetBuilder] Fetching options from:", `${API_URL}/qbank/filter-options`);
        const headers = getAuthHeaders();
        const res = await fetch(`${API_URL}/qbank/filter-options`, {
            headers
        });
        const result = await res.json();
        console.log("[AdvancedSetBuilder] Filter Options Result:", result);
        if (result.success) {
          setExams(result.data.exams || []);
          setSubjects(result.data.subjects || []);
          setYears(result.data.years || []);
          setShifts(result.data.shifts || []);
          setSources(result.data.sources || []);
          console.log("[AdvancedSetBuilder] Options set in state");
        } else {
          console.error("[AdvancedSetBuilder] Failed to fetch options:", result.message);
          if (res.status === 401) {
            toast.error("Session expired or unauthorized. Please log in again.");
          } else {
            toast.error(result.message || "Failed to load filter options");
          }
        }
      } catch (err) {
        console.error("[AdvancedSetBuilder] Error in fetchOptions:", err);
        toast.error("Connection error. Please check if the backend is running.");
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
        const url = new URL(`${API_URL}/qbank/questions`);
        if (searchQuery) url.searchParams.append("search", searchQuery);
        if (selectedExam !== "all") url.searchParams.append("exam", selectedExam);
        if (selectedSubject !== "all") url.searchParams.append("subject", selectedSubject);
        if (selectedChapter !== "all") url.searchParams.append("chapter", selectedChapter);
        if (selectedYear !== "all") url.searchParams.append("year", selectedYear.toString());
        if (selectedShift !== "all") url.searchParams.append("shift", selectedShift);
        if (selectedDifficulty !== "all") url.searchParams.append("difficulty", selectedDifficulty);
        if (selectedType !== "all") url.searchParams.append("type", selectedType);
        if (selectedSource !== "all") url.searchParams.append("source", selectedSource);
        if (filters.length > 0) url.searchParams.append("filters", JSON.stringify(filters));
        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", limit.toString());

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
  }, [selectedExam, selectedSubject, selectedChapter, selectedYear, selectedShift, selectedDifficulty, selectedType, selectedSource, filters, searchQuery, page, limit]);

  // --- Selection Helpers ---
  const toggleSelection = (id: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectCurrentView = () => {
    const currentPageIds = questions.map(q => q.id);
    setSelectedQuestionIds(prev => {
      const newSelection = new Set([...prev, ...currentPageIds]);
      return Array.from(newSelection);
    });
    toast.success(`Added ${currentPageIds.length} questions from current view`);
  };

  const selectAllQuestions = async () => {
    try {
      setIsLoading(true);
      const url = new URL(`${API_URL}/qbank/questions`);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      if (selectedExam !== "all") url.searchParams.append("exam", selectedExam);
      if (selectedSubject !== "all") url.searchParams.append("subject", selectedSubject);
      if (selectedChapter !== "all") url.searchParams.append("chapter", selectedChapter);
      if (selectedYear !== "all") url.searchParams.append("year", selectedYear.toString());
      if (selectedShift !== "all") url.searchParams.append("shift", selectedShift);
      if (selectedDifficulty !== "all") url.searchParams.append("difficulty", selectedDifficulty);
      if (selectedType !== "all") url.searchParams.append("type", selectedType);
      if (selectedSource !== "all") url.searchParams.append("source", selectedSource);
      if (filters.length > 0) url.searchParams.append("filters", JSON.stringify(filters));
      url.searchParams.append("limit", "10000"); // Fetch max results

      const res = await fetch(url.toString(), {
          headers: getAuthHeaders()
      });
      const result = await res.json();
      if (result.success) {
        const allIds = result.data.questions.map((q: any) => q.id);
        setSelectedQuestionIds(prev => {
          const newSelection = new Set([...prev, ...allIds]);
          return Array.from(newSelection);
        });
        toast.success(`Added all ${allIds.length} matching questions to selection`);
      } else {
        toast.error("Failed to fetch all questions");
      }
    } catch (err) {
      console.error("Failed to select all questions", err);
      toast.error("Error fetching all questions");
    } finally {
      setIsLoading(false);
    }
  };

  const deselectCurrentView = () => {
    const currentPageIds = questions.map(q => q.id);
    setSelectedQuestionIds(prev =>
      prev.filter(id => !currentPageIds.includes(id))
    );
    toast.info(`Removed ${currentPageIds.length} questions from current view`);
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
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <Globe2 className="w-4 h-4 text-slate-500 ml-2" />
            <div className="flex bg-slate-100 p-0.5 rounded-md gap-0.5">
              <Button 
                variant="ghost" 
                onClick={() => setDisplayLanguage('en')}
                className={cn("h-7 px-3 text-xs", displayLanguage === 'en' ? "bg-white shadow-sm font-medium text-brand-primary" : "text-slate-500 hover:text-slate-700")}
              >
                English
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setDisplayLanguage('hi')}
                className={cn("h-7 px-3 text-xs", displayLanguage === 'hi' ? "bg-white shadow-sm font-medium text-brand-primary" : "text-slate-500 hover:text-slate-700")}
              >
                हिंदी
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setDisplayLanguage('both')}
                className={cn("h-7 px-3 text-xs", displayLanguage === 'both' ? "bg-white shadow-sm font-medium text-brand-primary" : "text-slate-500 hover:text-slate-700")}
              >
                Both
              </Button>
            </div>
          </div>
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

              {/* Airtable Source Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Airtable Source</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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

              {/* Question Type Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Question Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="integer">Integer</SelectItem>
                    <SelectItem value="multi_select">Multi-select</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Difficulty Level</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Filters Button */}
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className={cn("w-full gap-2", filters.length > 0 && "bg-orange-50 border-orange-200 text-[#F4511E] hover:bg-orange-100")}
                  onClick={() => setShowFilterDialog(true)}
                >
                  <ListFilter className="w-4 h-4" />
                  Advanced Rules
                  {filters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-700 hover:bg-orange-100">{filters.length}</Badge>
                  )}
                </Button>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-slate-500 h-8 text-xs hover:text-red-600 mt-2"
                onClick={() => {
                  setSelectedExam("all");
                  setSelectedSubject("all");
                  setSelectedChapter("all");
                  setSelectedYear("all");
                  setSelectedShift("all");
                  setSelectedDifficulty("all");
                  setSelectedType("all");
                  setSelectedSource("all");
                  setSearchQuery("");
                  setFilters([]);
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
                {selectedQuestionIds.length > 0 && (
                  <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/30">
                    {selectedQuestionIds.length} selected
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedQuestionIds.length > 0 && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                    onClick={deselectCurrentView}
                    disabled={questions.length === 0}
                  >
                    <X className="w-3.5 h-3.5" />
                    Deselect View ({questions.filter(q => selectedQuestionIds.includes(q.id)).length})
                  </Button>
                )}
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                  onClick={selectCurrentView}
                  disabled={questions.length === 0}
                >
                  <Check className="w-3.5 h-3.5" />
                  Select Current View ({questions.length})
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary"
                  onClick={selectAllQuestions}
                  disabled={totalQuestions === 0 || isLoading}
                >
                  <Check className="w-3.5 h-3.5" />
                  Select All ({totalQuestions})
                </Button>
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
                            {displayLanguage !== 'hi' && q.textEn && (
                              <p className="text-sm font-medium text-slate-700 line-clamp-2 leading-relaxed">
                                {stripHtml(q.textEn)}
                              </p>
                            )}
                            {displayLanguage !== 'en' && q.textHi && (
                              <p className={cn("text-sm font-medium text-slate-700 line-clamp-2 leading-relaxed", displayLanguage === 'both' && q.textEn && "mt-1 pt-1 border-t border-slate-100 text-slate-600")}>
                                {stripHtml(q.textHi)}
                              </p>
                            )}
                            {!q.textEn && !q.textHi && (
                              <p className="text-sm font-medium text-slate-400 italic">No text available</p>
                            )}
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
            <div className="p-2 border-t mt-auto bg-slate-50/50">
              <SuperPagination 
                currentPage={page} 
                totalPages={Math.ceil(totalQuestions / limit)} 
                pageSize={limit} 
                onPageChange={setPage} 
                onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }} 
                totalItems={totalQuestions} 
              />
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
              Give your selection a name to create a reusable set.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Set Name</label>
              <Input 
                placeholder="e.g., SSC CGL Math Practice" 
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
              />
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
                                {question ? (
                                    displayLanguage === 'en' ? stripHtml(question.textEn || question.textHi) :
                                    displayLanguage === 'hi' ? stripHtml(question.textHi || question.textEn) :
                                    stripHtml(question.textEn || question.textHi)
                                ) : id}
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
                {displayLanguage !== 'hi' && previewQuestion?.textEn && (
                  <div className="text-lg font-medium text-slate-800 leading-relaxed">
                     {stripHtml(previewQuestion.textEn)}
                  </div>
                )}
                {displayLanguage !== 'en' && previewQuestion?.textHi && (
                  <div className={cn("text-lg font-medium text-slate-800 leading-relaxed", displayLanguage === 'both' && previewQuestion?.textEn && "mt-2 pt-2 border-t border-slate-200 text-slate-700")}>
                     {stripHtml(previewQuestion.textHi)}
                  </div>
                )}
                {!previewQuestion?.textEn && !previewQuestion?.textHi && (
                  <div className="text-lg font-medium text-slate-400 italic">No text available</div>
                )}
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
                        <div className="flex-1 flex flex-col gap-1">
                          {displayLanguage !== 'hi' && opt.textEn && (
                            <span className="text-sm font-medium">{stripHtml(opt.textEn)}</span>
                          )}
                          {displayLanguage !== 'en' && opt.textHi && (
                            <span className={cn("text-sm font-medium", displayLanguage === 'both' && opt.textEn && "text-slate-500 text-xs pt-1 mt-1 border-t border-slate-100")}>
                              {stripHtml(opt.textHi)}
                            </span>
                          )}
                          {!opt.textEn && !opt.textHi && (
                            <span className="text-sm font-medium italic text-slate-400">Empty Option</span>
                          )}
                        </div>
                        {opt.isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto text-green-500 shrink-0" />}
                      </div>
                    ))}
                 </div>
               </div>
             )}

             {(previewQuestion?.explanationEn || previewQuestion?.explanationHi) && (
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Explanation</label>
                  <div className="p-4 bg-brand-primary/5 rounded-xl text-sm text-slate-600 leading-relaxed italic border border-brand-primary/10">
                    {displayLanguage !== 'hi' && previewQuestion.explanationEn && (
                      <p>{stripHtml(previewQuestion.explanationEn)}</p>
                    )}
                    {displayLanguage !== 'en' && previewQuestion.explanationHi && (
                      <p className={cn(displayLanguage === 'both' && previewQuestion.explanationEn && "mt-2 pt-2 border-t border-brand-primary/10 text-slate-500")}>
                        {stripHtml(previewQuestion.explanationHi)}
                      </p>
                    )}
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

      {/* Advanced Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-3xl border-0 shadow-2xl overflow-hidden p-0 rounded-2xl">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 px-6 py-5 border-b border-orange-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-xl text-gray-900">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-orange-200">
                  <ListFilter className="w-5 h-5 text-[#F4511E]" />
                </div>
                Advanced Filters
              </DialogTitle>
              <DialogDescription className="text-gray-600 font-medium">
                Build precise queries to find exactly what you need.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 bg-gray-50/50 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar">
            {filters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-4 ring-8 ring-orange-50/50">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No filters applied</h3>
                <p className="text-gray-500 text-center text-sm max-w-[280px] mb-6">
                  Start building your query by adding your first filter rule below.
                </p>
                <Button onClick={addFilter} className="bg-[#F4511E] hover:bg-[#E64A19] text-white shadow-md shadow-orange-500/20 rounded-full px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filters.map((filter, index) => (
                  <div key={filter.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all">
                    
                    {/* Operator Logic Badge */}
                    <div className="flex items-center pt-1 sm:pt-0 sm:w-20 shrink-0">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 ${index === 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                      >
                        {index === 0 ? "WHERE" : "AND"}
                      </Badge>
                    </div>

                    <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
                      {/* Field Selection */}
                      <Select value={filter.field} onValueChange={(val) => updateFilter(filter.id, "field", val)}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50 border-gray-200 hover:bg-white focus:ring-[#F4511E]">
                          <SelectValue placeholder="Select Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_FIELDS.map(f => (
                            <SelectItem key={f.value} value={f.value} className="cursor-pointer">{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Operator Selection */}
                      <Select value={filter.operator} onValueChange={(val) => updateFilter(filter.id, "operator", val)}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-gray-50/50 border-gray-200 hover:bg-white focus:ring-[#F4511E]">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_OPERATORS.map(f => (
                            <SelectItem key={f.value} value={f.value} className="cursor-pointer font-medium">{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Value Input */}
                      {!["isEmpty", "isNotEmpty"].includes(filter.operator) ? (
                        <div className="relative flex-1 w-full">
                          <Input
                            placeholder="Type value..."
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                            className="w-full bg-white border-gray-200 focus-visible:ring-[#F4511E]"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 hidden sm:block"></div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <div className="w-full sm:w-auto flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFilter(filter.id)} 
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-lg h-10 w-10 sm:h-9 sm:w-9 shrink-0"
                        title="Remove condition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addFilter} 
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 text-gray-500 hover:text-[#F4511E] rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add another condition
                </button>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setFilters([])}
              className="w-full sm:w-auto text-gray-500 hover:text-gray-900"
              disabled={filters.length === 0}
            >
              Clear All
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowFilterDialog(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 sm:flex-none bg-[#F4511E] hover:bg-[#E64A19] text-white shadow-md shadow-orange-500/20" 
                onClick={() => setShowFilterDialog(false)}
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
