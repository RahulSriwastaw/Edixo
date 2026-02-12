import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { QuestionSet, Question } from '../types';
import { Button } from './Button';
import { SmartBoard } from './SmartBoard';
import {
  Clock, AlertCircle, Layers, MonitorPlay, BookOpen, Lock, Presentation, X, Download
} from 'lucide-react';

interface TeacherViewProps {
  onExit: () => void;
  initialSetId?: string;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ onExit, initialSetId }) => {
  const [mode, setMode] = useState<'access' | 'present' | 'summary' | 'auth' | 'browse'>('access');
  const [passwordInput, setPasswordInput] = useState('');
  const [availableSets, setAvailableSets] = useState<QuestionSet[]>([]);
  const [activeSet, setActiveSet] = useState<QuestionSet | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [timer, setTimer] = useState(0); // For summary

  const loadSet = async (id: string) => {
    setIsDataLoading(true);
    try {
      const set = await storageService.getSetById(id);
      if (!set) {
        setIsDataLoading(false);
        return;
      }
      const all = await storageService.getQuestions();
      let qs = set.questionIds.map(qid => all.find(q => q.id === qid)).filter((q): q is Question => !!q);

      if (set.settings?.randomize) {
        qs = [...qs].sort(() => Math.random() - 0.5);
      }

      setActiveSet(set);
      setActiveQuestions(qs);

      if (set.password && set.password.trim() !== '') {
        setMode('auth');
      } else {
        setMode('present');
      }
    } catch (e) {
      console.error("Load failed", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (initialSetId) {
      loadSet(initialSetId);
    } else {
      loadAvailableSets();
    }
  }, [initialSetId]);

  const loadAvailableSets = async () => {
    setIsDataLoading(true);
    const sets = await storageService.getSets();
    setAvailableSets(sets);
    setMode('browse');
    setIsDataLoading(false);
  };

  const handleAuth = () => {
    if (activeSet?.password === passwordInput) {
      setMode('present');
    } else {
      alert("Incorrect Password");
      setPasswordInput('');
    }
  };

  const renderAuthModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}>
      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Access PPT</h2>
            <p className="text-xs text-slate-500">Secure Teacher Gateway</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Set ID</label>
            <input
              type="text"
              value={activeSet?.setId || ''}
              disabled
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 font-mono text-sm text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="Enter access code..."
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
          <button
            onClick={handleAuth}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 mt-4"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === 'auth') return renderAuthModal();

  if (mode === 'access') return (
    <div className="h-screen flex items-center justify-center bg-[#0A0C10]">
      <div className="flex flex-col items-center gap-6">
        {isDataLoading ? (
          <>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Initializing Theater...</p>
          </>
        ) : (
          <div className="text-center space-y-4">
            <AlertCircle size={48} className="text-red-500 mx-auto" />
            <h3 className="text-white font-bold">Set Unavailable</h3>
            <p className="text-slate-500 text-sm">The requested question set could not be found.</p>
            <Button onClick={onExit} className="bg-slate-800 text-white">Return to Studio</Button>
          </div>

        )}
      </div>
    </div >
  );

  if (mode === 'browse') return (
    <div className="min-h-screen bg-[#0A0C10] p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/10 p-3 rounded-2xl text-cyan-400">
              <Presentation size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Teacher Studio</h1>
              <p className="text-slate-400 text-sm font-medium">Select a set to begin your class.</p>
            </div>
          </div>
          <Button onClick={onExit} className="bg-slate-800 text-white hover:bg-slate-700">Exit Studio</Button>
        </div>

        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSets.map(set => (
              <div key={set.setId} onClick={() => loadSet(set.setId)} className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 cursor-pointer group hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${set.status === 'public' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {set.status || 'Draft'}
                  </span>
                  <div className="p-2 bg-white/5 rounded-full text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <MonitorPlay size={20} />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">{set.name}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px]">{set.description}</p>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <span className="flex items-center gap-1"><Layers size={14} /> {set.questionIds?.length || 0} Questions</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(set.createdDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {availableSets.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40">
                <Layers size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="font-black uppercase tracking-widest text-sm text-slate-500">No Sets Found. Create one in Creator Studio.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'summary') return (
    <div className="h-screen flex items-center justify-center bg-[#0A0C10] p-6 animate-in zoom-in-95">
      <div className="max-w-xl w-full bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-8 relative">
        <button onClick={() => setMode('present')} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20} /></button>

        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <Clock size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Session Complete</h2>
          <p className="text-slate-400 font-medium">{activeSet?.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
            <div className="text-2xl font-black text-indigo-400">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Duration</div>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
            <div className="text-2xl font-black text-emerald-400">{activeQuestions.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Questions</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={() => { setMode('present'); }} className="w-full bg-indigo-600 text-white py-4 h-auto font-bold uppercase tracking-wider">
            Restart Session
          </Button>
          <Button onClick={onExit} className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-4 h-auto font-bold uppercase tracking-wider">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  // Present Mode - Delegates to SmartBoard
  return (
    <SmartBoard
        questions={activeQuestions}
        initialIdx={0}
        setName={activeSet?.name}
        setId={activeSet?.setId}
        onExit={() => {
            // Logic for summary could be handled here
            // For now, just exit to summary
            setMode('summary');
        }}
    />
  );
};
