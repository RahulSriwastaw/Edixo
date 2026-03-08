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
    let changed = false;

    const targetClass1 = 'className="ml-60 flex flex-col min-h-screen"';
    const targetClass2 = 'className="lg:ml-60 flex flex-col min-h-screen"';

    if (content.includes(targetClass1) || content.includes(targetClass2)) {
        // Add imports
        if (!content.includes('import { cn }')) {
            content = 'import { cn } from "@/lib/utils";\n' + content;
        }
        if (!content.includes('import { useSidebarStore }')) {
            content = 'import { useSidebarStore } from "@/store/sidebarStore";\n' + content;
        }

        // Add hook to the default export component
        if (!content.includes('const { isOpen } = useSidebarStore();')) {
            content = content.replace(/(export\s+default\s+(?:async\s+)?function\s+[^{]+\{\s*)/, '$1  const { isOpen } = useSidebarStore();\n');
        }

        // Replace the class
        content = content.replace(targetClass1, 'className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}');
        content = content.replace(targetClass2, 'className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "lg:ml-60" : "ml-0")}');

        fs.writeFileSync(filepath, content, 'utf-8');
        changed = true;
        updatedCount++;
        console.log(`Updated: ${filepath}`);
    }
});

console.log(`\nSuccessfully updated ${updatedCount} files.`);
