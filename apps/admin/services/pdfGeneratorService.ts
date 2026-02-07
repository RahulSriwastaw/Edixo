import { Question, QuestionSet } from '../types';
import { storageService } from './storageService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFConfig {
    fontSize: number;
    spacing: number;
    optionSpacing: number;
    answerBold: boolean;
    showWatermark: boolean;
    showRelevantQuestions: boolean;
    questionOpacity: number;
    optionOpacity: number;
    logo1: string;
    logo2: string;
    questionBoldness: number;
    newHeader: boolean;

    // Display options
    showAnswerWidget: boolean;
    hideQuestion: boolean;
    hideOption: boolean;
    hideBoxExplanation: boolean;
    showSolution: boolean;
    language: 'hi' | 'en' | 'both';
    previousYearTag: boolean;
    showQR: boolean;
    showBook: boolean;
    showAnswerWithDesc: boolean;

    // Boldness
    optionBoldness: number;
    solutionBoldness: number;

    // Colors
    headerBgColor: string;
    footerBgColor: string;
    questionColor: string;
    optionColor: string;
    questionNumberColor: string;
    columns: number;
    customTitle: string;
    customTagline: string;
    customFooter: string;
    mainLogo: string;
    headerContact: string;
    headerTeacher: string;
    headerExam: string;
    showPageBorder: boolean;
    show5thOption: boolean;
    questionGap: number;
    questionOptionGap: number;
}

const DEFAULT_PDF_CONFIG: PDFConfig = {
    fontSize: 10,
    spacing: 6,
    optionSpacing: 4,
    questionGap: 24,
    questionOptionGap: 8,
    answerBold: false,
    showWatermark: true,
    showRelevantQuestions: false,
    questionOpacity: 1,
    optionOpacity: 1,
    logo1: '',
    logo2: '',
    questionBoldness: 700,
    newHeader: true,

    showAnswerWidget: false,
    hideQuestion: false,
    hideOption: false,
    hideBoxExplanation: false,
    showSolution: false,
    language: 'both',
    previousYearTag: true,
    showQR: true,
    showBook: true,
    showAnswerWithDesc: false,

    optionBoldness: 400,
    solutionBoldness: 700,

    headerBgColor: '#FFFFFF',
    footerBgColor: '#1E293B',
    questionColor: '#EF4444',
    optionColor: '#2563EB',
    questionNumberColor: '#000000',
    columns: 2,
    customTitle: 'Practice Set',
    customTagline: 'Exams Success Series',
    customFooter: 'Exclusive Study Material',
    mainLogo: '',
    headerContact: 'Contact: 91+ XXXXX XXXXX',
    headerTeacher: 'By: Teacher Name',
    headerExam: 'Target Exam 2026',
    showPageBorder: true,
    show5thOption: true
};

class PDFGeneratorService {
    private config: PDFConfig = DEFAULT_PDF_CONFIG;

    setConfig(config: Partial<PDFConfig>) {
        this.config = { ...this.config, ...config };
    }

    getConfig(): PDFConfig {
        return { ...this.config };
    }

    async generatePDF(set: QuestionSet, questions: Question[]): Promise<Blob> {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const columnGap = 10;
        const colWidth = (pageWidth - (margin * 2) - columnGap) / 2;

        let currentCol = 0;
        let yOffset = 45;

        const checkPageBreak = (neededHeight: number) => {
            if (yOffset + neededHeight > pageHeight - 20) {
                if (currentCol === 0 && this.config.columns === 2) {
                    currentCol = 1;
                    yOffset = 45;
                } else {
                    pdf.addPage();
                    this.drawPageDecorations(pdf, set);
                    currentCol = 0;
                    yOffset = 45;
                }
            }
        };

        this.drawPageDecorations(pdf, set);

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const xPos = margin + (currentCol * (colWidth + columnGap));

            // Estimate height more accurately to prevent overlap
            let qHeight = 10; // BASE
            if (this.config.language === 'both') qHeight += 20;
            if (this.config.showSolution) qHeight += 30;
            qHeight += (this.config.optionSpacing * 5);

            checkPageBreak(qHeight);

            // Question Number
            pdf.setFontSize(this.config.fontSize + 2);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${i + 1}.`, xPos, yOffset);

            yOffset += 1; // Small adjustment after number


            // Question Text
            pdf.setFontSize(this.config.fontSize);

            if (this.config.language === 'en' || this.config.language === 'both') {
                pdf.setTextColor(this.config.questionColor);
                const qLines = pdf.splitTextToSize(this.stripHTML(q.question_eng), colWidth - 5);
                pdf.text(qLines, xPos + 5, yOffset);
                yOffset += (qLines.length * 5) + 2;
            }

            if ((this.config.language === 'hi' || this.config.language === 'both') && q.question_hin) {
                pdf.setTextColor(120, 120, 120);
                pdf.setFontSize(this.config.fontSize - 1);
                const hinLines = pdf.splitTextToSize(this.stripHTML(q.question_hin || 'Hindi Text'), colWidth - 5);
                pdf.text(hinLines, xPos + 5, yOffset);
                yOffset += (hinLines.length * 6) + 3; // Extra space for Hindi junk
            }


            // Intelligent Tags below question (Right Aligned)
            if (this.config.previousYearTag) {
                yOffset += 1;
                let tagText = '';
                let tagColor: [number, number, number] = [30, 41, 59]; // Default dark

                // Current Affairs - Show Date (Red)
                if (q.subject === 'Current Affairs' && q.date) {
                    const dateObj = new Date(q.date);
                    tagText = `${dateObj.getDate()} ${dateObj.toLocaleString('en', { month: 'short' })}, ${dateObj.getFullYear()}`;
                    tagColor = [220, 38, 38]; // Red
                }
                // AI Generated - Show Topic (Purple)
                else if ((q.tags?.includes('AI-Generated') || q.id?.includes('q_')) && q.topic) {
                    tagText = `AI: ${q.topic.toUpperCase()}`;
                    tagColor = [147, 51, 234]; // Purple
                }
                // Previous Year - Show Exam + Year (Dark)
                else if (q.exam && q.year) {
                    tagText = `${q.exam}${q.section ? ' | ' + q.section : ''} | ${q.year}`.toUpperCase();
                    tagColor = [30, 41, 59]; // Dark
                }
                // General Tags (Gray)
                else if (q.tags && q.tags.length > 0) {
                    tagText = q.tags.slice(0, 2).join(', ').toUpperCase();
                    tagColor = [71, 85, 105]; // Gray
                }

                if (tagText) {
                    pdf.setFontSize(7);
                    pdf.setFillColor(tagColor[0], tagColor[1], tagColor[2]);
                    const tagWidth = pdf.getTextWidth(tagText) + 6;
                    // Right align within column
                    const tagX = xPos + colWidth - tagWidth - 2;
                    pdf.rect(tagX, yOffset, tagWidth, 5, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(tagText, tagX + 3, yOffset + 3.8);
                    yOffset += 8;
                }
            } else {
                yOffset += 3;
            }

            // Options
            let opts = [
                { l: '(a)', t: q.option1_eng, th: q.option1_hin, code: 'a' },
                { l: '(b)', t: q.option2_eng, th: q.option2_hin, code: 'b' },
                { l: '(c)', t: q.option3_eng, th: q.option3_hin, code: 'c' },
                { l: '(d)', t: q.option4_eng, th: q.option4_hin, code: 'd' },
                { l: '(e)', t: 'उपर्युक्त में से कोई नहीं', th: '', code: 'e' }
            ];

            // Filter option E logic
            if (!this.config.show5thOption) {
                const correctAns = q.answer?.toString().toLowerCase().trim();
                const isECorrect = correctAns === 'e' || correctAns === '5' || correctAns === 'option5';
                if (!isECorrect) {
                    opts = opts.filter(o => o.code !== 'e');
                }
            }

            const isShort = opts.every(opt => (this.stripHTML(opt.t)?.length || 0) + (this.stripHTML(opt.th || '')?.length || 0) < 35);

            pdf.setTextColor(this.config.optionColor);
            if (isShort) {
                // 2-Column Grid Layout for Short Options
                const halfColWidth = colWidth / 2;
                for (let j = 0; j < opts.length; j += 2) {
                    if (yOffset > pageHeight - 15) checkPageBreak(15);

                    const rowOpts = opts.slice(j, j + 2);
                    rowOpts.forEach((opt, subIdx) => {
                        const currentX = xPos + 5 + (subIdx * halfColWidth);
                        pdf.setFontSize(this.config.fontSize);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(opt.l, currentX, yOffset);
                        pdf.setFont('helvetica', 'normal');

                        let subY = yOffset;
                        if (this.config.language === 'en' || this.config.language === 'both') {
                            pdf.text(this.stripHTML(opt.t), currentX + 7, subY);
                            subY += 4.5;
                        }
                        if ((this.config.language === 'hi' || this.config.language === 'both') && opt.th) {
                            pdf.setTextColor(150, 150, 150);
                            pdf.text(this.stripHTML(opt.th), currentX + 7, subY);
                            pdf.setTextColor(this.config.optionColor);
                        }
                    });
                    yOffset += 8 + (this.config.optionSpacing / 5);
                }
            } else {
                // Vertical List Layout for Long Options
                for (const opt of opts) {
                    if (yOffset > pageHeight - 15) checkPageBreak(15);

                    pdf.setFontSize(this.config.fontSize);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(opt.l, xPos + 5, yOffset);
                    pdf.setFont('helvetica', 'normal');

                    if (this.config.language === 'en' || this.config.language === 'both') {
                        const optTextLines = pdf.splitTextToSize(this.stripHTML(opt.t), colWidth - 15);
                        pdf.text(optTextLines, xPos + 12, yOffset);
                        yOffset += (optTextLines.length * 4.5);
                    }

                    if ((this.config.language === 'hi' || this.config.language === 'both') && opt.th) {
                        pdf.setTextColor(150, 150, 150);
                        const optHinLines = pdf.splitTextToSize(this.stripHTML(opt.th), colWidth - 15);
                        pdf.text(optHinLines, xPos + 12, yOffset);
                        yOffset += (optHinLines.length * 5) + 1;
                        pdf.setTextColor(this.config.optionColor);
                    }
                    yOffset += 1 + (this.config.optionSpacing / 10);
                }
            }

            // Explanation Section
            if (this.config.showSolution && (q.solution_eng || q.solution_hin)) {
                yOffset += 4;
                checkPageBreak(30);

                pdf.setFillColor(239, 68, 68);
                pdf.rect(xPos + 5, yOffset, colWidth - 5, 6, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(9);
                pdf.text('Explanation', xPos + (colWidth / 2) - 5, yOffset + 4.5, { align: 'center' });
                yOffset += 8;

                const solTextYStart = yOffset;
                if (this.config.language === 'en' || this.config.language === 'both') {
                    if (q.solution_eng) {
                        pdf.setTextColor(51, 65, 85);
                        pdf.setFontSize(this.config.fontSize - 1);
                        const solLines = pdf.splitTextToSize(this.stripHTML(q.solution_eng), colWidth - 10);
                        pdf.text(solLines, xPos + 7, yOffset);
                        yOffset += (solLines.length * 4.5);
                    }
                }

                if ((this.config.language === 'hi' || this.config.language === 'both') && q.solution_hin) {
                    pdf.setTextColor(120, 120, 120);
                    const solHinLines = pdf.splitTextToSize(this.stripHTML(q.solution_hin), colWidth - 10);
                    pdf.text(solHinLines, xPos + 7, yOffset);
                    yOffset += (solHinLines.length * 5) + 2;
                }

                pdf.setDrawColor(239, 68, 68);
                pdf.setLineWidth(0.2);
                pdf.rect(xPos + 5, solTextYStart - 8, colWidth - 5, yOffset - (solTextYStart - 8), 'S');
            }

            yOffset += 10; // More space between questions
        }

        // Answer Key Widget
        if (this.config.showAnswerWidget) {
            pdf.addPage();
            this.drawPageDecorations(pdf, set);
            let keyY = 50;
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Answer Key', pageWidth / 2, keyY, { align: 'center' });
            keyY += 15;

            const boxWidth = 22;
            const boxHeight = 8;
            const boxesPerRow = 8;
            let currentX = margin;
            let currentY = keyY;

            for (let i = 0; i < questions.length; i++) {
                if (i > 0 && i % boxesPerRow === 0) {
                    currentX = margin;
                    currentY += boxHeight + 4;
                }
                if (currentY > pageHeight - 20) {
                    pdf.addPage();
                    this.drawPageDecorations(pdf, set);
                    currentY = 50;
                }
                pdf.setDrawColor(0, 0, 0);
                pdf.rect(currentX, currentY, boxWidth, boxHeight, 'S');
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${i + 1}`, currentX + 2, currentY + 5.5);
                pdf.setFont('helvetica', 'normal');
                const ans = questions[i].answer?.toString().toUpperCase() || '-';
                pdf.text(`(${ans})`, currentX + boxWidth - 9, currentY + 5.5);
                currentX += boxWidth + 2;
            }
        }

        return pdf.output('blob');
    }

    private drawPageDecorations(pdf: jsPDF, set: QuestionSet) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 1. Watermark (Prefer Logo)
        pdf.saveGraphicsState();
        pdf.setGState(new (pdf as any).GState({ opacity: 0.04 }));
        if (this.config.mainLogo) {
            try {
                pdf.addImage(this.config.mainLogo, 'PNG', pageWidth / 2 - 40, pageHeight / 2 - 40, 80, 80);
            } catch (e) {
                this.drawDefaultWatermark(pdf, pageWidth, pageHeight);
            }
        } else {
            this.drawDefaultWatermark(pdf, pageWidth, pageHeight);
        }
        pdf.restoreGraphicsState();

        // 2. Vertical Divider
        if (this.config.columns === 2) {
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(0.1);
            pdf.line(pageWidth / 2, 40, pageWidth / 2, pageHeight - 15);
        }

        // 3. Header Branding
        if (this.config.mainLogo) {
            try {
                pdf.addImage(this.config.mainLogo, 'PNG', 10, 10, 20, 20);
            } catch (e) {
                pdf.setFillColor(30, 41, 59);
                pdf.rect(10, 10, 20, 20, 'F');
            }
        } else {
            pdf.setFillColor(30, 41, 59);
            pdf.rect(10, 10, 20, 20, 'F');
        }

        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(this.config.customTitle.toUpperCase(), pageWidth / 2, 18, { align: 'center' });
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        pdf.text(this.config.customTagline, pageWidth / 2, 24, { align: 'center' });
        pdf.setFontSize(8);
        const subHeader = `${this.config.headerContact}  •  ${this.config.headerTeacher}  •  ${this.config.headerExam}`;
        pdf.text(subHeader, pageWidth / 2, 30, { align: 'center' });

        pdf.setLineWidth(0.5);
        pdf.setDrawColor(0, 0, 0);
        pdf.line(10, 36, pageWidth - 10, 36);

        // 4. Footer
        pdf.setFillColor(30, 41, 59);
        pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(this.config.customFooter, pageWidth / 2, pageHeight - 5, { align: 'center' });

        // 5. Border
        if (this.config.showPageBorder) {
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.5);
            pdf.rect(2, 2, pageWidth - 4, pageHeight - 4, 'S');
        }
    }

    private drawDefaultWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number) {
        pdf.setDrawColor(22, 163, 74);
        pdf.setLineWidth(5);
        pdf.circle(pageWidth / 2, pageHeight / 2, 40, 'S');
        pdf.setFontSize(60);
        pdf.setTextColor(22, 163, 74);
        pdf.text('B', pageWidth / 2 - 10, pageHeight / 2 + 20);
    }

    private stripHTML(html: string): string {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    async downloadPDF(set: QuestionSet, questions: Question[], filename?: string) {
        const blob = await this.generatePDF(set, questions);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `${set.name.replace(/\s+/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async downloadPDFFromElement(element: HTMLElement, set: QuestionSet, filename?: string) {
        // High Quality WYSIWYG Capture
        try {
            const canvas = await html2canvas(element, {
                scale: 3, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                allowTaint: true,
                removeContainer: true,
                imageTimeout: 0,
                onclone: (clonedDoc) => {
                    // Ensure all styles are properly applied in cloned document
                    const clonedElement = clonedDoc.querySelector('[ref="previewRef"]');
                    if (clonedElement) {
                        (clonedElement as HTMLElement).style.transform = 'none';
                    }
                }
            });


            const imgData = canvas.toDataURL('image/jpeg', 0.85); // Higher quality for better rendering
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add white background to first page
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST'); // FAST compression
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                // Add white background to additional pages
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }

            pdf.save(filename || `${set.name.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Canvas PDF Failed, falling back to data-driven:', error);
            const allQuestions = await storageService.getQuestions();
            const setQuestions = allQuestions.filter(q => set.questionIds.includes(q.id));
            const blob = await this.generatePDF(set, setQuestions);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `${set.name.replace(/\s+/g, '_')}.pdf`;
            a.click();
        }
    }
}
export const pdfGeneratorService = new PDFGeneratorService();
