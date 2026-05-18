import { BadgeCheck } from 'lucide-react';
import { Toaster, } from 'sonner';
import './App.css';
import Bar from './components/Bar.tsx';
import ConsolePanel from './components/ConsolePanel';
import QueuePanel from './components/QueuePanel';
import SettingsPanel from './components/SettingsPanel';
import UrlInputPanel from './components/UrlInputPanel';
import { cn } from './lib/utils.ts';
import { useSettingsStore } from './store/useSettingsStore.ts';

function App() {

  const consoleExpanded = useSettingsStore((s) => s.consoleExpanded);

  return (
    <>
      <Toaster
        expand
        icons={{
          success: <BadgeCheck size={18} className="text-fg-secondary" />,
        }}
        toastOptions={{
          style: {
            background: '#1c1c1c',
            borderColor: '#2f2f2f'
          },
          classNames: {
            title: cn('!text-fg-secondary'),
            description: '!text-fg-muted',
            icon: cn('!text-fg-secondary'),
          },
        }}
      />
      <div className="flex flex-col h-full min-h-screen bg-bg-primary text-fg-primary">
        <Bar />
        <SettingsPanel />
        <div className={cn('flex flex-1 min-h-0', consoleExpanded ? 'flex-row' : 'flex-col')}>
          <div className={cn('flex flex-col', consoleExpanded ? 'w-1/2 min-w-0   border-r border-border' : 'flex-1 min-h-0 ')}>
            <UrlInputPanel />
            <QueuePanel />
          </div>
          <div className={cn('', consoleExpanded ? 'w-1/2 min-w-0' : '')}>
            <ConsolePanel />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
