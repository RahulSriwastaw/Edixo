const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/super_admin/src/app/mockbook/org/[orgId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Use a more robust regex that ignores specific inner structure and finds the start/end of the block
const startMarker = '{recentActivity.map';
const endMarker = '))}';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex !== -1) {
        const fullEndIndex = endIndex + endMarker.length;
        const targetBlock = content.substring(startIndex, fullEndIndex);

        const replacement = `{auditLogs.length > 0 ? auditLogs.slice(0, 5).map((log, index) => (
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

        content = content.substring(0, startIndex) + replacement + content.substring(fullEndIndex);
        fs.writeFileSync(file, content);
        console.log('Successfully replaced recentActivity block');
    } else {
        console.log('Could not find end marker');
    }
} else {
    console.log('Could not find start marker');
}
