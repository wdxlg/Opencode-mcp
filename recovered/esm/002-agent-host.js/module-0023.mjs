// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/agent-host.js
// Original module marker: src/read-files.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/read-files.ts
init_define_OPENCODE_BUILD_INFO();

var DEFAULT_READ_FILES_CONFIG = {
  maxFilesPerCall: 20,
  concurrency: 8,
  maxLinesPerFile: 2e3,
  maxBytesPerFile: 64 * 1024,
  maxEstimatedTokensPerFile: 16e3,
  maxLineChars: 4e3,
  maxTotalBytesPerCall: 256 * 1024,
  maxEstimatedTokensPerCall: 5e4,
  veryLargeFileBytes: 2 * 1024 * 1024,
  binaryProbeBytes: 8 * 1024
};
export { DEFAULT_READ_FILES_CONFIG };
