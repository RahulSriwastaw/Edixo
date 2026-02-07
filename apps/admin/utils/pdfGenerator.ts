import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Question } from '../types';

export type PDFTemplate = 'exam_paper' | 'practice_sheet' | 'answer_key' | 'flashcards' | 'workbook';

export interface PDFExportOptions {
    template: PDFTemplate;
    title: string;
    subtitle?: string;
    headerText?: string;
    footerText?: string;
    includeAnswerKey?: boolean;
    includeExplanations?: boolean;
    fontSize?: number;
    pageMargin?: number;
    logo?: string;
    watermark?: string;
}

export const generateQuestionSetPDF = async (
    questions: Question[],
    options: PDFExportOptions
): Promise<void> => {
    const doc = new jsPDF();
    const {
        template,
        title,
        subtitle,
        headerText,
        footerText,
        includeAnswerKey = true,
        includeExplanations = false,
        fontSize = 10,
        pageMargin = 15
    } = options;

    let yPosition = pageMargin;

    // Helper functions
    const addHeader = (currentPage: number, totalPages: number) => {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Header
        if (headerText) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(headerText, pageMargin, 10);
            doc.text(`Page ${currentPage}/${totalPages}`, pageWidth - pageMargin - 20, 10);
        }

        // Footer
        if (footerText) {
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
    };

    const checkPageBreak = (requiredSpace: number) => {
        const pageHeight = doc.internal.pageSize.height;
        if (yPosition + requiredSpace > pageHeight - pageMargin - 15) {
            doc.addPage();
            yPosition = pageMargin + 20;
            return true;
        }
        return false;
    };

    // Template-specific rendering
    switch (template) {
        case 'exam_paper':
            renderExamPaper(doc, questions, options, yPosition);
            break;
        case 'practice_sheet':
            renderPracticeSheet(doc, questions, options, yPosition);
            break;
        case 'answer_key':
            renderAnswerKey(doc, questions, options, yPosition);
            break;
        case 'flashcards':
            renderFlashcards(doc, questions, options);
            break;
        case 'workbook':
            renderWorkbook(doc, questions, options, yPosition);
            break;
    }

    // Save the PDF
    const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
};

function renderExamPaper(doc: jsPDF, questions: Question[], options: PDFExportOptions, startY: number) {
    const { title, subtitle, includeAnswerKey, pageMargin = 15 } = options;
    let yPos = startY;

    // Title Section
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 10;

    if (subtitle) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
        yPos += 8;
    }

    // Instructions
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const instructions = [
        'INSTRUCTIONS:',
        '1. All questions are compulsory.',
        '2. Read each question carefully before answering.',
        '3. For MCQ questions, select the most appropriate answer.'
    ];
    instructions.forEach(line => {
        doc.text(line, pageMargin, yPos);
        yPos += 5;
    });

    yPos += 5;
    doc.setDrawColor(0);
    doc.line(pageMargin, yPos, doc.internal.pageSize.width - pageMargin, yPos);
    yPos += 10;

    // Questions
    questions.forEach((q, index) => {
        // Check page break
        if (yPos > doc.internal.pageSize.height - 60) {
            doc.addPage();
            yPos = pageMargin;
        }

        // Question number and text
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Q${index + 1}.`, pageMargin, yPos);

        doc.setFont('helvetica', 'normal');
        const questionText = q.question_eng || '';
        const wrappedQuestion = doc.splitTextToSize(questionText, doc.internal.pageSize.width - 2 * pageMargin - 15);
        doc.text(wrappedQuestion, pageMargin + 10, yPos);
        yPos += wrappedQuestion.length * 5 + 3;

        // Options
        const options = [
            { label: 'A', text: q.option1_eng },
            { label: 'B', text: q.option2_eng },
            { label: 'C', text: q.option3_eng },
            { label: 'D', text: q.option4_eng }
        ];

        if (q.option5_eng) {
            options.push({ label: 'E', text: q.option5_eng });
        }

        doc.setFontSize(10);
        options.forEach(opt => {
            const wrappedOpt = doc.splitTextToSize(`(${opt.label}) ${opt.text}`, doc.internal.pageSize.width - 2 * pageMargin - 20);
            doc.text(wrappedOpt, pageMargin + 15, yPos);
            yPos += wrappedOpt.length * 5 + 2;
        });

        yPos += 8;
    });

    // Answer Key on separate page
    if (includeAnswerKey) {
        doc.addPage();
        yPos = pageMargin;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ANSWER KEY', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        questions.forEach((q, index) => {
            if (yPos > doc.internal.pageSize.height - 30) {
                doc.addPage();
                yPos = pageMargin;
            }

            const answerNum = parseInt(q.answer) || 1;
            const answerLabel = String.fromCharCode(64 + answerNum); // Convert 1->A, 2->B, etc.

            doc.text(`Q${index + 1}: ${answerLabel}`, pageMargin, yPos);
            yPos += 6;
        });
    }
}

function renderPracticeSheet(doc: jsPDF, questions: Question[], options: PDFExportOptions, startY: number) {
    // Similar to exam paper but more compact
    renderExamPaper(doc, questions, options, startY);
}

function renderAnswerKey(doc: jsPDF, questions: Question[], options: PDFExportOptions, startY: number) {
    const { title, pageMargin = 15, includeExplanations } = options;
    let yPos = startY;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${title} - Answer Key`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 15;

    // Answer table
    const tableData = questions.map((q, index) => {
        const answerNum = parseInt(q.answer) || 1;
        const answerLabel = String.fromCharCode(64 + answerNum);

        const row = [
            (index + 1).toString(),
            answerLabel,
            q.difficulty || 'Medium'
        ];

        if (includeExplanations && q.solution_eng) {
            row.push(q.solution_eng.substring(0, 100) + '...');
        }

        return row;
    });

    const columns = ['Q.No', 'Answer', 'Difficulty'];
    if (includeExplanations) {
        columns.push('Explanation');
    }

    autoTable(doc, {
        startY: yPos,
        head: [columns],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: pageMargin, right: pageMargin }
    });
}

function renderFlashcards(doc: jsPDF, questions: Question[], options: PDFExportOptions) {
    const { pageMargin = 10 } = options;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const cardWidth = (pageWidth - 3 * pageMargin) / 2;
    const cardHeight = pageHeight / 2 - 1.5 * pageMargin;

    questions.forEach((q, index) => {
        if (index % 4 === 0 && index !== 0) {
            doc.addPage();
        }

        const col = index % 2;
        const row = Math.floor(index / 2) % 2;
        const x = pageMargin + col * (cardWidth + pageMargin);
        const y = pageMargin + row * (cardHeight + pageMargin);

        // Card border
        doc.setDrawColor(200);
        doc.rect(x, y, cardWidth, cardHeight);

        // Question
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Q${index + 1}`, x + 5, y + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const questionText = doc.splitTextToSize(q.question_eng || '', cardWidth - 10);
        doc.text(questionText, x + 5, y + 18);

        // Answer (small, at bottom)
        const answerNum = parseInt(q.answer) || 1;
        const answerLabel = String.fromCharCode(64 + answerNum);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Ans: ${answerLabel}`, x + 5, y + cardHeight - 5);
        doc.setTextColor(0);
    });
}

function renderWorkbook(doc: jsPDF, questions: Question[], options: PDFExportOptions, startY: number) {
    const { title, pageMargin = 20 } = options;
    let yPos = startY;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 15;

    questions.forEach((q, index) => {
        if (yPos > doc.internal.pageSize.height - 100) {
            doc.addPage();
            yPos = pageMargin;
        }

        // Question
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}.`, pageMargin, yPos);

        doc.setFont('helvetica', 'normal');
        const questionText = doc.splitTextToSize(q.question_eng || '', doc.internal.pageSize.width - 2 * pageMargin - 10);
        doc.text(questionText, pageMargin + 8, yPos);
        yPos += questionText.length * 6 + 5;

        // Work space (ruled lines)
        doc.setDrawColor(220);
        for (let i = 0; i < 8; i++) {
            doc.line(pageMargin, yPos, doc.internal.pageSize.width - pageMargin, yPos);
            yPos += 6;
        }

        yPos += 10;
    });
}

export default generateQuestionSetPDF;
