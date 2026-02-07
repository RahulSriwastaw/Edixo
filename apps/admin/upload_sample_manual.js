import fs from 'fs';
import Papa from 'papaparse';
import pkg from 'pg';
const { Client } = pkg;

const FILE_PATH = './question sample.csv';
const CONNECTION_STRING = 'postgres://postgres:x8MBb*7Qf6eicpc@db.jwwjjyxdepayjdjlmdmo.supabase.co:5432/postgres';

const normalizeData = (row) => {
    const lowerKeys = Object.keys(row).reduce((acc, k) => ({ ...acc, [k.toLowerCase().trim()]: row[k] }), {});

    const obj = {};

    // Question Text
    obj.question_text = lowerKeys['question_hin'] || lowerKeys['question_eng'] || lowerKeys['question'] || lowerKeys['question_text'] || '';

    // Options
    obj.option_a = lowerKeys['option1_hin'] || lowerKeys['option1_eng'] || lowerKeys['option1'] || lowerKeys['option a'] || '';
    obj.option_b = lowerKeys['option2_hin'] || lowerKeys['option2_eng'] || lowerKeys['option2'] || lowerKeys['option b'] || '';
    obj.option_c = lowerKeys['option3_hin'] || lowerKeys['option3_eng'] || lowerKeys['option3'] || lowerKeys['option c'] || '';
    obj.option_d = lowerKeys['option4_hin'] || lowerKeys['option4_eng'] || lowerKeys['option4'] || lowerKeys['option d'] || '';

    // Other fields
    obj.correct_answer = lowerKeys['correct answer'] || lowerKeys['correct_answer'] || lowerKeys['answer'] || '';
    obj.answer_explanation = lowerKeys['solution_hin'] || lowerKeys['solution_eng'] || lowerKeys['explanation'] || '';

    obj.subject_name = lowerKeys['subject'] || lowerKeys['subject_name'] || 'General';
    // Use 'chapter' from CSV as topic
    obj.topic_name = lowerKeys['chapter'] || lowerKeys['topic'] || 'General';

    // Difficulty normalization
    let diff = lowerKeys['difficulty'] || 'Medium';
    if (String(diff).toLowerCase().includes('easy')) diff = 'Easy';
    else if (String(diff).toLowerCase().includes('hard')) diff = 'Hard';
    else diff = 'Medium';
    obj.difficulty_level = diff;

    // Language
    obj.language_type = lowerKeys['language'] || (lowerKeys['question_hin'] ? 'Hindi' : 'Bilingual');

    // Source/Exam - Mapping 'exam' column from CSV
    obj.question_source = lowerKeys['exam'] || lowerKeys['source'] || 'BulkUpload';

    return obj;
};

async function upload() {
    const client = new Client({ connectionString: CONNECTION_STRING, ssl: { rejectUnauthorized: false } });

    try {
        console.log('Readling CSV file...');
        const csvFile = fs.readFileSync(FILE_PATH, 'utf8');

        console.log('Parsing CSV...');
        const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true });

        if (parsed.errors.length > 0) {
            console.error('CSV Parse Errors:', parsed.errors);
        }

        const rows = parsed.data;
        console.log(`Found ${rows.length} rows.`);

        console.log('Connecting to DB...');
        await client.connect();

        let successCount = 0;
        let failCount = 0;

        console.log('Starting Insert...');

        for (const row of rows) {
            const data = normalizeData(row);

            // Basic validation
            if (!data.question_text || !data.correct_answer) {
                console.log('Skipping invalid row:', row);
                failCount++;
                continue;
            }

            try {
                const query = `
                    INSERT INTO questions_master (
                        question_text, option_a, option_b, option_c, option_d,
                        correct_answer, answer_explanation, subject_name, topic_name,
                        difficulty_level, language_type, question_source, is_verified, question_type
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                `;

                const values = [
                    data.question_text,
                    data.option_a,
                    data.option_b,
                    data.option_c,
                    data.option_d,
                    data.correct_answer,
                    data.answer_explanation,
                    data.subject_name,
                    data.topic_name,
                    data.difficulty_level,
                    data.language_type,
                    data.question_source,
                    true, // is_verified
                    'MCQ'
                ];

                await client.query(query, values);
                successCount++;
                if (successCount % 10 === 0) process.stdout.write('.');

            } catch (err) {
                console.error('Insert Error for row:', err.message);
                failCount++;
            }
        }

        console.log(`\n\nUpload Complete!`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);

    } catch (e) {
        console.error('Script Error:', e);
    } finally {
        await client.end();
    }
}

upload();
