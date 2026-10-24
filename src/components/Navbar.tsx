/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Printer } from 'lucide-react';
import { NavigationTab } from '../types';
import { soundEngine } from '../utils/audioEngine';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onPrint }) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.getMutedState());

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const navLinks: { id: NavigationTab; label: string }[] = [
    { id: 'presentation', label: 'Презентація' },
    { id: 'acoustic_lab', label: 'Фізика звуку' },
    { id: 'psychoacoustics', label: 'Психоакустика' },
    { id: 'experiment', label: 'Лабораторія експерименту' },
    { id: 'report', label: 'Текст доповіді' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-base">
            Hz
          </div>
          <button
            onClick={() => onSelectTab('presentation')}
            className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
          >
            <span className="text-base font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
              Звук & Увага
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 ml-2">
              · Наукова доповідь
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                currentTab === link.id
                  ? 'text-cyan-400 border-cyan-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
            title={isMuted ? 'Звук вимкнено' : 'Звук увімкнено'}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={onPrint}
            title="Роздрукувати або зберегти як PDF"
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-900/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Друк / PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto pt-3 border-t border-slate-800/60 mt-3 text-xs">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelectTab(link.id)}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              currentTab === link.id
                ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};
