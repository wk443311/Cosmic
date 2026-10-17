/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoToTitle: () => void;
  crystals: number;
  totalTaps: number;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onGoToTitle,
  crystals,
  totalTaps,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <Pause className="w-6 h-6" />
        </div>

        <div>
          <h2 id="pause-modal-title" className="text-lg font-bold text-slate-100">
            Mining Operations Paused
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Press Esc or click Resume to continue
          </p>
        </div>

        {/* Live Snapshot Stats */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Available Ore</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {Math.floor(crystals).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Total Taps</span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {totalTaps.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            data-start="true"
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Mining</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Run Progress</span>
          </button>

          <button
            type="button"
            onClick={onGoToTitle}
            className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
