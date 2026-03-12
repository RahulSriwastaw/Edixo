const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/super_admin/src/app/mockbook/org/[orgId]/mocktests/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove mock arrays
content = content.replace(/\/\/ Mock tests data\r?\nconst mockTestsData = \[[\s\S]*?\];\r?\n/, '');
content = content.replace(/\/\/ Stats\r?\nconst stats = \[[\s\S]*?\];\r?\n/, '');

// Add state for tests list
content = content.replace(/const \[createStep, setCreateStep\] = useState\(1\);/,
    `const [createStep, setCreateStep] = useState(1);
  const [mockTestsList, setMockTestsList] = useState<any[]>([]);`);

// Fetch data
const topEffect = content.split('// Mock: Load org from ID')[0];
const bottomEffect = content.split('setSelectedOrg(mockOrg);')[1];

if (topEffect && bottomEffect && topEffect !== content) {
    const middleEffect = `// Dynamic fetch: load org and tests
    const fetchData = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:^|;\\s*)token=([^;]*)/);
        const token = tokenMatch ? tokenMatch[1] : '';
        const res = await fetch(\`http://localhost:4000/api/super-admin/organizations/\${orgId}\`, { headers: { 'Authorization': \`Bearer \${token}\` } });
        const data = await res.json();
        
        if (data.success) {
          const orgInfo = data.data;
          setSelectedOrg({
            id: orgInfo.orgId,
            name: orgInfo.name,
            plan: orgInfo.plan || "SMALL",
            status: orgInfo.status || "ACTIVE",
            students: orgInfo._count?.students || orgInfo.studentCount || 0,
            mockTests: orgInfo._count?.testAttempts || 0,
            aiCredits: orgInfo.aiCredits || 0,
          });
        } else {
          router.push('/mockbook');
        }
      } catch (err) {
        console.error("Failed to load org details", err);
        router.push('/mockbook');
      }
    };
    fetchData();
    `;
    content = topEffect + middleEffect + bottomEffect;
}

// Update filter
content = content.replace(/const filteredTests = mockTestsData\.filter\(\(test\)/, 'const filteredTests = mockTestsList.filter((test: any)');

// Update stats mapping
const oldStatsRender = `{stats.map((stat, index) => {`;
const newStatsRender = `{(() => {
                  const dynamicStats = [
                    { label: "Total MockTests", value: mockTestsList.length, icon: FileText, color: "purple" },
                    { label: "Published", value: mockTestsList.filter(t => t.status === "published").length, icon: CheckCircle2, color: "green" },
                    { label: "Total Attempts", value: mockTestsList.reduce((acc, curr) => acc + (curr.attempts || 0), 0), icon: Users, color: "blue" },
                    { label: "Avg Score", value: "0%", icon: BarChart3, color: "orange" },
                  ];
                  return dynamicStats;
                })().map((stat, index) => {`;
content = content.replace(oldStatsRender, newStatsRender);

// Update map function
content = content.replace(/filteredTests\.map\(\(test\)/g, `filteredTests.map((test: any)`);

fs.writeFileSync(file, content);
console.log('Successfully patched mocktests page.');
