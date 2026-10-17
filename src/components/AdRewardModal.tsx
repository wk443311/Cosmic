/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tv, X, AlertTriangle, ShieldCheck, CheckCircle2, Play, Info, Sparkles } from 'lucide-react';
import { AdsgramService } from '../services/adsgram.ts';
import { sound } from '../utils/audio.ts';

interface AdRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: (amount: number, nonce: string) => void;
  cooldownRemainingSec: number;
  bonusAmount: number;
  cooldownTotalSec: number;
}

export const AdRewardModal: React.FC<AdRewardModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
  cooldownRemainingSec,
  bonusAmount,
  cooldownTotalSec,
}) => {
  const [adState, setAdState] = useState<'idle' | 'requesting' | 'simulating' | 'success' | 'skipped' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [simTimer, setSimTimer] = useState<number>(5);
  const isCooldown = cooldownRemainingSec > 0;

  useEffect(() => {
    if (isOpen) {
      setAdState('idle');
      setStatusMessage('');
      setSimTimer(5);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartAd = async () => {
    if (isCooldown) {
      setStatusMessage(`Please wait for the ${cooldownRemainingSec}s cooldown to finish.`);
      return;
    }

    setAdState('requesting');
    setStatusMessage('Contacting Adsgram ad network...');

    // Check if Adsgram SDK is available in the browser
    if (AdsgramService.isSdkLoaded()) {
      AdsgramService.showRewardedAd({
        onStart: () => {
          setStatusMessage('Ad playback started...');
        },
        onReward: (result) => {
          sound.playEnergyRefill();
          setAdState('success');
          setStatusMessage(`Completed! Granted +${bonusAmount} Energy.`);
          onRewardGranted(bonusAmount, result.nonce);
        },
        onSkipped: (reason) => {
          setAdState('skipped');
          setStatusMessage(reason || 'Ad was closed before completion. No reward granted.');
        },
        onError: (errMsg) => {
          setAdState('error');
          setStatusMessage(errMsg || 'No ad available from network.');
        },
      });
    } else {
      // In environment where Adsgram CDN is blocked or preview mode:
      // Provide compliant simulation dialog for testing compliance flow
      setAdState('simulating');
      setSimTimer(5);
    }
  };

  // Simulation timer countdown for preview/testing
  const handleSimFinish = () => {
    const nonce = `sim_nonce_${Date.now()}`;
    sound.playEnergyRefill();
    setAdState('success');
    setStatusMessage(`Completed! Granted +${bonusAmount} Energy.`);
    onRewardGranted(bonusAmount, nonce);
  };

  const handleSimSkip = () => {
    setAdState('skipped');
    setStatusMessage('Ad skipped. In accordance with Adsgram rules, no reward was granted.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ad-modal-title" className="text-base font-bold text-slate-100">
                Watch an Ad for Bonus Energy
              </h2>
              <p className="text-[11px] text-slate-400">
                Official Adsgram Rewarded Video Placement
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on state */}
        {adState === 'idle' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Reward offer:</span>
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  +{bonusAmount} Mining Energy
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Anti-Spam Cooldown:</span>
                <span className="font-mono text-slate-300">
                  {Math.floor(cooldownTotalSec / 60)} minutes ({cooldownTotalSec}s)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Status:</span>
                {isCooldown ? (
                  <span className="text-amber-400 font-semibold">
                    Cooldown ({cooldownRemainingSec}s left)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Ready to Watch</span>
                )}
              </div>
            </div>

            {/* Policy Transparency Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-[11px] leading-relaxed">
                <span>
                  <strong>Full Compliance Transparency:</strong> This rewarded ad is completely optional. Natural energy recharges automatically for free.
                </span>
                <span className="text-slate-400">
                  Bonus is granted strictly upon verified completion of the video. If closed or skipped, no reward is issued.
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={isCooldown}
              onClick={handleStartAd}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all shadow-lg ${
                isCooldown
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50 active:scale-98 cursor-pointer'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isCooldown ? `Cooldown (${cooldownRemainingSec}s)` : 'Watch Rewarded Ad Now'}
              </span>
            </button>
          </div>
        )}

        {/* Requesting / Loading State */}
        {adState === 'requesting' && (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-200">{statusMessage}</span>
            <span className="text-xs text-slate-400">Connecting to Adsgram SDK...</span>
          </div>
        )}

        {/* Development & Verification Simulation Player (Active when adblocker or no third-party CDN) */}
        {adState === 'simulating' && (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-center flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Adsgram Verification Test
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Block ID: {AdsgramService.getBlockId()}
                </span>
              </div>

              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Tv className="w-12 h-12 text-cyan-400 animate-pulse" />
                <p className="text-sm font-semibold text-slate-200">
                  Simulating Rewarded Ad Playback
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                  In live Telegram, genuine video ads from Adsgram display full-screen. This test harness demonstrates adherence to completion & skip rules.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                <button
                  type="button"
                  onClick={handleSimSkip}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Skip Ad (No Reward)
                </button>
                <button
                  type="button"
                  onClick={handleSimFinish}
                  className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Complete Ad (+{bonusAmount} Energy)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {adState === 'success' && (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-emerald-400">Reward Verified</h3>
            <p className="text-xs text-slate-300 max-w-xs">{statusMessage}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 py-2 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              Return to Mining Deck
            </button>
          </div>
        )}

        {/* Skipped / Incomplete State */}
        {adState === 'skipped' && (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-amber-400">Ad Incomplete</h3>
            <p className="text-xs text-slate-300 max-w-xs">{statusMessage}</p>
            <p className="text-[11px] text-slate-400">
              You can still play for free! Natural energy recharges continuously.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Continue Playing
            </button>
          </div>
        )}

        {/* Error / No Inventory State */}
        {adState === 'error' && (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No Ad Available</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              {statusMessage || 'No ad was returned at this moment. You can continue playing without interruption.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 py-2 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
            >
              Continue Playing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
