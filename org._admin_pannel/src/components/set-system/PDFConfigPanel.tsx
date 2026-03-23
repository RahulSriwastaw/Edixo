"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Settings,
  Layout as LayoutIcon,
  Eye,
  Palette,
  Filter,
  QrCode,
  Zap,
  RefreshCw,
  Maximize,
  Download,
  Share2,
  ChevronLeft,
  Check,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  question_hin?: string;
  difficulty: string;
  type: string;
  options?: string[];
  options_hin?: string[];
  answer?: string;
  explanation?: string;
  explanation_hin?: string;
  marks?: number;
}

interface QuestionSetData {
  id: string;
  set_code: string;
  name: string;
  description: string;
  subject: string;
  chapter: string;
  questions: Question[];
}

interface PDFConfigPanelProps {
  questionSet: QuestionSetData;
  onBack: () => void;
}

export function PDFConfigPanel({ questionSet, onBack }: PDFConfigPanelProps): React.JSX.Element {
  // --- 1. Layout Controls ---
  const [fontSize, setFontSize] = useState(12);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [optionSpacing, setOptionSpacing] = useState(8);
  const [questionBoldness, setQuestionBoldness] = useState("normal");
  const [optionBoldness, setOptionBoldness] = useState("normal");
  const [solutionBoldness, setSolutionBoldness] = useState("bold");
  const [columns, setColumns] = useState<"1" | "2">("1");

  // --- 2. Visibility Toggles ---
  const [showAnswerWidget, setShowAnswerWidget] = useState(true);
  const [hideQuestion, setHideQuestion] = useState(false);
  const [hideOptions, setHideOptions] = useState(false);
  const [hideExplanationBox, setHideExplanationBox] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showAnswerWithDesc, setShowAnswerWithDesc] = useState(false);
  const [isBilingual, setIsBilingual] = useState(false);
  const [showPyqTag, setShowPyqTag] = useState(true);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showBookTag, setShowBookTag] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("SAMPLE");
  const [showRelevantQs, setShowRelevantQs] = useState(false);
  const [questionOpacity, setQuestionOpacity] = useState(100);
  const [optionOpacity, setOptionOpacity] = useState(100);

  // --- 3. Branding ---
  const [primaryLogo, setPrimaryLogo] = useState("");
  const [secondaryLogo, setSecondaryLogo] = useState("");
  const [enableCustomHeader, setEnableCustomHeader] = useState(true);
  const [headerTitle, setHeaderTitle] = useState(questionSet.name);

  // --- 4. Filtering & Organization ---
  const [filterSubject, setFilterSubject] = useState("");
  const [startQNumber, setStartQNumber] = useState("1");
  const [sectionName, setSectionName] = useState("");

  // --- 5. QR Code System ---
  const [qrAction, setQrAction] = useState("save_set");
  const [qrSetId, setQrSetId] = useState(questionSet.set_code);

  // --- 6. Color Customization ---
  const [headerBgColor, setHeaderBgColor] = useState("#F4511E");
  const [footerBgColor, setFooterBgColor] = useState("#f3f4f6");
  const [questionTextColor, setQuestionTextColor] = useState("#1f2937");
  const [optionTextColor, setOptionTextColor] = useState("#4b5563");
  const [questionNumberColor, setQuestionNumberColor] = useState("#F4511E");

  // --- 7. Advanced Controls ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);

  const refreshMathJax = () => {
    if (typeof window !== "undefined" && (window as any).MathJax) {
      try {
        (window as any).MathJax.typesetPromise();
        toast.success("MathJax refreshed");
      } catch (e) {
        console.error(e);
      }
    } else {
      toast.info("MathJax not found on this page");
    }
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    toast.info("Generating PDF, please wait...");
    try {
      // In a real scenario, avoiding html2canvas for huge docs is better, 
      // but we will use the browser's print function for true high-quality vector output
      const content = generateHtmlForPrint();
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(content);
        printWindow.document.close();
        
        // Wait for images and MathJax to load
        setTimeout(() => {
          printWindow.print();
          setIsExporting(false);
        }, 1000);
      } else {
        setIsExporting(false);
        toast.error("Popup blocked. Please allow popups to print/export.");
      }
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      toast.error("Export failed");
    }
  };

  // Generate HTML for printing
  const generateHtmlForPrint = useCallback(() => {
    // Collect the dynamic styles based on state
    const startNum = parseInt(startQNumber) || 1;
    
    // Build questions HTML
    const questionsHtml = questionSet.questions.map((q, idx) => {
      const qNum = startNum + idx;
      
      let optionsHtml = "";
      if (!hideOptions && q.options && q.options.length > 0) {
        optionsHtml = q.options.map((opt, i) => {
          const optLabel = String.fromCharCode(65 + i);
          return `<div class="option" style="opacity: ${optionOpacity / 100}; font-weight: ${optionBoldness}; color: ${optionTextColor}; margin-bottom: ${optionSpacing}px;">
            <span class="opt-label">${optLabel}.</span> ${opt}
          </div>`;
        }).join("");
        
        if (isBilingual && q.options_hin && q.options_hin.length > 0) {
           optionsHtml += "<div class='lang-divider'></div>";
           optionsHtml += q.options_hin.map((opt, i) => {
            const optLabel = String.fromCharCode(65 + i);
            return `<div class="option" style="opacity: ${optionOpacity / 100}; font-weight: ${optionBoldness}; color: ${optionTextColor}; margin-bottom: ${optionSpacing}px;">
              <span class="opt-label">${optLabel}.</span> ${opt}
            </div>`;
          }).join("");
        }
        
        optionsHtml = `<div class="options-container">${optionsHtml}</div>`;
      }

      let solutionHtml = "";
      if (showSolution) {
        let text = "";
        if (showAnswerWidget && q.answer) text += `<div class="answer-key">Answer: ${q.answer}</div>`;
        if (!hideExplanationBox && q.explanation) text += `<div class="explanation">Explanation: ${q.explanation}</div>`;
        if (text) solutionHtml = `<div class="solution-box" style="font-weight: ${solutionBoldness}">${text}</div>`;
      }

      return `
        <div class="question-block" style="page-break-inside: avoid; margin-bottom: 24px;">
          ${!hideQuestion ? `
            <div class="question-header">
              <span class="q-num" style="color: ${questionNumberColor}">Q${qNum}.</span>
              <div class="q-text" style="opacity: ${questionOpacity / 100}; font-weight: ${questionBoldness}; color: ${questionTextColor}">
                ${q.text}
                ${isBilingual && q.question_hin ? `<div class="q-text-hin mt-2">${q.question_hin}</div>` : ""}
              </div>
            </div>
          ` : ""}
          ${optionsHtml}
          ${solutionHtml}
        </div>
      `;
    }).join("");

    const watermarkHtml = showWatermark ? `<div class="watermark">${watermarkText}</div>` : "";
    const headerHtml = enableCustomHeader ? `
      <div class="header" style="background-color: ${headerBgColor}; color: white; padding: 16px; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 24px;">
        ${primaryLogo ? `<img src="${primaryLogo}" style="height: 40px; vertical-align: middle; margin-right: 16px;">` : ""}
        <span style="font-size: 24px; font-weight: bold; vertical-align: middle;">${headerTitle}</span>
        ${secondaryLogo ? `<img src="${secondaryLogo}" style="height: 40px; vertical-align: middle; margin-left: 16px;">` : ""}
      </div>
    ` : "";

    const footerHtml = `
      <div class="footer" style="background-color: ${footerBgColor}; padding: 12px; text-align: center; font-size: 12px; color: #666; margin-top: 40px; border-top: 1px solid #ddd;">
        Generated by EduHub | Set Code: ${questionSet.set_code}
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Export PDF - ${headerTitle}</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            font-size: ${fontSize}px;
            line-height: ${lineSpacing};
            margin: 0;
            padding: 40px;
            color: #333;
          }
          .page-content {
             position: relative;
             max-width: 800px;
             margin: 0 auto;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(0,0,0,0.05);
            z-index: -1;
            pointer-events: none;
            white-space: nowrap;
          }
          .q-num {
            float: left;
            margin-right: 8px;
            font-weight: bold;
          }
          .q-text {
            overflow: hidden;
          }
          .options-container {
            margin-top: 12px;
            margin-left: 24px;
            display: ${columns === "2" ? "grid" : "block"};
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .opt-label { font-weight: bold; margin-right: 4px; }
          .solution-box {
            margin-top: 16px;
            padding: 12px;
            background: #f9fafb;
            border-left: 4px solid ${headerBgColor};
            border-radius: 0 8px 8px 0;
          }
          @media print {
            body { padding: 0; }
            .header { border-radius: 0; }
          }
        </style>
      </head>
      <body>
        ${watermarkHtml}
        <div class="page-content">
          ${headerHtml}
          ${sectionName ? `<h3 style="border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 20px;">${sectionName}</h3>` : ""}
          <div class="questions">
            ${questionsHtml}
          </div>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;
  }, [
    fontSize, lineSpacing, optionSpacing, questionBoldness, optionBoldness, solutionBoldness, columns,
    hideQuestion, hideOptions, hideExplanationBox, showSolution, showAnswerWidget, isBilingual,
    showWatermark, watermarkText, questionOpacity, optionOpacity, enableCustomHeader, headerTitle,
    headerBgColor, primaryLogo, secondaryLogo, startQNumber, sectionName, questionSet, footerBgColor,
    questionTextColor, optionTextColor, questionNumberColor
  ]);

  return (
    <div className={cn("flex flex-col h-screen bg-gray-50", isFullscreen ? "fixed inset-0 z-50 bg-white" : "")}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">PDF Configuration Studio</h1>
            <p className="text-sm text-gray-500">Customize output for {questionSet.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={refreshMathJax}>
            <RefreshCw className="w-4 h-4 mr-2" /> MathJax
          </Button>
          <Button variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize className="w-4 h-4 mr-2" /> {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <Button onClick={handleExportPDF} className="bg-[#F4511E] hover:bg-[#E64A19]" disabled={isExporting}>
            <Printer className="w-4 h-4 mr-2" /> {isExporting ? "Preparing..." : "Print & Export"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Settings Panel */}
        <div className="w-[400px] border-r bg-white flex flex-col shrink-0">
          <div className="p-4 border-b bg-gray-50 font-medium text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" /> Configuration Options
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <Accordion type="multiple" defaultValue={["layout", "visibility"]} className="space-y-4">
              
              {/* 1. Layout Controls */}
              <AccordionItem value="layout" className="border rounded-lg px-4 bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <LayoutIcon className="w-4 h-4 text-blue-500" /> Layout & Typography
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Font Size: {fontSize}px</Label>
                    </div>
                    <Slider value={[fontSize]} min={8} max={24} step={1} onValueChange={(v) => setFontSize(v[0])} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Line Spacing: {lineSpacing}</Label>
                    </div>
                    <Slider value={[lineSpacing]} min={1} max={3} step={0.1} onValueChange={(v) => setLineSpacing(v[0])} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Option Spacing: {optionSpacing}px</Label>
                    </div>
                    <Slider value={[optionSpacing]} min={0} max={24} step={2} onValueChange={(v) => setOptionSpacing(v[0])} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Boldness</Label>
                      <Select value={questionBoldness} onValueChange={setQuestionBoldness}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="800">Extra Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Option Boldness</Label>
                      <Select value={optionBoldness} onValueChange={setOptionBoldness}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label>Solution Boldness</Label>
                      <Select value={solutionBoldness} onValueChange={setSolutionBoldness}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Columns</Label>
                      <Select value={columns} onValueChange={(v: any) => setColumns(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Column</SelectItem>
                          <SelectItem value="2">2 Columns</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Visibility Toggles */}
              <AccordionItem value="visibility" className="border rounded-lg px-4 bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Eye className="w-4 h-4 text-purple-500" /> Visibility Toggles
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <Switch checked={showAnswerWidget} onCheckedChange={setShowAnswerWidget} />
                      <span className="text-sm font-medium">Answer Widget</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <Switch checked={hideQuestion} onCheckedChange={setHideQuestion} />
                      <span className="text-sm font-medium">Hide Question</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <Switch checked={hideOptions} onCheckedChange={setHideOptions} />
                      <span className="text-sm font-medium">Hide Options</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <Switch checked={hideExplanationBox} onCheckedChange={setHideExplanationBox} />
                      <span className="text-sm font-medium">Hide Explanations</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <Switch checked={showSolution} onCheckedChange={setShowSolution} />
                      <span className="text-sm font-medium">Show Solution</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer border-[#F4511E]">
                      <Switch checked={isBilingual} onCheckedChange={setIsBilingual} />
                      <span className="text-sm font-medium">Bilingual PDF</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <Switch checked={showPyqTag} onCheckedChange={setShowPyqTag} />
                      <span className="text-sm font-medium">PYQ Tag</span>
                    </label>
                    <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <Switch checked={showBookTag} onCheckedChange={setShowBookTag} />
                      <span className="text-sm font-medium">Book Tag</span>
                    </label>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between">
                      <Label>Question Opacity: {questionOpacity}%</Label>
                    </div>
                    <Slider value={[questionOpacity]} min={10} max={100} step={5} onValueChange={(v) => setQuestionOpacity(v[0])} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Option Opacity: {optionOpacity}%</Label>
                    </div>
                    <Slider value={[optionOpacity]} min={10} max={100} step={5} onValueChange={(v) => setOptionOpacity(v[0])} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Branding */}
              <AccordionItem value="branding" className="border rounded-lg px-4 bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Palette className="w-4 h-4 text-pink-500" /> Branding
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Header Title</Label>
                    <Input value={headerTitle} onChange={e => setHeaderTitle(e.target.value)} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Custom Header Format</Label>
                    <Switch checked={enableCustomHeader} onCheckedChange={setEnableCustomHeader} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Primary Logo URL</Label>
                    <Input placeholder="https://..." value={primaryLogo} onChange={e => setPrimaryLogo(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Logo URL</Label>
                    <Input placeholder="https://..." value={secondaryLogo} onChange={e => setSecondaryLogo(e.target.value)} />
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Watermark</Label>
                      <Switch checked={showWatermark} onCheckedChange={setShowWatermark} />
                    </div>
                    {showWatermark && (
                      <Input placeholder="Watermark Text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Color Customization */}
              <AccordionItem value="colors" className="border rounded-lg px-4 bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Zap className="w-4 h-4 text-orange-500" /> Colors
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Header BG</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-9" value={headerBgColor} onChange={e => setHeaderBgColor(e.target.value)} />
                        <Input value={headerBgColor} onChange={e => setHeaderBgColor(e.target.value)} className="flex-1 font-mono text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Footer BG</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-9" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} />
                        <Input value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="flex-1 font-mono text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Q Text Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-9" value={questionTextColor} onChange={e => setQuestionTextColor(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Option Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-9" value={optionTextColor} onChange={e => setOptionTextColor(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Q Number Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-9" value={questionNumberColor} onChange={e => setQuestionNumberColor(e.target.value)} />
                        <Input value={questionNumberColor} onChange={e => setQuestionNumberColor(e.target.value)} className="flex-1 font-mono text-xs" />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 5. Filtering & Organzation */}
              <AccordionItem value="filtering" className="border rounded-lg px-4 bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Filter className="w-4 h-4 text-teal-500" /> Filtering & Details
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Start Question Number</Label>
                    <Input type="number" min="1" value={startQNumber} onChange={e => setStartQNumber(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Name (Optional)</Label>
                    <Input placeholder="e.g. Section A: General Knowledge" value={sectionName} onChange={e => setSectionName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Filter by Subject</Label>
                    <Select value={filterSubject} onValueChange={setFilterSubject}>
                      <SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value={questionSet.subject}>{questionSet.subject}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 6. QR Code System */}
              <AccordionItem value="qrcode" className="border rounded-lg px-4 bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <QrCode className="w-4 h-4 text-indigo-500" /> QR Code System
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable QR Code Header</Label>
                    <Switch checked={showQrCode} onCheckedChange={setShowQrCode} />
                  </div>
                  
                  {showQrCode && (
                    <>
                      <div className="space-y-2">
                        <Label>QR Action</Label>
                        <Select value={qrAction} onValueChange={setQrAction}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="save_set">Save Set Offline</SelectItem>
                            <SelectItem value="start_test">Start Mock Test</SelectItem>
                            <SelectItem value="view_solutions">View Solutions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Set ID</Label>
                        <Input value={qrSetId} onChange={e => setQrSetId(e.target.value)} />
                      </div>
                      <Button className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                        <QrCode className="w-4 h-4 mr-2" /> Generate / Set QR
                      </Button>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="flex-1 bg-gray-200 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          {/* This wrapper visually represents A4 paper boundary */}
          <div 
            ref={previewRef}
            className="bg-white shadow-xl transition-all duration-300 transform-gpu"
            style={{ 
              width: "210mm", 
              minHeight: "297mm",
              outline: "1px solid #ddd"
            }}
          >
            <iframe 
              srcDoc={generateHtmlForPrint()} 
              style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'transparent' }}
              title="PDF Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
