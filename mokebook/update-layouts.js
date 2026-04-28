const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, 'src', 'components', 'TestInterface', 'layouts');
const files = fs.readdirSync(layoutsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(layoutsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add isReviewMode to Props interface
    content = content.replace(/interface (\w+)Props \{/, 'interface $1Props {\n    isReviewMode?: boolean;');

    // 2. Add isReviewMode to destructured props
    content = content.replace(/onIntegerChange,(\s*)\}: (\w+)Props\) \{/, 'onIntegerChange,\n    isReviewMode,$1}: $2Props) {');

    // 3. Update OptionButton
    content = content.replace(/<OptionButton([\s\S]*?)onIntegerChange=\{\(val\) => onIntegerChange\(question\.id, val\)\}([\s\S]*?)\/>/g, 
        '<OptionButton$1onIntegerChange={(val) => onIntegerChange(question.id, val)}$2 isReviewMode={isReviewMode} correctOptionIds={question.correctOptionIds} explanation={question.explanation} />');

    // 4. Update palette logic
    const oldPaletteRegex = /const paletteQuestions[^{]*\{([\s\S]*?)return \{[^\}]*status[^\}]*\};\n\s*\}\);/;
    
    content = content.replace(oldPaletteRegex, (match) => {
        if (match.includes("isReviewMode")) return match; // already applied
        return `const paletteQuestions = questions.map((q: any, idx: number) => {
        let status = "not-visited";
        if (isReviewMode) {
            status = q.status === "CORRECT" ? "answered" : q.status === "INCORRECT" ? "not-answered" : "not-visited";
            if (idx === currentIndex && status === "not-visited") status = "not-answered";
        } else {
            status = answers[q.id]?.length
                ? marked.has(q.id) ? "marked-and-answered" : "answered"
                : marked.has(q.id) ? "marked-for-review" : idx === currentIndex ? "not-answered" : "not-visited";
        }
        return { id: q.id, number: q.number || idx + 1, section: q.section, status: status as any };
    });`;
    });

    // 5. Change "Submit" button text if in review mode
    // Look for "Submit Test" or "Submit" inside buttons and conditionally render "Exit Review"
    content = content.replace(/>\s*Submit Test\s*<\/button>/g, '>{isReviewMode ? "Exit Review" : "Submit Test"}</button>');
    content = content.replace(/>\s*Submit\s*<\/Button>/g, '>{isReviewMode ? "Exit Review" : "Submit"}</Button>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
