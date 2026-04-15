"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import Dashboard from '../../../components/tools/doc-extract/Dashboard';
import Questions from '../../../components/tools/doc-extract/Questions';
import { Document, Question } from '../../../lib/tools/doc-extract/types';
import { toast } from 'sonner';
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function DocumentExtractionPage() {
  const { isOpen } = useSidebarStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions'>('dashboard');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentDocName, setCurrentDocName] = useState('');

  // Hydration fix and initial load
  useEffect(() => {
    const saved = localStorage.getItem('eduhub_doc_extractions');
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved documents");
      }
    }
  }, []);

  const saveDocuments = (newDocs: Document[]) => {
    setDocuments(newDocs);
    localStorage.setItem('eduhub_doc_extractions', JSON.stringify(newDocs));
  };

  const handleExtractionComplete = (questions: Question[], fileName: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: fileName,
      status: 'Completed',
      totalQuestions: questions.length,
      totalImages: 0,
      uploadDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      questions: questions
    };

    const updated = [newDoc, ...documents];
    saveDocuments(updated);
    setCurrentQuestions(questions);
    setCurrentDocName(fileName);
    setActiveTab('questions');
    toast.success("Extraction Completed successfully!");
  };

  const handleDocumentClick = (doc: Document) => {
    setCurrentQuestions(doc.questions);
    setCurrentDocName(doc.name);
    setActiveTab('questions');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Tool Header - Native look */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/question-bank" className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                  <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-brand-primary" />
                </Link>
                <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>Question Bank</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-900 font-bold">AI MCQ Extractor</span>
                </nav>
              </div>
            </div>

            <div className="mt-4">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard 
                      documents={documents}
                      onDocumentClick={handleDocumentClick}
                      onExtractionComplete={handleExtractionComplete}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                       <div className="flex items-center gap-4">
                         <button 
                           onClick={() => setActiveTab('dashboard')}
                           className="text-sm font-bold text-primary hover:underline px-4 py-2 bg-primary/5 rounded-xl transition-all"
                         >
                           ← Dashboard
                         </button>
                         <h2 className="text-xl font-bold text-slate-900 border-l border-slate-200 pl-4">
                           {currentDocName}
                         </h2>
                       </div>
                       <div className="text-sm text-slate-500 font-bold">
                         Total: {currentQuestions.length} Questions
                       </div>
                    </div>

                    <Questions 
                      questions={currentQuestions}
                      onEdit={(q) => {
                        setCurrentQuestions(prev => prev.map(item => item.id === q.id ? q : item));
                      }}
                      onQuestionsChange={(updated) => {
                        setCurrentQuestions(updated);
                        // Persist updated questions back to history
                        const updatedDocs = documents.map(d => 
                          d.name === currentDocName ? { ...d, questions: updated, totalQuestions: updated.length } : d
                        );
                        setDocuments(updatedDocs);
                        localStorage.setItem('eduhub_doc_extractions', JSON.stringify(updatedDocs));
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
