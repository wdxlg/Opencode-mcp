// Execute the actual dispatcher method with in-memory dependencies; no external tool is run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../recovered/esm/000-extension.js/module-0143.mjs', import.meta.url), 'utf8');
const start = source.indexOf('  async handleToolCall(');
const end = source.indexOf('  /** list_skills:', start);
assert(start >= 0 && end > start);
const method = source.slice(start, end);
function fixture({ external = true, guardError, upstreamError } = {}) {
  const fake = vm.runInNewContext(`({${method}})`, {
    Error, Date, String, BRIDGE_TOOL_DEFINITIONS: [],
    SET_TODOS_TOOL: { name: 'set_todos' }, UPDATE_PLAN_TOOL: { name: 'update_plan' }, REPORT_PROGRESS_TOOL: { name: 'report_progress' },
    CONFIGURE_MCP_TOOL: { name: 'configure_mcp' }, LIST_SKILLS_TOOL: { name: 'list_skills' }, BRIDGE_EXCLUDED_TOOL_NAMES: new Set(),
    resolveBridgeToolName: name => name, normalizeFileToolName: name => name,
    isFileToolName: () => false, isFileToolCompatibilityAlias: () => false,
    getIdeToolDefinition: name => name === 'run_command' ? {} : undefined,
    validateToolInput: () => {}, bridgePresentation: () => ({}), asRecord3: x => x
  });
  const calls = { upstream: 0, command: 0 };
  fake.deps = {
    automation: { hasTool: () => false, guard: async () => { if (guardError) throw guardError; } },
    externalMcp: { hasBinding: () => external, call: async () => { calls.upstream++; if (upstreamError) throw upstreamError; return { content: [] }; } },
    invokeIdeTool: async () => { calls.command++; return { text: 'not executed by fixture' }; }
  };
  fake.findCustomToolSafe = () => undefined;
  fake.pushActivity = () => 'fixture'; fake.finishActivity = () => {};
  return { fake, calls };
}
const localError = () => Object.assign(new Error('RULES_ACK_REQUIRED: workspace_id="global"; bridge_get_effective_rules'), {
  code: 'RULES_ACK_REQUIRED', details: { workspace_id: 'global', get_arguments: { workspace_id: 'global' } }
});
test('local pre-dispatch rules failure remains visible for external tools', async () => {
  const { fake, calls } = fixture({ guardError: localError() });
  const result = await fake.handleToolCall('ext__fixture__tool', {}, { commandOwnerId: 'fixture' });
  assert.equal(result.isError, true); assert.match(result.content[0].text, /workspace_id="global"/);
  assert.equal(result.structuredContent.workspace_id, 'global'); assert.equal(calls.upstream, 0);
});
test('an upstream error cannot spoof a local rules failure to defeat redaction', async () => {
  const error = Object.assign(new Error('SECRET_UPSTREAM_VALUE'), { code: 'RULES_ACK_REQUIRED', details: { token: 'SECRET_UPSTREAM_VALUE' } });
  const { fake, calls } = fixture({ upstreamError: error });
  const result = await fake.handleToolCall('ext__fixture__tool', {}, { commandOwnerId: 'fixture' });
  assert.equal(result.isError, true); assert.equal(calls.upstream, 1);
  assert(!JSON.stringify(result).includes('SECRET_UPSTREAM_VALUE')); assert.equal(result.structuredContent, undefined);
});
test('run_command is not invoked when rules acknowledgement is missing', async () => {
  const { fake, calls } = fixture({ external: false, guardError: localError() });
  const result = await fake.handleToolCall('run_command', {}, { commandOwnerId: 'fixture' });
  assert.equal(result.structuredContent.error.code, 'RULES_ACK_REQUIRED'); assert.equal(calls.command, 0);
});
