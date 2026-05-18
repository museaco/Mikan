import { invoke } from '@tauri-apps/api/core';

export interface XhsDetailRequest {
  url: string;
  download?: boolean;
  index?: number;
  cookie?: string;
  proxy?: string;
  skip?: boolean;
}

export interface XhsDetailResponse {
  message: string;
  params: XhsDetailRequest;
  data: {
    '收藏数量': string;
    '评论数量': string;
    '分享数量': string;
    '点赞数量': string;
    '作品标签': string;
    '作品ID': string;
    '作品链接': string;
    '作品标题': string;
    '作品描述': string;
    '作品类型': string;
    '发布时间': string;
    '最后更新时间': string;
    '时间戳': number;
    '作者昵称': string;
    '作者ID': string;
    '作者链接': string;
    '下载地址': (string | null)[];
    '动图地址': (string | null)[];
  };
}

export async function fetchXhsDetail(
  baseUrl: string,
  params: XhsDetailRequest
): Promise<XhsDetailResponse> {
  return invoke<XhsDetailResponse>('fetch_xhs_detail', { baseUrl, params });
}
