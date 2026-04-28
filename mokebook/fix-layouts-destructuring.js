const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, 'src', 'components', 'TestInterface', 'layouts');
const files = [
    'EduquityLayout.tsx',
    'JEELayout.tsx',
    'RailwayLayout.tsx',
    'SSCLayout.tsx',
    'TestRankKINGLayout.tsx',
    'TestbookLayout.tsx',
    'UPSCLayout.tsx'
];

files.forEach(function(file) {
    const filePath = path.join(layoutsDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // First, fix the mess I made (if any)
    content = content.replace(/isReviewMode,\s*= props;/, 'isReviewMode,\n    } = props;');

    // Then ensure isReviewMode is correctly destructured
    if (!content.includes('isReviewMode') || !content.match(/const \{[\s\S]*?isReviewMode[\s\S]*?\} = props/)) {
         // Pattern 1: Multi-line destructuring ending with } = props;
        content = content.replace(/(const \{[\s\S]*?onIntegerChange,?\s*)\}(\s*=\s*props;)/, '$1    isReviewMode,\n    }$2');

        // Pattern 2: Single-line destructuring
        content = content.replace(/(const \{[\s\S]*?onIntegerChange)\s*\}\s*=\s*props;/, '$1, isReviewMode } = props;');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Checked/Updated " + file);
});
