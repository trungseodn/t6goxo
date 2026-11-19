import * as path from 'path';
import * as fs from 'fs';

export function ztteam_getStorageRoot(): string {
  return process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
}

export function ztteam_getReelsPath(...subpaths: string[]): string {
  return path.join(ztteam_getStorageRoot(), 'reels', ...subpaths);
}

export function ztteam_getImagesPath(...subpaths: string[]): string {
  return path.join(ztteam_getStorageRoot(), 'images', ...subpaths);
}

export function ztteam_getTemplatesPath(...subpaths: string[]): string {
  return path.join(ztteam_getStorageRoot(), 'templates', ...subpaths);
}

export function ztteam_getYoutubePath(...subpaths: string[]): string {
  return path.join(ztteam_getStorageRoot(), 'youtube', ...subpaths);
}

export function ztteam_getVideosPath(...subpaths: string[]): string {
  return path.join(ztteam_getStorageRoot(), 'videos', ...subpaths);
}

export function ztteam_getSourceOriginalsPath(...subpaths: string[]): string {
  return path.join(ztteam_getStorageRoot(), 'images', 'source-originals', ...subpaths);
}

export function ztteam_getBgmPath(...subpaths: string[]): string {
  return path.join(ztteam_getStorageRoot(), 'bgm', ...subpaths);
}

export function ztteam_ensureStorageDirs(): void {
  const root = ztteam_getStorageRoot();
  const dirs = [
    root,
    path.join(root, 'reels'),
    path.join(root, 'images'),
    path.join(root, 'images', 'source-originals'),
    path.join(root, 'templates'),
    path.join(root, 'youtube'),
    path.join(root, 'videos'),
    path.join(root, 'bgm'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /** Đồng bộ các file nhạc mẫu từ assets/bgm sang storage/bgm nếu chưa tồn tại */
  try {
    const assetsBgmDir = path.join(process.cwd(), 'assets', 'bgm');
    const storageBgmDir = path.join(root, 'bgm');
    if (fs.existsSync(assetsBgmDir)) {
      const files = fs.readdirSync(assetsBgmDir);
      for (const file of files) {
        const dest = path.join(storageBgmDir, file);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(path.join(assetsBgmDir, file), dest);
        }
      }
    }
  } catch (err) {
    /** Bỏ qua nếu không thể copy */
  }
}

/**
 * ZTTeam: Chuyển đổi URL bài viết từ website WordPress đích (st.melyweb.net hoặc story.banglaixegiare.com)
 * sang domain trực tiếp đăng lên Facebook (lifeofmystory.com) theo cơ chế Direct
 */
export function ztteam_rewriteUrlForFacebook(url?: string | null): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/st\.melyweb\.net/gi, 'https://lifeofmystory.com')
    .replace(/^https?:\/\/story\.banglaixegiare\.com/gi, 'https://lifeofmystory.com');
}

/**
 * ZTTeam: Chuyển đổi mọi link trong nội dung văn bản (Caption, First comment, Reply Part 2)
 * sang domain lifeofmystory.com trước khi đăng lên Facebook
 */
export function ztteam_rewriteTextForFacebook(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/https?:\/\/st\.melyweb\.net/gi, 'https://lifeofmystory.com')
    .replace(/https?:\/\/story\.banglaixegiare\.com/gi, 'https://lifeofmystory.com');
}
