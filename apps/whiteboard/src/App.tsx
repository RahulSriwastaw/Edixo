import { useState } from 'react';
import './App.css';
import { SmartBoard } from './components/SmartBoard';
import { ImportQuestionsModal } from './components/ImportQuestionsModal';
import { Question } from './types';
import { Download, Cast } from 'lucide-react';

// Sample questions for demo
const sampleQuestions: Question[] = [
    {
        id: '1',
        question_eng: 'What is 2 + 2?',
        question_hin: '2 + 2 क्या है?',
        option1_eng: '3',
        option1_hin: '३',
        option2_eng: '4',
        option2_hin: '४',
        option3_eng: '5',
        option3_hin: '५',
        option4_eng: '6',
        option4_hin: '६',
        answer: '2',
        solution_eng: '<p>2 + 2 = 4. This is basic addition.</p>',
        solution_hin: '<p>2 + 2 = 4. यह बुनियादी जोड़ है।</p>'
    },
    {
        id: '2',
        question_eng: 'What is the capital of France?',
        question_hin: 'फ्रांस की राजधानी क्या है?',
        option1_eng: 'London',
        option1_hin: 'लंदन',
        option2_eng: 'Paris',
        option2_hin: 'पेरिस',
        option3_eng: 'Berlin',
        option3_hin: 'बर्लिन',
        option4_eng: 'Madrid',
        option4_hin: 'मैड्रिड',
        answer: '2',
        solution_eng: '<p>Paris is the capital and largest city of France.</p>',
        solution_hin: '<p>पेरिस फ्रांस की राजधानी और सबसे बड़ा शहर है।</p>'
    }
];

function App() {
    const [showBoard, setShowBoard] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [broadcastMode, setBroadcastMode] = useState(false);
    const [questions, setQuestions] = useState<Question[]>(sampleQuestions);

    const handleImportQuestions = (importedQuestions: Question[]) => {
        setQuestions(importedQuestions);
        setShowBoard(true);
    };

    if (showBoard) {
        return (
            <SmartBoard
                questions={questions}
                initialIdx={0}
                setName="Whiteboard Session"
                onExit={() => setShowBoard(false)}
                broadcastMode={broadcastMode}
            />
        );
    }

    return (
        <div className="whiteboard-app">
            <header className="toolbar">
                <h1>Whiteboard App</h1>
            </header>

            <main className="canvas-area">
                <div className="canvas-placeholder">
                    <p>🎨 Advanced Whiteboard</p>
                    <p className="subtitle">Interactive Teaching Tool</p>

                    <div className="action-buttons">
                        <button
                            onClick={() => setShowBoard(true)}
                            className="start-button"
                        >
                            Launch with Demo Questions
                        </button>

                        <button
                            onClick={() => {
                                setBroadcastMode(true);
                                setShowBoard(true);
                            }}
                            className="broadcast-button"
                            style={{ backgroundColor: '#7C3AED', color: 'white', marginLeft: 10 }}
                        >
                            <Cast size={18} />
                            Start Broadcast Mode
                        </button>

                        <button
                            onClick={() => setShowImportModal(true)}
                            className="import-button"
                        >
                            <Download size={18} />
                            Import from Admin Panel
                        </button>
                    </div>
                </div>
            </main>

            <footer>
                <p>Whiteboard App - Powered by Q-Bank</p>
            </footer>

            {showImportModal && (
                <ImportQuestionsModal
                    onClose={() => setShowImportModal(false)}
                    onImport={handleImportQuestions}
                />
            )}
        </div>
    );
}

export default App;
