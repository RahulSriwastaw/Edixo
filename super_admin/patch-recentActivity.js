const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/super_admin/src/app/mockbook/org/[orgId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{recentActivity\.map\(\(item, index\) => \([\s\S]*?\}\)\}/g;
const newContent = `{auditLogs.length > 0 ? auditLogs.slice(0, 5).map((log: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <span className="text-lg">{log.action ? '📝' : '👤'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 capitalize">{log.action?.replace(/_/g, " ")}: {log.details}</div>
                            <div className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-gray-500 text-sm py-4">No recent activity found.</div>
                      )}`;

content = content.replace(regex, newContent);
fs.writeFileSync(file, content);
console.log('Fixed recentActivity loop');
