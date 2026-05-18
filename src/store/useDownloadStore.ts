import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { processQueueItem } from '../lib/downloader';
import { formatTime, generateId } from '../lib/utils';
import type { DownloadStore } from './types';
import { useSettingsStore } from './useSettingsStore.ts';


export const useDownloadStore = create<DownloadStore>()(
  persist((set, get) => ({
    queue: [],
    logs: [],
    isRunning: false,

    addUrls: (urls: string[]) => {
      const validUrls = urls
        .map((u) => u.trim())
        .filter((u) => u.length > 0 && u.startsWith('http'));
      const newItems: DownloadStore['queue'] = validUrls.map((url) => ({
        id: generateId(),
        url,
        status: 'pending',
      }));
      set((state) => ({
        queue: [...state.queue, ...newItems],
        logs: [
          ...state.logs,
          ...newItems.map((item) => ({
            time: formatTime(),
            level: 'info' as const,
            message: `已加入队列: ${item.url}`,
          })),
        ],
      }));
    },

    removeItem: (id: string) => {
      set((state) => ({
        queue: state.queue.filter((item) => item.id !== id),
      }));
    },

    clearQueue: () => {
      set({ queue: [] });
    },

    startQueue: async () => {
      const state = get();
      if (state.isRunning) return;

      set({
        isRunning: true,
      });

      const queue = state.queue.map((item) => {

        if (item.status === 'error') {
          return {
            ...item,
            status: 'pending' as const,
            progress: '',
            errorMsg: ''
          };
        }
        return item;
      });

      set({ queue });
      get().addLog('info', '开始处理队列');

      const pending = queue.filter((item) => item.status === 'pending');

      for (const item of pending) {
        if (!get().isRunning) {
          get().addLog('warn', '队列已停止');
          break;
        }
        await processQueueItem(item, useSettingsStore.getState().settings, {
          setItemStatus: get().setItemStatus,
          setItemTitle: get().setItemTitle,
          addLog: get().addLog,
          setRunning: (running: boolean) => set({ isRunning: running }),
        });
      }

      set({ isRunning: false });
      get().addLog('info', '队列处理结束');
    },

    stopQueue: () => {
      set({ isRunning: false });
    },

    clearLogs: () => {
      set({ logs: [] });
    },

    addLog: (level, message) => {
      set((state) => ({
        logs: [...state.logs, { time: formatTime(), level, message }],
      }));
    },

    setItemStatus: (id, status, errorMsg, progress) => {
      set((state) => ({
        queue: state.queue.map((item) =>
          item.id === id ? { ...item, status, errorMsg, progress } : item
        ),
      }));
    },

    setItemTitle: (id, title) => {
      set((state) => ({
        queue: state.queue.map((item) => (item.id === id ? { ...item, title } : item)),
      }));
    },
  }), {
    name: 'position-storage-download',
  })
);
