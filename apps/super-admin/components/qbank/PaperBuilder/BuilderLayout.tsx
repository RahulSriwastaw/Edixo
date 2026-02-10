import React from 'react';
import { PaperConfiguration, PaperSection, Question } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, FileText, Settings, Download } from 'lucide-react';
import { usePaperStore } from '../../services/paperStore';
import { pdf } from '@react-pdf/renderer';
import { ClassicTemplate, ModernTemplate, MinimalTemplate } from '../Templates/PDFTemplates';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { PublishModal, ExamSettings } from './PublishModal';
import { storageService } from '../../services/storageService';
import { Globe, CheckCircle } from 'lucide-react';

interface BuilderLayoutProps { }

export const BuilderLayout: React.FC<BuilderLayoutProps> = () => {
    const { paperConfig, setPaperConfig, updateSectionQuestions } = usePaperStore();
    const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false);
    const [publishStatus, setPublishStatus] = React.useState<'idle' | 'publishing' | 'success'>('idle');
    const [publishedId, setPublishedId] = React.useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const section = paperConfig.sections.find(s => s.questions.some(q => q.id === active.id));
            if (section) {
                const oldIndex = section.questions.findIndex((q) => q.id === active.id);
                const newIndex = section.questions.findIndex((q) => q.id === over.id);
                const newQuestions = arrayMove(section.questions, oldIndex, newIndex);
                updateSectionQuestions(section.id, newQuestions);
            }
        }
    };

    const handlePublish = async (settings: ExamSettings) => {
        setPublishStatus('publishing');
        try {
            // 1. Flatten all questions
            const allQuestions: Question[] = [];
            paperConfig.sections.forEach(s => allQuestions.push(...s.questions));

            if (allQuestions.length === 0) {
                alert("Cannot publish an empty exam.");
                setPublishStatus('idle');
                return;
            }

            // 2. Save Questions Bulk
            // Ensure IDs are strings and unique if derived from temp
            const processingQuestions = allQuestions.map(q => ({
                ...q,
                id: q.id.startsWith('temp_') ? `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` : q.id
            }));

            await storageService.saveQuestionsBulk(processingQuestions);

            // 3. Create Question Set
            const newSetId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const questionIds = processingQuestions.map(q => q.id);

            await storageService.saveSet({
                setId: newSetId,
                name: paperConfig.title,
                description: paperConfig.subtitle || `${settings.category} Exam - ${settings.duration} Mins`,
                questionIds: questionIds,
                createdDate: new Date().toISOString(),
                category: (settings.category === 'Special' ? 'Custom' : settings.category) as any,
                password: settings.password,
                status: settings.isPublic ? 'public' : 'draft',
                settings: {
                    timerEnabled: true,
                    timePerQuestion: 60, // Default fallback
                    durationSeconds: settings.duration * 60,
                    showQuestionNumbers: true,
                    randomize: false,
                    showResults: true,
                    allowRetake: true
                }
            });

            setPublishedId(newSetId);
            setPublishStatus('success');
            setIsPublishModalOpen(false);
            alert(`Exam Published Successfully!\nSet ID: ${newSetId}`);

        } catch (error) {
            console.error("Publishing failed:", error);
            alert("Failed to publish exam. Please checks logs.");
            setPublishStatus('idle');
        }
    };

    const handleDownloadPDF = async () => {
        let DocumentComponent;
        switch (paperConfig.templateId) {
            case 'modern': DocumentComponent = ModernTemplate; break;
            case 'minimal': DocumentComponent = MinimalTemplate; break;
            case 'classic': default: DocumentComponent = ClassicTemplate; break;
        }

        const blob = await pdf(<DocumentComponent config={paperConfig} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${paperConfig.title.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadDOCX = async () => {
        const children = [];

        // Title & Subtitle
        children.push(new Paragraph({
            text: paperConfig.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }));

        if (paperConfig.subtitle) {
            children.push(new Paragraph({
                text: paperConfig.subtitle,
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }));
        }

        // Sections
        paperConfig.sections.forEach(section => {
            if (section.questions.length > 0) {
                children.push(new Paragraph({
                    text: section.title,
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 200 },
                    border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } }
                }));
            }

            section.questions.forEach((q, idx) => {
                // Question Text
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: `Q${idx + 1}. `, bold: true }),
                        new TextRun({ text: q.question_eng })
                    ],
                    spacing: { before: 200, after: 100 }
                }));

                if (q.question_hin) {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: q.question_hin, italics: true })],
                        spacing: { after: 100 }
                    }));
                }

                // Options
                const opts = [
                    `(a) ${q.option1_eng}`, `(b) ${q.option2_eng}`,
                    `(c) ${q.option3_eng}`, `(d) ${q.option4_eng}`
                ];

                children.push(new Paragraph({
                    text: `${opts[0]}    ${opts[1]}`,
                    spacing: { after: 50 },
                    indent: { left: 720 } // 0.5 inch
                }));
                children.push(new Paragraph({
                    text: `${opts[2]}    ${opts[3]}`,
                    spacing: { after: 200 },
                    indent: { left: 720 }
                }));
            });
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: children,
            }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${paperConfig.title.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            <PublishModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onPublish={handlePublish}
                currentTitle={paperConfig.title}
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Paper Builder</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organize & Export</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsPublishModalOpen(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2">
                        <Globe size={16} /> Publish Exam
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Settings size={16} /> Settings
                    </button>
                    <button onClick={handleDownloadDOCX} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
                        <FileText size={16} /> Export DOCX
                    </button>
                    <button onClick={handleDownloadPDF} className="px-4 py-2 bg-primary text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[500px]">

                    {/* Paper Header Inputs */}
                    <div className="mb-8 text-center space-y-2 group">
                        <input
                            value={paperConfig.title}
                            onChange={(e) => setPaperConfig({ ...paperConfig, title: e.target.value })}
                            className="text-3xl font-black text-center w-full border-none outline-none focus:ring-0 placeholder:text-slate-300"
                            placeholder="PAPER TITLE"
                        />
                        <input
                            value={paperConfig.subtitle || ''}
                            onChange={(e) => setPaperConfig({ ...paperConfig, subtitle: e.target.value })}
                            className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center w-full border-none outline-none focus:ring-0 placeholder:text-slate-300"
                            placeholder="SUBTITLE / EXAM NAME"
                        />
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        {paperConfig.sections.map((section) => (
                            <div key={section.id} className="mb-8">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">{section.title}</h3>
                                    <span className="text-xs font-medium text-slate-400">{section.questions.length} Questions</span>
                                </div>

                                <SortableContext items={section.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3">
                                        {section.questions.map((q, idx) => (
                                            <SortableItem key={q.id} id={q.id} question={q} index={idx} />
                                        ))}
                                    </div>
                                </SortableContext>

                                {section.questions.length === 0 && (
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-400 text-sm">
                                        Empty Section. Drag questions here.
                                    </div>
                                )}
                            </div>
                        ))}
                    </DndContext>
                </div>
            </div>
        </div>
    );
};

// Sortable Item Component
function SortableItem({ id, question, index }: { id: string, question: Question, index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4 group hover:border-indigo-300 transition-colors relative">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-400 mt-1">
                <GripVertical size={20} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div className="font-bold text-slate-800 text-sm mb-1">
                        <span className="text-slate-400 mr-2">Q{index + 1}.</span>
                        {question.question_eng}
                    </div>
                </div>
                {question.has_table && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-500 border border-slate-100">
                        <div className="flex items-center gap-1 font-bold mb-1"><FileText size={12} /> Table Data Attached</div>
                    </div>
                )}
            </div>
            <button className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
            </button>
        </div>
    );
}
