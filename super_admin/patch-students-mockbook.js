const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/super_admin/src/app/mockbook/org/[orgId]/students/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove mock arrays
content = content.replace(/\/\/ Mock students data\r?\nconst studentsData = \[[\s\S]*?\];\r?\n/, '');
content = content.replace(/\/\/ Stats\r?\nconst stats = \[[\s\S]*?\];\r?\n/, '');

// 2. Add students state
content = content.replace(/const \[selectedStudent, setSelectedStudent\] = useState<.*?\| null>\(null\);/,
    `const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);`);

// 3. Replace the useEffect mock logic
const topEffect = content.split('// Mock: Load org from ID')[0];
const bottomEffect = content.split('setSelectedOrg(mockOrg);')[1];

if (topEffect && bottomEffect && topEffect !== content) {
    const middleEffect = `// Dynamic fetch: Load org & students from API
    const fetchOrgAndStudents = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:^|;\\s*)token=([^;]*)/);
        const token = tokenMatch ? tokenMatch[1] : '';
        
        const [orgRes, studentsRes] = await Promise.all([
          fetch(\`http://localhost:4000/api/super-admin/organizations/\${orgId}\`, { headers: { 'Authorization': \`Bearer \${token}\` } }),
          fetch(\`http://localhost:4000/api/super-admin/organizations/\${orgId}/students\`, { headers: { 'Authorization': \`Bearer \${token}\` } })
        ]);
        
        const orgData = await orgRes.json();
        const studentsData = await studentsRes.json();
        
        if (orgData.success) {
          const orgInfo = orgData.data;
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

        if (studentsData.success) {
          setStudentsList(studentsData.data || []);
        }
      } catch (err) {
        console.error("Failed to load org details", err);
        router.push('/mockbook');
      }
    };
    fetchOrgAndStudents();
    `;
    content = topEffect + middleEffect + bottomEffect;
}

// 4. Update filteredStudents filter logic
const filterPattern = /const filteredStudents = studentsData\.filter\(\(student\) => \{[\s\S]*?return matchesSearch && matchesStatus && matchesPack;\r?\n  \}\);/;
const newFilter = `const filteredStudents = studentsList.filter((student: any) => {
    const sName = student.name || "";
    const sEmail = student.email || "";
    const sId = student.studentId || student.id || "";
    const matchesSearch = 
      sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sId.toLowerCase().includes(searchQuery.toLowerCase());
    const studentStatus = student.isActive ? "active" : "inactive";
    const matchesStatus = statusFilter === "all" || studentStatus === statusFilter;
    const matchesPack = packFilter === "all"; // Backend doesn't fully support packs yet
    return matchesSearch && matchesStatus && matchesPack;
  });`;
content = content.replace(filterPattern, newFilter);

// 5. Update stats cards mapping
const oldStatsRender = `{stats.map((stat, index) => {`;
const newStatsRender = `{(() => {
                  const activeCount = studentsList.filter(s => s.isActive).length;
                  const dynamicStats = [
                    { label: "Total Students", value: studentsList.length, icon: Users, color: "blue" },
                    { label: "Active", value: activeCount, icon: CheckCircle2, color: "green" },
                    { label: "With Packs", value: 0, icon: Gift, color: "purple" },
                    { label: "Avg Score", value: "--", icon: BarChart3, color: "orange" },
                  ];
                  return dynamicStats;
                })().map((stat, index) => {`;
content = content.replace(oldStatsRender, newStatsRender);

// 6. Update table rendering map
content = content.replace(/filteredStudents\.map\(\(student\) => \(/g, `filteredStudents.map((student: any) => (`);

// Modify avatar properties
content = content.replace(/\{student\.name\.split\(" "\)\.map\(n => n\[0\]\)\.join\(""\)\}/g, `{student.name ? student.name.charAt(0).toUpperCase() : "?"}`);

// modify class property since it's reserved or different in backend (currentClass)
content = content.replace(/\{student\.class\}/g, '{student.currentClass || "N/A"}');
content = content.replace(/\{student\.target\}/g, '{student.targetExam || "N/A"}');

// modifications for packs, testsTaken, avgScore, streak
content = content.replace(/student\.packs\.length/g, '(student.packs ? student.packs.length : 0)');
content = content.replace(/student\.packs\.slice\(0, 2\)\.map/g, '(student.packs || []).slice(0, 2).map');
content = content.replace(/student\.testsTaken/g, '(student.testsTaken || 0)');
content = content.replace(/student\.avgScore/g, '(student.avgScore || 0)');
content = content.replace(/student\.streak/g, '(student.streak || 0)');

content = content.replace(/student\.status/g, '(student.isActive ? "active" : "inactive")');

fs.writeFileSync(file, content);
console.log('Successfully patched students page.');
