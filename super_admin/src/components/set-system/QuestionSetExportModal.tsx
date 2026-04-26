"use client";

import { useState, useCallback } from "react";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  Mail,
  Share2,
  Link2,
  Palette,
  Loader2,
  Check,
  Printer,
  Globe,
  Type,
  Droplet,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Settings2,
  Layout,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  difficulty: string;
  type: string;
  options?: string[];
  answer?: string;
  explanation?: string;
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

interface QuestionSetExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionSet: QuestionSetData;
}

// Font families
const fontFamilies = [
  { id: "DM Sans", label: "DM Sans", category: "Sans Serif" },
  { id: "Inter", label: "Inter", category: "Sans Serif" },
  { id: "Roboto", label: "Roboto", category: "Sans Serif" },
  { id: "Open Sans", label: "Open Sans", category: "Sans Serif" },
  { id: "Poppins", label: "Poppins", category: "Sans Serif" },
  { id: "Georgia", label: "Georgia", category: "Serif" },
  { id: "Times New Roman", label: "Times New Roman", category: "Serif" },
  { id: "Merriweather", label: "Merriweather", category: "Serif" },
  { id: "JetBrains Mono", label: "JetBrains Mono", category: "Monospace" },
  { id: "Fira Code", label: "Fira Code", category: "Monospace" },
];

// Font sizes
const fontSizes = [
  { id: "10", label: "10px - Tiny" },
  { id: "11", label: "11px - Small" },
  { id: "12", label: "12px - Normal" },
  { id: "14", label: "14px - Medium" },
  { id: "16", label: "16px - Large" },
  { id: "18", label: "18px - Extra Large" },
];

// Color presets
const colorPresets = [
  { id: "orange", primary: "#F4511E", secondary: "#1E3A5F", name: "EduHub Orange" },
  { id: "blue", primary: "#2563EB", secondary: "#1E40AF", name: "Professional Blue" },
  { id: "green", primary: "#059669", secondary: "#065F46", name: "Nature Green" },
  { id: "purple", primary: "#7C3AED", secondary: "#5B21B6", name: "Royal Purple" },
  { id: "red", primary: "#DC2626", secondary: "#991B1B", name: "Bold Red" },
  { id: "teal", primary: "#0D9488", secondary: "#115E59", name: "Modern Teal" },
  { id: "dark", primary: "#1F2937", secondary: "#111827", name: "Dark Mode" },
  { id: "custom", primary: "#000000", secondary: "#000000", name: "Custom" },
];

// Export formats
const exportFormats = [
  { id: "pdf", label: "PDF", icon: FileText, description: "Print-ready document" },
  { id: "docx", label: "Word (.docx)", icon: FileText, description: "Microsoft Word" },
  { id: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet, description: "Spreadsheet" },
  { id: "pptx", label: "PowerPoint", icon: Presentation, description: "Presentation slides" },
  { id: "csv", label: "CSV", icon: FileSpreadsheet, description: "Data export" },
  { id: "html", label: "HTML", icon: Globe, description: "Web page" },
  { id: "json", label: "JSON", icon: FileText, description: "Developer format" },
  { id: "png", label: "Image (PNG)", icon: Image, description: "Image format" },
];

const cloudFormats = [
  { id: "google_docs", label: "Google Docs", icon: Globe, description: "Open in Google Docs" },
  { id: "google_sheets", label: "Google Sheets", icon: FileSpreadsheet, description: "Open in Google Sheets" },
  { id: "google_slides", label: "Google Slides", icon: Presentation, description: "Open in Google Slides" },
  { id: "canva", label: "Canva", icon: Palette, description: "Design in Canva", isNew: true },
];

export function QuestionSetExportModal({
  open,
  onOpenChange,
  questionSet,
}: QuestionSetExportModalProps) {
  // Export state
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const [selectedCloudFormat, setSelectedCloudFormat] = useState<string>("canva");
  const [activeTab, setActiveTab] = useState<string>("download");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Header options
  const [headerEnabled, setHeaderEnabled] = useState(true);
  const [headerLogo, setHeaderLogo] = useState<string>("");
  const [headerTitle, setHeaderTitle] = useState(questionSet.name);
  const [headerSubtitle, setHeaderSubtitle] = useState(`${questionSet.subject} | ${questionSet.chapter}`);
  const [headerAlignment, setHeaderAlignment] = useState<"left" | "center" | "right">("center");
  const [showSetCode, setShowSetCode] = useState(true);
  const [showDate, setShowDate] = useState(true);

  // Footer options
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerText, setFooterText] = useState("Generated by EduHub");
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [footerAlignment, setFooterAlignment] = useState<"left" | "center" | "right">("center");

  // Watermark options
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkText, setWatermarkText] = useState("SAMPLE");
  const [watermarkOpacity, setWatermarkOpacity] = useState(20);
  const [watermarkRotation, setWatermarkRotation] = useState(-45);
  const [watermarkSize, setWatermarkSize] = useState(48);

  // Typography options
  const [fontFamily, setFontFamily] = useState("DM Sans");
  const [fontSize, setFontSize] = useState("12");
  const [lineHeight, setLineHeight] = useState(1.6);
  const [questionSpacing, setQuestionSpacing] = useState(24);

  // Color options
  const [selectedColorPreset, setSelectedColorPreset] = useState("orange");
  const [primaryColor, setPrimaryColor] = useState("#F4511E");
  const [secondaryColor, setSecondaryColor] = useState("#1E3A5F");
  const [textColor, setTextColor] = useState("#1F2937");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  // Question display options
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeExplanations, setIncludeExplanations] = useState(false);
  const [includeMarks, setIncludeMarks] = useState(true);
  const [includeDifficulty, setIncludeDifficulty] = useState(true);
  const [includeQuestionNumbers, setIncludeQuestionNumbers] = useState(true);
  const [includeTypeIcons, setIncludeTypeIcons] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Layout options
  const [paperSize, setPaperSize] = useState<"a4" | "a3" | "letter" | "legal">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<"narrow" | "normal" | "wide">("normal");
  const [columns, setColumns] = useState<1 | 2>(1);

  // Get color preset
  const applyColorPreset = (presetId: string) => {
    const preset = colorPresets.find(p => p.id === presetId);
    if (preset && presetId !== "custom") {
      setPrimaryColor(preset.primary);
      setSecondaryColor(preset.secondary);
      setSelectedColorPreset(presetId);
    }
  };

  // Generate HTML content
  const generateHtmlContent = useCallback(() => {
    const margins = {
      narrow: "10mm",
      normal: "20mm",
      wide: "30mm",
    };

    const pageSizeStyles = {
      a4: { width: "210mm", height: "297mm" },
      a3: { width: "297mm", height: "420mm" },
      letter: { width: "216mm", height: "279mm" },
      legal: { width: "216mm", height: "356mm" },
    };

    const alignStyles = {
      left: "text-align: left;",
      center: "text-align: center;",
      right: "text-align: right;",
    };

    let questions = [...questionSet.questions];
    if (shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    const questionsHtml = questions.map((q, index) => {
      let optionsHtml = "";
      if (q.options && q.options.length > 0) {
        optionsHtml = q.options
          .map((opt, optIndex) => `<li>${String.fromCharCode(65 + optIndex)}. ${opt}</li>`)
          .join("");
        optionsHtml = `<ol class="options">${optionsHtml}</ol>`;
      }

      let answerHtml = "";
      if (includeAnswers && q.answer) {
        answerHtml = `<div class="answer"><strong>Answer:</strong> ${q.answer}</div>`;
      }

      let explanationHtml = "";
      if (includeExplanations && q.explanation) {
        explanationHtml = `<div class="explanation"><strong>Explanation:</strong> ${q.explanation}</div>`;
      }

      const metaItems: string[] = [];
      if (includeMarks && q.marks) {
        metaItems.push(`<span class="meta-item marks">[${q.marks} marks]</span>`);
      }
      if (includeDifficulty) {
        metaItems.push(`<span class="meta-item difficulty ${q.difficulty}">${q.difficulty}</span>`);
      }
      if (includeTypeIcons) {
        metaItems.push(`<span class="meta-item type">${q.type.toUpperCase()}</span>`);
      }

      const questionNum = includeQuestionNumbers ? `<span class="question-number">Q${index + 1}.</span>` : "";

      return `
        <div class="question" style="margin-bottom: ${questionSpacing}px;">
          <div class="question-header">
            ${questionNum}
            <div class="question-meta">${metaItems.join("")}</div>
          </div>
          <div class="question-text">${q.text}</div>
          ${optionsHtml}
          ${answerHtml}
          ${explanationHtml}
        </div>
      `;
    }).join("");

    // Header HTML
    let headerHtml = "";
    if (headerEnabled) {
      headerHtml = `
        <div class="header" style="${alignStyles[headerAlignment]}">
          ${headerLogo ? `<img src="${headerLogo}" alt="Logo" class="logo" />` : ""}
          <h1 class="header-title">${headerTitle}</h1>
          ${headerSubtitle ? `<p class="header-subtitle">${headerSubtitle}</p>` : ""}
          <div class="header-meta">
            ${showSetCode ? `<span>Set Code: ${questionSet.set_code}</span>` : ""}
            ${showDate ? `<span>Date: ${new Date().toLocaleDateString()}</span>` : ""}
          </div>
        </div>
      `;
    }

    // Footer HTML
    let footerHtml = "";
    if (footerEnabled) {
      footerHtml = `
        <div class="footer" style="${alignStyles[footerAlignment]}">
          ${footerText ? `<span class="footer-text">${footerText}</span>` : ""}
          ${showPageNumbers ? `<span class="page-number"></span>` : ""}
        </div>
      `;
    }

    // Watermark HTML
    let watermarkHtml = "";
    if (watermarkEnabled) {
      watermarkHtml = `
        <div class="watermark" style="
          opacity: ${watermarkOpacity / 100};
          font-size: ${watermarkSize}px;
          transform: rotate(${watermarkRotation}deg);
        ">${watermarkText}</div>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${questionSet.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page {
      size: ${paperSize} ${orientation};
      margin: ${margins[margin]};
    }
    
    body {
      font-family: '${fontFamily}', Arial, sans-serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      color: ${textColor};
      background: ${backgroundColor};
      padding: 20px;
    }
    
    .page {
      width: ${pageSizeStyles[paperSize].width};
      min-height: ${pageSizeStyles[paperSize].height};
      background: white;
      margin: 0 auto;
      padding: 40px;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    ${columns === 2 ? `.questions { column-count: 2; column-gap: 40px; }` : ""}
    
    .header {
      padding-bottom: 20px;
      margin-bottom: 30px;
      border-bottom: 3px solid ${primaryColor};
    }
    
    .header .logo {
      max-height: 60px;
      margin-bottom: 10px;
    }
    
    .header-title {
      font-size: 24px;
      font-weight: 700;
      color: ${secondaryColor};
      margin-bottom: 8px;
    }
    
    .header-subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .header-meta {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #888;
    }
    
    .question {
      padding: 15px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      background: #fafafa;
      break-inside: avoid;
    }
    
    .question-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .question-number {
      font-weight: 700;
      color: ${primaryColor};
      font-size: 16px;
    }
    
    .question-meta {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
    
    .meta-item {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .meta-item.marks {
      background: #f0f0f0;
      color: #666;
    }
    
    .meta-item.difficulty {
      font-weight: 500;
    }
    
    .meta-item.difficulty.easy {
      background: #dcfce7;
      color: #166534;
    }
    
    .meta-item.difficulty.medium {
      background: #fef3c7;
      color: #92400e;
    }
    
    .meta-item.difficulty.hard {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .meta-item.type {
      background: ${primaryColor};
      color: white;
    }
    
    .question-text {
      font-size: ${parseInt(fontSize) + 2}px;
      color: ${textColor};
    }
    
    .options {
      margin-top: 12px;
      margin-left: 20px;
    }
    
    .options li {
      margin: 8px 0;
      color: #555;
    }
    
    .answer {
      margin-top: 15px;
      padding: 10px;
      background: #e8f5e9;
      border-radius: 4px;
      color: #2e7d32;
      border-left: 3px solid #2e7d32;
    }
    
    .explanation {
      margin-top: 10px;
      padding: 10px;
      background: #fff3e0;
      border-radius: 4px;
      color: #e65100;
      font-size: ${parseInt(fontSize) - 1}px;
      border-left: 3px solid ${primaryColor};
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 11px;
      color: #888;
      display: flex;
      justify-content: space-between;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(${watermarkRotation}deg);
      font-size: ${watermarkSize}px;
      font-weight: bold;
      color: ${primaryColor};
      pointer-events: none;
      z-index: -1;
      white-space: nowrap;
    }
    
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; margin: 0; page-break-after: always; }
      .question { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    ${watermarkHtml}
    ${headerHtml}
    <div class="questions">
      ${questionsHtml}
    </div>
    ${footerHtml}
  </div>
</body>
</html>`;
  }, [questionSet, headerEnabled, headerLogo, headerTitle, headerSubtitle, headerAlignment, 
      showSetCode, showDate, footerEnabled, footerText, showPageNumbers, footerAlignment,
      watermarkEnabled, watermarkText, watermarkOpacity, watermarkRotation, watermarkSize,
      fontFamily, fontSize, lineHeight, questionSpacing, primaryColor, secondaryColor, textColor,
      backgroundColor, includeAnswers, includeExplanations, includeMarks, includeDifficulty,
      includeQuestionNumbers, includeTypeIcons, shuffleQuestions, paperSize, orientation, margin, columns]);

  // Generate CSV content
  const generateCsvContent = useCallback(() => {
    const headers = ["Question No", "Question Text", "Type", "Difficulty", "Marks"];
    if (questionSet.questions.some(q => q.options?.length)) {
      headers.push("Option A", "Option B", "Option C", "Option D");
    }
    if (includeAnswers) headers.push("Answer");
    if (includeExplanations) headers.push("Explanation");

    let questions = [...questionSet.questions];
    if (shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    const rows = questions.map((q, index) => {
      const row = [
        index + 1,
        `"${q.text.replace(/"/g, '""')}"`,
        q.type,
        q.difficulty,
        q.marks || "",
      ];
      if (questionSet.questions.some(q => q.options?.length)) {
        const options = q.options || [];
        row.push(
          options[0] ? `"${options[0].replace(/"/g, '""')}"` : "",
          options[1] ? `"${options[1].replace(/"/g, '""')}"` : "",
          options[2] ? `"${options[2].replace(/"/g, '""')}"` : "",
          options[3] ? `"${options[3].replace(/"/g, '""')}"` : ""
        );
      }
      if (includeAnswers) row.push(q.answer ? `"${q.answer}"` : "");
      if (includeExplanations) row.push(q.explanation ? `"${q.explanation.replace(/"/g, '""')}"` : "");
      return row.join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }, [questionSet, includeAnswers, includeExplanations, shuffleQuestions]);

  // Generate JSON content
  const generateJsonContent = useCallback(() => {
    let questions = [...questionSet.questions];
    if (shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    return JSON.stringify({
      metadata: {
        setName: questionSet.name,
        setCode: questionSet.set_code,
        subject: questionSet.subject,
        chapter: questionSet.chapter,
        totalQuestions: questions.length,
        exportedAt: new Date().toISOString(),
        settings: {
          headerEnabled,
          footerEnabled,
          watermarkEnabled,
          fontFamily,
          fontSize,
          primaryColor,
          secondaryColor,
        },
      },
      questions: questions.map((q, index) => ({
        number: index + 1,
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        marks: q.marks,
        options: q.options,
        ...(includeAnswers && { answer: q.answer }),
        ...(includeExplanations && { explanation: q.explanation }),
      })),
    }, null, 2);
  }, [questionSet, headerEnabled, footerEnabled, watermarkEnabled, fontFamily, fontSize, 
      primaryColor, secondaryColor, includeAnswers, includeExplanations, shuffleQuestions]);

  // Download helper
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Handle Canva export
  const handleCanvaExport = useCallback(async () => {
    setIsExporting(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 20, 90));
    }, 200);

    try {
      const designData = {
        type: "question_set",
        title: headerTitle || questionSet.name,
        setCode: questionSet.set_code,
        subject: questionSet.subject,
        chapter: questionSet.chapter,
        branding: {
          primaryColor,
          secondaryColor,
          fontFamily,
          fontSize,
        },
        questions: questionSet.questions.map((q, index) => ({
          number: index + 1,
          text: q.text,
          type: q.type,
          difficulty: q.difficulty,
          options: q.options,
          ...(includeAnswers && { answer: q.answer }),
          ...(includeExplanations && { explanation: q.explanation }),
        })),
      };

      sessionStorage.setItem("eduhub_canva_export", JSON.stringify(designData));

      const textContent = questionSet.questions.map((q, index) => {
        let text = `Q${index + 1}. ${q.text}`;
        if (q.options) {
          q.options.forEach((opt, i) => {
            text += `\n${String.fromCharCode(65 + i)}. ${opt}`;
          });
        }
        if (includeAnswers && q.answer) {
          text += `\nAnswer: ${q.answer}`;
        }
        return text;
      }).join("\n\n");

      await navigator.clipboard.writeText(textContent);

      clearInterval(progressInterval);
      setProgress(100);

      const canvaUrl = `https://www.canva.com/design?create=true&type=DAGQgRk&title=${encodeURIComponent(headerTitle || questionSet.name)}`;
      window.open(canvaUrl, "_blank");

      setTimeout(() => {
        setIsExporting(false);
        setIsComplete(true);
        toast.success("Opening Canva! Your questions have been copied to clipboard.");
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setIsExporting(false);
      toast.error("Failed to export to Canva.");
      console.error("Canva export error:", error);
    }
  }, [questionSet, headerTitle, primaryColor, secondaryColor, fontFamily, fontSize, includeAnswers, includeExplanations]);

  // Handle Google export
  const handleGoogleExport = useCallback(async (format: string) => {
    setIsExporting(true);

    try {
      const content = format === "google_sheets" ? generateCsvContent() : generateHtmlContent();
      await navigator.clipboard.writeText(content);

      const googleUrls: Record<string, string> = {
        google_docs: "https://docs.google.com/document/create",
        google_sheets: "https://docs.google.com/spreadsheets/create",
        google_slides: "https://docs.google.com/presentation/create",
      };

      window.open(googleUrls[format], "_blank");
      toast.success(`Opening ${format.replace("_", " ")}! Paste your content.`);
      setIsExporting(false);
      onOpenChange(false);

    } catch (error) {
      setIsExporting(false);
      toast.error("Failed to export.");
      console.error("Google export error:", error);
    }
  }, [generateCsvContent, generateHtmlContent, onOpenChange]);

  // Handle main export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 100);

    try {
      const filenameBase = (headerTitle || questionSet.name).toLowerCase().replace(/[^a-z0-9]/g, "_");
      let content = "";
      let filename = "";
      let mimeType = "";

      switch (selectedFormat) {
        case "pdf":
        case "png":
          const htmlContent = generateHtmlContent();
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            if (selectedFormat === "pdf") {
              setTimeout(() => printWindow.print(), 500);
            }
          }
          break;

        case "docx":
          content = generateHtmlContent();
          filename = `${filenameBase}.doc`;
          mimeType = "application/msword";
          downloadFile(content, filename, mimeType);
          break;

        case "pptx":
          // Generate PowerPoint-like HTML
          content = generateHtmlContent();
          filename = `${filenameBase}_slides.html`;
          mimeType = "text/html";
          downloadFile(content, filename, mimeType);
          toast.info("Downloaded as HTML. Use PowerPoint's 'Insert from File' feature.");
          break;

        case "xlsx":
        case "csv":
          content = generateCsvContent();
          filename = `${filenameBase}.${selectedFormat === "csv" ? "csv" : "xlsx"}`;
          mimeType = "text/csv";
          downloadFile(content, filename, mimeType);
          break;

        case "html":
          content = generateHtmlContent();
          filename = `${filenameBase}.html`;
          mimeType = "text/html";
          downloadFile(content, filename, mimeType);
          break;

        case "json":
          content = generateJsonContent();
          filename = `${filenameBase}.json`;
          mimeType = "application/json";
          downloadFile(content, filename, mimeType);
          break;

        default:
          content = generateHtmlContent();
          filename = `${filenameBase}.html`;
          mimeType = "text/html";
          downloadFile(content, filename, mimeType);
      }

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setIsComplete(true);
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setIsExporting(false);
      toast.error("Export failed.");
      console.error("Export error:", error);
    }
  }, [selectedFormat, headerTitle, questionSet, generateHtmlContent, generateCsvContent, generateJsonContent, downloadFile]);

  const handleClose = () => {
    setIsExporting(false);
    setIsComplete(false);
    setProgress(0);
    onOpenChange(false);
  };

  const handlePrint = () => {
    const htmlContent = generateHtmlContent();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#F4511E]/5 to-[#1E3A5F]/5">
          <div>
            <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Download className="w-5 h-5 text-[#F4511E]" />
              Export Question Set
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              {questionSet.name} • {questionSet.questions.length} Questions
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isExporting ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#F4511E] animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">Generating export...</p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-[#F4511E] h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{progress}%</p>
              </div>
            </div>
          ) : isComplete ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-2">Export Complete!</p>
                <p className="text-sm text-gray-500 mb-6">Your question set has been exported.</p>
                <Button className="bg-[#F4511E] hover:bg-[#E64A19]" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel - Options */}
              <div className="w-72 border-r overflow-y-auto p-4 space-y-4 bg-gray-50">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 h-9">
                    <TabsTrigger value="download">Download</TabsTrigger>
                    <TabsTrigger value="cloud">Cloud</TabsTrigger>
                  </TabsList>

                  <TabsContent value="download" className="mt-3 space-y-2">
                    {exportFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all",
                          selectedFormat === format.id
                            ? "border-[#F4511E] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                      >
                        <format.icon className={cn(
                          "w-4 h-4",
                          selectedFormat === format.id ? "text-[#F4511E]" : "text-gray-500"
                        )} />
                        <div>
                          <div className={cn(
                            "text-sm font-medium",
                            selectedFormat === format.id ? "text-[#F4511E]" : "text-gray-700"
                          )}>
                            {format.label}
                          </div>
                          <div className="text-xs text-gray-400">{format.description}</div>
                        </div>
                      </button>
                    ))}
                  </TabsContent>

                  <TabsContent value="cloud" className="mt-3 space-y-2">
                    {cloudFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedCloudFormat(format.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all",
                          selectedCloudFormat === format.id
                            ? "border-[#F4511E] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                      >
                        <format.icon className={cn(
                          "w-4 h-4",
                          selectedCloudFormat === format.id ? "text-[#F4511E]" : "text-gray-500"
                        )} />
                        <div className="text-left">
                          <div className={cn(
                            "text-sm font-medium",
                            selectedCloudFormat === format.id ? "text-[#F4511E]" : "text-gray-700"
                          )}>
                            {format.label}
                            {format.isNew && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">NEW</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{format.description}</div>
                        </div>
                      </button>
                    ))}
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Actions</Label>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" /> Print Directly
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={async () => {
                    const shareText = `${questionSet.name}\n\nSet Code: ${questionSet.set_code}\nSubject: ${questionSet.subject}\nTotal Questions: ${questionSet.questions.length}`;
                    await navigator.clipboard.writeText(shareText);
                    toast.success("Link copied to clipboard!");
                  }}>
                    <Link2 className="w-4 h-4 mr-2" /> Copy Share Link
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                    const subject = encodeURIComponent(questionSet.name);
                    const body = encodeURIComponent(`Set Code: ${questionSet.set_code}\nSubject: ${questionSet.subject}\nTotal Questions: ${questionSet.questions.length}`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}>
                    <Mail className="w-4 h-4 mr-2" /> Send via Email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={async () => {
                    const text = `${questionSet.name}\n\nSet Code: ${questionSet.set_code}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  }}>
                    <Share2 className="w-4 h-4 mr-2" /> WhatsApp
                  </Button>
                </div>
              </div>

              {/* Right Panel - Customization Options */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Header Section */}
                  <details className="group" open>
                    <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-medium text-sm">Header Settings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={headerEnabled}
                          onCheckedChange={setHeaderEnabled}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </summary>
                    {headerEnabled && (
                      <div className="mt-2 p-3 bg-white rounded-lg border space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500">Title</Label>
                            <Input
                              value={headerTitle}
                              onChange={(e) => setHeaderTitle(e.target.value)}
                              className="h-8 mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Subtitle</Label>
                            <Input
                              value={headerSubtitle}
                              onChange={(e) => setHeaderSubtitle(e.target.value)}
                              className="h-8 mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Logo URL</Label>
                          <Input
                            value={headerLogo}
                            onChange={(e) => setHeaderLogo(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="h-8 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Alignment</Label>
                          <div className="flex gap-2 mt-1">
                            {(["left", "center", "right"] as const).map((align) => (
                              <button
                                key={align}
                                onClick={() => setHeaderAlignment(align)}
                                className={cn(
                                  "flex-1 p-2 rounded border text-xs flex items-center justify-center gap-1",
                                  headerAlignment === align
                                    ? "border-[#F4511E] bg-orange-50 text-[#F4511E]"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                              >
                                {align === "left" && <AlignLeft className="w-3 h-3" />}
                                {align === "center" && <AlignCenter className="w-3 h-3" />}
                                {align === "right" && <AlignRight className="w-3 h-3" />}
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={showSetCode}
                              onChange={(e) => setShowSetCode(e.target.checked)}
                              className="accent-[#F4511E]"
                            />
                            Show Set Code
                          </label>
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={showDate}
                              onChange={(e) => setShowDate(e.target.checked)}
                              className="accent-[#F4511E]"
                            />
                            Show Date
                          </label>
                        </div>
                      </div>
                    )}
                  </details>

                  {/* Footer Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-medium text-sm">Footer Settings</span>
                      </div>
                      <Switch
                        checked={footerEnabled}
                        onCheckedChange={setFooterEnabled}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </summary>
                    {footerEnabled && (
                      <div className="mt-2 p-3 bg-white rounded-lg border space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500">Footer Text</Label>
                          <Input
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            className="h-8 mt-1"
                          />
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={showPageNumbers}
                              onChange={(e) => setShowPageNumbers(e.target.checked)}
                              className="accent-[#F4511E]"
                            />
                            Page Numbers
                          </label>
                        </div>
                      </div>
                    )}
                  </details>

                  {/* Watermark Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-medium text-sm">Watermark</span>
                      </div>
                      <Switch
                        checked={watermarkEnabled}
                        onCheckedChange={setWatermarkEnabled}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </summary>
                    {watermarkEnabled && (
                      <div className="mt-2 p-3 bg-white rounded-lg border space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500">Watermark Text</Label>
                          <Input
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            className="h-8 mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500">Opacity: {watermarkOpacity}%</Label>
                            <Slider
                              value={[watermarkOpacity]}
                              onValueChange={([v]) => setWatermarkOpacity(v)}
                              min={5}
                              max={50}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Size: {watermarkSize}px</Label>
                            <Slider
                              value={[watermarkSize]}
                              onValueChange={([v]) => setWatermarkSize(v)}
                              min={24}
                              max={100}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </details>

                  {/* Typography Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-medium text-sm">Typography</span>
                      </div>
                      <span className="text-xs text-gray-400">{fontFamily}</span>
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-lg border space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Font Family</Label>
                          <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontFamilies.map((font) => (
                                <SelectItem key={font.id} value={font.id}>
                                  <span style={{ fontFamily: font.id }}>{font.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Font Size</Label>
                          <Select value={fontSize} onValueChange={setFontSize}>
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontSizes.map((size) => (
                                <SelectItem key={size.id} value={size.id}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Line Height: {lineHeight}</Label>
                        <Slider
                          value={[lineHeight * 10]}
                          onValueChange={([v]) => setLineHeight(v / 10)}
                          min={12}
                          max={24}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Question Spacing: {questionSpacing}px</Label>
                        <Slider
                          value={[questionSpacing]}
                          onValueChange={([v]) => setQuestionSpacing(v)}
                          min={12}
                          max={48}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Colors Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-medium text-sm">Colors</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded" style={{ background: primaryColor }} />
                        <div className="w-4 h-4 rounded" style={{ background: secondaryColor }} />
                      </div>
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-lg border space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Color Preset</Label>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          {colorPresets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => applyColorPreset(preset.id)}
                              className={cn(
                                "p-2 rounded border text-xs",
                                selectedColorPreset === preset.id
                                  ? "border-[#F4511E] bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex gap-0.5 justify-center mb-1">
                                <div className="w-3 h-3 rounded-sm" style={{ background: preset.primary }} />
                                <div className="w-3 h-3 rounded-sm" style={{ background: preset.secondary }} />
                              </div>
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Primary Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => {
                                setPrimaryColor(e.target.value);
                                setSelectedColorPreset("custom");
                              }}
                              className="w-10 h-8 p-1"
                            />
                            <Input
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="h-8 flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Secondary Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={secondaryColor}
                              onChange={(e) => {
                                setSecondaryColor(e.target.value);
                                setSelectedColorPreset("custom");
                              }}
                              className="w-10 h-8 p-1"
                            />
                            <Input
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="h-8 flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Text Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-10 h-8 p-1"
                            />
                            <Input
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="h-8 flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Background</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="w-10 h-8 p-1"
                            />
                            <Input
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="h-8 flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Layout Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-medium text-sm">Layout</span>
                      </div>
                      <span className="text-xs text-gray-400">{paperSize.toUpperCase()} {orientation}</span>
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-lg border space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Paper Size</Label>
                          <Select value={paperSize} onValueChange={(v) => setPaperSize(v as typeof paperSize)}>
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a4">A4</SelectItem>
                              <SelectItem value="a3">A3</SelectItem>
                              <SelectItem value="letter">US Letter</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Orientation</Label>
                          <Select value={orientation} onValueChange={(v) => setOrientation(v as typeof orientation)}>
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="landscape">Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Margins</Label>
                          <Select value={margin} onValueChange={(v) => setMargin(v as typeof margin)}>
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="narrow">Narrow</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="wide">Wide</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Columns</Label>
                          <Select value={String(columns)} onValueChange={(v) => setColumns(Number(v) as 1 | 2)}>
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Column</SelectItem>
                              <SelectItem value="2">2 Columns</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Question Display Section */}
                  <details className="group" open>
                    <summary className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#F4511E]" />
                        <span className="font-medium text-sm">Question Display</span>
                      </div>
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-lg border space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={includeQuestionNumbers}
                            onChange={(e) => setIncludeQuestionNumbers(e.target.checked)}
                            className="accent-[#F4511E]"
                          />
                          Question Numbers
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={includeMarks}
                            onChange={(e) => setIncludeMarks(e.target.checked)}
                            className="accent-[#F4511E]"
                          />
                          Show Marks
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={includeDifficulty}
                            onChange={(e) => setIncludeDifficulty(e.target.checked)}
                            className="accent-[#F4511E]"
                          />
                          Difficulty Badges
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={includeTypeIcons}
                            onChange={(e) => setIncludeTypeIcons(e.target.checked)}
                            className="accent-[#F4511E]"
                          />
                          Type Badges
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={includeAnswers}
                            onChange={(e) => setIncludeAnswers(e.target.checked)}
                            className="accent-[#F4511E]"
                          />
                          Include Answers
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={includeExplanations}
                            onChange={(e) => setIncludeExplanations(e.target.checked)}
                            className="accent-[#F4511E]"
                          />
                          Include Explanations
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={shuffleQuestions}
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                            className="accent-[#F4511E]"
                          />
                          Shuffle Questions
                        </label>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isExporting && !isComplete && (
          <div className="flex justify-between items-center p-4 border-t bg-gray-50 shrink-0">
            <div className="text-sm text-gray-500">
              {activeTab === "download" ? (
                <>{questionSet.questions.length} questions • {selectedFormat.toUpperCase()} format</>
              ) : (
                <>{questionSet.questions.length} questions • {cloudFormats.find(f => f.id === selectedCloudFormat)?.label} Export</>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {activeTab === "download" ? (
                <Button
                  className="bg-[#F4511E] hover:bg-[#E64A19] gap-2"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  Download {exportFormats.find(f => f.id === selectedFormat)?.label || "PDF"}
                </Button>
              ) : (
                <Button
                  className="bg-[#F4511E] hover:bg-[#E64A19] gap-2"
                  onClick={() => {
                    if (selectedCloudFormat === "canva") handleCanvaExport();
                    else handleGoogleExport(selectedCloudFormat);
                  }}
                >
                  <Globe className="w-4 h-4" />
                  Edit with {cloudFormats.find(f => f.id === selectedCloudFormat)?.label || "Canva"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
