import XMarkdown from '@ant-design/x-markdown';
import { ChevronDown, ChevronUp, Terminal, Trash2 } from 'lucide-react';
import { CSSProperties, useEffect, useRef } from 'react';
import { cn } from '../lib/utils.ts';
import { useDownloadStore } from '../store/useDownloadStore';
import { useSettingsStore } from '../store/useSettingsStore';
import XButton from './XButton.tsx';
import '@ant-design/x-markdown/themes/dark.css';


const levelColors = {
  info: 'var(--color-fg-secondary)',
  success: 'var(--color-success)',
  warn: 'var(--color-warn)',
  error: 'var(--color-error)',
};

export default function ConsolePanel() {
  const logs = useDownloadStore((s) => s.logs);
  const clearLogs = useDownloadStore((s) => s.clearLogs);
  const isExpanded = useSettingsStore((s) => s.consoleExpanded);
  const toggleConsole = useSettingsStore((s) => s.toggleConsole);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <main className={cn('flex flex-col  bg-bg-primary', isExpanded ? 'h-full border-l border-border' : '')}>
      <header onClick={() => toggleConsole()} className={cn('cursor-pointer flex items-center justify-between p-3  border-border', isExpanded ? 'border-b' : 'border-t')}>
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-fg-secondary" />
          <span className="text-xs font-mono text-fg-secondary">控制台</span>
          <span className="text-xs text-fg-muted">{logs.length} 条</span>
        </div>
        <div className="flex items-center gap-2">
          <XButton
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              clearLogs();
            }}
            disabled={logs.length === 0}
            className={cn(
              isExpanded ? '' : 'hidden!'
            )}
          >
            <Trash2 size={16} />
            清空
          </XButton>
          <XButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleConsole();
            }}
            title={isExpanded ? '收起' : '展开'}
            icon=
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          />
        </div>
      </header>

      {isExpanded && (
        <section ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-fg-muted">
              <Terminal size={28} className="mb-2 opacity-40" />
              暂无日志
            </div>
          )}
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2 animate-slide-in">
              <span className="text-fg-muted shrink-0">[{log.time}]</span>
              <span className={cn('shrink-0 uppercase ')} style={{ color: levelColors[log.level] }}>[{log.level}]</span>
              <div
                className={cn('text-fg-primary flex-1 min-w-0')}
              >
                <XMarkdown
                  components={{
                    'a': 'span'
                  }}
                  style={{
                    '--text-color': levelColors[log.level]
                  } as CSSProperties}
                  className={cn('x-markdown-dark break-all',)} paragraphTag="div" content={log.message}
                />
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
