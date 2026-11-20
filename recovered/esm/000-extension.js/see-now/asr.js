// Modified for OpenCode (2026-11-10): excerpt of upstream src/listen.js. See SOURCE.json.
/**
 * asr.js — 音频转写（OpenCode 取用版）。
 *
 * 取自 dsh-see-now src/listen.js（Apache-2.0，见同目录 LICENSE / NOTICE / SOURCE.json）：
 * canonicalizeWav / send / buildMultipart / httpTranscriber / postOpenAiAudio /
 * postChatAudio / chatAudioText 为原文；asrConfig 改写为只读 OPENCODE_SEE_NOW_ASR_* 环境变量，
 * 去掉 ~/.dsh/asr.json、DSH 宿主 speechToText、listen.py 麦克风/回环监听与服务自启（manage）。
 * 本模块不录音、不启动任何服务；只在调用方显式要求转写时，把给定 WAV 发到用户配置的服务。
 */
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

export const ASR_APIS = Object.freeze(['openai-audio', 'chat-audio']);

/**
 * 把 ffmpeg/PortAudio 风格的 WAV 改写成宿主认的 **canonical** 形式。
 *
 * 宿主的 `validateWave()` 逐字节认死三条：`RIFF size === len - 8`、`data` 块
 * **必须正好在偏移 36**、`data size === len - 44`。而**管道写的 WAV 做不到前两条**
 * （长度回填不了，只能写 0xFFFFFFFF），ffmpeg 还会插一个 `LIST/INFO` 把 data 顶到 70。
 * 三条全灭 → 宿主抛 "Audio must be a canonical 16 kHz mono PCM16 WAV recording"，
 * 上层只看到一句 asr-failed，日志里毫无线索（2026-11-02 macOS 实报）。
 *
 * 这段和 `dsh-video-storyboard/src/storyboard/host-asr.js` 是同一套逻辑 ——
 * 两边都不想去依赖对方（see-now 对 storyboard 没有依赖），所以各自留一份。
 *
 * @param {Buffer|Uint8Array} input
 * @returns {Buffer} 44 字节头 + PCM
 */
export function canonicalizeWav(input) {
  const bytes = Buffer.isBuffer(input)
    ? input
    : Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  if (bytes.length < 44 || bytes.toString('latin1', 0, 4) !== 'RIFF'
    || bytes.toString('latin1', 8, 12) !== 'WAVE') {
    throw new Error('不是 WAV（缺 RIFF/WAVE 头）');
  }
  let p = 12;
  let fmt = null;
  let payload = null;
  while (p + 8 <= bytes.length) {
    const id = bytes.toString('latin1', p, p + 4);
    const size = bytes.readUInt32LE(p + 4);
    const body = p + 8;
    if (id === 'data') {
      const end = size === 0xFFFFFFFF ? bytes.length : Math.min(bytes.length, body + size);
      payload = bytes.subarray(body, end - ((end - body) & 1));
      break;
    }
    if (id === 'fmt ' && size >= 16 && body + 16 <= bytes.length) fmt = bytes.subarray(body, body + 16);
    if (size === 0xFFFFFFFF || body + size > bytes.length) break;
    p = body + size + (size & 1);
  }
  if (!fmt) throw new Error('WAV 里没有 fmt 块');
  if (!payload) throw new Error('WAV 里没有 data 块');

  const out = Buffer.alloc(44 + payload.length);
  out.write('RIFF', 0, 'latin1');
  out.writeUInt32LE(out.length - 8, 4);
  out.write('WAVE', 8, 'latin1');
  out.write('fmt ', 12, 'latin1');
  out.writeUInt32LE(16, 16);
  fmt.copy(out, 20);
  out.write('data', 36, 'latin1');
  out.writeUInt32LE(payload.length, 40);
  payload.copy(out, 44);
  return out;
}

/**
 * 转写服务配置（OpenCode 改写）：只读环境变量，不读 DSH 配置文件。
 * - OPENCODE_SEE_NOW_ASR_BASE_URL  例：http://127.0.0.1:8000/v1（必填，否则视为未配置）
 * - OPENCODE_SEE_NOW_ASR_API       openai-audio（默认，POST /audio/transcriptions）| chat-audio
 * - OPENCODE_SEE_NOW_ASR_KEY       可选 Bearer 令牌（不会出现在 status 输出里）
 * - OPENCODE_SEE_NOW_ASR_MODEL     默认 whisper-1
 * - OPENCODE_SEE_NOW_ASR_LANGUAGE  默认 zh
 */
export function asrConfig(env = process.env) {
  const baseUrl = env.OPENCODE_SEE_NOW_ASR_BASE_URL || '';
  if (!baseUrl) return null;
  const api = String(env.OPENCODE_SEE_NOW_ASR_API || 'openai-audio');
  return {
    baseUrl: String(baseUrl).replace(/\/+$/, ''),
    api: ASR_APIS.includes(api) ? api : 'openai-audio',
    key: env.OPENCODE_SEE_NOW_ASR_KEY || '',
    model: env.OPENCODE_SEE_NOW_ASR_MODEL || 'whisper-1',
    language: env.OPENCODE_SEE_NOW_ASR_LANGUAGE || 'zh',
  };
}

/**
 * 发一个 POST，走 `node:http` / `node:https` 而不是全局 `fetch`。
 *
 * 为什么不用 fetch：宿主里可能装着会包住 `fetch` 的插件（billion-context 就是），
 * 它把每个经过 fetch 的目标都当成自己的"上游"去探测，连不上就挂一条
 * 「上游不可用 · connect-refused ×3」。转写请求发往 127.0.0.1:8000，一旦被那种
 * 插件看见，就会被登记成一个假上游，界面上于是常年挂着一条"服务不可用"的提示 ——
 * 而实际原因可能只是面板没刷新。用自己的 http 通道，这条请求就只属于我们。
 */
function send(urlStr, { method = 'POST', headers = {}, body = null, signal, timeoutMs = 30_000 } = {}) {
  return new Promise((resolve, reject) => {
    let url;
    try {
      url = new URL(urlStr);
    } catch (e) {
      reject(e);
      return;
    }
    const mod = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = mod(url, { method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        const status = res.statusCode ?? 0;
        resolve({
          ok: status >= 200 && status < 300,
          status,
          text: async () => text,
          json: async () => JSON.parse(text),
        });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`请求超时（${timeoutMs}ms）`)));
    if (signal) {
      if (signal.aborted) {
        req.destroy(new Error('aborted'));
        return;
      }
      signal.addEventListener('abort', () => req.destroy(new Error('aborted')), { once: true });
    }
    if (body) req.write(body);
    req.end();
  });
}

/** 手写 multipart：只要一个文件 + 几个文本字段，不值得为它引一个依赖。 */
function buildMultipart(fields, boundary) {
  const parts = [];
  for (const f of fields) {
    parts.push(Buffer.from(`--${boundary}\r\n`));
    if (f.filename) {
      parts.push(
        Buffer.from(
          `Content-Disposition: form-data; name="${f.name}"; filename="${f.filename}"\r\n` +
            `Content-Type: ${f.type || 'application/octet-stream'}\r\n\r\n`,
        ),
      );
      parts.push(Buffer.from(f.data));
      parts.push(Buffer.from('\r\n'));
    } else {
      parts.push(Buffer.from(`Content-Disposition: form-data; name="${f.name}"\r\n\r\n${f.value}\r\n`));
    }
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(parts);
}
export function httpTranscriber(cfg, { timeoutMs = 30_000, log = () => {} } = {}) {  if (!cfg?.baseUrl) return null;
  const chat = cfg.api === 'chat-audio';
  return async function viaHttp(wav) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = chat
        ? await postChatAudio(cfg, wav, ac.signal, timeoutMs)
        : await postOpenAiAudio(cfg, wav, ac.signal, timeoutMs);
      if (!res.ok) throw new Error(`HTTP ${res.status}：${(await res.text()).slice(0, 120)}`);
      const j = await res.json();
      return chat ? chatAudioText(j) : String(j?.text ?? '').trim();
    } catch (e) {
      log(`转写失败：${e?.message ?? e}`);
      // **必须抛**。以前这里 `return ''`，于是上层看到的只是"这段没说话"：
      // 失败计数永远不涨、永远不停、status 里永远是"在听、0 句" ——
      // 服务根本没起的时候，界面上和"视频是默片"一模一样（2026-11-04 实报）。
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };
}

function postOpenAiAudio(cfg, wav, signal, timeoutMs) {
  const boundary = `----seenow${Math.random().toString(16).slice(2)}`;
  const body = buildMultipart(
    [
      { name: 'file', filename: 'a.wav', type: 'audio/wav', data: wav },
      { name: 'model', value: cfg.model },
      { name: 'response_format', value: 'json' },
      { name: 'language', value: cfg.language || 'zh' },
    ],
    boundary,
  );
  return send(`${cfg.baseUrl}/audio/transcriptions`, {
    headers: {
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'content-length': String(body.length),
      ...(cfg.key ? { authorization: `Bearer ${cfg.key}` } : {}),
    },
    body,
    signal,
    timeoutMs,
  });
}

function postChatAudio(cfg, wav, signal, timeoutMs) {
  const body = {
    model: cfg.model,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'input_audio',
            // 纯 base64 + format，不用 data URL：OpenAI 原生与小米两种写法都认这种，
            // 而 data URL 只有部分服务认。
            input_audio: { data: Buffer.from(wav).toString('base64'), format: 'wav' },
          },
        ],
      },
    ],
  };
  if (cfg.language) body.asr_options = { language: cfg.language };
  const payload = Buffer.from(JSON.stringify(body), 'utf8');
  return send(`${cfg.baseUrl}/chat/completions`, {
    headers: {
      'content-type': 'application/json',
      'content-length': String(payload.length),
      ...(cfg.key ? { authorization: `Bearer ${cfg.key}` } : {}),
    },
    body: payload,
    signal,
    timeoutMs,
  });
}

/** `choices[0].message.content` 可能是字符串，也可能是分段数组。 */
function chatAudioText(j) {
  const c = j?.choices?.[0]?.message?.content;
  if (typeof c === 'string') return c.trim();
  if (Array.isArray(c)) {
    return c.map((p) => (typeof p === 'string' ? p : (p?.text ?? ''))).join('').trim();
  }
  return '';
}
