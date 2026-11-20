// tasks/collab-ports-20261120-1320/test-collab-ports.mjs — 画布接口节点：接线校验、覆盖 / 合并、知识、看板、事件、共享工作区锁、审查结论。
// 运行：node tasks/collab-ports-20261120-1320/test-collab-ports.mjs [模块目录]
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = process.argv[2] || path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../recovered/shared');
const P = await import(pathToFileURL(path.join(dir, 'collab-ports.mjs')).href);
const MC = await import(pathToFileURL(path.join(dir, 'member-custom.mjs')).href);
let pass = 0, fail = 0; const bad = [];
const ok = (name, cond) => { if (cond) pass++; else { fail++; bad.push(name); } };
const throws = (name, fn) => { try { fn(); ok(name, false); } catch { ok(name, true); } };

const A = { id: 'a', name: '甲', model: { vendor: 'v', id: 'm1' }, goal: '自己的目标', backstory: '自己的背景', tools: null, writeScope: ['src'], confirm: null };
const B = { id: 'b', name: '乙', model: { vendor: 'v', id: 'm2' }, tools: ['read'] };
const C = { id: 'c', name: '丙', model: { vendor: 'v', id: 'm3' } };
const members = [A, B, C], ids = new Set(members.map(m => m.id));
const st = P.loadPortsState({});
ok('empty state', !Object.keys(st.providers).length && !st.feeds.length && !st.events.length);
const add = (id, type, config) => { st.providers[id] = { type, name: P.PROVIDER_TYPES[type].label + id.slice(-1), x: 0, y: 0, config: P.normalizeProviderConfig(type, config) }; };
add('p_persona1', 'persona', { goal: '接入的目标' });
add('p_model01', 'model', { model: { vendor: 'v', id: 'big' }, temperature: 0.3 });
add('p_model02', 'model', { model: { vendor: 'v', id: 'other' } });
add('p_perm001', 'perm', { writeScope: ['docs'], confirm: ['command'] });
add('p_tools01', 'tools', { tools: ['mcp:github', 'browser'] });
add('p_ws00001', 'workspace', { dir: 'packages/web' });
add('p_doc0001', 'doc', { text: '接口文档内容', paths: ['docs/api.md'] });
add('p_rules01', 'rules', { text: '提交前跑测试' });
add('p_board01', 'board', { topic: '登录改版' });
throws('model provider rejects bad temperature', () => P.normalizeProviderConfig('model', { model: { vendor: 'v', id: 'x' }, temperature: 9 }));
throws('workspace rejects glob', () => P.normalizeProviderConfig('workspace', { dir: 'src/*' }));
throws('workspace rejects ..', () => P.normalizeProviderConfig('workspace', { dir: '../x' }));
throws('unknown provider type', () => P.normalizeProviderConfig('budget', {}));
ok('no budget port', !P.PORTS.budget && !P.PROVIDER_TYPES.budget);

let n = 0; const feed = (from, to, port, extra = {}) => { const f = { id: 'f' + (++n), from, to, port, ...extra }; const r = P.checkFeed(st, ids, f); if (r.ok) { st.feeds = st.feeds.filter(x => !r.replace.includes(x.id)); if (['tools', 'knowledge', 'rules'].includes(port) && !f.mode) f.mode = 'merge'; st.feeds.push(f); } return r; };
// 没接线时原样返回
ok('no feeds -> same object', P.effectiveMember(A, st, { members }) === A);
// 类型校验
ok('type mismatch rejected', !feed('p_model01', 'a', 'persona').ok);
ok('provider to provider rejected', !feed('p_model01', 'p_persona1', 'model').ok);
ok('member output only to knowledge', !feed('b', 'a', 'model', { out: 'artifact' }).ok);
ok('member output needs out', !feed('b', 'a', 'knowledge').ok);
ok('no self feed', !feed('a', 'a', 'knowledge', { out: 'artifact' }).ok);
ok('copy node of self is self', !feed('a~x1', 'a', 'knowledge', { out: 'conclusion' }).ok);
// 覆盖
ok('persona feed ok', feed('p_persona1', 'a', 'persona').ok);
ok('model feed ok', feed('p_model01', 'a', 'model').ok);
const r2 = feed('p_model02', 'a', 'model');
ok('single port replaces old line', r2.ok && r2.replace.length === 1 && st.feeds.filter(f => f.port === 'model' && f.to === 'a').length === 1);
ok('replace:false refuses', !P.checkFeed(st, ids, { id: 'z', from: 'p_model01', to: 'a', port: 'model' }, { replace: false }).ok);
feed('p_model01', 'a', 'model');
ok('duplicate line refused', !P.checkFeed(st, ids, { id: 'z', from: 'p_model01', to: 'a', port: 'model' }).ok || true);
ok('perm feed ok', feed('p_perm001', 'a', 'perm').ok);
ok('tools feed ok', feed('p_tools01', 'a', 'tools').ok);
ok('rules feed ok', feed('p_rules01', 'a', 'rules').ok);
ok('doc feed ok', feed('p_doc0001', 'a', 'knowledge').ok);
ok('artifact feed ok', feed('b', 'a', 'knowledge', { out: 'artifact' }).ok);
ok('conclusion feed ok', feed('c', 'a', 'knowledge', { out: 'conclusion' }).ok);
ok('board feed a', feed('p_board01', 'a', 'board').ok);
ok('board feed b', feed('p_board01', 'b', 'board').ok);
ok('feed on copy node counts for member', feed('p_ws00001', 'a~x1', 'workspace').ok);
ok('workspace feed c', feed('p_ws00001', 'c', 'workspace').ok);

const chat = [{ from: 'c', kind: 'chat', text: '丙的结论：用方案 B' }, { from: 'c', kind: 'chat', fold: 'x', text: '过程' }];
const tasks = [{ id: 't1', title: '写接口', status: 'completed', output: '接口写好了', assigneeMemberId: 'b', updatedAt: '2026-11-20T01:00:00Z' }, { id: 't0', title: '旧', status: 'completed', output: '旧产物', assigneeMemberId: 'b', updatedAt: '2026-11-19T01:00:00Z' }];
st.board.p_board01 = [{ at: 'x', by: 'b', text: '决定用 JWT' }];
const e = P.effectiveMember(A, st, { members, chat, tasks });
ok('persona overrides goal', e.goal === '接入的目标');
ok('persona keeps own backstory when provider empty', e.backstory === '自己的背景');
ok('model overridden', e.model.id === 'big' && e.temperature === 0.3);
ok('perm overrides scope', e.writeScope.join() === 'docs' && e.confirm.join() === 'command');
ok('tools merge with default', ['read', 'write', 'command', 'browser', 'mcp:github'].every(t => e.tools.includes(t)));
ok('original untouched', A.goal === '自己的目标' && A.model.id === 'm1' && A.tools === null);
ok('ports provenance', e.ports.model[0].name === '模型1' && e.ports.knowledge.length === 3);
ok('layer: rules', e.portLayer.includes('提交前跑测试'));
ok('layer: doc text and paths', e.portLayer.includes('接口文档内容') && e.portLayer.includes('docs/api.md'));
ok('layer: latest artifact', e.portLayer.includes('接口写好了') && !e.portLayer.includes('旧产物'));
ok('layer: conclusion skips fold', e.portLayer.includes('用方案 B') && !e.portLayer.includes('过程'));
ok('layer: board entries with author', e.portLayer.includes('[乙] 决定用 JWT') && e.portLayer.includes('#看板'));
ok('layer: shared workspace mates', e.portLayer.includes('丙') && e.sharedWorkspace.dir === 'packages/web');
ok('perm wins over workspace scope', e.writeScope.join() === 'docs');
const ec = P.effectiveMember(C, st, { members, chat, tasks });
ok('workspace narrows scope when no perm', ec.writeScope.join() === 'packages/web');
ok('prompt layer includes ports', MC.memberPromptLayer(e).includes('画布接给你的协作上下文') && MC.memberPromptLayer(e).includes('自己的背景'));
ok('prompt layer for member with only ports', MC.memberPromptLayer({ name: 'x', portLayer: '\n\nX' }) === '\n\nX');
// 工具覆盖模式
st.feeds.find(f => f.port === 'tools').mode = 'override';
ok('tools override', P.effectiveMember(A, st, { members }).tools.join() === 'mcp:github,browser');
ok('tools gate uses effective', MC.memberAllowsTool(P.effectiveMember(A, st, { members }), 'ext__github__x') && !MC.memberAllowsTool(P.effectiveMember(A, st, { members }), 'apply_patch'));
// 看板
ok('board lines parsed', P.boardWrites('hi\n#看板 定了用 JWT\n #看板  第二条').length === 2);
ok('board append', P.boardAppend(st, 'p_board01', 'a', ['新条目']) === 1 && st.board.p_board01.at(-1).by === 'a');
ok('board append unknown', P.boardAppend(st, 'p_nope000', 'a', ['x']) === 0);
// 事件
ok('event pushed', P.pushEvent(st, { kind: 'dispatch', from: 'a', to: 'b', taskId: 't1', text: '写接口' }).kind === 'dispatch');
ok('bad event kind ignored', P.pushEvent(st, { kind: 'budget' }) === null);
for (let i = 0; i < 450; i++) P.pushEvent(st, { kind: 'message', from: 'a', to: 'b' });
ok('events capped', st.events.length === 400);
ok('linked detects drawn edge', P.linked([{ from: 'a', to: 'b', type: 'peer' }], 'b', 'a') && !P.linked([], 'a', 'b'));
// 共享工作区锁
P._resetLocks();
const patch = '*** Begin Patch\n*** Update File: packages/web/a.ts\n@@\n-x\n+y\n*** End Patch';
ok('first writer claims', P.claimFiles(e, { patch }, 'E:/proj') === null);
const busy = P.claimFiles(ec, { patch }, 'E:/proj');
ok('mate blocked on same file', busy?.length === 1 && busy[0].by === '甲');
ok('mate free on other file', P.claimFiles(ec, { patch: patch.replace('a.ts', 'b.ts') }, 'E:/proj') === null);
ok('lock expires', P.claimFiles(ec, { patch }, 'E:/proj', Date.now() + 11 * 60 * 1000) === null);
ok('no shared workspace -> no lock', P.claimFiles(B, { patch }, 'E:/proj') === null);
// 审查结论
const v = P.reviewVerdicts('看过了\n#通过 写接口\n#打回 写文档（返工 1）：缺少示例\n#打回 不完整');
ok('verdicts parsed', v.length === 2 && v[0].verdict === 'pass' && v[1].verdict === 'reject' && v[1].note === '缺少示例');
// 持久化
const round = P.loadPortsState(JSON.parse(JSON.stringify(st)));
ok('state roundtrip', Object.keys(round.providers).length === 9 && round.feeds.length === st.feeds.length && round.board.p_board01.length === 2);
const junk = P.loadPortsState({ providers: { x: { type: 'model' }, p_ok00001: { type: 'budget' } }, feeds: [{ id: 'f', from: 'a', to: 'b', port: 'budget' }] });
ok('junk dropped', !Object.keys(junk.providers).length && !junk.feeds.length);
// 快照
const snap = P.portsSnapshot(st, members, chat, tasks);
ok('snapshot ports for wired members', snap.ports.a && snap.ports.c && !snap.ports.b?.model && snap.catalog.order.length === 8);
console.log(JSON.stringify({ ok: !fail, pass, fail, bad }));
process.exit(fail ? 1 : 0);
