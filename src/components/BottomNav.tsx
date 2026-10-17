/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pickaxe, Wrench, Trophy, BarChart3 } from 'lucide-react';

export type ActiveTab = 'mine' | 'upgrades' | 'achievements' | 'stats';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unclaimedAchievementsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unclaimedAchievementsCount,
}) => {
  const tabs = [
    { id: 'mine' as ActiveTab, label: 'Mine', icon: Pickaxe },
    { id: 'upgrades' as ActiveTab, label: 'Upgrades', icon: Wrench },
    {
      id: 'achievements' as ActiveTab,
      label: 'Badges',
      icon: Trophy,
      badge: unclaimedAchievementsCount > 0 ? unclaimedAchievementsCount : undefined,
    },
    { id: 'stats' as ActiveTab, label: 'Telemetry', icon: BarChart3 },
  ];

  return (
    <nav
      aria-label="Game navigation"
      className="w-full max-w-md mx-auto px-4 py-2 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md z-30"
    >
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>

              {tab.badge && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center animate-bounce">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
