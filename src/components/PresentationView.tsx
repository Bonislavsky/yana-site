/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Clock, 
  FileText, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SLIDES_DATA } from '../data/slidesData';
import { NavigationTab } from '../types';

interface PresentationViewProps {
  onNavigateToTab: (tab: NavigationTab) => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ onNavigateToTab }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentSlide = SLIDES_DATA[currentSlideIndex];

  // Timer logic for speaker practice
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  const handleNextSlide = () => {
    if (currentSlideIndex < SLIDES_DATA.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Presentation Bar: Progress & Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Slide Counter & Category */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
            {String(currentSlide.id).padStart(2, '0')} / {String(SLIDES_DATA.length).padStart(2, '0')}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            {currentSlide.category}
          </span>
        </div>

        {/* Progress Dots / Bar */}
        <div className="hidden lg:flex items-center gap-1.5 flex-1 max-w-md mx-4">
          {SLIDES_DATA.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              title={`${s.id}. ${s.title}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'bg-cyan-400 w-8'
                  : idx < currentSlideIndex
                  ? 'bg-cyan-700/60 w-3 hover:bg-cyan-600'
                  : 'bg-slate-700 w-3 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Presenter Tools: Timer, Notes Toggle, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Practice Timer */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-1 p-0.5 text-slate-400 hover:text-cyan-400 cursor-pointer"
              title={isTimerRunning ? 'Пауза' : 'Старт'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
              title="Скинути таймер"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Speaker notes toggle button */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              showSpeakerNotes
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Нотатки доповідача</span>
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors"
            title="Повноекранний режим (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Stage */}
      <div className="relative rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 shadow-2xl p-6 sm:p-10 min-h-[580px] flex flex-col justify-between overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Header */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-400">
            <span>Розділ: {currentSlide.category}</span>
            {currentSlide.questionNumber && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">Ключове питання №{currentSlide.questionNumber}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Регламент: ~{currentSlide.durationMin} хв</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight text-balance leading-tight">
            {currentSlide.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal max-w-3xl">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Slide Body: 2-column Layout (Key Points + Visual/Illustration) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 relative z-10 items-stretch">
          {/* Key Academic Points */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-center">
            {currentSlide.keyPoints.map((pt, pIdx) => (
              <div
                key={pIdx}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700/80 transition-colors"
              >
                <h3 className="text-base font-semibold text-cyan-200 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {pt.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {pt.description}
                </p>
                {pt.formula && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 inline-block">
                    {pt.formula}
                  </div>
                )}
              </div>
            ))}

            {/* Live Interactive Action Link depending on topic */}
            <div className="pt-2 flex flex-wrap gap-3">
              {currentSlide.questionNumber === 1 && (
                <button
                  onClick={() => onNavigateToTab('acoustic_lab')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Відкрити віртуальну лабораторію інструментів (струни, духові, биття)
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              )}

              {currentSlide.questionNumber === 2 && (
                <button
                  onClick={() => onNavigateToTab('psychoacoustics')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Дослідити модель Бадделі та симулятор шумів
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              )}

              {currentSlide.questionNumber === 3 && (
                <button
                  onClick={() => onNavigateToTab('experiment')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Запустити інтерактивний тест уваги в різних звукових умовах
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Visual Illustration Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {currentSlide.imagePath ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-xl group bg-slate-950">
                <img
                  src={currentSlide.imagePath}
                  alt={currentSlide.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-300 bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg border border-slate-800/80">
                  <span className="font-semibold text-cyan-300">Наукова схема: </span>
                  {currentSlide.title}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 flex items-center justify-center text-slate-500 text-sm">
                Ілюстрація слайду
              </div>
            )}
          </div>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 relative z-10">
          <button
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Попередній</span>
          </button>

          <div className="text-xs text-slate-400 font-mono">
            Використовуйте стрілки <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">←</span>{' '}
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">→</span> або Пробіл
          </div>

          <button
            onClick={handleNextSlide}
            disabled={currentSlideIndex === SLIDES_DATA.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-950 transition-colors cursor-pointer"
          >
            <span>Наступний</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speaker Notes Drawer (Текст виступу доповідача) */}
      {showSpeakerNotes && (
        <div className="rounded-xl border border-cyan-500/20 bg-slate-900/80 p-5 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Текст виступу для доповідача (Speaker Script)</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Орієнтовний час виголошення: ~{currentSlide.durationMin} хв
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-950/70 p-4 rounded-lg border border-slate-800/80 selection:bg-cyan-500/30">
            {currentSlide.speakerNotes}
          </p>
        </div>
      )}

      {/* Slides Overview Grid (Quick Jump) */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-300">Швидкий перехід між слайдами:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
          {SLIDES_DATA.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-sm'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-cyan-400 mb-0.5">#{slide.id}</div>
              <div className="text-[11px] font-medium line-clamp-2 leading-tight">
                {slide.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
