import { exists, mkdir, writeFile } from '@tauri-apps/plugin-fs';
import { fetch } from '@tauri-apps/plugin-http';
import type { AppSettings, DownloadStore } from '../store/types';
import { fetchXhsDetail } from './api';
import { buildMarkdown } from './markdown';
import { slugifyTitle } from './utils';

type MediaKind = 'image' | 'video';

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv']);

function getMediaExtension(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    return match ? match[1].toLowerCase() : fallback;
  } catch {
    return fallback;
  }
}

function inferMediaKind(url: string): MediaKind {
  const ext = getMediaExtension(url, '');
  return VIDEO_EXTENSIONS.has(ext) ? 'video' : 'image';
}

async function downloadMediaFile(url: string, filePath: string): Promise<void> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Referer: 'https://www.xiaohongshu.com/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await writeFile(filePath, new Uint8Array(arrayBuffer));
}

function compactUrls(urls?: (string | null)[]): string[] {
  return (urls ?? []).filter((url): url is string => Boolean(url));
}

export async function processQueueItem(
  item: { id: string; url: string },
  settings: AppSettings,
  actions: {
    setItemStatus: (
      id: string,
      status: DownloadStore['queue'][number]['status'],
      errorMsg?: string,
      progress?: string
    ) => void;
    setItemTitle: (id: string, title: string) => void;
    addLog: (level: DownloadStore['logs'][number]['level'], message: string) => void;
    setRunning: (running: boolean) => void;
  }
): Promise<void> {
  const { setItemStatus, setItemTitle, addLog } = actions;

  try {
    setItemStatus(item.id, 'processing');
    addLog('info', `开始处理: ${item.url}`);

    const params = {
      url: item.url,
      cookie: settings.cookie,
      proxy: settings.proxy,
      download: false,
    };
    addLog('info', `请求参数: \n \`\`\`json \n${JSON.stringify(params, null, 2)}\n\`\`\``);

    const res = await fetchXhsDetail(settings.apiBase, params);
    const data = res?.data;
    addLog('success', `获取详情成功: \n  \`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);

    if (!data || !data['作者ID']) {
      throw new Error('未发现数据');
    }
    const title = data['作品标题'] || data['作品描述']?.slice(0, 50) || item.id;
    setItemTitle(item.id, title);

    const folderName = slugifyTitle(title);
    const saveDir = settings.saveDir;

    if (!saveDir) {
      throw new Error('未设置保存目录');
    }

    const folderPath = `${saveDir}/${folderName}`;

    const folderExists = await exists(folderPath);
    if (!folderExists) {
      await mkdir(folderPath, { recursive: true });
    }

    const mediaUrls = compactUrls(data['下载地址']);
    const imageNames: string[] = [];
    const videoNames: string[] = [];

    for (let i = 0; i < mediaUrls.length; i++) {
      const url = mediaUrls[i];
      const kind = inferMediaKind(url);
      const names = kind === 'image' ? imageNames : videoNames;
      const index = names.length + 1;
      const ext = getMediaExtension(url, kind === 'image' ? 'jpg' : 'mp4');
      const filename = `${kind}_${String(index).padStart(2, '0')}.${ext}`;
      const label = kind === 'image' ? '图片' : '视频';
      setItemStatus(item.id, 'processing', undefined, `下载${label} ${i + 1}/${mediaUrls.length}`);

      try {
        await downloadMediaFile(url, `${folderPath}/${filename}`);
        names.push(filename);
        addLog('info', `已下载 ${filename}`);
      } catch (e) {
        addLog('warn', `${label}下载失败 (${filename}): ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const mdContent = buildMarkdown(data, imageNames, videoNames);
    const encoder = new TextEncoder();
    await writeFile(`${folderPath}/index.md`, encoder.encode(mdContent));

    setItemStatus(item.id, 'done', undefined, `${imageNames.length} 张图片，${videoNames.length} 个视频`);
    addLog('success', `已保存: ${folderName}/index.md`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    setItemStatus(item.id, 'error', msg);
    addLog('error', `处理失败: ${item.url} - ${msg}`);
  }
}
