// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/managed-bash-protocol.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/managed-bash-protocol.ts
init_define_OPENCODE_BUILD_INFO();

function windowsManagedBashProtocol(protocolToken) {
  if (!/^[a-zA-Z0-9_-]+$/.test(protocolToken)) {
    throw new Error("Invalid managed terminal protocol token.");
  }
  const bootstrap = [
    // Preserve ISIG and ECHO. Only disable the extra canonical input buffering:
    // with it, MSYS timed read can report EOF and leave input for the next prompt.
    "stty -icanon min 1 time 0 || { printf '%s\\n' 'OpenCode Bash input initialization failed.' >&2; exit 1; }",
    // Noninteractive Bash clears PS1, so carry it under a private name until exec.
    'export PS1="$OPENCODE_MANAGED_PS1"',
    "unset OPENCODE_MANAGED_PS1",
    // Agent commands are literal scripts, not interactive history references.
    'exec "$BASH" --noprofile --norc +H -i'
  ].join("; ");
  const prompt = [
    `\\[\\e]633;OpenCode;${protocolToken};W2;`,
    "$((__opencode_seq=${__opencode_seq:-0}+1));$?;",
    // Read the parent-shell array before any command substitution. @A supplies
    // an unambiguous, IFS-independent numeric array declaration, never code to eval.
    "${PIPESTATUS[*]@A};",
    `$(printf '%s' "$PWD" | base64 | tr -d '\\r\\n')`,
    "\\a\\]$ "
  ].join("");
  return {
    args: ["--noprofile", "--norc", "-c", bootstrap],
    env: { PROMPT_COMMAND: "", OPENCODE_MANAGED_PS1: prompt }
  };
}

function safeInteger(text2) {
  if (!/^-?\d+$/.test(text2)) return void 0;
  const value = Number(text2);
  return Number.isSafeInteger(value) ? value : void 0;
}

function parseBashPipelineSnapshot(text2, declaration = false) {
  if (!declaration) {
    if (text2 === "") return [];
    if (!/^\d+(?:,\d+)*$/.test(text2)) return void 0;
    const values2 = text2.split(",").map(Number);
    return values2.every((value) => Number.isSafeInteger(value) && value <= 255) ? values2 : void 0;
  }
  const match = /^declare -a PIPESTATUS=\((.*)\)$/.exec(text2);
  if (!match) return void 0;
  if (match[1] === "") return [];
  const fields2 = match[1].split(" ");
  const values = [];
  for (const field3 of fields2) {
    const item = /^\[(\d+)\]="(\d+)"$/.exec(field3);
    if (!item || Number(item[1]) !== values.length) return void 0;
    const value = Number(item[2]);
    if (!Number.isSafeInteger(value) || value > 255) return void 0;
    values.push(value);
  }
  return values;
}

function parseManagedPrompt(payload) {
  const fields2 = payload.split(";");
  const modern = fields2[0] === "W2";
  if (modern ? fields2.length !== 5 : fields2.length !== 3 && fields2.length !== 4) return void 0;
  const [sequenceText, exitCodeText] = modern ? fields2.slice(1, 3) : fields2;
  const sequence = safeInteger(sequenceText);
  const exitCode = safeInteger(exitCodeText);
  if (sequence === void 0 || sequence < 0 || exitCode === void 0) return void 0;
  const pipeline = fields2[3];
  return {
    sequence,
    exitCode,
    cwdBase64: modern ? fields2[4] : fields2[2],
    pipelineExitCodes: pipeline === void 0 ? void 0 : parseBashPipelineSnapshot(pipeline, modern)
  };
}
export { windowsManagedBashProtocol, safeInteger, parseBashPipelineSnapshot, parseManagedPrompt };
