import React from 'react';
import { CheckCircle, Info } from 'lucide-react';

interface SEOContentProps {
  title: string;
  sections: {
    heading: string;
    content: string;
    list?: string[];
  }[];
}

export const SEOContent: React.FC<SEOContentProps> = ({ title, sections }) => {
  return (
    <section className="max-w-5xl mx-auto mt-20 mb-12 border-t border-[var(--border-input)] pt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[var(--text-secondary)]">
          <Info className="w-4 h-4" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">About {title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">{section.heading}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base">
              {section.content}
            </p>
            {section.list && (
              <ul className="space-y-3">
                {section.list.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[var(--text-secondary)]">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
