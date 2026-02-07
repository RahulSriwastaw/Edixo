import React, { useState } from 'react';
import { CreatorDashboard } from './components/CreatorDashboard';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';
import { ToolsDashboard } from './components/Tools/ToolsDashboard';
import { BuilderLayout } from './components/PaperBuilder/BuilderLayout';
import { PDFStudio } from './components/PDFStudio';
import { RefinementStudio } from './components/RefinementStudio';
import { Button } from './components/Button';
import {
  Layers, Presentation, Sparkles, Zap, ShieldCheck,
  Wrench, ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  // Simple router based on URL params
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const setIdParam = params.get('setId');

    if (viewParam === 'student' && setIdParam) return { view: 'student' as const, setId: setIdParam };
    if (viewParam === 'teacher' && setIdParam) return { view: 'teacher' as const, setId: setIdParam };
    if (viewParam === 'student') return { view: 'student' as const, setId: null };
    if (viewParam === 'teacher') return { view: 'teacher' as const, setId: null };
    if (viewParam === 'creator') return { view: 'creator' as const, setId: null };
    if (viewParam === 'pdf' && setIdParam) return { view: 'pdf' as const, setId: setIdParam };
    if (viewParam === 'tools') return { view: 'tools' as const, setId: null };
    if (viewParam === 'paper-builder') return { view: 'paper-builder' as const, setId: null };
    if (viewParam === 'paper-builder') return { view: 'paper-builder' as const, setId: null };
    if (viewParam === 'ppt-generator') return { view: 'ppt-generator' as const, setId: null };
    if (viewParam === 'refinement-studio') return { view: 'refinement-studio' as const, setId: setIdParam || null };

    return { view: 'landing' as const, setId: null };
  };

  const initial = getInitialState();
  const defaultView = initial.view;
  const [view, setView] = useState<'landing' | 'creator' | 'teacher' | 'student' | 'pdf' | 'tools' | 'paper-builder' | 'ppt-generator' | 'refinement-studio'>(defaultView);
  const [presentationSetId, setPresentationSetId] = useState<string | null>(initial.setId);

  // Handle Browser Back/Forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const state = getInitialState();
      setView(state.view);
      setPresentationSetId(state.setId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL function (optional, to keep URL in sync)
  const updateUrl = (newView: string, id?: string | null) => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    if (id) url.searchParams.set('setId', id);
    else url.searchParams.delete('setId');
    window.history.pushState({}, '', url);
  };

  const handleLaunchPresentation = (setId: string) => {
    setPresentationSetId(setId);
    setView('teacher');
    updateUrl('teacher', setId);
  };

  const handleNavigate = (newView: 'landing' | 'creator' | 'teacher' | 'student' | 'pdf' | 'tools' | 'paper-builder' | 'ppt-generator' | 'refinement-studio', id?: string) => {
    setView(newView);
    updateUrl(newView, id);
    setPresentationSetId(id || null);
  };

  if (view === 'creator') {
    return (
      <CreatorDashboard
        onLaunchPresentation={handleLaunchPresentation}
        onLaunchPDF={(setId) => handleNavigate('pdf', setId)}
        onLaunchRefine={(qId) => handleNavigate('refinement-studio', qId)}
      />
    );
  }

  if (view === 'teacher') {
    return (
      <TeacherView
        initialSetId={presentationSetId || undefined}
        onExit={() => handleNavigate('landing')}
      />
    );
  }

  if (view === 'student') {
    return (
      <StudentView
        onExit={() => handleNavigate('landing')}
        initialSetId={presentationSetId || undefined}
      />
    );
  }

  if (view === 'pdf') {
    return (
      <PDFStudio
        initialSetId={presentationSetId}
        onExit={() => handleNavigate('creator')}
      />
    );
  }

  if (view === 'tools') {
    return (
      <ToolsDashboard
        onExit={() => handleNavigate('landing')}
      />
    );
  }

  if (view === 'paper-builder') {
    return (
      <BuilderLayout />
    );
  }

  if (view === 'ppt-generator') {
    return (
      <ToolsDashboard
        onExit={() => handleNavigate('landing')}
        initialTool="ppt-generator"
      />
    );
  }

  if (view === 'refinement-studio') {
    return (
      <RefinementStudio
        questionId={presentationSetId || undefined}
        onExit={() => handleNavigate('creator')}
      />
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden page-fade-in font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-accent-purple/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full text-center">
        {/* Brand Foundation */}
        <div className="flex flex-col items-center mb-16">
          <div className="bg-gradient-to-br from-primary to-primary-dark w-20 h-20 rounded-[28px] flex items-center justify-center mb-8 text-white shadow-2xl shadow-primary/20 transform hover:rotate-6 transition-transform">
            <Layers size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight font-heading">
            Q-Bank <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan">Pro</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Professional AI-driven educational architecture for high-stakes content creation and immersive classroom delivery.
          </p>
        </div>

        {/* Mode Selector - Choice Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 px-4">
          {[
            {
              id: modeId => handleNavigate(modeId),
              role: 'creator',
              title: 'Creator Studio',
              desc: 'Synthesize bilingual assessments and manage institutional cloud libraries with AI synthesis.',
              icon: Sparkles,
            },
            {
              id: modeId => handleNavigate(modeId),
              role: 'teacher',
              title: 'Teacher Mode',
              desc: 'Deliver cinematic classroom presentations with real-time AI assistance and pattern delivery.',
              icon: Presentation,
            },
            {
              id: modeId => handleNavigate(modeId),
              role: 'tools',
              title: 'Tools',
              desc: 'Access powerful AI utilities including Proofreader, PDF to Text, and other creator resources.',
              icon: Wrench,
            }
          ].map((mode) => (
            <button
              key={mode.role}
              onClick={() => mode.id(mode.role as any)}
              className={`group bg-white p-10 rounded-[40px] border border-slate-200 transition-all text-left flex flex-col h-full hover-lift shadow-sm`}
            >
              <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all`}>
                <mode.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight font-heading">{mode.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-8 flex-1">
                {mode.desc}
              </p>
              <div className="flex items-center text-primary text-[11px] font-black uppercase tracking-[0.2em]">
                Enter Environment <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Global Access Layer */}
        <div className="bg-white p-2 rounded-[32px] shadow-lg border border-slate-100 flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto">
          <div className="flex-1 flex items-center pl-6 py-4 w-full">
            <Layers size={18} className="text-slate-300 mr-4" />
            <input
              type="text"
              placeholder="Quick Access: Enter Examination Set ID..."
              className="bg-transparent border-none outline-none text-slate-700 font-bold w-full placeholder:text-slate-300"
            />
          </div>
          <Button className="rounded-[24px] px-10 h-14 w-full md:w-auto">
            Launch Set
          </Button>
        </div>

        {/* Trust & Architecture Badges */}
        <div className="flex flex-wrap items-center justify-center gap-12 mt-20 pt-10 border-t border-slate-200/60 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Enterprise Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent-pink" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Gemini 2.0 Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-warning" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Low-Latency Synthesis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
