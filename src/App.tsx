/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Upgrade, Achievement, FloatingText } from './game/types.ts';
import {
  calculateNaturalEnergyRegen,
  calculateTapPower,
  calculatePassiveIncomeRate,
  calculateUpgradeCost,
  canClaimAdReward,
  evaluateAchievements,
} from './game/rules.ts';
import { sound } from './utils/audio.ts';
import { AdsgramService } from './services/adsgram.ts';

// Components
import { CosmicBackground } from './components/CosmicBackground.tsx';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHeader } from './components/GameHeader.tsx';
import { InteractiveCore } from './components/InteractiveCore.tsx';
import { EnergyBar } from './components/EnergyBar.tsx';
import { UpgradesPanel } from './components/UpgradesPanel.tsx';
import { AchievementsPanel } from './components/AchievementsPanel.tsx';
import { StatsPanel } from './components/StatsPanel.tsx';
import { BottomNav, ActiveTab } from './components/BottomNav.tsx';
import { AdRewardModal } from './components/AdRewardModal.tsx';
import { ComplianceModal } from './components/ComplianceModal.tsx';
import { PrivacyModal } from './components/PrivacyModal.tsx';
import { PauseModal } from './components/PauseModal.tsx';

const DEFAULT_UPGRADES: Record<string, Upgrade> = {
  tap_laser: {
    id: 'tap_laser',
    name: 'Plasma Laser Drill',
    description: 'Increases the quantity of ore mined per tap.',
    level: 0,
    baseCost: 15,
    costMultiplier: 1.5,
    effectType: 'tap_power',
    effectValue: 1,
    icon: 'drill',
  },
  mining_drone: {
    id: 'mining_drone',
    name: 'Autonomous Probe',
    description: 'Deploys automated drones that extract ore passively.',
    level: 0,
    baseCost: 50,
    costMultiplier: 1.45,
    effectType: 'passive_income',
    effectValue: 2,
    icon: 'drone',
  },
  orbital_rig: {
    id: 'orbital_rig',
    name: 'Deep-Space Rig',
    description: 'Industrial orbital platform providing heavy ore yield.',
    level: 0,
    baseCost: 250,
    costMultiplier: 1.6,
    effectType: 'passive_income',
    effectValue: 10,
    icon: 'rig',
  },
  solar_battery: {
    id: 'solar_battery',
    name: 'Capacitor Bank',
    description: 'Expands the total energy capacity of your mining deck.',
    level: 0,
    baseCost: 100,
    costMultiplier: 1.7,
    effectType: 'max_energy',
    effectValue: 25,
    icon: 'battery',
  },
  plasma_coolant: {
    id: 'plasma_coolant',
    name: 'Cryo Overclock',
    description: 'Speeds up natural energy regeneration by 0.3s per level.',
    level: 0,
    baseCost: 180,
    costMultiplier: 1.8,
    effectType: 'regen_speed',
    effectValue: 0.3,
    icon: 'coolant',
  },
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_tap',
    title: 'First Impact',
    description: 'Strike the celestial asteroid core once.',
    rewardCrystals: 20,
    unlocked: false,
    icon: 'star',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'ore_100',
    title: 'Ore Miner',
    description: 'Extract a cumulative total of 100 Ore.',
    rewardCrystals: 50,
    unlocked: false,
    icon: 'ore',
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'combo_10',
    title: 'Velocity Tapper',
    description: 'Maintain a 10x consecutive tap streak.',
    rewardCrystals: 80,
    unlocked: false,
    icon: 'flame',
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'drone_operator',
    title: 'Fleet Commander',
    description: 'Deploy 3 Autonomous Mining Probes.',
    rewardCrystals: 150,
    unlocked: false,
    icon: 'fleet',
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'ore_1000',
    title: 'Deep Core Prospector',
    description: 'Extract a cumulative total of 1,000 Ore.',
    rewardCrystals: 300,
    unlocked: false,
    icon: 'trophy',
    progress: 0,
    maxProgress: 1000,
  },
];

export default function App() {
  // Autostart detection
  const searchParams = new URLSearchParams(window.location.search);
  const autostart = searchParams.get('autostart') === '1';

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused'>(() => {
    return autostart ? 'playing' : 'title';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('mine');

  // Game data state
  const [crystals, setCrystals] = useState<number>(0);
  const [allTimeCrystals, setAllTimeCrystals] = useState<number>(0);
  const [totalTaps, setTotalTaps] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(100);
  const [maxEnergy, setMaxEnergy] = useState<number>(100);
  const [regenIntervalSec, setRegenIntervalSec] = useState<number>(2.5);
  const [lastEnergyRegenTimestamp, setLastEnergyRegenTimestamp] = useState<number>(() => Date.now());
  const [comboStreak, setComboStreak] = useState<number>(0);

  // Upgrades & Achievements
  const [upgrades, setUpgrades] = useState<Record<string, Upgrade>>(DEFAULT_UPGRADES);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);

  // Adsgram state
  const [adsgramBlockId, setAdsgramBlockId] = useState<string>(() => AdsgramService.getBlockId());
  const [lastAdClaimTimestamp, setLastAdClaimTimestamp] = useState<number>(0);
  const [totalAdsWatched, setTotalAdsWatched] = useState<number>(0);
  const adCooldownTotalSec = 180; // 3 minutes
  const adEnergyBonus = 25;

  // Visual & Modals
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isAdModalOpen, setIsAdModalOpen] = useState<boolean>(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Cooldown countdown
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState<number>(0);

  // Refs for loop
  const lastTickTimeRef = useRef<number>(Date.now());
  const lastTapTimeRef = useRef<number>(Date.now());

  // Reflect state to document.body.dataset.state for Ultra Mode & compliance
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Telegram WebApp setup
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch {
        // Safe fallback
      }
    }
  }, []);

  // Sync mute state with sound engine
  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  // Load persisted progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cosmo_miner_save_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.crystals === 'number') setCrystals(parsed.crystals);
        if (typeof parsed.allTimeCrystals === 'number') setAllTimeCrystals(parsed.allTimeCrystals);
        if (typeof parsed.totalTaps === 'number') setTotalTaps(parsed.totalTaps);
        if (typeof parsed.energy === 'number') setEnergy(parsed.energy);
        if (typeof parsed.lastAdClaimTimestamp === 'number') setLastAdClaimTimestamp(parsed.lastAdClaimTimestamp);
        if (typeof parsed.totalAdsWatched === 'number') setTotalAdsWatched(parsed.totalAdsWatched);
        if (parsed.upgrades) setUpgrades((prev) => ({ ...prev, ...parsed.upgrades }));
        if (parsed.achievements) setAchievements(parsed.achievements);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save progress periodically
  useEffect(() => {
    const saveTimer = setInterval(() => {
      try {
        localStorage.setItem(
          'cosmo_miner_save_v1',
          JSON.stringify({
            crystals,
            allTimeCrystals,
            totalTaps,
            energy,
            lastAdClaimTimestamp,
            totalAdsWatched,
            upgrades,
            achievements,
          })
        );
      } catch {
        // Storage fail safe
      }
    }, 5000);
    return () => clearInterval(saveTimer);
  }, [crystals, allTimeCrystals, totalTaps, energy, lastAdClaimTimestamp, totalAdsWatched, upgrades, achievements]);

  // Recalculate max energy and regen interval whenever upgrades change
  useEffect(() => {
    let baseMax = 100;
    const battery = upgrades['solar_battery'];
    if (battery) {
      baseMax += battery.level * battery.effectValue;
    }
    setMaxEnergy(baseMax);

    let baseInterval = 2.5;
    const coolant = upgrades['plasma_coolant'];
    if (coolant) {
      baseInterval = Math.max(0.8, baseInterval - coolant.level * coolant.effectValue);
    }
    setRegenIntervalSec(baseInterval);
  }, [upgrades]);

  // Main 60Hz tick for natural energy regeneration, passive income, and cooldown countdown
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const now = Date.now();
      const rawDt = (now - lastTickTimeRef.current) / 1000;
      const dt = Math.min(rawDt, 0.1); // clamp dt
      lastTickTimeRef.current = now;

      // Only tick in 'playing' state
      if (gameState === 'playing') {
        // 1. Natural Energy Regeneration (Fully independent of ads)
        setEnergy((curr) => {
          const { newEnergy, newTimestamp } = calculateNaturalEnergyRegen(
            curr,
            maxEnergy,
            lastEnergyRegenTimestamp,
            now,
            regenIntervalSec
          );
          if (newEnergy !== curr) {
            setLastEnergyRegenTimestamp(newTimestamp);
          }
          return newEnergy;
        });

        // 2. Passive Drone & Rig Income
        const passiveRate = calculatePassiveIncomeRate(upgrades);
        if (passiveRate > 0) {
          const passiveGain = passiveRate * dt;
          setCrystals((prev) => prev + passiveGain);
          setAllTimeCrystals((prev) => prev + passiveGain);
        }

        // 3. Reset combo streak if idle for > 1.8 seconds
        if (now - lastTapTimeRef.current > 1800) {
          setComboStreak((streak) => (streak > 0 ? 0 : streak));
        }

        // 4. Update Ad Cooldown remaining
        const check = canClaimAdReward(lastAdClaimTimestamp, adCooldownTotalSec, energy, maxEnergy, now);
        setCooldownRemainingSec(check.remainingCooldownSeconds);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [
    gameState,
    maxEnergy,
    lastEnergyRegenTimestamp,
    regenIntervalSec,
    upgrades,
    lastAdClaimTimestamp,
    adCooldownTotalSec,
    energy,
  ]);

  // Evaluate achievements when telemetry changes
  useEffect(() => {
    const fullState: GameState = {
      crystals,
      allTimeCrystals,
      totalTaps,
      energy,
      maxEnergy,
      energyRegenIntervalSec: regenIntervalSec,
      lastEnergyRegenTimestamp,
      comboStreak,
      lastTapTimestamp: lastTapTimeRef.current,
      upgrades,
      achievements,
      lastAdClaimTimestamp,
      adCooldownSeconds: adCooldownTotalSec,
      adEnergyBonus,
      totalAdsWatched,
      adTransactions: [],
      adsgramBlockId,
      isMuted,
      hapticsEnabled: true,
    };

    const updated = evaluateAchievements(fullState);
    const hasChange = updated.some((u, i) => u.unlocked !== achievements[i].unlocked || u.progress !== achievements[i].progress);
    if (hasChange) {
      setAchievements(updated);
    }
  }, [crystals, allTimeCrystals, totalTaps, comboStreak, upgrades, achievements]);

  // Global Keyboard Navigation & Focus hygiene
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setGameState('paused');
        } else if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          setIsMuted((prev) => !prev);
        }
      } else if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Tap Core action
  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (energy <= 0) {
        // Friendly audio cue for no energy
        sound.playTap(false);
        return;
      }

      // Decrement energy by 1 per tap
      setEnergy((prev) => Math.max(0, prev - 1));

      // Haptic feedback in Telegram
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }

      const now = Date.now();
      lastTapTimeRef.current = now;

      // Combo streak increment
      const newStreak = comboStreak + 1;
      setComboStreak(newStreak);

      // Crit chance (10% chance)
      const isCrit = Math.random() < 0.1;
      sound.playTap(isCrit);

      // Tap yield calculation
      const basePower = calculateTapPower(upgrades);
      const comboMultiplier = Math.min(3.0, 1 + Math.floor(newStreak / 5) * 0.2);
      const critMultiplier = isCrit ? 2.5 : 1.0;
      const finalGain = Math.round(basePower * comboMultiplier * critMultiplier);

      setCrystals((prev) => prev + finalGain);
      setAllTimeCrystals((prev) => prev + finalGain);
      setTotalTaps((prev) => prev + 1);

      // Create floating text
      let clientX = window.innerWidth / 2;
      let clientY = window.innerHeight * 0.45;
      if ('clientX' in e && e.clientX) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const textId = Date.now() + Math.random();
      const newFt: FloatingText = {
        id: textId,
        x: clientX + (Math.random() * 40 - 20),
        y: clientY - 30 + (Math.random() * 20 - 10),
        text: isCrit ? `+${finalGain} CRIT!` : `+${finalGain}`,
        color: isCrit ? '#facc15' : '#38bdf8',
        isCrit,
      };

      setFloatingTexts((prev) => [...prev, newFt]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== textId));
      }, 700);
    },
    [energy, comboStreak, upgrades]
  );

  // Buy upgrade handler
  const handleBuyUpgrade = (upgradeId: string) => {
    const upg = upgrades[upgradeId];
    if (!upg) return;

    const cost = calculateUpgradeCost(upg);
    if (crystals < cost) return;

    setCrystals((prev) => prev - cost);
    setUpgrades((prev) => ({
      ...prev,
      [upgradeId]: {
        ...upg,
        level: upg.level + 1,
      },
    }));
  };

  // Claim achievement handler
  const handleClaimAchievement = (achId: string, reward: number) => {
    setCrystals((prev) => prev + reward);
    setAllTimeCrystals((prev) => prev + reward);
    setAchievements((prev) =>
      prev.map((a) => (a.id === achId ? { ...a, unlocked: true } : a))
    );
  };

  // Adsgram Rewarded Bonus Handler
  const handleAdRewardGranted = (amount: number, nonce: string) => {
    // Add bonus energy (capped at maxEnergy)
    setEnergy((prev) => Math.min(maxEnergy, prev + amount));
    setLastAdClaimTimestamp(Date.now());
    setTotalAdsWatched((prev) => prev + 1);
  };

  // Reset Run Progress
  const handleRestart = () => {
    setCrystals(0);
    setEnergy(maxEnergy);
    setComboStreak(0);
    setGameState('playing');
  };

  const tapPower = calculateTapPower(upgrades);
  const passiveRate = calculatePassiveIncomeRate(upgrades);
  const unclaimedAchievements = achievements.filter((a) => !a.unlocked && a.progress >= a.maxProgress).length;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* 2D Canvas Starry Galaxy Background */}
      <CosmicBackground />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={() => setGameState('playing')}
          onOpenCompliance={() => setIsComplianceOpen(true)}
        />
      )}

      {/* Pause Screen Overlay */}
      {gameState === 'paused' && (
        <PauseModal
          isOpen={true}
          onResume={() => setGameState('playing')}
          onRestart={handleRestart}
          onGoToTitle={() => setGameState('title')}
          crystals={crystals}
          totalTaps={totalTaps}
        />
      )}

      {/* Main Game Shell Header */}
      <GameHeader
        crystals={crystals}
        passiveRate={passiveRate}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onOpenPause={() => setGameState('paused')}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Tab Panels */}
      <main className="flex-1 w-full flex flex-col justify-center items-center px-4 py-2 z-10 overflow-y-auto">
        {activeTab === 'mine' && (
          <div className="w-full flex flex-col items-center justify-between my-auto gap-4">
            <InteractiveCore
              onTap={handleTap}
              energy={energy}
              tapPower={tapPower}
              comboStreak={comboStreak}
              floatingTexts={floatingTexts}
            />

            {/* Compliant Energy Bar & Adsgram Rewarded CTA */}
            <EnergyBar
              energy={energy}
              maxEnergy={maxEnergy}
              regenIntervalSec={regenIntervalSec}
              lastRegenTimestamp={lastEnergyRegenTimestamp}
              cooldownRemainingSec={cooldownRemainingSec}
              onOpenAdModal={() => setIsAdModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'upgrades' && (
          <div className="w-full py-2">
            <UpgradesPanel
              upgrades={upgrades}
              crystals={crystals}
              onBuyUpgrade={handleBuyUpgrade}
            />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="w-full py-2">
            <AchievementsPanel
              achievements={achievements}
              onClaimAchievement={handleClaimAchievement}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="w-full py-2">
            <StatsPanel
              state={{
                crystals,
                allTimeCrystals,
                totalTaps,
                energy,
                maxEnergy,
                energyRegenIntervalSec: regenIntervalSec,
                lastEnergyRegenTimestamp,
                comboStreak,
                lastTapTimestamp: lastTapTimeRef.current,
                upgrades,
                achievements,
                lastAdClaimTimestamp,
                adCooldownSeconds: adCooldownTotalSec,
                adEnergyBonus,
                totalAdsWatched,
                adTransactions: [],
                adsgramBlockId,
                isMuted,
                hapticsEnabled: true,
              }}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unclaimedAchievementsCount={unclaimedAchievements}
      />

      {/* Adsgram Rewarded Bonus Modal */}
      <AdRewardModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onRewardGranted={handleAdRewardGranted}
        cooldownRemainingSec={cooldownRemainingSec}
        bonusAmount={adEnergyBonus}
        cooldownTotalSec={adCooldownTotalSec}
      />

      {/* Adsgram Moderation & Compliance Audit Modal */}
      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
        currentBlockId={adsgramBlockId}
        onUpdateBlockId={(newId) => setAdsgramBlockId(newId)}
      />

      {/* Privacy & Data Integrity Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
