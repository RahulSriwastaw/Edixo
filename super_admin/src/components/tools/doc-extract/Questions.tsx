"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Question } from '../../../lib/tools/doc-extract/types';
import { Search, Trash2, Edit, Tag, Database, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sendQuestionsToBank } from '@/lib/tools/bankBridge';

interface QuestionsProps {
  questions: Question[];
  onEdit: (q: Question) => void;
  onQuestionsChange?: (questions: Question[]) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function Questions({ questions, onEdit, onQuestionsChange }: QuestionsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [isSending, setIsSending] = useState(false);

  React.useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return localQuestions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [localQuestions, search, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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
    toast.success("Question updated");
  };

  const handleDelete = () => {
    const updated = localQuestions.filter(q => !selectedIds.includes(q.id));
    setLocalQuestions(updated);
    setSelectedIds([]);
    if (onQuestionsChange) onQuestionsChange(updated);
    toast.success(`${selectedIds.length} question(s) deleted`);
  };

  const handleSendToBank = async () => {
    if (selectedIds.length === 0) { toast.error("Select at least one question"); return; }
    setIsSending(true);
    const selectedList = localQuestions.filter(q => selectedIds.includes(q.id));
    const success = await sendQuestionsToBank(selectedList.map(q => ({
      questionText: q.text,
      options: q.options.map((opt, i) => ({
        textEn: opt, textHi: opt,
        isCorrect: String.fromCharCode(65 + i) === q.correctOption,
        sortOrder: i
      })),
      explanationEn: q.solution_eng || '',
      type: 'MCQ',
      difficulty: q.difficulty as any
    })));
    if (success) { setSelectedIds([]); toast.success("Questions sent to bank!"); }
    setIsSending(false);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Edit Modal */}
      <AnimatePresence>
        {editingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Edit Question</h3>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Question Text</Label>
                  <textarea
                    className="w-full min-h-[90px] p-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none bg-slate-50 resize-none transition-all"
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Options</Label>
                  {editingQuestion.options.map((opt, i) => {
                    const label = OPTION_LABELS[i];
                    const isCorrect = editingQuestion.correctOption === label;
                    return (
                      <div key={i} className="flex gap-2 items-center">
                        <button
                          onClick={() => setEditingQuestion({ ...editingQuestion, correctOption: label })}
                          className={cn(
                            "w-8 h-8 rounded-lg text-xs font-black shrink-0 border transition-all",
                            isCorrect
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          {label}
                        </button>
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...editingQuestion.options];
                            newOpts[i] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="h-8 text-sm rounded-lg border-slate-200 bg-slate-50 font-medium"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Difficulty</Label>
                  <Select
                    value={editingQuestion.difficulty}
                    onValueChange={(val: any) => setEditingQuestion({ ...editingQuestion, difficulty: val })}
                  >
                    <SelectTrigger className="h-9 rounded-lg bg-slate-50 border-slate-200 font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <Button
                  onClick={() => handleUpdateQuestion(editingQuestion)}
                  className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/20"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                  className="h-9 px-5 rounded-xl border-slate-200 text-slate-600 font-bold text-sm"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-wrap items-center gap-2 px-4 py-2.5">
        <Checkbox
          checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0}
          onCheckedChange={toggleSelectAll}
          className="w-4 h-4 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search questions..."
            className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-28 text-xs bg-slate-50 border-slate-200 rounded-lg font-medium text-slate-600">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 shadow-xl text-xs">
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-slate-400 font-medium">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
          </span>

          {selectedIds.length > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-xs font-bold text-primary">{selectedIds.length} selected</span>
                <Button
                  size="sm"
                  onClick={handleSendToBank}
                  disabled={isSending}
                  className="h-7 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 shadow-sm"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isSending ? 'Sending...' : 'Send to Bank'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="h-7 px-3 rounded-lg border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 font-bold text-xs gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.map((q, idx) => {
            const isSelected = selectedIds.includes(q.id);
            return (
              <motion.div
                layout
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                className={cn(
                  "group bg-white border rounded-xl overflow-hidden transition-all duration-150",
                  isSelected
                    ? "border-primary/30 ring-1 ring-primary/20 bg-primary/[0.01]"
                    : "border-slate-100 hover:border-slate-200"
                )}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(q.id)}
                    className="mt-0.5 w-4 h-4 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-wider">
                          {q.id}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                          q.difficulty === 'Hard'
                            ? "bg-rose-50 text-rose-600"
                            : q.difficulty === 'Medium'
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        )}>
                          {q.difficulty}
                        </span>
                        {q.status && q.status !== 'Draft' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">
                            {q.status}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Question Text */}
                    <div
                      className="text-sm text-slate-800 font-medium leading-snug"
                      dangerouslySetInnerHTML={{ __html: q.text }}
                    />

                    {/* Options — compact horizontal pills */}
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt, i) => {
                        const label = OPTION_LABELS[i];
                        const isCorrect = label === q.correctOption;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                              isCorrect
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-slate-50 border-slate-100 text-slate-600"
                            )}
                          >
                            <span className={cn(
                              "w-4 h-4 flex items-center justify-center rounded text-[10px] font-black shrink-0",
                              isCorrect ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-500"
                            )}>
                              {label}
                            </span>
                            <span className="max-w-[200px] truncate">{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-100">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No questions found</h3>
          <p className="text-xs text-slate-400 mb-4">Try adjusting your search or filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearch(''); setStatusFilter('All'); }}
            className="rounded-lg border-slate-200 font-bold text-xs"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
