"use client";

import { Suspense, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ExportStudio } from "@/components/export-studio/ExportStudio";
import { useExportStudio, type CanvasElement } from "@/components/export-studio/hooks/useExportStudio";

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

// Build canvas elements for one question (returns array of elements)
function buildQuestionElements(
  q: any,
  questionNumber: number,
  startY: number = 40
): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const id = `q${questionNumber}`;
  let y = startY;

  // Question number badge
  elements.push({
    id: `${id}_num`,
    type: "text",
    position: { x: 40, y },
    size: { width: 714, height: 24 },
    rotation: 0,
    opacity: 1,
    locked: false,
    content: {
      text: `Q${questionNumber}.`,
      fontFamily: "DM Sans",
      fontSize: 13,
      fontWeight: "700",
    },
    style: { color: "#F4511E" },
  });

  // Question text
  const questionText = stripHtml(q.textEn || q.textHi || "Untitled Question");
  elements.push({
    id: `${id}_text`,
    type: "text",
    position: { x: 40, y: y + 24 },
    size: { width: 714, height: 60 },
    rotation: 0,
    opacity: 1,
    locked: false,
    content: {
      text: questionText,
      fontFamily: "DM Sans",
      fontSize: 13,
      fontWeight: "500",
    },
    style: { color: "#111827" },
  });

  y += 96;

  // Options (MCQ)
  const optionLabels = ["A", "B", "C", "D", "E"];
  if (q.options && q.options.length > 0) {
    q.options.slice(0, 5).forEach((opt: any, i: number) => {
      const optText = stripHtml(opt.textEn || opt.textHi || `Option ${optionLabels[i]}`);
      const isCorrect = opt.isCorrect === true;

      // Option row background (highlight correct)
      elements.push({
        id: `${id}_opt${i}_bg`,
        type: "shape",
        position: { x: 40, y },
        size: { width: 714, height: 28 },
        rotation: 0,
        opacity: 1,
        locked: false,
        content: { shapeType: "rectangle" },
        style: {
          fill: isCorrect ? "#F0FDF4" : "#F9FAFB",
          stroke: isCorrect ? "#22C55E" : "#E5E7EB",
          strokeWidth: 1,
          borderRadius: 4,
        },
      });

      // Option label
      elements.push({
        id: `${id}_opt${i}_label`,
        type: "text",
        position: { x: 50, y: y + 4 },
        size: { width: 24, height: 20 },
        rotation: 0,
        opacity: 1,
        locked: false,
        content: {
          text: `(${optionLabels[i]})`,
          fontFamily: "DM Sans",
          fontSize: 12,
          fontWeight: isCorrect ? "700" : "400",
        },
        style: { color: isCorrect ? "#16A34A" : "#6B7280" },
      });

      // Option text
      elements.push({
        id: `${id}_opt${i}_text`,
        type: "text",
        position: { x: 78, y: y + 4 },
        size: { width: 670, height: 20 },
        rotation: 0,
        opacity: 1,
        locked: false,
        content: {
          text: optText,
          fontFamily: "DM Sans",
          fontSize: 12,
          fontWeight: isCorrect ? "600" : "400",
        },
        style: { color: isCorrect ? "#16A34A" : "#374151" },
      });

      y += 34;
    });
  }

  // Separator line
  y += 8;
  elements.push({
    id: `${id}_sep`,
    type: "shape",
    position: { x: 40, y },
    size: { width: 714, height: 1 },
    rotation: 0,
    opacity: 1,
    locked: false,
    content: { shapeType: "rectangle" },
    style: { fill: "#E5E7EB", stroke: "transparent", strokeWidth: 0, borderRadius: 0 },
  });

  return elements;
}

// Header elements for the page
function buildHeaderElements(setName: string): CanvasElement[] {
  return [
    {
      id: "header_title",
      type: "text",
      position: { x: 40, y: 30 },
      size: { width: 714, height: 36 },
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
      id: "header_sep",
      type: "shape",
      position: { x: 40, y: 72 },
      size: { width: 714, height: 2 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: { shapeType: "rectangle" },
      style: { fill: "#F4511E", stroke: "transparent", strokeWidth: 0, borderRadius: 0 },
    },
  ];
}

// ─── Questions Loader (as a hook-based inner component) ───────────────────────

function QuestionSetLoader({ setId }: { setId: string }) {
  const { setTitle, addElement, addPage, pages, setCurrentPage } = useExportStudio();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const load = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/qbank/sets/${setId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;

        const { data } = await res.json();
        const setName = data?.name || "Question Set";
        const questions: any[] = data?.items?.map((item: any) => item.question) || [];

        if (questions.length === 0) return;

        setTitle(setName);

        // --- Layout logic ---
        // Each A4 page fits ~4-5 questions depending on options.
        // Strategy: pack questions greedily into pages.
        const HEADER_HEIGHT = 90; // top header (name + separator)
        const PAGE_HEIGHT = 1123;
        const MARGIN_BOTTOM = 40;
        const QUESTION_HEIGHT = 230; // approx height per question (text + 4 opts + separator)

        const pageGroups: CanvasElement[][] = [];
        let currentPageElements: CanvasElement[] = [];
        let currentY = HEADER_HEIGHT;
        let isFirstPage = true;

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const questionNum = i + 1;

          // Estimate height for this question
          const optCount = q.options?.length || 0;
          const height = 24 + 60 + (optCount * 34) + 16; // num + text + opts + separator

          if (!isFirstPage && currentY + height > PAGE_HEIGHT - MARGIN_BOTTOM) {
            // Save current page and start new one
            pageGroups.push(currentPageElements);
            currentPageElements = [];
            currentY = 40;
          }

          if (isFirstPage) {
            currentPageElements.push(...buildHeaderElements(setName));
            isFirstPage = false;
          }

          currentPageElements.push(
            ...buildQuestionElements(q, questionNum, currentY)
          );
          currentY += height + 10;
        }

        // Push last page
        if (currentPageElements.length > 0) {
          pageGroups.push(currentPageElements);
        }

        // Add all elements to page 0 (already exists)
        if (pageGroups[0]) {
          pageGroups[0].forEach((el) => addElement(el, 0));
        }

        // Add extra pages and their elements
        for (let p = 1; p < pageGroups.length; p++) {
          addPage();
          // addPage() sets currentPageIndex to new page — wait one tick
          await new Promise((r) => setTimeout(r, 50));
          pageGroups[p].forEach((el) => addElement(el, p));
        }

        // Go back to page 1
        setCurrentPage(0);
      } catch (err) {
        console.error("Failed to load question set:", err);
      }
    };

    load();
  }, [setId]);

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
