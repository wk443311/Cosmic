/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FloatingText } from '../game/types.ts';
import { sound } from '../utils/audio.ts';

interface InteractiveCoreProps {
  onTap: (e: React.MouseEvent | React.TouchEvent) => void;
  energy: number;
  tapPower: number;
  comboStreak: number;
  floatingTexts: FloatingText[];
}

export const InteractiveCore: React.FC<InteractiveCoreProps> = ({
  onTap,
  energy,
  tapPower,
  comboStreak,
  floatingTexts,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPressed(true);
    onTap(e);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  const comboMultiplier = Math.min(3.0, 1 + Math.floor(comboStreak / 5) * 0.2);

  return (
    <div className="relative flex flex-col items-center justify-center my-auto w-full select-none">
      {/* Floating Damage / Crystal Numbers Container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            style={{
              left: `${ft.x}px`,
              top: `${ft.y}px`,
              transform: 'translate(-50%, -50%)',
              color: ft.color,
            }}
            className={`absolute font-black tracking-wider transition-all duration-700 pointer-events-none ${
              ft.isCrit ? 'text-2xl drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-bounce' : 'text-lg drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
            }`}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Combo Streak Ring Indicator */}
      {comboStreak >= 5 && (
        <div className="absolute -top-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-wider animate-pulse z-20">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{comboStreak}x COMBO · {comboMultiplier.toFixed(1)}x BONUS</span>
        </div>
      )}

      {/* Outer Glow Halo */}
      <div
        className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full transition-all duration-300 pointer-events-none ${
          energy > 0
            ? 'bg-gradient-to-tr from-cyan-500/20 via-sky-400/10 to-purple-600/20 blur-2xl scale-100'
            : 'bg-red-500/10 blur-xl scale-90'
        }`}
      />

      {/* Interactive Core Button */}
      <button
        type="button"
        data-testid="interactive-asteroid-core"
        aria-label="Mine Celestial Asteroid Core"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        className={`relative z-10 w-56 h-56 sm:w-68 sm:h-68 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-75 active:scale-95 outline-none focus:ring-4 focus:ring-cyan-400/40 ${
          isPressed ? 'scale-95 brightness-125' : 'hover:scale-102 hover:brightness-110'
        }`}
      >
        {/* Core SVG graphic: Intricate crystalline asteroid */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]"
        >
          <defs>
            <radialGradient id="asteroidGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="facetHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Asteroid geometric body */}
          <polygon
            points="100,18 142,32 178,68 185,115 156,165 110,182 55,172 22,125 18,74 52,30"
            fill="url(#asteroidGrad)"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Crystalline facets and veins */}
          <polygon
            points="100,18 135,70 100,105 52,30"
            fill="url(#facetHighlight)"
            stroke="#7dd3fc"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="142,32 178,68 135,70"
            fill="#0369a1"
            fillOpacity="0.6"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />
          <polygon
            points="178,68 185,115 135,118 135,70"
            fill="#0f172a"
            stroke="#0284c7"
            strokeWidth="1.2"
          />
          <polygon
            points="135,118 156,165 110,182 100,105"
            fill="url(#facetHighlight)"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
          <polygon
            points="100,105 110,182 55,172 65,115"
            fill="#0284c7"
            fillOpacity="0.5"
            stroke="#7dd3fc"
            strokeWidth="1.2"
          />
          <polygon
            points="22,125 55,172 65,115"
            fill="#0f172a"
            stroke="#0369a1"
            strokeWidth="1.2"
          />
          <polygon
            points="18,74 22,125 65,115 52,30"
            fill="#0369a1"
            fillOpacity="0.7"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />
          <polygon
            points="52,30 65,115 100,105 135,70"
            fill="#38bdf8"
            fillOpacity="0.4"
            stroke="#bae6fd"
            strokeWidth="1.5"
          />

          {/* Central Pulsing Plasma Gemstone */}
          <circle cx="100" cy="100" r="24" fill="url(#crystalGlow)" />
          <polygon
            points="100,82 116,92 116,112 100,122 84,112 84,92"
            fill="#e0f2fe"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <circle cx="95" cy="94" r="4" fill="#ffffff" />
        </svg>

        {/* Energy depletion warning overlay */}
        {energy <= 0 && (
          <div className="absolute inset-0 rounded-full bg-slate-950/75 flex flex-col items-center justify-center p-3 text-center border-2 border-dashed border-red-500/60">
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
              Energy Depleted
            </span>
            <span className="text-slate-300 text-[11px] leading-tight max-w-[130px]">
              Recharging naturally or watch an ad for +25 bonus!
            </span>
          </div>
        )}
      </button>

      {/* Yield hint */}
      <div className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-1.5">
        <span>Drill Power:</span>
        <span className="text-cyan-400 font-bold font-mono">+{tapPower} Ore/Tap</span>
        {energy <= 0 && (
          <span className="text-amber-400 text-[11px]">· Waiting on Energy</span>
        )}
      </div>
    </div>
  );
};
