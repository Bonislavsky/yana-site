/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Volume2, 
  Layers, 
  Wind, 
  Activity, 
  Sliders, 
  Square,
  HelpCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';

type InstrumentLabMode = 'strings' | 'pipes' | 'beats' | 'timbre';

export const AcousticPhysicsLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<InstrumentLabMode>('strings');

  // String instrument state
  const [stringLength, setStringLength] = useState(0.65); // meters (65 cm)
  const [stringTension, setStringTension] = useState(120); // Newtons
  const [stringMaterial, setStringMaterial] = useState<'steel' | 'nylon' | 'bronze'>('steel');
  const [harmonicN, setHarmonicN] = useState(1);

  // Material linear densities (kg/m)
  const materialDensities: Record<string, { name: string; mu: number }> = {
    steel: { name: 'Сталь (густина μ = 0.005 кг/м)', mu: 0.005 },
    nylon: { name: 'Нейлон (густина μ = 0.0015 кг/м)', mu: 0.0015 },
    bronze: { name: 'Бронзова обмотка (густина μ = 0.012 кг/м)', mu: 0.012 },
  };

  // String frequency calculation: f_n = (n / (2L)) * sqrt(T / mu)
  const currentMu = materialDensities[stringMaterial].mu;
  const waveSpeed = Math.sqrt(stringTension / currentMu);
  const fundamentalStringFreq = (1 / (2 * stringLength)) * waveSpeed;
  const actualStringFreq = fundamentalStringFreq * harmonicN;

  // Wind Pipe state
  const [pipeLength, setPipeLength] = useState(0.40); // 40 cm
  const [isOpenPipe, setIsOpenPipe] = useState(true);
  const airSpeed = 343; // m/s at 20°C
  const fundamentalPipeFreq = isOpenPipe ? airSpeed / (2 * pipeLength) : airSpeed / (4 * pipeLength);

  // Beats & Tuning Fork state
  const [fork1Freq, setFork1Freq] = useState(440); // Hz (A4)
  const [fork2Freq, setFork2Freq] = useState(443); // Hz
  const beatFrequency = Math.abs(fork1Freq - fork2Freq);

  // Timbre & Fourier synthesis state
  const [harmonics, setHarmonics] = useState<number[]>([1.0, 0.55, 0.35, 0.18, 0.08]);
  const [baseTimbreFreq, setBaseTimbreFreq] = useState(220); // A3
  const [isContinuousPlaying, setIsContinuousPlaying] = useState(false);

  // Standing wave canvas animation
  const standingWaveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = standingWaveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark slate background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Node markers
      const nodesCount = activeMode === 'strings' ? harmonicN + 1 : (isOpenPipe ? 2 : 2);
      const antinodesCount = activeMode === 'strings' ? harmonicN : 1;

      // Draw horizontal baseline
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, h / 2);
      ctx.lineTo(w - 40, h / 2);
      ctx.stroke();

      if (activeMode === 'strings') {
        const stringWidth = w - 80;
        const amplitude = 38 * Math.sin(time * (actualStringFreq > 400 ? 10 : 7));

        // Draw standing wave
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        for (let x = 0; x <= stringWidth; x++) {
          const normX = x / stringWidth;
          // Standing wave equation: y(x, t) = A * sin(n * pi * x / L) * cos(omega * t)
          const y = (h / 2) + amplitude * Math.sin(harmonicN * Math.PI * normX);
          if (x === 0) ctx.moveTo(40 + x, y);
          else ctx.lineTo(40 + x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw ghost envelope (upper & lower boundary)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;

        // Top envelope
        ctx.beginPath();
        for (let x = 0; x <= stringWidth; x++) {
          const normX = x / stringWidth;
          const y = (h / 2) - 38 * Math.abs(Math.sin(harmonicN * Math.PI * normX));
          if (x === 0) ctx.moveTo(40 + x, y);
          else ctx.lineTo(40 + x, y);
        }
        ctx.stroke();

        // Bottom envelope
        ctx.beginPath();
        for (let x = 0; x <= stringWidth; x++) {
          const normX = x / stringWidth;
          const y = (h / 2) + 38 * Math.abs(Math.sin(harmonicN * Math.PI * normX));
          if (x === 0) ctx.moveTo(40 + x, y);
          else ctx.lineTo(40 + x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Mark nodes (вузли)
        for (let i = 0; i <= harmonicN; i++) {
          const nodeX = 40 + (i / harmonicN) * stringWidth;
          ctx.fillStyle = '#ef4444'; // Red for node
          ctx.beginPath();
          ctx.arc(nodeX, h / 2, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f87171';
          ctx.font = '10px monospace';
          ctx.fillText(`Вузол ${i}`, nodeX - 18, h / 2 + 20);
        }

        // Mark antinodes (пучності)
        for (let i = 0; i < harmonicN; i++) {
          const antinodeX = 40 + ((i + 0.5) / harmonicN) * stringWidth;
          ctx.fillStyle = '#10b981'; // Green for antinode
          ctx.beginPath();
          ctx.arc(antinodeX, h / 2 - 38, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#34d399';
          ctx.font = '10px monospace';
          ctx.fillText('Пучність', antinodeX - 20, h / 2 - 46);
        }
      } else if (activeMode === 'pipes') {
        const pipeWidth = w - 80;
        const amp = 35 * Math.sin(time * 8);

        ctx.strokeStyle = '#a855f7'; // Purple wave
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let x = 0; x <= pipeWidth; x++) {
          const normX = x / pipeWidth;
          // Open pipe: nodes inside, antinodes at open ends
          // Closed pipe: node at closed end (x=0), antinode at open end (x=1)
          let yFactor = 0;
          if (isOpenPipe) {
            yFactor = Math.cos(Math.PI * normX);
          } else {
            yFactor = Math.sin((Math.PI / 2) * normX);
          }
          const y = (h / 2) + amp * yFactor;
          if (x === 0) ctx.moveTo(40 + x, y);
          else ctx.lineTo(40 + x, y);
        }
        ctx.stroke();

        // Pipe physical borders
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, h / 2 - 45, pipeWidth, 90);

        if (!isOpenPipe) {
          // Closed left wall
          ctx.fillStyle = '#475569';
          ctx.fillRect(36, h / 2 - 45, 8, 90);
        }
      } else if (activeMode === 'beats') {
        // Draw interference waveform: s(t) = 2A * cos(pi * delta_f * t) * sin(pi * f_avg * t)
        const beatsWidth = w - 80;
        ctx.strokeStyle = '#f59e0b'; // Amber
        ctx.lineWidth = 2;
        ctx.beginPath();

        const deltaF = beatFrequency;
        const fAvg = 6; // visual scaled carrier
        for (let x = 0; x <= beatsWidth; x++) {
          const tNorm = (x / beatsWidth) * 3 + time * 0.5;
          const envelope = Math.cos(Math.PI * (deltaF / 4) * tNorm);
          const carrier = Math.sin(2 * Math.PI * fAvg * tNorm);
          const y = (h / 2) + 38 * envelope * carrier;

          if (x === 0) ctx.moveTo(40 + x, y);
          else ctx.lineTo(40 + x, y);
        }
        ctx.stroke();

        // Draw dotted envelope
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let x = 0; x <= beatsWidth; x++) {
          const tNorm = (x / beatsWidth) * 3 + time * 0.5;
          const envelope = Math.abs(Math.cos(Math.PI * (deltaF / 4) * tNorm));
          const y = (h / 2) - 38 * envelope;
          if (x === 0) ctx.moveTo(40 + x, y);
          else ctx.lineTo(40 + x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (let x = 0; x <= beatsWidth; x++) {
          const tNorm = (x / beatsWidth) * 3 + time * 0.5;
          const envelope = Math.abs(Math.cos(Math.PI * (deltaF / 4) * tNorm));
          const y = (h / 2) + 38 * envelope;
          if (x === 0) ctx.moveTo(40 + x, y);
          else ctx.lineTo(40 + x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      time += 0.05;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [activeMode, harmonicN, isOpenPipe, beatFrequency, actualStringFreq]);

  // Clean up continuous audio on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopHarmonicLab();
    };
  }, []);

  const handlePluckString = () => {
    // Generate harmonics weights based on harmonicN
    const weights = [0, 0, 0, 0, 0];
    weights[harmonicN - 1] = 1.0;
    // Add small adjacent overtones for organic instrument realism
    if (harmonicN > 1) weights[harmonicN - 2] = 0.2;
    if (harmonicN < 5) weights[harmonicN] = 0.25;
    soundEngine.playStringInstrument(actualStringFreq, weights, 2.5);
  };

  const handleBlowPipe = () => {
    soundEngine.playWindPipe(fundamentalPipeFreq, isOpenPipe, 2.0);
  };

  const handleStrikeTuningForks = () => {
    soundEngine.playTuningFork(fork1Freq, fork2Freq, 3.5);
  };

  const handleToggleContinuousTimbre = () => {
    if (isContinuousPlaying) {
      soundEngine.stopHarmonicLab();
      setIsContinuousPlaying(false);
    } else {
      soundEngine.startHarmonicLab(baseTimbreFreq, harmonics, 'sine');
      setIsContinuousPlaying(true);
    }
  };

  const handleTimbreSliderChange = (idx: number, val: number) => {
    const updated = [...harmonics];
    updated[idx] = val;
    setHarmonics(updated);
    if (isContinuousPlaying) {
      soundEngine.startHarmonicLab(baseTimbreFreq, updated, 'sine');
    }
  };

  const applyPreset = (preset: 'tuning_fork' | 'flute' | 'violin' | 'clarinet') => {
    let p = [1, 0, 0, 0, 0];
    if (preset === 'tuning_fork') p = [1.0, 0.0, 0.0, 0.0, 0.0];
    if (preset === 'flute') p = [1.0, 0.45, 0.15, 0.05, 0.0];
    if (preset === 'violin') p = [1.0, 0.75, 0.6, 0.45, 0.3];
    if (preset === 'clarinet') p = [1.0, 0.05, 0.75, 0.05, 0.5]; // odd harmonics dominance
    setHarmonics(p);
    if (isContinuousPlaying) {
      soundEngine.startHarmonicLab(baseTimbreFreq, p, 'sine');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header section */}
      <div className="border-b border-slate-800 pb-5">
        <div className="text-xs font-semibold text-cyan-400 mb-1">
          Ключове питання №1 · Практичний акустичний практикум
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Лабораторія фізики звуку та музичних інструментів
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Досліджуйте фізичні закони коливань за допомогою віртуальних струнних, духових систем, камертонів та адитивного спектрального синтезу тембру в реальному часі.
        </p>

        {/* Experiment sub-tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <button
            onClick={() => {
              setActiveMode('strings');
              soundEngine.stopHarmonicLab();
              setIsContinuousPlaying(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              activeMode === 'strings'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            1. Струни (Закон Мерсенна)
          </button>

          <button
            onClick={() => {
              setActiveMode('pipes');
              soundEngine.stopHarmonicLab();
              setIsContinuousPlaying(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              activeMode === 'pipes'
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            2. Духові трубки (Резонанс)
          </button>

          <button
            onClick={() => {
              setActiveMode('beats');
              soundEngine.stopHarmonicLab();
              setIsContinuousPlaying(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              activeMode === 'beats'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. Камертони та биття
          </button>

          <button
            onClick={() => setActiveMode('timbre')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              activeMode === 'timbre'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            4. Тембр та спектр Фур’є
          </button>
        </div>
      </div>

      {/* Main Sandbox Layout: Left 60% Interactive Visualization + Right 40% Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone: Interactive Stage (Standing Waves + Real-Time Oscilloscope/FFT) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Standing Wave Visualizer Canvas */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Моделювання хвильового процесу в реальному часі
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {activeMode === 'strings' && `Гармонічна мода n = ${harmonicN}`}
                {activeMode === 'pipes' && (isOpenPipe ? 'Відкрита трубка (λ = 2L)' : 'Закрита трубка (λ = 4L)')}
                {activeMode === 'beats' && `Частота биттів: ${beatFrequency.toFixed(1)} Гц`}
                {activeMode === 'timbre' && `Базова частота: ${baseTimbreFreq} Гц`}
              </span>
            </div>

            <canvas
              ref={standingWaveCanvasRef}
              width={700}
              height={190}
              className="w-full h-auto rounded-lg border border-slate-800/80 bg-slate-950 block"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Червоні маркери = Акустичні вузли (швидкість = 0)</span>
              <span>Зелені маркери = Пучності (максимум амплітуди)</span>
            </div>
          </div>

          {/* Real Audio Spectrum / Oscilloscope from Web Audio API */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                Спектральний аналізатор та осцилограф вихідного сигналу
              </span>
              <span className="text-[11px] text-slate-500">Швидке перетворення Фур’є (FFT 2048)</span>
            </div>
            <AudioVisualizerCanvas mode="both" height={150} />
          </div>

          {/* Physical Formula Reference Card */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
            <div className="text-xs font-semibold text-cyan-300">
              Фізична основа експерименту:
            </div>
            {activeMode === 'strings' && (
              <p className="text-xs text-slate-300 leading-relaxed">
                Частота коливань закріпленої струни визначається законом Мерсенна: <span className="font-mono text-amber-300">f_n = (n / 2L) · √(T / μ)</span>. Зменшення довжини струни вдвічі підвищує частоту вдвічі (октава). Збільшення натягу в 4 рази підвищує частоту у 2 рази.
              </p>
            )}
            {activeMode === 'pipes' && (
              <p className="text-xs text-slate-300 leading-relaxed">
                Для відкритої трубки <span className="font-mono text-purple-300">f_n = n · v / 2L</span> (наявні всі гармоніки). Для закритих трубок <span className="font-mono text-purple-300">f_n = (2n - 1) · v / 4L</span> (лише непарні гармоніки), тому закрита трубка тієї ж довжини звучить на октаву нижче!
              </p>
            )}
            {activeMode === 'beats' && (
              <p className="text-xs text-slate-300 leading-relaxed">
                Биття виникають унаслідок інтерференції двох коливань із близькими частотами f₁ та f₂: <span className="font-mono text-amber-300">f_beat = |f₁ - f₂|</span>. Вухо сприймає сумарну частоту (f₁ + f₂)/2, амплітуда якої пульсує з періодом T_beat = 1 / |f₁ - f₂|.
              </p>
            )}
            {activeMode === 'timbre' && (
              <p className="text-xs text-slate-300 leading-relaxed">
                Теорема Фур’є: будь-який періодичний музичний сигнал є сумою гармонік <span className="font-mono text-emerald-300">s(t) = Σ A_n sin(2π n f₀ t + φ_n)</span>. Співвідношення амплітуд A_n визначає унікальний тембр інструмента.
              </p>
            )}
          </div>
        </div>

        {/* Right Zone: Control Deck & Parameters */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode 1: Strings Controls */}
          {activeMode === 'strings' && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span>Параметри струни</span>
                <span className="font-mono text-cyan-400 text-xs">
                  f = {actualStringFreq.toFixed(1)} Гц
                </span>
              </h3>

              {/* Length slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Довжина коливної частини (L):</span>
                  <span className="font-mono text-cyan-400">{(stringLength * 100).toFixed(0)} см</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="1.00"
                  step="0.01"
                  value={stringLength}
                  onChange={(e) => setStringLength(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>20 см (високий тон)</span>
                  <span>100 см (басовий)</span>
                </div>
              </div>

              {/* Tension slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Сила натягу струни (T):</span>
                  <span className="font-mono text-cyan-400">{stringTension} Н</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="350"
                  step="5"
                  value={stringTension}
                  onChange={(e) => setStringTension(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Material radio */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Матеріал та густина струни (μ):</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['nylon', 'steel', 'bronze'] as const).map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setStringMaterial(mat)}
                      className={`p-2 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                        stringMaterial === mat
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mat === 'nylon' && 'Нейлон'}
                      {mat === 'steel' && 'Сталь'}
                      {mat === 'bronze' && 'Бронза'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Harmonics selector (1 to 4) */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Гармоніка (мода коливань n):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setHarmonicN(n)}
                      className={`py-1.5 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                        harmonicN === n
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      n = {n} {n === 1 ? '(основний)' : `(${n}-й обертон)`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pluck Button */}
              <button
                onClick={handlePluckString}
                className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                Защипнути струну (Послухати звук {actualStringFreq.toFixed(0)} Гц)
              </button>
            </div>
          )}

          {/* Mode 2: Wind Pipes Controls */}
          {activeMode === 'pipes' && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span>Параметри духового стовпа</span>
                <span className="font-mono text-purple-400 text-xs">
                  f = {fundamentalPipeFreq.toFixed(1)} Гц
                </span>
              </h3>

              {/* Pipe Type: Open vs Closed */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Конструкція трубки:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsOpenPipe(true)}
                    className={`p-2.5 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                      isOpenPipe
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Відкрита з обох кінців
                    <span className="block text-[10px] text-slate-400 mt-0.5">Всі гармоніки (флейта)</span>
                  </button>
                  <button
                    onClick={() => setIsOpenPipe(false)}
                    className={`p-2.5 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                      !isOpenPipe
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Закрита з одного кінця
                    <span className="block text-[10px] text-slate-400 mt-0.5">Лише непарні (кларнет)</span>
                  </button>
                </div>
              </div>

              {/* Length slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Довжина трубки (L):</span>
                  <span className="font-mono text-purple-400">{(pipeLength * 100).toFixed(0)} см</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="1.20"
                  step="0.01"
                  value={pipeLength}
                  onChange={(e) => setPipeLength(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              {/* Calculated wavelengths */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Довжина хвилі основного тону (λ):</span>
                  <span className="font-mono text-slate-200">
                    {(isOpenPipe ? 2 * pipeLength : 4 * pipeLength).toFixed(2)} м
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Швидкість звуку в повітрі (v):</span>
                  <span className="font-mono text-slate-200">343 м/с</span>
                </div>
              </div>

              {/* Blow Button */}
              <button
                onClick={handleBlowPipe}
                className="w-full py-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Wind className="w-4 h-4" />
                Продути трубку ({fundamentalPipeFreq.toFixed(0)} Гц)
              </button>
            </div>
          )}

          {/* Mode 3: Beats & Interference Controls */}
          {activeMode === 'beats' && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span>Камертони та акустичні биття</span>
                <span className="font-mono text-amber-400 text-xs">
                  Δf = {beatFrequency.toFixed(1)} Гц
                </span>
              </h3>

              {/* Fork 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Камертон №1 (Еталонний «Ля»):</span>
                  <span className="font-mono text-amber-300">{fork1Freq} Гц</span>
                </div>
                <input
                  type="range"
                  min="430"
                  max="450"
                  step="1"
                  value={fork1Freq}
                  onChange={(e) => setFork1Freq(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Fork 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Камертон №2 (З додатковим тягарцем):</span>
                  <span className="font-mono text-amber-300">{fork2Freq} Гц</span>
                </div>
                <input
                  type="range"
                  min="430"
                  max="455"
                  step="0.5"
                  value={fork2Freq}
                  onChange={(e) => setFork2Freq(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Різниця частот: {Math.abs(fork1Freq - fork2Freq).toFixed(1)} Гц</span>
                  <span>Період биття: {(1 / Math.max(0.1, beatFrequency)).toFixed(2)} с</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200">
                <span className="font-semibold">Явище: </span>
                Коли ви натиснете кнопку нижче, ви почуєте характерну пульсацію гучності{' '}
                <span className="font-mono font-bold">{beatFrequency.toFixed(1)} рази на секунду</span>. Саме за цими биттями налаштовують роялі та гітари!
              </div>

              {/* Strike Button */}
              <button
                onClick={handleStrikeTuningForks}
                className="w-full py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                Вдарити обидва камертони одночасно
              </button>
            </div>
          )}

          {/* Mode 4: Timbre & Fourier Synthesis Controls */}
          {activeMode === 'timbre' && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">
                  Адитивний синтез гармонік (Ряд Фур’є)
                </h3>
                <span className="font-mono text-emerald-400 text-xs">{baseTimbreFreq} Гц</span>
              </div>

              {/* Instrument Presets */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Швидкі пресети тембрів:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => applyPreset('tuning_fork')}
                    className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-emerald-500 cursor-pointer"
                  >
                    Камертон
                  </button>
                  <button
                    onClick={() => applyPreset('flute')}
                    className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-emerald-500 cursor-pointer"
                  >
                    Флейта
                  </button>
                  <button
                    onClick={() => applyPreset('violin')}
                    className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-emerald-500 cursor-pointer"
                  >
                    Скрипка
                  </button>
                  <button
                    onClick={() => applyPreset('clarinet')}
                    className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-emerald-500 cursor-pointer"
                  >
                    Кларнет
                  </button>
                </div>
              </div>

              {/* Harmonic Sliders (1 to 5) */}
              <div className="space-y-2 pt-1">
                {harmonics.map((hWeight, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">
                        Гармоніка {idx + 1} ({baseTimbreFreq * (idx + 1)} Гц):
                      </span>
                      <span className="font-mono text-emerald-400">
                        {Math.round(hWeight * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={hWeight}
                      onChange={(e) => handleTimbreSliderChange(idx, parseFloat(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Continuous Play/Stop Button */}
              <button
                onClick={handleToggleContinuousTimbre}
                className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md ${
                  isContinuousPlaying
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                }`}
              >
                {isContinuousPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    Зупинити генератор
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Запустити безперервний тон синтезатора
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
