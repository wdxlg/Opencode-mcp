// Per-caller ambient defaults for the embedded backend; never mutate process.env/cwd.
import { AsyncLocalStorage } from 'node:async_hooks';
import { tmpdir, homedir } from 'node:os';
import { resolve } from 'node:path';
const scope = new AsyncLocalStorage();
export const runInBackendContext = (value, work) => scope.run(value, work);
export const backendEnvironment = () => scope.getStore()?.environment ?? process.env;
export const backendCwd = () => scope.getStore()?.root ?? process.cwd();
export const backendTempDir = () => scope.getStore()?.root ?? tmpdir();
export const backendHomeDir = () => scope.getStore()?.environment?.HOME ?? homedir();
export const backendResolve = (...parts) => resolve(backendCwd(), ...parts);
export const currentMcpRequestSignal = () => scope.getStore()?.signal;
// Retain the original encoding ceiling, not a listener or a stdio transport.
export const STDIO_DEFAULT_MAX_BUFFER_SIZE = 10 * 1024 * 1024;
// Prompt completion is dispatched through the native workflow tool, not SDK decorators.
export const completable = (schema, _completion) => schema;
