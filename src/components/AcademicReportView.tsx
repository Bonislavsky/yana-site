/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Printer, 
  BookOpen, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { ACADEMIC_REPORT } from '../data/reportData';

export const AcademicReportView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    let fullText = `${ACADEMIC_REPORT.meta.topic}\n${ACADEMIC_REPORT.meta.abstract}\n\n`;

    ACADEMIC_REPORT.sections.forEach((sec) => {
      fullText += `=== ${sec.number}: ${sec.title} ===\n\n`;
      sec.content.forEach((p) => {
        fullText += `${p}\n\n`;
      });
      if (sec.subsections) {
        sec.subsections.forEach((sub) => {
          fullText += `--- ${sub.title} ---\n`;
          sub.paragraphs.forEach((sp) => {
            fullText += `${sp}\n\n`;
          });
          if (sub.equations) {
            sub.equations.forEach((eq) => {
              fullText += `[Формула]: ${eq}\n`;
            });
            fullText += '\n';
          }
        });
      }
    });

    fullText += '=== СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ ===\n';
    ACADEMIC_REPORT.references.forEach((ref, idx) => {
      fullText += `${idx + 1}. ${ref}\n`;
    });

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 print:hidden">
        <div>
          <span className="text-xs font-mono text-cyan-400 block mb-0.5">
            АКАДЕМІЧНИЙ ТЕКСТ ДОПОВІДІ ДЛЯ ЗАХИСТУ
          </span>
          <span className="text-sm font-bold text-slate-100">
            Повний текст наукового дослідження з апаратом джерел
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Скопійовано!' : 'Скопіювати весь текст'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-xs font-bold text-slate-950 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Друк доповіді</span>
          </button>
        </div>
      </div>

      {/* Main Document Sheet (Paper Style) */}
      <article className="p-8 sm:p-12 rounded-2xl border border-slate-800/90 bg-slate-900/30 text-slate-200 shadow-2xl space-y-10 print:border-none print:bg-white print:text-black print:p-0">
        {/* Title Header */}
        <div className="text-center space-y-3 border-b border-slate-800 pb-8 print:border-slate-300">
          <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase print:text-slate-600">
            Науково-дослідницька доповідь
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight max-w-3xl mx-auto leading-snug print:text-black">
            «{ACADEMIC_REPORT.meta.topic}»
          </h1>
          <div className="text-xs text-slate-400 flex items-center justify-center gap-4 pt-2 print:text-slate-600">
            <span>{ACADEMIC_REPORT.meta.author}</span>
            <span>·</span>
            <span>Рік видання: {ACADEMIC_REPORT.meta.date}</span>
          </div>
        </div>

        {/* Abstract Box */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 text-xs text-slate-300 leading-relaxed italic print:border-slate-300 print:bg-slate-50 print:text-slate-800">
          <span className="font-bold not-italic text-cyan-400 block mb-1 print:text-slate-900">
            АНОТАЦІЯ:
          </span>
          {ACADEMIC_REPORT.meta.abstract}
        </div>

        {/* Sections */}
        {ACADEMIC_REPORT.sections.map((section) => (
          <section key={section.id} id={section.id} className="space-y-4 pt-4 border-t border-slate-800/60 print:border-slate-300">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider print:text-slate-700">
                {section.number}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight print:text-black">
                {section.title}
              </h2>
            </div>

            {section.content.map((p, pIdx) => (
              <p key={pIdx} className="text-sm text-slate-300 leading-relaxed text-justify print:text-slate-800">
                {p}
              </p>
            ))}

            {section.subsections && (
              <div className="space-y-6 pt-2">
                {section.subsections.map((sub, sIdx) => (
                  <div key={sIdx} className="space-y-3 pl-3 sm:pl-4 border-l-2 border-slate-800 print:border-slate-300">
                    <h3 className="text-base font-semibold text-cyan-200 print:text-slate-900">
                      {sub.title}
                    </h3>
                    {sub.paragraphs.map((sp, spIdx) => (
                      <p key={spIdx} className="text-sm text-slate-300 leading-relaxed text-justify print:text-slate-800">
                        {sp}
                      </p>
                    ))}
                    {sub.equations && (
                      <div className="space-y-1 my-3 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 print:bg-slate-100 print:border-slate-300 print:text-slate-900">
                        {sub.equations.map((eq, eqIdx) => (
                          <div key={eqIdx} className="py-0.5">
                            {eq}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* References List */}
        <section className="space-y-4 pt-6 border-t border-slate-800 print:border-slate-300">
          <h2 className="text-lg font-bold text-slate-100 print:text-black">
            Список використаних джерел та літератури:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 leading-relaxed print:text-slate-700">
            {ACADEMIC_REPORT.references.map((ref, rIdx) => (
              <li key={rIdx} className="pl-1">
                {ref}
              </li>
            ))}
          </ol>
        </section>
      </article>
    </div>
  );
};
