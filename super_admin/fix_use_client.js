const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('page.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(baseDir);
let updatedCount = 0;

files.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf-8');

    // Check if "use client" is present but not at the very top
    if (content.includes('"use client"') || content.includes("'use client'")) {
        const lines = content.split('\n');
        let useClientIndex = -1;
        let hasUseClient = false;
        let isUseClientFirst = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '"use client";' || line === "'use client';" || line === '"use client"' || line === "'use client'") {
                hasUseClient = true;
                useClientIndex = i;
                break;
            }
        }

        // if use client is found and it's not the first non-empty line
        if (hasUseClient) {
            let firstNonEmptyIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() !== '') {
                    firstNonEmptyIndex = i;
                    break;
                }
            }

            if (useClientIndex > firstNonEmptyIndex) {
                // It's not at the top. Let's fix it.
                const useClientLine = lines[useClientIndex];
                lines.splice(useClientIndex, 1); // remove from current position
                lines.unshift(useClientLine); // add to very top

                fs.writeFileSync(filepath, lines.join('\n'), 'utf-8');
                updatedCount++;
                console.log(`Fixed "use client" order: ${filepath}`);
            }
        }
    }
});

console.log(`\nSuccessfully fixed ${updatedCount} files.`);
