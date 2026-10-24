/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../utils/audioEngine';

interface AudioVisualizerCanvasProps {
  mode?: 'waveform' | 'frequency' | 'both';
  height?: number;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  mode = 'both',
  height = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const analyser = soundEngine.getAnalyser();
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      // Dark background with subtle grid lines
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, h);

      // Draw faint coordinate grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let y = 0; y < h; y += h / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let x = 0; x < width; x += width / 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!analyser) {
        // Draw flat baseline
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
        animId = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const timeData = new Uint8Array(bufferLength);
      const freqData = new Uint8Array(bufferLength);

      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      // Frequency spectrum bars (bottom half / faint backdrop)
      if (mode === 'frequency' || mode === 'both') {
        const barWidth = (width / 64);
        for (let i = 0; i < 64; i++) {
          const val = freqData[i * 4] || 0;
          const barHeight = (val / 255) * (h * 0.7);
          const x = i * barWidth;
          const y = h - barHeight;

          // Gradient color from cyan to indigo
          ctx.fillStyle = mode === 'both' ? 'rgba(14, 165, 233, 0.22)' : 'rgba(56, 189, 248, 0.75)';
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
      }

      // Time-domain Oscilloscope trace
      if (mode === 'waveform' || mode === 'both') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#38bdf8'; // Cyan 400
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        width={700}
        height={height}
        className="w-full h-auto block"
      />
      <div className="absolute top-2 right-3 text-[10px] text-slate-400 font-mono flex items-center gap-3 select-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Осцилограф (s(t))
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-sky-600/60 inline-block rounded-xs" /> FFT Спектр (f)
        </span>
      </div>
    </div>
  );
};
