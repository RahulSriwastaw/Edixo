"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ExportStudio } from "@/components/export-studio/ExportStudio";
import { useExportStudio, type CanvasElement, type Page } from "@/components/export-studio/hooks/useExportStudio";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
  return match ? match[1] : "";
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/\\[()[\]]/g, "").trim();
}

// Build canvas elements for one question
function buildQuestionElements(
  q: any,
  questionNumber: number,
  startY: number = 40,
  startX: number = 40,
  width: number = 714,
  settings: any,
  idPrefix: string
): { elements: CanvasElement[]; height: number } {
  const elements: CanvasElement[] = [];
  const qId = `${idPrefix}_q${questionNumber}`;
  let y = startY;
  const padding = settings.questionPadding || 10;
  const showBox = settings.showQuestionBox;
  const optionGap = settings.optionGap || 4;
  const baseFontSize = settings.fontSize || 12;

  // Combine Question text based on settings
  let questionText = "";
  const hasEn = !!q.textEn;
  const hasHi = !!q.textHi;
  
  if (!settings.hideQuestion) {
    if (settings.showEn && settings.showHi && hasEn && hasHi) {
      if (settings.primaryLanguage === 'hi') {
        questionText = `${stripHtml(q.textHi)}\n${stripHtml(q.textEn)}`;
      } else {
        questionText = `${stripHtml(q.textEn)}\n${stripHtml(q.textHi)}`;
      }
    } else if (settings.showEn && hasEn) {
      questionText = stripHtml(q.textEn);
    } else if (settings.showHi && hasHi) {
      questionText = stripHtml(q.textHi);
    }
    
    if (!questionText) questionText = stripHtml(q.textEn || q.textHi || "Untitled Question");
  }
  
  // Height estimation (Refined for multi-line consistency)
  const charsPerLine = Math.floor((width - padding * 2) / (baseFontSize * 0.46));
  const qLines = questionText ? Math.ceil(questionText.length / (charsPerLine * 1.05)) + (questionText.split('\n').length - 1) : 0;
  const qTextHeight = questionText ? Math.max(1, qLines) * (baseFontSize * 1.45) + 6 : 0; 

  if (questionText) {
    elements.push({
      id: `${qId}_text`,
      role: "question_text",
      type: "text",
      position: { x: startX + padding, y: y + padding },
      size: { width: width - (padding * 2), height: qTextHeight },
      rotation: 0,
      opacity: settings.questionOpacity ? 0.5 : 1,
      locked: false,
      content: {
        text: `Q${questionNumber}. ${questionText}`,
        fontFamily: "DM Sans",
        fontSize: baseFontSize,
        fontWeight: settings.questionBoldness || "500",
        textAlign: "left",
      },
      style: { color: "#111827", lineHeight: 1.4 },
    });
  }

  let currentY = y + qTextHeight + (questionText ? (settings.questionToOptionsGap ?? 8) : 0) + padding;
  
  // Previous Year Tag (Repositioned below question)
  const pyText = q.previousYear || [q.exam, q.year].filter(Boolean).join(" ");
  if (settings.showPreviousYearTag && pyText) {
    elements.push({
      id: `${qId}_py_tag`,
      role: "py_tag",
      type: "text",
      position: { 
        x: startX + padding + settings.pyTagOffsetX, 
        y: currentY + settings.pyTagOffsetY 
      },
      size: { width: width - (padding * 2), height: Math.max(16, settings.pyTagFontSize + 4) },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: {
        text: pyText,
        fontSize: settings.pyTagFontSize,
        fontWeight: "bold",
        textAlign: "left"
      },
      style: { color: settings.pyTagColor }
    });
    currentY += Math.max(14, settings.pyTagFontSize + 5) + settings.pyTagOffsetY;
  }

  // Options
  const optionLabels = ["A", "B", "C", "D", "E"];
  if (!settings.hideOption && q.options && q.options.length > 0) {
    q.options.slice(0, 5).forEach((opt: any, i: number) => {
      let optText = "";
      const optHasEn = !!opt.textEn;
      const optHasHi = !!opt.textHi;
      
      if (settings.showEn && settings.showHi && optHasEn && optHasHi) {
        if (settings.primaryLanguage === 'hi') {
          optText = `${stripHtml(opt.textHi)}\n${stripHtml(opt.textEn)}`;
        } else {
          optText = `${stripHtml(opt.textEn)}\n${stripHtml(opt.textHi)}`;
        }
      } else if (settings.showEn && optHasEn) {
        optText = stripHtml(opt.textEn);
      } else if (settings.showHi && optHasHi) {
        optText = stripHtml(opt.textHi);
      }
      
      if (!optText) optText = stripHtml(opt.textEn || opt.textHi || `Option ${optionLabels[i]}`);

      const isCorrect = opt.isCorrect === true && settings.showSolutions;
      const showOptBox = settings.showOptionBox;

      // Estimate option text height (Refined)
      const optCharsPerLine = Math.floor((width - padding * 2 - 48) / (baseFontSize * 0.46));
      const optLines = Math.max(1, Math.ceil(optText.length / optCharsPerLine) + (optText.split('\n').length - 1));
      const optTextHeight = Math.max(20, optLines * (baseFontSize * 1.4));
      const optTotalHeight = optTextHeight + 8; 

      elements.push({
        id: `${qId}_opt${i}_bg`,
        role: "option_bg",
        type: "shape",
        position: { x: startX + padding, y: currentY },
        size: { width: width - (padding * 2), height: optTotalHeight },
        rotation: 0,
        opacity: settings.optionOpacity ? 0.5 : 1,
        locked: false,
        content: { shapeType: "rectangle" },
        style: {
          fill: (isCorrect && settings.answerBold) ? "#F0FDF4" : (showOptBox ? "#F9FAFB" : "transparent"),
          stroke: (isCorrect && settings.answerBold) ? "#22C55E" : (showOptBox ? "#E5E7EB" : "transparent"),
          strokeWidth: ((isCorrect && settings.answerBold) || showOptBox) ? 1 : 0,
          borderRadius: 4,
        },
      });

      elements.push({
        id: `${qId}_opt${i}_label`,
        role: "option_label",
        type: "text",
        position: { x: startX + padding + 10, y: currentY + 4 },
        size: { width: 30, height: 20 },
        rotation: 0,
        opacity: 1,
        locked: false,
        content: {
          text: `(${optionLabels[i]})`,
          fontFamily: "DM Sans",
          fontSize: (isCorrect && settings.answerBold) ? (settings.solutionFontSize || baseFontSize) : (baseFontSize - 1),
          fontWeight: (isCorrect && settings.answerBold) ? "bold" : "400",
        },
        style: { color: (isCorrect && settings.answerBold) ? "#16A34A" : "#6B7280" },
      });

      elements.push({
        id: `${qId}_opt${i}_text`,
        role: "option_text",
        type: "text",
        position: { x: startX + padding + 42, y: currentY + 4 },
        size: { width: width - (padding * 2) - 52, height: optTextHeight },
        rotation: 0,
        opacity: 1,
        locked: false,
        content: {
          text: optText,
          fontFamily: "DM Sans",
          fontSize: (isCorrect && settings.answerBold) ? (settings.solutionFontSize || baseFontSize) : (baseFontSize - 1),
          fontWeight: (isCorrect && settings.answerBold) ? settings.solutionBoldness : settings.optionBoldness,
        },
        style: { color: (isCorrect && settings.answerBold) ? "#16A34A" : "#374151" },
      });

      currentY += optTotalHeight + optionGap;
    });
  }

  // QR Code
  if (settings.showQR) {
    elements.push({
      id: `${qId}_qr`,
      role: "qr_code",
      type: "image",
      position: { x: startX + width - 50, y: currentY },
      size: { width: 40, height: 40 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: { src: "/qr-placeholder.png", alt: "QR Code" },
      style: {}
    });
    currentY += 45;
  }

  // Book Indicator
  if (settings.showBook) {
    elements.push({
      id: `${qId}_book`,
      role: "book_indicator",
      type: "text",
      position: { x: startX + width - 120, y: currentY - 20 },
      size: { width: 40, height: 16 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: {
        text: "📖 BOOK",
        fontSize: 9,
        fontWeight: "bold"
      },
      style: { color: "#4F46E5" }
    });
  }

  // Answer Widget (Removed per-question, now global at the end)
  /*
  if (settings.showAnswerWidget && settings.showSolutions) {
    ...
  }
  */

  // Answer With Description (Explanations)
  if (settings.showAnswerWithDesc && settings.showSolutions) {
    let explText = "";
    const hasExplEn = !!q.explanationEn;
    const hasExplHi = !!q.explanationHi;

    const lang = settings.explanationLanguage || 'both';
    if (lang === 'en' && hasExplEn) {
      explText = stripHtml(q.explanationEn);
    } else if (lang === 'hi' && hasExplHi) {
      explText = stripHtml(q.explanationHi);
    } else if (lang === 'both') {
      if (hasExplEn && hasExplHi) {
        explText = settings.primaryLanguage === 'hi' 
          ? `${stripHtml(q.explanationHi)}\n${stripHtml(q.explanationEn)}`
          : `${stripHtml(q.explanationEn)}\n${stripHtml(q.explanationHi)}`;
      } else {
        explText = stripHtml(q.explanationHi || q.explanationEn);
      }
    }
    
    if (explText) {
      const explFontSize = settings.explanationFontSize || 10;
      const explCharsPerLine = Math.floor((width - padding * 2) / (explFontSize * 0.46));
      const explLines = Math.ceil(explText.length / (explCharsPerLine * 1.05)) + (explText.split('\n').length - 1);
      const explHeight = Math.max(1, explLines) * (explFontSize * 1.45) + 6;
      
      elements.push({
        id: `${qId}_expl`,
        role: "explanation",
        type: "text",
        position: { x: startX + padding, y: currentY },
        size: { width: width - (padding * 2), height: explHeight },
        rotation: 0,
        opacity: 1,
        locked: false,
        content: {
          text: `Expl: ${explText}`,
          fontSize: explFontSize,
          fontWeight: "400"
        },
        style: { color: settings.explanationColor || "#6B7280" }
      });
      currentY += explHeight + 8;
    }
  }

  const finalHeight = currentY - y + padding - optionGap;

  // Box (Explanation Box) logic
  if (showBox && settings.showExplanation) {
    elements.unshift({
      id: `${qId}_box`,
      role: "question_box",
      type: "shape",
      position: { x: startX, y },
      size: { width: width, height: finalHeight },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: { shapeType: "rectangle" },
      style: { fill: "transparent", stroke: "#E5E7EB", strokeWidth: 1, borderRadius: 8 },
    });
  } else if (!showBox) {
    elements.push({
      id: `${qId}_sep`,
      role: "question_separator",
      type: "shape",
      position: { x: startX, y: y + finalHeight - 2 },
      size: { width: width, height: 1 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: { shapeType: "rectangle" },
      style: { fill: "#E5E7EB", stroke: "transparent", strokeWidth: 0, borderRadius: 0 },
    });
  }

  return { elements, height: finalHeight };
}

// Header elements
function buildHeaderElements(setName: string, startX: number, width: number, idPrefix: string, settings: any): CanvasElement[] {
  if (!settings.showHeader) return [];
  
  const els: CanvasElement[] = [
    {
      id: `${idPrefix}_header_title`,
      role: "header_title",
      type: "text",
      position: { x: startX, y: 30 },
      size: { width: width, height: 36 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: {
        text: setName,
        fontFamily: "DM Serif Display",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
      },
      style: { color: "#1E3A5F" },
    },
    {
      id: `${idPrefix}_header_sep`,
      role: "header_separator",
      type: "shape",
      position: { x: startX, y: 72 },
      size: { width: width, height: 2 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: { shapeType: "rectangle" },
      style: { fill: "#F4511E", stroke: "transparent", strokeWidth: 0, borderRadius: 0 },
    },
  ];

  if (settings.firstLogo) {
    els.push({
      id: `${idPrefix}_logo1`,
      role: "logo",
      type: "image",
      position: { x: startX + 10, y: 20 },
      size: { width: 50, height: 50 },
      rotation: 0, opacity: 1, locked: false,
      content: { src: settings.firstLogo, alt: "Logo 1" },
      style: {}
    });
  }

  if (settings.secondLogo) {
    els.push({
      id: `${idPrefix}_logo2`,
      role: "logo",
      type: "image",
      position: { x: startX + width - 60, y: 20 },
      size: { width: 50, height: 50 },
      rotation: 0, opacity: 1, locked: false,
      content: { src: settings.secondLogo, alt: "Logo 2" },
      style: {}
    });
  }

  return els;
}

// Build global answer key elements
function buildAnswerKeyElements(
  questions: any[],
  startY: number,
  startX: number,
  width: number,
  idPrefix: string
): { elements: CanvasElement[]; height: number } {
  const elements: CanvasElement[] = [];
  let currentY = startY;
  const optionLabels = ["A", "B", "C", "D", "E"];

  // Header for Answer Key
  elements.push({
    id: `${idPrefix}_ak_header`,
    role: "answer_key_header",
    type: "text",
    position: { x: startX, y: currentY },
    size: { width: width, height: 24 },
    rotation: 0, opacity: 1, locked: false,
    content: {
      text: "ANSWER KEY",
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center"
    },
    style: { color: "#1E293B" }
  });
  
  // Decorative line
  elements.push({
    id: `${idPrefix}_ak_line`,
    role: "ak_divider",
    type: "shape",
    position: { x: startX + width/2 - 50, y: currentY + 22 },
    size: { width: 100, height: 2 },
    rotation: 0, opacity: 1, locked: false,
    content: { shapeType: "rectangle" },
    style: { fill: "#334155", stroke: "transparent", strokeWidth: 0 }
  });
  
  currentY += 40;

  const boxWidth = 52;
  const boxHeight = 24;
  const hGap = 4;
  const vGap = 8;
  const segmentGap = 12; // Extra gap every 5 items
  const boxesPerRow = Math.floor(width / (boxWidth + hGap + (segmentGap / 5)));
  
  // Calculate centering offset for the entire grid based on actual items if less than a full row
  const boxesInFullRow = Math.min(questions.length, boxesPerRow);
  const actualRowWidth = (boxesInFullRow * boxWidth) + (Math.max(0, boxesInFullRow - 1) * hGap) + (Math.floor(Math.max(0, boxesInFullRow - 1) / 5) * segmentGap);
  const centeringX = (width - actualRowWidth) / 2;

  questions.forEach((q, i) => {
    const row = Math.floor(i / boxesPerRow);
    const col = i % boxesPerRow;
    const segmentOffset = Math.floor(col / 5) * segmentGap;
    
    const x = startX + centeringX + (col * (boxWidth + hGap)) + segmentOffset;
    const y = currentY + (row * (boxHeight + vGap));

    const correctOptIndex = q.options?.findIndex((o: any) => o.isCorrect === true);
    const label = correctOptIndex !== -1 ? optionLabels[correctOptIndex] : "?";

    // Compact Bordered Box
    elements.push({
      id: `${idPrefix}_ak_box_${i}`,
      role: "answer_key_box",
      type: "shape",
      position: { x, y },
      size: { width: boxWidth, height: boxHeight },
      rotation: 0, opacity: 1, locked: false,
      content: { shapeType: "rectangle" },
      style: { fill: "#F8FAFC", stroke: "#CBD5E1", strokeWidth: 1, borderRadius: 2 }
    });

    // Content: "1. A"
    elements.push({
      id: `${idPrefix}_ak_text_${i}`,
      role: "answer_key_text",
      type: "text",
      position: { x, y: y + 6 },
      size: { width: boxWidth, height: boxHeight - 12 },
      rotation: 0, opacity: 1, locked: false,
      content: {
        text: `${i + 1}. ${label}`,
        fontSize: 10,
        fontWeight: "700",
        textAlign: "center"
      },
      style: { color: "#334155" }
    });
  });

  const numRows = Math.ceil(questions.length / boxesPerRow);
  const totalHeight = 40 + (numRows * (boxHeight + vGap));

  return { elements, height: totalHeight };
}

// ─── Questions Loader ───

function QuestionSetLoader({ setId }: { setId: string }) {
  const { 
    setTitle, setPages,
    layoutSettings 
  } = useExportStudio();
  
  const rawQuestions = useRef<any[]>([]);
  const currentSetName = useRef<string>("");
  const fetchInitialized = useRef(false);

  // Rebuild layout
  const rebuildLayout = (questions: any[], setName: string) => {
    const { numColumns, columnGap, itemGap, pageMargins } = layoutSettings;
    const { selectedSubject } = useExportStudio.getState();
    const rebuildId = `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;

    // Filter questions by subject
    let filteredQuestions = selectedSubject === "All Subjects" 
      ? questions 
      : questions.filter(q => q.subject?.name === selectedSubject);

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;
    
    const mTop = pageMargins.top;
    const mRight = pageMargins.right;
    const mBottom = pageMargins.bottom;
    const mLeft = pageMargins.left;

    const HEADER_HEIGHT = layoutSettings.showHeader ? 90 : 0;

    const availableWidth = PAGE_WIDTH - mLeft - mRight;
    const columnWidth = numColumns === 1 
      ? availableWidth 
      : (availableWidth - columnGap) / 2;

    const pages: Page[] = [];
    let currentElements: CanvasElement[] = [];
    let currentY = [mTop + HEADER_HEIGHT, numColumns === 2 ? mTop + HEADER_HEIGHT : 0];
    let currentColumn = 0;
    let isFirstPage = true;

    for (let i = 0; i < filteredQuestions.length; i++) {
      const q = filteredQuestions[i];
      const questionNum = i + 1;

      // Calculate height
      const { height } = buildQuestionElements(q, questionNum, 0, 0, columnWidth, layoutSettings, rebuildId);
      
      if (currentY[currentColumn] + height > PAGE_HEIGHT - mBottom) {
        if (numColumns === 2 && currentColumn === 0) {
          currentColumn = 1;
        } else {
          // Add watermark to full page before pushing
          if (layoutSettings.showWatermark && layoutSettings.watermarkText) {
            currentElements.unshift({
              id: `wm_${rebuildId}_${pages.length}`,
              role: "watermark",
              type: "text",
              position: { x: PAGE_WIDTH / 2 - 150, y: PAGE_HEIGHT / 2 - 50 },
              size: { width: 300, height: 100 },
              rotation: -45,
              opacity: 0.1,
              locked: true,
              content: {
                text: layoutSettings.watermarkText,
                fontSize: 60,
                fontWeight: "bold",
                textAlign: "center"
              },
              style: { color: "#000000" }
            });
          }

          pages.push({
            id: `p_${rebuildId}_${pages.length}`,
            elements: currentElements,
            background: "#ffffff",
          });
          currentElements = [];
          currentColumn = 0;
          currentY = [mTop, mTop];
          isFirstPage = false;
        }
      }

      if (isFirstPage && currentElements.length === 0) {
        currentElements.push(...buildHeaderElements(setName, mLeft, availableWidth, rebuildId, layoutSettings));
      }

      const startX = mLeft + (currentColumn * (columnWidth + columnGap));
      const { elements: qElements } = buildQuestionElements(
        q, 
        questionNum, 
        currentY[currentColumn], 
        startX, 
        columnWidth, 
        layoutSettings,
        rebuildId
      );

      currentElements.push(...qElements);
      currentY[currentColumn] += height + itemGap;
    }

    if (currentElements.length > 0 || pages.length === 0) {
      if (layoutSettings.showAnswerWidget) {
        const tallestColumnY = Math.max(...currentY);
        const { elements: akElements, height: akHeight } = buildAnswerKeyElements(
          filteredQuestions,
          tallestColumnY + 20,
          mLeft,
          availableWidth,
          rebuildId
        );
        
        // If it doesn't fit, start a new page
        if (tallestColumnY + akHeight > PAGE_HEIGHT - mBottom) {
          // Push current page
          pages.push({
            id: `p_${rebuildId}_pre_ak`,
            elements: currentElements,
            background: "#ffffff",
          });
          // Start answer key on new page
          const { elements: akElementsFull, height: _ } = buildAnswerKeyElements(
            filteredQuestions,
            mTop,
            mLeft,
            availableWidth,
            rebuildId
          );
          currentElements = akElementsFull;
        } else {
          currentElements.push(...akElements);
        }
      }

      if (layoutSettings.showWatermark && layoutSettings.watermarkText) {
        currentElements.unshift({
          id: `wm_${rebuildId}_final`,
          role: "watermark",
          type: "text",
          position: { x: PAGE_WIDTH / 2 - 150, y: PAGE_HEIGHT / 2 - 50 },
          size: { width: 300, height: 100 },
          rotation: -45,
          opacity: 0.1,
          locked: true,
          content: {
            text: layoutSettings.watermarkText,
            fontSize: 60,
            fontWeight: "bold",
            textAlign: "center"
          },
          style: { color: "#000000" }
        });
      }
      pages.push({
        id: `p_${rebuildId}_final`,
        elements: currentElements,
        background: "#ffffff",
      });
    }

    setPages(pages);
  };

  useEffect(() => {
    if (fetchInitialized.current) return;
    fetchInitialized.current = true;

    const fetchData = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/qbank/sets/${setId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;

        const { data } = await res.json();
        currentSetName.current = data?.name || "Question Set";
        const questions = data?.items?.map((item: any) => item.question) || [];
        rawQuestions.current = questions;
        
        // Extract subjects
        const subjects = Array.from(new Set(questions.map((q: any) => q.subject?.name).filter(Boolean))) as string[];
        useExportStudio.getState().setAvailableSubjects(subjects);
        
        setTitle(currentSetName.current);
        rebuildLayout(questions, currentSetName.current);
      } catch (err) {
        console.error("Failed to load question set:", err);
      }
    };

    fetchData();
  }, [setId]);

  useEffect(() => {
    if (rawQuestions.current.length > 0) {
      const timer = setTimeout(() => {
        rebuildLayout(rawQuestions.current, useExportStudio.getState().title || currentSetName.current);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [layoutSettings, useExportStudio(state => state.selectedSubject), useExportStudio(state => state.title)]);

  return <ExportStudio />;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

function ExportPageContent() {
  const params = useParams();
  const setId = params.id as string;
  return <QuestionSetLoader setId={setId} />;
}

export default function QuestionSetExportPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#F4511E] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading Export Studio...</p>
          </div>
        </div>
      }
    >
      <ExportPageContent />
    </Suspense>
  );
}
