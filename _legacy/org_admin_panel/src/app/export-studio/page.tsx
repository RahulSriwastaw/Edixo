"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ExportStudio } from "@/components/export-studio/ExportStudio";
import { useExportStudio } from "@/components/export-studio/hooks/useExportStudio";

// Mock data bindings for exam results
const mockExamResultsBindings = [
  // Student Info
  { key: "student_name", label: "Student Name", value: "Rahul Kumar", category: "STUDENT" },
  { key: "student_roll", label: "Roll Number", value: "GK-STU-00892", category: "STUDENT" },
  { key: "student_class", label: "Class", value: "Class 12", category: "STUDENT" },
  { key: "student_photo", label: "Student Photo", value: "[image]", category: "STUDENT" },
  
  // Exam Info
  { key: "exam_name", label: "Exam Name", value: "JEE Mock Test 3", category: "EXAM" },
  { key: "exam_date", label: "Exam Date", value: "March 2, 2026", category: "EXAM" },
  { key: "exam_duration", label: "Duration", value: "180 min", category: "EXAM" },
  { key: "total_marks", label: "Total Marks", value: "300", category: "EXAM" },
  { key: "passing_marks", label: "Passing Marks", value: "110", category: "EXAM" },
  
  // Results
  { key: "score", label: "Score", value: "247", category: "RESULTS" },
  { key: "rank", label: "Rank", value: "4 / 48", category: "RESULTS" },
  { key: "percentile", label: "Percentile", value: "94.2%", category: "RESULTS" },
  { key: "grade", label: "Grade", value: "A+", category: "RESULTS" },
  { key: "physics_score", label: "Physics Score", value: "86", category: "SUBJECT SCORES" },
  { key: "chemistry_score", label: "Chemistry Score", value: "91", category: "SUBJECT SCORES" },
  { key: "maths_score", label: "Maths Score", value: "70", category: "SUBJECT SCORES" },
  
  // Org
  { key: "org_name", label: "Organization", value: "Apex Academy", category: "ORG" },
  { key: "org_logo", label: "Org Logo", value: "[image]", category: "ORG" },
  { key: "org_tagline", label: "Tagline", value: "Excellence in Education", category: "ORG" },
  { key: "org_address", label: "Address", value: "Mumbai, Maharashtra", category: "ORG" },
  
  // System
  { key: "today_date", label: "Today's Date", value: "March 2, 2026", category: "SYSTEM" },
  { key: "page_number", label: "Page Number", value: "Auto", category: "SYSTEM" },
  { key: "total_pages", label: "Total Pages", value: "Auto", category: "SYSTEM" },
];

// Mock templates
export const mockTemplates = [
  { id: "t1", name: "JEE Paper Classic", category: "Question Papers", thumbnail: "#E8F4FD" },
  { id: "t2", name: "NEET Paper Modern", category: "Question Papers", thumbnail: "#FEF3E2" },
  { id: "t3", name: "Result Sheet Standard", category: "Result Sheets", thumbnail: "#E8F5E9" },
  { id: "t4", name: "Certificate Elegant", category: "Certificates", thumbnail: "#FFF8E1" },
  { id: "t5", name: "Analytics Report", category: "Reports", thumbnail: "#F3E5F5" },
  { id: "t6", name: "Invoice Clean", category: "Invoices", thumbnail: "#E3F2FD" },
];

export default function ExportStudioPage() {
  const searchParams = useSearchParams();
  const sourceModule = searchParams.get("module") || "exam_results";
  const sourceId = searchParams.get("id") || "";
  
  const { 
    setTitle, 
    setSourceData, 
    setDataBindings, 
    setOrgBranding,
    addElement,
    pages,
    currentPageIndex,
  } = useExportStudio();

  useEffect(() => {
    // Initialize based on module
    if (sourceModule === "exam_results") {
      setTitle("Exam Results — JEE Mock Test 3");
      setSourceData("exam_results", { examId: sourceId });
      setDataBindings(mockExamResultsBindings);
      setOrgBranding({
        name: "Apex Academy",
        logo: "/logo.png",
        color: "#F4511E",
      });
      
      // Add sample elements to demonstrate the canvas
      if (pages[0]?.elements.length === 0) {
        // Header
        addElement({
          id: "header_1",
          type: "text",
          position: { x: 50, y: 40 },
          size: { width: 700, height: 40 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "APEX ACADEMY",
            fontFamily: "DM Serif Display",
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
          },
          style: {
            color: "#F4511E",
          },
          dataBinding: undefined,
        });

        // Subtitle
        addElement({
          id: "subtitle_1",
          type: "text",
          position: { x: 50, y: 85 },
          size: { width: 700, height: 30 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "Excellence in Education",
            fontFamily: "DM Sans",
            fontSize: 14,
            fontStyle: "italic",
            textAlign: "center",
          },
          style: {
            color: "#6B7280",
          },
        });

        // Title
        addElement({
          id: "title_1",
          type: "text",
          position: { x: 50, y: 140 },
          size: { width: 700, height: 35 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "EXAMINATION RESULT",
            fontFamily: "DM Serif Display",
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
          },
          style: {
            color: "#1E3A5F",
          },
        });

        // Student Name Label
        addElement({
          id: "label_name",
          type: "text",
          position: { x: 60, y: 200 },
          size: { width: 120, height: 24 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "Student Name:",
            fontFamily: "DM Sans",
            fontSize: 13,
            fontWeight: "600",
          },
          style: {
            color: "#374151",
          },
        });

        // Student Name Value
        addElement({
          id: "value_name",
          type: "text",
          position: { x: 190, y: 200 },
          size: { width: 200, height: 24 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "Rahul Kumar",
            fontFamily: "DM Sans",
            fontSize: 13,
          },
          style: {
            color: "#111827",
          },
          dataBinding: "student_name",
        });

        // Roll Number Label
        addElement({
          id: "label_roll",
          type: "text",
          position: { x: 400, y: 200 },
          size: { width: 100, height: 24 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "Roll No:",
            fontFamily: "DM Sans",
            fontSize: 13,
            fontWeight: "600",
          },
          style: {
            color: "#374151",
          },
        });

        // Roll Number Value
        addElement({
          id: "value_roll",
          type: "text",
          position: { x: 510, y: 200 },
          size: { width: 150, height: 24 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "GK-STU-00892",
            fontFamily: "DM Sans",
            fontSize: 13,
          },
          style: {
            color: "#111827",
          },
          dataBinding: "student_roll",
        });

        // Score Box
        addElement({
          id: "score_box",
          type: "shape",
          position: { x: 280, y: 280 },
          size: { width: 250, height: 100 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            shapeType: "rectangle",
          },
          style: {
            fill: "#FFF7ED",
            stroke: "#F4511E",
            strokeWidth: 2,
            borderRadius: 8,
          },
        });

        // Score Label
        addElement({
          id: "score_label",
          type: "text",
          position: { x: 280, y: 295 },
          size: { width: 250, height: 24 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "TOTAL SCORE",
            fontFamily: "DM Sans",
            fontSize: 12,
            textAlign: "center",
          },
          style: {
            color: "#6B7280",
          },
        });

        // Score Value
        addElement({
          id: "score_value",
          type: "text",
          position: { x: 280, y: 320 },
          size: { width: 250, height: 50 },
          rotation: 0,
          opacity: 1,
          locked: false,
          content: {
            text: "247 / 300",
            fontFamily: "DM Serif Display",
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "center",
          },
          style: {
            color: "#F4511E",
          },
          dataBinding: "score",
        });
      }
    }
  }, [sourceModule, sourceId]);

  return <ExportStudio />;
}
