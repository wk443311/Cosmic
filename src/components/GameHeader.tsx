/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Pause, ShieldCheck, Shield, Sparkles } from 'lucide-react';

interface GameHeaderProps {
  crystals: number;
  passiveRate: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPause: () => void;
  onOpenCompliance: () => void;
  onOpenPrivacy: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  crystals,
  passiveRate,
  isMuted,
  onToggleMute,
  onOpenPause,
  onOpenCompliance,
  onOpenPrivacy,
}) => {
  // Derive rank based on crystals
  const getRank = (amount: number) => {
    if (amount >= 5000) return 'Star Fleet Commander';
    if (amount >= 2000) return 'Orbital Engineer';
    if (amount >= 500) return 'Asteroid Prospector';
    return 'Cadet Miner';
  };

  return (
    <header className="w-full max-w-md mx-auto px-4 pt-3 pb-1 flex flex-col gap-2 z-20">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between">
        {/* Rank & App lockup */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black text-xs">
            CM
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              CosmoMiner
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {getRank(crystals)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Open Adsgram compliance inspector"
            onClick={onOpenCompliance}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Audit</span>
            <span>10/10</span>
          </button>

          <button
            type="button"
            aria-label="Open Privacy policy"
            onClick={onOpenPrivacy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            type="button"
            aria-label={isMuted ? 'Unmute sound [M]' : 'Mute sound [M]'}
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            type="button"
            aria-label="Pause game [Esc]"
            onClick={onOpenPause}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Currency Display */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <span className="font-mono text-3xl font-black tracking-tight text-white tabular-nums drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            {Math.floor(crystals).toLocaleString()}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            ORE
          </span>
        </div>

        {passiveRate > 0 && (
          <div className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <span>+{passiveRate.toLocaleString()} ore / sec (automated drones)</span>
          </div>
        )}
      </div>
    </header>
  );
};
