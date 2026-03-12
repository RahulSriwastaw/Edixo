
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Loader2,
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
    <div className="flex flex-col h-screen bg-[#f0f4f7] font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b px-4 md:px-6 py-2.5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">M</span>
             </div>
             <span className="text-primary font-bold text-sm tracking-tight hidden xs:inline">Mockbook</span>
          </div>
          <div className="h-5 w-px bg-slate-200 mx-1 md:mx-2" />
          <h1 className="text-[11px] md:text-[13px] font-medium text-slate-600 truncate max-w-[150px] sm:max-w-none">
            Instructions: {testId.toUpperCase()}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Profile Aside (Top on mobile, Left on desktop) */}
        <aside className="w-full md:w-[240px] bg-white border-b md:border-r md:border-b-0 flex flex-row md:flex-col items-center gap-4 md:gap-0 p-4 md:p-8 shrink-0">
          <Avatar className="h-12 w-12 md:h-28 md:w-24 rounded-lg border shadow-sm overflow-hidden">
            <AvatarFallback className="text-xl md:text-3xl font-bold bg-primary text-white rounded-lg w-full h-full flex items-center justify-center">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left md:text-center mt-0 md:mt-4">
            <h3 className="text-sm md:text-lg font-bold text-slate-700">
              {displayName}
            </h3>
            <p className="text-[10px] text-muted-foreground">Aspirant Profile</p>
          </div>
        </aside>

        {/* Instructions Panel */}
        <main className="flex-1 bg-white overflow-y-auto shadow-inner relative">
          {step === 1 ? (
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
              <section>
                <h2 className="text-lg md:text-xl font-bold text-slate-800 border-b pb-2 mb-4">General Instructions:</h2>
                <ol className="list-decimal pl-5 space-y-4 text-[12px] md:text-[13px] text-slate-600 leading-relaxed">
                  <li>The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time.</li>
                  <li>
                    The Question Palette displayed on the right side of screen will show status symbols:
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-3 p-2 border rounded-xl bg-slate-50/50">
                        <div className="w-6 h-6 border bg-white rounded-md flex items-center justify-center text-[10px] font-bold">01</div>
                        <span className="text-[11px]">Not visited yet.</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded-xl bg-slate-50/50">
                        <div className="w-6 h-6 bg-red-600 text-white rounded-md flex items-center justify-center text-[10px] font-bold">02</div>
                        <span className="text-[11px]">Not answered.</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded-xl bg-slate-50/50">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-md flex items-center justify-center text-[10px] font-bold">03</div>
                        <span className="text-[11px]">Answered correctly.</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded-xl bg-slate-50/50">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-md flex items-center justify-center text-[10px] font-bold">04</div>
                        <span className="text-[11px]">Marked for review.</span>
                      </div>
                    </div>
                  </li>
                  <li>You can change your answer anytime before the final submission.</li>
                </ol>
              </section>
            </div>
          ) : (
            <div className="flex flex-col min-h-full animate-in slide-in-from-right duration-300">
              <div className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center mb-4 md:mb-8">Test Summary & Final Rules</h2>
                  
                  <div className="flex justify-between items-center text-[11px] md:text-[13px] font-bold text-slate-700 border-b pb-2">
                    <span>Duration: 35 Mins</span>
                    <span>Max Marks: 40</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[12px] md:text-[13px] font-bold text-slate-800 uppercase tracking-tight">Read Carefully Before Beginning</h3>
                    <ol className="list-decimal pl-5 space-y-3 text-[12px] md:text-[13px] text-slate-600 leading-relaxed">
                      <li>The test contains 10 total questions.</li>
                      <li>Negative marking: 0.33 will be deducted for each wrong answer.</li>
                      <li>Click "READY TO BEGIN" to start the exam timer.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="border-t bg-slate-50/50 p-4 md:p-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-[12px] md:text-[13px] font-bold text-slate-800">Choose your default language:</span>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs bg-white shadow-sm rounded-xl">
                        <SelectValue placeholder="-- Select --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <p className="text-[10px] md:text-[11px] text-red-500 font-medium italic">
                    Note: Questions will appear in your default language. You can change this later inside the test.
                  </p>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-[12px] md:text-[13px] font-bold text-slate-800">Declaration:</h4>
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="decl" 
                        checked={declared} 
                        onCheckedChange={(v) => setDeclared(!!v)} 
                        className="mt-1 shrink-0 h-4 w-4 rounded-md"
                      />
                      <label htmlFor="decl" className="text-[11px] md:text-[12px] text-slate-600 leading-snug cursor-pointer select-none">
                        I have read and understood the instructions. I agree that I will not use any prohibited gadget or unfair means. All equipment provided is working correctly.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="h-16 md:h-14 bg-slate-50 border-t px-4 md:px-8 flex items-center justify-between shrink-0">
        <Button 
          variant="outline" 
          className="border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold h-10 px-4 md:px-6 text-[11px] md:text-xs flex items-center gap-2 rounded-xl"
          onClick={() => step === 2 ? setStep(1) : router.back()}
          disabled={isNavigating}
        >
          {step === 1 ? "CATALOG" : "PREVIOUS"}
        </Button>
        
        {step === 1 ? (
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 md:px-10 text-[11px] md:text-xs shadow-lg shadow-primary/20 rounded-xl"
            onClick={() => setStep(2)}
          >
            NEXT <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <div className="flex-1 flex justify-end md:justify-center pl-2">
            <Button 
              className={cn(
                "bg-primary hover:bg-primary/90 text-white font-bold h-11 md:h-10 px-8 md:px-14 text-xs transition-all shadow-lg shadow-primary/20 rounded-xl whitespace-nowrap",
                (!declared || !language) && "opacity-50 cursor-not-allowed"
              )}
              disabled={!declared || !language || isNavigating}
              onClick={handleBegin}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                "READY TO BEGIN"
              )}
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
}
