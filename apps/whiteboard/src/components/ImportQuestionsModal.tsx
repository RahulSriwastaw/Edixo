import { useState } from 'react';
import { X, Download, Loader2, Lock } from 'lucide-react';
import { Question } from '../types';
import './ImportQuestionsModal.css';

interface ImportQuestionsModalProps {
    onClose: () => void;
    onImport: (questions: Question[]) => void;
}

export const ImportQuestionsModal = ({ onClose, onImport }: ImportQuestionsModalProps) => {
    const [setId, setSetId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImport = async () => {
        if (!setId.trim()) {
            setError('Please enter a Set ID');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Import questionService
            const { questionService } = await import('../services/questionService');

            // Fetch questions using Set ID and Password
            const questions = await questionService.getQuestionsBySetId(setId, password);

            if (questions.length === 0) {
                setError('No questions found in this set');
                return;
            }

            onImport(questions);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import questions');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="import-modal-backdrop" onClick={onClose}>
            <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                <div className="import-modal-header">
                    <div className="import-modal-title">
                        <Download size={20} />
                        <h2>Import Questions from Admin Panel</h2>
                    </div>
                    <button onClick={onClose} className="close-button">
                        <X size={20} />
                    </button>
                </div>

                <div className="import-modal-body">
                    <div className="form-group">
                        <label htmlFor="setId">Question Set ID</label>
                        <input
                            id="setId"
                            type="text"
                            value={setId}
                            onChange={(e) => setSetId(e.target.value)}
                            placeholder="Enter Set ID (e.g., SET-2024-001)"
                            className="set-id-input"
                            disabled={isLoading}
                            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '15px' }}>
                        <label htmlFor="password">
                            Password <span className="optional-text">(Optional)</span>
                        </label>
                        <div className="password-input-wrapper">
                            <Lock size={16} className="password-icon" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Set Password"
                                className="password-input"
                                disabled={isLoading}
                                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                            />
                        </div>
                        <p className="help-text">
                            Required only if the set is password protected
                        </p>
                    </div>

                    <div className="info-box">
                        <strong>🧪 Testing Mode:</strong> Try "DEMO-001" or "PHYSICS-101" for mock data
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>

                <div className="import-modal-footer">
                    <button onClick={onClose} className="btn-secondary" disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        className="btn-primary"
                        disabled={isLoading || !setId.trim()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="spinner" />
                                Importing...
                            </>
                        ) : (
                            'Import Questions'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
