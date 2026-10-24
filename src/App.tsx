/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationTab } from './types';
import { Navbar } from './components/Navbar';
import { PresentationView } from './components/PresentationView';
import { AcousticPhysicsLab } from './components/AcousticPhysicsLab';
import { PsychoacousticsView } from './components/PsychoacousticsView';
import { ExperimentRunnerView } from './components/ExperimentRunnerView';
import { AcademicReportView } from './components/AcademicReportView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('presentation');

  const handlePrint = () => {
    // If not in report mode, optionally we can switch to report or just print current
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar following 3-Zone Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'presentation' && (
          <PresentationView onNavigateToTab={setCurrentTab} />
        )}
        {currentTab === 'acoustic_lab' && (
          <AcousticPhysicsLab />
        )}
        {currentTab === 'psychoacoustics' && (
          <PsychoacousticsView />
        )}
        {currentTab === 'experiment' && (
          <ExperimentRunnerView />
        )}
        {currentTab === 'report' && (
          <AcademicReportView />
        )}
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">
              «Звук як фізичне явище та чинник навчальної діяльності»
            </span>
            <span>·</span>
            <span>Академічна доповідь та інтерактивна лабораторія</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setCurrentTab('presentation')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Презентація
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('acoustic_lab')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Фізика інструментів
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('experiment')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Експеримент уваги
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('report')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Текст доповіді
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
