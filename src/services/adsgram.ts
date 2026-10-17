/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Adsgram SDK Window declaration
declare global {
  interface Window {
    Adsgram?: {
      init: (params: { blockId: string; debug?: boolean }) => {
        show: () => Promise<{ done: boolean; error?: boolean; description?: string }>;
      };
    };
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            username?: string;
          };
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

export interface AdShowCallbacks {
  onStart?: () => void;
  onReward: (result: { nonce: string; blockId: string; isSimulated?: boolean }) => void;
  onSkipped: (reason: string) => void;
  onError: (errorMsg: string) => void;
}

export class AdsgramService {
  private static defaultBlockId = 'int-7065'; // Adsgram official sample/test rewarded block ID

  public static getBlockId(): string {
    const saved = localStorage.getItem('adsgram_block_id');
    return saved && saved.trim().length > 0 ? saved.trim() : this.defaultBlockId;
  }

  public static setBlockId(blockId: string) {
    localStorage.setItem('adsgram_block_id', blockId.trim());
  }

  public static isSdkLoaded(): boolean {
    return typeof window !== 'undefined' && typeof window.Adsgram !== 'undefined';
  }

  /**
   * Request and show an Adsgram Rewarded ad according to official Adsgram specifications.
   */
  public static async showRewardedAd(callbacks: AdShowCallbacks): Promise<void> {
    const blockId = this.getBlockId();
    const nonce = `ad_nonce_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    callbacks.onStart?.();

    // Check if the genuine Adsgram SDK script is loaded
    if (this.isSdkLoaded() && window.Adsgram) {
      try {
        const adController = window.Adsgram.init({
          blockId: blockId,
          debug: false,
        });

        const result = await adController.show();

        if (result && result.done === true && !result.error) {
          // Genuinely completed ad: grant configured reward once
          callbacks.onReward({
            nonce,
            blockId,
            isSimulated: false,
          });
        } else if (result && result.done === false) {
          // User skipped or closed early: strictly NO reward
          callbacks.onSkipped(result.description || 'Ad was closed before completion.');
        } else {
          callbacks.onError(result?.description || 'Ad playback could not be verified.');
        }
      } catch (err: unknown) {
        const errorObj = err as { description?: string; message?: string };
        const desc = errorObj.description || errorObj.message || 'Ad playback failed or was interrupted.';
        if (desc.toLowerCase().includes('close') || desc.toLowerCase().includes('skip')) {
          callbacks.onSkipped(desc);
        } else {
          callbacks.onError(desc);
        }
      }
    } else {
      // Adsgram SDK script is not available in environment (e.g. adblocker, headless test or offline)
      // Provide compliant fallback notification
      callbacks.onError('Adsgram SDK is currently unreachable (ad blocker or network restriction). Natural energy regeneration continues normally.');
    }
  }
}
