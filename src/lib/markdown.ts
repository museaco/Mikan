import type { XhsDetailResponse } from './api';

export function buildMarkdown(
  data: XhsDetailResponse['data'],
  imageNames: string[],
  videoNames: string[] = []
): string {
  const tags = data['作品标签']
    .split(/\s+/)
    .filter(Boolean)
    .map((tag) => `  - ${tag}`)
    .join('\n');

  const images = imageNames.map((name) => `  - "${name}"`).join('\n') || '  []';
  const videos = videoNames.map((name) => `  - "${name}"`).join('\n') || '  []';

  const frontmatter = `---
id: "${data['作品ID']}"
title: "${escapeYaml(data['作品标题'])}"
url: "${data['作品链接']}"
type: "${data['作品类型']}"
publishedAt: "${data['发布时间']}"
updatedAt: "${data['最后更新时间']}"
timestamp: ${data['时间戳']}
likes: "${data['点赞数量']}"
collects: "${data['收藏数量']}"
comments: "${data['评论数量']}"
shares: "${data['分享数量']}"
tags:
${tags || '  []'}
author:
  name: "${escapeYaml(data['作者昵称'])}"
  id: "${data['作者ID']}"
  url: "${data['作者链接']}"
images:
${images}
videos:
${videos}
---

${data['作品描述'] || ''}`;

  return frontmatter;
}

function escapeYaml(str: string): string {
  return str.replace(/"/g, '\\"');
}
