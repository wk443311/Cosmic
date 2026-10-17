/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNaturalEnergyRegen,
  calculateTapPower,
  calculatePassiveIncomeRate,
  calculateUpgradeCost,
  canClaimAdReward,
  validateAdCompletionResult,
} from './rules.ts';
import type { Upgrade, AdRewardTransaction } from './types.ts';

test('calculateNaturalEnergyRegen replenishes energy over time without ads', () => {
  const currentEnergy = 50;
  const maxEnergy = 100;
  const lastRegenTimestamp = 1000000;
  // 5 seconds elapsed with 2.5s interval = 2 intervals = +2 energy
  const currentTimestamp = 1000000 + 5000;
  const regenIntervalSec = 2.5;

  const result = calculateNaturalEnergyRegen(
    currentEnergy,
    maxEnergy,
    lastRegenTimestamp,
    currentTimestamp,
    regenIntervalSec
  );

  assert.equal(result.newEnergy, 52);
  assert.equal(result.energyGained, 2);
  assert.equal(result.newTimestamp, 1000000 + 5000);
});

test('calculateNaturalEnergyRegen clamps to maxEnergy and never overflows', () => {
  const currentEnergy = 99;
  const maxEnergy = 100;
  const lastRegenTimestamp = 1000000;
  // 100 seconds elapsed
  const currentTimestamp = 1000000 + 100000;
  const regenIntervalSec = 2.5;

  const result = calculateNaturalEnergyRegen(
    currentEnergy,
    maxEnergy,
    lastRegenTimestamp,
    currentTimestamp,
    regenIntervalSec
  );

  assert.equal(result.newEnergy, 100);
  assert.equal(result.energyGained, 1);
});

test('calculateTapPower calculates correct tap damage scaling', () => {
  const mockUpgrades: Record<string, Upgrade> = {
    tap_laser: {
      id: 'tap_laser',
      name: 'Laser Drill',
      description: 'Increases tap yield',
      level: 3,
      baseCost: 10,
      costMultiplier: 1.5,
      effectType: 'tap_power',
      effectValue: 2,
      icon: 'drill',
    },
  };

  const power = calculateTapPower(mockUpgrades);
  // Base 1 + 3 * 2 = 7
  assert.equal(power, 7);
});

test('calculatePassiveIncomeRate sums up drone and rig outputs', () => {
  const mockUpgrades: Record<string, Upgrade> = {
    mining_drone: {
      id: 'mining_drone',
      name: 'Drone',
      description: 'Passive ore',
      level: 2,
      baseCost: 50,
      costMultiplier: 1.4,
      effectType: 'passive_income',
      effectValue: 3,
      icon: 'drone',
    },
    orbital_rig: {
      id: 'orbital_rig',
      name: 'Rig',
      description: 'High passive ore',
      level: 1,
      baseCost: 200,
      costMultiplier: 1.6,
      effectType: 'passive_income',
      effectValue: 10,
      icon: 'rig',
    },
  };

  const rate = calculatePassiveIncomeRate(mockUpgrades);
  // 2 * 3 + 1 * 10 = 16
  assert.equal(rate, 16);
});

test('calculateUpgradeCost applies exponential multiplier', () => {
  const upgrade: Upgrade = {
    id: 'test_upgrade',
    name: 'Test',
    description: 'Test upgrade',
    level: 2,
    baseCost: 100,
    costMultiplier: 1.5,
    effectType: 'tap_power',
    effectValue: 1,
    icon: 'tool',
  };

  const cost = calculateUpgradeCost(upgrade);
  // 100 * 1.5^2 = 100 * 2.25 = 225
  assert.equal(cost, 225);
});

test('canClaimAdReward enforces cooldown strictly to prevent spam', () => {
  const lastClaim = 1000000;
  const cooldownSec = 180; // 3 minutes
  const maxEnergy = 100;
  const currentEnergy = 40;

  // 60 seconds elapsed: still in cooldown
  const check1 = canClaimAdReward(lastClaim, cooldownSec, currentEnergy, maxEnergy, 1000000 + 60000);
  assert.equal(check1.eligible, false);
  assert.equal(check1.remainingCooldownSeconds, 120);

  // 181 seconds elapsed: cooldown expired, eligible!
  const check2 = canClaimAdReward(lastClaim, cooldownSec, currentEnergy, maxEnergy, 1000000 + 181000);
  assert.equal(check2.eligible, true);
  assert.equal(check2.remainingCooldownSeconds, 0);

  // Full energy: not eligible because energy is already full
  const check3 = canClaimAdReward(lastClaim, cooldownSec, 100, maxEnergy, 1000000 + 181000);
  assert.equal(check3.eligible, false);
});

test('validateAdCompletionResult rejects uncompleted, skipped, or duplicate rewards', () => {
  const nonce = 'tx_nonce_abc123';
  const existingTransactions: AdRewardTransaction[] = [];

  // Completed valid ad
  const validCheck = validateAdCompletionResult({ done: true }, nonce, existingTransactions);
  assert.equal(validCheck.valid, true);

  // Skipped / closed ad
  const skippedCheck = validateAdCompletionResult({ done: false }, nonce, existingTransactions);
  assert.equal(skippedCheck.valid, false);

  // Error ad
  const errorCheck = validateAdCompletionResult(
    { done: false, error: true, description: 'No fill' },
    nonce,
    existingTransactions
  );
  assert.equal(errorCheck.valid, false);

  // Duplicate nonce check
  const transactionsWithCompleted: AdRewardTransaction[] = [
    {
      id: '1',
      timestamp: Date.now(),
      blockId: 'block_1',
      rewardGranted: 25,
      status: 'completed',
      verificationNonce: nonce,
    },
  ];
  const duplicateCheck = validateAdCompletionResult(
    { done: true },
    nonce,
    transactionsWithCompleted
  );
  assert.equal(duplicateCheck.valid, false);
});
