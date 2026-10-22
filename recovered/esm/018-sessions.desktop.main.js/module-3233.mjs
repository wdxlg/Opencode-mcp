// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalSymbolIcons.ts
import { registerColor } from "./module-0226.mjs";
import { SYMBOL_ICON_ENUMERATOR_FOREGROUND, SYMBOL_ICON_ENUMERATOR_MEMBER_FOREGROUND, SYMBOL_ICON_FILE_FOREGROUND, SYMBOL_ICON_FOLDER_FOREGROUND, SYMBOL_ICON_METHOD_FOREGROUND, SYMBOL_ICON_VARIABLE_FOREGROUND } from "./module-0562.mjs";
import { localize } from "./module-0001.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalSymbolIcons.ts
var TERMINAL_SYMBOL_ICON_FLAG_FOREGROUND = registerColor("terminalSymbolIcon.flagForeground", SYMBOL_ICON_ENUMERATOR_FOREGROUND, localize(20908, null));

var TERMINAL_SYMBOL_ICON_ALIAS_FOREGROUND = registerColor("terminalSymbolIcon.aliasForeground", SYMBOL_ICON_METHOD_FOREGROUND, localize(20902, null));

var TERMINAL_SYMBOL_ICON_OPTION_VALUE_FOREGROUND = registerColor("terminalSymbolIcon.optionValueForeground", SYMBOL_ICON_ENUMERATOR_MEMBER_FOREGROUND, localize(20906, null));

var TERMINAL_SYMBOL_ICON_METHOD_FOREGROUND = registerColor("terminalSymbolIcon.methodForeground", SYMBOL_ICON_METHOD_FOREGROUND, localize(20911, null));

var TERMINAL_SYMBOL_ICON_ARGUMENT_FOREGROUND = registerColor("terminalSymbolIcon.argumentForeground", SYMBOL_ICON_VARIABLE_FOREGROUND, localize(20903, null));

var TERMINAL_SYMBOL_ICON_OPTION_FOREGROUND = registerColor("terminalSymbolIcon.optionForeground", SYMBOL_ICON_ENUMERATOR_FOREGROUND, localize(20912, null));

var TERMINAL_SYMBOL_ICON_INLINE_SUGGESTION_FOREGROUND = registerColor("terminalSymbolIcon.inlineSuggestionForeground", null, localize(20910, null));

var TERMINAL_SYMBOL_ICON_FILE_FOREGROUND = registerColor("terminalSymbolIcon.fileForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20907, null));

var TERMINAL_SYMBOL_ICON_FOLDER_FOREGROUND = registerColor("terminalSymbolIcon.folderForeground", SYMBOL_ICON_FOLDER_FOREGROUND, localize(20909, null));

var TERMINAL_SYMBOL_ICON_COMMIT_FOREGROUND = registerColor("terminalSymbolIcon.commitForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20905, null));

var TERMINAL_SYMBOL_ICON_BRANCH_FOREGROUND = registerColor("terminalSymbolIcon.branchForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20904, null));

var TERMINAL_SYMBOL_ICON_TAG_FOREGROUND = registerColor("terminalSymbolIcon.tagForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20920, null));

var TERMINAL_SYMBOL_ICON_STASH_FOREGROUND = registerColor("terminalSymbolIcon.stashForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20916, null));

var TERMINAL_SYMBOL_ICON_REMOTE_FOREGROUND = registerColor("terminalSymbolIcon.remoteForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20915, null));

var TERMINAL_SYMBOL_ICON_PULL_REQUEST_FOREGROUND = registerColor("terminalSymbolIcon.pullRequestForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20914, null));

var TERMINAL_SYMBOL_ICON_PULL_REQUEST_DONE_FOREGROUND = registerColor("terminalSymbolIcon.pullRequestDoneForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20913, null));

var TERMINAL_SYMBOL_ICON_SYMBOLIC_LINK_FILE_FOREGROUND = registerColor("terminalSymbolIcon.symbolicLinkFileForeground", SYMBOL_ICON_FILE_FOREGROUND, localize(20917, null));

var TERMINAL_SYMBOL_ICON_SYMBOLIC_LINK_FOLDER_FOREGROUND = registerColor("terminalSymbolIcon.symbolicLinkFolderForeground", SYMBOL_ICON_FOLDER_FOREGROUND, localize(20918, null));

var TERMINAL_SYMBOL_ICON_SYMBOL_TEXT_FOREGROUND = registerColor("terminalSymbolIcon.symbolText", SYMBOL_ICON_FILE_FOREGROUND, localize(20919, null));

var terminalSymbolFlagIcon = registerIcon("terminal-symbol-flag", Codicon.flag, localize(20900, null), TERMINAL_SYMBOL_ICON_FLAG_FOREGROUND);

var terminalSymbolAliasIcon = registerIcon("terminal-symbol-alias", Codicon.symbolMethod, localize(20895, null), TERMINAL_SYMBOL_ICON_ALIAS_FOREGROUND);

var terminalSymbolEnumMember = registerIcon("terminal-symbol-option-value", Codicon.symbolEnumMember, localize(20924, null), TERMINAL_SYMBOL_ICON_OPTION_VALUE_FOREGROUND);

var terminalSymbolMethodIcon = registerIcon("terminal-symbol-method", Codicon.symbolMethod, localize(20922, null), TERMINAL_SYMBOL_ICON_METHOD_FOREGROUND);

var terminalSymbolArgumentIcon = registerIcon("terminal-symbol-argument", Codicon.symbolVariable, localize(20896, null), TERMINAL_SYMBOL_ICON_ARGUMENT_FOREGROUND);

var terminalSymbolOptionIcon = registerIcon("terminal-symbol-option", Codicon.symbolEnum, localize(20923, null), TERMINAL_SYMBOL_ICON_OPTION_FOREGROUND);

var terminalSymbolInlineSuggestionIcon = registerIcon("terminal-symbol-inline-suggestion", Codicon.star, localize(20921, null), TERMINAL_SYMBOL_ICON_INLINE_SUGGESTION_FOREGROUND);

var terminalSymbolFileIcon = registerIcon("terminal-symbol-file", Codicon.symbolFile, localize(20899, null), TERMINAL_SYMBOL_ICON_FILE_FOREGROUND);

var terminalSymbolFolderIcon = registerIcon("terminal-symbol-folder", Codicon.symbolFolder, localize(20901, null), TERMINAL_SYMBOL_ICON_FOLDER_FOREGROUND);

var terminalSymbolCommitIcon = registerIcon("terminal-symbol-commit", Codicon.gitCommit, localize(20898, null), TERMINAL_SYMBOL_ICON_COMMIT_FOREGROUND);

var terminalSymbolBranchIcon = registerIcon("terminal-symbol-branch", Codicon.gitBranch, localize(20897, null), TERMINAL_SYMBOL_ICON_BRANCH_FOREGROUND);

var terminalSymbolTagIcon = registerIcon("terminal-symbol-tag", Codicon.tag, localize(20932, null), TERMINAL_SYMBOL_ICON_TAG_FOREGROUND);

var terminalSymbolStashIcon = registerIcon("terminal-symbol-stash", Codicon.gitStash, localize(20928, null), TERMINAL_SYMBOL_ICON_STASH_FOREGROUND);

var terminalSymbolRemoteIcon = registerIcon("terminal-symbol-remote", Codicon.remote, localize(20927, null), TERMINAL_SYMBOL_ICON_REMOTE_FOREGROUND);

var terminalSymbolPullRequestIcon = registerIcon("terminal-symbol-pull-request", Codicon.gitPullRequest, localize(20926, null), TERMINAL_SYMBOL_ICON_PULL_REQUEST_FOREGROUND);

var terminalSymbolPullRequestDoneIcon = registerIcon("terminal-symbol-pull-request-done", Codicon.gitPullRequestDone, localize(20925, null), TERMINAL_SYMBOL_ICON_PULL_REQUEST_DONE_FOREGROUND);

var terminalSymbolSymbolicLinkFileIcon = registerIcon("terminal-symbol-symbolic-link-file", Codicon.fileSymlinkFile, localize(20929, null), TERMINAL_SYMBOL_ICON_SYMBOLIC_LINK_FILE_FOREGROUND);

var terminalSymbolSymbolicLinkFolderIcon = registerIcon("terminal-symbol-symbolic-link-folder", Codicon.fileSymlinkDirectory, localize(20930, null), TERMINAL_SYMBOL_ICON_SYMBOLIC_LINK_FOLDER_FOREGROUND);

var terminalSymbolSymbolTextIcon = registerIcon("terminal-symbol-symbol-text", Codicon.symbolKey, localize(20931, null), TERMINAL_SYMBOL_ICON_SYMBOL_TEXT_FOREGROUND);
export { TERMINAL_SYMBOL_ICON_FLAG_FOREGROUND, TERMINAL_SYMBOL_ICON_ALIAS_FOREGROUND, TERMINAL_SYMBOL_ICON_OPTION_VALUE_FOREGROUND, TERMINAL_SYMBOL_ICON_METHOD_FOREGROUND, TERMINAL_SYMBOL_ICON_ARGUMENT_FOREGROUND, TERMINAL_SYMBOL_ICON_OPTION_FOREGROUND, TERMINAL_SYMBOL_ICON_INLINE_SUGGESTION_FOREGROUND, TERMINAL_SYMBOL_ICON_FILE_FOREGROUND, TERMINAL_SYMBOL_ICON_FOLDER_FOREGROUND, TERMINAL_SYMBOL_ICON_COMMIT_FOREGROUND, TERMINAL_SYMBOL_ICON_BRANCH_FOREGROUND, TERMINAL_SYMBOL_ICON_TAG_FOREGROUND, TERMINAL_SYMBOL_ICON_STASH_FOREGROUND, TERMINAL_SYMBOL_ICON_REMOTE_FOREGROUND, TERMINAL_SYMBOL_ICON_PULL_REQUEST_FOREGROUND, TERMINAL_SYMBOL_ICON_PULL_REQUEST_DONE_FOREGROUND, TERMINAL_SYMBOL_ICON_SYMBOLIC_LINK_FILE_FOREGROUND, TERMINAL_SYMBOL_ICON_SYMBOLIC_LINK_FOLDER_FOREGROUND, TERMINAL_SYMBOL_ICON_SYMBOL_TEXT_FOREGROUND, terminalSymbolFlagIcon, terminalSymbolAliasIcon, terminalSymbolEnumMember, terminalSymbolMethodIcon, terminalSymbolArgumentIcon, terminalSymbolOptionIcon, terminalSymbolInlineSuggestionIcon, terminalSymbolFileIcon, terminalSymbolFolderIcon, terminalSymbolCommitIcon, terminalSymbolBranchIcon, terminalSymbolTagIcon, terminalSymbolStashIcon, terminalSymbolRemoteIcon, terminalSymbolPullRequestIcon, terminalSymbolPullRequestDoneIcon, terminalSymbolSymbolicLinkFileIcon, terminalSymbolSymbolicLinkFolderIcon, terminalSymbolSymbolTextIcon };
