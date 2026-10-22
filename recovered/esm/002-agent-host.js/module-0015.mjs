// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/agent-host.js
// Original module marker: src/file-tool-registry.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/file-tool-registry.ts
init_define_OPENCODE_BUILD_INFO();


// src/file-tool-registry.ts
var FILE_TOOL_SCOPE_DESCRIPTION = "Allowed roots include the open workspace folders. Native Chat temporarily adds directories named in the current user turn; naming a file adds its parent directory. Bridge also includes the global Skill directory reported by list_skills; when the local user enables Entire device, file tools can directly access local filesystem paths subject to OS permissions and path validation. Use absolute paths for external targets. Project files mode requires adding an external folder to the workspace or enabling Entire device locally; do not bypass denied scope.";

var APPLY_PATCH_TOOL = {
  name: "apply_patch",
  title: "Apply Patch",
  description: [
    "Edit files in allowed workspace roots with one Codex-style patch. Keep changes modular and read the affected sections first, including in large files.",
    FILE_TOOL_SCOPE_DESCRIPTION,
    "Start/end with '*** Begin Patch'/'*** End Patch'. Directives: '*** Add File:', '*** Update File:' (optionally followed by '*** Move to:'), and '*** Delete File:'. In @@ hunks, prefix context with a space, removals with '-', additions with '+'. Context must match exactly and uniquely.",
    "Add File and Move to automatically create missing parent directories inside allowed roots. No preliminary mkdir or placeholder file is needed. For a requested empty directory use run_command, within the authorized scope.",
    "Pass expected_versions from read_files. On STALE_FILE or ambiguous context, re-read; after an uncertain response, inspect before retrying. Check error codes rather than assuming the tool lacks a capability.",
    "The runtime validates paths/versions/permissions before writing, locks overlapping paths and stages file images. It preserves existing BOM/line endings. Failed writes roll back; cleanup removes only newly created, unchanged, empty directories. Validated operations require no additional interactive approval.",
    "Returns the actual applied unified diff. Commits are rollback-capable, not filesystem-wide atomic. Outside paths, unsafe symlinks and permission denials remain blocked."
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      patch: {
        type: "string",
        minLength: 1,
        description: "Codex-style patch text using *** Begin Patch / *** End Patch and Add/Update/Delete/Move directives."
      },
      expected_versions: {
        type: "object",
        additionalProperties: { type: "string", pattern: "^sha256:" },
        description: "Optional map from existing file paths to sha256:... versions previously returned by read_files. Strongly recommended whenever those versions are available."
      }
    },
    required: ["patch"],
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["success", "error"] },
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["add", "update", "delete", "move"] },
            path: { type: "string" },
            destination_path: { type: "string" },
            old_version: { type: ["string", "null"] },
            new_version: { type: ["string", "null"] },
            additions: { type: "integer" },
            deletions: { type: "integer" }
          },
          required: ["action", "path"],
          additionalProperties: true
        }
      },
      summary: {
        type: "object",
        properties: {
          files_changed: { type: "integer" },
          additions: { type: "integer" },
          deletions: { type: "integer" }
        },
        additionalProperties: true
      },
      diff: { type: "string" },
      diff_truncated: { type: "boolean" },
      error_code: { type: "string" },
      message: { type: "string" }
    },
    required: ["status"],
    additionalProperties: true
  },
  annotations: {
    title: "Apply Patch",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false
  }
};

var READ_FILES_TOOL = {
  name: "read_files",
  title: "Read Files",
  description: [
    "Read one or more UTF-8 text files from the allowed roots on this OpenCode host.",
    FILE_TOOL_SCOPE_DESCRIPTION,
    "Batch independent files together in one call.",
    "For small files, omit start_line/end_line to read the complete file.",
    "For large files, results may be truncated and include next_start_line.",
    "For large-file work, prefer search_files and explicit line ranges so you read only the sections that matter before expanding scope.",
    "A satisfied explicit range can still report has_more=true when the file continues afterward.",
    "Use 1-based inclusive start_line/end_line for targeted reads.",
    "Successful result paths are normalized to workspace-relative paths even when the request used an absolute in-workspace path.",
    "Files at or above the very-large-file threshold require an explicit range. Smaller files may still be automatically truncated by per-file line/byte/token budgets; prefer search_files before targeted reads when location is unknown."
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        description: "Files to read. Independent files should be requested together.",
        items: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "File path inside allowed roots on this OpenCode host. Workspace-relative is preferred for opened projects; use an absolute path for an allowed external target."
            },
            start_line: {
              type: "integer",
              minimum: 1,
              description: "Optional 1-based inclusive first line."
            },
            end_line: {
              type: "integer",
              minimum: 1,
              description: "Optional 1-based inclusive last line."
            }
          },
          required: ["path"],
          additionalProperties: false
        }
      }
    },
    required: ["files"],
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string" },
            status: { type: "string", enum: ["success", "error", "skipped"] },
            content: { type: "string" },
            start_line: { type: "integer" },
            end_line: { type: ["integer", "null"] },
            total_lines: { type: "integer" },
            truncated: { type: "boolean" },
            has_more: { type: "boolean" },
            next_start_line: { type: ["integer", "null"] },
            size_bytes: { type: "integer" },
            version: { type: "string" },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" }
              },
              additionalProperties: true
            }
          },
          required: ["path", "status"],
          additionalProperties: true
        }
      },
      summary: {
        type: "object",
        properties: {
          requested: { type: "integer" },
          succeeded: { type: "integer" },
          failed: { type: "integer" },
          skipped: { type: "integer" },
          truncated: { type: "integer" }
        },
        required: ["requested", "succeeded", "failed"],
        additionalProperties: true
      }
    },
    required: ["files", "summary"],
    additionalProperties: true
  },
  annotations: {
    title: "Read Files",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};

var READ_IMAGE_TOOL = {
  name: "read_image",
  title: "Read Image",
  description: [
    "Read an image file from the allowed roots on this OpenCode host and inspect its visual metadata and content.",
    FILE_TOOL_SCOPE_DESCRIPTION,
    "Supported image formats include PNG, JPEG, GIF, WebP, BMP, SVG, and ICO.",
    "Returns image dimensions (width, height), aspect ratio, format, MIME type, file size, and base64 data URI.",
    "Use this to inspect UI mockups, icons, screenshots, diagrams, and visual assets before implementing or verifying designs."
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        minLength: 1,
        description: "Image path inside allowed roots on this OpenCode host. Workspace-relative is preferred for opened projects; use an absolute path for an allowed external target."
      },
      include_data_uri: {
        type: "boolean",
        description: "Whether to include the base64 data URI in the response. Defaults to true."
      }
    },
    required: ["path"],
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    properties: {
      path: { type: "string" },
      status: { type: "string", enum: ["success", "error"] },
      format: { type: "string" },
      mime_type: { type: "string" },
      width: { type: ["integer", "null"] },
      height: { type: ["integer", "null"] },
      aspect_ratio: { type: ["string", "null"] },
      size_bytes: { type: "integer" },
      size_formatted: { type: "string" },
      data_uri: { type: "string" },
      base64: { type: "string" },
      error: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" }
        },
        required: ["code", "message"],
        additionalProperties: true
      }
    },
    required: ["path", "status"],
    additionalProperties: true
  },
  annotations: {
    title: "Read Image",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};

var FIND_FILES_TOOL = {
  name: "find_files",
  title: "Find Files",
  description: [
    "Find files by path/name glob patterns inside the current workspace; this does not search file contents.",
    "Use find_files for glob-based filename and path discovery inside the workspace. It does not perform typo-tolerant fuzzy matching. If no files match, try broader glob patterns. Use search_files to search file contents.",
    "Batch independent file patterns together in the patterns array instead of making separate calls.",
    "Patterns are evaluated relative to path, which defaults to the current local workspace root opened in OpenCode. Basename-only patterns such as '*.ts' match recursively within that scope. Results are files only, never directories.",
    "Returned file paths and the reported scope are normalized to workspace-relative paths even when path was supplied as an absolute in-workspace directory.",
    "By default matching is case-insensitive, ignored/common generated directories and hidden paths are skipped, and results are sorted by modification time newest first.",
    "Use exclude for additional path globs, include_hidden/no_ignore only when those files are intentionally needed, and sort='path_asc' when deterministic path order matters.",
    FILE_TOOL_SCOPE_DESCRIPTION,
    "Results are hard-bounded: at most 5000 candidate paths are collected internally before sorting, and by default only 100 paths are returned (hard maximum 500). If truncated=true, narrow path/patterns before increasing max_results."
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      patterns: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        items: { type: "string", minLength: 1 },
        description: "One or more glob patterns to find in a single call, e.g. ['**/*-files.ts', '**/mcp-server.ts']."
      },
      path: {
        type: "string",
        description: "Optional directory scope inside allowed roots on this OpenCode host. Use an absolute path for an allowed external target. Defaults to '.' in the open workspace."
      },
      exclude: {
        type: "array",
        maxItems: 50,
        items: { type: "string", minLength: 1 },
        description: "Optional glob patterns to exclude, evaluated relative to the requested path scope."
      },
      case_sensitive: {
        type: "boolean",
        description: "Whether glob matching is case-sensitive. Defaults to false."
      },
      no_ignore: {
        type: "boolean",
        description: "Set true to bypass ignore files/common generated-directory excludes. Defaults to false."
      },
      include_hidden: {
        type: "boolean",
        description: "Set true to include hidden files/directories. Defaults to false."
      },
      max_results: {
        type: "integer",
        minimum: 1,
        maximum: 500,
        description: "Maximum file paths returned. Defaults to 100; hard maximum 500."
      },
      sort: {
        type: "string",
        enum: ["modified_desc", "path_asc"],
        description: "Result order. Defaults to modified_desc (newest first); path_asc gives deterministic lexical order."
      }
    },
    required: ["patterns"],
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    properties: {
      patterns: { type: "array", items: { type: "string" } },
      scope: { type: "string" },
      engine: { type: "string", enum: ["ripgrep", "node"] },
      sort: { type: "string", enum: ["modified_desc", "path_asc"] },
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string" },
            size_bytes: { type: "integer" },
            modified_ms: { type: "number" }
          },
          required: ["path"],
          additionalProperties: true
        }
      },
      summary: {
        type: "object",
        properties: {
          candidate_paths: { type: "integer" },
          returned_files: { type: "integer" },
          truncated: { type: "boolean" },
          truncation_reasons: { type: "array", items: { type: "string" } }
        },
        additionalProperties: true
      }
    },
    required: ["patterns", "scope", "files", "summary"],
    additionalProperties: true
  },
  annotations: {
    title: "Find Files",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};

var SEARCH_FILES_TOOL = {
  name: "search_files",
  title: "Search Files",
  description: [
    "Search UTF-8 text file contents inside allowed roots and return bounded path/line/snippet matches.",
    "Use this to locate relevant code before calling read_files.",
    "Use this to narrow large files to the relevant regions before broader reads or edits.",
    FILE_TOOL_SCOPE_DESCRIPTION,
    "Literal search is the default; set is_regex=true only when regular-expression semantics are required.",
    "Omit case_sensitive for smart-case (lowercase patterns are case-insensitive; uppercase makes the search case-sensitive).",
    "Use path to narrow the directory/file scope and include/exclude glob arrays to filter files.",
    "Returned match paths and the reported scope are normalized to workspace-relative paths even when path was supplied as an absolute in-workspace path.",
    "context_lines returns nearby lines for disambiguation; keep it small because search is for locating code, not reading whole files.",
    "Results are hard-bounded by per-file/global/output budgets. If truncated=true, narrow the query and search again.",
    "By default ignored/common generated directories and hidden paths are skipped."
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        minLength: 1,
        description: "Text or regex pattern to search for. Literal text by default."
      },
      path: {
        type: "string",
        description: "Optional file or directory scope inside allowed roots on this OpenCode host. Use an absolute path for an allowed external target. Defaults to '.' in the open workspace."
      },
      is_regex: {
        type: "boolean",
        description: "Set true to interpret pattern as a regular expression. Defaults to false (literal search)."
      },
      case_sensitive: {
        type: "boolean",
        description: "Optional case mode. true=sensitive, false=insensitive, omitted=smart-case."
      },
      include: {
        type: "array",
        items: { type: "string", minLength: 1 },
        description: "Optional glob filters evaluated relative to the requested path scope, e.g. ['**/*.ts', '**/*.tsx']."
      },
      exclude: {
        type: "array",
        items: { type: "string", minLength: 1 },
        description: "Optional glob filters evaluated relative to the requested path scope, e.g. ['**/*.test.ts']."
      },
      context_lines: {
        type: "integer",
        minimum: 0,
        maximum: 20,
        description: "Surrounding lines on each side of each match. Defaults to 1, maximum 20."
      },
      max_results: {
        type: "integer",
        minimum: 1,
        maximum: 500,
        description: "Maximum matches returned across the call. Defaults to 100; hard maximum 500."
      },
      max_matches_per_file: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Maximum matches returned from one file. Defaults to 20; hard maximum 100."
      },
      no_ignore: {
        type: "boolean",
        description: "Set true to ignore .gitignore/common excludes. Defaults to false."
      },
      include_hidden: {
        type: "boolean",
        description: "Set true to include hidden files/directories. Defaults to false."
      }
    },
    required: ["pattern"],
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    properties: {
      pattern: { type: "string" },
      mode: { type: "string", enum: ["literal", "regex"] },
      case_mode: { type: "string", enum: ["sensitive", "insensitive", "smart"] },
      scope: { type: "string" },
      engine: { type: "string", enum: ["ripgrep", "node"] },
      matches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string" },
            line: { type: "integer" },
            column: { type: "integer" },
            text: { type: "string" },
            before: { type: "array", items: { type: "object", additionalProperties: true } },
            after: { type: "array", items: { type: "object", additionalProperties: true } }
          },
          required: ["path", "line", "column", "text"],
          additionalProperties: true
        }
      },
      summary: {
        type: "object",
        properties: {
          returned_matches: { type: "integer" },
          files_with_matches: { type: "integer" },
          truncated: { type: "boolean" }
        },
        additionalProperties: true
      }
    },
    required: ["pattern", "matches", "summary"],
    additionalProperties: true
  },
  annotations: {
    title: "Search Files",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};

var FILE_TOOL_DEFINITIONS = [
  APPLY_PATCH_TOOL,
  FIND_FILES_TOOL,
  READ_FILES_TOOL,
  READ_IMAGE_TOOL,
  SEARCH_FILES_TOOL
];

var FILE_TOOL_NAMES = FILE_TOOL_DEFINITIONS.map((tool) => tool.name);
export { APPLY_PATCH_TOOL, READ_FILES_TOOL, READ_IMAGE_TOOL, FIND_FILES_TOOL, SEARCH_FILES_TOOL, FILE_TOOL_DEFINITIONS, FILE_TOOL_NAMES };
