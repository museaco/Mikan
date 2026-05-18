import { AlertCircle, CheckCircle2, Clock, Copy, List, Loader2, Play, Square, Trash2, } from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../lib/utils.ts';
import { DownloadItem } from '../store/types.ts';
import { useDownloadStore } from '../store/useDownloadStore';
import { useSettingsStore } from '../store/useSettingsStore.ts';
import XButton from './XButton.tsx';

const statusConfig = {
  pending: { icon: Clock, color: 'text-fg-muted' },
  processing: { icon: Loader2, color: 'text-accent' },
  done: { icon: CheckCircle2, color: 'text-success' },
  error: { icon: AlertCircle, color: 'text-error' },
};

export default function QueuePanel() {
  const { queue, isRunning, } = useDownloadStore(useShallow(state => ({
    queue: state.queue, isRunning: state.isRunning,
  })));

  const { startQueue, stopQueue, removeItem, clearQueue } = useDownloadStore.getState();

  const { settings } = useSettingsStore(useShallow(state => ({
    settings: state.settings
  })));


  const pendingCount = queue.filter((i) => i.status === 'pending').length;
  const doneCount = queue.filter((i) => i.status === 'done').length;
  const errorCount = queue.filter((i) => i.status === 'error').length;

  const onCopy = (item: DownloadItem) => {
    navigator.clipboard.writeText(item.url);
    toast.success('复制成功');
  };

  const handleStartQueue = () => {

    if (!settings.apiBase) {
      toast.info('请先设置API地址');
      return;
    }

    if (!settings.saveDir) {
      toast.info('请先设置保存目录');
      return;
    }


    startQueue();
  };

  return (
    <main className="flex flex-col flex-1 min-h-0">
      <header className="p-3 border-b border-border bg-bg-secondary">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <List size={18} className="text-fg-secondary" />
            <span className="text-xs font-mono text-fg-secondary">下载队列</span>
          </div>
          <div className="flex gap-2">
            <XButton
              onClick={clearQueue}
              disabled={queue.length === 0}
            >
              <Trash2 size={16} />
              清空
            </XButton>
            {isRunning ? (
              <XButton
                onClick={stopQueue}
                className="text-xs bg-error! border-red! text-white  hover:text-white!"
              >
                <Square size={16} />
                停止
              </XButton>
            ) : (
              <XButton
                onClick={handleStartQueue}
                disabled={queue.length === 0}
                color="primary"
              >
                <Play size={16} />
                开始
              </XButton>
            )}
          </div>
        </div>

      </header>

      <section className="flex-1 overflow-y-auto p-2 space-y-3">
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-fg-muted text-sm">
            <List size={24} className="mb-2 opacity-40" />
            队列为空，在上方输入 URL
          </div>
        )}
        {queue.map((item) => {
          const { icon: Icon, color } = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-bg-tertiary border border-border hover:border-border-hover transition-colors animate-fade-in"
            >
              <Icon size={22} className={cn('shrink-0', color, item.status === 'processing' ? 'animate-spin' : '')} />
              <div className="flex-1 min-w-0 mx-2">
                <div className="text-xs text-fg-primary truncate">
                  {item.title || item.url}
                </div>
                {item.progress && (
                  <div className="text-xs text-fg-muted">{item.progress}</div>
                )}
                {item.errorMsg && (
                  <div className="text-xs text-error truncate">{item.errorMsg}</div>
                )}
              </div>

              <div className="flex shrink-0 gap-1">
                <XButton
                  onClick={() => onCopy(item)}
                  className="shrink-0 p-1 text-fg-muted hover:text-accent transition-colors cursor-pointer"
                  title="复制链接"
                  icon={<Copy size={16} />}
                />
                {
                  item.status !== 'processing' && (
                    <XButton
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 p-1 text-fg-muted hover:text-error transition-colors cursor-pointer"
                      title="移除"
                      icon={<Trash2 size={16} />}
                    />
                  )
                }

              </div>
            </div>
          );
        })}
      </section>

      <footer className="px-3 py-2 border-t border-border">
           <span className="text-[14px] text-fg-muted">
            {queue.length} 项 · {pendingCount} 待处理 · {doneCount} 成功 · {errorCount} 失败
          </span>
      </footer>
    </main>
  );
}
