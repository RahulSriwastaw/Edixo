"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Loader2,
  ChevronLeft,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
  User,
  Clock,
  Layout
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

export default function TestInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Student");

  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("");
  const [declared, setDeclared] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const testId = params?.id ? String(params.id) : "demo-test";

  // Fetch student name from API
  useEffect(() => {
    apiFetch("/students/me").then(res => {
      if (res.data?.name) setDisplayName(res.data.name);
    }).catch(() => {});
  }, []);

  const handleBegin = () => {
    if (step === 1) {
      setStep(2);
      return;
    } 
    
    if (language && declared) {
      setIsNavigating(true);
      setTimeout(() => {
        window.location.href = `/tests/exam/${testId}`;
      }, 300);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-primary/10">
      {/* Premium Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/tests')}>
             <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <span className="text-white font-black text-xs">M</span>
             </div>
             <span className="text-slate-900 font-black text-lg tracking-tight hidden sm:inline group-hover:text-primary transition-colors">Mockbook</span>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex flex-col">
            <h1 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Instructions Panel
            </h1>
            <p className="text-sm font-bold text-slate-700 truncate max-w-[200px] md:max-w-none">
              Exam ID: {testId.toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Exam Environment</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Profile Sidebar */}
        <aside className="w-full md:w-[280px] bg-white border-b md:border-r md:border-b-0 flex flex-row md:flex-col items-center gap-6 md:gap-0 p-6 md:p-10 shrink-0 z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <Avatar className="h-16 w-16 md:h-32 md:w-32 rounded-full border-4 border-white shadow-2xl overflow-hidden relative z-10">
              <AvatarFallback className="text-2xl md:text-5xl font-black bg-slate-100 text-slate-400 w-full h-full flex items-center justify-center">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-left md:text-center mt-0 md:mt-8 space-y-1">
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
              {displayName}
            </h3>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Authenticated Candidate</p>
          </div>
          
          <div className="hidden md:flex flex-col w-full mt-10 space-y-3">
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Verified</span>
                   <span className="text-xs font-bold text-slate-700">Student Account</span>
                </div>
             </div>
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Timer</span>
                   <span className="text-xs font-bold text-slate-700">Server Synced</span>
                </div>
             </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-[#F8FAFC] overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-4xl mx-auto">
            {step === 1 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <BookOpen className="h-3 w-3" /> Step 01 / 02
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">General Instructions</h2>
                  <p className="text-slate-500 font-medium">Please read these rules carefully before starting the exam.</p>
                </div>

                <div className="grid gap-6">
                   <Card className="rounded-3xl border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                      <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                         <p className="text-sm font-medium text-slate-600 leading-relaxed pt-1">The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination.</p>
                      </div>

                      <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                         <div className="space-y-4 pt-1">
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">The Question Palette displayed on the right side of screen will show the status of each question using the following symbols:</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {[
                                 { id: '01', color: 'bg-white text-slate-400 border-slate-200', label: 'Not Visited', desc: 'You have not visited the question yet.' },
                                 { id: '02', color: 'bg-red-500 text-white border-transparent', label: 'Not Answered', desc: 'You have visited but not answered.' },
                                 { id: '03', color: 'bg-emerald-500 text-white border-transparent', label: 'Answered', desc: 'You have answered the question.' },
                                 { id: '04', color: 'bg-indigo-500 text-white border-transparent', label: 'Review', desc: 'Marked for review and not answered.' }
                               ].map(s => (
                                 <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-colors">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm border", s.color)}>
                                       {s.id}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</span>
                                       <span className="text-[11px] font-bold text-slate-600 leading-tight">{s.desc}</span>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                         <p className="text-sm font-medium text-slate-600 leading-relaxed pt-1">You can click on the question number in the palette to go directly to that question. Click on "Save & Next" to save your answer for the current question.</p>
                      </div>
                   </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Step 02 / 02
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Final Declaration</h2>
                  <p className="text-slate-500 font-medium">Verify your details and choose your preferred language.</p>
                </div>

                <div className="grid gap-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                               <Clock className="h-5 w-5" />
                            </div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Test Duration</h4>
                         </div>
                         <p className="text-3xl font-black text-slate-900">35 <span className="text-lg text-slate-400">Minutes</span></p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                               <Trophy className="h-5 w-5" />
                            </div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Max Marks</h4>
                         </div>
                         <p className="text-3xl font-black text-slate-900">40 <span className="text-lg text-slate-400">Points</span></p>
                      </div>
                   </div>

                   <Card className="rounded-[2.5rem] border-slate-100 shadow-sm p-8 md:p-10 space-y-10">
                      <div className="space-y-6">
                         <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex items-center gap-3">
                               <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                                  <Globe className="h-4 w-4" />
                               </div>
                               <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Default Language</span>
                            </div>
                            <Select value={language} onValueChange={setLanguage}>
                               <SelectTrigger className="w-full sm:w-[220px] h-12 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:ring-primary/20 transition-all">
                                  <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100">
                                  <SelectItem value="english" className="rounded-xl font-bold py-3">English</SelectItem>
                                  <SelectItem value="hindi" className="rounded-xl font-bold py-3">Hindi</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         
                         <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                               Note: Questions will appear in your chosen language by default. You can still toggle language for specific questions during the exam.
                            </p>
                         </div>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                               <PenLine className="h-4 w-4" />
                            </div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Candidate Declaration</h4>
                         </div>
                         
                         <div className="relative group cursor-pointer" onClick={() => setDeclared(!declared)}>
                            <div className={cn(
                              "flex items-start gap-4 p-6 rounded-3xl border-2 transition-all duration-300",
                              declared ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-white border-slate-100 hover:border-slate-200"
                            )}>
                               <Checkbox 
                                 id="decl" 
                                 checked={declared} 
                                 className="mt-1 h-5 w-5 rounded-lg border-2"
                               />
                               <label htmlFor="decl" className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed cursor-pointer select-none">
                                  I have read and understood all the instructions. I agree that I will not use any prohibited gadget or unfair means. All my equipment (mouse, keyboard, monitor) is working correctly. I understand that any violation may lead to my disqualification.
                               </label>
                            </div>
                         </div>
                      </div>
                   </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer Controls */}
      <footer className="bg-white border-t px-8 py-6 flex items-center justify-between shrink-0 z-20">
        <Button 
          variant="ghost" 
          className="text-slate-400 font-black text-xs uppercase tracking-widest h-12 px-6 rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 group"
          onClick={() => step === 2 ? setStep(1) : router.back()}
          disabled={isNavigating}
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {step === 1 ? "Exit Panel" : "Go Back"}
        </Button>
        
        {step === 1 ? (
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white font-black h-14 px-10 text-xs tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
            onClick={() => setStep(2)}
          >
            NEXT STEP <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className={cn(
              "h-16 px-14 text-sm font-black tracking-widest rounded-2xl transition-all shadow-2xl flex items-center gap-4",
              declared && language 
                ? "bg-primary hover:bg-primary/90 text-white shadow-primary/30 hover:-translate-y-1 active:scale-95" 
                : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
            )}
            disabled={!declared || !language || isNavigating}
            onClick={handleBegin}
          >
            {isNavigating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                STARTING SECURE SESSION...
              </>
            ) : (
              <>
                I AM READY TO BEGIN
                <PlayCircle className="h-5 w-5" />
              </>
            )}
          </Button>
        )}
      </footer>
    </div>
  );
}
