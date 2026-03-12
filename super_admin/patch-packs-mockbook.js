const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/super_admin/src/app/mockbook/org/[orgId]/packs/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove mock arrays
content = content.replace(/\/\/ Mock packs data\r?\nconst packsData = \[[\s\S]*?\];\r?\n/, '');
content = content.replace(/\/\/ Stats\r?\nconst stats = \[[\s\S]*?\];\r?\n/, '');
content = content.replace(/\/\/ Subscribers data\r?\nconst subscribersData = \[[\s\S]*?\];\r?\n/, '');

// 2. Add states for packs List
content = content.replace(/const \[selectedPack, setSelectedPack\] = useState<.*?\| null>\(null\);/,
    `const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [packsList, setPacksList] = useState<any[]>([]);
  const [subscribersList, setSubscribersList] = useState<any[]>([]);`);

// 3. Replace useEffect mock logic
const topEffect = content.split('// Mock: Load org from ID')[0];
const bottomEffect = content.split('setSelectedOrg(mockOrg);')[1];

if (topEffect && bottomEffect && topEffect !== content) {
    const middleEffect = `// Dynamic fetch
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

// 4. Update filters mapped to packsList instead of packsData
content = content.replace(/const filteredPacks = packsData\.filter/g, 'const filteredPacks = packsList.filter');

// 5. Update stats cards
const oldStatsRender = `{stats.map((stat, index) => {`;
const newStatsRender = `{(() => {
                  const dynamicStats = [
                    { label: "Total Packs", value: packsList.length, icon: Gift, color: "purple" },
                    { label: "Active Packs", value: packsList.filter(p => p.status === 'active').length, icon: CheckCircle2, color: "green" },
                    { label: "Total Subscribers", value: 0, icon: Users, color: "blue" },
                    { label: "Monthly Revenue", value: "₹0", icon: DollarSign, color: "orange" },
                  ];
                  return dynamicStats;
                })().map((stat, index) => {`;
content = content.replace(oldStatsRender, newStatsRender);

// 6. Update subscribers loop
content = content.replace(/subscribersData\.map/g, `subscribersList.map`);
content = content.replace(/\(subscriber\)/g, `(subscriber: any)`);

fs.writeFileSync(file, content);
console.log('Successfully patched packs page.');
