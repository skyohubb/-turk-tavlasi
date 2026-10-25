'use client';

// Play In-App Updates (flexible akış): yeni sürüm Play'de yayınlanınca
// uygulama arka planda sessizce indirir, bitince yeni sürüme geçirir.
// Sadece native Android + Play üzerinden kurulumda çalışır; web'de no-op.

import {
  AppUpdateAvailability,
  FlexibleUpdateInstallStatus,
} from '@capawesome/capacitor-app-update';

export type UpdatePhase =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'uptodate'
  | 'unsupported';

export interface UpdateStatus {
  phase: UpdatePhase;
  percent: number; // 0-100 (downloading)
  availableVersion: string;
}

async function isNativeAndroid(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

async function loadPlugin() {
  const { AppUpdate } = await import('@capawesome/capacitor-app-update');
  return AppUpdate;
}

export const appUpdater = {
  async isSupported(): Promise<boolean> {
    return isNativeAndroid();
  },

  // Güncelleme var mı? Varsa flexible akışı başlatır.
  async checkAndStart(
    onStatus: (s: UpdateStatus) => void
  ): Promise<() => void> {
    const noop = () => {};
    if (!(await isNativeAndroid())) {
      onStatus({ phase: 'unsupported', percent: 0, availableVersion: '' });
      return noop;
    }
    try {
      const AppUpdate = await loadPlugin();
      onStatus({ phase: 'checking', percent: 0, availableVersion: '' });
      const info = await AppUpdate.getAppUpdateInfo();

      // Yarım kalmış indirme varsa onu tamamla
      if (
        info.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS ||
        info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED
      ) {
        onStatus({ phase: 'ready', percent: 100, availableVersion: info.availableVersionCode ?? '' });
        return noop;
      }

      if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
        onStatus({ phase: 'uptodate', percent: 0, availableVersion: '' });
        return noop;
      }
      if (!info.flexibleUpdateAllowed) {
        // Flexible kapalıysa sessizce Play'e bırak (kullanıcıyı engelleme)
        onStatus({ phase: 'uptodate', percent: 0, availableVersion: '' });
        return noop;
      }

      onStatus({
        phase: 'available',
        percent: 0,
        availableVersion: info.availableVersionCode ?? '',
      });
      await AppUpdate.startFlexibleUpdate();

      const handle = await AppUpdate.addListener('onFlexibleUpdateStateChange', state => {
        if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADING) {
          const total = state.totalBytesToDownload ?? 0;
          const done = state.bytesDownloaded ?? 0;
          const percent = total > 0 ? Math.min(99, Math.round((done / total) * 100)) : 0;
          onStatus({ phase: 'downloading', percent, availableVersion: info.availableVersionCode ?? '' });
        } else if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
          onStatus({ phase: 'ready', percent: 100, availableVersion: info.availableVersionCode ?? '' });
        } else if (
          state.installStatus === FlexibleUpdateInstallStatus.FAILED ||
          state.installStatus === FlexibleUpdateInstallStatus.CANCELED
        ) {
          onStatus({ phase: 'uptodate', percent: 0, availableVersion: '' });
        }
      });
      return () => {
        handle.remove().catch(() => {});
      };
    } catch {
      onStatus({ phase: 'unsupported', percent: 0, availableVersion: '' });
      return noop;
    }
  },

  // İndirme bitti → uygula (uygulama yeniden başlar, yeni sürüm açılır)
  async complete(): Promise<boolean> {
    try {
      if (!(await isNativeAndroid())) return false;
      const AppUpdate = await loadPlugin();
      await AppUpdate.completeFlexibleUpdate();
      return true;
    } catch {
      return false;
    }
  },
};
