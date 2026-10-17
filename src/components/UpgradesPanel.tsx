/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Upgrade } from '../game/types.ts';
import { calculateUpgradeCost } from '../game/rules.ts';
import { Zap, Bot, Disc, BatteryCharging, Gauge, ArrowUpCircle } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface UpgradesPanelProps {
  upgrades: Record<string, Upgrade>;
  crystals: number;
  onBuyUpgrade: (upgradeId: string) => void;
}

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({
  upgrades,
  crystals,
  onBuyUpgrade,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'tap_laser':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'mining_drone':
        return <Bot className="w-5 h-5 text-emerald-400" />;
      case 'orbital_rig':
        return <Disc className="w-5 h-5 text-purple-400" />;
      case 'solar_battery':
        return <BatteryCharging className="w-5 h-5 text-amber-400" />;
      case 'plasma_coolant':
        return <Gauge className="w-5 h-5 text-sky-400" />;
      default:
        return <ArrowUpCircle className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getEffectLabel = (upgrade: Upgrade) => {
    switch (upgrade.effectType) {
      case 'tap_power':
        return `+${upgrade.effectValue} Ore / Tap`;
      case 'passive_income':
        return `+${upgrade.effectValue} Ore / Sec`;
      case 'max_energy':
        return `+${upgrade.effectValue} Max Energy`;
      case 'regen_speed':
        return `-${upgrade.effectValue}s Recharge Interval`;
      default:
        return '';
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 max-w-md mx-auto">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Mining Rig Equipment & Upgrades
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          Affordable: {Object.values(upgrades).filter(u => crystals >= calculateUpgradeCost(u)).length} / {Object.keys(upgrades).length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {Object.values(upgrades).map((upgrade) => {
          const cost = calculateUpgradeCost(upgrade);
          const canAfford = crystals >= cost;

          return (
            <div
              key={upgrade.id}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  {getIcon(upgrade.id)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      {upgrade.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-semibold">
                      Lvl {upgrade.level}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {upgrade.description}
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-400 mt-0.5">
                    {getEffectLabel(upgrade)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canAfford}
                onClick={() => {
                  sound.playUpgrade();
                  onBuyUpgrade(upgrade.id);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide flex flex-col items-center justify-center min-w-[76px] transition-all cursor-pointer ${
                  canAfford
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-950/40 active:scale-95'
                    : 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                }`}
              >
                <span>UPGRADE</span>
                <span className="text-[10px] font-mono font-normal">
                  {cost.toLocaleString()} Ore
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
