/**
 * Context-window defaults aligned with dsh (DeepSeek Harness), 2026-11-18
 * (context-default-dsh):
 * - unknown API models: 262144 (dsh-llm-pi-ai DEFAULT_CONTEXT_WINDOW; was 128K)
 * - official DeepSeek endpoint: 1048576 for deepseek-flash / deepseek-v4-pro,
 *   1e6 for other ids (dsh-llm-deepseek OFFICIAL_CONTEXT_WINDOW / defaultContextWindow)
 * - known models: dsh's built-in catalog (pi-ai providers/data/<provider>.json),
 *   exact provider (endpoint host) + model id match; see dshCatalogContextWindow
 *   in module-0174.mjs for the table.
 * Order: per-model user value > learned-from-overflow window (only smaller) >
 * /models discovery > dsh catalog > fallback.
 * Reference only: the built bundle uses recovered/esm/000-extension.js/module-0174.mjs.
 */
export const DEFAULT_API_CONTEXT_WINDOW = 262_144;
/**
 * Output defaults aligned with dsh (context-compaction-dsh PART A, 2026-11-19):
 * user value > /models discovery (official DeepSeek: min(256000, discovered)) >
 * dsh output catalog (pi-ai providers/data maxTokens, endpoint host + model id) > 32768;
 * official DeepSeek default 256000. See DSH_OUTPUT_CATALOG in module-0174.mjs.
 */
export const DEFAULT_API_MAX_OUTPUT_TOKENS = 32_768;
export const DSH_DEEPSEEK_OFFICIAL_MAX_OUTPUT_TOKENS = 256_000;

/**
 * Codex (ChatGPT sign-in): catalog models use the catalog value (mostly 272000);
 * ids outside the catalog fall back to 262144 like dsh. Discovery and user
 * overrides still win.
 */
export const DEFAULT_CODEX_CONTEXT_WINDOW = 262_144;
