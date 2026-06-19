"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import {
  Plus, Save, Trash2, CheckCircle, RefreshCw, Layers, BookOpen, Book, Search, Copy, Download, Upload, X,
  ArrowUp, ArrowDown, ArrowLeft, GripVertical, Presentation, Sparkles, AlertTriangle, Filter,
  Lightbulb, ExternalLink, Calendar, Languages, CheckSquare, Square, Tag, BarChart3, Edit3,
  Settings2, Trash, Database, FileJson, ChevronDown, Wand2, Globe, Settings, Clock, Bold,
  Italic, Underline as UnderlineIcon, List, ListOrdered, Type as TypeIcon, Undo, Redo,
  ChevronRight, Hash, FilterX, Check, Image as ImageIcon, Eraser, Heading1, Heading2,
  CircleDot, Circle, Lock, Key, Share2, Flag, Printer, AlertCircle, Bell, User, ArrowDownCircle, Star, LogOut,
  FileText, FileSpreadsheet, Eye, Minus
} from 'lucide-react';
import { InputPanel, InputMode, InputData } from './QuestionGeneration/InputPanel';
import { AutoDetectionFeedback } from './QuestionGeneration/AutoDetectionFeedback';
import { AnswerGenerator } from './AnswerGenerator';
import { BookStudio } from './BookStudio/BookStudio';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { SubjectSpecificPanel } from './SubjectSpecificPanel';
import { SetWizard } from './SetWizard';
import { TeacherView } from './TeacherView';
import { ExportSettings } from './ExportSettings';
import { RefinementStudio } from './RefinementStudio';
import { ExtractPanel } from './ExtractPanel';
import { storageService } from '../services/storageService';
import { geminiService, CURRENT_AFFAIRS_CATEGORIES } from '../services/geminiService';
import { aiOrchestrator, availableModels, AIModelConfig } from '../services/aiOrchestrator';
import { Question, QuestionSet, Difficulty, QuestionType, GenerateParams } from '../types';
import { BulkUploadModal } from './BulkUploadModal';
import { Button } from './Button';
import { useAuth } from '../../contexts/AuthContext';
import { generateQuestionSetPDF } from '../utils/pdfGenerator';
import { generateQuestionSetPPT } from '../utils/pptGenerator';

// Expose storageService for console usage/seeding
if (typeof window !== 'undefined') {
  (window as any).storageService = storageService;
}

interface CreatorDashboardProps {
  onLaunchPresentation?: (setId: string) => void;
  onLaunchPDF?: (setId: string) => void;
  onLaunchRefine?: (questionId: string) => void;
  initialTab?: 'extract' | 'library' | 'sets' | 'answer' | 'book' | 'export';
}

const SUBJECTS = [
  'Current Affairs', 'General Knowledge', 'Mathematics', 'Science', 'English', 'Reasoning', 'History', 'Geography', 'Polity', 'Economics', 'Environment', 'Computer', 'Art and Culture', 'Sports', 'Vividh', 'Hindi'
];

const LANGUAGES = [
  'English', 'Hindi', 'Bilingual'
];

import { RichEditor } from './RichEditor';

interface CascadingSelectorProps {
  library: Question[];
  onSelect: (filters: any) => void;
  onCancel: () => void;
}

const CascadingSelector: React.FC<CascadingSelectorProps> = ({ library, onSelect, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'subject' | 'exam' | 'book'>('subject');

  // Selection State
  const [level1, setLevel1] = useState<string | null>(null);
  const [level2, setLevel2] = useState<string | null>(null);
  const [level3, setLevel3] = useState<string | null>(null);
  const [level4, setLevel4] = useState<string | null>(null);

  // Derived Data Lists
  const list1 = useMemo(() => {
    if (activeTab === 'subject') return SUBJECTS;
    if (activeTab === 'exam') return Array.from(new Set(library.map(q => q.exam).filter(Boolean)));
    if (activeTab === 'book') return ['NCERT Mastery', 'Standard Archives', 'Topic Specialization'];
    return [];
  }, [activeTab, library]);

  const list2 = useMemo(() => {
    if (!level1) return [];
    if (activeTab === 'subject') {
      if (level1 === 'Current Affairs') return CURRENT_AFFAIRS_CATEGORIES;
      return ['Appointments and Resignation', 'International Affairs', 'Sports', 'Art and Culture', 'Defense', 'Summit and Conference', 'Day and Events', 'Index and Reports', 'Person in News'];
    }

    if (level1 === 'Smart Filters') {
      return ['Latest AI Generations', "Today's Current Affairs", 'Yesterday\'s Content', 'Flagged for Review'];
    }

    const filtered = library.filter(q => q.subject === level1 || q.exam?.includes(level1));
    return Array.from(new Set(filtered.map(q => q.exam || q.topic).filter(Boolean)));
  }, [activeTab, level1, library]);

  const list3 = useMemo(() => {
    if (!level2) return [];
    const filtered = library.filter(q =>
      (q.exam === level2 || q.topic === level2 || q.chapter === level2) &&
      (activeTab === 'subject' ? q.subject === level1 : true)
    );
    return Array.from(new Set(filtered.map(q => q.year || 'Unknown Year'))).sort().reverse();
  }, [activeTab, level1, level2, library]);

  const list4 = useMemo(() => {
    if (!level3) return [];
    const filtered = library.filter(q =>
      ((q.exam === level2 || q.topic === level2 || q.chapter === level2)) &&
      (q.year === level3 || (level3 === 'Unknown Year' && !q.year))
    );
    return Array.from(new Set(filtered.map(q => q.question_source || 'Full Set'))).sort();
  }, [activeTab, level1, level2, level3, library]);

  const handleLevel1Click = (val: string) => { setLevel1(val); setLevel2(null); setLevel3(null); setLevel4(null); };
  const handleLevel2Click = (val: string) => { setLevel2(val); setLevel3(null); setLevel4(null); };
  const handleLevel3Click = (val: string) => { setLevel3(val); setLevel4(null); };
  const handleLevel4Click = (val: string) => { setLevel4(val); };

  const handleContinue = () => {
    onSelect({
      tab: activeTab,
      level1,
      level2,
      level3,
      level4
    });
  };

  const Column = ({ title, items, selected, onSelect }: any) => (
    <div className="w-80 flex flex-col min-w-[320px] shrink-0">
      <div className="h-10 bg-slate-50/80 border-b border-slate-100 flex items-center px-4 justify-between backdrop-blur-sm sticky top-0 z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</span>
        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/10">{items.length} Nodes</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {items.map((item: string) => {
          const isSelected = selected === item;
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between group ${isSelected ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span className="truncate">{item}</span>
              {isSelected && <ChevronRight size={14} />}
            </button>
          );
        })}
        {items.length === 0 && (
          <div className="py-12 text-center opacity-30">
            <Layers size={24} className="mx-auto mb-2" />
            <span className="text-[10px] font-bold uppercase">Void</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden font-sans">
      {/* 1. Technical Header */}
      <div className="h-14 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-1 ring-white/10">
            <Globe size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-wider text-sm leading-none">Global Sourcing</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Asset Protocols Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="h-8 px-4 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase transition-all">
            Abort Protocol
          </button>
          <button
            onClick={handleContinue}
            disabled={!level2}
            className={`h-9 px-6 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all ${!level2 ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-primary text-white hover:bg-indigo-500 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5'}`}
          >
            Initialize Selection <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-6 shrink-0 z-10 shadow-sm/50">
        {[
          { id: 'subject', label: 'Academic Domains', icon: BookOpen },
          { id: 'exam', label: 'Exam Archives', icon: FileJson },
          { id: 'book', label: 'Curated Literature', icon: Layers },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setLevel1(null); }}
            className={`h-full flex items-center gap-2.5 border-b-[3px] transition-all px-1 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'}`}
          >
            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[11px] font-black uppercase tracking-wide">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Columns Container */}
        <div className="flex-1 overflow-x-auto flex divide-x divide-slate-200 bg-white">
          <Column title="Initialize Discovery" items={list1} selected={level1} onSelect={handleLevel1Click} />
          <Column title="Refinement Vector" items={list2} selected={level2} onSelect={handleLevel2Click} />
          {list3.length > 0 && <Column title="Temporal Marker" items={list3} selected={level3} onSelect={handleLevel3Click} />}
          {list4.length > 0 && <Column title="Source Origin" items={list4} selected={level4} onSelect={handleLevel4Click} />}

          {/* Empty State Fill */}
          <div className="flex-1 bg-slate-50/30" />
        </div>

        {/* 4. Intelligence Sidebar (Right) */}
        <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 z-20 shadow-[-10px_0_40px_rgba(0,0,0,0.02)]">
          <div className="p-8 border-b border-slate-200 bg-white">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-900/10 rotate-3">
              <Sparkles size={20} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wide text-slate-900 leading-tight">Intelligence<br />Calibration</h4>
            <p className="text-[11px] font-medium text-slate-500 mt-3 leading-relaxed">The system is ready to isolate specific assets within the defined academic boundaries. Select vectors to unlock the stream.</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Summary Items */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Coordinates</span>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Domain</span>
                    <span className="text-xs font-black text-slate-800">{level1 || '...'}</span>
                  </div>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Vector</span>
                    <span className="text-xs font-black text-slate-800">{level2 || '...'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-700">
                <Wand2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-[10px] font-bold text-blue-600/80 leading-relaxed">
                Selected domain contains high-density assets suitable for competitive exams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ onLaunchPresentation, onLaunchPDF, onLaunchRefine, initialTab }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'extract' | 'library' | 'sets' | 'answer' | 'book' | 'export'>(initialTab || 'library');
  
  // Pack Management
  const [packs, setPacks] = useState<any[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [isPackLoading, setIsPackLoading] = useState(false);

  useEffect(() => {
    const fetchPacks = async () => {
      setIsPackLoading(true);
      const data = await storageService.getPacks();
      setPacks(data);
      if (data.length > 0) setSelectedPackId(data[0].id);
      setIsPackLoading(false);
    };
    fetchPacks();
  }, []);

  const [viewLanguage, setViewLanguage] = useState<'English' | 'Hindi' | 'Bilingual'>('Bilingual');
  const [launchSetId, setLaunchSetId] = useState<string | null>(null);
  const [exportDropdownSetId, setExportDropdownSetId] = useState<string | null>(null);
  const [exportSetId, setExportSetId] = useState<string | null>(null);
  const [refineQuestionId, setRefineQuestionId] = useState<string | null>(null);

  // Export Tab State
  const [exportFormat, setExportFormat] = useState<'pdf' | 'ppt' | 'csv' | 'json'>('pdf');
  const [exportSubjectFilter, setExportSubjectFilter] = useState<string>('All');
  const [exportDifficultyFilter, setExportDifficultyFilter] = useState<string>('All');
  const [exportLanguage, setExportLanguage] = useState<'English' | 'Hindi' | 'Bilingual'>('English');
  const [exportCount, setExportCount] = useState<number>(10);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportOptions, setExportOptions] = useState({
    includeAnswers: true,
    includeSolutions: false,
    shuffleQuestions: false,
    numberQuestions: true
  });

  // Set Creation Wizard State
  const [setWizardStep, setSetWizardStep] = useState<'details' | 'source' | 'questions'>('details');
  const [wizardFilters, setWizardFilters] = useState<any>(null);
  const [pickerLang, setPickerLang] = useState<'Both' | 'Hindi' | 'English'>('Both');
  const [pickerOptionsFilter, setPickerOptionsFilter] = useState<'All' | '4' | '5'>('All');
  const [pickerView, setPickerView] = useState<'List' | 'Grid' | 'Single'>('List');
  const [pickerDate, setPickerDate] = useState<string>('All');
  const [pickerSubject, setPickerSubject] = useState<string>('All');
  const [pickerTopic, setPickerTopic] = useState<string>('All');
  const [singleViewIndex, setSingleViewIndex] = useState(0);
  const [targetCount, setTargetCount] = useState<number>(100);
  const [reportQuestion, setReportQuestion] = useState<Question | null>(null);
  const [reportIssueType, setReportIssueType] = useState<string>('Found an Issue');
  const [reportComment, setReportComment] = useState<string>('');

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingLang, setEditingLang] = useState<'eng' | 'hin'>('eng');
  const [isEditingGenerated, setIsEditingGenerated] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [library, setLibrary] = useState<Question[]>([]);
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [editingSet, setEditingSet] = useState<Partial<QuestionSet> | null>(null);
  const [isSetEditorOpen, setIsSetEditorOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  // Enhanced Filtering State
  const [subjectFilterState, setSubjectFilterState] = useState<string>('All');
  const [examFilter, setExamFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [folderFilter, setFolderFilter] = useState<string>('All');

  // Load folders from localStorage
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);

  useEffect(() => {
    const savedFolders = localStorage.getItem('qbank-extract-folders');
    if (savedFolders) {
      try {
        setAvailableFolders(JSON.parse(savedFolders));
      } catch (e) {
        console.error('Failed to load folders:', e);
      }
    }
  }, []);
  const [chapterFilter, setChapterFilter] = useState<string>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [collectionFilter, setCollectionFilter] = useState<string>('All');
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [aiGeneratedFilter, setAiGeneratedFilter] = useState<'All' | 'AI' | 'Manual'>('All');
  const [flaggedFilter, setFlaggedFilter] = useState<'All' | 'Flagged' | 'Unflagged'>('All');
  const [smartPreset, setSmartPreset] = useState<string>('None');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const uniqueSubjects = useMemo(() => Array.from(new Set(library.map(q => q.subject).filter(Boolean))).sort(), [library]);
  const uniqueExams = useMemo(() => Array.from(new Set(library.map(q => q.exam).filter(Boolean))).sort(), [library]);
  const uniqueYears = useMemo(() => Array.from(new Set(library.map(q => q.year).filter(Boolean))).sort().reverse(), [library]);
  const uniqueDates = useMemo(() => Array.from(new Set(library.map(q => q.date || q.createdDate?.split('T')[0]).filter(Boolean))).sort().reverse(), [library]);
  const uniqueChapters = useMemo(() => Array.from(new Set(library.map(q => q.chapter).filter(Boolean))).sort(), [library]);
  const uniqueTopics = useMemo(() => Array.from(new Set(library.map(q => q.topic).filter((t): t is string => !!t))).sort(), [library]);
  const uniqueSections = useMemo(() => Array.from(new Set(library.map(q => q.section).filter((s): s is string => !!s))).sort(), [library]);
  const uniqueCollections = useMemo(() => Array.from(new Set(library.map(q => q.collection).filter((c): c is string => !!c))).sort(), [library]);
  const uniquePreviousOf = useMemo(() => Array.from(new Set(library.map(q => q.previous_of).filter(Boolean))).sort(), [library]);
  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    library.forEach(q => {
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(tag => tag && tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [library]);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isSetWizardOpen, setIsSetWizardOpen] = useState(false);

  const [genParams, setGenParams] = useState<GenerateParams>({
    subject: 'Current Affairs',
    topic: '',
    difficulty: 'Medium',
    count: 5,
    type: 'MCQ',
    language: 'Bilingual',
    date: new Date().toISOString().split('T')[0]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [inputData, setInputData] = useState<InputData>({});
  const [selectedAIModel, setSelectedAIModel] = useState<AIModelConfig>(availableModels[0]);
  const [outputFormat, setOutputFormat] = useState<'html' | 'plain'>('html');

  // Utility to strip HTML tags for plain text output
  const stripHTML = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();
  };


  const handleInputChange = useCallback((mode: InputMode, data: InputData) => {
    setInputMode(mode);
    setInputData(data);

    // Auto-update generation parameters based on input
    const isShortText = mode === 'text' && data.text && data.text.length < 100;

    setGenParams(prev => ({
      ...prev,
      inputMode: mode,
      // Only set context if it's NOT a short text (topic)
      context: (mode === 'text' && isShortText) ? '' : (data.text || data.url || ''),
      files: data.files,
      // If text is short, treat it as a topic, otherwise it's context
      topic: isShortText ? data.text! :
        (mode === 'text' && data.text ? 'Custom Content' :
          (mode === 'url' ? 'URL Analysis' :
            (mode === 'image' ? 'Image Analysis' :
              (mode === 'pdf' ? 'PDF Analysis' : prev.topic))))
    }));
  }, []);

  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);

  // Custom Topics Management
  const [customTopics, setCustomTopics] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('q-bank-custom-topics') : null;
    return saved ? JSON.parse(saved) : [];
  });
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);
  const [editingTopicValue, setEditingTopicValue] = useState('');

  // Save custom topics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('q-bank-custom-topics', JSON.stringify(customTopics));
  }, [customTopics]);

  // Combine AI suggested topics with custom topics
  const allTopics = useMemo(() => {
    return [...customTopics, ...suggestedTopics.filter(t => !customTopics.includes(t))];
  }, [customTopics, suggestedTopics]);

  // Topic CRUD functions
  const handleAddTopic = () => {
    if (!newTopicInput.trim()) return;
    if (customTopics.includes(newTopicInput.trim())) {
      alert('Topic already exists!');
      return;
    }
    setCustomTopics([newTopicInput.trim(), ...customTopics]);
    setNewTopicInput('');
  };

  const handleEditTopic = (index: number) => {
    setEditingTopicIndex(index);
    setEditingTopicValue(customTopics[index]);
  };

  const handleSaveTopicEdit = () => {
    if (editingTopicIndex === null || !editingTopicValue.trim()) return;
    const updated = [...customTopics];
    updated[editingTopicIndex] = editingTopicValue.trim();
    setCustomTopics(updated);
    setEditingTopicIndex(null);
    setEditingTopicValue('');
  };

  const handleDeleteTopic = (index: number) => {
    if (!confirm(`Delete topic "${customTopics[index]}"?\n\nक्या आप "${customTopics[index]}" topic को हटाना चाहते हैं?`)) return;
    const updated = customTopics.filter((_, i) => i !== index);
    setCustomTopics(updated);
  };

  useEffect(() => {
    if (selectedPackId) {
      refreshLibrary();
    }
    refreshSets();
  }, [selectedPackId]);


  useEffect(() => {
    fetchTopicSuggestions();
  }, [genParams.subject]);


  const refreshLibrary = async () => {
    if (!selectedPackId) return;
    setIsDataLoading(true);
    try {
      const data = await storageService.getQuestions(selectedPackId);
      setLibrary(data);
    } catch (err) {
      console.warn('refreshLibrary failed:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const refreshSets = async () => {
    try {
      const data = await storageService.getSets();
      setSets(data || []);
    } catch {
      // silent — sets will just be empty
    }
  };

  const fetchTopicSuggestions = async () => {
    const topics = await geminiService.suggestTopics(genParams.subject);
    setSuggestedTopics(topics);
    if (topics.length > 0 && !genParams.topic) {
      setGenParams(prev => ({ ...prev, topic: topics[0] }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion || !selectedPackId) return;
    setIsDataLoading(true);
    try {
      await storageService.saveQuestion(editingQuestion, selectedPackId);
      setEditingQuestion(null);
      setIsEditingGenerated(false);
      await refreshLibrary();
    } catch (error) {
      console.error("Failed to commit asset:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleToggleFlag = async (id: string) => {
    const q = library.find(item => item.id === id);
    if (!q || !selectedPackId) return;
    const updated = { ...q, flagged: !q.flagged };
    await storageService.saveQuestion(updated, selectedPackId);
    await refreshLibrary();
  };

  const toggleSetQuestion = (id: string) => {
    if (!editingSet) return;
    const currentIds = editingSet.questionIds || [];
    const newIds = currentIds.includes(id)
      ? currentIds.filter(itemId => itemId !== id)
      : [...currentIds, id];
    setEditingSet({ ...editingSet, questionIds: newIds });
  };

  const handleCreateSet = () => {
    setFilter('');
    setSetWizardStep('details');
    setWizardFilters(null);
    setEditingSet({
      setId: `set_${Date.now()}`,
      name: '',
      description: '',
      questionIds: [],
      createdDate: new Date().toISOString(),
      settings: { timerEnabled: false, timePerQuestion: 30, showQuestionNumbers: true, randomize: false }
    } as any);
    setIsSetEditorOpen(true);
  };

  const handleSaveSet = async () => {
    if (!editingSet) return;

    // Validation
    if (!editingSet.name || editingSet.name.trim() === '') {
      alert('Set name is required');
      return;
    }

    setIsDataLoading(true);
    try {
      // Build payload with only defined fields
      const payload: any = {
        setId: editingSet.setId || `set_${Date.now()}`,
        name: editingSet.name.trim(),
        description: editingSet.description || '',
        questionIds: editingSet.questionIds || [],
        createdDate: editingSet.createdDate || new Date().toISOString(),
        settings: editingSet.settings || { timerEnabled: false, timePerQuestion: 30, showQuestionNumbers: true, randomize: false }
      };

      // Only add optional fields if they have values
      if (editingSet.status) payload.status = editingSet.status;
      if (editingSet.category) payload.category = editingSet.category;
      if (editingSet.publishedDate) payload.publishedDate = editingSet.publishedDate;
      if (editingSet.tags && editingSet.tags.length > 0) payload.tags = editingSet.tags;
      if (editingSet.password) payload.password = editingSet.password;

      console.log('Saving set with payload:', payload);
      await storageService.saveSet(payload as QuestionSet);
      console.log('Set saved successfully');

      setIsSetEditorOpen(false);
      setEditingSet(null);
      await refreshSets();
    } catch (error: unknown) {
      console.error("Failed to persist set architecture:", error);
      if (error && typeof error === 'object') {
        console.error("Error details:", JSON.stringify(error, null, 2));
      }
      alert(`Failed to save set: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  const reportIssue = async () => {
    if (!reportQuestion) return;
    console.log(`Reporting issue for ${reportQuestion.id}: ${reportIssueType} - ${reportComment}`);
    setReportQuestion(null);
    setReportComment('');
  };

  const handleBulkImport = async (questions: Question[]) => {
    if (!selectedPackId) return alert('Please select a question pack first');
    setIsDataLoading(true);
    try {
      await storageService.saveQuestionsBulk(questions, selectedPackId);
      await refreshLibrary();
      setShowBulkModal(false);
    } catch (error) {
      console.error("Bulk synchronization failure:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleBulkAction = async (updates: Partial<Question>) => {
    if (selectedIds.length === 0 || !selectedPackId) return;
    setIsDataLoading(true);
    try {
      await storageService.updateQuestionsBulk(selectedIds, updates, selectedPackId);
      await refreshLibrary();
      setShowBulkEdit(false);
    } catch (e) {
      console.error("Failed to perform bulk transformation:", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`🗑️ Delete ${selectedIds.length} questions permanently?\n\nक्या आप ${selectedIds.length} प्रश्नों को स्थायी रूप से हटाना चाहते हैं?\n\nThis action cannot be undone!`)) return;
    setIsDataLoading(true);
    const idsToDelete = [...selectedIds];
    try {
      setLibrary(prev => prev.filter(item => !idsToDelete.includes(item.id)));
      setSelectedIds([]);
      await storageService.deleteQuestionsBulk(idsToDelete, selectedPackId);
      await refreshLibrary();
    } catch (e) {
      console.error("Delete failed:", e);
      alert('Delete failed! Check console for details.');
      await refreshLibrary();
    } finally {
      setIsDataLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLibrary.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLibrary.map(q => q.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleManualCreate = () => {
    const newQ: Question = {
      id: `q_${Date.now()}_manual`,
      question_eng: '',
      question_hin: '',
      option1_eng: '', option1_hin: '',
      option2_eng: '', option2_hin: '',
      option3_eng: '', option3_hin: '',
      option4_eng: '', option4_hin: '',
      answer: '1',
      solution_eng: '', solution_hin: '',
      type: 'MCQ',
      difficulty: 'Medium',
      subject: 'Mathematics',
      chapter: '',
      topic: '',
      question_unique_id: `q_${Date.now()}_manual`,
      language: 'Bilingual',
      createdDate: new Date().toISOString(),
      tags: [],
      // Additional CSV fields
      exam: '',
      section: '',
      year: '',
      date: new Date().toISOString().split('T')[0],
      collection: '',
      previous_of: '',
      video: ''
    };
    setEditingQuestion(newQ);
    setIsEditingGenerated(false);
  };


  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (re) => {
      try {
        const json = JSON.parse(re.target?.result as string);
        if (Array.isArray(json)) {
          setIsDataLoading(true);
          const newQs = json.map((q: any) => ({
            ...q,
            id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            createdDate: new Date().toISOString(),
            subject: q.subject || 'General',
            difficulty: q.difficulty || 'Medium',
            type: q.type || 'MCQ',
            language: q.language || 'Bilingual'
          }));
          await storageService.saveQuestionsBulk(newQs as Question[], selectedPackId);
          await refreshLibrary();
          alert(`Successfully imported ${newQs.length} questions.`);
        } else {
          alert("Invalid JSON format. Expected an array of questions.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON file.");
      } finally {
        setIsDataLoading(false);
        if (bulkInputRef.current) bulkInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  const handleGenerate = async () => {
    if (!genParams.topic) return alert("Select a topic");
    setIsGenerating(true);
    try {
      const qs = await aiOrchestrator.generateQuestions({ ...genParams, outputFormat }, selectedAIModel);
      if (!qs || qs.length === 0) {
        alert("The AI successfully processed your request but returned 0 questions.\n\nThis usually happens if:\n1. The topic is too niche.\n2. The safety filters blocked the content.\n3. The result was not in the expected format.\n\nTry simplifying the topic or using a different model.");
      } else {
        if (autoSaveEnabled) {
          // Auto-saving logic
          if (!selectedPackId) return alert('Select a pack to auto-save');
          setIsDataLoading(true);
          await storageService.saveQuestionsBulk(qs, selectedPackId);
          await refreshLibrary();
          setIsDataLoading(false);
          alert(`✨ Success! ${qs.length} questions generated and saved automatically.`);
          setGeneratedQuestions([]); // Clear preview since it's saved
        } else {
          setGeneratedQuestions(qs);
        }
      }
    } catch (e: any) {
      console.error("Generation failed:", e);
      alert(`GenAI Error (${selectedAIModel.displayName}): ${e.message || e}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGenerated = async () => {
    if (!selectedPackId) return alert('Please select a question pack first');
    setIsDataLoading(true);
    await storageService.saveQuestionsBulk(generatedQuestions, selectedPackId);
    setGeneratedQuestions([]);
    setActiveTab('library');
    await refreshLibrary();
    setIsDataLoading(false);
  };

  // Handler for saving extracted questions from ExtractPanel
  const handleSaveExtractedQuestions = async (questions: Question[]) => {
    if (!selectedPackId) return alert('Please select a question pack first');
    setIsDataLoading(true);
    await storageService.saveQuestionsBulk(questions, selectedPackId);
    setActiveTab('library');
    await refreshLibrary();
    setIsDataLoading(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilter('');
    setDifficultyFilter('All');
    setLanguageFilter('All');
    setSubjectFilterState('All');
    setExamFilter('All');
    setYearFilter('All');
    setDateFilter('All');
    setFolderFilter('All');
    setChapterFilter('All');
    setTopicFilter('All');
    setSectionFilter('All');
    setCollectionFilter('All');
    setTagsFilter([]);
    setAiGeneratedFilter('All');
    setFlaggedFilter('All');
    setSmartPreset('None');
  };

  // Apply smart filter presets
  const applySmartPreset = (preset: string) => {
    clearAllFilters();
    setSmartPreset(preset);
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    switch (preset) {
      case 'Recent AI Generated':
        setAiGeneratedFilter('AI');
        // Filter for last 7 days
        break;
      case 'Current Affairs This Month':
        setSubjectFilterState('Current Affairs');
        // Would need date range here
        break;
      case 'Flagged for Review':
        setFlaggedFilter('Flagged');
        break;
      case 'Missing Hindi':
        // This would need a custom filter in the logic
        break;
      case 'High Difficulty Unattempted':
        setDifficultyFilter('Hard');
        break;
    }
  };


  const filteredLibrary = useMemo(() => {
    return library.filter(q => {
      // Text search in question, solution, and options
      const matchSearch = filter === '' ||
        q.question_eng.toLowerCase().includes(filter.toLowerCase()) ||
        q.question_hin.toLowerCase().includes(filter.toLowerCase()) ||
        q.solution_eng?.toLowerCase().includes(filter.toLowerCase()) ||
        q.solution_hin?.toLowerCase().includes(filter.toLowerCase()) ||
        q.option1_eng.toLowerCase().includes(filter.toLowerCase()) ||
        q.option2_eng.toLowerCase().includes(filter.toLowerCase()) ||
        q.option3_eng.toLowerCase().includes(filter.toLowerCase()) ||
        q.option4_eng.toLowerCase().includes(filter.toLowerCase());

      const matchDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      const matchLang = languageFilter === 'All' || q.language === languageFilter;
      const matchSub = subjectFilterState === 'All' || q.subject === subjectFilterState;
      const matchExam = examFilter === 'All' || (q.exam || 'Unknown') === examFilter;
      const matchYear = yearFilter === 'All' || (q.year || 'Unknown') === yearFilter;
      const matchDate = dateFilter === 'All' || (q.date || q.createdDate?.split('T')[0] || 'Unknown') === dateFilter;
      const matchFolder = folderFilter === 'All' || (q.folderName || 'Uncategorized') === folderFilter;
      const matchChapter = chapterFilter === 'All' || (q.chapter || 'Unknown') === chapterFilter;
      const matchTopic = topicFilter === 'All' || (q.topic || 'Unknown') === topicFilter;
      const matchSection = sectionFilter === 'All' || (q.section || 'Unknown') === sectionFilter;
      const matchCollection = collectionFilter === 'All' || (q.collection || 'Unknown') === collectionFilter;

      // Tags filter (must match ALL selected tags)
      const matchTags = tagsFilter.length === 0 || tagsFilter.every(tag => q.tags?.includes(tag));

      // AI Generated filter
      const matchAI = aiGeneratedFilter === 'All' ||
        (aiGeneratedFilter === 'AI' && (q.tags?.includes('AI-Generated') || q.id.includes('q_'))) ||
        (aiGeneratedFilter === 'Manual' && !q.tags?.includes('AI-Generated') && !q.id.includes('q_'));

      // Flagged filter
      const matchFlagged = flaggedFilter === 'All' ||
        (flaggedFilter === 'Flagged' && q.flagged === true) ||
        (flaggedFilter === 'Unflagged' && !q.flagged);

      return matchSearch && matchDiff && matchLang && matchSub && matchExam && matchYear &&
        matchDate && matchFolder && matchChapter && matchTopic && matchSection && matchCollection &&
        matchTags && matchAI && matchFlagged;
    });
  }, [library, filter, difficultyFilter, languageFilter, subjectFilterState, examFilter, yearFilter,
    dateFilter, folderFilter, chapterFilter, topicFilter, sectionFilter, collectionFilter, tagsFilter, aiGeneratedFilter, flaggedFilter]);

  // Filtered questions for Export tab
  const filteredExportQuestions = useMemo(() => {
    let questions = library;

    // Apply subject filter
    if (exportSubjectFilter !== 'All') {
      questions = questions.filter(q => q.subject === exportSubjectFilter);
    }

    // Apply difficulty filter
    if (exportDifficultyFilter !== 'All') {
      questions = questions.filter(q => q.difficulty === exportDifficultyFilter);
    }

    // Apply selection filter if questions are selected
    if (selectedIds.length > 0) {
      questions = questions.filter(q => selectedIds.includes(q.id));
    }

    return questions;
  }, [library, exportSubjectFilter, exportDifficultyFilter, selectedIds]);

  // Handle export functionality
  const handleExport = async () => {
    if (filteredExportQuestions.length === 0) return;

    setIsExporting(true);
    try {
      const questionsToExport = exportOptions.shuffleQuestions
        ? [...filteredExportQuestions].sort(() => Math.random() - 0.5).slice(0, exportCount)
        : filteredExportQuestions.slice(0, exportCount);

      switch (exportFormat) {
        case 'pdf':
          // Generate PDF
          const { generateQuestionSetPDF } = await import('../utils/pdfGenerator');
          await generateQuestionSetPDF(questionsToExport, {
            title: 'Question Bank Export',
            subtitle: `Exported ${questionsToExport.length} questions`,
            includeAnswerKey: exportOptions.includeAnswers,
            includeExplanations: exportOptions.includeSolutions,
          });
          break;

        case 'ppt':
          // Generate PowerPoint
          const { generateQuestionSetPPT } = await import('../utils/pptGenerator');
          await generateQuestionSetPPT(questionsToExport, {
            title: 'Question Bank Export',
            subtitle: `${questionsToExport.length} Questions`,
            theme: 'dark',
            showAnswerAfterEach: exportOptions.includeAnswers,
          });
          break;

        case 'csv':
          // Generate CSV
          const csvContent = generateCSV(questionsToExport, exportOptions, exportLanguage);
          downloadFile(csvContent, 'questions.csv', 'text/csv');
          break;

        case 'json':
          // Generate JSON
          const jsonContent = JSON.stringify(questionsToExport, null, 2);
          downloadFile(jsonContent, 'questions.json', 'application/json');
          break;
      }

      alert(`Successfully exported ${questionsToExport.length} questions as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to generate CSV
  const generateCSV = (questions: Question[], options: any, language: string) => {
    const headers = ['ID', 'Subject', 'Difficulty', 'Language', 'Question (EN)', 'Question (HI)',
      'Option A (EN)', 'Option B (EN)', 'Option C (EN)', 'Option D (EN)',
      'Option A (HI)', 'Option B (HI)', 'Option C (HI)', 'Option D (HI)',
      'Answer', ...(options.includeSolutions ? ['Solution (EN)', 'Solution (HI)'] : [])];

    const rows = questions.map((q, idx) => [
      options.numberQuestions ? idx + 1 : q.id,
      q.subject,
      q.difficulty,
      q.language,
      language !== 'Hindi' ? stripHTML(q.question_eng) : '',
      language !== 'English' ? stripHTML(q.question_hin) : '',
      language !== 'Hindi' ? stripHTML(q.option1_eng) : '',
      language !== 'Hindi' ? stripHTML(q.option2_eng) : '',
      language !== 'Hindi' ? stripHTML(q.option3_eng) : '',
      language !== 'Hindi' ? stripHTML(q.option4_eng) : '',
      language !== 'English' ? stripHTML(q.option1_hin) : '',
      language !== 'English' ? stripHTML(q.option2_hin) : '',
      language !== 'English' ? stripHTML(q.option3_hin) : '',
      language !== 'English' ? stripHTML(q.option4_hin) : '',
      options.includeAnswers ? q.answer : '',
      ...(options.includeSolutions ? [stripHTML(q.solution_eng || ''), stripHTML(q.solution_hin || '')] : [])
    ]);

    return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  };

  // Helper function to download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const setWizardFilteredQuestions = useMemo(() => {
    if (setWizardStep !== 'questions') return [];
    return library.filter(q => {
      const matchSearch = q.question_eng?.toLowerCase().includes(filter.toLowerCase()) || q.question_hin?.toLowerCase().includes(filter.toLowerCase());
      let matchWizard = true;
      if (wizardFilters?.level1 === 'Smart Filters') {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (wizardFilters.level2 === 'Latest AI Generations') matchWizard = q.tags?.includes('AI-Generated') || q.id.includes('q_');
        else if (wizardFilters.level2 === "Today's Current Affairs") matchWizard = (q.date === today || q.createdDate?.startsWith(today)) && q.subject === 'Current Affairs';
        else if (wizardFilters.level2 === "Yesterday's Content") matchWizard = q.date === yesterday || q.createdDate?.startsWith(yesterday);
        else if (wizardFilters.level2 === "Flagged for Review") matchWizard = q.flagged === true;
      } else if (wizardFilters?.level2) {
        matchWizard = (q.exam === wizardFilters.level2) || (q.subject === wizardFilters.level2) || (q.topic === wizardFilters.level2) || (q.chapter === wizardFilters.level2) || (q.subject === wizardFilters.level1);
      }
      const matchLang = pickerLang === 'Both' || q.language === pickerLang;
      const hasOption5 = !!(q.option5_eng || q.option5_hin);
      const matchOpt = pickerOptionsFilter === 'All' || (pickerOptionsFilter === '5' && hasOption5) || (pickerOptionsFilter === '4' && !hasOption5);

      const matchDate = dateFilter === 'All' || (q.date === dateFilter || q.createdDate?.startsWith(dateFilter));
      const matchSubject = pickerSubject === 'All' || q.subject === pickerSubject;
      const matchExam = examFilter === 'All' || (q.exam || 'Unknown') === examFilter;
      const matchYear = yearFilter === 'All' || (q.year || 'Unknown') === yearFilter;

      return matchSearch && matchWizard && matchLang && matchOpt && matchDate && matchSubject && matchExam && matchYear;
    });
  }, [library, filter, wizardFilters, setWizardStep, pickerLang, pickerOptionsFilter, dateFilter, pickerSubject, examFilter, yearFilter]);

  const handleSmartSelect = (mode: 'all' | 'first' | 'random', count?: number) => {
    if (!editingSet) return;
    let newIds = [...(editingSet.questionIds || [])];
    const available = setWizardFilteredQuestions.map(q => q.id);

    if (mode === 'all') {
      newIds = Array.from(new Set([...newIds, ...available]));
    } else if (mode === 'first' && count) {
      const toAdd = available.slice(0, count);
      newIds = Array.from(new Set([...newIds, ...toAdd]));
    } else if (mode === 'random' && count) {
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      const toAdd = shuffled.slice(0, count);
      newIds = Array.from(new Set([...newIds, ...toAdd]));
    }

    setEditingSet({ ...editingSet, questionIds: newIds });
  };

  // If refining a question, render RefinementStudio fullscreen
  if (refineQuestionId) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white">
        <RefinementStudio
          questionId={refineQuestionId}
          onExit={() => { setRefineQuestionId(null); refreshLibrary(); }}
        />
      </div>
    );
  }

  // If exporting, render ExportSettings fullscreen
  if (exportSetId) {
    const exportSet = sets.find(s => s.setId === exportSetId);
    const exportQuestions = library.filter(q => exportSet?.questionIds?.includes(q.id));
    if (exportSet) {
      return (
        <ExportSettings
          set={exportSet}
          questions={exportQuestions}
          onBack={() => setExportSetId(null)}
        />
      );
    }
  }

  // If launching whiteboard, render TeacherView as fixed fullscreen overlay (covers Navbar)
  if (launchSetId) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <TeacherView
          initialSetId={launchSetId}
          onExit={() => setLaunchSetId(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden page-fade-in selection:bg-primary/20">
      {/* 1. SIDEBAR — Light theme matching public website */}
      <aside className="w-[220px] bg-white flex flex-col shrink-0 border-r border-[#E5E7EB] z-50">
        {/* Branding */}
        <div className="px-4 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center text-white shadow-sm">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Q-Bank <span className="text-primary">Pro</span></h2>
              <p className="text-[10px] font-medium text-[#6B7280] mt-0.5">Question Studio</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {[
            { id: 'library', label: 'Global Inventory', icon: Database },
            { id: 'extract', label: 'Extract', icon: Sparkles },
            { id: 'sets', label: 'Curation Studio', icon: FileJson },
            { id: 'answer', label: 'AI Answer', icon: CheckCircle },
            { id: 'book', label: 'AI Book', icon: BookOpen },
            { id: 'analytics', label: 'Scoreboard', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'analytics') return;
                setActiveTab(item.id as any);
                setSelectedIds([]);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-all text-left ${activeTab === item.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-slate-700 border border-transparent'
                }`}
            >
              <item.icon size={16} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className={`text-[13px] font-semibold ${activeTab === item.id ? 'text-primary' : ''}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="px-3 py-3 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-[10px] hover:bg-[#F9FAFB] transition-all">
            <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-[#6B7280] truncate">{user.email}</p>
            </div>
            <button onClick={signOut} title="Sign Out" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-error hover:bg-red-50 transition-all">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. DYNAMIC WORKSPACE HUB */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#F8FAFC]">
        {/* Header Bar */}
        <header className="h-12 bg-white border-b border-[#E5E7EB] sticky top-0 z-40 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-bold text-slate-900">
              {activeTab === 'library' ? 'Global Inventory' : activeTab === 'extract' ? 'Extract Questions' : activeTab === 'answer' ? 'Answer Studio' : activeTab === 'book' ? 'Book Architect' : activeTab === 'sets' ? 'Curation Studio' : 'Studio'}
            </h1>
            <div className="hidden lg:flex items-center gap-2 bg-[#F9FAFB] px-3 py-1 rounded-[10px] border border-[#E5E7EB]">
              <Database size={13} className="text-primary" />
              <span className="text-xs font-semibold text-slate-600">{library.length} Questions</span>
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </div>

            {/* Pack Selector */}
            <div className="ml-4 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pack:</span>
              <select 
                className="h-8 bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary/50 min-w-[150px]"
                value={selectedPackId}
                onChange={(e) => setSelectedPackId(e.target.value)}
              >
                {isPackLoading ? <option>Loading packs...</option> : 
                 packs.length === 0 ? <option>No packs found</option> :
                 packs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full" />
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <div className="h-8 px-3 rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="w-8 h-8 rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] hover:text-error hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#F9FAFB]">
          {activeTab === 'library' && (
            <div className="max-w-full mx-auto space-y-4 animate-in fade-in duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Questions', value: library.length, icon: Database, color: 'text-primary', bg: 'bg-primary/5' },
                  { label: 'Curated Sets', value: sets.length, icon: FileJson, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Total Usage', value: library.reduce((acc, q) => acc + (q.usageCount || 0), 0), icon: BarChart3, color: 'text-success', bg: 'bg-green-50' },
                  { label: 'Quality Score', value: '4.9', icon: Sparkles, color: 'text-warning', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <stat.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#6B7280] font-medium">{stat.label}</p>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search & Actions Bar */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm sticky top-16 z-30 overflow-hidden">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
                  {/* Search */}
                  <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-primary transition-colors" size={15} />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      className="w-full h-11 pl-10 pr-4 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 border-b lg:border-b-0 lg:border-r border-[#E5E7EB]"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button
                      onClick={toggleSelectAll}
                      className={`h-8 px-3 rounded-[10px] border flex items-center gap-1.5 transition-all text-xs font-semibold ${selectedIds.length === filteredLibrary.length && filteredLibrary.length > 0 ? 'bg-primary border-primary text-white' : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-primary/30'}`}
                    >
                      {selectedIds.length === filteredLibrary.length && filteredLibrary.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                      {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}
                    </button>

                    <button onClick={handleManualCreate} className="h-8 px-3 bg-primary text-white rounded-[10px] font-semibold hover:bg-primary-hover transition-all flex items-center gap-1.5 text-xs">
                      <Plus size={14} /> New
                    </button>

                    <button onClick={() => setShowBulkModal(true)} className="h-8 w-8 bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] rounded-[10px] hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center">
                      <Upload size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mt-3">
                {[
                  { val: languageFilter, set: setLanguageFilter, label: 'Language', options: LANGUAGES },
                  { val: difficultyFilter, set: setDifficultyFilter, label: 'Difficulty', options: ['Easy', 'Medium', 'Hard', 'Expert'] },
                  { val: subjectFilterState, set: setSubjectFilterState, label: 'Subject', options: uniqueSubjects },
                  { val: folderFilter, set: setFolderFilter, label: 'Folder', options: ['Uncategorized', ...availableFolders] },
                  { val: examFilter, set: setExamFilter, label: 'Exam', options: uniqueExams },
                ].map((f, i) => (
                  <div key={i} className="relative shrink-0">
                    <select
                      className="h-8 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 text-xs font-medium text-slate-700 appearance-none cursor-pointer outline-none min-w-[120px] pr-7 transition-all focus:border-primary/40"
                      value={f.val}
                      onChange={(e) => f.set(e.target.value)}
                    >
                      <option value="All">{f.label}: All</option>
                      {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                  </div>
                ))}
                <button onClick={refreshLibrary} className="h-8 w-8 shrink-0 rounded-[10px] border border-[#E5E7EB] text-[#6B7280] hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center">
                  <RefreshCw size={14} className={isDataLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Advanced Filter Panel */}
              <AdvancedFilterPanel
                showPanel={showFilterPanel}
                setShowPanel={setShowFilterPanel}
                topicFilter={topicFilter}
                setTopicFilter={setTopicFilter}
                sectionFilter={sectionFilter}
                setSectionFilter={setSectionFilter}
                collectionFilter={collectionFilter}
                setCollectionFilter={setCollectionFilter}
                aiGeneratedFilter={aiGeneratedFilter}
                setAiGeneratedFilter={setAiGeneratedFilter}
                flaggedFilter={flaggedFilter}
                setFlaggedFilter={setFlaggedFilter}
                smartPreset={smartPreset}
                uniqueTopics={uniqueTopics}
                uniqueSections={uniqueSections}
                uniqueCollections={uniqueCollections}
                filteredCount={filteredLibrary.length}
                totalCount={library.length}
                clearAllFilters={clearAllFilters}
                applySmartPreset={applySmartPreset}
              />


              {selectedIds.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <CheckSquare size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{selectedIds.length} Questions Selected</h4>
                        <p className="text-xs text-[#6B7280]">Bulk actions available</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedIds([])}
                        className="h-8 px-3 bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] rounded-[10px] text-xs font-medium transition-all hover:bg-white flex items-center gap-1.5"
                      >
                        <X size={14} /> Clear
                      </button>
                      <button
                        onClick={() => setShowBulkEdit(!showBulkEdit)}
                        className={`h-8 px-3 rounded-[10px] text-xs font-semibold transition-all flex items-center gap-1.5 ${showBulkEdit ? 'bg-primary text-white' : 'bg-white border border-primary/30 text-primary hover:bg-primary/5'}`}
                      >
                        <Edit3 size={14} /> {showBulkEdit ? 'Close' : 'Bulk Edit'}
                      </button>
                      <button
                        onClick={() => setIsSetWizardOpen(true)}
                        className="h-8 px-3 bg-primary text-white rounded-[10px] text-xs font-semibold transition-all hover:bg-primary-hover flex items-center gap-1.5"
                      >
                        <FileJson size={14} /> Create Set
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="h-8 px-3 bg-error text-white rounded-[10px] text-xs font-semibold transition-all hover:bg-red-600 flex items-center gap-1.5"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {showBulkEdit && (
                    <div className="pt-3 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-300">
                      {[
                        { label: 'Language', options: LANGUAGES, key: 'language' },
                        { label: 'Subject', options: SUBJECTS, key: 'subject' },
                        { label: 'Difficulty', options: ['Easy', 'Medium', 'Hard', 'Expert'], key: 'difficulty' }
                      ].map(field => (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider ml-0.5">{field.label}</label>
                          <div className="relative">
                            <select
                              className="w-full h-8 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 text-xs font-medium text-slate-700 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                              onChange={(e) => e.target.value && handleBulkAction({ [field.key]: e.target.value } as any)}
                              defaultValue=""
                            >
                              <option value="" disabled>Set {field.label}...</option>
                              {field.options.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Question Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLibrary.map(q => {
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <div key={q.id} className={`bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all group relative ${isSelected ? 'border-primary/40 ring-1 ring-primary/10' : 'border-[#E5E7EB]'}`}>
                      <div className="flex items-start gap-3">
                        {/* Select Checkbox */}
                        <div className="pt-0.5 select-none">
                          <label className="relative flex items-center justify-center w-4 h-4 cursor-pointer">
                            <input
                              type="checkbox"
                              className="peer appearance-none w-4 h-4 border-2 border-[#E5E7EB] rounded text-primary focus:ring-0 checked:bg-primary checked:border-primary transition-all"
                              checked={isSelected}
                              onChange={() => toggleSelect(q.id)}
                            />
                            <Check className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                          </label>
                        </div>

                        {/* Card Body */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-[#6B7280] uppercase">{q.subject?.substring(0, 15)}</span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${q.difficulty === 'Easy' ? 'bg-green-50 text-success' :
                                q.difficulty === 'Medium' ? 'bg-amber-50 text-warning' :
                                  'bg-red-50 text-error'
                                }`}>
                                {q.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setRefineQuestionId(q.id); }}
                                className="w-6 h-6 rounded-lg bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB] flex items-center justify-center hover:text-primary hover:border-primary/30 transition-all"
                                title="Edit Question"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("🗑️ Delete this question permanently?\n\nइस प्रश्न को स्थायी रूप से हटाएं?")) {
                                    try {
                                      setLibrary(prev => prev.filter(item => item.id !== q.id));
                                      setSelectedIds(prev => prev.filter(sid => sid !== q.id));
                                      await storageService.deleteQuestion(q.id);
                                      await refreshLibrary();
                                    } catch (err) {
                                      console.error('Delete failed:', err);
                                      alert('Delete failed! Check console for details.');
                                      await refreshLibrary();
                                    }
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB] flex items-center justify-center hover:text-error hover:border-error/30 transition-all"
                                title="Delete Question"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Question Content */}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div>
                              <div className="text-[13px] font-medium text-slate-900 leading-snug line-clamp-3 max-w-none" dangerouslySetInnerHTML={{ __html: q.question_eng }} />
                              {q.question_hin && <div className="text-xs text-[#6B7280] italic line-clamp-1 mt-1" dangerouslySetInnerHTML={{ __html: q.question_hin }} />}
                            </div>

                            <div className="grid grid-cols-1 gap-1.5">
                              {[q.option1_eng, q.option2_eng, q.option3_eng, q.option4_eng].map((opt, oi) => {
                                const isCorrect = parseInt(q.answer) === oi + 1;
                                return (
                                  <div key={oi} className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${isCorrect ? 'bg-green-50 border-success/20 text-success' : 'bg-[#F9FAFB] border-[#E5E7EB] text-slate-600'}`}>
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${isCorrect ? 'bg-success text-white' : 'bg-white text-[#6B7280] border border-[#E5E7EB]'}`}>
                                      {String.fromCharCode(65 + oi)}
                                    </div>
                                    <div className="text-xs font-medium truncate" dangerouslySetInnerHTML={{ __html: opt }} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-[#6B7280]">
                                <Clock size={11} />
                                <span className="text-[11px] font-medium">{q.createdDate ? new Date(q.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[#6B7280]">
                                <BarChart3 size={11} />
                                <span className="text-[11px] font-medium">{q.usageCount || 0} uses</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {q.solution_eng && <span title="Has Solution"><BookOpen size={12} className="text-success" /></span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {
                filteredLibrary.length === 0 && !isDataLoading && (
                  <div className="py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-[#F9FAFB] rounded-2xl flex items-center justify-center mb-6 border border-[#E5E7EB]">
                      <Database size={32} className="text-[#6B7280] opacity-40" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">No Questions Found</h4>
                    <p className="text-sm text-[#6B7280] mt-1 max-w-sm">Create new questions or import them to get started.</p>
                  </div>
                )
              }

              {
                isDataLoading && (
                  <div className="py-32 flex flex-col items-center justify-center text-center">
                    <RefreshCw size={32} className="text-primary animate-spin mb-4" />
                    <p className="text-sm font-medium text-[#6B7280]">Loading questions...</p>
                  </div>
                )
              }
            </div>

          )}

          {activeTab === 'extract' && (
            <div className="p-4 overflow-y-auto h-full">
              <ExtractPanel onSaveQuestions={handleSaveExtractedQuestions} />
            </div>
          )}

          {activeTab === 'export' && (
            <div className="max-w-full mx-auto animate-in fade-in duration-500 h-full flex flex-col gap-4">
              {/* Export Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'pdf', label: 'PDF Document', icon: FileText, desc: 'Professional PDF with questions & answers', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                  { id: 'ppt', label: 'PowerPoint', icon: Presentation, desc: 'Presentation slides for classroom use', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                  { id: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet, desc: 'Excel-compatible data format', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                  { id: 'json', label: 'JSON Data', icon: FileJson, desc: 'Structured data for developers', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                ].map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id as any)}
                    className={`bg-white p-4 rounded-2xl border-2 transition-all text-left group hover:shadow-md ${exportFormat === format.id ? format.border + ' ' + format.bg + ' ring-2 ring-offset-2 ring-primary/20' : 'border-[#E5E7EB] hover:border-primary/30'}`}
                  >
                    <div className={`w-12 h-12 ${format.bg} ${format.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <format.icon size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{format.label}</h3>
                    <p className="text-xs text-[#6B7280] mt-1">{format.desc}</p>
                  </button>
                ))}
              </div>

              {/* Export Configuration Panel */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Settings2 size={18} className="text-primary" />
                    Export Configuration
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">{selectedIds.length > 0 ? selectedIds.length : library.length} questions ready</span>
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Filter by Subject */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6B7280]">Subject Filter</label>
                    <select
                      className="w-full h-9 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 text-sm outline-none focus:border-primary"
                      value={exportSubjectFilter}
                      onChange={(e) => setExportSubjectFilter(e.target.value)}
                    >
                      <option value="All">All Subjects</option>
                      {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>

                  {/* Filter by Difficulty */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6B7280]">Difficulty Filter</label>
                    <select
                      className="w-full h-9 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 text-sm outline-none focus:border-primary"
                      value={exportDifficultyFilter}
                      onChange={(e) => setExportDifficultyFilter(e.target.value)}
                    >
                      <option value="All">All Levels</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  {/* Language Preference */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6B7280]">Language Output</label>
                    <select
                      className="w-full h-9 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 text-sm outline-none focus:border-primary"
                      value={exportLanguage}
                      onChange={(e) => setExportLanguage(e.target.value as any)}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Bilingual">Bilingual</option>
                    </select>
                  </div>
                </div>

                {/* Export Options Checkboxes */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAnswers}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeAnswers: e.target.checked })}
                      className="w-4 h-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">Include Answers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSolutions}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeSolutions: e.target.checked })}
                      className="w-4 h-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">Include Solutions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.shuffleQuestions}
                      onChange={(e) => setExportOptions({ ...exportOptions, shuffleQuestions: e.target.checked })}
                      className="w-4 h-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">Shuffle Questions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.numberQuestions}
                      onChange={(e) => setExportOptions({ ...exportOptions, numberQuestions: e.target.checked })}
                      className="w-4 h-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">Number Questions</span>
                  </label>
                </div>

                {/* Question Count Selector */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-[#6B7280]">Questions to Export:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExportCount(Math.max(1, exportCount - 1))}
                      className="w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center hover:border-primary transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-bold text-slate-900">{exportCount}</span>
                    <button
                      onClick={() => setExportCount(Math.min(filteredExportQuestions.length, exportCount + 1))}
                      className="w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center hover:border-primary transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-[#6B7280]">of {filteredExportQuestions.length} available</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleExport}
                    disabled={isExporting || filteredExportQuestions.length === 0}
                    className="flex-1 h-11 bg-primary text-white rounded-[10px] font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isExporting ? (
                      <><RefreshCw size={18} className="animate-spin" /> Exporting...</>
                    ) : (
                      <><Download size={18} /> Export {exportCount} Questions as {exportFormat.toUpperCase()}</>
                    )}
                  </button>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={() => setSelectedIds([])}
                      className="h-11 px-4 bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] rounded-[10px] font-semibold hover:bg-white transition-all"
                    >
                      Clear Selection ({selectedIds.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Section */}
              {filteredExportQuestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Eye size={18} className="text-primary" />
                    Preview ({Math.min(exportCount, filteredExportQuestions.length)} questions)
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {filteredExportQuestions.slice(0, exportCount).map((q, i) => (
                      <div key={q.id} className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-primary/10 text-primary rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.question_eng }} />
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#6B7280]">{q.subject}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-600' : q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                {q.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {
            activeTab === 'sets' && (
              <div className="max-w-full mx-auto space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">Sets Studio</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Orchestration</p>
                  </div>
                  <button
                    onClick={handleCreateSet}
                    className="h-9 px-4 bg-primary text-white rounded-md font-black uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 text-[11px]"
                  >
                    <Plus size={16} /> New Set
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sets.map(set => (
                    <div
                      key={set.setId}
                      className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full overflow-hidden"
                    >
                      <div className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center border border-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                            <Presentation size={20} />
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight border ${set.status === 'public' ? 'bg-success/5 text-success border-success/10' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {set.status === 'public' ? 'Public' : 'Draft'}
                            </span>
                            {set.password && <Lock size={12} className="text-amber-500" />}
                          </div>
                        </div>

                        <h3 className="text-[14px] font-black text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-tight" title={set.name}>
                          {set.name}
                        </h3>

                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                          <span>{new Date(set.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-slate-800">• {set.questionIds?.length || 0} Assets</span>
                        </div>

                        <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {set.description || "Institutional assessment configuration for advanced academic protocols."}
                        </p>

                        {/* Set ID & Password */}
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-1.5 bg-[#F9FAFB] rounded-lg px-2.5 py-1.5 border border-[#E5E7EB]">
                            <Key size={11} className="text-[#6B7280] shrink-0" />
                            <span className="text-[10px] font-medium text-[#6B7280] shrink-0">ID:</span>
                            <span className="text-[10px] font-semibold text-slate-800 truncate flex-1 font-mono">{set.setId}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(set.setId); }}
                              className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-[#6B7280] hover:text-primary hover:bg-primary/5 transition-all"
                              title="Copy Set ID"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                          {set.password && (
                            <div className="flex items-center gap-1.5 bg-amber-50/50 rounded-lg px-2.5 py-1.5 border border-amber-100">
                              <Lock size={11} className="text-amber-500 shrink-0" />
                              <span className="text-[10px] font-medium text-amber-600 shrink-0">Pass:</span>
                              <span className="text-[10px] font-semibold text-amber-800 truncate flex-1 font-mono">{set.password}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(set.password!); }}
                                className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                                title="Copy Password"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setEditingSet(set);
                              setFilter('');
                              setSetWizardStep('details');
                              setWizardFilters(null);
                              setIsSetEditorOpen(true);
                            }}
                            className="h-8 rounded-md bg-white border border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-600 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit3 size={12} /> Refine
                          </button>
                          <button
                            onClick={() => setLaunchSetId(set.setId)}
                            className="h-8 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider hover:bg-primary transition-all flex items-center justify-center gap-1.5"
                          >
                            <Presentation size={12} /> Launch
                          </button>
                          <button
                            onClick={() => setExportSetId(set.setId)}
                            className="h-8 rounded-md bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-wider hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Download size={12} /> Export
                          </button>
                          <button
                            onClick={async () => { if (confirm('Terminate Set?')) { await storageService.deleteSet(set.setId); refreshSets(); } }}
                            className="h-8 rounded-md bg-error/5 text-error text-[9px] font-black uppercase tracking-wider hover:bg-error hover:text-white transition-all flex items-center justify-center gap-1.5"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sets.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
                      <Presentation size={32} className="text-slate-400 mb-4" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Studio Inactive</h4>
                      <p className="text-[10px] font-bold mt-1 uppercase">Initialize assessment node to begin</p>
                    </div>
                  )}
                </div>
              </div>
            )
          }


          {activeTab === 'answer' && <AnswerGenerator />}
          {activeTab === 'book' && <BookStudio />}
        </main >
      </div >

      {
        isSetEditorOpen && editingSet && (
          <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Studio Navigation Bar */}
            <header className="h-24 bg-slate-950 px-12 flex items-center justify-between shrink-0 shadow-2xl relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-2xl shadow-primary/20 border border-primary/30">
                  <FileJson size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight font-heading uppercase">Curation Studio</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Asset Assembly Protocol Active
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-10">
                {/* Progress Intelligence */}
                <div className="flex items-center gap-6 pr-10 border-r border-white/10">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Selected Assets</span>
                    <span className="text-2xl font-black text-white">{editingSet.questionIds?.length || 0} / <span className="text-slate-600 font-bold">{targetCount}</span></span>
                  </div>
                  <div className="w-48 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className={`h-full transition-all duration-700 relative z-10 ${(editingSet.questionIds?.length ?? 0) >= targetCount ? 'bg-success shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}
                      style={{ width: `${Math.min(100, ((editingSet.questionIds?.length || 0) / targetCount) * 100)}%` }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  </div>
                </div>

                <button
                  onClick={() => setIsSetEditorOpen(false)}
                  className="w-14 h-14 bg-white/5 text-slate-400 hover:bg-error hover:text-white transition-all rounded-[20px] flex items-center justify-center group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </header>

            <main className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
              {setWizardStep === 'details' && (
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
                  <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-primary/10 w-fit px-3 py-1 rounded-md border border-primary/10">
                          <span className="text-[8px] font-black text-primary uppercase tracking-widest">Step 01: Core Definition</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Set Architecture</h3>
                        <p className="text-sm font-bold text-slate-500 max-w-lg">Configure metadata and academic boundaries for this environment.</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-6 relative overflow-hidden shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Asset Count</span>
                            <span className="text-2xl font-black text-primary leading-none">{editingSet.questionIds?.length || 0}</span>
                          </div>
                          <div className="w-px h-8 bg-slate-100" />
                          <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center text-white">
                            <Layers size={20} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-8 space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Label <span className="text-error font-black">*</span></label>
                          <input
                            type="text"
                            className="w-full h-11 bg-white border border-slate-200 rounded-md px-4 font-bold text-slate-800 outline-none focus:border-primary transition-all text-sm placeholder:text-slate-300"
                            value={editingSet.name}
                            onChange={e => setEditingSet({ ...editingSet, name: e.target.value })}
                            placeholder="e.g. UPSC PRELIMS MOCK v2.0"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Summary</label>
                          <textarea
                            className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 font-medium text-slate-600 outline-none focus:border-primary transition-all min-h-[160px] resize-none text-sm placeholder:text-slate-300 leading-relaxed"
                            value={editingSet.description}
                            onChange={e => setEditingSet({ ...editingSet, description: e.target.value })}
                            placeholder="Provide institutional context and instructions..."
                          />
                        </div>
                      </div>

                      <div className="md:col-span-4 space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodicity</label>
                            <div className="relative">
                              <select
                                className="w-full h-10 bg-slate-50 border border-slate-100 rounded-md px-3 font-bold text-slate-800 outline-none focus:border-primary appearance-none cursor-pointer text-xs"
                                value={editingSet.category || 'Custom'}
                                onChange={e => setEditingSet({ ...editingSet, category: e.target.value as any })}
                              >
                                {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Domain</label>
                            <div className="relative">
                              <select
                                className="w-full h-10 bg-slate-50 border border-slate-100 rounded-md px-3 font-bold text-slate-800 outline-none focus:border-primary appearance-none cursor-pointer text-xs"
                                value={editingSet.subject || 'All Subjects'}
                                onChange={e => setEditingSet({ ...editingSet, subject: e.target.value })}
                              >
                                <option value="All Subjects">GLOBAL DOMAIN</option>
                                {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                            </div>
                          </div>

                          <button
                            onClick={() => setSetWizardStep('source')}
                            disabled={!editingSet.name}
                            className={`w-full h-10 rounded-md font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-xs ${editingSet.name ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                          >
                            Initialize Source <ChevronRight size={14} />
                          </button>
                        </div>

                        <div className="bg-slate-900 rounded-lg p-4 text-white relative overflow-hidden">
                          <Sparkles className="absolute -right-4 -top-4 text-primary/10" size={80} />
                          <div className="relative z-10 space-y-1.5">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-primary">Intelligence Guided</h4>
                            <p className="text-[11px] font-bold leading-relaxed opacity-70">Next: Connect to Global Repositories or AI Synthesis to populate this set.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {setWizardStep === 'source' && (
                <div className="flex-1 min-h-0 flex flex-col bg-slate-950 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-purple/5 pointer-events-none" />
                  <CascadingSelector
                    library={library}
                    onCancel={() => setSetWizardStep('details')}
                    onSelect={(filters) => {
                      setWizardFilters(filters);
                      if (filters.level2) {
                        if (filters.tab === 'exam') setExamFilter(filters.level2);
                        if (filters.tab === 'subject') setSubjectFilterState(filters.level2);
                      }
                      if (filters.level3) setYearFilter(filters.level3);
                      setSetWizardStep('questions');
                    }}
                  />
                </div>
              )}

              {setWizardStep === 'questions' && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-100/50">
                  {/* ADVANCED ORCHESTRATION BAR */}
                  {/* UNIFIED COMMAND DECK */}
                  <div className="shrink-0 z-20 bg-white border-b border-slate-200 shadow-sm sticky top-0">
                    {/* Row 1: Discovery & View Configuration */}
                    <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
                      {/* Search Module */}
                      {/* Search & Filter Modules */}
                      <div className="flex items-center gap-3 w-full max-w-[65%]">
                        <div className="relative group flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                          <input
                            type="text"
                            placeholder="Type to search..."
                            className="w-full h-8 pl-9 pr-3 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-md outline-none text-xs font-bold text-slate-700 transition-all placeholder:text-slate-400"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                          />
                        </div>

                        {/* Domain Filter */}
                        <div className="relative shrink-0">
                          <select
                            value={subjectFilterState}
                            onChange={(e) => setSubjectFilterState(e.target.value)}
                            className="h-8 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600 outline-none focus:border-primary/50 appearance-none cursor-pointer min-w-[130px]"
                          >
                            <option value="All">All Domains</option>
                            {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Exam Filter */}
                        <div className="relative shrink-0">
                          <select
                            value={examFilter}
                            onChange={(e) => setExamFilter(e.target.value)}
                            className="h-8 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600 outline-none focus:border-primary/50 appearance-none cursor-pointer min-w-[130px]"
                          >
                            <option value="All">All Exams</option>
                            {uniqueExams.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Year Filter */}
                        <div className="relative shrink-0">
                          <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="h-8 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600 outline-none focus:border-primary/50 appearance-none cursor-pointer min-w-[100px]"
                          >
                            <option value="All">Year</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Date Filter */}
                        <div className="relative shrink-0">
                          <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="h-8 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600 outline-none focus:border-primary/50 appearance-none cursor-pointer min-w-[110px]"
                          >
                            <option value="All">Date</option>
                            {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* View & Filter Controls */}
                      <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                          {(['Both', 'Hindi', 'English'] as const).map(l => (
                            <button
                              key={l}
                              onClick={() => setPickerLang(l)}
                              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${pickerLang === l ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              {l === 'Both' ? 'Bi' : l.slice(0, 2)}
                            </button>
                          ))}
                        </div>

                        <div className="w-px h-5 bg-slate-200" />

                        {/* Option Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                          {(['All', '4', '5'] as const).map(o => (
                            <button
                              key={o}
                              onClick={() => setPickerOptionsFilter(o)}
                              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${pickerOptionsFilter === o ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              {o === 'All' ? 'All' : o} Opts
                            </button>
                          ))}
                        </div>

                        <div className="w-px h-5 bg-slate-200" />

                        {/* View Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                          {[
                            { id: 'List', icon: List },
                            { id: 'Grid', icon: Layers },
                            { id: 'Single', icon: Presentation }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setPickerView(mode.id as any)}
                              className={`p-1.5 rounded-md transition-all ${pickerView === mode.id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                              title={mode.id}
                            >
                              <mode.icon size={14} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Operational Matrix */}
                    {/* Row 2: Operational Matrix */}
                    <div className="px-6 py-2.5 bg-slate-50/80 flex items-center justify-between gap-4 border-t border-slate-100">
                      <div className="flex items-center gap-6">
                        {/* Progress Meter */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Progress</span>
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="text-base font-black text-primary leading-none">{editingSet.questionIds?.length || 0}</span>
                              <span className="text-[9px] font-bold text-slate-400">/ {targetCount}</span>
                            </div>
                          </div>
                          {/* Target Select */}
                          <div className="flex bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
                            {(['50', '100', '200'] as const).map(t => (
                              <button
                                key={t}
                                onClick={() => setTargetCount(parseInt(t))}
                                className={`px-2 py-0.5 text-[9px] font-bold border-r last:border-r-0 border-slate-100 ${targetCount === parseInt(t) ? 'bg-slate-50 text-primary' : 'text-slate-400 hover:bg-slate-50'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="w-px h-6 bg-slate-200" />

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleSmartSelect('all')} className="h-7 px-3 bg-white border border-slate-200 hover:border-primary/50 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm">
                            <CheckCircle size={10} className="text-primary" /> Batch
                          </button>
                          <button onClick={() => handleSmartSelect('first', 50)} className="h-7 px-3 bg-white border border-slate-200 hover:border-primary/50 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm">
                            <ArrowDownCircle size={10} className="text-indigo-500" /> First 50
                          </button>
                          <button onClick={() => handleSmartSelect('random', 50)} className="h-7 px-3 bg-white border border-slate-200 hover:border-primary/50 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm">
                            <Sparkles size={10} className="text-accent-pink" /> AI Pick
                          </button>
                          <button onClick={() => setEditingSet({ ...editingSet, questionIds: [] })} className="h-7 w-7 bg-white border border-slate-200 text-error hover:bg-error hover:text-white rounded-md flex items-center justify-center transition-all shadow-sm" title="Purge">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Main Actions */}
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSetWizardStep('source')} className="h-8 px-4 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px] font-black uppercase tracking-wider transition-all">
                          Config
                        </button>
                        <button onClick={handleSaveSet} className="h-8 px-5 bg-slate-900 hover:bg-primary text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-slate-900/10 transition-all">
                          <Save size={12} /> Seal Set
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* HIGH-PRECISION CONTENT CANVAS */}
                  <div className="flex-1 overflow-y-auto bg-[#FAFAFA] px-6 py-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto h-full">
                      {(() => {
                        const filtered = setWizardFilteredQuestions;

                        if (filtered.length === 0) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center py-40 text-center opacity-30">
                              <Layers size={64} className="mb-6" />
                              <h4 className="text-xl font-black uppercase tracking-widest">No matching criteria</h4>
                              <p className="text-xs font-bold mt-2">Adjust your filters to expand the search results</p>
                            </div>
                          );
                        }

                        if (pickerView === 'Single') {
                          const q = filtered[singleViewIndex % filtered.length];
                          const isSelected = editingSet.questionIds?.includes(q.id);
                          return (
                            <div className="min-h-full flex flex-col items-center justify-start max-w-4xl mx-auto space-y-4 animate-in zoom-in-95 duration-500 py-4 pb-20">
                              {/* Compact Controller */}
                              <div className="flex items-center gap-4 w-full justify-between">
                                <button
                                  onClick={() => setSingleViewIndex(prev => (prev - 1 + filtered.length) % filtered.length)}
                                  className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-200"
                                >
                                  <ArrowLeft size={16} />
                                </button>

                                <div className="text-center">
                                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-white/10 mx-auto w-fit mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Focus: {singleViewIndex + 1} / {filtered.length}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setSingleViewIndex(prev => (prev + 1) % filtered.length)}
                                  className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-200"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>

                              <div
                                onClick={() => toggleSetQuestion(q.id)}
                                className={`w-full bg-white rounded-lg border p-6 shadow-md transition-all cursor-pointer relative overflow-hidden group/theater ${isSelected ? 'border-primary shadow-primary/5 bg-primary/[0.01]' : 'border-slate-100 hover:border-primary/20 hover:shadow-xl'}`}
                              >
                                {isSelected && (
                                  <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1.5 rounded-bl-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm animate-in slide-in-from-top-2">
                                    <CheckCircle size={12} /> ALIGNED
                                  </div>
                                )}

                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-slate-950 text-white text-[9px] font-black px-2 py-1 rounded border border-white/10 uppercase tracking-widest">{q.subject}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{q.exam || 'Archive'}</span>
                                    <span className="ml-auto text-[9px] font-bold text-slate-300 uppercase tracking-wider">{q.date || 'Generic'}</span>
                                  </div>

                                  <div className="space-y-3">
                                    {(pickerLang === 'Both' || pickerLang === 'Hindi') && q.question_hin && (
                                      <p className="text-lg font-black text-slate-900 leading-tight" dangerouslySetInnerHTML={{ __html: q.question_hin }} />
                                    )}
                                    {(pickerLang === 'Both' || pickerLang === 'English') && q.question_eng && (
                                      <p className={`${pickerLang === 'Both' ? 'text-sm font-bold text-slate-500 italic' : 'text-lg font-black text-slate-900'} leading-snug`} dangerouslySetInnerHTML={{ __html: q.question_eng }} />
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-100 relative">
                                    <div className="absolute -top-3 left-0 bg-white px-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">Responses</div>
                                    {[1, 2, 3, 4, 5].map(i => {
                                      const optH = (q as any)[`option${i}_hin`];
                                      const optE = (q as any)[`option${i}_eng`];
                                      if (!optH && !optE) return null;
                                      const isAns = q.answer === i.toString();

                                      if (pickerOptionsFilter !== 'All' && i > parseInt(pickerOptionsFilter)) return null;

                                      return (
                                        <div key={i} className={`px-4 py-3 rounded border flex items-center gap-4 transition-all ${isAns ? 'bg-success/5 border-success/20 text-success' : 'bg-slate-50 border-transparent text-slate-400 opacity-80'}`}>
                                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black shadow-sm ${isAns ? 'bg-success text-white' : 'bg-white text-slate-300'}`}>
                                            {String.fromCharCode(64 + i)}
                                          </div>
                                          <div className="flex-1 space-y-0.5">
                                            {(pickerLang === 'Both' || pickerLang === 'Hindi') && optH && <div className="font-bold text-sm text-slate-800" dangerouslySetInnerHTML={{ __html: optH }} />}
                                            {(pickerLang === 'Both' || pickerLang === 'English') && optE && <div className="text-xs font-medium opacity-70 italic" dangerouslySetInnerHTML={{ __html: optE }} />}
                                          </div>
                                          {isAns && <Check size={14} className="text-success" />}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className={pickerView === 'Grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20' : 'space-y-3 pb-20'}>
                            {filtered.map((q, idx) => {
                              const isSelected = editingSet.questionIds?.includes(q.id);
                              if (pickerView === 'Grid') {
                                return (
                                  <div
                                    key={q.id}
                                    onClick={() => toggleSetQuestion(q.id)}
                                    className={`bg-white rounded-lg border p-4 transition-all cursor-pointer group relative flex flex-col h-full shadow-sm ${isSelected ? 'border-primary bg-primary/[0.02]' : 'border-slate-200 hover:border-primary/20 hover:shadow-md'}`}
                                  >
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[8px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-widest">{q.subject}</span>
                                          {q.flagged && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          {(q.solution_eng || q.solution_hin) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Solved" />}
                                          {q.tags?.includes('video') && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Media" />}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setReportQuestion(q); }}
                                            className="w-7 h-7 rounded-md border border-slate-200 text-slate-300 flex items-center justify-center hover:bg-error/10 hover:text-error"
                                          >
                                            <AlertCircle size={14} />
                                          </button>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleFlag(q.id); }}
                                            className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all ml-1 ${q.flagged ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-slate-300 hover:bg-slate-50'}`}
                                          >
                                            <Flag size={12} fill={q.flagged ? 'currentColor' : 'none'} />
                                          </button>
                                        </div>
                                        <div className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-md' : 'border-slate-200 text-transparent group-hover:bg-slate-50'}`}>
                                          <Check size={16} strokeWidth={4} />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      {(pickerLang === 'Both' || pickerLang === 'Hindi') && q.question_hin && (
                                        <p className="text-sm font-bold text-slate-800 line-clamp-3 leading-snug" dangerouslySetInnerHTML={{ __html: q.question_hin }} />
                                      )}
                                      {(pickerLang === 'Both' || pickerLang === 'English') && q.question_eng && (
                                        <p className={`${pickerLang === 'Both' ? 'text-[11px] font-medium text-slate-400 italic' : 'text-sm font-bold text-slate-800'} line-clamp-3 leading-snug`} dangerouslySetInnerHTML={{ __html: q.question_eng }} />
                                      )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{q.date || 'Archives'}</span>
                                      <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                        ID_{idx + 1}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // List View (High Density)
                              return (
                                <div
                                  key={q.id}
                                  onClick={() => toggleSetQuestion(q.id)}
                                  className={`group bg-white rounded-lg border transition-all cursor-pointer p-3 flex items-start gap-4 shadow-sm ${isSelected ? 'border-primary bg-primary/[0.02]' : 'border-slate-200 hover:border-primary/20'}`}
                                >
                                  <div className="flex flex-col gap-2 shrink-0">
                                    <div className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-md' : 'border-slate-200 text-transparent group-hover:bg-slate-50'}`}>
                                      <Check size={16} strokeWidth={4} />
                                    </div>
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleFlag(q.id); }}
                                        className={`w-7 h-7 mx-auto rounded-md border flex items-center justify-center transition-all ${q.flagged ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-slate-300 hover:bg-slate-50'}`}
                                      >
                                        <Flag size={12} fill={q.flagged ? 'currentColor' : 'none'} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setReportQuestion(q); }}
                                        className="w-7 h-7 mx-auto rounded-md border border-slate-200 text-slate-300 flex items-center justify-center hover:bg-error/10 hover:text-error"
                                      >
                                        <AlertCircle size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                          {q.subject}
                                        </span>
                                        {q.topic && (
                                          <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200">
                                            {q.topic}
                                          </span>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                          {(q.solution_eng || q.solution_hin) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                          {q.tags?.includes('video') && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{q.date || 'Archives'}</span>
                                    </div>

                                    <div className="space-y-1 pr-6">
                                      {(pickerLang === 'Both' || pickerLang === 'Hindi') && q.question_hin && (
                                        <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: q.question_hin }} />
                                      )}
                                      {(pickerLang === 'Both' || pickerLang === 'English') && q.question_eng && (
                                        <p className={`${pickerLang === 'Both' ? 'text-[11px] font-medium text-slate-400 italic' : 'text-sm font-bold text-slate-800'} leading-snug line-clamp-2`} dangerouslySetInnerHTML={{ __html: q.question_eng }} />
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                      <Hash size={10} className="text-primary" />
                                      {q.id.substring(0, 12)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>
              )}
            </main>
          </div>
        )
      }

      {

      }
      {
        showBulkModal && (
          <BulkUploadModal
            onClose={() => setShowBulkModal(false)}
            onSuccess={() => {
              refreshLibrary();
              setShowBulkModal(false);
            }}
          />
        )
      }

      {
        reportQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-lg w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
              {/* Audit Header (Compact) */}
              <div className="bg-error p-6 text-white relative overflow-hidden">
                <AlertCircle className="absolute -right-6 -top-6 text-white/10" size={120} />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 bg-white/10 w-fit px-2.5 py-1 rounded-md border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Quality Control</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">Asset Audit</h3>
                    <p className="text-[10px] font-bold opacity-70 tracking-tight">ID: {reportQuestion.id.substring(0, 8)}...</p>
                  </div>
                  <button
                    onClick={() => setReportQuestion(null)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-md transition-all flex items-center justify-center border border-white/10"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Category Grid */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Discrepancy Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Syntax Error', value: 'Question Text' },
                      { label: 'Wrong Answer', value: 'Wrong Answer' },
                      { label: 'Solution Error', value: 'Solution Error' },
                      { label: 'Media Issue', value: 'Images/Media' },
                      { label: 'Translation', value: 'Translation Bias' },
                      { label: 'Tags Error', value: 'Incorrect Tags' }
                    ].map(item => (
                      <button
                        key={item.value}
                        onClick={() => setReportIssueType(item.value)}
                        className={`h-10 px-4 rounded-md text-[10px] font-black text-left transition-all border flex items-center justify-between ${reportIssueType === item.value ? 'bg-error/5 border-error/20 text-error' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                      >
                        <span className="uppercase tracking-wider">{item.label}</span>
                        <div className={`w-1.5 h-1.5 rounded-full transition-all ${reportIssueType === item.value ? 'bg-error' : 'bg-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Narrative</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-medium text-slate-700 outline-none focus:bg-white focus:border-error/30 transition-all min-h-[100px] resize-none text-sm placeholder:text-slate-300 leading-relaxed"
                    placeholder="Describe the issue..."
                    value={reportComment}
                    onChange={e => setReportComment(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Flag size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">QA Protocol</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setReportQuestion(null); setReportComment(''); }}
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      alert(`Audit Vector Submitted\nID: ${reportQuestion.id}\nCategory: ${reportIssueType}\nNarrative: ${reportComment}`);
                      setReportQuestion(null);
                      setReportComment('');
                    }}
                    className="h-9 px-5 bg-error text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm hover:bg-error/90 transition-all flex items-center gap-2"
                  >
                    Confirm <Check size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Topic Modal */}
      {
        editingTopicIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-md flex items-center justify-center">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Edit Topic</h3>
                    <p className="text-xs text-slate-500">Modify your custom topic</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditingTopicIndex(null); setEditingTopicValue(''); }}
                  className="w-8 h-8 rounded-md bg-slate-100 text-slate-400 hover:bg-error hover:text-white transition-all flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <label className="block text-sm font-bold text-slate-600 mb-2">Topic Name</label>
                <input
                  type="text"
                  value={editingTopicValue}
                  onChange={(e) => setEditingTopicValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTopicEdit()}
                  className="w-full h-12 px-4 border border-slate-200 rounded-md text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter topic name..."
                  autoFocus
                />
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => { setEditingTopicIndex(null); setEditingTopicValue(''); }}
                  className="h-10 px-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTopicEdit}
                  disabled={!editingTopicValue.trim()}
                  className="h-10 px-6 bg-primary text-white rounded-md text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Set Wizard Modal */}
      <SetWizard
        isOpen={isSetWizardOpen}
        onClose={() => setIsSetWizardOpen(false)}
        selectedQuestions={library.filter(q => selectedIds.includes(q.id))}
        onClearSelection={() => setSelectedIds([])}
      />
    </div >
  );
};
