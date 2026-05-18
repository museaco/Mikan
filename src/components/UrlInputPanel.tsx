import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { FileUp, Link, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDownloadStore } from '../store/useDownloadStore';
import XButton from './XButton';

export default function UrlInputPanel() {
  const [text, setText] = useState('');
  const addUrls = useDownloadStore((s) => s.addUrls);

  function handleAdd() {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    addUrls(lines);
    setText('');
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      try {
        // In Tauri webview, file path may be available via webkitGetAsEntry or similar.
        // For simplicity, we read via File API if in browser, or we could use tauri dialog.
        const content = await file.text();
        const urls = content.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('http'));
        addUrls(urls);
      } catch {
        // ignore
      }
    }
  }, [addUrls]);

  async function handleImportFile() {
    const path = await open({ multiple: false, filters: [{ name: 'Text', extensions: ['txt'] }] });
    if (typeof path === 'string') {
      try {
        const content = await readTextFile(path);
        const urls = content.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('http'));
        addUrls(urls);
      } catch (e) {
        useDownloadStore.getState().addLog('error', `读取文件失败: ${String(e)}`);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-border">
      <header className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-fg-secondary">
          <Link size={18} />
          <span className="text-xs font-mono ">URL 输入</span>
        </div>
        <div className="flex gap-2">
          <XButton
            onClick={handleImportFile}

          >
            <FileUp size={16} />
            从txt文件导入
          </XButton>
          <XButton
            onClick={handleAdd}
            disabled={!text.trim()}
            color="primary"
          >
            <Plus size={16} />
            添加到队列
          </XButton>
        </div>
      </header>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder="每行一个帖子链接，支持拖拽文本文件..."
        className="w-full h-32 bg-bg-tertiary border border-border rounded-md px-2 py-2.5 text-xs text-fg-primary placeholder:text-fg-muted outline-none focus:border-accent resize-none transition-colors"
      />
    </div>
  );
}
