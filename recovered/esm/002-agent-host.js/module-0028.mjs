// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/agent-host.js
// Original module marker: src/bridge-agent-instructions.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/bridge-agent-instructions.ts
init_define_OPENCODE_BUILD_INFO();
// src/task-planning-instructions.ts

var TASK_PLANNING_PRIORITY = "Task planning comes first: before workspace tools, create or update the visible task card. For multi-step work, publish a concise plan of actionable outcomes before investigation or edits; keep stable steps and at most one in_progress. Update the card after each meaningful completed step or change in direction, then mark the next step in_progress. Simple requests do not need an artificial multi-step plan; use a lightweight task status without padding steps or listing individual tool calls. Before the final answer reconcile the card: completed only when the requested work and validation are done; otherwise report blocked or cancelled truthfully. Use Bridge set_todos or Bridge update_plan; a client-local plan does not update this card.";
// src/managed-terminal-instructions.ts

var BRIDGE_TERMINAL_REUSE_RULE = "Terminal reuse: reuse an idle terminal belonging to the same command owner and matching an explicit cwd. Omit cwd to continue in that owner's most recently used idle shell; a new shell starts at the first workspace root. Windows native drive paths and equivalent MSYS paths identify the same cwd. Managed terminals stay in the terminal panel; terminal_id identifies a shell session, not an application window. Managed command execution has no fixed process-count or terminal-count quota and is exempt from Bridge tool concurrency queues. Reuse idle terminals where possible; host CPU, memory and OS limits still apply. Command ownership, cancellation permissions, workspace mutation locks and idle-time cleanup remain enforced. Use read_files/search_files and apply_patch for supported file work; batch independent reads.";
var BRIDGE_POWERSHELL_QUOTING_RULE = "PowerShell from Bash: protect a powershell.exe -Command script with Bash single quotes, or use a short .ps1 file for complex quoting. Bash double quotes still expand $variables, $(), and backticks before PowerShell sees them; this includes $_. Avoid large -EncodedCommand payloads: use file tools for data and a small script for execution.";
// src/bridge-agent-instructions.ts
var CODE_STRUCTURE_GUIDANCE = "Favor high cohesion and low coupling: keep related behavior together, interfaces narrow, and dependencies explicit; avoid needless abstractions.";
var BRIDGE_BASH_TERMINAL_CONTRACT = "Command field is native bash source, decoded before parsing. Pass the command as native bash source directly; do not wrap ordinary commands in /bin/bash -c, bash -lc, or another shell string. Extra shell layers reparse quotes, $variables, $(), and backticks. The independent run_command terminal is Bash, NOT zsh, PowerShell or CMD, on Linux, macOS and Windows. Do not infer the shell from the host OS or the user login shell. Quote paths and expansions. On Windows, invoke powershell.exe explicitly only for a Windows-only facility or a .ps1 script.";
var BRIDGE_COMMAND_OWNER_RULE = "Command-owner scope: 2025 requests use the originating MCP session; stateless 2026 requests use a stable credential/client/workspace identity. Later same-identity requests can poll, send input or cancel. Use exact random cmd_... command_id, not terminal_id. COMMAND_NOT_ACCESSIBLE means handle unavailable to this owner; do not bypass scope or blindly rerun. timeout_ms may return status=running without killing; continue with get_command_output at next_offset.";
var BRIDGE_PIPELINE_STATUS_RULE = 'Immediately after a pipeline, copy all statuses with pipeline_status=("${PIPESTATUS[@]}") before running another command; results include pipeline_exit_codes. Use pipefail to propagate pipeline failures.';
var BASH_COMMAND_INPUT_DESCRIPTION = "Native bash command or multiline script. This value is already the script body, not a shell-escaped command-line argument: do not wrap ordinary commands in /bin/bash -lc, bash -c, or another shell string. All three independent terminals use Bash; quote paths and expansions and respect the connected host's filesystem and permissions.";
function managedBashDescription(platform) {
  const platformDetails = platform === "win32" ? "Windows uses product-bundled PortableGit bash.exe --noprofile --norc, with no PowerShell fallback. A missing bundled Bash is a packaging/install error. Prefer /c/... drive paths inside Bash and workspace-relative cwd tool arguments." : platform === "darwin" ? "macOS uses /bin/bash --noprofile --norc (bash 3.2): no mapfile/readarray/declare -A; use while IFS= read -r instead. BSD sed -i needs a backup suffix." : "Linux uses /bin/bash --noprofile --norc. Use the connected Linux host's paths, utilities and package manager; check BASH_VERSION before assuming optional Bash features.";
  return `${BRIDGE_BASH_TERMINAL_CONTRACT} ${platformDetails} Startup files are not sourced; the Extension Host environment/PATH is inherited (Windows also prepends bundled Git). Bash arrays are 0-based. ${BRIDGE_PIPELINE_STATUS_RULE} Unmatched globs remain literal. An idle managed terminal closes after two hours; a fresh shell loses variables, functions and cwd. Do not rely on state across different terminal slots. ${BRIDGE_TERMINAL_REUSE_RULE} ${BRIDGE_POWERSHELL_QUOTING_RULE}`;
}
var NATIVE_BASH_MODEL_DESCRIPTION = TASK_PLANNING_PRIORITY + ` Run native bash source directly in a OpenCode-managed independent Bash PTY on Linux, macOS and Windows, not the user's configured terminal profile; do not add a bash -lc wrapper around ordinary commands. Do not infer PowerShell, CMD or zsh from the host OS. On macOS /bin/bash is 3.2; Windows uses product-bundled PortableGit Bash. Idle owner-scoped terminals with the same cwd are reused and close automatically after two hours; concurrent or busy commands may use additional terminals. background defaults to false; use true only for long-running servers/watchers. Commands require user confirmation when invoked from Chat. ${BRIDGE_TERMINAL_REUSE_RULE} ${BRIDGE_POWERSHELL_QUOTING_RULE}`;
var BRIDGE_TASK_EXAMPLES = {
  newJob: { new_task: true, mode: "replace", todos: [
    { id: "inspect", title: "\u68C0\u67E5\u76F8\u5173\u6E90\u7801", status: "in_progress" },
    { id: "verify", title: "\u9A8C\u8BC1\u7ED3\u679C", status: "pending" }
  ] },
  resume: {
    task_id: "<last task_id>",
    expected_revision: 1,
    mode: "patch",
    todos: [{ id: "inspect", title: "\u68C0\u67E5\u76F8\u5173\u6E90\u7801", status: "completed" }]
  },
  clear: { task_id: "<last task_id>", expected_revision: 1, mode: "replace", todos: [] },
  complete: { task_id: "<last task_id>", expected_revision: 1, lifecycle: "completed", mode: "replace", todos: [
    { id: "inspect", title: "\u68C0\u67E5\u76F8\u5173\u6E90\u7801", status: "completed" },
    { id: "verify", title: "\u9A8C\u8BC1\u7ED3\u679C", status: "completed" }
  ] }
};
var BRIDGE_MCP_WORKFLOW_INSTRUCTIONS = `MCP tools and workflow:
${TASK_PLANNING_PRIORITY}
- Task cards: at conversation start call Bridge set_todos before other tools, including readiness. New job: new_task=true. Resume only the same unfinished job with acknowledged task_id + expected_revision; keep stable step IDs and at most one in_progress.
- Task updates: mode=replace sends the complete ordered snapshot; mode=patch sends changed steps and preserves omitted IDs. An empty replace clears an existing job; an empty patch keeps its steps. Completed/cancelled/cleared cards are sealed; blocked/interrupted cards may update existing step IDs only.
- Final replies: before the final answer, send the terminal snapshot and wait for acknowledgement; completed only if all work is done, otherwise blocked/cancelled. Bridge update_plan is an alias; client-local or built-in update_plan does not reach the OpenCode task card. report_progress is transient, not durable task state; avoid progress updates for every tool call. If set_todos fails, try Bridge update_plan once, then continue and disclose that synchronization failed. Never claim unacknowledged updates.
- Task records: no global task-count limit. After 20 minutes without updates, the display moves to history; after one hour it disappears from the shelf. New progress restores the display. Display recycling never terminates background work. Local interruption and manual permanent cleanup still require confirmation. source_label is unverified, not authorization.
- Language: user-visible task titles, steps, progress, phases and explanations use Simplified Chinese; technical names and protocol enums stay in English.
- Files: use list_directory, find_files, search_files, read_files, read_image and lsp. Batch reads. Try broader glob patterns for missing files; find_files is not typo-tolerant. Empty results are inconclusive.
- Editing: read affected sections, then use apply_patch with unique hunks and available expected_versions. Add File and Move to create missing parents. Validated edits execute directly: no additional interactive approval is required. Re-read stale/ambiguous context; inspect uncertain results before retrying.
- Directories: for a requested empty directory, use run_command with mkdir -p -- <directory> and an explicit cwd. Inspect errors; never bypass denied scope.
- Commands: run_command uses native Bash. Set cwd and follow host quoting rules; background=true only for servers/watchers. Confirm destructive actions when not already authorized.
- ${BRIDGE_COMMAND_OWNER_RULE}
- ${BRIDGE_TERMINAL_REUSE_RULE}
- ${BRIDGE_POWERSHELL_QUOTING_RULE}
- Command control: get_command_output reads from next_offset; send_command_input sends input. cancel_command soft-interrupts and never auto-forces; never send Ctrl+C text or use a PID. force=true needs host-owned local confirmation; the MCP client cannot self-approve. Only the local user may Force Stop Anyway.
- Skills: use list_skills to discover installed instruction folders, NOT MCP tools; read skillFile before use. Failed discovery is inconclusive. Never install a Skill just to list it.
- MCP config: configure_mcp manages OTHER servers. Use add/list/remove/test/where as described in its schema. Credentials are stored securely; never echo secrets.
- Validation: get_diagnostics is a snapshot, not coverage. Run relevant tests/type checks and distinguish tests from deployment.
Parallelism: independent calls may be issued concurrently; the host queues over-limit work. Serialize dependent edits to the same file; command control remains available.
Code shape: ${CODE_STRUCTURE_GUIDANCE} Use targeted reads and semantic lookups. Make modular edits; extract a helper when it improves structure. Do not refuse a legitimate edit merely because the file is large.
Task examples (replace the sample task_id and revision with the latest acknowledgement):
New job: ${JSON.stringify(BRIDGE_TASK_EXAMPLES.newJob)}
Resume: ${JSON.stringify(BRIDGE_TASK_EXAMPLES.resume)}
Clear existing job: ${JSON.stringify(BRIDGE_TASK_EXAMPLES.clear)}`;
export { managedBashDescription, CODE_STRUCTURE_GUIDANCE, BRIDGE_BASH_TERMINAL_CONTRACT, BRIDGE_COMMAND_OWNER_RULE, BRIDGE_PIPELINE_STATUS_RULE, BASH_COMMAND_INPUT_DESCRIPTION, NATIVE_BASH_MODEL_DESCRIPTION, BRIDGE_TASK_EXAMPLES, BRIDGE_MCP_WORKFLOW_INSTRUCTIONS, TASK_PLANNING_PRIORITY, BRIDGE_TERMINAL_REUSE_RULE, BRIDGE_POWERSHELL_QUOTING_RULE };
