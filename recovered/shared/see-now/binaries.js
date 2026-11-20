// Modified for OpenCode (2026-11-10): DSH paths removed. See SOURCE.json.
/**
 * binaries.js — 找 ffmpeg 在哪（OpenCode 取用版）。
 *
 * 取自 dsh-see-now src/binaries.js（Apache-2.0）。改动：去掉 DSH_FFMPEG_PATH / DSH_FFMPEG_DIR /
 * $DSH_HOME/tools/ffmpeg 等 DSH 路径，改为 OpenCode 自己的环境变量；不下载、不安装 ffmpeg。
 *
 * 优先级：
 *  1. OPENCODE_SEE_NOW_FFMPEG（ffmpeg 可执行文件绝对路径）
 *  2. FFMPEG_PATH（同上，通用写法）
 *  3. OPENCODE_SEE_NOW_FFMPEG_DIR（含 ffmpeg 的目录）
 *  4. 裸 `ffmpeg`，交给 PATH
 *
 * 注意：OpenCode 安装目录里的 ffmpeg.dll 是 Electron 的媒体解码库，不是 ffmpeg 命令行，不能代替 ffmpeg.exe。
 */

import { join } from 'node:path';

const exe = (platform) => (platform === 'win32' ? '.exe' : '');

/**
 * @param {{env?:NodeJS.ProcessEnv, platform?:NodeJS.Platform}} [opts]
 * @returns {{path:string, source:string}}
 */
export function resolveFfmpeg({ env = process.env, platform = process.platform } = {}) {
  const name = `ffmpeg${exe(platform)}`;
  if (env.OPENCODE_SEE_NOW_FFMPEG) return { path: env.OPENCODE_SEE_NOW_FFMPEG, source: 'OPENCODE_SEE_NOW_FFMPEG' };
  if (env.FFMPEG_PATH) return { path: env.FFMPEG_PATH, source: 'FFMPEG_PATH' };
  if (env.OPENCODE_SEE_NOW_FFMPEG_DIR) return { path: join(env.OPENCODE_SEE_NOW_FFMPEG_DIR, name), source: 'OPENCODE_SEE_NOW_FFMPEG_DIR' };
  return { path: name, source: 'PATH' };
}
