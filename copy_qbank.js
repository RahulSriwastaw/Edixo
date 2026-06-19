const fs = require('fs');
const path = require('path');

const SUPER_ADMIN = 'd:\\Projects\\Edixo\\super_admin\\src';
const PUBLIC = 'd:\\Projects\\Edixo\\Public_website';

// All UI component files to copy
const UI_FILES = fs.readdirSync(path.join(SUPER_ADMIN, 'components', 'ui'))
  .filter(f => f.endsWith('.tsx'));

// Copy UI component files
console.log('=== Copying UI Components ===');
UI_FILES.forEach(file => {
  const src = path.join(SUPER_ADMIN, 'components', 'ui', file);
  const dest = path.join(PUBLIC, 'components', 'ui', file);
  if (fs.existsSync(src)) {
    let content = fs.readFileSync(src, 'utf8');
    content = fixImports(content, 'ui');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
    console.log(`UI: ${file}`);
  }
});

// Copy all question bank page files
console.log('\n=== Copying Question Bank Pages ===');
const qbRoot = path.join(SUPER_ADMIN, 'app', 'question-bank');
function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  entries.forEach(entry => {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(srcPath, 'utf8');
      content = fixImports(content, 'page');
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content);
      console.log(`Page: ${path.relative(qbRoot, srcPath)}`);
    }
  });
}
copyDir(qbRoot, path.join(PUBLIC, 'app', 'question-bank'));

// Copy qbank components
console.log('\n=== Copying QBank Components ===');
const qbCompDir = path.join(SUPER_ADMIN, 'components', 'qbank');
if (fs.existsSync(qbCompDir)) {
  fs.readdirSync(qbCompDir).forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const src = path.join(qbCompDir, file);
      const dest = path.join(PUBLIC, 'components', 'qbank', file);
      let content = fs.readFileSync(src, 'utf8');
      content = fixImports(content, 'qbank');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content);
      console.log(`Comp: ${file}`);
    }
  });
}

// Copy set-system components
console.log('\n=== Copying Set-System Components ===');
const setDir = path.join(SUPER_ADMIN, 'components', 'set-system');
if (fs.existsSync(setDir)) {
  fs.readdirSync(setDir).forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const src = path.join(setDir, file);
      const dest = path.join(PUBLIC, 'components', 'set-system', file);
      let content = fs.readFileSync(src, 'utf8');
      content = fixImports(content, 'set');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content);
      console.log(`Set: ${file}`);
    }
  });
}

// Copy tools components
console.log('\n=== Copying Tools Components ===');
const toolsDir = path.join(SUPER_ADMIN, 'components', 'tools');
if (fs.existsSync(toolsDir)) {
  function copyTools(dir, baseDest) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const srcPath = path.join(dir, entry.name);
      const destPath = path.join(baseDest, entry.name);
      if (entry.isDirectory()) {
        copyTools(srcPath, destPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        let content = fs.readFileSync(srcPath, 'utf8');
        content = fixImports(content, 'tools');
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, content);
        console.log(`Tool: ${path.relative(toolsDir, srcPath)}`);
      }
    });
  }
  copyTools(toolsDir, path.join(PUBLIC, 'components', 'tools'));
}

function fixImports(content, context) {
  // Fix store imports
  content = content.replace(/import.*from ['"]@\/store\/sidebarStore['"].*(\n|;)/g, '');
  
  // Fix admin sidebar/topbar - replace with simple div
  content = content.replace(/import.*from ['"]@\/components\/admin\/Sidebar['"].*/g, '');
  content = content.replace(/import.*from ['"]@\/components\/admin\/TopBar['"].*/g, '');
  
  // Remove Sidebar and TopBar JSX usage - replace with empty divs
  content = content.replace(/<Sidebar\s*\/>/g, '');
  content = content.replace(/<TopBar\s*\/>/g, '');
  content = content.replace(/<Sidebar>[\s\S]*?<\/Sidebar>/g, '');
  content = content.replace(/<TopBar>[\s\S]*?<\/TopBar>/g, '');
  
  // Fix useSidebarStore usage - replace with isOpen: true
  content = content.replace(/const\s*\{[^}]*isOpen[^}]*\}\s*=\s*useSidebarStore\(\)/g, 'const isOpen = true');
  
  // Fix cn import
  if (!content.includes("import { cn } from '@/lib/utils'") && content.includes('cn(')) {
    content = content.replace(/import.*from ['"]@\/lib\/utils['"].*/g, "import { cn } from '@/lib/utils'");
  }
  
  // Fix API config import
  content = content.replace(/import.*from ['"]@\/lib\/api-config['"].*/g, "import { API_URL, getAuthHeaders } from '@/lib/api-config'");
  
  // Fix getToken function - replace with our getAuthHeaders pattern
  content = content.replace(/function\s*getToken\s*\(\)[\s\S]*?return\s*['"]['"]?\s*;?\s*}/g, 
    `function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\\s*)token=([^;]*)/);
  return match ? match[1] : '';
}`);
  
  // Fix recharts imports (already available)
  
  return content;
}

console.log('\n=== Copy Complete! ===');