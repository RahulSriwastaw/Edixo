const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'TestInterface', 'layouts', 'SSCLayout.tsx');

let content = fs.readFileSync(file, 'utf8');

// fix palette
content = content.replace(/const paletteQuestions: Array<\{[\s\S]*?return \{ id: q\.id, number: q\.number \|\| idx \+ 1, section: q\.section, status \};\n    \}\);/, 
    `const paletteQuestions: Array<any> = questions.map((q: any, idx: number) => {
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
    });`);

// fix button text
content = content.replace(/>\s*Submit Test\s*<\/Button>/g, '>{isReviewMode ? "Exit Review" : "Submit Test"}</Button>');

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed SSCLayout");
