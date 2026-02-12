import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import {
  Plus, Save, Trash2, CheckCircle, RefreshCw, Layers, BookOpen, Book, Search, Copy, Download, Upload, X,
  ArrowUp, ArrowDown, ArrowLeft, GripVertical, Presentation, Sparkles, AlertTriangle, Filter,
  Lightbulb, ExternalLink, Calendar, Languages, CheckSquare, Square, Tag, BarChart3, Edit3,
  Settings2, Trash, Database, FileJson, ChevronDown, Wand2, Globe, Settings, Clock, Bold,
  Italic, Underline as UnderlineIcon, List, ListOrdered, Type as TypeIcon, Undo, Redo,
  ChevronRight, Hash, FilterX, Check, Image as ImageIcon, Eraser, Heading1, Heading2,
  CircleDot, Circle, Lock, Key, Share2, Flag, Printer, AlertCircle, Bell, User, ArrowDownCircle, Star
} from 'lucide-react';
import { InputPanel, InputMode, InputData } from './QuestionGeneration/InputPanel';
import { AutoDetectionFeedback } from './QuestionGeneration/AutoDetectionFeedback';
import { AnswerGenerator } from './AnswerGenerator';
import { BookStudio } from './BookStudio/BookStudio';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { SubjectSpecificPanel } from './SubjectSpecificPanel';
import { SetWizard } from './SetWizard';
import { storageService } from '../services/storageService';
import { geminiService, CURRENT_AFFAIRS_CATEGORIES } from '../services/geminiService';
import { aiOrchestrator, availableModels, AIModelConfig } from '../services/aiOrchestrator';
import { Question, QuestionSet, Difficulty, QuestionType, GenerateParams } from '../types';
import { BulkUploadModal } from './BulkUploadModal';
import { Button } from './Button';

// Expose storageService for console usage/seeding
if (typeof window !== 'undefined') {
  (window as any).storageService = storageService;
}

interface CreatorDashboardProps {
  onLaunchPresentation?: (setId: string) => void;
  onLaunchPDF?: (setId: string) => void;
  onLaunchRefine?: (questionId: string) => void;
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

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ onLaunchPresentation, onLaunchPDF, onLaunchRefine }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'sets' | 'answer' | 'book'>('library');
  const [viewLanguage, setViewLanguage] = useState<'English' | 'Hindi' | 'Bilingual'>('Bilingual');

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
    const saved = localStorage.getItem('q-bank-custom-topics');
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
    refreshLibrary();
    refreshSets();
  }, []);

  useEffect(() => {
    fetchTopicSuggestions();
  }, [genParams.subject]);

  const refreshLibrary = async () => {
    setIsDataLoading(true);
    const data = await storageService.getQuestions();
    setLibrary(data);
    setIsDataLoading(false);
  };

  const refreshSets = async () => {
    const data = await storageService.getSets();
    setSets(data);
  };

  const fetchTopicSuggestions = async () => {
    const topics = await geminiService.suggestTopics(genParams.subject);
    setSuggestedTopics(topics);
    if (topics.length > 0 && !genParams.topic) {
      setGenParams(prev => ({ ...prev, topic: topics[0] }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setIsDataLoading(true);
    try {
      await storageService.saveQuestion(editingQuestion);
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
    if (!q) return;
    const updated = { ...q, flagged: !q.flagged };
    await storageService.saveQuestion(updated);
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
    setIsDataLoading(true);
    try {
      await storageService.saveQuestionsBulk(questions);
      await refreshLibrary();
      setShowBulkModal(false);
    } catch (error) {
      console.error("Bulk synchronization failure:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleBulkAction = async (updates: Partial<Question>) => {
    if (selectedIds.length === 0) return;
    setIsDataLoading(true);
    try {
      await storageService.updateQuestionsBulk(selectedIds, updates);
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
    try {
      await storageService.deleteQuestionsBulk(selectedIds);
      setSelectedIds([]);
      await refreshLibrary();
    } catch (e) {
      console.error("Asset decommissioning failure:", e);
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
          await storageService.saveQuestionsBulk(newQs as Question[]);
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
          setIsDataLoading(true);
          await storageService.saveQuestionsBulk(qs);
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
    setIsDataLoading(true);
    await storageService.saveQuestionsBulk(generatedQuestions);
    setGeneratedQuestions([]);
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
        matchDate && matchChapter && matchTopic && matchSection && matchCollection &&
        matchTags && matchAI && matchFlagged;
    });
  }, [library, filter, difficultyFilter, languageFilter, subjectFilterState, examFilter, yearFilter,
    dateFilter, chapterFilter, topicFilter, sectionFilter, collectionFilter, tagsFilter, aiGeneratedFilter, flaggedFilter]);

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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden page-fade-in selection:bg-primary/20">
      {/* 1. CINEMATIC ORCHESTRATION SIDEBAR */}
      <aside className="w-[220px] bg-slate-950 flex flex-col shrink-0 relative z-50 overflow-hidden shadow-2xl border-r border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />

        {/* Branding (Compact) */}
        <div className="p-4 pb-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent-pink to-accent-purple" />
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-indigo-600 to-accent-purple rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight leading-none font-heading uppercase">Q-Bank <span className="text-primary">PRO</span></h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Institutional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Matrix (Compact) */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto no-scrollbar py-2">
          {[
            { id: 'library', label: 'Global Inventory', icon: Database, color: 'primary', desc: 'Repository' },
            { id: 'generate', label: 'Intelligence Lab', icon: Sparkles, color: 'accent-pink', desc: 'AI Synthesis' },
            { id: 'sets', label: 'Curation Studio', icon: FileJson, color: 'accent-purple', desc: 'Exam Packages' },
            { id: 'answer', label: 'AI Answer', icon: CheckCircle, color: 'warning', desc: 'Deep Analysis' },
            { id: 'book', label: 'AI Book', icon: BookOpen, color: 'indigo-500', desc: 'Content Gen' },
            { id: 'analytics', label: 'Scoreboard', icon: BarChart3, color: 'success', desc: 'Analytics' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'analytics') return;
                setActiveTab(item.id as any);
                setSelectedIds([]);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 relative group overflow-hidden ${activeTab === item.id
                ? 'bg-white/10 text-white shadow-md border border-white/10'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
            >
              <div className={`transition-all duration-300 relative z-10 ${activeTab === item.id ? 'scale-100 text-primary' : 'group-hover:text-white'}`}>
                <item.icon size={14} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              </div>
              <div className="text-left relative z-10 flex-1">
                <span className={`text-[10px] font-black tracking-wider uppercase block ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{item.label}</span>
                {activeTab === item.id && <span className="text-[7px] font-bold text-primary/80 uppercase tracking-widest mt-0 animate-in slide-in-from-left-2">{item.desc}</span>}
              </div>
              {activeTab === item.id && (
                <div className="absolute right-2 flex items-center gap-1">
                  <div className="w-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_rgba(79,70,229,1)] animate-ping" />
                  <div className="w-0.5 h-0.5 rounded-full bg-primary" />
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Institutional Identity Card (Compact) */}
        <div className="p-2 relative">
          <div className="absolute top-0 left-4 right-4 h-px bg-white/5" />
          <div className="mt-2 bg-white/5 border border-white/5 rounded-lg p-2 group hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-primary font-black text-[10px] shadow-lg">AA</div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-white truncate uppercase tracking-tight">Angel Admin</p>
              <p className="text-[7px] font-bold text-primary uppercase tracking-widest">Institutional</p>
            </div>
            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <Settings size={12} />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. DYNAMIC WORKSPACE HUB */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#F8FAFC]">
        {/* Command Bar (Compact: 56px) */}
        <header className="h-10 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">
                {activeTab === 'library' ? 'Inventory' : activeTab === 'generate' ? 'AI Lab' : activeTab === 'answer' ? 'Answer Studio' : activeTab === 'book' ? 'Book Architect' : 'Studio'}
              </h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Protocol: {activeTab === 'library' ? 'Assets' : activeTab === 'generate' ? 'Synthesis' : activeTab === 'answer' ? 'Analysis' : activeTab === 'book' ? 'Creation' : 'Orchestration'}
              </p>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-2 hidden lg:block" />

            <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Database size={14} className="text-primary" />
              <span className="text-[10px] font-black text-slate-700 uppercase">{library.length} Elements</span>
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center relative shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error border-2 border-white rounded-full" />
            </button>
            <button className="h-9 px-3 rounded-lg bg-slate-950 text-white flex items-center gap-3 hover:bg-slate-800 transition-all shadow-md group">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all text-xs font-bold">
                A
              </div>
              <span className="text-[11px] font-bold uppercase tracking-tight hidden sm:block">Admin</span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
          {activeTab === 'library' && (
            <div className="max-w-full mx-auto space-y-4 animate-in fade-in duration-500">
              {/* Stats Architecture (Compact) */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Global Inventory', value: library.length, icon: Database, color: 'text-primary', bg: 'bg-primary/5', detail: 'Verified Assets' },
                  { label: 'Curated Sets', value: sets.length, icon: FileJson, color: 'text-indigo-600', bg: 'bg-indigo-50', detail: 'Packages' },
                  { label: 'Utilizations', value: library.reduce((acc, q) => acc + (q.usageCount || 0), 0), icon: BarChart3, color: 'text-success', bg: 'bg-success/5', detail: 'Impact' },
                  { label: 'Sync Score', value: '4.9', icon: Sparkles, color: 'text-warning', bg: 'bg-warning/5', detail: 'Fidelity' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-start gap-4">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-md flex items-center justify-center border border-slate-100 shrink-0`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{stat.label}</p>
                      <h3 className="text-xl font-black text-slate-900 leading-none mt-1">{stat.value}</h3>
                      <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{stat.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Command Matrix (Compact) */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm sticky top-16 z-30 animate-in fade-in duration-500 overflow-hidden">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  {/* Search Asset Node */}
                  <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={14} />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      className="w-full h-9 pl-9 pr-3 bg-transparent outline-none text-[12px] font-medium text-slate-700 placeholder:text-slate-300"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>

                  {/* Actions Matrix */}
                  <div className="flex items-center gap-1.5 p-1.5 bg-slate-50/30">
                    <button
                      onClick={toggleSelectAll}
                      className={`h-8 px-4 rounded-md border flex items-center gap-2 transition-all text-[11px] font-black uppercase tracking-wider ${selectedIds.length === filteredLibrary.length && filteredLibrary.length > 0 ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                      {selectedIds.length === filteredLibrary.length && filteredLibrary.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                      {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}
                    </button>

                    <div className="w-px h-5 bg-slate-200 mx-1" />

                    <button onClick={handleManualCreate} className="h-7 px-3 bg-slate-950 text-white rounded-md font-black uppercase tracking-wider hover:bg-primary transition-all flex items-center gap-1 text-[10px]">
                      <Plus size={12} /> Init
                    </button>

                    <button onClick={() => setShowBulkModal(true)} className="h-7 px-2 bg-white border border-slate-200 text-slate-600 rounded-md font-black uppercase tracking-wider hover:border-primary/30 transition-all flex items-center gap-1 text-[10px]">
                      <Upload size={12} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Filters Matrix (Compact) */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 mt-3">
                {[
                  { val: languageFilter, set: setLanguageFilter, label: 'Syntax', options: LANGUAGES },
                  { val: difficultyFilter, set: setDifficultyFilter, label: 'Quality', options: ['Easy', 'Medium', 'Hard', 'Expert'] },
                  { val: subjectFilterState, set: setSubjectFilterState, label: 'Domain', options: uniqueSubjects },
                  { val: examFilter, set: setExamFilter, label: 'Focus', options: uniqueExams },
                ].map((f, i) => (
                  <div key={i} className="relative shrink-0">
                    <select
                      className="h-8 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md px-2 text-[10px] font-bold uppercase tracking-tight text-slate-600 appearance-none cursor-pointer outline-none min-w-[120px] pr-6 transition-all"
                      value={f.val}
                      onChange={(e) => f.set(e.target.value)}
                    >
                      <option value="All">{f.label}: Global</option>
                      {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                ))}
                <button onClick={refreshLibrary} className="h-9 w-9 shrink-0 rounded-md border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all flex items-center justify-center">
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
                <div className="bg-gradient-to-r from-red-50 to-primary/5 p-4 rounded-xl border border-red-200 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-500 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                        <Trash2 size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-red-600 uppercase tracking-tight">{selectedIds.length} Questions Selected</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{selectedIds.length} प्रश्न चुने गए • Bulk Actions Ready</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedIds([])}
                        className="h-10 px-4 bg-white border border-slate-200 text-slate-500 rounded-lg text-[11px] font-bold uppercase transition-all hover:bg-slate-50 flex items-center gap-2"
                      >
                        <X size={14} />
                        Clear Selection
                      </button>
                      <button
                        onClick={() => setShowBulkEdit(!showBulkEdit)}
                        className={`h-10 px-5 rounded-lg text-[11px] font-black uppercase cursor-pointer transition-all flex items-center gap-2 ${showBulkEdit ? 'bg-primary text-white shadow-md' : 'bg-white border border-primary/30 text-primary hover:bg-primary/5'}`}
                      >
                        <Edit3 size={14} />
                        {showBulkEdit ? 'Close Edit' : 'Bulk Edit'}
                      </button>
                      <button
                        onClick={() => setIsSetWizardOpen(true)}
                        className="h-10 px-5 bg-indigo-600 text-white rounded-lg text-[11px] font-black uppercase transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 shadow-md"
                      >
                        <FileJson size={14} />
                        Create Set
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="h-10 px-6 bg-red-500 text-white rounded-lg text-[12px] font-black uppercase transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 flex items-center gap-2 shadow-md"
                      >
                        <Trash2 size={16} />
                        Delete {selectedIds.length} Questions
                      </button>
                    </div>
                  </div>

                  {showBulkEdit && (
                    <div className="pt-3 border-t border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-500">
                      {[
                        { label: 'Syntax', options: LANGUAGES, key: 'language' },
                        { label: 'Domain', options: SUBJECTS, key: 'subject' },
                        { label: 'Quality', options: ['Easy', 'Medium', 'Hard', 'Expert'], key: 'difficulty' }
                      ].map(field => (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[9px] font-black text-primary/40 uppercase tracking-widest ml-1">{field.label}</label>
                          <div className="relative">
                            <select
                              className="w-full h-8 bg-white border border-primary/10 rounded-md px-3 text-[11px] font-bold text-slate-700 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                              onChange={(e) => e.target.value && handleBulkAction({ [field.key]: e.target.value } as any)}
                              defaultValue=""
                            >
                              <option value="" disabled>Set {field.key}...</option>
                              {field.options.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30 pointer-events-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Global Asset Stream (High Density Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLibrary.map(q => {
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <div key={q.id} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative mb-2">
                      <div className="flex items-start gap-2">
                        {/* Status Indicator / Select Checkbox */}
                        <div className="pt-1 select-none">
                          <label className="relative flex items-center justify-center w-4 h-4 cursor-pointer">
                            <input
                              type="checkbox"
                              className="peer appearance-none w-4 h-4 border-2 border-slate-200 rounded text-primary focus:ring-0 checked:bg-primary checked:border-primary transition-all"
                              checked={isSelected}
                              onChange={() => toggleSelect(q.id)}
                            />
                            <Check className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                          </label>
                        </div>

                        {/* Card Body */}
                        <div className="flex-1 min-w-0">
                          {/* Header Line */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{q.subject?.substring(0, 12)}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                {q.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); if (onLaunchRefine) onLaunchRefine(q.id); }}
                                className="w-6 h-6 rounded-md bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-white hover:text-primary hover:border-primary/30 transition-all"
                                title="Edit Question"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("🗑️ Delete this question permanently?\n\nइस प्रश्न को स्थायी रूप से हटाएं?")) {
                                    await storageService.deleteQuestion(q.id);
                                    refreshLibrary();
                                  }
                                }}
                                className="w-6 h-6 rounded-md bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-white hover:text-error hover:border-error/30 transition-all"
                                title="Delete Question"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Question Content */}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div>
                              <div className="text-[10px] font-bold text-slate-900 leading-tight line-clamp-3 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.question_eng }} />
                              {q.question_hin && <div className="text-[9px] font-medium text-slate-400 italic line-clamp-1 mt-0.5" dangerouslySetInnerHTML={{ __html: q.question_hin }} />}
                            </div>

                            <div className="grid grid-cols-1 gap-1">
                              {[q.option1_eng, q.option2_eng, q.option3_eng, q.option4_eng].map((opt, oi) => {
                                const isCorrect = parseInt(q.answer) === oi + 1;
                                return (
                                  <div key={oi} className={`px-2 py-1 rounded-md border transition-all flex items-center gap-2 ${isCorrect ? 'bg-success/5 border-success/20 text-success' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                                    <div className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-black shrink-0 ${isCorrect ? 'bg-success text-white' : 'bg-white text-slate-300 border border-slate-200'}`}>
                                      {String.fromCharCode(65 + oi)}
                                    </div>
                                    <div className="text-[9px] font-bold truncate" dangerouslySetInnerHTML={{ __html: opt }} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Footer Metadata */}
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Clock size={10} className="text-slate-300" />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{q.createdDate ? new Date(q.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Old'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-300">
                                <BarChart3 size={10} />
                                <span className="text-[8px] font-bold uppercase">{q.usageCount || 0} Uses</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {q.solution_eng && <span title="Verified Logic"><BookOpen size={10} className="text-success" /></span>}
                              {/* Remove AI synthesis icon if not needed or make smaller */}
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
                  <div className="py-40 flex flex-col items-center justify-center text-center opacity-20">
                    <div className="w-32 h-32 bg-slate-100 rounded-[48px] flex items-center justify-center mb-8 border-4 border-dashed border-slate-300">
                      <Layers size={64} className="text-slate-400" />
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-[0.3em] font-heading">Repository Cold</h4>
                    <p className="text-xs font-bold mt-2">Initialize new assets or synchronize batch imports to begin</p>
                  </div>
                )
              }

              {
                isDataLoading && (
                  <div className="py-40 flex flex-col items-center justify-center text-center">
                    <RefreshCw size={48} className="text-primary animate-spin mb-6" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Asset Data...</p>
                  </div>
                )
              }
            </div>

          )}

          {activeTab === 'generate' && (
            <div className="max-w-full mx-auto animate-in fade-in duration-500 h-full flex flex-col gap-3">
              {/* SPLIT LAYOUT CONTAINER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">

                {/* LEFT COLUMN: CONTROL & INPUT (TOOLS) - 40% */}
                <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pb-10">

                  {/* 1. COMPACT TOOLBAR */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm shrink-0 flex flex-col gap-3 sticky top-0 z-20">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Context */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 h-10 flex-1 min-w-[140px]">
                        <Book size={14} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Context</span>
                          <select
                            className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
                            value={genParams.subject}
                            onChange={(e) => setGenParams({ ...genParams, subject: e.target.value, topic: '' })}
                          >
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Model */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 h-10 w-32">
                        <div className="flex flex-col w-full">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Model</span>
                          <select
                            className="bg-transparent text-[10px] font-bold text-indigo-600 outline-none cursor-pointer w-full"
                            value={availableModels.findIndex(m => m.modelId === selectedAIModel.modelId)}
                            onChange={e => setSelectedAIModel(availableModels[parseInt(e.target.value)])}
                          >
                            {availableModels.map((model, idx) => (
                              <option key={model.modelId} value={idx}>{model.displayName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Params Row */}
                    <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">

                      {/* Left: Input Parameters */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col w-12">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-0.5">Qty</span>
                          <input
                            type="number"
                            min={1} max={50}
                            className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[10px] font-bold text-slate-800 outline-none focus:border-primary transition-all text-center"
                            value={genParams.count}
                            onChange={e => setGenParams({ ...genParams, count: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="flex flex-col w-24">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-0.5">Level</span>
                          <select
                            className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[10px] font-bold text-slate-800 outline-none focus:border-primary transition-all cursor-pointer"
                            value={genParams.difficulty}
                            onChange={e => setGenParams({ ...genParams, difficulty: e.target.value as any })}
                          >
                            {['Easy', 'Medium', 'Hard', 'Expert'].map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col w-24">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-0.5">Lang</span>
                          <select
                            className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[10px] font-bold text-slate-800 outline-none focus:border-primary transition-all cursor-pointer"
                            value={genParams.language}
                            onChange={e => setGenParams({ ...genParams, language: e.target.value })}
                          >
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button
                          onClick={() => setOutputFormat(outputFormat === 'html' ? 'plain' : 'html')}
                          className={`h-8 px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1.5 text-[8px] border shrink-0 ${outputFormat === 'html'
                            ? 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                          title="Toggle output format: Rich HTML vs Plain Text"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${outputFormat === 'html' ? 'bg-purple-500' : 'bg-slate-300'}`} />
                          {outputFormat === 'html' ? 'HTML' : 'TXT'}
                        </button>

                        <button
                          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                          className={`h-8 px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center gap-1.5 text-[8px] border shrink-0 ${autoSaveEnabled
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                          title="Auto-Save to Database"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${autoSaveEnabled ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                          {autoSaveEnabled ? 'Save ON' : 'Save OFF'}
                        </button>

                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="h-8 pl-3 pr-4 bg-slate-900 text-white rounded-lg font-black uppercase tracking-wider hover:bg-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-[9px] shadow-lg shadow-slate-900/20 shrink-0"
                        >
                          {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} className="text-primary" />}
                          {isGenerating ? 'Running...' : 'Generate'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. CONFIGURATION PANEL */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
                    <SubjectSpecificPanel
                      subject={genParams.subject}
                      onParamsChange={(params) => {
                        setGenParams({
                          ...genParams,
                          ...params,
                          topic: params.topic || params.category || genParams.topic
                        });
                      }}
                    />
                  </div>

                  {/* 3. INPUT CANVAS */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[200px] shrink-0">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={12} /> Source Material
                      </label>
                      <AutoDetectionFeedback
                        mode={inputMode}
                        data={inputData}
                        detectedTopic={genParams.topic}
                        isAnalysing={false}
                      />
                    </div>
                    <InputPanel
                      onInputChange={handleInputChange}
                      className="border-0 shadow-none p-0"
                      onGenerate={handleGenerate}
                      isGenerating={isGenerating}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: RESULTS (OUTPUT) - 60% */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-0 bg-slate-100/50 rounded-2xl border border-slate-200/60 overflow-hidden relative">

                  {/* Result Header */}
                  <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${generatedQuestions.length > 0 ? 'bg-success animate-pulse' : 'bg-slate-300'}`} />
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">Intelligence Output</h3>
                      {generatedQuestions.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 border border-slate-200">
                          {generatedQuestions.length} Items
                        </span>
                      )}
                    </div>

                    {generatedQuestions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 rounded p-0.5 border border-slate-200">
                          {['English', 'Hindi', 'Bilingual'].map(lang => (
                            <button
                              key={lang}
                              onClick={() => setViewLanguage(lang as any)}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${viewLanguage === lang ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              {lang === 'Bilingual' ? 'Mix' : lang}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => { if (confirm("Clear results?")) setGeneratedQuestions([]); }}
                          className="p-1.5 text-slate-400 hover:text-error hover:bg-error/5 rounded-md transition-all"
                          title="Discard"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={handleSaveGenerated}
                          className="h-7 px-3 bg-primary text-white rounded-md text-[9px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Save size={12} /> Save
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
                    {generatedQuestions.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none select-none">
                        <Sparkles size={48} className="mb-4 opacity-50" />
                        <p className="text-sm font-black uppercase tracking-widest opacity-60">Ready to Generate</p>
                        <p className="text-[10px] font-medium max-w-[200px] text-center mt-2 opacity-50">Configure your parameters on the left and click Initialize.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {generatedQuestions.map((q, i) => (
                          <div key={q.id || i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                            <button
                              onClick={() => { if (onLaunchRefine) onLaunchRefine(q.id); }}
                              className="absolute top-2 right-2 w-5 h-5 bg-slate-50 text-slate-400 rounded-md border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-primary hover:border-primary/30"
                              title="Edit in Studio"
                            >
                              <Edit3 size={10} />
                            </button>


                            <div className="mb-2 pr-6">
                              <span className="inline-block text-[8px] font-black text-primary uppercase tracking-widest mb-1.5 opacity-50">#{i + 1}</span>
                              {(viewLanguage === 'English' || viewLanguage === 'Bilingual') && (
                                outputFormat === 'html' ? (
                                  <div className="text-[11px] font-bold text-slate-800 leading-snug" dangerouslySetInnerHTML={{ __html: q.question_eng }} />
                                ) : (
                                  <div className="text-[11px] font-bold text-slate-800 leading-snug">{stripHTML(q.question_eng)}</div>
                                )
                              )}
                              {(viewLanguage === 'Hindi' || viewLanguage === 'Bilingual') && q.question_hin && (
                                outputFormat === 'html' ? (
                                  <div className={`font-medium text-slate-600 leading-snug mt-1 ${viewLanguage === 'Hindi' ? 'text-[11px] font-bold text-slate-800' : 'text-[10px] italic'}`} dangerouslySetInnerHTML={{ __html: q.question_hin }} />
                                ) : (
                                  <div className={`font-medium text-slate-600 leading-snug mt-1 ${viewLanguage === 'Hindi' ? 'text-[11px] font-bold text-slate-800' : 'text-[10px] italic'}`}>{stripHTML(q.question_hin)}</div>
                                )
                              )}
                            </div>

                            <div className="space-y-1.5">
                              {[
                                { e: q.option1_eng, h: q.option1_hin },
                                { e: q.option2_eng, h: q.option2_hin },
                                { e: q.option3_eng, h: q.option3_hin },
                                { e: q.option4_eng, h: q.option4_hin }
                              ].map((opt, oi) => (
                                <div key={oi} className={`px-2 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${parseInt(q.answer) === oi + 1 ? 'bg-success/5 border-success/30' : 'bg-slate-50/50 border-slate-100'}`}>
                                  <div className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${parseInt(q.answer) === oi + 1 ? 'bg-success text-white shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                                    {String.fromCharCode(65 + oi)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {(viewLanguage === 'English' || viewLanguage === 'Bilingual') && (
                                      outputFormat === 'html' ? (
                                        <div className="text-[9px] font-bold text-slate-700 truncate" dangerouslySetInnerHTML={{ __html: opt.e }} />
                                      ) : (
                                        <div className="text-[9px] font-bold text-slate-700 truncate">{stripHTML(opt.e)}</div>
                                      )
                                    )}
                                    {(viewLanguage === 'Hindi' || viewLanguage === 'Bilingual') && opt.h && (
                                      outputFormat === 'html' ? (
                                        <div className={`truncate ${viewLanguage === 'Hindi' ? 'text-[9px] font-bold text-slate-700' : 'text-[8px] font-medium text-slate-500 italic'}`} dangerouslySetInnerHTML={{ __html: opt.h }} />
                                      ) : (
                                        <div className={`truncate ${viewLanguage === 'Hindi' ? 'text-[9px] font-bold text-slate-700' : 'text-[8px] font-medium text-slate-500 italic'}`}>{stripHTML(opt.h)}</div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {q.sources && q.sources.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">Source</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {q.sources.map((source: any, idx: number) => {
                                    const colorClass =
                                      source.credibility === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' :
                                        source.credibility === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' :
                                          'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100';

                                    return (
                                      <a
                                        key={idx}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group/link flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold transition-all no-underline ${colorClass}`}
                                        title={source.title}
                                      >
                                        <div className={`w-1.5 h-1.5 rounded-full ${source.credibility === 'High' ? 'bg-emerald-500' : source.credibility === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                        <span className="truncate max-w-[80px] group-hover/link:max-w-[200px] transition-all duration-300">{source.title}</span>
                                        <ExternalLink size={8} className="opacity-50 group-hover/link:opacity-100" />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
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

                        <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed mb-4">
                          {set.description || "Institutional assessment configuration for advanced academic protocols."}
                        </p>

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
                            onClick={() => onLaunchPresentation?.(set.setId)}
                            className="h-8 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider hover:bg-primary transition-all flex items-center justify-center gap-1.5"
                          >
                            <Presentation size={12} /> Launch
                          </button>
                          <button
                            onClick={() => onLaunchPDF?.(set.setId)}
                            className="h-8 rounded-md bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-wider hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Printer size={12} /> Export
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
                      className={`h-full transition-all duration-700 relative z-10 ${editingSet.questionIds?.length >= targetCount ? 'bg-success shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}
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
