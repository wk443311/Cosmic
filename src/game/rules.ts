/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Upgrade, GameState, AdRewardTransaction } from './types.ts';

/**
 * Calculates natural energy regeneration.
 * Completely independent of ads. Ensures players can play 100% free forever.
 */
export function calculateNaturalEnergyRegen(
  currentEnergy: number,
  maxEnergy: number,
  lastRegenTimestamp: number,
  currentTimestamp: number,
  regenIntervalSec: number
): { newEnergy: number; newTimestamp: number; energyGained: number } {
  if (currentEnergy >= maxEnergy) {
    return {
      newEnergy: maxEnergy,
      newTimestamp: currentTimestamp,
      energyGained: 0,
    };
  }

  const elapsedSec = Math.max(0, (currentTimestamp - lastRegenTimestamp) / 1000);
  const intervalsPassed = Math.floor(elapsedSec / regenIntervalSec);

  if (intervalsPassed <= 0) {
    return {
      newEnergy: currentEnergy,
      newTimestamp: lastRegenTimestamp,
      energyGained: 0,
    };
  }

  const potentialEnergy = currentEnergy + intervalsPassed;
  const newEnergy = Math.min(maxEnergy, potentialEnergy);
  const energyGained = newEnergy - currentEnergy;
  
  // Advance timestamp by the integer number of intervals consumed
  const consumedSec = intervalsPassed * regenIntervalSec;
  const newTimestamp = lastRegenTimestamp + (consumedSec * 1000);

  return {
    newEnergy,
    newTimestamp,
    energyGained,
  };
}

/**
 * Calculates tap power based on base value and upgrade levels.
 */
export function calculateTapPower(upgrades: Record<string, Upgrade>): number {
  let power = 1;
  const tapUpgrade = upgrades['tap_laser'];
  if (tapUpgrade) {
    power += tapUpgrade.level * tapUpgrade.effectValue;
  }
  return power;
}

/**
 * Calculates passive income in crystals per second from automated mining drones.
 */
export function calculatePassiveIncomeRate(upgrades: Record<string, Upgrade>): number {
  let rate = 0;
  const droneUpgrade = upgrades['mining_drone'];
  if (droneUpgrade) {
    rate += droneUpgrade.level * droneUpgrade.effectValue;
  }
  const rigUpgrade = upgrades['orbital_rig'];
  if (rigUpgrade) {
    rate += rigUpgrade.level * rigUpgrade.effectValue;
  }
  return rate;
}

/**
 * Calculates upgrade cost using an exponential scaling formula:
 * Cost = baseCost * (costMultiplier ^ level)
 */
export function calculateUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
}

/**
 * Checks if the user is currently eligible to claim an Adsgram Rewarded Energy Bonus.
 * Enforces cooldown policy and anti-spam protection.
 */
export function canClaimAdReward(
  lastClaimTimestamp: number,
  cooldownSeconds: number,
  currentEnergy: number,
  maxEnergy: number,
  currentTimestamp: number
): {
  eligible: boolean;
  remainingCooldownSeconds: number;
  reason?: string;
} {
  const elapsedSeconds = Math.max(0, (currentTimestamp - lastClaimTimestamp) / 1000);
  const remainingCooldown = Math.max(0, Math.ceil(cooldownSeconds - elapsedSeconds));

  if (remainingCooldown > 0) {
    return {
      eligible: false,
      remainingCooldownSeconds: remainingCooldown,
      reason: `Ad reward cooldown active: ${remainingCooldown}s remaining.`,
    };
  }

  if (currentEnergy >= maxEnergy) {
    return {
      eligible: false,
      remainingCooldownSeconds: 0,
      reason: 'Energy is already at maximum capacity.',
    };
  }

  return {
    eligible: true,
    remainingCooldownSeconds: 0,
  };
}

/**
 * Validates ad completion result strictly conforming to Adsgram SDK specifications.
 * Enforces anti-duplication nonce check.
 */
export function validateAdCompletionResult(
  result: { done?: boolean; error?: boolean; description?: string } | null | undefined,
  nonce: string,
  existingTransactions: AdRewardTransaction[]
): {
  valid: boolean;
  reason: string;
} {
  if (!result) {
    return { valid: false, reason: 'Ad controller returned null or undefined response.' };
  }

  if (result.error) {
    return { valid: false, reason: result.description || 'Ad playback failed with an error.' };
  }

  if (result.done !== true) {
    return { valid: false, reason: 'User closed or skipped the ad before completion.' };
  }

  // Anti-duplication check: ensure nonce hasn't already been rewarded
  const duplicate = existingTransactions.some(
    (tx) => tx.verificationNonce === nonce && tx.status === 'completed'
  );
  if (duplicate) {
    return { valid: false, reason: 'Duplicate reward transaction detected for this session nonce.' };
  }

  return { valid: true, reason: 'Ad completed successfully.' };
}

/**
 * Evaluates achievement unlocks based on current game statistics.
 */
export function evaluateAchievements(state: GameState): GameState['achievements'] {
  return state.achievements.map((ach) => {
    if (ach.unlocked) return ach;

    let current = 0;
    if (ach.id === 'first_tap') current = state.totalTaps;
    else if (ach.id === 'ore_100') current = state.allTimeCrystals;
    else if (ach.id === 'ore_1000') current = state.allTimeCrystals;
    else if (ach.id === 'combo_10') current = state.comboStreak;
    else if (ach.id === 'drone_operator') {
      current = state.upgrades['mining_drone']?.level || 0;
    } else if (ach.id === 'energy_saver') {
      current = state.upgrades['solar_battery']?.level || 0;
    }

    const progress = Math.min(ach.maxProgress, current);
    const unlocked = progress >= ach.maxProgress;

    return {
      ...ach,
      progress,
      unlocked,
      unlockedAt: unlocked ? Date.now() : undefined,
    };
  });
}
