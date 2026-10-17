/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState } from '../game/types.ts';
import { calculatePassiveIncomeRate } from '../game/rules.ts';
import { Activity, Zap, Tv, Pickaxe, Bot, ShieldAlert } from 'lucide-react';

interface StatsPanelProps {
  state: GameState;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ state }) => {
  const passiveRate = calculatePassiveIncomeRate(state.upgrades);

  return (
    <div className="w-full flex flex-col gap-3 max-w-md mx-auto">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Telemetry & Operational Statistics
        </h3>
        <span className="text-[11px] text-cyan-400 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5" /> Live Deck
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Pickaxe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Mined Taps</span>
          </div>
          <span className="text-base font-bold font-mono text-slate-100">
            {state.totalTaps.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Pickaxe className="w-3.5 h-3.5 text-amber-400" />
            <span>Lifetime Ore Extracted</span>
          </div>
          <span className="text-base font-bold font-mono text-slate-100">
            {Math.floor(state.allTimeCrystals).toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drone Automation</span>
          </div>
          <span className="text-base font-bold font-mono text-emerald-400">
            +{passiveRate} Ore / sec
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Recharge Interval</span>
          </div>
          <span className="text-base font-bold font-mono text-yellow-400">
            1 per {state.energyRegenIntervalSec.toFixed(1)}s
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adsgram Bonuses Claimed</span>
          </div>
          <span className="text-base font-bold font-mono text-cyan-300">
            {state.totalAdsWatched} ({state.totalAdsWatched * state.adEnergyBonus} Energy)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>Max Storage Capacity</span>
          </div>
          <span className="text-base font-bold font-mono text-slate-200">
            {state.maxEnergy} Energy Units
          </span>
        </div>
      </div>

      {/* Official Adsgram Compliance & Real Rewards Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <strong className="text-slate-300 font-semibold">
            In-Game Virtual Currency Notice:
          </strong>
          <span>
            Ore and crystals earned in CosmoMiner are purely virtual entertainment points. They carry no cash surrender value, no fiat currency conversion, and no cryptocurrency redemption. We do not promote or operate financial withdrawal schemes.
          </span>
        </div>
      </div>
    </div>
  );
};
