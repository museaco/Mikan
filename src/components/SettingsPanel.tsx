import { invoke } from '@tauri-apps/api/core';
import { open as selectDir } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';
import { ArrowUpRight, Cog, Cookie, FolderOpen, Globe, Server } from 'lucide-react';
import { useEffect } from 'react';
import { useDownloadStore } from '../store/useDownloadStore.ts';
import { useSettingsStore } from '../store/useSettingsStore.ts';
import XButton from './XButton.tsx';

export default function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const collapsed = useSettingsStore(state => state.settingsExpanded);

  const setCollapsed = (s: boolean) => {
    useSettingsStore.setState({
      settingsExpanded: s
    });
  };

  async function allowDir(path: string) {
    try {
      await invoke('allow_download_dir', { path });
    } catch (e) {
      useDownloadStore.getState().addLog('error', `目录授权失败: ${String(e)}`);
    }
  }

  async function allowApiBaseUrl(apiBase: string) {
    const value = apiBase.trim();
    if (!value) return;

    try {
      const url = new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

      await invoke('allow_api_base_url', { baseUrl: value });
    } catch {
      // The user may still be typing. Keep quiet until a valid URL is entered.
    }
  }

  async function handleSelectDir() {
    const path = await selectDir({ directory: true });
    if (typeof path === 'string') {
      await allowDir(path);
      updateSettings({ saveDir: path });
    }
  }

  async function openDir(path: string) {
    try {
      await Command.create('open_folder', [path]).spawn();
    } catch (e) {
      useDownloadStore.getState().addLog('error', `打开目录失败: ${String(e)}`);
    }
  }

  useEffect(() => {
    if (settings.saveDir) {
      allowDir(settings.saveDir);
    }

    if (settings.apiBase) {
      allowApiBaseUrl(settings.apiBase);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      allowApiBaseUrl(settings.apiBase);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [settings.apiBase]);

  return (
    <div className="border-b border-border bg-bg-secondary">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2 text-sm font-mono text-fg-secondary">
          <Cog size={18} />
          <span>设置</span>
        </div>
        <span className="text-fg-muted text-xs">{collapsed ? '展开' : '收起'}</span>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-3 animate-slide-in">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-fg-muted shrink-0" />
            <label className="text-xs text-fg-muted shrink-0">API</label>
            <input
              // disabled
              type="text"
              value={settings.apiBase}
              onChange={(e) => updateSettings({ apiBase: e.target.value })}
              onBlur={() => allowApiBaseUrl(settings.apiBase)}
              placeholder="http://localhost:5556"
              className="flex-1 min-w-0 disabled:opacity-60 disabled:cursor-not-allowed  bg-bg-tertiary border border-border rounded-md px-2 py-2.5 text-xs text-fg-primary outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-fg-muted shrink-0" />
            <label className="text-xs text-fg-muted shrink-0">保存目录</label>
            <input
              type="text"
              readOnly
              value={settings.saveDir}
              placeholder="点击选择..."
              onClick={handleSelectDir}
              className="flex-1 min-w-0 bg-bg-tertiary border border-border rounded-md px-2 py-2.5 text-xs text-fg-primary outline-none cursor-pointer truncate"
            />
            <XButton
              onClick={() => openDir(settings.saveDir)}
              disabled={!settings.saveDir}
              className="shrink-0 px-3! h-full"
              title="在文件管理器中打开"
              icon={<ArrowUpRight size={16} />}
            />
          </div>

          <div className="flex items-center gap-2">

            <Globe size={18} className="text-fg-muted shrink-0" />
            <label className="text-xs text-fg-muted shrink-0">代理</label>
            <input
              type="text"
              value={settings.proxy || ''}
              onChange={(e) => updateSettings({ proxy: e.target.value })}
              placeholder="可选，如 http://127.0.0.1:7890"
              className="flex-1 min-w-0 bg-bg-tertiary border border-border rounded-md px-2 py-2.5 text-xs text-fg-primary outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 lg:col-span-3">
            <Cookie size={18} className="text-fg-muted shrink-0" />
            <label className="text-xs text-fg-muted shrink-0">Cookie</label>
            <input
              type="text"
              value={settings.cookie || ''}
              onChange={(e) => updateSettings({ cookie: e.target.value })}
              placeholder="可选"
              className="flex-1 min-w-0 bg-bg-tertiary border border-border rounded-md px-2 py-2.5 text-xs text-fg-primary outline-none focus:border-accent transition-colors"
            />

          </div>
        </div>
      )}
    </div>
  );
}
