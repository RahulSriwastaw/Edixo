
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { supabase } from './storageService';
import { QuestionMaster, BulkUploadBatch, BulkUploadRow, PreviewRow } from '../types';

export const bulkUploadService = {

    // 1. Parsing Service
    parseFile(file: File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const fileType = file.name.split('.').pop()?.toLowerCase();

            if (fileType === 'csv') {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (error) => reject(error),
                });
            } else if (fileType === 'xlsx' || fileType === 'xls') {
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = (e) => {
                    const buffer = e.target?.result;
                    const workbook = XLSX.read(buffer, { type: 'buffer' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(sheet);
                    resolve(json);
                };
                reader.onerror = (error) => reject(error);
            } else if (fileType === 'json') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const json = JSON.parse(e.target?.result as string);
                        resolve(Array.isArray(json) ? json : [json]);
                    } catch (err) { reject(err); }
                };
                reader.readAsText(file);
            } else {
                reject(new Error('Unsupported file type'));
            }
        });
    },

    // 2. Normalize Keys (Flexible Column Mapping)
    normalizeData(rawData: any[]): PreviewRow[] {
        return rawData.map((row, index) => {
            // Basic normalization logic - can be improved with AI or manual mapping UI
            // Trying to find keys that match our schema
            const findKey = (keys: string[]) => keys.find(k => row[k] !== undefined && row[k] !== null);

            const obj: any = {};
            const lowerKeys = Object.keys(row).reduce((acc, k) => ({ ...acc, [k.toLowerCase().trim()]: row[k] }), {});

            // Mapping Logic
            // Mapping Logic
            // Question Text: Prefer Hindi, then English, then generic keys
            obj.question_text = lowerKeys['question_hin'] || lowerKeys['question_eng'] || lowerKeys['question'] || lowerKeys['question_text'] || lowerKeys['question text'] || '';

            // Options: Handle numbered options (option1_hin, option1, etc.) and lettered options
            obj.option_a = lowerKeys['option1_hin'] || lowerKeys['option1_eng'] || lowerKeys['option1'] || lowerKeys['option a'] || lowerKeys['option_a'] || lowerKeys['a'] || '';
            obj.option_b = lowerKeys['option2_hin'] || lowerKeys['option2_eng'] || lowerKeys['option2'] || lowerKeys['option b'] || lowerKeys['option_b'] || lowerKeys['b'] || '';
            obj.option_c = lowerKeys['option3_hin'] || lowerKeys['option3_eng'] || lowerKeys['option3'] || lowerKeys['option c'] || lowerKeys['option_c'] || lowerKeys['c'] || '';
            obj.option_d = lowerKeys['option4_hin'] || lowerKeys['option4_eng'] || lowerKeys['option4'] || lowerKeys['option d'] || lowerKeys['option_d'] || lowerKeys['d'] || '';

            obj.correct_answer = lowerKeys['correct answer'] || lowerKeys['correct_answer'] || lowerKeys['answer'] || '';
            obj.answer_explanation = lowerKeys['solution_hin'] || lowerKeys['solution_eng'] || lowerKeys['explanation'] || lowerKeys['answer_explanation'] || lowerKeys['solution'] || '';

            obj.subject_name = lowerKeys['subject'] || lowerKeys['subject_name'] || 'General';
            obj.topic_name = lowerKeys['chapter'] || lowerKeys['topic'] || lowerKeys['topic_name'] || 'General'; // Use 'chapter' as topic if present
            obj.difficulty_level = lowerKeys['difficulty'] || 'Medium'; // Default
            obj.language_type = lowerKeys['language'] || (lowerKeys['question_hin'] ? 'Hindi' : 'Bilingual'); // Infer language

            // Metadata
            const examSource = lowerKeys['exam'] || lowerKeys['source'];
            obj.question_source = examSource || 'BulkUpload';

            // Post-processing
            // Normalize difficulty
            const diff = String(obj.difficulty_level).toLowerCase();
            if (diff.includes('easy')) obj.difficulty_level = 'Easy';
            else if (diff.includes('hard')) obj.difficulty_level = 'Hard';
            else obj.difficulty_level = 'Medium';

            return {
                ...obj,
                id: `row_${index}`,
                rowNumber: index + 1,
                isValid: false, // Will be set by validator
                errors: [],
                originalData: row
            };
        });
    },

    // 3. Validation Engine
    validateRows(rows: PreviewRow[]): PreviewRow[] {
        return rows.map(row => {
            const errors: string[] = [];
            if (!row.question_text || row.question_text.trim().length < 5) errors.push("Question text is too short or missing.");
            if (!row.option_a || !row.option_b) errors.push("At least Option A and B are required.");
            if (!row.correct_answer) errors.push("Correct Answer is missing.");

            // Basic check if correct answer is in options
            // (This logic needs to be robust, e.g., if answer is 'A' or the text itself)

            return {
                ...row,
                isValid: errors.length === 0,
                errors
            };
        });
    },

    // 4. Batch Saving
    async saveBatch(rows: PreviewRow[], fileName: string): Promise<{ batchId: string, savedCount: number, failedCount: number }> {
        const validRows = rows.filter(r => r.isValid);
        const failedRows = rows.filter(r => !r.isValid);

        // Create Batch Entry
        const { data: batchData, error: batchError } = await supabase
            .from('bulk_upload_batches')
            .insert({
                upload_file_name: fileName,
                upload_file_type: fileName.split('.').pop(),
                total_rows_found: rows.length,
                total_questions_saved: 0, // Update later
                total_failed_rows: failedRows.length,
                upload_status: 'Processing'
            })
            .select()
            .single();

        if (batchError || !batchData) throw new Error("Failed to create batch record");

        const batchId = batchData.batch_id;

        // Save Questions
        const questionsToInsert = validRows.map(r => ({
            question_text: r.question_text,
            question_type: 'MCQ', // Default for now
            option_a: r.option_a,
            option_b: r.option_b,
            option_c: r.option_c,
            option_d: r.option_d,
            correct_answer: r.correct_answer,
            answer_explanation: r.answer_explanation,
            subject_name: r.subject_name,
            topic_name: r.topic_name,
            difficulty_level: r.difficulty_level,
            language_type: r.language_type,
            question_source: r.question_source || 'BulkUpload',
            is_verified: true, // Assuming bulk uploads are trusted or will be verified later
            // Adding fields for backward compatibility with 'questions' table if needed, though we are targeting 'questions_master'
            created_by_user_id: undefined
        }));

        if (questionsToInsert.length > 0) {
            // Try inserting into questions_master
            const { error: qError } = await supabase.from('questions_master').insert(questionsToInsert);

            if (qError) {
                console.error("Error inserting into questions_master:", qError);
                // Fallback or specific error handling
                await supabase.from('bulk_upload_batches').update({ upload_status: 'Failed' }).eq('batch_id', batchId);
                throw new Error(`Failed to save questions: ${qError.message}`);
            }
        }

        // Save Failed Rows Logs
        const errorLogs = failedRows.map(r => ({
            batch_id: batchId,
            row_number: r.rowNumber,
            raw_question_text: r.question_text?.substring(0, 100) || "Unknown",
            error_message: r.errors.join(', '),
            error_type: 'Validation Error'
        }));

        if (errorLogs.length > 0) {
            await supabase.from('bulk_upload_rows').insert(errorLogs);
        }

        // Update Batch Status
        await supabase.from('bulk_upload_batches').update({
            total_questions_saved: validRows.length,
            upload_status: 'Completed'
        }).eq('batch_id', batchId);

        return { batchId, savedCount: validRows.length, failedCount: failedRows.length };
    }
};
