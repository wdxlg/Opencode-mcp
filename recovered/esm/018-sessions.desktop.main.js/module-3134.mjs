// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/treeSitterCommandParser.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { SedFileWriteParser } from "./module-3133.mjs";
import { Lazy } from "./module-0028.mjs";
import { shouldRequireConfirmationForAutoApproveParse } from "./module-3132.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { BugIndicatingError, ErrorNoTelemetry } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITreeSitterLibraryService } from "./module-0417.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/treeSitterCommandParser.ts
var pwshFlagEqualsRegex = /(^|\s)(-{1,2}[\w-]+)=/g;

var envOptionsWithValue = /* @__PURE__ */ new Set(["-u", "--unset", "-C", "--chdir", "-a", "--argv0"]);

function maskPwshFlagEquals(commandLine) {
  return commandLine.replace(pwshFlagEqualsRegex, (_, pre, flag) => `${pre}${flag} `);
}

var TreeSitterCommandParser = class extends Disposable {
  constructor(_treeSitterLibraryService) {
    super();
    this._treeSitterLibraryService = _treeSitterLibraryService;
    this._treeCache = this._register(new TreeCache());
    this._commandFileWriteParsers = [
      new SedFileWriteParser()
    ];
    this._parser = new Lazy(() => this._treeSitterLibraryService.getParserClass().then((ParserCtor) => new ParserCtor()));
  }
  async extractSubCommands(languageId, commandLine) {
    if (languageId === "powershell" /* PowerShell */) {
      const masked = maskPwshFlagEquals(commandLine);
      if (masked !== commandLine) {
        const captures2 = await this._queryTree(languageId, masked, "(command) @command");
        return captures2.map((e4) => commandLine.substring(e4.node.startIndex, e4.node.endIndex));
      }
    }
    const captures = await this._queryTree(languageId, commandLine, "(command) @command");
    return captures.map((e4) => e4.node.text);
  }
  async extractAutoApprovalSubCommands(languageId, commandLine) {
    const masked = languageId === "powershell" /* PowerShell */ ? maskPwshFlagEquals(commandLine) : commandLine;
    const querySource = languageId === "powershell" /* PowerShell */ ? "(command) @command (assignment_expression) @unanalyzable (invokation_expression) @unanalyzable" : "(command) @command (variable_assignment) @unanalyzable (declaration_command) @unanalyzable";
    const { captures, hasError } = await this._queryTreeWithParseStatus(languageId, masked, querySource);
    const subCommands = [];
    let hasUnanalyzableSyntax = false;
    for (const capture of captures) {
      if (capture.name === "command") {
        subCommands.push(masked === commandLine ? capture.node.text : commandLine.substring(capture.node.startIndex, capture.node.endIndex));
      } else if (capture.name === "unanalyzable") {
        if (capture.node.type !== "variable_assignment" || capture.node.parent?.type !== "command") {
          hasUnanalyzableSyntax = true;
        }
      }
    }
    hasUnanalyzableSyntax ||= shouldRequireConfirmationForAutoApproveParse(
      languageId === "powershell" /* PowerShell */ ? "powershell" : "bash",
      hasError
    );
    return { subCommands, hasUnanalyzableSyntax };
  }
  async extractPwshDoubleAmpersandChainOperators(commandLine) {
    const captures = await this._queryTree("powershell" /* PowerShell */, commandLine, [
      "(",
      "  (pipeline",
      "    (pipeline_chain_tail) @double.ampersand)",
      ")"
    ].join("\n"));
    return captures;
  }
  /**
   * Extracts executable command invocations from the command line and returns
   * normalized command details for sandbox allow-listing.
   *
   * Example: `PATH=/bin /usr/bin/git commit -S -m "test" && npm install`
   * returns:
   * `[
   * 	{ keyword: 'git', args: ['commit', '-S', '-m', 'test'] },
   * 	{ keyword: 'npm', args: ['install'] }
   * ]`.
   */
  async extractCommands(languageId, commandLine) {
    const commands = [];
    for (const commandText of await this.extractSubCommands(languageId, commandLine)) {
      const command4 = this._parseCommand(commandText);
      if (command4) {
        commands.push(command4);
      }
    }
    return commands;
  }
  async getFileWrites(languageId, commandLine) {
    let query;
    switch (languageId) {
      case "bash" /* Bash */:
        query = [
          "(file_redirect",
          "  destination: [(word) (string (string_content)) (raw_string) (concatenation)] @file)"
        ].join("\n");
        break;
      case "powershell" /* PowerShell */:
        query = [
          "(redirection",
          "  (redirected_file_name) @file)"
        ].join("\n");
        break;
    }
    const captures = await this._queryTree(languageId, commandLine, query);
    return captures.map((e4) => e4.node.text.trim());
  }
  /**
   * Extracts file targets from commands that perform file writes beyond shell redirections.
   * Uses registered command parsers (e.g., for `sed -i`) to detect command-specific file writes.
   * Returns an array of file paths that would be modified.
   */
  async getCommandFileWrites(languageId, commandLine) {
    if (languageId !== "bash" /* Bash */) {
      return [];
    }
    const query = "(command) @command";
    const captures = await this._queryTree(languageId, commandLine, query);
    const result = [];
    for (const capture of captures) {
      const commandText = capture.node.text;
      for (const parser2 of this._commandFileWriteParsers) {
        if (parser2.canHandle(commandText)) {
          result.push(...parser2.extractFileWrites(commandText));
        }
      }
    }
    return result;
  }
  async _queryTree(languageId, commandLine, querySource) {
    const { tree, query } = await this._doQuery(languageId, commandLine, querySource);
    try {
      return query.captures(tree.rootNode);
    } finally {
      query.delete();
    }
  }
  async _queryTreeWithParseStatus(languageId, commandLine, querySource) {
    const { tree, query } = await this._doQuery(languageId, commandLine, querySource);
    try {
      return {
        captures: query.captures(tree.rootNode),
        hasError: tree.rootNode.hasError
      };
    } finally {
      query.delete();
    }
  }
  /**
   * Converts a command token to the stable keyword used by sandbox allow-list
   * rules by stripping quotes, path segments, and common executable suffixes.
   */
  _normalizeCommandKeyword(token) {
    const unquoted = token.replace(/^['"]|['"]$/g, "");
    if (!unquoted) {
      return void 0;
    }
    const pathBase = unquoted.includes("\\") ? win32.basename(unquoted) : posix.basename(unquoted);
    const normalized = pathBase.toLowerCase().replace(/\.(?:exe|cmd|bat|ps1)$/i, "");
    return normalized || void 0;
  }
  /**
   * Parses a single tree-sitter command node into command details, ignoring
   * leading environment variable assignments such as `NODE_ENV=test npm run build`.
   */
  _parseCommand(commandText) {
    const tokens = this._splitCommandTokens(commandText);
    let commandIndex = 0;
    while (commandIndex < tokens.length && this._isVariableAssignment(tokens[commandIndex])) {
      commandIndex++;
    }
    let keyword = this._normalizeCommandKeyword(tokens[commandIndex] ?? "");
    if (!keyword) {
      return void 0;
    }
    if (keyword === "env") {
      const wrappedCommandIndex = this._getEnvWrappedCommandIndex(tokens, commandIndex + 1);
      if (wrappedCommandIndex !== void 0) {
        commandIndex = wrappedCommandIndex;
        keyword = this._normalizeCommandKeyword(tokens[commandIndex] ?? "");
        if (!keyword) {
          return void 0;
        }
      }
    }
    return {
      keyword,
      args: tokens.slice(commandIndex + 1)
    };
  }
  _getEnvWrappedCommandIndex(tokens, startIndex) {
    for (let i2 = startIndex; i2 < tokens.length; i2++) {
      const token = tokens[i2];
      if (this._isVariableAssignment(token)) {
        continue;
      }
      if (token === "--") {
        return i2 + 1 < tokens.length ? i2 + 1 : void 0;
      }
      if (token === "-" || token.startsWith("-")) {
        const option2 = token.includes("=") ? token.substring(0, token.indexOf("=")) : token;
        if (!token.includes("=") && envOptionsWithValue.has(option2)) {
          i2++;
        }
        continue;
      }
      return i2;
    }
    return void 0;
  }
  /**
   * Splits enough shell syntax for sandbox allow-listing: whitespace separates
   * tokens, quotes are removed, and backslash escapes preserve the escaped char.
   */
  _splitCommandTokens(commandText) {
    const tokens = [];
    let current = "";
    let quote;
    let escaping = false;
    for (const char of commandText.trim()) {
      if (escaping) {
        current += char;
        escaping = false;
        continue;
      }
      if (char === "\\" && quote !== "'") {
        escaping = true;
        continue;
      }
      if (quote) {
        if (char === quote) {
          quote = void 0;
        } else {
          current += char;
        }
        continue;
      }
      if (char === "'" || char === '"') {
        quote = char;
        continue;
      }
      if (/\s/.test(char)) {
        if (current) {
          tokens.push(current);
          current = "";
        }
        continue;
      }
      current += char;
    }
    if (escaping) {
      current += "\\";
    }
    if (current) {
      tokens.push(current);
    }
    return tokens;
  }
  /**
   * Returns true for simple shell-style environment variable assignments that
   * can prefix a command invocation.
   */
  _isVariableAssignment(token) {
    return /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token);
  }
  async _doQuery(languageId, commandLine, querySource) {
    const language2 = await this._treeSitterLibraryService.getLanguagePromise(languageId);
    if (!language2) {
      throw new BugIndicatingError("Failed to fetch language grammar");
    }
    let tree = this._treeCache.get(languageId, commandLine);
    if (!tree) {
      const parser2 = await this._parser.value;
      parser2.setLanguage(language2);
      const parsedTree = parser2.parse(commandLine);
      if (!parsedTree) {
        throw new ErrorNoTelemetry("Failed to parse tree");
      }
      tree = parsedTree;
      this._treeCache.set(languageId, commandLine, tree);
    }
    const query = await this._treeSitterLibraryService.createQuery(language2, querySource);
    if (!query) {
      throw new BugIndicatingError("Failed to create tree sitter query");
    }
    return { tree, query };
  }
};

TreeSitterCommandParser = __decorateClass([
  __decorateParam(0, ITreeSitterLibraryService)
], TreeSitterCommandParser);

var TreeCache = class extends Disposable {
  constructor() {
    super();
    this._cache = /* @__PURE__ */ new Map();
    this._clearScheduler = this._register(new MutableDisposable());
    this._register(toDisposable(() => this._cache.clear()));
  }
  get(languageId, commandLine) {
    this._resetClearTimer();
    return this._cache.get(this._getCacheKey(languageId, commandLine));
  }
  set(languageId, commandLine, tree) {
    this._resetClearTimer();
    this._cache.set(this._getCacheKey(languageId, commandLine), tree);
  }
  _getCacheKey(languageId, commandLine) {
    return `${languageId}:${commandLine}`;
  }
  _resetClearTimer() {
    this._clearScheduler.value = new RunOnceScheduler(() => {
      this._cache.clear();
    }, 1e4);
    this._clearScheduler.value.schedule();
  }
};
export { maskPwshFlagEquals, pwshFlagEqualsRegex, envOptionsWithValue, TreeSitterCommandParser, TreeCache };
