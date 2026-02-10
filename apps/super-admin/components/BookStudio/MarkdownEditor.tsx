import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    Bold, Italic, List, Heading1, Heading2, Quote, Code,
    Image as ImageIcon, Link, Eye, EyeOff, Minus, Maximize2
} from 'lucide-react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    className = ''
}) => {
    const [showPreview, setShowPreview] = useState(true);

    const insertText = (before: string, after: string = '') => {
        const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
        onChange(newValue);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    return (
        <div className={`flex flex-col h-full border border-slate-200 rounded-xl overflow-hidden bg-white ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50 overflow-x-auto">
                <ToolButton icon={Heading1} onClick={() => insertText('# ')} tooltip="Heading 1" />
                <ToolButton icon={Heading2} onClick={() => insertText('## ')} tooltip="Heading 2" />
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <ToolButton icon={Bold} onClick={() => insertText('**', '**')} tooltip="Bold" />
                <ToolButton icon={Italic} onClick={() => insertText('*', '*')} tooltip="Italic" />
                <ToolButton icon={Quote} onClick={() => insertText('> ')} tooltip="Quote" />
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <ToolButton icon={List} onClick={() => insertText('- ')} tooltip="List" />
                <ToolButton icon={Code} onClick={() => insertText('```\n', '\n```')} tooltip="Code Block" />
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <ToolButton icon={ImageIcon} onClick={() => insertText('![Alt text](', ')')} tooltip="Image" />
                <ToolButton icon={Link} onClick={() => insertText('[Link text](', ')')} tooltip="Link" />
                <div className="flex-1" />
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showPreview
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
                    {showPreview ? 'Preview On' : 'Preview Off'}
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex min-h-0">
                {/* Text Area */}
                <textarea
                    id="markdown-editor"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`flex-1 p-4 resize-none outline-none font-mono text-sm leading-relaxed text-slate-800 focus:bg-slate-50/50 transition-colors ${showPreview ? 'w-1/2 border-r border-slate-100' : 'w-full'}`}
                    placeholder="Start writing your chapter content here... Use Markdown for formatting."
                />

                {/* Live Preview */}
                {showPreview && (
                    <div className="flex-1 p-6 overflow-y-auto prose prose-slate prose-sm max-w-none bg-white">
                        <ReactMarkdown>{value || '*Preview will appear here...*'}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (
    <button
        onClick={onClick}
        title={tooltip}
        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
    >
        <Icon size={16} />
    </button>
);
