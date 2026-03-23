const fs = require('fs');
const file = 'd:/RahulProjects/New EduHub/mokebook/src/app/tests/results/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/(<section>\s*<h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 mb-6">\s*Rank Predictor <AlertCircle className="h-3 w-3 text-gray-400" \/>\s*<\/h3>)/, 
`{chapterData && chapterData.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 mb-4">
                                    Chapter-wise Analysis <AlertCircle className="h-3 w-3 text-gray-400" />
                                </h3>
                                <div className="overflow-hidden border border-gray-200 rounded text-xs select-none">
                                    <Table>
                                        <TableHeader className="bg-gray-50/80">
                                            <TableRow>
                                                <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Chapter</TableHead>
                                                <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Total</TableHead>
                                                <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Correct</TableHead>
                                                <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Wrong</TableHead>
                                                <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Accuracy</TableHead>
                                                <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {chapterData.map((chap, i) => (
                                                <TableRow key={i} className="bg-white">
                                                    <TableCell className="font-bold text-gray-900 py-3">{chap.name}</TableCell>
                                                    <TableCell className="font-bold text-gray-900 py-3">{chap.total}</TableCell>
                                                    <TableCell className="font-bold text-emerald-600 py-3">{chap.correct}</TableCell>
                                                    <TableCell className="font-bold text-red-500 py-3">{chap.incorrect}</TableCell>
                                                    <TableCell className="font-bold text-gray-900 py-3">{chap.accuracy}%</TableCell>
                                                    <TableCell className="font-bold text-gray-900 py-3">
                                                        {Math.floor((chap.timeSpentSecs || 0)/60).toString().padStart(2,'0')}:
                                                        {((chap.timeSpentSecs || 0)%60).toString().padStart(2,'0')} 
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </section>
                        )}\r\n\r\n                        $1`
);

const tableRegex = /(<TableRow className="bg-white">\s*<TableCell className="font-bold text-gray-900 py-4 border-r border-gray-100">You<\/TableCell>[\s\S]*?)<\/TableBody>/;

content = content.replace(tableRegex, `<TableRow className="bg-white">
                                           <TableCell className="font-bold text-gray-900 py-4 border-r border-gray-100">You</TableCell>
                                           <TableCell className="py-4"><span className="font-bold text-gray-900">{myScore}</span> <span className="text-gray-400">/ {attemptData.totalMarks || 50}</span></TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">{attemptData.accuracy || 0}%</TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">{attemptData.correct || 0}<span className="text-emerald-500"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">{attemptData.incorrect || 0}<span className="text-gray-400"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">
                                               {Math.floor((attemptData.timeTakenSecs || 0)/60).toString().padStart(2,'0')}:
                                               {((attemptData.timeTakenSecs || 0)%60).toString().padStart(2,'0')} <span className="text-gray-400 font-normal"> / {Math.floor((attemptData.totalMarks || 60))} min</span>
                                           </TableCell>
                                       </TableRow>
                                       <TableRow className="bg-purple-50/30">
                                           <TableCell className="font-bold text-gray-900 py-4 border-r border-gray-100">Topper</TableCell>
                                           <TableCell className="py-4"><span className="font-bold text-purple-600">{topperScore}</span> <span className="text-gray-400">/ {attemptData.totalMarks || 50}</span></TableCell>
                                           <TableCell className="font-bold text-purple-600 py-4">{topperScore > 0 ? '100%' : '0%'}</TableCell>
                                           <TableCell className="font-bold text-emerald-600 py-4">{Math.round((topperScore/(attemptData.totalMarks||1))*(attemptData.totalQuestions||1))}<span className="text-emerald-500"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">0<span className="text-gray-400"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">- <span className="text-gray-400 font-normal"></span></TableCell>
                                       </TableRow>
                                       <TableRow className="bg-gray-50/50">
                                           <TableCell className="font-bold text-gray-900 py-4 border-r border-gray-100">Avg</TableCell>
                                           <TableCell className="py-4"><span className="font-bold text-gray-600">{attemptData.avgScore || Math.round(myScore * 0.8)}</span> <span className="text-gray-400">/ {attemptData.totalMarks || 50}</span></TableCell>
                                           <TableCell className="font-bold text-gray-600 py-4">{Math.round((attemptData.accuracy || 0) * 0.8)}%</TableCell>
                                           <TableCell className="font-bold text-emerald-600 py-4">{Math.round((attemptData.correct || 0) * 0.8)}<span className="text-emerald-500"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">{Math.round((attemptData.incorrect || 0) * 1.2)}<span className="text-gray-400"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                           <TableCell className="font-bold text-gray-900 py-4">- <span className="text-gray-400 font-normal"></span></TableCell>
                                       </TableRow>\r\n                                   </TableBody>`);

fs.writeFileSync(file, content);
console.log('done.');
