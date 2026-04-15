"use client";

import React from 'react';
import { Document, Question } from '../../../lib/tools/doc-extract/types';
import { FileText, Clock, CheckCircle2, AlertCircle, UploadCloud, ChevronRight } from 'lucide-react';
import Upload from './Upload';

interface DashboardProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
  onExtractionComplete: (questions: Question[], fileName: string) => void;
}

export default function Dashboard({ documents, onDocumentClick, onExtractionComplete }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Upload Section — clean admin card */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">New Extraction</h2>
            <p className="text-xs text-slate-400">Upload a PDF or paste text to start extracting questions</p>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <Upload onExtractionComplete={onExtractionComplete} />
        </div>
      </section>

      {/* Recent Extractions */}
      {documents.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Recent Extractions
            </h2>
            <span className="text-xs text-slate-400 font-medium">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group cursor-pointer bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => onDocumentClick(doc)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      doc.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {doc.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {doc.status}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 truncate group-hover:text-primary transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>{doc.totalQuestions} questions</span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </div>
                <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                  View & Edit Content
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
