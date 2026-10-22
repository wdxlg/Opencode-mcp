// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionItem.ts
import { SimpleCompletionItem } from "./module-1275.mjs";
import { basename } from "./module-0026.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionItem.ts
function mapLspKindToTerminalKind(lspKind) {
  switch (lspKind) {
    case 20 /* File */:
      return 0 /* File */;
    case 23 /* Folder */:
      return 1 /* Folder */;
    case 0 /* Method */:
      return 2 /* Method */;
    case 18 /* Text */:
      return 4 /* Argument */;
    // consider adding new type?
    case 4 /* Variable */:
      return 4 /* Argument */;
    // ""
    case 16 /* EnumMember */:
      return 6 /* OptionValue */;
    // ""
    case 17 /* Keyword */:
      return 3 /* Alias */;
    default:
      return 2 /* Method */;
  }
}

var TerminalCompletionItem = class extends SimpleCompletionItem {
  constructor(completion, pathSeparator) {
    super(completion);
    this.completion = completion;
    /**
     * The file extension part from {@link labelLow}.
     */
    this.fileExtLow = "";
    /**
     * A penalty that applies to completions that are comprised of only punctuation characters or
     * that applies to files or folders starting with the underscore character.
     */
    this.punctuationPenalty = 0;
    const detectedSeparator = pathSeparator ?? (this.labelLow.includes("\\") ? "\\" : void 0);
    const useWindowsStylePath = detectedSeparator === "\\";
    this.labelLowExcludeFileExt = this.labelLow;
    this.labelLowNormalizedPath = this.labelLow;
    if (isFile(completion) || completion.kind === 11 /* Branch */) {
      if (useWindowsStylePath) {
        this.labelLow = this.labelLow.replaceAll("/", "\\");
      }
    }
    if (isFile(completion)) {
      const extIndex = this.labelLow.lastIndexOf(".");
      if (extIndex > 0) {
        this.labelLowExcludeFileExt = this.labelLow.substring(0, extIndex);
        this.fileExtLow = this.labelLow.substring(extIndex + 1);
      }
    }
    if (isFile(completion) || completion.kind === 1 /* Folder */) {
      if (useWindowsStylePath) {
        this.labelLowNormalizedPath = this.labelLow.replaceAll("\\", "/");
      }
      if (completion.kind === 1 /* Folder */) {
        this.labelLowNormalizedPath = this.labelLowNormalizedPath.replace(/\/$/, "");
      }
    }
    this.punctuationPenalty = shouldPenalizeForPunctuation(this.labelLowExcludeFileExt) ? 1 : 0;
  }
  /**
   * Resolves the completion item's details lazily when needed.
   */
  async resolve(token) {
    if (this.resolveCache) {
      return this.resolveCache;
    }
    const unresolvedItem = this.completion._unresolvedItem;
    const provider = this.completion._resolveProvider;
    if (!unresolvedItem || !provider || !provider.resolveCompletionItem) {
      return;
    }
    this.resolveCache = (async () => {
      try {
        const resolved = await provider.resolveCompletionItem(unresolvedItem, token);
        if (resolved) {
          if (resolved.detail) {
            this.completion.detail = resolved.detail;
          }
          if (resolved.documentation) {
            this.completion.documentation = resolved.documentation;
          }
        }
      } catch (error) {
        return;
      }
    })();
    return this.resolveCache;
  }
};

function isFile(completion) {
  return !!(completion.kind === 0 /* File */ || completion.isFileOverride);
}

function shouldPenalizeForPunctuation(label3) {
  return basename(label3).startsWith("_") || /^[\[\]\{\}\(\)\.,;:!?\/\\\-_@#~*%^=$]+$/.test(label3);
}
export { mapLspKindToTerminalKind, isFile, shouldPenalizeForPunctuation, TerminalCompletionItem };
