"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Upload,
  Bold,
  Italic,
  Subscript,
  Superscript,
  Table,
  Image as ImageIcon,
  Type,
  Languages,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Bilingual option type
interface BilingualOption {
  id: string;
  label: string;
  text_hin: string;
  text_eng: string;
}

// Form state type
interface QuestionForm {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  questionType: string;
  language: string;
  relatedExam: string;
  previousOf: string;
  collection: string;
  sourceType: string;
  question_hin: string;
  question_eng: string;
  solution_hin: string;
  solution_eng: string;
  video: string;
  answer: string;
  answerRangeMin: string;
  answerRangeMax: string;
  visibility: string;
  pointCost: number;
  externalId: string;
  syncCode: string;
  questionNo: string;
  tags: string[];
}

const initialForm: QuestionForm = {
  subject: "",
  chapter: "",
  topic: "",
  difficulty: "medium",
  questionType: "mcq",
  language: "bilingual",
  relatedExam: "",
  previousOf: "",
  collection: "",
  sourceType: "original",
  question_hin: "",
  question_eng: "",
  solution_hin: "",
  solution_eng: "",
  video: "",
  answer: "",
  answerRangeMin: "",
  answerRangeMax: "",
  visibility: "private",
  pointCost: 5,
  externalId: "",
  syncCode: "",
  questionNo: "",
  tags: [],
};

// Mock questions data - same as in questions list page
const mockQuestions: Record<string, QuestionForm & { id: string; usageCount: number } & Record<string, unknown>> = {
  "Q-00001": {
    id: "Q-00001",
    question_hin: "<p>न्यूटन का कौन सा नियम F = ma बताता है?</p>",
    question_eng: "<p>Which law states F = ma?</p>",
    type: "mcq",
    subject: "Physics",
    chapter: "Laws of Motion",
    topic: "Newton's Second Law",
    difficulty: "easy",
    questionType: "mcq",
    language: "bilingual",
    relatedExam: "JEE Main",
    previousOf: "",
    collection: "",
    sourceType: "original",
    visibility: "public",
    pointCost: 5,
    usageCount: 124,
    answer: "B",
    option1_hin: "<p>प्रथम नियम</p>",
    option1_eng: "<p>First Law</p>",
    option2_hin: "<p>द्वितीय नियम</p>",
    option2_eng: "<p>Second Law</p>",
    option3_hin: "<p>तृतीय नियम</p>",
    option3_eng: "<p>Third Law</p>",
    option4_hin: "<p>गुरुत्वाकर्षण नियम</p>",
    option4_eng: "<p>Law of Gravitation</p>",
    solution_hin: "<p>न्यूटन का द्वितीय नियम F = ma है, जो बल द्रव्यमान और त्वरण के बीच संबंध बताता है।</p>",
    solution_eng: "<p>Newton's second law states F = ma, which relates force, mass, and acceleration.</p>",
    video: "",
    answerRangeMin: "",
    answerRangeMax: "",
    externalId: "",
    syncCode: "",
    questionNo: "",
    tags: ["newton", "motion", "force"],
  },
  "Q-00002": {
    id: "Q-00002",
    question_hin: "<p>ग्लूकोज का मॉलिक्यूलर फॉर्मूला क्या है?</p><p>\\(C_6H_{12}O_6\\)</p>",
    question_eng: "<p>What is the molecular formula of Glucose?</p><p>\\(C_6H_{12}O_6\\)</p>",
    type: "mcq",
    subject: "Chemistry",
    chapter: "Carbohydrates",
    topic: "Monosaccharides",
    difficulty: "medium",
    questionType: "mcq",
    language: "bilingual",
    relatedExam: "NEET",
    previousOf: "",
    collection: "Biomolecules",
    sourceType: "original",
    visibility: "public",
    pointCost: 8,
    usageCount: 89,
    answer: "A",
    option1_hin: "<p>\\(C_6H_{12}O_6\\)</p>",
    option1_eng: "<p>\\(C_6H_{12}O_6\\)</p>",
    option2_hin: "<p>\\(C_5H_{10}O_5\\)</p>",
    option2_eng: "<p>\\(C_5H_{10}O_5\\)</p>",
    option3_hin: "<p>\\(C_{12}H_{22}O_{11}\\)</p>",
    option3_eng: "<p>\\(C_{12}H_{22}O_{11}\\)</p>",
    option4_hin: "<p>\\(C_6H_{10}O_5\\)</p>",
    option4_eng: "<p>\\(C_6H_{10}O_5\\)</p>",
    solution_hin: "<p>ग्लूकोज एक हेक्सोज शर्करा है जिसका मॉलिक्यूलर फॉर्मूला \\(C_6H_{12}O_6\\) है।</p>",
    solution_eng: "<p>Glucose is a hexose sugar with molecular formula \\(C_6H_{12}O_6\\).</p>",
    video: "",
    answerRangeMin: "",
    answerRangeMax: "",
    externalId: "",
    syncCode: "",
    questionNo: "",
    tags: ["glucose", "carbohydrates"],
  },
  "Q-00003": {
    id: "Q-00003",
    question_hin: "<p>H<sub>2</sub>SO<sub>4</sub> को क्या कहते हैं?</p>",
    question_eng: "<p>What is H<sub>2</sub>SO<sub>4</sub> called?</p>",
    type: "mcq",
    subject: "Chemistry",
    chapter: "Acids and Bases",
    topic: "",
    difficulty: "easy",
    questionType: "mcq",
    language: "bilingual",
    relatedExam: "",
    previousOf: "",
    collection: "",
    sourceType: "original",
    visibility: "public",
    pointCost: 5,
    usageCount: 156,
    answer: "C",
    option1_hin: "<p>हाइड्रोक्लोरिक एसिड</p>",
    option1_eng: "<p>Hydrochloric Acid</p>",
    option2_hin: "<p>नाइट्रिक एसिड</p>",
    option2_eng: "<p>Nitric Acid</p>",
    option3_hin: "<p>सल्फ्यूरिक एसिड</p>",
    option3_eng: "<p>Sulfuric Acid</p>",
    option4_hin: "<p>एसीटिक एसिड</p>",
    option4_eng: "<p>Acetic Acid</p>",
    solution_hin: "<p>H<sub>2</sub>SO<sub>4</sub> सल्फ्यूरिक एसिड है, जिसे ऑयल ऑफ विट्रियोल भी कहा जाता है।</p>",
    solution_eng: "<p>H<sub>2</sub>SO<sub>4</sub> is Sulfuric Acid, also known as Oil of Vitriol.</p>",
    video: "",
    answerRangeMin: "",
    answerRangeMax: "",
    externalId: "",
    syncCode: "",
    questionNo: "",
    tags: ["acids"],
  },
  "Q-00004": {
    id: "Q-00004",
    question_hin: "<p>यदि एक वस्तु 45m की ऊंचाई से गिराई जाती है, तो जमीन तक पहुंचने में कितना समय लगेगा? (g=10 m/s²)</p>",
    question_eng: "<p>If a body is dropped from a height of 45m, find the time taken to reach the ground (g=10 m/s²)</p>",
    type: "integer",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Projectile Motion",
    difficulty: "medium",
    questionType: "integer",
    language: "bilingual",
    relatedExam: "JEE Advanced",
    previousOf: "JEE Mains 2022",
    collection: "",
    sourceType: "pyq",
    visibility: "public",
    pointCost: 8,
    usageCount: 98,
    answer: "3",
    solution_hin: "<p>s = ut + ½gt²</p><p>45 = 0 + ½ × 10 × t²</p><p>t² = 9, t = 3s</p>",
    solution_eng: "<p>s = ut + ½gt²</p><p>45 = 0 + ½ × 10 × t²</p><p>t² = 9, t = 3s</p>",
    video: "",
    answerRangeMin: "",
    answerRangeMax: "",
    externalId: "",
    syncCode: "",
    questionNo: "",
    tags: ["kinematics", "projectile"],
  },
  "Q-00005": {
    id: "Q-00005",
    question_hin: "<p>सेल का पावरहाउस किस ऑर्गेनेल को कहा जाता है?</p>",
    question_eng: "<p>Which organelle is known as the powerhouse of the cell?</p>",
    type: "mcq",
    subject: "Biology",
    chapter: "Cell Structure",
    topic: "",
    difficulty: "easy",
    questionType: "mcq",
    language: "bilingual",
    relatedExam: "NEET",
    previousOf: "",
    collection: "",
    sourceType: "original",
    visibility: "public",
    pointCost: 5,
    usageCount: 203,
    answer: "B",
    option1_hin: "<p>राइबोसोम</p>",
    option1_eng: "<p>Ribosome</p>",
    option2_hin: "<p>माइटोकॉन्ड्रिया</p>",
    option2_eng: "<p>Mitochondria</p>",
    option3_hin: "<p>गॉल्जी बॉडी</p>",
    option3_eng: "<p>Golgi Body</p>",
    option4_hin: "<p>एंडोप्लाज्मिक रेटिकुलम</p>",
    option4_eng: "<p>Endoplasmic Reticulum</p>",
    solution_hin: "<p>माइटोकॉन्ड्रिया को सेल का पावरहाउस कहा जाता है क्योंकि यह ATP का उत्पादन करता है।</p>",
    solution_eng: "<p>Mitochondria is called the powerhouse of the cell as it produces ATP.</p>",
    video: "",
    answerRangeMin: "",
    answerRangeMax: "",
    externalId: "",
    syncCode: "",
    questionNo: "",
    tags: ["cell", "organelles"],
  },
};

// Rich Text Toolbar Component
function RichTextToolbar({
  onInsertTag,
  onInsertLatex,
  onInsertImage,
}: {
  onInsertTag: (tag: string) => void;
  onInsertLatex: (type: "inline" | "display" | "chem") => void;
  onInsertImage: () => void;
}) {
  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b rounded-t-lg">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onInsertTag("strong")}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onInsertTag("em")}>
        <Italic className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onInsertTag("sub")} title="Subscript">
        <Subscript className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onInsertTag("sup")} title="Superscript">
        <Superscript className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
            <Type className="w-4 h-4" /> LaTeX
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onInsertLatex("inline")}>Inline: \( \)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onInsertLatex("display")}>Display: \[ \]</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onInsertLatex("chem")}>Chemical: \[\ce{ }\]</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1" onClick={onInsertImage}>
        <ImageIcon className="w-4 h-4" /> Image
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1" onClick={() => onInsertTag("table")}>
        <Table className="w-4 h-4" /> Table
      </Button>
    </div>
  );
}

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<QuestionForm>(initialForm);
  const [options, setOptions] = useState<BilingualOption[]>([
    { id: "A", label: "A", text_hin: "", text_eng: "" },
    { id: "B", label: "B", text_hin: "", text_eng: "" },
    { id: "C", label: "C", text_hin: "", text_eng: "" },
    { id: "D", label: "D", text_hin: "", text_eng: "" },
  ]);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [activeLangTab, setActiveLangTab] = useState<"hin" | "eng">("hin");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [activeField, setActiveField] = useState<string>("question_hin");
  const initializedRef = useRef(false);

  const subjects = [
    { id: "phy", name: "Physics", chapters: ["Kinematics", "Laws of Motion", "Work, Energy and Power", "Rotational Motion", "Thermodynamics", "Waves", "Electromagnetism"] },
    { id: "chem", name: "Chemistry", chapters: ["Chemical Bonding", "Acids and Bases", "Organic Chemistry", "Thermodynamics", "Carbohydrates", "Electrochemistry", "Coordination Compounds"] },
    { id: "math", name: "Mathematics", chapters: ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry", "Probability", "Matrices", "Vectors"] },
    { id: "bio", name: "Biology", chapters: ["Cell Structure", "Genetics", "Human Physiology", "Ecology", "Plant Physiology", "Biotechnology"] },
  ];

  const topics: Record<string, string[]> = {
    "Kinematics": ["Uniform Motion", "Non-uniform Motion", "Projectile Motion", "Relative Motion"],
    "Laws of Motion": ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Friction"],
    "Carbohydrates": ["Monosaccharides", "Disaccharides", "Polysaccharides", "Reactions of Glucose"],
    "Calculus": ["Derivatives", "Integrals", "Limits", "Application of Derivatives"],
  };

  const exams = ["JEE Main", "JEE Advanced", "NEET", "UPSC", "GATE", "SSC", "CAT", "Olympiad"];

  // Load question data
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const questionId = resolvedParams.id;
    const questionData = mockQuestions[questionId];
    
    if (questionData) {
      // Use requestAnimationFrame to defer state updates and avoid cascading renders
      requestAnimationFrame(() => {
        setFormData({
          subject: questionData.subject || "",
          chapter: questionData.chapter || "",
          topic: questionData.topic || "",
          difficulty: questionData.difficulty || "medium",
          questionType: questionData.questionType || questionData.type || "mcq",
          language: questionData.language || "bilingual",
          relatedExam: questionData.relatedExam || "",
          previousOf: questionData.previousOf || "",
          collection: questionData.collection || "",
          sourceType: questionData.sourceType || "original",
          question_hin: questionData.question_hin || "",
          question_eng: questionData.question_eng || "",
          solution_hin: questionData.solution_hin || "",
          solution_eng: questionData.solution_eng || "",
          video: questionData.video || "",
          answer: questionData.answer || "",
          answerRangeMin: questionData.answerRangeMin || "",
          answerRangeMax: questionData.answerRangeMax || "",
          visibility: questionData.visibility || "private",
          pointCost: questionData.pointCost || 5,
          externalId: questionData.externalId || "",
          syncCode: questionData.syncCode || "",
          questionNo: questionData.questionNo || "",
          tags: questionData.tags || [],
        });

        // Load options if MCQ
        if (questionData.questionType === "mcq" || questionData.type === "mcq" || questionData.questionType === "multi_select") {
          const loadedOptions: BilingualOption[] = [];
          for (let i = 1; i <= 5; i++) {
            const optHin = questionData[`option${i}_hin` as keyof typeof questionData];
            const optEng = questionData[`option${i}_eng` as keyof typeof questionData];
            if (optHin || optEng) {
              loadedOptions.push({
                id: String.fromCharCode(64 + i), // A, B, C, D, E
                label: String.fromCharCode(64 + i),
                text_hin: (optHin as string) || "",
                text_eng: (optEng as string) || "",
              });
            }
          }
          if (loadedOptions.length >= 2) {
            setOptions(loadedOptions);
          }
        }

        setLoading(false);
      });
    } else {
      toast.error("Question not found");
      router.push("/question-bank/questions");
    }
  }, [resolvedParams.id, router]);

  const getChapters = () => {
    const subject = subjects.find((s) => s.name === formData.subject);
    return subject ? subject.chapters : [];
  };

  const getTopics = () => topics[formData.chapter] || [];

  const handleOptionChange = (id: string, field: "text_hin" | "text_eng", value: string) => {
    setOptions(options.map((opt) => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  const addOptionE = () => {
    if (options.length < 5) {
      setOptions([...options, { id: "E", label: "E", text_hin: "", text_eng: "" }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
      if (formData.answer === id) setFormData({ ...formData, answer: "" });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  // Insert helpers
  const getFieldKey = (field: "question" | "solution") => 
    field === "question" 
      ? (activeLangTab === "hin" ? "question_hin" : "question_eng")
      : (activeLangTab === "hin" ? "solution_hin" : "solution_eng");

  const insertHtmlTag = (tag: string, field: "question" | "solution") => {
    const fieldKey = getFieldKey(field) as keyof QuestionForm;
    const currentValue = formData[fieldKey] as string;
    const newValue = `<${tag}> </${tag}>`;
    setFormData({ ...formData, [fieldKey]: currentValue + newValue });
  };

  const insertLatex = (type: "inline" | "display" | "chem", field: "question" | "solution") => {
    const templates = { inline: "\\(  \\)", display: "\\[  \\]", chem: "\\[\\ce{  }\\]" };
    const fieldKey = getFieldKey(field) as keyof QuestionForm;
    setFormData({ ...formData, [fieldKey]: (formData[fieldKey] as string) + templates[type] });
  };

  const openImageDialog = (field: "question" | "solution") => {
    setActiveField(getFieldKey(field));
    setShowImageDialog(true);
  };

  const insertImage = () => {
    if (!imageUrl.trim()) return;
    const imgHtml = `<p><img src="${imageUrl}" alt="" width="300"></p>`;
    setFormData({ ...formData, [activeField]: (formData[activeField as keyof QuestionForm] as string) + imgHtml });
    setImageUrl("");
    setShowImageDialog(false);
  };

  // Validation
  const isFormValid = () => {
    if (!formData.subject || !formData.chapter) return false;
    if (!formData.question_hin || !formData.question_eng) return false;
    if (!formData.solution_hin) return false;
    if (formData.questionType === "mcq" || formData.questionType === "multi_select") {
      const hasAllOptions = options.slice(0, 4).every(opt => opt.text_hin.trim() && opt.text_eng.trim());
      const hasCorrectAnswer = formData.answer && formData.answer.length > 0;
      return hasAllOptions && hasCorrectAnswer;
    }
    if (formData.questionType === "integer") return formData.answer !== "";
    if (formData.questionType === "true_false") return formData.answer !== "";
    return true;
  };

  const handleSave = (publish: boolean = false) => {
    if (!isFormValid()) {
      toast.error("Please fill all required fields");
      return;
    }
    const questionData = { ...formData, status: publish ? "published" : "draft", id: resolvedParams.id };
    console.log("Updated Question Data:", questionData);
    toast.success(publish ? "Question updated and published!" : "Question updated successfully!");
    router.push("/question-bank/questions");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <Sidebar />
        <div className="ml-60 flex flex-col min-h-screen">
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4511E] mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading question...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Question ID: <span className="font-mono text-[#F4511E]">{resolvedParams.id}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="btn-secondary">
                  <Eye className="w-4 h-4 mr-2" /> {showPreview ? "Hide" : "Show"} Preview
                </Button>
                <Button variant="outline" onClick={() => handleSave(false)} className="btn-secondary">Save Changes</Button>
                <Button onClick={() => handleSave(true)} className="bg-[#F4511E] hover:bg-[#E64A19] text-white" disabled={!isFormValid()}>
                  <Save className="w-4 h-4 mr-2" /> Update & Publish
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="xl:col-span-2 space-y-6">
                {/* Step 1: Classification */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F4511E] text-white flex items-center justify-center text-sm font-bold">1</div>
                      <CardTitle className="text-lg">Classification</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Subject <span className="text-red-500">*</span></Label>
                        <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v, chapter: "", topic: "" })}>
                          <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                          <SelectContent>
                            {subjects.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Chapter <span className="text-red-500">*</span></Label>
                        <Select value={formData.chapter} onValueChange={(v) => setFormData({ ...formData, chapter: v, topic: "" })} disabled={!formData.subject}>
                          <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                          <SelectContent>
                            {getChapters().map((ch) => <SelectItem key={ch} value={ch}>{ch}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Topic</Label>
                        <Select value={formData.topic} onValueChange={(v) => setFormData({ ...formData, topic: v })} disabled={!formData.chapter}>
                          <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                          <SelectContent>
                            {getTopics().map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Difficulty <span className="text-red-500">*</span></Label>
                        <div className="flex gap-1">
                          {["easy", "medium", "hard"].map((d) => (
                            <Button key={d} type="button" size="sm" variant={formData.difficulty === d ? "default" : "outline"}
                              className={`flex-1 capitalize ${formData.difficulty === d ? "bg-[#F4511E] text-white hover:bg-[#E64A19]" : ""}`}
                              onClick={() => setFormData({ ...formData, difficulty: d })}>{d}</Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Type <span className="text-red-500">*</span></Label>
                        <Select value={formData.questionType} onValueChange={(v) => setFormData({ ...formData, questionType: v, answer: "" })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">MCQ</SelectItem>
                            <SelectItem value="integer">Integer</SelectItem>
                            <SelectItem value="multi_select">Multi-select</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bilingual">Bilingual</SelectItem>
                            <SelectItem value="hindi">Hindi Only</SelectItem>
                            <SelectItem value="english">English Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Related Exam</Label>
                        <Select value={formData.relatedExam} onValueChange={(v) => setFormData({ ...formData, relatedExam: v })}>
                          <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                          <SelectContent>
                            {exams.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>PYQ Reference</Label>
                        <Input placeholder="e.g., JEE Mains 2023" value={formData.previousOf} onChange={(e) => setFormData({ ...formData, previousOf: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Collection</Label>
                        <Input placeholder="e.g., Biomolecules" value={formData.collection} onChange={(e) => setFormData({ ...formData, collection: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Source Type</Label>
                        <Select value={formData.sourceType} onValueChange={(v) => setFormData({ ...formData, sourceType: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="original">Original</SelectItem>
                            <SelectItem value="pyq">PYQ</SelectItem>
                            <SelectItem value="ai_generated">AI Generated</SelectItem>
                            <SelectItem value="imported">Imported</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Question Text */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F4511E] text-white flex items-center justify-center text-sm font-bold">2</div>
                      <CardTitle className="text-lg">Question Text</CardTitle>
                      <Badge className="bg-purple-50 text-purple-700 ml-2"><Languages className="w-3 h-3 mr-1" /> Bilingual</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeLangTab} onValueChange={(v) => setActiveLangTab(v as "hin" | "eng")}>
                      <TabsList className="mb-2">
                        <TabsTrigger value="hin" className="gap-2">🇮🇳 Hindi <span className="text-red-500">*</span></TabsTrigger>
                        <TabsTrigger value="eng" className="gap-2">🇬🇧 English <span className="text-red-500">*</span></TabsTrigger>
                      </TabsList>
                      <TabsContent value="hin" className="mt-0">
                        <RichTextToolbar
                          onInsertTag={(tag) => insertHtmlTag(tag, "question")}
                          onInsertLatex={(type) => insertLatex(type, "question")}
                          onInsertImage={() => openImageDialog("question")}
                        />
                        <Textarea
                          placeholder='<p>प्रश्न यहाँ लिखें...</p><p><img src="..." width="300"></p>'
                          value={formData.question_hin}
                          onChange={(e) => setFormData({ ...formData, question_hin: e.target.value })}
                          className="min-h-[150px] rounded-t-none font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="eng" className="mt-0">
                        <RichTextToolbar
                          onInsertTag={(tag) => insertHtmlTag(tag, "question")}
                          onInsertLatex={(type) => insertLatex(type, "question")}
                          onInsertImage={() => openImageDialog("question")}
                        />
                        <Textarea
                          placeholder='<p>Enter question here...</p><p><img src="..." width="300"></p>'
                          value={formData.question_eng}
                          onChange={(e) => setFormData({ ...formData, question_eng: e.target.value })}
                          className="min-h-[150px] rounded-t-none font-mono text-sm"
                        />
                      </TabsContent>
                    </Tabs>
                    <p className="text-xs text-gray-400 mt-2">HTML format. Use &lt;sub&gt; &lt;sup&gt; for chemical formulas. LaTeX: \(inline\) or \[display\]</p>
                  </CardContent>
                </Card>

                {/* Step 3: Options */}
                {(formData.questionType === "mcq" || formData.questionType === "multi_select") && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#F4511E] text-white flex items-center justify-center text-sm font-bold">3</div>
                          <CardTitle className="text-lg">Options</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-50 text-purple-700"><Languages className="w-3 h-3 mr-1" /> Bilingual</Badge>
                          <Tabs value={activeLangTab} onValueChange={(v) => setActiveLangTab(v as "hin" | "eng")}>
                            <TabsList className="h-8">
                              <TabsTrigger value="hin" className="h-7 text-xs px-3">🇮🇳 Hindi</TabsTrigger>
                              <TabsTrigger value="eng" className="h-7 text-xs px-3">🇬🇧 English</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {options.map((opt) => (
                        <div key={opt.id} className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.questionType === "mcq") {
                                setFormData({ ...formData, answer: opt.id });
                              } else {
                                const current = formData.answer.split(",").filter(Boolean);
                                const newAnswer = current.includes(opt.id)
                                  ? current.filter(a => a !== opt.id).join(",")
                                  : [...current, opt.id].join(",");
                                setFormData({ ...formData, answer: newAnswer });
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                              formData.answer.includes(opt.id) ? "bg-green-500 text-white ring-2 ring-green-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}>{opt.id}</button>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              placeholder={`विकल्प ${opt.id} (Hindi)`}
                              value={opt.text_hin}
                              onChange={(e) => handleOptionChange(opt.id, "text_hin", e.target.value)}
                              className={activeLangTab !== "hin" ? "hidden" : ""}
                            />
                            <Input
                              placeholder={`Option ${opt.id} (English)`}
                              value={opt.text_eng}
                              onChange={(e) => handleOptionChange(opt.id, "text_eng", e.target.value)}
                              className={activeLangTab !== "eng" ? "hidden" : ""}
                            />
                            <div className="text-xs text-gray-400 flex items-center col-span-1">
                              {activeLangTab === "hin" ? (opt.text_eng || "English text...") : (opt.text_hin || "हिंदी पाठ...")}
                            </div>
                          </div>
                          {options.length > 2 && opt.id === "E" && (
                            <Button variant="ghost" size="icon" onClick={() => removeOption(opt.id)} className="text-gray-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {options.length < 5 && (
                        <Button variant="outline" size="sm" onClick={addOptionE} className="mt-2">
                          <Plus className="w-4 h-4 mr-2" /> Add Option E
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Integer Answer */}
                {formData.questionType === "integer" && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F4511E] text-white flex items-center justify-center text-sm font-bold">3</div>
                        <CardTitle className="text-lg">Integer Answer</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Correct Answer <span className="text-red-500">*</span></Label>
                          <Input type="number" placeholder="e.g., 42" value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Range Min (optional)</Label>
                          <Input type="number" placeholder="e.g., 40" value={formData.answerRangeMin} onChange={(e) => setFormData({ ...formData, answerRangeMin: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Range Max (optional)</Label>
                          <Input type="number" placeholder="e.g., 44" value={formData.answerRangeMax} onChange={(e) => setFormData({ ...formData, answerRangeMax: e.target.value })} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* True/False */}
                {formData.questionType === "true_false" && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F4511E] text-white flex items-center justify-center text-sm font-bold">3</div>
                        <CardTitle className="text-lg">True/False Answer</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button type="button" variant={formData.answer === "A" ? "default" : "outline"}
                          className={`flex-1 ${formData.answer === "A" ? "bg-[#F4511E] text-white" : ""}`}
                          onClick={() => setFormData({ ...formData, answer: "A" })}>True</Button>
                        <Button type="button" variant={formData.answer === "B" ? "default" : "outline"}
                          className={`flex-1 ${formData.answer === "B" ? "bg-[#F4511E] text-white" : ""}`}
                          onClick={() => setFormData({ ...formData, answer: "B" })}>False</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Solution */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F4511E] text-white flex items-center justify-center text-sm font-bold">4</div>
                      <CardTitle className="text-lg">Solution / Explanation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeLangTab} onValueChange={(v) => setActiveLangTab(v as "hin" | "eng")}>
                      <TabsList className="mb-2">
                        <TabsTrigger value="hin" className="gap-2">🇮🇳 Hindi <span className="text-red-500">*</span></TabsTrigger>
                        <TabsTrigger value="eng" className="gap-2">🇬🇧 English</TabsTrigger>
                      </TabsList>
                      <TabsContent value="hin" className="mt-0">
                        <RichTextToolbar
                          onInsertTag={(tag) => insertHtmlTag(tag, "solution")}
                          onInsertLatex={(type) => insertLatex(type, "solution")}
                          onInsertImage={() => openImageDialog("solution")}
                        />
                        <Textarea
                          placeholder='<p>विस्तृत हल...</p><p>\[\ce{H2O}\]</p>'
                          value={formData.solution_hin}
                          onChange={(e) => setFormData({ ...formData, solution_hin: e.target.value })}
                          className="min-h-[120px] rounded-t-none font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="eng" className="mt-0">
                        <RichTextToolbar
                          onInsertTag={(tag) => insertHtmlTag(tag, "solution")}
                          onInsertLatex={(type) => insertLatex(type, "solution")}
                          onInsertImage={() => openImageDialog("solution")}
                        />
                        <Textarea
                          placeholder='<p>Detailed solution...</p><p>\[\ce{H2O}\]</p>'
                          value={formData.solution_eng}
                          onChange={(e) => setFormData({ ...formData, solution_eng: e.target.value })}
                          className="min-h-[120px] rounded-t-none font-mono text-sm"
                        />
                      </TabsContent>
                    </Tabs>
                    <div className="mt-4 space-y-2">
                      <Label>Video Solution URL (optional)</Label>
                      <Input placeholder="https://youtube.com/watch?v=..." value={formData.video} onChange={(e) => setFormData({ ...formData, video: e.target.value })} />
                    </div>
                  </CardContent>
                </Card>

                {/* Step 5: Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F4511E] text-white flex items-center justify-center text-sm font-bold">5</div>
                      <CardTitle className="text-lg">Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Visibility</Label>
                        <div className="flex gap-2">
                          <Button type="button" variant={formData.visibility === "private" ? "default" : "outline"}
                            className={`flex-1 ${formData.visibility === "private" ? "bg-[#F4511E] text-white" : ""}`}
                            onClick={() => setFormData({ ...formData, visibility: "private" })}>🔒 Private</Button>
                          <Button type="button" variant={formData.visibility === "public" ? "default" : "outline"}
                            className={`flex-1 ${formData.visibility === "public" ? "bg-[#F4511E] text-white" : ""}`}
                            onClick={() => setFormData({ ...formData, visibility: "public" })}>🌐 Public</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Point Cost</Label>
                        <Input type="number" min={0} max={100} value={formData.pointCost}
                          onChange={(e) => setFormData({ ...formData, pointCost: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-1">
                          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..."
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                          <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                        </div>
                      </div>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 flex items-center gap-1">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div className="xl:col-span-1">
                  <div className="sticky top-24 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Preview</CardTitle>
                          <Tabs value={activeLangTab} onValueChange={(v) => setActiveLangTab(v as "hin" | "eng")}>
                            <TabsList className="h-8">
                              <TabsTrigger value="hin" className="h-7 text-xs px-3">🇮🇳</TabsTrigger>
                              <TabsTrigger value="eng" className="h-7 text-xs px-3">🇬🇧</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-50 text-blue-700 text-xs">{formData.questionType.toUpperCase()}</Badge>
                          <Badge className={formData.difficulty === "easy" ? "bg-green-50 text-green-700 text-xs" : formData.difficulty === "hard" ? "bg-red-50 text-red-700 text-xs" : "bg-amber-50 text-amber-700 text-xs"}>{formData.difficulty}</Badge>
                          {formData.relatedExam && <Badge className="bg-purple-50 text-purple-700 text-xs">{formData.relatedExam}</Badge>}
                        </div>
                        {formData.subject && (
                          <div className="text-xs text-gray-500">{formData.subject} {formData.chapter && `› ${formData.chapter}`} {formData.topic && `› ${formData.topic}`}</div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: activeLangTab === "hin" ? formData.question_hin || "<p class='text-gray-400'>प्रश्न यहाँ दिखेगा...</p>" : formData.question_eng || "<p class='text-gray-400'>Question will appear here...</p>" }} />
                        </div>
                        {(formData.questionType === "mcq" || formData.questionType === "multi_select") && (
                          <div className="space-y-2">
                            {options.map((opt) => (
                              <div key={opt.id}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${formData.answer.includes(opt.id) ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${formData.answer.includes(opt.id) ? "bg-green-500 text-white" : "border border-gray-300"}`}>
                                  {formData.answer.includes(opt.id) ? <CheckCircle className="w-4 h-4" /> : opt.id}
                                </div>
                                <span className={formData.answer.includes(opt.id) ? "text-green-700" : "text-gray-600"}>
                                  {activeLangTab === "hin" ? (opt.text_hin || "विकल्प...") : (opt.text_eng || "Option...")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {formData.questionType === "integer" && formData.answer && (
                          <div className="p-2 bg-green-50 border border-green-500 rounded-lg">
                            <span className="text-green-700 font-medium text-sm">Answer: {formData.answer}</span>
                          </div>
                        )}
                        {(formData.solution_hin || formData.solution_eng) && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700 font-medium mb-1">💡 Solution</p>
                            <div className="text-xs prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: activeLangTab === "hin" ? formData.solution_hin : formData.solution_eng }} />
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs pt-2 border-t">
                          <span className="text-[#F4511E] font-medium">{formData.pointCost} pts</span>
                          <span className="text-gray-400">{formData.visibility === "public" ? "🌐 Public" : "🔒 Private"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Validation Status */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {[
                            { label: "Subject selected", valid: !!formData.subject },
                            { label: "Chapter selected", valid: !!formData.chapter },
                            { label: "Hindi question", valid: !!formData.question_hin },
                            { label: "English question", valid: !!formData.question_eng },
                            { label: "Hindi solution", valid: !!formData.solution_hin },
                            { label: "Correct answer set", valid: !!formData.answer },
                            { label: "Options filled", valid: formData.questionType === "integer" || formData.questionType === "true_false" || options.slice(0, 4).every(o => o.text_hin && o.text_eng) },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              {item.valid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-300" />}
                              <span className={item.valid ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Image</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input placeholder="https://cdn.eduhub.in/questions/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Or upload image to CDN (coming soon)</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
            <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white" onClick={insertImage}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
