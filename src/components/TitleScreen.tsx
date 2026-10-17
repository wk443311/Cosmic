/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Play, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenCompliance: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenCompliance,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.playUpgrade();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-10 select-none bg-slate-950/85 backdrop-blur-md">
      {/* Top Banner / Compliance Verification Badge */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={onOpenCompliance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Adsgram Compliance Audit: 10/10 Passed</span>
        </button>
      </div>

      {/* Hero Showcase Centerpiece */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg">
        {/* Custom Bespoke SVG Title Lockup */}
        <div className="w-64 sm:w-80 mb-6 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
          <svg viewBox="0 0 320 100" className="w-full h-auto">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Emblem icon */}
            <polygon
              points="160,5 175,20 160,35 145,20"
              fill="#38bdf8"
              filter="url(#glow)"
            />
            <circle cx="160" cy="20" r="3" fill="#ffffff" />

            {/* Main title text */}
            <text
              x="160"
              y="68"
              textAnchor="middle"
              fill="url(#titleGrad)"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="34"
              letterSpacing="3"
            >
              COSMOMINER
            </text>

            {/* Sub-lockup */}
            <text
              x="160"
              y="90"
              textAnchor="middle"
              fill="#94a3b8"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="700"
              fontSize="11"
              letterSpacing="6"
            >
              STARFORGE TAP
            </text>
          </svg>
        </div>

        {/* Ambient Tagline */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium mb-8 max-w-sm leading-relaxed">
          Mine celestial asteroids, automate deep-space orbital drones, and recharge drilling energy naturally or via compliant Adsgram rewards.
        </p>

        {/* Primary Start CTA with data-start="true" */}
        <button
          type="button"
          data-start="true"
          onClick={() => {
            sound.playUpgrade();
            onStartGame();
          }}
          className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] active:scale-95 cursor-pointer flex items-center gap-3"
        >
          <Play className="w-5 h-5 fill-current text-slate-950 group-hover:scale-110 transition-transform" />
          <span>Launch Mining Deck</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/30 text-cyan-950 font-bold">
            Space / Enter
          </span>
        </button>

        {/* Natural Play Guarantee Banner */}
        <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>100% Free Gameplay · Continuous Natural Energy Recharge</span>
        </div>
      </div>

      {/* Flat Single Control-Hint Line */}
      <div className="text-[11px] text-slate-500 font-mono tracking-wide text-center">
        Click / Tap Mine · Space Start · M Mute Audio · Esc Pause
      </div>
    </div>
  );
};
