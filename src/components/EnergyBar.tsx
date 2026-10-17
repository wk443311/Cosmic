/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap, Tv, Clock, CheckCircle } from 'lucide-react';

interface EnergyBarProps {
  energy: number;
  maxEnergy: number;
  regenIntervalSec: number;
  lastRegenTimestamp: number;
  cooldownRemainingSec: number;
  onOpenAdModal: () => void;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({
  energy,
  maxEnergy,
  regenIntervalSec,
  lastRegenTimestamp,
  cooldownRemainingSec,
  onOpenAdModal,
}) => {
  const percentage = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));
  const isFull = energy >= maxEnergy;
  const isCooldownActive = cooldownRemainingSec > 0;
  const canWatchAd = !isFull && !isCooldownActive;

  // Format cooldown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col gap-2 z-10">
      {/* Energy Header & Gauge */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
          <Zap className="w-4 h-4 fill-amber-400" />
          <span>MINING DRILL ENERGY</span>
        </div>
        <div className="font-mono font-bold text-sm text-slate-200 tabular-nums">
          {energy} <span className="text-slate-500 font-normal">/ {maxEnergy}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            energy > 20
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Natural Regeneration Clue */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {isFull ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Full Capacity
            </span>
          ) : (
            <span>
              Natural recharge: <strong className="text-slate-300">+1 every {regenIntervalSec.toFixed(1)}s</strong> (free)
            </span>
          )}
        </div>
        {!isFull && (
          <span className="text-slate-500 italic">No ads required to play</span>
        )}
      </div>

      {/* Adsgram Compliant Rewarded CTA Button */}
      <div className="mt-1 flex flex-col gap-1">
        <button
          type="button"
          data-testid="watch-ad-bonus-energy-button"
          onClick={onOpenAdModal}
          className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-between text-xs font-semibold transition-all border outline-none cursor-pointer ${
            canWatchAd
              ? 'bg-gradient-to-r from-cyan-600/90 via-sky-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 border-cyan-400/40 text-white shadow-lg shadow-cyan-950/50 hover:shadow-cyan-800/40 active:scale-98'
              : isCooldownActive
              ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tv className={`w-4 h-4 ${canWatchAd ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
            <span className="font-bold tracking-wide">Watch an Ad for Bonus Energy</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {isCooldownActive ? (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold border border-amber-500/20">
                Cooldown {formatTime(cooldownRemainingSec)}
              </span>
            ) : isFull ? (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                Energy Full
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-200 font-bold border border-cyan-400/30">
                +25 Energy Bonus
              </span>
            )}
          </div>
        </button>

        {/* Compliant Context Description */}
        <p className="text-[10px] text-slate-400 text-center leading-tight">
          Optional bonus: grants <strong className="text-slate-300">+25 energy</strong> once per 3-minute cooldown. Energy regenerates automatically without ads.
        </p>
      </div>
    </div>
  );
};
