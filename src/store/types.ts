export interface DownloadItem {
  id: string;
  url: string;
  title?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMsg?: string;
  progress?: string;
}

export interface LogEntry {
  time: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface AppSettings {
  saveDir: string;
  apiBase: string;
  cookie?: string;
  proxy?: string;
}

export interface DownloadStore {
  queue: DownloadItem[];
  logs: LogEntry[];

  isRunning: boolean;
  addUrls: (urls: string[]) => void;
  removeItem: (id: string) => void;
  clearQueue: () => void;
  startQueue: () => void;
  stopQueue: () => void;
  clearLogs: () => void;
  addLog: (level: LogEntry['level'], message: string) => void;

  setItemStatus: (
    id: string,
    status: DownloadItem['status'],
    errorMsg?: string,
    progress?: string
  ) => void;
  setItemTitle: (id: string, title: string) => void;
}
