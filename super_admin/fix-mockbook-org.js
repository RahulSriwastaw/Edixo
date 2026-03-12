const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/super_admin/src/app/mockbook/org/[orgId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const top = content.split('// Mock: Load org from ID')[0];
const bottom = content.split('setSelectedOrg(mockOrg);')[1];

const middle = `// Dynamic fetch: Load org from API
    const fetchOrgDetails = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:^|;\\s*)token=([^;]*)/);
        const token = tokenMatch ? tokenMatch[1] : '';
        
        const res = await fetch(\`http://localhost:4000/api/super-admin/organizations/\${orgId}\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const data = await res.json();
        
        if (data.success) {
          const orgInfo = data.data;
          setSelectedOrg({
            id: orgInfo.orgId,
            name: orgInfo.name,
            plan: orgInfo.plan || "SMALL",
            status: orgInfo.status || "ACTIVE",
            students: orgInfo.studentCount || 0,
            mockTests: 0,
          });
        } else {
          router.push('/mockbook');
        }
      } catch (err) {
        console.error("Failed to load org details", err);
        router.push('/mockbook');
      }
    };

    fetchOrgDetails();
    `;

if (top && bottom && top !== content) {
  content = top + middle + bottom;
  fs.writeFileSync(file, content);
  console.log('Successfully replaced org mock details via split.');
} else {
  console.log('Failed to find split anchors.');
}
