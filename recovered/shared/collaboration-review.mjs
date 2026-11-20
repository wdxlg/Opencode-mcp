// Local review notes are separate from collaboration/employee ledgers and never grant approval.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';
import { digest, fail, now, requiredText } from './collaboration-contracts.mjs';

const FORMAT = 'opencode-local-review-notes', SCHEMA = 1;
const MAX_BYTES = 8 * 1024 * 1024, MAX_THREADS = 1200, MAX_REPLIES = 32;
const empty = () => ({ format: FORMAT, schemaVersion: SCHEMA, revision: 1, threads: [] });
const safe = thread => { const { clientKey, bodyHash, ...visible } = structuredClone(thread); for (const message of visible.messages) { delete message.clientKey; delete message.bodyHash; } return visible; };

export function reviewDiffHash(diff) {
  return digest({ text: diff.text, untracked: diff.untracked || [], available: diff.available === true, partial: diff.partial === true, scope: diff.scope || null });
}

// Only actual hunk lines are commentable. The index belongs to the stored snapshot,
// not to whatever happens to be present in a working tree later.
export function reviewAnchor(text, index) {
  if (typeof text !== 'string' || !Number.isSafeInteger(index) || index < 0) fail('REVIEW_LINE_INVALID', '差异行号无效。');
  const lines = text.split('\n');
  if (index >= lines.length) fail('REVIEW_LINE_INVALID', '差异行不在保存的快照中。');
  let file = '', inHunk = false, oldLine = 0, newLine = 0;
  for (let i = 0; i <= index; i++) {
    const line = lines[i];
    if (line.startsWith('diff --git ')) { file = line.slice(11, 1000); inHunk = false; continue; }
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (hunk) { oldLine = Number(hunk[1]); newLine = Number(hunk[2]); inHunk = true; continue; }
    if (!inHunk || ![' ', '+', '-'].includes(line[0])) { if (line[0] !== '\\') inHunk = false; continue; }
    const oldNumber = line[0] === '+' ? null : oldLine++;
    const newNumber = line[0] === '-' ? null : newLine++;
    if (i === index) return { lineIndex: index, file, oldLine: oldNumber, newLine: newNumber, lineHash: digest(line), preview: line.slice(0, 500) };
  }
  fail('REVIEW_LINE_INVALID', '只能针对已保存的文本差异内容行留言；文件头、二进制和未跟踪文件正文需另行核对。');
}

export class ReviewStore {
  constructor(service) { this.service = service; this.file = path.join(service.directory, 'review-notes.v1.json'); this.seen = false; }
  read() {
    try {
      if (fs.lstatSync(this.service.directory).isSymbolicLink() || fs.lstatSync(this.file).isSymbolicLink()) fail('REVIEW_DATA_LINK', '审阅记录目录或文件不能是链接。');
      const bytes = fs.readFileSync(this.file);
      if (bytes.length > MAX_BYTES) fail('REVIEW_DATA_TOO_LARGE', '审阅记录超过 8 MiB；保留原文件，不截断或重置。');
      let value; try { value = JSON.parse(bytes.toString('utf8')); } catch { fail('REVIEW_DATA_INVALID', '审阅记录不是有效 JSON；原文件保留。'); }
      if (value?.format !== FORMAT || value.schemaVersion !== SCHEMA || !Number.isSafeInteger(value.revision) || !Array.isArray(value.threads) || value.threads.length > MAX_THREADS) fail('REVIEW_DATA_INVALID', '审阅记录格式无效；原文件保留。');
      const ids = new Set();
      for (const item of value.threads) {
        if (typeof item?.id !== 'string' || ids.has(item.id) || typeof item.workspaceId !== 'string' || typeof item.taskId !== 'string' || typeof item.attemptId !== 'string' || !/^[a-f0-9]{64}$/.test(item.diffHash || '') || !Number.isSafeInteger(item.anchor?.lineIndex) || !['open', 'resolved'].includes(item.status) || !Number.isSafeInteger(item.revision) || !Array.isArray(item.messages) || item.messages.length < 1 || item.messages.length > MAX_REPLIES) fail('REVIEW_DATA_INVALID', '审阅讨论字段无效；原文件保留。');
        ids.add(item.id);
        for (const message of item.messages) if (typeof message?.id !== 'string' || typeof message.text !== 'string' || message.text.length > 4000) fail('REVIEW_DATA_INVALID', '审阅回复无效；原文件保留。');
      }
      this.seen = true; return value;
    } catch (error) {
      if (error.code === 'ENOENT' && !this.seen) return empty();
      if (error.code === 'ENOENT') fail('REVIEW_DATA_MISSING', '已使用的审阅账本缺失，不自动重建。');
      throw error;
    }
  }
  list(workspaceId, taskId, attemptId) {
    return this.read().threads.filter(item => item.workspaceId === workspaceId && item.taskId === taskId && item.attemptId === attemptId).map(safe);
  }
  async mutate(action) {
    const result = await withResourceLocks([this.service.file, this.file], async () => {
      const state = this.read(), value = await action(state);
      state.revision++;
      if (Buffer.byteLength(JSON.stringify(state)) > MAX_BYTES) fail('REVIEW_DATA_TOO_LARGE', '审阅记录达到上限；原记录未改动。');
      await this.service.atomic(this.file, state); this.seen = true; return safe(value);
    });
    this.service.emit('review'); return result;
  }
  async add(input, diff) {
    const text = requiredText(input.text, 4000), key = digest(requiredText(input.client_request_id, 200));
    const hash = reviewDiffHash(diff);
    if (input.diff_hash !== hash) fail('REVIEW_SNAPSHOT_CHANGED', '差异快照已变化，请重新打开后再评论。');
    const anchor = reviewAnchor(diff.text, input.line_index);
    const body = digest({ workspaceId: input.workspaceId, taskId: input.taskId, attemptId: input.attemptId, diffHash: hash, line: anchor.lineIndex, text });
    return this.mutate(state => {
      const prior = state.threads.find(item => item.clientKey === key);
      if (prior) { if (prior.bodyHash !== body) fail('REVIEW_REQUEST_CONFLICT', '同一评论请求键对应了不同内容。'); return prior; }
      if (state.threads.length >= MAX_THREADS) fail('REVIEW_LIMIT', '审阅讨论达到保留上限，不自动删除历史。');
      const at = now(), item = { id: 'review_' + crypto.randomUUID(), workspaceId: input.workspaceId, taskId: input.taskId, attemptId: input.attemptId, diffHash: hash, anchor, status: 'open', revision: 1, createdAt: at, updatedAt: at, clientKey: key, bodyHash: body, messages: [{ id: 'reviewmsg_' + crypto.randomUUID(), author: 'local-user', text, at }] };
      state.threads.push(item); return item;
    });
  }
  async reply(input) {
    const text = requiredText(input.text, 4000), key = digest(requiredText(input.client_request_id, 200));
    const body = digest({ threadId: input.threadId, text });
    return this.mutate(state => {
      const item = state.threads.find(thread => thread.id === input.threadId && thread.workspaceId === input.workspaceId && thread.taskId === input.taskId && thread.attemptId === input.attemptId);
      if (!item) fail('REVIEW_THREAD_UNKNOWN', '审阅讨论不属于当前任务与执行尝试。');
      const previous = item.messages.find(message => message.clientKey === key);
      if (previous) { if (previous.bodyHash !== body) fail('REVIEW_REQUEST_CONFLICT', '同一回复请求键对应了不同内容。'); return item; }
      if (item.revision !== input.expected_revision) fail('REVIEW_VERSION_CONFLICT', '讨论已变化，请刷新后回复。');
      if (item.messages.length >= MAX_REPLIES) fail('REVIEW_REPLY_LIMIT', '此讨论已达到回复保留上限。');
      const at = now(); item.messages.push({ id: 'reviewmsg_' + crypto.randomUUID(), author: 'local-user', text, at, clientKey: key, bodyHash: body }); item.revision++; item.updatedAt = at; return item;
    });
  }
  async setStatus(input) {
    if (!['open', 'resolved'].includes(input.status)) fail('REVIEW_STATUS_INVALID', '审阅状态无效。');
    return this.mutate(state => {
      const item = state.threads.find(thread => thread.id === input.threadId && thread.workspaceId === input.workspaceId && thread.taskId === input.taskId && thread.attemptId === input.attemptId);
      if (!item) fail('REVIEW_THREAD_UNKNOWN', '审阅讨论不属于当前任务与执行尝试。');
      if (item.revision !== input.expected_revision) fail('REVIEW_VERSION_CONFLICT', '讨论已变化，请刷新后处理。');
      item.status = input.status; item.revision++; item.updatedAt = now(); return item;
    });
  }
}
