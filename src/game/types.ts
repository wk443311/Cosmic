/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  effectType: 'tap_power' | 'passive_income' | 'max_energy' | 'regen_speed';
  effectValue: number; // e.g. +1 tap power, or +2 ore/sec, etc.
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCrystals: number;
  unlocked: boolean;
  unlockedAt?: number;
  icon: string;
  progress: number;
  maxProgress: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  rewardCrystals: number;
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export interface AdRewardTransaction {
  id: string;
  timestamp: number;
  blockId: string;
  rewardGranted: number;
  status: 'completed' | 'skipped' | 'failed' | 'cooldown_rejected';
  verificationNonce: string;
}

export interface GameState {
  crystals: number;
  allTimeCrystals: number;
  totalTaps: number;
  energy: number;
  maxEnergy: number;
  energyRegenIntervalSec: number; // e.g. 2.5 seconds
  lastEnergyRegenTimestamp: number;
  comboStreak: number;
  lastTapTimestamp: number;
  
  // Upgrades
  upgrades: Record<string, Upgrade>;
  
  // Achievements & Missions
  achievements: Achievement[];
  missions?: DailyMission[];
  
  // Adsgram Compliance State
  lastAdClaimTimestamp: number;
  adCooldownSeconds: number; // e.g. 180 seconds (3 min)
  adEnergyBonus: number; // e.g. 25
  totalAdsWatched: number;
  adTransactions: AdRewardTransaction[];
  adsgramBlockId: string;
  
  // Audio & Settings
  isMuted: boolean;
  hapticsEnabled: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  isCrit?: boolean;
}
