import { useEffect, useState } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { toast } from 'sonner';

interface UpdateProgress {
  downloaded: number;
  contentLength: number;
  isDownloading: boolean;
}

export function useUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState<Update | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress>({
    downloaded: 0,
    contentLength: 0,
    isDownloading: false,
  });

  const checkForUpdates = async () => {
    try {
      setIsChecking(true);
      const update = await check();
      if (update) {
        setUpdateAvailable(update);
        toast.success(
          `Update available: ${update.version}`,
          {
            description: 'Click to download and install',
            action: {
              label: 'Update',
              onClick: () => downloadAndInstall(update),
            },
          }
        );
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      toast.error('Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const downloadAndInstall = async (update: Update) => {
    try {
      setProgress(prev => ({ ...prev, isDownloading: true }));
      
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            setProgress(prev => ({
              ...prev,
              contentLength: event.data.contentLength,
              downloaded: 0,
            }));
            toast.info('Starting download...');
            break;
          case 'Progress':
            setProgress(prev => ({
              ...prev,
              downloaded: prev.downloaded + event.data.chunkLength,
            }));
            break;
          case 'Finished':
            toast.success('Update downloaded successfully');
            break;
        }
      });

      toast.success('Update installed! Restarting application...');
      setTimeout(() => relaunch(), 1000);
    } catch (error) {
      console.error('Failed to download and install update:', error);
      toast.error('Failed to install update');
    } finally {
      setProgress(prev => ({ ...prev, isDownloading: false }));
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  return {
    updateAvailable,
    isChecking,
    progress,
    checkForUpdates,
    downloadAndInstall: () => updateAvailable && downloadAndInstall(updateAvailable),
  };
}