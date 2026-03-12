const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/super_admin/src/app/mockbook/org/[orgId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove mock arrays
content = content.replace(/\/\/ Stats\r?\nconst orgStats = \[[\s\S]*?\];\r?\n/, '');
content = content.replace(/\/\/ Recent activity\r?\nconst recentActivity = \[[\s\S]*?\];\r?\n/, '');
content = content.replace(/\/\/ Top performers\r?\nconst topPerformers = \[[\s\S]*?\];\r?\n/, '');

// 2. State hooks
content = content.replace(/const \[showOrgSwitcher, setShowOrgSwitcher\] = useState\(false\);/, `const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);\n  const [auditLogs, setAuditLogs] = useState<any[]>([]);`);

// 3. API Fetch
const oldFetch = `        const res = await fetch(\`http://localhost:4000/api/super-admin/organizations/\${orgId}\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const data = await res.json();`;

const newFetch = `        const [orgRes, auditRes] = await Promise.all([
          fetch(\`http://localhost:4000/api/super-admin/organizations/\${orgId}\`, { headers: { 'Authorization': \`Bearer \${token}\` } }),
          fetch(\`http://localhost:4000/api/super-admin/organizations/\${orgId}/audit\`, { headers: { 'Authorization': \`Bearer \${token}\` } })
        ]);
        const data = await orgRes.json();
        const auditData = await auditRes.json();
        
        if (auditData.success) {
          setAuditLogs(auditData.data || []);
        }`;

content = content.replace(oldFetch, newFetch);

// 4. Update selectedOrg mapping
content = content.replace(/students: orgInfo\.studentCount \|\| 0,/g, `students: orgInfo._count?.students || orgInfo.studentCount || 0,
            mockTests: orgInfo._count?.testAttempts || 0,
            aiCredits: orgInfo.aiCredits || 0,`);
content = content.replace(/mockTests: 0,/, '');

// 5. Replace render block for stats
const oldStatsRender = `{orgStats.map((stat, index) => {`;
const newStatsRender = `{(() => {
                  const planLimit = selectedOrg.plan === 'ENTERPRISE' ? 20000 : selectedOrg.plan === 'LARGE' ? 8000 : selectedOrg.plan === 'MEDIUM' ? 2000 : 500;
                  const stats = [
                    { label: "Total MockTests", value: selectedOrg.mockTests || 0, icon: BookOpen, color: "purple" },
                    { label: "Active Students", value: selectedOrg.students || 0, icon: Users, color: "blue" },
                    { label: "Tests Attempted", value: selectedOrg.mockTests || 0, icon: CheckCircle2, color: "green" },
                    { label: "AI Credits Used", value: \`\${selectedOrg.aiCredits || 0}/\${planLimit}\`, icon: Sparkles, color: "orange" },
                  ];
                  return stats;
                })().map((stat, index) => {`;
content = content.replace(oldStatsRender, newStatsRender);

// 6. Replace recent activity
content = content.replace(/\{recentActivity\.map\(\(item, index\) => \([\s\S]*?\}\)\}/, `{auditLogs.length > 0 ? auditLogs.slice(0, 5).map((log: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <span className="text-lg">{getActivityIcon('student')}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 capitalize">{log.action.replace(/_/g, " ")}: {log.details}</div>
                            <div className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-gray-500 text-sm py-4">No recent activity found.</div>
                      )}`);

// 7. Replace top performers
content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-5 gap-4">[\s\S]*?<\/div>[\s\S]*?<\/CardContent>[\s\S]*?<\/Card>/, `<div className="py-8 text-center text-sm text-gray-400">Performance analytics are currently being tracked. Top performers will appear here soon.</div>
                </CardContent>
              </Card>`);

// 8. Replace dynamic credits
content = content.replace(/<span className="font-medium">342 \/ 500 credits<\/span>/, `<span className="font-medium">{selectedOrg.aiCredits || 0} / {selectedOrg.plan === 'ENTERPRISE' ? 20000 : selectedOrg.plan === 'LARGE' ? 8000 : selectedOrg.plan === 'MEDIUM' ? 2000 : 500} credits</span>`);
content = content.replace(/<Progress value=\{68\} className="h-2" \/>/, `<Progress value={Math.round(((selectedOrg.aiCredits || 0) / (selectedOrg.plan === 'ENTERPRISE' ? 20000 : selectedOrg.plan === 'LARGE' ? 8000 : selectedOrg.plan === 'MEDIUM' ? 2000 : 500)) * 100)} className="h-2" />`);

fs.writeFileSync(file, content);
console.log('Successfully completed file patch.');
