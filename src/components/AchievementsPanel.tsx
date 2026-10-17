/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Achievement } from '../game/types.ts';
import { Trophy, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.ts';

interface AchievementsPanelProps {
  achievements: Achievement[];
  onClaimAchievement: (id: string, reward: number) => void;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  onClaimAchievement,
}) => {
  const handleClaim = (ach: Achievement) => {
    sound.playAchievement();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // fallback
    }
    onClaimAchievement(ach.id, ach.rewardCrystals);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="w-full flex flex-col gap-2.5 max-w-md mx-auto">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Career Milestones & Achievements
        </h3>
        <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          {unlockedCount} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {achievements.map((ach) => {
          const isComplete = ach.progress >= ach.maxProgress;

          return (
            <div
              key={ach.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                ach.unlocked
                  ? 'bg-slate-900/60 border-slate-800/60 opacity-80'
                  : isComplete
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-900/20'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    ach.unlocked
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                      : isComplete
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">
                    {ach.title}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {ach.description}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ach.progress} / {ach.maxProgress}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {ach.unlocked ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-1 rounded bg-emerald-950/40 border border-emerald-800/40">
                    <CheckCircle className="w-3.5 h-3.5" /> Claimed
                  </span>
                ) : isComplete ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(ach)}
                    className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{ach.rewardCrystals}</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">
                    +{ach.rewardCrystals} Ore
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
