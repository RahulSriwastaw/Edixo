"use client";

import React from 'react';
import { Document, Question } from '../../../lib/tools/doc-extract/types';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, CheckCircle2, AlertCircle, UploadCloud, ChevronRight } from 'lucide-react';
import Upload from './Upload';

interface DashboardProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
  onExtractionComplete: (questions: Question[], fileName: string) => void;
}

export default function Dashboard({ documents, onDocumentClick, onExtractionComplete }: DashboardProps) {
  return (
    <div className="space-y-12">
      {/* Upload Section */}
      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/60 group">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 " />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">New Extraction</h2>
              <p className="text-sm text-slate-500">Upload a PDF or paste text to start extracting questions</p>
            </div>
          </div>
        </div>
        <div className="p-8 md:p-12">
          <Upload onExtractionComplete={onExtractionComplete} />
        </div>
      </section>

      {/* Recent Extractions */}
      {documents.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Clock className="w-6 h-6 text-slate-400" />
              Recent Extractions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card 
                key={doc.id} 
                className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 border-slate-100 transition-all duration-300 rounded-3xl overflow-hidden" 
                onClick={() => onDocumentClick(doc)}
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        doc.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {doc.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {doc.status}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 truncate group-hover:text-primary transition-colors">
                      {doc.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
                      <span>{doc.totalQuestions} questions</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-50 flex items-center justify-between text-sm font-bold text-slate-600 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                    View & Edit Content
                    <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
