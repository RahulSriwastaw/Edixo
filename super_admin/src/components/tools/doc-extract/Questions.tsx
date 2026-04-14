"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Question } from '../../../lib/tools/doc-extract/types';
import { Search, Trash2, Edit, Tag, FileText, ChevronDown, ChevronUp, Eye, Share2, PlusCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sendQuestionsToBank } from '@/lib/tools/bankBridge';

interface QuestionsProps {
  questions: Question[];
  onEdit: (q: Question) => void;
  onQuestionsChange?: (questions: Question[]) => void;
}

export default function Questions({ questions, onEdit, onQuestionsChange }: QuestionsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);

  // Sync local state when props change
  React.useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const [isSending, setIsSending] = useState(false);

  const filteredQuestions = useMemo(() => {
    return localQuestions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [localQuestions, search, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    const updated = localQuestions.map(q => q.id === updatedQ.id ? updatedQ : q);
    setLocalQuestions(updated);
    if (onQuestionsChange) onQuestionsChange(updated);
    setEditingQuestion(null);
    toast.success("Question updated locally");
  };

  const handleSendToBank = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one question");
      return;
    }
    
    setIsSending(true);
    const selectedList = localQuestions.filter(q => selectedIds.includes(q.id));
    
    const success = await sendQuestionsToBank(selectedList.map(q => ({
      questionText: q.text,
      options: q.options.map((opt, i) => ({
        textEn: opt,
        textHi: opt,
        isCorrect: String.fromCharCode(65 + i) === q.correctOption,
        sortOrder: i
      })),
      explanationEn: q.solution_eng || '',
      type: 'MCQ',
      difficulty: q.difficulty as any
    })));

    if (success) {
      setSelectedIds([]);
      toast.success("Questions sent to bank successfully!");
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Edit Dialog */}
      {editingQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border-none">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Edit Question</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(null)}>
                  <Trash2 className="w-4 h-4" /> {/* Reuse Trash for Close if X is missing, but let's use a Close icon if available */}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Question Text</Label>
                  <textarea 
                    className="w-full min-h-[100px] p-4 rounded-2xl border-slate-200 text-sm focus:ring-4 focus:ring-primary/5 outline-none bg-slate-50"
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-bold text-slate-700">Options</Label>
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="flex gap-3">
                      <Button 
                        variant={editingQuestion.correctOption === String.fromCharCode(65 + i) ? "default" : "outline"}
                        onClick={() => setEditingQuestion({...editingQuestion, correctOption: String.fromCharCode(65 + i)})}
                        className="w-10 h-10 rounded-xl shrink-0 font-black"
                      >
                        {String.fromCharCode(65 + i)}
                      </Button>
                      <Input 
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editingQuestion.options];
                          newOpts[i] = e.target.value;
                          setEditingQuestion({...editingQuestion, options: newOpts});
                        }}
                        className="rounded-xl border-slate-100 bg-slate-50"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Difficulty</Label>
                    <Select 
                      value={editingQuestion.difficulty} 
                      onValueChange={(val: any) => setEditingQuestion({...editingQuestion, difficulty: val})}
                    >
                      <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  onClick={() => handleUpdateQuestion(editingQuestion)}
                  className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Checkbox 
            checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} 
            onCheckedChange={toggleSelectAll}
            className="w-5 h-5 border-slate-300 data-[state=checked]:bg-primary"
          />
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search extracted questions..." 
              className="pl-12 h-12 bg-white border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 hidden md:block" />

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
               <Button 
                onClick={handleSendToBank} 
                disabled={isSending}
                className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 gap-2"
              >
                {isSending ? <Database className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                {isSending ? 'Sending...' : 'Send to Bank'}
              </Button>
              <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-slate-600 gap-2">
                <Tag className="w-4 h-4" /> Bulk Tag
              </Button>
              <Button variant="outline" onClick={() => {
                const updated = localQuestions.filter(q => !selectedIds.includes(q.id));
                setLocalQuestions(updated);
                setSelectedIds([]);
                if (onQuestionsChange) onQuestionsChange(updated);
                toast.success("Questions deleted locally");
              }} className="h-11 px-4 rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 font-bold text-slate-600 gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-40 bg-white border-slate-100 rounded-xl font-bold text-slate-600">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Questions Display */}
      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        <AnimatePresence mode="popLayout">
          {filteredQuestions.map((q, idx) => (
            <motion.div
              layout
              key={q.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className={cn(
                "group relative border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden",
                selectedIds.includes(q.id) && "ring-2 ring-primary border-primary/20 bg-primary/[0.02]"
              )}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      checked={selectedIds.includes(q.id)} 
                      onCheckedChange={() => toggleSelect(q.id)}
                      className="mt-1 w-5 h-5 border-slate-300"
                    />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                          {q.id}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(q)} className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div 
                        className="text-slate-800 font-semibold leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: q.text }} 
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className={cn(
                            "p-4 rounded-2xl border transition-all flex items-center gap-3",
                            String.fromCharCode(65 + i) === q.correctOption 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold"
                              : "bg-slate-50 border-slate-100 text-slate-600"
                          )}>
                            <span className={cn(
                              "w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black",
                              String.fromCharCode(65 + i) === q.correctOption ? "bg-emerald-500 text-white" : "bg-white border border-slate-200"
                            )}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex gap-2">
                           <span className={cn(
                             "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                             q.difficulty === 'Hard' ? "bg-rose-50 text-rose-600" : q.difficulty === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                           )}>
                             {q.difficulty}
                           </span>
                        </div>
                        <Button variant="ghost" className="text-primary font-bold text-xs hover:bg-primary/5 gap-2">
                          <Eye className="w-4 h-4" /> View Solution
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredQuestions.length === 0 && (
        <div className="py-20 text-center space-y-4 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Search className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">No questions found</h3>
            <p className="text-slate-500 px-4">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
          <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('All'); }} className="rounded-xl border-slate-200 font-bold">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
