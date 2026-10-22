// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/consoleCompactor/consoleCompactor.ts



// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/consoleCompactor/consoleCompactor.ts
var DEFAULT_LARGE_OUTPUT_THRESHOLD = 3e4;

var DEFAULT_SHELL_GREP_LARGE_OUTPUT_THRESHOLD = 3e4;

var DEFAULT_MIN_SAVED_CHARS = 0;

function compact(command4, output, options3) {
  const opts = options3 ?? {};
  const largeOutputThreshold = opts.largeOutputThreshold ?? DEFAULT_LARGE_OUTPUT_THRESHOLD;
  const shellGrepLargeOutputThreshold = opts.shellGrepLargeOutputThreshold ?? DEFAULT_SHELL_GREP_LARGE_OUTPUT_THRESHOLD;
  const minimumSavedChars = opts.minSavedChars ?? DEFAULT_MIN_SAVED_CHARS;
  const classification = classifyCommandResult(command4);
  const preview = previewShellOutputCompaction(
    command4,
    output,
    largeOutputThreshold,
    shellGrepLargeOutputThreshold,
    minimumSavedChars
  );
  return buildReport(command4, classification, output, preview);
}

var textEncoder2 = new TextEncoder();

function byteLength(value2) {
  return textEncoder2.encode(value2).length;
}

function countLines3(text2) {
  if (text2.length === 0) {
    return 0;
  }
  let count2 = text2.split("\n").length;
  if (text2.endsWith("\n")) {
    count2 -= 1;
  }
  return count2;
}

function countsOf(text2) {
  return {
    chars: text2.length,
    bytes: byteLength(text2),
    lines: countLines3(text2)
  };
}

function minusCounts(self2, other) {
  return {
    chars: saturatingSub(self2.chars, other.chars),
    bytes: saturatingSub(self2.bytes, other.bytes),
    lines: saturatingSub(self2.lines, other.lines)
  };
}

function reductionOf(saved, original) {
  return {
    charsPct: pct(saved.chars, original.chars),
    bytesPct: pct(saved.bytes, original.bytes),
    linesPct: pct(saved.lines, original.lines)
  };
}

function pct(part, whole) {
  if (whole === 0) {
    return 0;
  }
  return part / whole * 100;
}

function buildReport(command4, classification, original, preview) {
  const compactedText = preview ? preview.output : original;
  const originalCounts = countsOf(original);
  const compactedCounts = countsOf(compactedText);
  const saved = minusCounts(originalCounts, compactedCounts);
  const reduction = reductionOf(saved, originalCounts);
  return {
    command: command4,
    applied: preview !== void 0,
    lossless: preview === void 0 ? true : preview.lossless,
    commandKinds: classification.commandKinds.slice(),
    isSourceReadCommand: classification.isSourceReadCommand,
    runsGoTest: classification.runsGoTest,
    mentionsSavedToolOutput: classification.mentionsSavedToolOutput,
    original: originalCounts,
    compacted: compactedCounts,
    saved,
    reduction,
    compactedOutput: compactedText
  };
}

var COMPACTED_REFERENCE_OVERHEAD_BUDGET = 512;

var COMMON_PREFIX_DISPLAY_WIDTH = 120;

var EXTENSION_SUMMARY_INLINE_WIDTH = 160;

var GO_RUNTIME_PANIC_MIN_GOROUTINES = 8;

var CARGO_PROGRESS_PREFIXES = [
  "Updating ",
  "Downloading ",
  "Downloaded ",
  "Compiling ",
  "Checking ",
  "Fresh ",
  "Locking ",
  "Adding ",
  "Building "
];

var COMMAND_COMPACTOR_ORDER = [
  "apt",
  "npm",
  "npm-pack",
  "yarn-berry",
  "pnpm",
  "composer",
  "poetry",
  "pip",
  "uv",
  "maven",
  "dotnet",
  "python-build",
  "go",
  "unittest",
  "js-test",
  "cargo",
  "node",
  "pytest",
  "git",
  "git-clean",
  "nx",
  "python-build-ext",
  "django-test",
  "golangci-lint",
  "clang-format-linter",
  "gradle",
  "cmake",
  "make",
  "shell-grep",
  "python-script"
];

var BENIGN_SEGMENT = { benign: true };

function compactSegment(kind) {
  return { benign: false, kind };
}

function segmentsEqual(a, b) {
  if (a.benign || b.benign) {
    return a.benign === b.benign;
  }
  return a.kind === b.kind;
}

function jsStringLen(value2) {
  return value2.length;
}

function sliceJsUnits(text2, start, len) {
  if (len === 0) {
    return "";
  }
  return text2.slice(start, start + len);
}

function splitWhitespace(value2) {
  const trimmed = value2.trim();
  return trimmed.length === 0 ? [] : trimmed.split(/\s+/);
}

function saturatingSub(a, b) {
  return a > b ? a - b : 0;
}

function arraySliceEqual(arr, aStart, bStart, len) {
  for (let k = 0; k < len; k++) {
    if (arr[aStart + k] !== arr[bStart + k]) {
      return false;
    }
  }
  return true;
}

function isAsciiDigit2(ch) {
  return ch >= "0" && ch <= "9";
}

function isAsciiAlphabetic(ch) {
  return ch >= "A" && ch <= "Z" || ch >= "a" && ch <= "z";
}

function trimStartMatchesChars(value2, chars) {
  let i2 = 0;
  while (i2 < value2.length && chars.includes(value2[i2])) {
    i2 += 1;
  }
  return value2.slice(i2);
}

function regexReplaceAll(pattern, input, replacement) {
  return input.replace(new RegExp(pattern, "g"), replacement);
}

function regexTest(pattern, input) {
  return regexTestWithFlags(pattern, input, "");
}

function regexTestWithFlags(pattern, input, flags) {
  return new RegExp(pattern, flags).test(input);
}

function regexFind(pattern, input) {
  const match2 = new RegExp(pattern).exec(input);
  return match2 ? match2.index : void 0;
}

function regexCaptureFirst(pattern, input) {
  const match2 = new RegExp(pattern).exec(input);
  if (match2 && match2[1] !== void 0) {
    return match2[1];
  }
  return void 0;
}

function regexFindAll(pattern, input) {
  const regex = new RegExp(pattern, "g");
  const matches2 = [];
  let match2;
  while ((match2 = regex.exec(input)) !== null) {
    matches2.push({ start: match2.index, end: match2.index + match2[0].length });
    if (match2[0].length === 0) {
      regex.lastIndex += 1;
    }
  }
  return matches2;
}

function unchanged(output) {
  return { output, lossless: true };
}

function lossy(output) {
  return { output, lossless: false };
}

function indexAll(items) {
  return items.map((item, index2) => ({ index: index2, item }));
}

function joinedLineBytes(lines) {
  let total = 0;
  for (const line of lines) {
    total += byteLength(line);
  }
  return total + saturatingSub(lines.length, 1);
}

function shouldSkipToolOutputCompaction(lines, output, minLines) {
  return lines.length < minLines || lines.length > 2e5 || jsStringLen(output) < 1500 || lines.some((line) => line.startsWith("Error:") || line.startsWith("rg: ") || line.startsWith("grep: "));
}

function fitsLargeOutputThreshold(output, largeOutputThreshold) {
  return byteLength(output) <= largeOutputThreshold;
}

function compactedBodyBudget(largeOutputThreshold) {
  return Math.max(256, saturatingSub(largeOutputThreshold, COMPACTED_REFERENCE_OVERHEAD_BUDGET));
}

function totalGroupItems(groups) {
  let total = 0;
  for (const [, items] of groups) {
    total += items.length;
  }
  return total;
}

function truncateInlineText(text2, maxLength) {
  const normalized = normalizeInlineWhitespace(text2);
  const normalizedLen = jsStringLen(normalized);
  if (normalizedLen <= maxLength) {
    return normalized;
  }
  const suffix = `... [+${normalizedLen - maxLength} chars]`;
  return `${sliceJsUnits(normalized, 0, saturatingSub(maxLength, suffix.length))}${suffix}`;
}

function excerptInlineText(text2, maxLength) {
  const normalized = normalizeInlineWhitespace(text2);
  const normalizedLen = jsStringLen(normalized);
  if (normalizedLen <= maxLength) {
    return normalized;
  }
  const markerIndex = highSignalTextIndex(normalized);
  if (markerIndex !== void 0) {
    return excerptAroundIndex(normalized, maxLength, markerIndex);
  }
  const separator2 = ` ... [+${normalizedLen - maxLength} chars] ... `;
  const available = saturatingSub(maxLength, separator2.length);
  const headLength = Math.ceil(available / 2);
  const tailLength = Math.floor(available / 2);
  return `${sliceJsUnits(normalized, 0, headLength)}${separator2}${sliceJsUnits(normalized, saturatingSub(normalizedLen, tailLength), tailLength)}`;
}

function normalizeInlineWhitespace(text2) {
  return splitWhitespace(text2).join(" ");
}

function highSignalTextIndex(text2) {
  return regexFind(
    String.raw`\b(?:HF_TOKEN|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SECRET|TOKEN|FINAL_EXIT|RESULT|BEST|Accuracy|Model size|AssertionError|FAIL|ERROR|Rank)\b|hf_[A-Za-z0-9_]+|u=a1[A-Za-z0-9_-]+|https?://`,
    text2
  );
}

function excerptAroundIndex(text2, maxLength, index2) {
  const prefix = index2 > 0 ? "... " : "";
  const textLen = jsStringLen(text2);
  const indexUnits = index2;
  const suffix = indexUnits + maxLength < textLen ? " ..." : "";
  const available = saturatingSub(maxLength, prefix.length + suffix.length);
  const start = Math.min(saturatingSub(indexUnits, Math.floor(available / 2)), saturatingSub(textLen, available));
  return `${prefix}${sliceJsUnits(text2, start, available)}${suffix}`;
}

function truncatePathMiddle(inputPath, maxLength) {
  if (jsStringLen(inputPath) <= maxLength) {
    return inputPath;
  }
  const ellipsis2 = "...";
  const minTruncateWithEllipsisLength = ellipsis2.length + 2;
  const minMiddleTruncateLength = minTruncateWithEllipsisLength * 2;
  if (maxLength <= minTruncateWithEllipsisLength) {
    return sliceJsUnits(inputPath, 0, maxLength);
  }
  if (maxLength < minMiddleTruncateLength) {
    return `${sliceJsUnits(inputPath, 0, maxLength - ellipsis2.length)}${ellipsis2}`;
  }
  const separator2 = inputPath.includes("\\") && !inputPath.includes("/") ? "\\" : "/";
  const [root, segments] = getPathPartsForMiddleTruncation(inputPath, separator2);
  const minSegmentsForMiddleTruncation = root.length === 0 ? 3 : 2;
  if (segments.length < minSegmentsForMiddleTruncation) {
    return `${sliceJsUnits(inputPath, 0, maxLength - ellipsis2.length)}${ellipsis2}`;
  }
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : "";
  const preservedSegmentCount = root.length === 0 ? 1 : 0;
  const minResult = root.length === 0 ? `${segments[0]}${separator2}${ellipsis2}${separator2}${lastSegment}` : `${root}${ellipsis2}${separator2}${lastSegment}`;
  if (jsStringLen(minResult) > maxLength) {
    return `${sliceJsUnits(inputPath, 0, maxLength - ellipsis2.length)}${ellipsis2}`;
  }
  let result = minResult;
  const middleSegments = segments.slice(preservedSegmentCount, segments.length - 1);
  for (let i2 = 0; i2 < middleSegments.length; i2++) {
    const preservedSegments = segments.slice(0, preservedSegmentCount + i2 + 1);
    const prefix = root.length === 0 ? preservedSegments.join(separator2) : `${root}${preservedSegments.join(separator2)}`;
    const candidate = `${prefix}${separator2}${ellipsis2}${separator2}${lastSegment}`;
    if (jsStringLen(candidate) <= maxLength) {
      result = candidate;
    } else {
      break;
    }
  }
  return result;
}

function getPathPartsForMiddleTruncation(inputPath, separator2) {
  if (inputPath.length >= 2 && isAsciiAlphabetic(inputPath[0]) && inputPath[1] === ":") {
    let end = 2;
    while (end < inputPath.length && (inputPath[end] === "/" || inputPath[end] === "\\")) {
      end += 1;
    }
    const root = end > 2 ? `${inputPath.slice(0, 2)}${separator2}` : inputPath.slice(0, 2);
    return [root, splitPathSegments(inputPath.slice(end))];
  }
  if (inputPath.startsWith("\\\\") || inputPath.startsWith("//")) {
    const uncSegments = splitPathSegments(trimStartMatchesChars(inputPath, ["\\", "/"]));
    if (uncSegments.length >= 2) {
      return [
        `${separator2}${separator2}${uncSegments[0]}${separator2}${uncSegments[1]}${separator2}`,
        uncSegments.slice(2)
      ];
    }
  }
  if (inputPath.startsWith("\\") || inputPath.startsWith("/")) {
    return [separator2, splitPathSegments(trimStartMatchesChars(inputPath, ["\\", "/"]))];
  }
  return ["", splitPathSegments(inputPath)];
}

function splitPathSegments(inputPath) {
  return inputPath.split(/[\\/]/).filter((part) => part.length > 0);
}

function naturalCmp(a, b) {
  const aChars = Array.from(a);
  const bChars = Array.from(b);
  let ai = 0;
  let bi = 0;
  for (; ; ) {
    const ac = ai < aChars.length ? aChars[ai] : void 0;
    const bc = bi < bChars.length ? bChars[bi] : void 0;
    if (ac === void 0 && bc === void 0) {
      return 0;
    }
    if (ac === void 0) {
      return -1;
    }
    if (bc === void 0) {
      return 1;
    }
    if (isAsciiDigit2(ac) && isAsciiDigit2(bc)) {
      let aNumber = "";
      while (ai < aChars.length && isAsciiDigit2(aChars[ai])) {
        aNumber += aChars[ai];
        ai += 1;
      }
      let bNumber = "";
      while (bi < bChars.length && isAsciiDigit2(bChars[bi])) {
        bNumber += bChars[bi];
        bi += 1;
      }
      const aTrimmed = aNumber.replace(/^0+/, "");
      const bTrimmed = bNumber.replace(/^0+/, "");
      let ord = compareNumber(aTrimmed.length, bTrimmed.length);
      if (ord === 0) {
        ord = compareString(aTrimmed, bTrimmed);
      }
      if (ord === 0) {
        ord = compareNumber(aNumber.length, bNumber.length);
      }
      if (ord !== 0) {
        return ord;
      }
    } else {
      ai += 1;
      bi += 1;
      const ord = compareCodePoint(ac, bc);
      if (ord !== 0) {
        return ord;
      }
    }
  }
}

function compareNumber(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareString(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareCodePoint(a, b) {
  const ac = a.codePointAt(0) ?? 0;
  const bc = b.codePointAt(0) ?? 0;
  return compareNumber(ac, bc);
}

function classifyCommandResult(command4) {
  return {
    commandKinds: classifyCommandKinds(command4),
    isSourceReadCommand: isShellSourceReadCommand(command4),
    runsGoTest: commandRunsGoTest(command4),
    mentionsSavedToolOutput: commandMentionsSavedToolOutput(command4)
  };
}

function previewShellOutputCompaction(command4, original, largeOutputThreshold, shellGrepLargeOutputThreshold, minimumSavedChars) {
  const classification = classifyCommandResult(command4);
  const hasGoRuntimePanic = looksLikeGoRuntimePanic(original);
  const hasNpmPackOutput = looksLikeNpmPackOutput(original);
  const hasJestRunsOutput = hasJestRunsProgress(original);
  const hasDocusaurusOutput = hasDocusaurusProgress(original);
  const hasSphinxProgressOutput = hasSphinxProgress(original);
  const hasGoPassingTestOutput = classification.runsGoTest && hasPassingGoTestOutput(original);
  const hasNeedrestartNoopOutput = hasNeedrestartNoopSummary(original);
  const canCompactSourceReadProgress = hasGoPassingTestOutput && !classification.mentionsSavedToolOutput;
  if (classification.commandKinds.length === 0 && !hasGoRuntimePanic && !hasNpmPackOutput && !hasJestRunsOutput && !hasGoPassingTestOutput && !hasNeedrestartNoopOutput && !hasDocusaurusOutput && !hasSphinxProgressOutput) {
    return void 0;
  }
  if (classification.commandKinds.length === 0 && classification.isSourceReadCommand && !canCompactSourceReadProgress) {
    return void 0;
  }
  const result = compactShellOutput(
    classification.commandKinds,
    original,
    hasGoPassingTestOutput,
    shellGrepLargeOutputThreshold
  ) ?? { output: original, lossless: true };
  const savedChars = saturatingSub(jsStringLen(original), jsStringLen(result.output));
  const originalWouldSpill = !fitsLargeOutputThreshold(original, largeOutputThreshold);
  const savedBytes = saturatingSub(byteLength(original), byteLength(result.output));
  if (savedChars < minimumSavedChars && !(originalWouldSpill && savedBytes > 0)) {
    return void 0;
  }
  return {
    output: result.output,
    savedChars,
    lossless: result.lossless
  };
}

function compactToolOutput(kind, output, largeOutputThreshold) {
  const result = kind === "grep-content" ? compactGrepContentOutput(output, largeOutputThreshold) : kind === "grep-count" ? compactGrepCountOutput(output) : kind === "grep-paths" ? compactPathListOutput(output, "grep-paths", largeOutputThreshold) : compactPathListOutput(output, "glob", largeOutputThreshold);
  if (result.output === output) {
    return void 0;
  }
  return result;
}

function classifyCommandKinds(command4) {
  const heredocStrippedCommand = stripHeredocBodies(command4);
  if (heredocStrippedCommand === void 0) {
    return [];
  }
  const lineContinuedCommand = regexReplaceAll(String.raw`\s*\\\r?\n\s*`, heredocStrippedCommand.command, " ");
  const commandWithoutAllowedDescriptorRedirects = regexReplaceAll(String.raw`\s+[12]>&[12]\b`, lineContinuedCommand, "");
  const commandWithSafeSubstitutions = replaceSafeCommandSubstitutions(commandWithoutAllowedDescriptorRedirects);
  const safetyCommand = stripQuotedText(commandWithSafeSubstitutions);
  const hasNewline = regexTest(String.raw`\r?\n`, safetyCommand);
  if (regexTest("[;`<>]", safetyCommand) || regexTest(String.raw`(^|[^&])&($|[^&])`, safetyCommand) || safetyCommand.includes("$(")) {
    return [];
  }
  const segments = splitCommandSegments(lineContinuedCommand);
  const segmentKinds = segments.map((segment, index2) => classifyCommandSegmentOrPipeline(segment, heredocStrippedCommand.heredocStdinSegmentIndexes.has(index2)));
  if (segmentKinds.some((kind) => kind === void 0)) {
    return [];
  }
  const resolvedKinds = segmentKinds;
  if (hasNewline && !hasErrexitBeforeFirstCommand(segments, resolvedKinds)) {
    return [];
  }
  const result = [];
  for (const kind of resolvedKinds) {
    if (!kind.benign) {
      result.push(kind.kind);
    }
  }
  return result;
}

function isShellSourceReadCommand(command4) {
  const heredocStrippedCommand = stripHeredocBodies(command4);
  if (heredocStrippedCommand === void 0) {
    return true;
  }
  const lineContinuedCommand = regexReplaceAll(String.raw`\s*\\\r?\n\s*`, heredocStrippedCommand.command, " ");
  return splitCommandSegments(lineContinuedCommand).some((segment) => splitUnquotedPipes(segment).some((part) => isSourceReadSegment(part)));
}

function isSourceReadSegment(segment) {
  const normalized = normalizeSegment(segment);
  const withoutEnv = stripSafeCommandWrappers(stripEnvironmentAssignmentPrefix(normalized));
  return regexTest(String.raw`^(?:cat|sed|head|tail|less|more|bat|nl|awk|grep|egrep|fgrep|rg)(?:\s|$)`, withoutEnv);
}

function classifyCommandSegmentOrPipeline(segment, isHeredocStdinSegment) {
  const parts = splitUnquotedPipes(segment);
  if (parts.length === 1) {
    return classifyCommandSegment(parts[0], isHeredocStdinSegment);
  }
  if (parts.length < 2) {
    return void 0;
  }
  const headKind = classifyCommandSegment(parts[0], isHeredocStdinSegment);
  if (headKind === void 0) {
    return void 0;
  }
  if (segmentsEqual(headKind, BENIGN_SEGMENT)) {
    return void 0;
  }
  if (segmentsEqual(headKind, compactSegment("shell-grep"))) {
    return void 0;
  }
  if (parts.slice(1).every((part) => isBenignPipelineTail(part))) {
    return headKind;
  }
  return void 0;
}

function classifyCommandSegment(segment, isHeredocStdinSegment) {
  const normalized = normalizeSegment(segment);
  if (normalized.length === 0 || normalized === "true" || normalized === ":" || isBenignGofmtWriteCommand(normalized) || isBenignTarballCleanupCommand(normalized) || isBenignPythonBuildCleanupCommand(normalized) || normalized.startsWith("#") || regexTest(String.raw`^cd(?:\s+(?:"[^"]*"|'[^']*'|[^\s]+))?$`, normalized) || isBenignSetupCommand(normalized) || regexTest(
    String.raw`^set\s+(?:[-+A-Za-z]+|-o\s+[A-Za-z][A-Za-z0-9_-]*|[A-Za-z][A-Za-z0-9_-]*)(?:\s+(?:[-+A-Za-z]+|-o\s+[A-Za-z][A-Za-z0-9_-]*|[A-Za-z][A-Za-z0-9_-]*))*$`,
    normalized
  )) {
    return BENIGN_SEGMENT;
  }
  if (isAssignmentList(normalized) || normalized.startsWith("export ") && isAssignmentList(normalized.slice("export ".length))) {
    return BENIGN_SEGMENT;
  }
  const withoutEnv = stripSafeCommandWrappers(stripEnvironmentAssignmentPrefix(normalized));
  let kind;
  if (isAptCommand(withoutEnv)) {
    kind = "apt";
  } else if (isPnpmInstallCommand(withoutEnv)) {
    kind = "pnpm";
  } else if (regexTest(String.raw`^npm\s+pack\b`, withoutEnv)) {
    kind = "npm-pack";
  } else if (isYarnBerryCommand(withoutEnv)) {
    kind = "yarn-berry";
  } else if (regexTest(String.raw`^(?:npm\s+(?:ci|install)|yarn\s+install)\b`, withoutEnv)) {
    kind = "npm";
  } else if (isPipInstallCommand(withoutEnv)) {
    kind = "pip";
  } else if (regexTest(String.raw`^composer\s+(?:install|update|require|remove)\b`, withoutEnv)) {
    kind = "composer";
  } else if (regexTest(String.raw`^poetry\s+(?:install|update|add|remove)\b`, withoutEnv)) {
    kind = "poetry";
  } else if (isUvCommand(withoutEnv)) {
    kind = "uv";
  } else if (isBenignVersionCommand(withoutEnv)) {
    return BENIGN_SEGMENT;
  } else if (isGoCommand(withoutEnv)) {
    kind = "go";
  } else if (isJsTestCommand(withoutEnv)) {
    kind = "js-test";
  } else if (regexTest(String.raw`^cargo\s+(?:build|check|test|clippy|doc|fetch)\b`, withoutEnv)) {
    kind = "cargo";
  } else if (regexTest(String.raw`^(?:node|npx|npm\s+exec|pnpm\s+exec|yarn\s+node)\b`, withoutEnv)) {
    kind = "node";
  } else if (isNxCommand(withoutEnv)) {
    kind = "nx";
  } else if (isPytestCommand(withoutEnv)) {
    kind = "pytest";
  } else if (isPythonUnittestCommand(withoutEnv)) {
    kind = "unittest";
  } else if (isPythonBuildCommand(withoutEnv)) {
    kind = "python-build";
  } else if (isBenignGitCommand(withoutEnv)) {
    return BENIGN_SEGMENT;
  } else if (isGitProgressCommand(withoutEnv)) {
    kind = "git";
  } else if (isGitCleanOrResetCommand(withoutEnv)) {
    kind = "git-clean";
  } else if (regexTest(String.raw`^git\s+(?:checkout|switch)\b`, withoutEnv)) {
    kind = "git";
  } else if (isPythonBuildExtCommand(withoutEnv)) {
    kind = "python-build-ext";
  } else if (isDjangoTestCommand(withoutEnv)) {
    kind = "django-test";
  } else if (isGolangciLintCommand(withoutEnv)) {
    kind = "golangci-lint";
  } else if (isClangFormatLinterCommand(withoutEnv)) {
    kind = "clang-format-linter";
  } else if (isGradleCommand(withoutEnv)) {
    kind = "gradle";
  } else if (isCmakeConfigureCommand(withoutEnv)) {
    kind = "cmake";
  } else if (isMavenCommand(withoutEnv)) {
    kind = "maven";
  } else if (isDotnetCommand(withoutEnv)) {
    kind = "dotnet";
  } else if (isSafeShellGrepCommand(withoutEnv)) {
    kind = "shell-grep";
  } else if (regexTest(String.raw`^(?:g?make|ninja)\b`, withoutEnv) || regexTest(String.raw`^\./configure\b`, withoutEnv) || regexTest(String.raw`^cmake\s+--build\b`, withoutEnv)) {
    kind = "make";
  } else if (isPythonScriptCommand(withoutEnv, isHeredocStdinSegment)) {
    kind = "python-script";
  } else {
    return void 0;
  }
  return compactSegment(kind);
}

function splitUnquotedPipes(segment) {
  const parts = [];
  let start = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i2 = 0; i2 < segment.length; i2++) {
    const ch = segment[i2];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle && !isEscapedByOddBackslashes(segment, i2)) {
      inDouble = !inDouble;
    } else if (ch === "|" && !inSingle && !inDouble) {
      pushTrimmedPart(parts, segment.slice(start, i2));
      start = i2 + 1;
    }
  }
  pushTrimmedPart(parts, segment.slice(start));
  return parts;
}

function pushTrimmedPart(parts, part) {
  const trimmed = part.trim();
  if (trimmed.length !== 0) {
    parts.push(trimmed);
  }
}

function isBenignPipelineTail(segment) {
  const normalized = normalizeSegment(segment);
  return normalized === "cat" || regexTest(String.raw`^tee(?:\s+-a)?\s+(?:"[^"]*"|'[^']*'|\S+)$`, normalized) || regexTest(
    String.raw`^(?:head|tail)(?:\s+(?:-[nc]\s*)?[+-]?\d+|\s+-[nc]\s+[+-]?\d+)?$`,
    normalized
  ) || regexTest(
    String.raw`^sed\s+-n\s+(?:"\d+(?:,\d+)?p"|'[\d]+(?:,\d+)?p')$`,
    normalized
  ) || isSafeStreamingGrepTail(normalized) || isSafeStreamingFlagOnlyTail(normalized);
}

function stripPrefix(value2, prefix) {
  return value2.startsWith(prefix) ? value2.slice(prefix.length) : void 0;
}

function stripSuffix(value2, suffix) {
  return value2.endsWith(suffix) ? value2.slice(0, value2.length - suffix.length) : void 0;
}

function splitOnce(value2, separator2) {
  const index2 = value2.indexOf(separator2);
  if (index2 === -1) {
    return void 0;
  }
  return [value2.slice(0, index2), value2.slice(index2 + separator2.length)];
}

function rsplitOnce(value2, separator2) {
  const index2 = value2.lastIndexOf(separator2);
  if (index2 === -1) {
    return void 0;
  }
  return [value2.slice(0, index2), value2.slice(index2 + separator2.length)];
}

function asciiLowercase(value2) {
  let result = "";
  for (let i2 = 0; i2 < value2.length; i2++) {
    const code = value2.charCodeAt(i2);
    result += code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : value2[i2];
  }
  return result;
}

function parseUsize(value2) {
  if (!/^\+?\d+$/.test(value2)) {
    return void 0;
  }
  return Number(value2);
}

function isAptCommand(segment) {
  const withoutSudo = stripPrefix(segment, "sudo ") ?? segment;
  const args2 = stripPrefix(withoutSudo, "apt-get ") ?? stripPrefix(withoutSudo, "apt ");
  if (args2 === void 0) {
    return false;
  }
  const tokens = splitWhitespace(args2);
  let i2 = 0;
  while (i2 < tokens.length) {
    const token = tokens[i2];
    if (token === "-o" || token === "--option" || token === "-c" || token === "--config-file") {
      i2 += 2;
      continue;
    }
    if (token.startsWith("-")) {
      i2 += 1;
      continue;
    }
    return token === "update" || token === "install";
  }
  return false;
}

function isPnpmInstallCommand(segment) {
  const tokens = splitWhitespace(segment);
  if (tokens[0] !== "pnpm") {
    return false;
  }
  let index2 = 1;
  while (index2 < tokens.length) {
    const token = tokens[index2];
    if (["--filter", "-F", "--prefix", "-C", "--dir", "--loglevel", "--reporter", "--package-import-method", "--workspace-concurrency"].includes(token)) {
      index2 += 2;
      continue;
    }
    if (["--recursive", "-r", "--workspace-root", "-w", "--silent", "-s", "--use-stderr", "--color", "--no-color"].includes(token) || regexTest(String.raw`^(?:--filter|--prefix|--dir|--loglevel|--reporter|--package-import-method|--workspace-concurrency|-F|-C)=`, token)) {
      index2 += 1;
      continue;
    }
    break;
  }
  return tokens[index2] === "install" || tokens[index2] === "i";
}

function isGitProgressCommand(segment) {
  const tokens = splitWhitespace(segment);
  const index2 = gitSubcommandIndex(tokens);
  if (index2 === void 0) {
    return false;
  }
  const subcommand = tokens[index2];
  return subcommand === "clone" || subcommand === "fetch" || subcommand === "pull" || subcommand === "submodule" && tokens[index2 + 1] === "update";
}

function isGitCleanOrResetCommand(segment) {
  const tokens = splitWhitespace(segment);
  const index2 = gitSubcommandIndex(tokens);
  if (index2 === void 0) {
    return false;
  }
  const subcommand = tokens[index2];
  const args2 = tokens.slice(index2 + 1);
  if (subcommand === "reset") {
    return args2.includes("--hard");
  }
  return subcommand === "clean" && args2.some((arg) => isGitCleanForceOption(arg));
}

function isGitCleanForceOption(arg) {
  return arg === "--force" || regexTest(String.raw`^-[A-Za-z]+$`, arg) && arg.includes("f");
}

function isBenignGitCommand(segment) {
  const tokens = splitWhitespace(segment);
  const index2 = gitSubcommandIndex(tokens);
  if (index2 === void 0) {
    return false;
  }
  const subcommand = tokens[index2];
  const args2 = tokens.slice(index2 + 1);
  if (subcommand === "status") {
    return args2.every((arg) => arg === "--short" || arg === "-s" || arg === "--porcelain" || arg.startsWith("--untracked-files"));
  }
  if (subcommand === "diff") {
    const hasSummaryOutput = args2.some((arg) => ["--stat", "--shortstat", "--numstat", "--name-only", "--name-status", "--summary", "--compact-summary"].includes(arg));
    return hasSummaryOutput && !args2.some((arg) => arg === "-p" || arg === "-u" || arg === "--patch" || arg.startsWith("--patch-") || arg.startsWith("--word-diff") || arg.startsWith("--color-words"));
  }
  return subcommand === "rev-parse" && args2.every((arg) => arg === "--show-toplevel" || arg === "--show-prefix");
}

function gitSubcommandIndex(tokens) {
  if (tokens[0] !== "git") {
    return void 0;
  }
  let index2 = 1;
  while (index2 < tokens.length) {
    const token = tokens[index2];
    if (token === "-C" || token === "--git-dir" || token === "--work-tree") {
      index2 += 2;
      continue;
    }
    if (token.startsWith("-c")) {
      index2 += token === "-c" ? 2 : 1;
      continue;
    }
    if (token.startsWith("--")) {
      index2 += 1;
      continue;
    }
    break;
  }
  return index2 < tokens.length ? index2 : void 0;
}

function isJsTestCommand(segment) {
  return !regexTest(
    String.raw`(?:^|\s)(?:-w|--watch(?:[=\s]|$)|--watchAll(?:[=\s]|$)|--watch-all(?:[=\s]|$)|--watch-files(?:[=\s]|$))`,
    segment
  ) && regexTest(
    String.raw`^(?:npx\s+|(?:npm|pnpm|yarn)\s+exec\s+)?(?:vitest|jest|mocha|tap)(?:\s|$)`,
    segment
  );
}

function isYarnBerryCommand(segment) {
  return regexTest(
    String.raw`^(?:yarn|corepack\s+yarn)\s+(?:install|add|workspaces|run\s+install)\b`,
    segment
  ) || regexTest(
    String.raw`^node\s+(?:\./)?script/yarn\.js\s+(?:install|add)\b`,
    segment
  );
}

function isNxCommand(segment) {
  return regexTest(
    String.raw`^(?:nx|(?:yarn|pnpm)\s+(?:nx|release:build|typescript|test:ts|lint))\b`,
    segment
  );
}

function isDjangoTestCommand(segment) {
  const pythonWithOptions = pythonWithOptionsPattern();
  return regexTest(
    String.raw`^${pythonWithOptions}\s+(?:(?:\./)?(?:tests/)?runtests\.py|manage\.py\s+test|-m\s+django\s+test)\b`,
    segment
  ) || regexTest(String.raw`^django-admin\s+test\b`, segment);
}

function isGolangciLintCommand(segment) {
  return regexTest(String.raw`^(?:[A-Za-z0-9_./+-]+/)?golangci-lint\s+run\b`, segment) || regexTest(
    String.raw`^go\s+run\s+github\.com/golangci/golangci-lint/cmd/golangci-lint(?:@\S+)?\s+run\b`,
    segment
  );
}

function isClangFormatLinterCommand(segment) {
  return regexTest(
    String.raw`^${pythonWithOptionsPattern()}\s+\S*tools/linter/adapters/clangformat_linter\.py\b`,
    segment
  );
}

function isGradleCommand(segment) {
  return regexTest(
    String.raw`^(?:(?:\./|/\S+/)?gradlew?|\$GRADLE|\$\{GRADLE\})(?:\s|$)`,
    segment
  );
}

function isCmakeConfigureCommand(segment) {
  return regexTest(String.raw`^cmake(?:\s|$)`, segment) && !splitWhitespace(segment).some((token) => regexTest(String.raw`^(?:--build|--install|-E|-P|--version|-N|-h|--help(?:-.+)?)$`, token));
}

function isMavenCommand(segment) {
  return regexTest(String.raw`^(?:(?:\./)?mvnw?|mvn)(?:\s|$)`, segment);
}

function isDotnetCommand(segment) {
  return regexTest(String.raw`^dotnet\s+(?:build|test|restore|publish|pack)(?:\s|$)`, segment);
}

function isUvCommand(segment) {
  return regexTest(
    String.raw`^(?:uv|(?:python|python3(?:\.\d+)?)\s+-m\s+uv)\s+(?:sync|pip\s+(?:install|sync|compile)|venv|add|lock|run)\b`,
    segment
  );
}

function isPipInstallCommand(segment) {
  return regexTest(
    String.raw`^(?:(?:${pythonExecutablePattern()})\s+-m\s+pip|pip|pip3)\s+install\b`,
    segment
  );
}

function isGoCommand(segment) {
  return regexTest(
    String.raw`^(?:go|/(?:\S+/)*go)\s+(?:test|build|install|get|mod\s+(?:tidy|download|verify|graph)|work\s+sync)\b`,
    segment
  );
}

function isPytestCommand(segment) {
  return regexTest(
    String.raw`^(?:(?:${pythonWithOptionsPattern()})\s+-m\s+pytest|(?:(?:[A-Za-z0-9_./+-]+/)?pytest))(?:\s|$)`,
    segment
  );
}

function isPythonUnittestCommand(segment) {
  return regexTest(String.raw`^${pythonWithOptionsPattern()}\s+-m\s+unittest\b`, segment);
}

function isPythonBuildCommand(segment) {
  return regexTest(String.raw`^${pythonWithOptionsPattern()}\s+-m\s+build(?:\s|$)`, segment);
}

function isPythonBuildExtCommand(segment) {
  return regexTest(String.raw`^${pythonExecutablePattern()}\s+setup\.py\s+build_ext\b`, segment);
}

function isPythonScriptCommand(segment, isHeredocStdinSegment) {
  return isHeredocStdinPythonCommand(segment, isHeredocStdinSegment) || regexTest(
    String.raw`^${pythonWithOptionsPattern()}\s+(?:-c\s+(?:"[^"]*"|'[^']*'|\S+)|(?:"[^"]+\.py"|'[^']+\.py'|[^\s-]\S*\.py))(?:\s|$)`,
    segment
  );
}

function isHeredocStdinPythonCommand(segment, isHeredocStdinSegment) {
  return isHeredocStdinSegment && regexTest(String.raw`^${pythonExecutablePattern()}\s+-$`, segment);
}

function isBenignSetupCommand(segment) {
  return isSourceActivateCommand(segment) || isBenignPythonVenvCommand(segment) || regexTest(
    String.raw`^mkdir\s+-p\s+(?:"[^"]*"|'[^']*'|[^\s]+)(?:\s+(?:"[^"]*"|'[^']*'|[^\s]+))*$`,
    segment
  ) || regexTest(String.raw`^umask\s+[0-7]{3,4}$`, segment) || regexTest(
    String.raw`^unset\s+[A-Za-z_][A-Za-z0-9_]*(?:\s+[A-Za-z_][A-Za-z0-9_]*)*$`,
    segment
  ) || segment === "hash -r" || isBenignCorepackYarnSetupCommand(segment) || isLiteralSeparatorCommand(segment);
}

function isSourceActivateCommand(segment) {
  return regexTest(
    String.raw`^(?:source|\.)\s+(?:"[^"]*(?:^|/)activate"|'[^']*(?:^|/)activate'|\S*(?:^|/)activate)$`,
    segment
  );
}

function isBenignCorepackYarnSetupCommand(segment) {
  return regexTest(String.raw`^corepack\s+(?:enable|prepare\s+yarn@\S+\s+--activate)$`, segment);
}

function isBenignPythonVenvCommand(segment) {
  return regexTest(String.raw`^${pythonExecutablePattern()}\s+-m\s+venv(?:\s+\S+)+$`, segment) && !regexTest(String.raw`\s(?:--help|-h)(?:\s|$)`, segment);
}

function isBenignGofmtWriteCommand(segment) {
  return regexTest(
    String.raw`^gofmt\s+-w(?:\s+(?:"[^"-][^"]*"|'[^'-][^']*'|[^-\s]\S*))+$`,
    segment
  );
}

function isBenignTarballCleanupCommand(segment) {
  return regexTest(
    String.raw`^rm\s+-f\s+(?:"[^"]+\.tgz"|'[^']+\.tgz'|\S+\.tgz)$`,
    segment
  );
}

function isBenignPythonBuildCleanupCommand(segment) {
  return regexTest(String.raw`^rm\s+-rf\s+dist\s+build\s+\*\.egg-info$`, segment);
}

function isBenignVersionCommand(segment) {
  return regexTest(String.raw`^/\S+\s+(?:--version|-version|version)$`, segment);
}

function isAssignmentList(segment) {
  return regexTest(
    String.raw`^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|[^\s]+))(?:\s+[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|[^\s]+))*$`,
    segment
  );
}

function stripEnvironmentAssignmentPrefix(segment) {
  return regexReplaceAll(
    String.raw`^([A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+)+`,
    segment,
    ""
  );
}

function stripSafeCommandWrappers(segment) {
  let current = segment;
  for (let iteration = 0; iteration < 3; iteration++) {
    const before = current;
    current = stripEnvironmentAssignmentPrefix(regexReplaceAll(
      String.raw`^timeout\s+\d+(?:[smhd])?\s+`,
      current,
      ""
    ));
    current = stripEnvironmentAssignmentPrefix(regexReplaceAll(
      String.raw`^env(?:\s+[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S+))+\s+`,
      current,
      ""
    ));
    if (current === before) {
      return current;
    }
  }
  return current;
}

function isLiteralSeparatorCommand(segment) {
  return regexTest(
    String.raw`^echo(?:\s+-n)?(?:\s+(?:"[\s#=_.:/*+\-[\]]{1,19}"|'[\s#=_.:/*+\-[\]]{1,19}'))+$`,
    segment
  ) || regexTest(
    String.raw`^printf\s+(?:"(?:[\s#=_.:/*+\-[\]]|\\n|\\t){1,19}"|'(?:[\s#=_.:/*+\-[\]]|\\n|\\t){1,19}')$`,
    segment
  );
}

function isSafeShellGrepCommand(segment) {
  const tokens = splitWhitespace(segment);
  const command4 = tokens[0];
  if (command4 === void 0) {
    return false;
  }
  if (!(command4 === "rg" || command4 === "grep" || command4 === "egrep" || command4 === "fgrep")) {
    return false;
  }
  const args2 = tokens.slice(1);
  let patternCount = 0;
  let i2 = 0;
  while (i2 < args2.length) {
    const arg = args2[i2];
    if (arg === "--") {
      return i2 < args2.length - 1 && !args2.slice(i2 + 1).some((a) => isSavedToolOutputPath(a));
    }
    if (arg === "-e" || arg === "--regexp") {
      i2 += 1;
      if (i2 >= args2.length) {
        return false;
      }
      patternCount += 1;
      if (patternCount > 1) {
        return false;
      }
      i2 += 1;
      continue;
    }
    if (arg.startsWith("-e") && arg.length > 2 || arg.startsWith("--regexp=")) {
      patternCount += 1;
      if (patternCount > 1) {
        return false;
      }
      i2 += 1;
      continue;
    }
    if (isShellGrepFlagWithValue(arg)) {
      i2 += 1;
      if (i2 >= args2.length) {
        return false;
      }
      i2 += 1;
      continue;
    }
    if (regexTest(String.raw`^(?:--glob|--include|--exclude|--exclude-dir)=`, arg)) {
      i2 += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      if (isUnsafeShellGrepFlag(arg) || !isSafeShellGrepFlag(command4, arg)) {
        return false;
      }
      i2 += 1;
      continue;
    }
    if (isSavedToolOutputPath(arg)) {
      return false;
    }
    if (patternCount === 0) {
      patternCount += 1;
    }
    i2 += 1;
  }
  return patternCount === 1;
}

function isShellGrepFlagWithValue(arg) {
  return arg === "-g" || arg === "--glob" || arg === "--include" || arg === "--exclude" || arg === "--exclude-dir";
}

function isSafeShellGrepFlag(command4, arg) {
  return (command4 === "rg" ? regexTest(String.raw`^-[nHiwxEFP]+$`, arg) : regexTest(String.raw`^-[nHiwxErRFP]+$`, arg)) || regexTest(
    String.raw`^(?:--line-number|--with-filename|--no-heading|--ignore-case|--word-regexp|--line-regexp|--recursive|--extended-regexp|--fixed-strings|--perl-regexp|--color=never)$`,
    arg
  );
}

function isUnsafeShellGrepFlag(arg) {
  return arg === "-f" || arg === "--file" || arg.startsWith("--file=") || regexTest(
    String.raw`^(?:--json|--vimgrep|--files|--type-list|--heading|--no-line-number|--no-filename|--count|--count-matches|--files-with(?:out)?-matches|--only-matching|--quiet|--null|--null-data|--text|--binary|--context|--before-context|--after-context|--invert-match|--passthru|--replace|--line-buffered|--color=always)$`,
    arg
  ) || regexTest(String.raw`^-[^-]*[A-CLlcoqvZ0]`, arg);
}

function isSafeStreamingGrepTail(segment) {
  const argsText = stripPrefix(segment, "grep ") ?? stripPrefix(segment, "egrep ") ?? stripPrefix(segment, "fgrep ");
  if (argsText === void 0) {
    return false;
  }
  const args2 = splitWhitespace(argsText);
  let patternCount = 0;
  let i2 = 0;
  while (i2 < args2.length) {
    const arg = args2[i2];
    if (arg === "--") {
      return i2 === args2.length - 1;
    }
    if (arg === "-e" || arg === "--regexp") {
      i2 += 1;
      if (i2 >= args2.length) {
        return false;
      }
      patternCount += 1;
      i2 += 1;
      continue;
    }
    if (arg.startsWith("-e") && arg.length > 2 || arg.startsWith("--regexp=")) {
      patternCount += 1;
      i2 += 1;
      continue;
    }
    if (arg === "-f" || arg === "--file" || arg.startsWith("--file=") || regexTest(String.raw`^-[^-]*[cCfFPRrLlmoq]`, arg) || regexTest(
      String.raw`^(?:--(?:count|fixed-strings|perl-regexp|recursive|dereference-recursive|files-with-matches|files-without-match|only-matching|quiet|include|exclude|exclude-dir)|--(?:include|exclude|exclude-dir)=)`,
      arg
    )) {
      return false;
    }
    if (arg.startsWith("-")) {
      i2 += 1;
      continue;
    }
    patternCount += 1;
    if (patternCount > 1) {
      return false;
    }
    i2 += 1;
  }
  return patternCount === 1;
}

function isSafeStreamingFlagOnlyTail(segment) {
  const tokens = splitWhitespace(segment);
  const command4 = tokens[0];
  if (command4 === void 0) {
    return false;
  }
  if (!(command4 === "wc" || command4 === "sort" || command4 === "uniq" || command4 === "cut")) {
    return false;
  }
  const args2 = tokens.slice(1);
  let i2 = 0;
  while (i2 < args2.length) {
    const arg = args2[i2];
    if (arg === "--") {
      return i2 === args2.length - 1;
    }
    if (command4 === "sort" && (arg === "-o" || arg === "--output" || arg.startsWith("--output="))) {
      return false;
    }
    if (command4 === "cut" && (arg === "-d" || arg === "-f" || arg === "-c" || arg === "-b")) {
      i2 += 1;
      if (i2 >= args2.length) {
        return false;
      }
      i2 += 1;
      continue;
    }
    if (!arg.startsWith("-")) {
      return false;
    }
    i2 += 1;
  }
  return true;
}

function isSavedToolOutputPath(arg) {
  return regexTest(
    String.raw`(?:^|/)(?:\d+-copilot-tool-output-|copilot-tool-output(?:-original)?-|original-output-\d+-)`,
    arg
  );
}

function normalizeSegment(segment) {
  const trimmed = segment.trim();
  const withoutRedirects = regexReplaceAll(String.raw`\s+(?:2>&1|1>&2)\b`, trimmed, "");
  return regexReplaceAll(String.raw`\s+`, withoutRedirects, " ");
}

function replaceSafeCommandSubstitutions(command4) {
  if (!regexTest(String.raw`\btools/linter/adapters/clangformat_linter\.py\b`, command4)) {
    return command4;
  }
  return regexReplaceAll(
    `\\$\\(\\s*git\\s+--no-pager\\s+ls-files(?:\\s+(?:"[^"\`$()]*"|'[^'\`$()]*'|[^'"\`()$;&<>|\\s]+))*\\s*\\)`,
    command4,
    "__SAFE_GIT_LS_FILES__"
  );
}

function splitCommandSegments(command4) {
  const segments = [];
  let start = 0;
  let inSingle = false;
  let inDouble = false;
  let idx = 0;
  while (idx < command4.length) {
    const ch = command4[idx];
    const next = idx + 1 < command4.length ? command4[idx + 1] : void 0;
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle && !isEscapedByOddBackslashes(command4, idx)) {
      inDouble = !inDouble;
    } else if (!inSingle && !inDouble && (ch === "&" && next === "&" || ch === "|" && next === "|")) {
      pushCommandSegment(segments, command4.slice(start, idx));
      start = idx + 2;
      idx += 1;
    } else if (!inSingle && !inDouble && (ch === "\n" || ch === "\r")) {
      pushCommandSegment(segments, command4.slice(start, idx));
      let nextStart = idx + 1;
      if (ch === "\r" && next === "\n") {
        idx += 1;
        nextStart += 1;
      }
      start = nextStart;
    }
    idx += 1;
  }
  pushCommandSegment(segments, command4.slice(start));
  return segments;
}

function pushCommandSegment(segments, segment) {
  const trimmed = segment.trim();
  if (trimmed.length !== 0) {
    segments.push(trimmed);
  }
}

function stripQuotedText(command4) {
  let stripped = "";
  let inSingle = false;
  let inDouble = false;
  for (let i2 = 0; i2 < command4.length; i2++) {
    const ch = command4[i2];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      stripped += ch;
    } else if (ch === '"' && !inSingle && !isEscapedByOddBackslashes(command4, i2)) {
      inDouble = !inDouble;
      stripped += ch;
    } else if (inSingle) {
      stripped += " ";
    } else if (inDouble) {
      stripped += ch === "$" || ch === "(" || ch === "`" ? ch : " ";
    } else {
      stripped += ch;
    }
  }
  return stripped;
}

function isEscapedByOddBackslashes(text2, index2) {
  let count2 = 0;
  let i2 = index2;
  while (i2 > 0) {
    i2 -= 1;
    if (text2[i2] === "\\") {
      count2 += 1;
    } else {
      break;
    }
  }
  return count2 % 2 === 1;
}

function isWhitespaceChar2(ch) {
  return /\s/.test(ch);
}

function startsWithWhitespace(line) {
  return line.length > 0 && isWhitespaceChar2(line[0]);
}

function stripHeredocBodies(command4) {
  const lines = command4.split("\n").map((line) => stripSuffix(line, "\r") ?? line);
  const stripped = [];
  const heredocStdinSegmentIndexes = /* @__PURE__ */ new Set();
  let i2 = 0;
  while (i2 < lines.length) {
    const line = lines[i2];
    const heredoc = parseHeredocOpener(line);
    if (heredoc === void 0) {
      stripped.push(line);
      i2 += 1;
      continue;
    }
    const commandBeforeHeredoc = lastChainSegment(heredoc.prefix);
    if (regexTest(
      String.raw`^${pythonExecutablePattern()}\s+-$`,
      normalizeSegment(commandBeforeHeredoc)
    )) {
      let commandThroughHeredocOpener = stripped.join("\n");
      if (commandThroughHeredocOpener.length !== 0) {
        commandThroughHeredocOpener += "\n";
      }
      commandThroughHeredocOpener += heredoc.prefix;
      heredocStdinSegmentIndexes.add(
        saturatingSub(splitCommandSegments(commandThroughHeredocOpener).length, 1)
      );
    }
    stripped.push(`${heredoc.prefix} ${heredoc.suffix}`.trimEnd());
    i2 += 1;
    while (i2 < lines.length && lines[i2].trim() !== heredoc.delimiter) {
      i2 += 1;
    }
    if (i2 >= lines.length) {
      return void 0;
    }
    i2 += 1;
  }
  return {
    command: stripped.join("\n"),
    heredocStdinSegmentIndexes
  };
}

function parseHeredocOpener(line) {
  let inSingle = false;
  let inDouble = false;
  let index2 = 0;
  while (index2 + 1 < line.length) {
    const ch = line[index2];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      index2 += 1;
      continue;
    }
    if (ch === '"' && !inSingle && !isEscapedByOddBackslashes(line, index2)) {
      inDouble = !inDouble;
      index2 += 1;
      continue;
    }
    if (!inSingle && !inDouble && ch === "#" && (index2 === 0 || isWhitespaceChar2(line[index2 - 1]))) {
      return void 0;
    }
    if (inSingle || inDouble || ch !== "<" || line[index2 + 1] !== "<") {
      index2 += 1;
      continue;
    }
    let cursor = index2 + 2;
    if (line[cursor] === "-") {
      cursor += 1;
    }
    while (cursor < line.length && isWhitespaceChar2(line[cursor])) {
      cursor += 1;
    }
    let delimiter2 = "";
    const quote = cursor < line.length ? line[cursor] : void 0;
    if (quote === "'" || quote === '"') {
      cursor += 1;
      const start = cursor;
      while (cursor < line.length && line[cursor] !== quote) {
        cursor += 1;
      }
      if (cursor >= line.length) {
        return void 0;
      }
      delimiter2 += line.slice(start, cursor);
      cursor += 1;
    } else {
      const start = cursor;
      while (cursor < line.length && !isWhitespaceChar2(line[cursor])) {
        cursor += 1;
      }
      delimiter2 += line.slice(start, cursor);
    }
    if (!regexTest(String.raw`^[A-Za-z_][A-Za-z0-9_]*$`, delimiter2)) {
      return void 0;
    }
    return {
      prefix: line.slice(0, index2),
      suffix: line.slice(cursor),
      delimiter: delimiter2
    };
  }
  return void 0;
}

function lastChainSegment(commandPrefix2) {
  const parts = commandPrefix2.split(new RegExp(String.raw`\s*(?:&&|\|\||;)\s*`));
  const last = parts.length > 0 ? parts[parts.length - 1] : commandPrefix2;
  return last.trim();
}

function hasErrexitBeforeFirstCommand(segments, segmentKinds) {
  let firstNonBenign = segmentKinds.findIndex((kind) => !segmentsEqual(kind, BENIGN_SEGMENT));
  if (firstNonBenign === -1) {
    firstNonBenign = segmentKinds.length;
  }
  return segments.slice(0, firstNonBenign).some((segment) => isSetECommand(segment));
}

function isSetECommand(segment) {
  const normalized = normalizeSegment(segment);
  return regexTest(
    String.raw`^set\s+-(?=[A-Za-z]*e)[A-Za-z]+(?:\s+[-+A-Za-z]+)*$`,
    normalized
  ) || regexTest(String.raw`\s-o\s+errexit\b`, normalized);
}

function commandRunsGoTest(command4) {
  return regexTest(
    String.raw`(?:^|[\s;&|(])go\s+test(?:\s|$)`,
    stripQuotedText(command4)
  );
}

function commandMentionsSavedToolOutput(command4) {
  return splitWhitespace(command4).some((token) => isSavedToolOutputPath(token));
}

function looksLikeNpmPackOutput(output) {
  return output.includes("npm notice Tarball Contents") && output.includes("npm notice Tarball Details");
}

function hasDocusaurusProgress(output) {
  return output.split("\n").some((line) => regexTest(String.raw`^\s*\u25CF\s+Client\s+`, line)) && output.split("\n").some((line) => regexTest(String.raw`^\s*[\u25CF\u25EF]\s+Server(?:\s+|$)`, line));
}

function hasPassingGoTestOutput(output) {
  return !hasGoTestFailureOutput(output) && output.split("\n").some((line) => isGoModuleDownloadChatterLine(line));
}

function hasGoTestFailureOutput(output) {
  return regexTest(
    String.raw`(?:^|\n)(?:--- FAIL:|FAIL(?:\s|$)|panic:|fatal error:|\s*Error Trace:|\S+\.go:\d+:|# \S+|diff \S+|--- (?!PASS:)|\+\+\+ |@@ |.*\[(?:build|setup) failed\])`,
    output
  );
}

function pythonExecutablePattern() {
  return String.raw`(?:(?:[A-Za-z0-9_./+-]+/)?(?:python|python3(?:\.\d+)?))`;
}

function pythonWithOptionsPattern() {
  return String.raw`${pythonExecutablePattern()}(?:\s+(?:-[BEsStuUvVqQ]|-W\S+|-X\s+\S+))*`;
}

function compactShellOutput(commandKinds, output, compactGoPassingTestOutput, shellGrepLargeOutputThreshold) {
  const state = { output, lossless: true };
  applyStringCompactor(state, compactCarriageReturnProgress);
  applyStringCompactor(state, compactNeedrestartNoopProgress);
  applyStringCompactor(state, compactGoRuntimePanicDump);
  if (compactGoPassingTestOutput && !commandKinds.includes("go")) {
    applyStringCompactor(state, compactGoOutput);
  }
  applyStringCompactor(state, compactJestRunsProgress);
  applyStringCompactor(state, compactDocusaurusProgress);
  applyStringCompactor(state, compactSphinxProgressFallback);
  if (!commandKinds.includes("npm-pack")) {
    applyStringCompactor(state, compactNpmPackOutput);
  }
  for (const kind of COMMAND_COMPACTOR_ORDER.filter((candidate) => commandKinds.includes(candidate))) {
    const result = compactCommandEntry(kind, state.output, shellGrepLargeOutputThreshold);
    state.output = result.output;
    state.lossless = state.lossless && result.lossless;
  }
  if (state.output === output) {
    return void 0;
  }
  return {
    output: state.output,
    lossless: state.lossless
  };
}

function applyStringCompactor(state, compact2) {
  const next = compact2(state.output);
  if (next !== state.output) {
    state.lossless = false;
  }
  state.output = next;
}

function compactCommandEntry(kind, output, shellGrepLargeOutputThreshold) {
  if (kind === "shell-grep") {
    return compactToolOutput(
      "grep-content",
      output,
      shellGrepLargeOutputThreshold
    ) ?? unchanged(output);
  }
  const original = output;
  let result;
  switch (kind) {
    case "pip": {
      let next = applyPythonBuildNoise(output);
      next = compactGitProgress(next);
      next = compactPackageManagerOperations(next);
      next = compactPythonNinjaBuildProgress(next);
      result = compactPipInstallProgress(next);
      break;
    }
    case "python-build": {
      let next = applyPythonBuildNoise(output);
      next = compactGitProgress(next);
      next = compactSetuptoolsFileStagingRuns(next);
      next = compactPythonNinjaBuildProgress(next);
      result = compactPipInstallProgress(next);
      break;
    }
    case "pytest": {
      let next = compactPythonEcosystemNoise(output);
      next = compactPytestProgress(next);
      next = compactPytestFailureBlocks(next);
      next = compactPytestWarningsSummary(next);
      next = compactPytestSessionMetadata(next);
      next = compactSphinxProgress(next);
      result = compactRepeatedDiagnosticBlocks(next);
      break;
    }
    case "python-build-ext": {
      let next = applyPythonBuildNoise(output);
      next = compactPythonNinjaBuildProgress(next);
      next = compactPythonBuildExtProgress(next);
      next = compactSphinxProgress(next);
      result = compactRepeatedDiagnosticBlocks(next);
      break;
    }
    case "django-test": {
      let next = compactPythonEcosystemNoise(output);
      next = compactDjangoTestBoilerplate(next);
      next = compactDjangoTestProgress(next);
      next = compactPytestWarningsSummary(next);
      next = compactSphinxProgress(next);
      result = compactRepeatedDiagnosticBlocks(next);
      break;
    }
    case "python-script": {
      let next = applyPythonBuildNoise(output);
      next = compactSphinxProgress(next);
      result = compactRepeatedDiagnosticBlocks(next);
      break;
    }
    case "apt":
      result = compactAptOutput(output);
      break;
    case "npm":
      result = compactNpmOutput(output);
      break;
    case "npm-pack":
      result = compactNpmPackOutput(output);
      break;
    case "yarn-berry":
      result = compactYarnBerryOutput(output);
      break;
    case "pnpm":
      result = compactPnpmOutput(output);
      break;
    case "composer":
    case "poetry":
      result = compactPackageManagerOperations(output);
      break;
    case "uv":
      result = compactUvProgress(compactPackageManagerOperations(output));
      break;
    case "maven":
      result = compactMavenOutput(output);
      break;
    case "dotnet":
      result = compactDotnetTimingProgress(output);
      break;
    case "go":
      result = compactGoCommandOutput(output);
      break;
    case "unittest":
      result = compactUnittestOutput(output);
      break;
    case "js-test":
      result = compactJsTestOutput(output);
      break;
    case "cargo":
      result = compactCargoProgress(output);
      break;
    case "node":
      result = compactRepeatedNodeWarnings(output);
      break;
    case "git":
      result = compactGitProgress(output);
      break;
    case "git-clean":
      result = compactGitCleanRemovingRuns(output);
      break;
    case "nx":
      result = compactNxLernaFrameProgress(output);
      break;
    case "golangci-lint":
      result = compactGolangciLintOutput(output, false);
      break;
    case "clang-format-linter":
      result = compactClangFormatLinterOutput(output);
      break;
    case "gradle":
      result = compactGradleOutput(output);
      break;
    case "cmake":
      result = compactCmakeConfigureProbeRuns(output);
      break;
    case "make":
      result = compactMakeOutput(output);
      break;
    default:
      result = output;
      break;
  }
  return stringCompactionResult(original, result);
}

function stringCompactionResult(original, output) {
  const lossless = output === original;
  return { output, lossless };
}

function applyPythonBuildNoise(output) {
  let next = compactSetuptoolsDeprecationBlocks(output);
  next = compactCythonPerformanceHints(next);
  next = compactCompilerWarningRuns(next);
  next = compactPythonEcosystemNoise(next);
  return compactNumpyDistutilsProbes(next);
}

function compactGoCommandOutput(output) {
  return compactRepeatedDiagnosticBlocks(compactGoOutput(output));
}

function compactMavenOutput(output) {
  return compactMavenInfoBoilerplate(compactMavenPassingTests(
    compactMavenDependencyTransfer(output)
  ));
}

function compactPythonEcosystemNoise(output) {
  return omitNonDiagnosticLines(
    output,
    "python ecosystem noise",
    isPythonEcosystemNoiseLine
  );
}

function compactPipInstallProgress(output) {
  return omitNonDiagnosticLines(output, "pip install progress", isPipInstallProgressLine);
}

function compactPythonNinjaBuildProgress(output) {
  return omitNonDiagnosticLines(
    output,
    "python ninja build progress",
    isPythonNinjaBuildProgressLine
  );
}

function compactPythonBuildExtProgress(output) {
  return omitNonDiagnosticLines(
    output,
    "python build_ext progress",
    isPythonBuildExtProgressLine
  );
}

function compactSphinxProgressFallback(output) {
  if (hasSphinxProgress(output)) {
    return compactSphinxProgress(output);
  }
  return output;
}

function compactPytestSessionMetadata(output) {
  return omitNonDiagnosticLines(
    output,
    "pytest session metadata",
    isPytestSessionMetadataLine
  );
}

function compactDjangoTestBoilerplate(output) {
  return omitNonDiagnosticLines(output, "django test boilerplate", isDjangoTestBoilerplateLine);
}

function compactDjangoTestProgress(output) {
  return omitNonDiagnosticLines(output, "django test progress", isDjangoTestProgressLine);
}

function compactClangFormatLinterOutput(output) {
  return omitNonDiagnosticLines(output, "clang-format debug", isClangFormatDebugLine);
}

function compactDotnetTimingProgress(output) {
  const compacted = [];
  const bufferedProgress = [];
  const timing = { count: 0 };
  for (const line of output.split("\n")) {
    if (line.trim().length === 0 || isDotnetStandaloneTimingLine(line)) {
      bufferedProgress.push(line);
      if (isDotnetStandaloneTimingLine(line)) {
        timing.count += 1;
      }
      continue;
    }
    flushDotnetTimingProgress(compacted, bufferedProgress, timing);
    compacted.push(line);
  }
  flushDotnetTimingProgress(compacted, bufferedProgress, timing);
  return compacted.join("\n");
}

function flushDotnetTimingProgress(compacted, bufferedProgress, timing) {
  if (timing.count >= 3) {
    compacted.push(`[dotnet timing progress: omitted ${timing.count} timing line(s)]`);
  } else {
    for (const line of bufferedProgress) {
      compacted.push(line);
    }
  }
  bufferedProgress.length = 0;
  timing.count = 0;
}

function isDotnetStandaloneTimingLine(line) {
  return regexTest(String.raw`^\s*\(\d+(?:\.\d+)?s\)\s*$`, line);
}

function compactGitCleanRemovingRuns(output) {
  return collapseContiguousRuns(output, isGitCleanRemovingLine, 16, (block2) => {
    const keptStart = block2.slice(0, Math.min(5, block2.length));
    const keptEndStart = saturatingSub(block2.length, 5);
    const keptEnd = block2.slice(keptEndStart);
    const omitted = saturatingSub(block2.length, keptStart.length + keptEnd.length);
    if (omitted === 0) {
      return void 0;
    }
    const lines = [...keptStart];
    lines.push(`[git clean: omitted ${omitted} Removing line(s)]`);
    lines.push(...keptEnd);
    return lines.join("\n");
  });
}

function isGitCleanRemovingLine(line) {
  return regexTest(String.raw`^Removing \S+`, line);
}

function collapseContiguousRuns(output, isMember, minRun, summarize2) {
  const lines = output.split("\n");
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    if (!isMember(lines[i2])) {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    const start = i2;
    while (i2 < lines.length && isMember(lines[i2])) {
      i2 += 1;
    }
    const block2 = lines.slice(start, i2);
    const summary = block2.length >= minRun ? summarize2(block2) : void 0;
    if (summary !== void 0) {
      compacted.push(summary);
    } else {
      compacted.push(...block2);
    }
  }
  return compacted.join("\n");
}

function collapseRunsWithExamples(output, isMember, example, summarize2) {
  return collapseContiguousRuns(output, isMember, 5, (block2) => {
    const examples = [];
    for (const line of block2) {
      const ex = example(line);
      if (ex !== void 0) {
        examples.push(ex);
      }
    }
    if (examples.length !== block2.length) {
      return void 0;
    }
    return summarize2(
      block2.length,
      summarizeWithMore(uniqueStrings(examples), 10)
    );
  });
}

function compactRepeatedNodeWarnings(output) {
  const seen = [];
  return omitMatchingLines(
    output,
    "node warnings",
    (line) => {
      const key3 = getNodeWarningKey(line);
      if (key3 === void 0) {
        return false;
      }
      if (seen.includes(key3)) {
        return true;
      }
      seen.push(key3);
      return false;
    },
    "repeated warning"
  );
}

function getNodeWarningKey(line) {
  if (regexTest(
    String.raw`^\(node:\d+\) (?:\[[A-Z0-9_-]+\] )?(?:ExperimentalWarning|DeprecationWarning|Warning): `,
    line
  )) {
    return regexReplaceAll(String.raw`^\(node:\d+\)`, line, "(node)");
  }
  if (line.startsWith("(Use `node --trace-warnings") || line.startsWith("(Use `node --trace-deprecation")) {
    return line;
  }
  return void 0;
}

function omitMatchingLines(output, label3, shouldOmit, summarySuffix) {
  const compacted = [];
  const omitted = { count: 0 };
  for (const line of output.split("\n")) {
    if (shouldOmit(line)) {
      omitted.count += 1;
    } else {
      flushOmittedLines(compacted, label3, omitted, summarySuffix);
      compacted.push(line);
    }
  }
  flushOmittedLines(compacted, label3, omitted, summarySuffix);
  return compacted.join("\n");
}

function omitNonDiagnosticLines(output, label3, shouldOmit) {
  return omitMatchingLines(output, label3, shouldOmit, "non-diagnostic");
}

function flushOmittedLines(compacted, label3, omitted, summarySuffix) {
  if (omitted.count > 0) {
    compacted.push(`[${label3}: omitted ${omitted.count} ${summarySuffix} line(s)]`);
    omitted.count = 0;
  }
}

function compactPackageManagerOperations(output) {
  if (!hasPackageManagerOperations(output)) {
    return output;
  }
  return collapseRunsWithExamples(
    output,
    isPackageManagerOperationLine,
    packageManagerOperationExample,
    (len, examples) => `[package operations: omitted ${len} row(s); examples: ${examples}]`
  );
}

function hasPackageManagerOperations(output) {
  const hasMarker = output.includes("Installing dependencies from lock file") || output.includes("Lock file operations:") || output.includes("Package operations:") || output.includes("Writing lock file") || output.includes("Generating autoload files") || output.includes("Lock file is up to date");
  return hasMarker && output.split("\n").some((line) => isPackageManagerOperationLine(line));
}

function isPackageManagerOperationLine(line) {
  if (regexTestWithFlags(String.raw`(?:Failed|Error|Exception|Traceback|fatal)`, line, "i")) {
    return false;
  }
  return parsePackageManagerOperation(line) !== void 0;
}

function packageManagerOperationExample(line) {
  const parsed = parsePackageManagerOperation(line);
  if (parsed === void 0) {
    return void 0;
  }
  return parsed.version !== void 0 ? `${parsed.pkg} (${parsed.version})` : parsed.pkg;
}

function parsePackageManagerOperation(line) {
  const restAfterDash = stripPrefix(line, "  - ");
  if (restAfterDash === void 0) {
    return void 0;
  }
  const operationSplit = splitOnce(restAfterDash, " ");
  if (operationSplit === void 0) {
    return void 0;
  }
  const operation = operationSplit[0];
  let rest = operationSplit[1];
  if (!["Installing", "Locking", "Updating", "Removing", "Downloading"].includes(operation)) {
    return void 0;
  }
  const packageSplit = splitOnce(rest, " ");
  let pkg;
  if (packageSplit === void 0) {
    pkg = rest;
    rest = "";
  } else {
    pkg = packageSplit[0];
    rest = packageSplit[1];
  }
  if (pkg.length === 0) {
    return void 0;
  }
  if (rest.length === 0) {
    return { operation, pkg, version: void 0 };
  }
  const afterOpen = stripPrefix(rest, "(");
  if (afterOpen !== void 0) {
    const closeSplit = splitOnce(afterOpen, ")");
    if (closeSplit !== void 0) {
      const version2 = closeSplit[0];
      const afterClose = closeSplit[1];
      if (afterClose.length === 0 || afterClose.startsWith(": ")) {
        return { operation, pkg, version: version2 };
      }
    }
  }
  if (rest.startsWith(": ")) {
    return { operation, pkg, version: void 0 };
  }
  return void 0;
}

function uniqueStrings(items) {
  const unique2 = [];
  for (const item of items) {
    if (!unique2.includes(item)) {
      unique2.push(item);
    }
  }
  return unique2;
}

function summarizeWithMore(items, maxItems) {
  const shown = items.slice(0, maxItems);
  const omitted = saturatingSub(items.length, shown.length);
  if (omitted > 0) {
    return `${shown.join(", ")}, ... +${omitted} more`;
  }
  return shown.join(", ");
}

function compactNpmPackOutput(output) {
  if (!looksLikeNpmPackOutput(output)) {
    return output;
  }
  const compacted = [];
  let inTarballContents = false;
  const omittedFileRows = { count: 0 };
  for (const line of output.split("\n")) {
    const normalizedLine = stripNpmSpinnerPrefix(line);
    if (normalizedLine === "npm notice Tarball Contents") {
      inTarballContents = true;
      compacted.push(line);
      continue;
    }
    if (normalizedLine === "npm notice Tarball Details") {
      flushNpmPackOmitted(compacted, omittedFileRows);
      inTarballContents = false;
      compacted.push(line);
      continue;
    }
    if (inTarballContents && isNpmPackFileListingLine(normalizedLine)) {
      omittedFileRows.count += 1;
      continue;
    }
    compacted.push(line);
  }
  flushNpmPackOmitted(compacted, omittedFileRows);
  return compacted.join("\n");
}

function flushNpmPackOmitted(compacted, omittedFileRows) {
  if (omittedFileRows.count > 0) {
    compacted.push(`[npm pack tarball contents: omitted ${omittedFileRows.count} file listing line(s)]`);
    omittedFileRows.count = 0;
  }
}

function isNpmPackFileListingLine(line) {
  const rest0 = stripPrefix(line, "npm notice ");
  if (rest0 === void 0) {
    return false;
  }
  let numberEnd = rest0.length;
  for (let i2 = 0; i2 < rest0.length; i2++) {
    const ch = rest0[i2];
    if (!isAsciiDigit2(ch) && ch !== ".") {
      numberEnd = i2;
      break;
    }
  }
  if (numberEnd === 0 || !isDecimalNumber(rest0.slice(0, numberEnd))) {
    return false;
  }
  const rest = rest0.slice(numberEnd).trimStart();
  return ["B", "kB", "MB", "GB"].some((unit) => {
    const value2 = stripPrefix(rest, unit);
    return value2 !== void 0 && value2.startsWith(" ");
  });
}

function stripNpmSpinnerPrefix(line) {
  const trimmed = trimStartMatchesChars(line, ["|", "/", "-"]);
  if (trimmed.startsWith("npm notice ")) {
    return trimmed;
  }
  return line;
}

function isDecimalNumber(value2) {
  if (value2.length === 0) {
    return false;
  }
  let hasDigit = false;
  let dotCount = 0;
  for (const ch of value2) {
    if (isAsciiDigit2(ch)) {
      hasDigit = true;
    } else if (ch === ".") {
      dotCount += 1;
    } else {
      return false;
    }
  }
  return dotCount <= 1 && hasDigit;
}

function compactGoOutput(output) {
  const compacted = [];
  const downloadCount = { count: 0 };
  for (const line of output.split("\n")) {
    if (isGoModuleDownloadChatterLine(line)) {
      downloadCount.count += 1;
    } else {
      flushGoDownloads(compacted, downloadCount);
      compacted.push(line);
    }
  }
  flushGoDownloads(compacted, downloadCount);
  return compacted.join("\n");
}

function flushGoDownloads(compacted, downloadCount) {
  if (downloadCount.count > 0) {
    compacted.push(`[go test: omitted ${downloadCount.count} dependency download line(s)]`);
    downloadCount.count = 0;
  }
}

function isGoModuleDownloadChatterLine(line) {
  if (isDiagnosticLine(line)) {
    return false;
  }
  return line.startsWith("go: downloading ") || line.startsWith("go: finding module for package ") || line.startsWith("go: extracting ") || line.startsWith("go: found ") && line.includes(" in ");
}

function compactRepeatedDiagnosticBlocks(output) {
  const lines = output.split("\n");
  const diagnosticLines = lines.map((line) => isDiagnosticLine(line));
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    const repeatedBlock = findRepeatedDiagnosticBlock(lines, diagnosticLines, i2);
    if (repeatedBlock === void 0) {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    compacted.push(...lines.slice(i2, i2 + repeatedBlock.lineCount));
    compacted.push(
      `[repeated diagnostic block: previous ${repeatedBlock.lineCount} line(s) repeated ${repeatedBlock.repetitions} more time(s)]`
    );
    i2 += repeatedBlock.lineCount * (repeatedBlock.repetitions + 1);
  }
  return compacted.join("\n");
}

function findRepeatedDiagnosticBlock(lines, diagnosticLines, start) {
  for (let lineCount = 6; lineCount >= 2; lineCount--) {
    if (start + lineCount * 2 > lines.length) {
      continue;
    }
    if (!diagnosticLines.slice(start, start + lineCount).some((isDiagnostic) => isDiagnostic)) {
      continue;
    }
    let repetitions = 0;
    while (start + (repetitions + 2) * lineCount <= lines.length) {
      const offset = start + (repetitions + 1) * lineCount;
      if (!arraySliceEqual(lines, start, offset, lineCount)) {
        break;
      }
      repetitions += 1;
    }
    if (repetitions > 0) {
      return { lineCount, repetitions };
    }
  }
  return void 0;
}

function isDiagnosticLine(line) {
  return regexTestWithFlags(
    String.raw`(?:\u2715|\u2717|\u00D7)|\b(?:error|warning|warn|fatal|failed|failure|traceback|exception|panic|assertion|aborted|abort trap|segmentation fault|core dumped)\b|npm ERR!|^E:|^W:|^FAIL\b`,
    line,
    "i"
  );
}

function compactCargoProgress(output) {
  if (!hasCargoProgressOutput(output)) {
    return output;
  }
  return omitMatchingLines(output, "cargo progress", isCargoProgressLine, "progress");
}

function hasCargoProgressOutput(output) {
  return !hasCargoFailure(output) && hasCargoTerminalSummary(output) && hasCargoProgressEvidence(output);
}

function hasCargoProgressEvidence(output) {
  return output.split("\n").some((line) => {
    const trimmed = line.trimStart();
    return CARGO_PROGRESS_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
  });
}

function isCargoProgressLine(line) {
  if (isDiagnosticLine(line)) {
    return false;
  }
  const trimmed = line.trimStart();
  return CARGO_PROGRESS_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

function hasCargoFailure(output) {
  return output.split("\n").some((line) => {
    const trimmed = line.trimStart();
    return trimmed.startsWith("error:") || trimmed.startsWith("error[") || trimmed.startsWith("test result: FAILED") || trimmed.startsWith("failures:");
  });
}

function hasCargoTerminalSummary(output) {
  return output.split("\n").some((line) => {
    const trimmed = line.trimStart();
    return trimmed.startsWith("Finished ") && trimmed.includes(" target(s) in") || trimmed.startsWith("test result: ok.");
  });
}

function compactUnittestOutput(output) {
  if (hasPassingUnittestSummary(output)) {
    return omitNonDiagnosticLines(
      output,
      "unittest progress",
      isUnittestSuccessProgressLine
    );
  }
  return output;
}

function hasPassingUnittestSummary(output) {
  return regexTest(
    String.raw`(?:^|\n)Ran \d+ tests? in \d+(?:\.\d+)?s\s*(?:\n|$)`,
    output
  ) && regexTest(String.raw`(?:^|\n)OK(?:\s+\([^)]+\))?\s*(?:\n|$)`, output) && !regexTestWithFlags(
    String.raw`(?:^|\n)(?:FAILED|ERROR|FAIL):|\b(?:failures?|errors?)=\d*[1-9]\d*`,
    output,
    "i"
  );
}

function isUnittestSuccessProgressLine(line) {
  if (isDiagnosticLine(line)) {
    return false;
  }
  const allDashes = [...line].every((ch) => ch === "-") && byteLength(line) >= 20;
  const allProgressChars = line.length > 0 && [...line].every((ch) => ".sSxXuUbB".includes(ch));
  const testLine = regexTest(String.raw`^test_\S+ \([^)]+\) \.\.\. ok$`, line);
  return allDashes || allProgressChars || testLine;
}

function isClangFormatDebugLine(line) {
  return regexTest(String.raw`^<Thread_\d+:DEBUG> (?:\$ .+|took \d+ms)$`, line);
}

function compactCmakeConfigureProbeRuns(output) {
  return collapseContiguousRuns(
    output,
    isCmakeConfigureProbeLine,
    8,
    (block2) => `[cmake configure: omitted ${block2.length} status probe line(s)]`
  );
}

function isCmakeConfigureProbeLine(line) {
  if (!line.startsWith("-- ") || regexTest(
    String.raw`^-- (?:Configuring done|Generating done|Build files have been written to:)`,
    line
  )) {
    return false;
  }
  return regexTest(String.raw`^-- Performing Test \S+(?: - Success)?$`, line) || isCmakeLookingForProbeLine(line) || regexTest(String.raw`^-- Detecting .+(?: - done)?$`, line) || regexTest(String.raw`^-- Check(?:ing)? .+(?: - done)?$`, line) || regexTest(
    String.raw`^-- Check for working \S+ compiler: .+(?: - (?:skipped|works))?$`,
    line
  );
}

function isCmakeLookingForProbeLine(line) {
  return !line.endsWith(" - not found") && regexTest(String.raw`^-- Looking for .+(?: - found)?$`, line);
}

function compactMavenDependencyTransfer(output) {
  if (!hasMavenDependencyTransfer(output)) {
    return output;
  }
  return collapseRunsWithExamples(
    output,
    isMavenDependencyTransferLine,
    mavenDependencyTransferExample,
    (len, examples) => `[maven dependency transfer: omitted ${len} row(s); examples: ${examples}]`
  );
}

function compactMavenPassingTests(output) {
  if (!hasMavenPassingTests(output)) {
    return output;
  }
  return collapseRunsWithExamples(
    output,
    isMavenPassingTestLine,
    mavenPassingTestExample,
    (len, examples) => `[maven test summary: omitted ${len} passing class row(s); examples: ${examples}]`
  );
}

function compactMavenInfoBoilerplate(output) {
  if (!hasMavenInfoBoilerplate(output)) {
    return output;
  }
  return omitMatchingLines(
    output,
    "maven boilerplate",
    isMavenInfoBoilerplateLine,
    "boilerplate"
  );
}

function hasMavenDependencyTransfer(output) {
  return isMavenOutput(output) && output.split("\n").some((line) => line.startsWith("[INFO] Downloading from ") || line.startsWith("[INFO] Downloaded from "));
}

function hasMavenPassingTests(output) {
  return isMavenOutput(output) && output.split("\n").some((line) => line.startsWith("[INFO] Tests run: ") && line.includes(", Failures: 0, Errors: 0, Skipped: "));
}

function hasMavenInfoBoilerplate(output) {
  return isMavenOutput(output) && output.split("\n").some((line) => isMavenInfoBoilerplateLine(line));
}

function isMavenOutput(output) {
  return output.split("\n").some((line) => line.startsWith("[INFO] Scanning for projects...") || line.startsWith("[INFO] BUILD SUCCESS") || line.startsWith("[INFO] BUILD FAILURE") || line.startsWith("[INFO] Reactor Build Order:") || line.startsWith("[INFO] Total time:"));
}

function isMavenDependencyTransferLine(line) {
  return regexTest(
    String.raw`^\[INFO\] (?:Downloading|Downloaded) from \S+: https?://\S+(?: \([^)]+\))?$`,
    line
  );
}

function mavenDependencyTransferExample(line) {
  const split = rsplitOnce(line, " (");
  const withoutSize = split !== void 0 ? split[0] : line;
  const parts = withoutSize.split("/");
  if (parts.length < 3) {
    return void 0;
  }
  const version2 = parts[parts.length - 2];
  const name = parts[parts.length - 3];
  return `${name} ${version2}`;
}

function isMavenPassingTestLine(line) {
  return regexTest(
    String.raw`^\[INFO\] Tests run: \d+, Failures: 0, Errors: 0, Skipped: \d+, Time elapsed: \S+\s+s(?:\s+(?:--|-)\s+in\s+\S+)?$`,
    line
  );
}

function mavenPassingTestExample(line) {
  return regexCaptureFirst(String.raw`\s(?:--|-)\s+in\s+(\S+)$`, line) ?? "summary";
}

function isMavenInfoBoilerplateLine(line) {
  const trimmed = line.trimEnd();
  return trimmed === "[INFO]" || regexTest(String.raw`^\[INFO\] -{20,}\s*$`, trimmed) || regexTest(String.raw`^\[INFO\] -{20,}\[\s*\S+\s*\]-{20,}\s*$`, trimmed) || regexTest(String.raw`^\[INFO\] -{2,}<\s*[^>\n]+\s*>-{2,}\s*$`, trimmed) || regexTest(String.raw`^\[INFO\] Building .+ \[\d+/\d+\]\s*$`, trimmed) || regexTest(
    String.raw`^\[INFO\] --- \S+(?::\S+)+ (?:\([^)]+\) )?@ \S+ ---\s*$`,
    trimmed
  );
}

function compactGolangciLintOutput(output, requireMarker) {
  if (requireMarker && !hasGolangciLintMarker(output)) {
    return output;
  }
  return omitNonDiagnosticLines(
    output,
    "golangci-lint progress",
    isGolangciLintOmittableLine
  );
}

function hasGolangciLintMarker(output) {
  return output.split("\n").some((line) => regexTest(
    String.raw`^(?:go run github\.com/golangci/golangci-lint/cmd/golangci-lint(?:@\S+)?|(?:[A-Za-z0-9_./+-]+/)?golangci-lint)\s+run\b`,
    line
  )) || (output.includes("level=info") || output.includes("INFO")) && output.split("\n").some((line) => regexTest(String.raw`^(?:level=info\b|INFO\b)`, line)) && output.split("\n").some((line) => hasGolangciLintSafeInfoPrefix(line));
}

function isGolangciLintOmittableLine(line) {
  if (isDiagnosticLine(line)) {
    return false;
  }
  return isGoModuleDownloadChatterLine(line) || regexTest(String.raw`^(?:level=info\b|INFO\b)`, line) && hasGolangciLintSafeInfoPrefix(line);
}

function hasGolangciLintSafeInfoPrefix(line) {
  return regexTest(
    String.raw`\[(?:config_reader|lintersdb|loader|runner|linters_context|filename_unadjuster|uniq_by_line|source_code)\b`,
    line
  );
}

function compactGitProgress(output) {
  const lines = output.split("\n").map((line) => compactGitProgressLine(line));
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    const line = lines[i2];
    const progressKey = getGitProgressLineKey(line.output);
    if (progressKey === void 0) {
      pushCompactedLine(compacted, line);
      i2 += 1;
      continue;
    }
    let j = i2 + 1;
    while (j < lines.length && getGitProgressLineKey(lines[j].output) === progressKey) {
      j += 1;
    }
    const omittedLines = j - i2 - 1;
    if (omittedLines > 0) {
      compacted.push(`[git progress: omitted ${omittedLines} earlier ${progressKey} line(s)]`);
      compacted.push(lines[j - 1].output);
    } else {
      pushCompactedLine(compacted, line);
    }
    i2 = j;
  }
  return compacted.join("\n");
}

function unchangedLine(line) {
  return { output: line, omittedFrames: 0 };
}

function pushCompactedLine(compacted, line) {
  if (line.omittedFrames > 0) {
    compacted.push(`[git progress: omitted ${line.omittedFrames} earlier frame(s)]`);
  }
  compacted.push(line.output);
}

function compactGitProgressLine(line) {
  return compactProgressPatternsUnlessDiagnostic(
    line,
    [
      String.raw`(?:remote: )?(?:Enumerating|Counting|Compressing) objects:\s+\d+%[^)]*\(\d+/\d+\)(?:, done\.)?`,
      String.raw`(?:remote: )?Receiving objects:\s+\d+%[^)]*\(\d+/\d+\)(?:, [^)]*)?`,
      String.raw`(?:remote: )?Resolving deltas:\s+\d+%[^)]*\(\d+/\d+\)(?:, done\.)?`,
      String.raw`(?:remote: )?Writing objects:\s+\d+%[^)]*\(\d+/\d+\)(?:, [^)]*)?`
    ]
  );
}

function compactProgressPatternsUnlessDiagnostic(line, patterns) {
  if (isDiagnosticLine(line)) {
    return unchangedLine(line);
  }
  return compactProgressPatterns(line, patterns);
}

function compactProgressPatterns(line, patterns) {
  let output = line;
  let omittedFrames = 0;
  for (const pattern of patterns) {
    const result = compactRepeatedProgressFrames(output, pattern);
    output = result.output;
    omittedFrames += result.omittedFrames;
  }
  return { output, omittedFrames };
}

function compactRepeatedProgressFrames(line, pattern) {
  const matches2 = regexFindAll(pattern, line);
  if (matches2.length <= 1) {
    return unchangedLine(line);
  }
  const first2 = matches2[0];
  const last = matches2[matches2.length - 1];
  const output = line.slice(0, first2.start) + line.slice(last.start, last.end) + line.slice(last.end);
  return { output, omittedFrames: matches2.length - 1 };
}

function getGitProgressLineKey(line) {
  if (isDiagnosticLine(line)) {
    return void 0;
  }
  const stripped = stripPrefix(line, "remote:");
  const normalized = stripped !== void 0 ? stripped.trimStart() : line;
  const split = splitOnce(normalized, ":");
  if (split === void 0) {
    return void 0;
  }
  const key3 = split[0];
  const rest = split[1];
  if (![
    "Enumerating objects",
    "Counting objects",
    "Compressing objects",
    "Receiving objects",
    "Writing objects",
    "Resolving deltas"
  ].includes(key3)) {
    return void 0;
  }
  if (regexTest(String.raw`^\s+\d+%`, rest)) {
    return key3;
  }
  return void 0;
}

function compactJsTestOutput(output) {
  let compacted = compactRepeatedNodeWarnings(output);
  compacted = compactJestRunsProgress(compacted);
  if (hasPassingJsTestSummary(compacted)) {
    compacted = omitNonDiagnosticLines(compacted, "js test progress", isJsTestProgressLine);
  }
  return compacted;
}

function compactJestRunsProgress(output) {
  if (!hasJestRunsProgress(output)) {
    return output;
  }
  return omitMatchingLines(
    output,
    "jest runs progress",
    isJestRunsProgressLine,
    "progress"
  );
}

function hasPassingJsTestSummary(output) {
  if (regexTest(String.raw`(?:^|\n)\s*(?:FAIL|\u2717|\u00D7|\u2716)\s`, output) || regexTestWithFlags(String.raw`\b[1-9]\d*\s+failed\b`, output, "i") || regexTest(String.raw`(?:^|\n)\s*\d+\s+failing\b`, output) || regexTest(String.raw`(?:^|\n)\s*not\s+ok\s+\d+\b`, output) || regexTest(String.raw`(?:^|\n)#\s+fail\s+[1-9]\d*\b`, output) || regexTest(String.raw`(?:^|\n)\s*Bail out!`, output) || regexTest(String.raw`(?:^|\n).*ERR!`, output)) {
    return false;
  }
  return regexTestWithFlags(
    String.raw`(?:^|\n)\s*(?:Test Files|Tests?:|Test Suites:)\s+\d+\s+passed\b`,
    output,
    "i"
  ) || regexTest(String.raw`(?:^|\n)\s+\d+\s+passing\b`, output) || regexTest(String.raw`(?:^|\n)#\s+ok\b`, output) || regexTest(String.raw`(?:^|\n)#\s+pass\s+[1-9]\d*\b`, output);
}

function hasJestRunsProgress(output) {
  return output.split("\n").some((line) => regexTest(String.raw`^\s*RUNS\s+\S`, line)) && hasJestSummaryMarker(output);
}

function hasJestSummaryMarker(output) {
  return output.split("\n").some((line) => line.startsWith("Test Suites:") || line.startsWith("Tests:") || line.startsWith("Snapshots:") || line.startsWith("Ran all test suites"));
}

function isJestRunsProgressLine(line) {
  return regexTest(String.raw`^\s*RUNS\s+\S`, line);
}

function isJsTestProgressLine(line) {
  return !isDiagnosticLine(line) && (regexTest(String.raw`^\s*RUN\s+v?\d+\.\d+\.\d+`, line) || regexTest(String.raw`^\s*(?:\u2713|\u2714|\u221A)\s+.+(?:\s+\d+ms|\s+\(\d+(?:ms|s)\))$`, line) || regexTest(String.raw`^\s*PASS\s+.+$`, line) || regexTest(String.raw`^\s*ok\s+\d+\b`, line) || regexTest(String.raw`^[.]+(?:\s+\[\s*\d+%\])?\s*$`, line));
}

function compactGradleOutput(output) {
  const compacted = compactIntralineProgress(
    output,
    "gradle rich-console progress",
    compactGradleProgressFrames
  );
  return omitNonDiagnosticLines(compacted, "gradle boilerplate", isGradleBoilerplateLine);
}

function compactIntralineProgress(output, label3, compactLine) {
  let omittedFrames = 0;
  const compacted = output.split("\n").map((line) => {
    const result = compactLine(line);
    omittedFrames += result.omittedFrames;
    return result.output;
  }).join("\n");
  if (omittedFrames === 0) {
    return output;
  }
  return `[${label3}: omitted ${omittedFrames} earlier frame(s)]
${compacted}`;
}

function compactGradleProgressFrames(line) {
  if (isDiagnosticLine(line)) {
    return unchangedLine(line);
  }
  const matches2 = regexFindAll(
    String.raw`(?:<[-=]+>|\u2502[^\u2502\n]+\u2502)\s+\d+%\s+(?:INITIALIZING|CONFIGURING|EXECUTING|WAITING)\s+\[[^\]\n]+\]`,
    line
  );
  if (matches2.length <= 1) {
    return unchangedLine(line);
  }
  let output = "";
  let cursor = 0;
  let omittedFrames = 0;
  let start = 0;
  while (start < matches2.length) {
    let end = start;
    while (end + 1 < matches2.length && isGradleProgressFrameSeparator(line, matches2[end], matches2[end + 1])) {
      end += 1;
    }
    const startRange = matches2[start];
    const endRange = matches2[end];
    if (end > start) {
      output += line.slice(cursor, startRange.start);
      output += line.slice(endRange.start, endRange.end);
      omittedFrames += end - start;
    } else {
      output += line.slice(cursor, endRange.end);
    }
    cursor = endRange.end;
    start = end + 1;
  }
  output += line.slice(cursor);
  return { output, omittedFrames };
}

function isGradleProgressFrameSeparator(line, previous, next) {
  const separator2 = line.slice(previous.end, next.start);
  if (separator2.length === 0) {
    return true;
  }
  for (let i2 = 0; i2 < separator2.length; i2 += 6) {
    if (separator2.slice(i2, i2 + 6) !== "> IDLE") {
      return false;
    }
  }
  return true;
}

function isGradleBoilerplateLine(line) {
  return line.startsWith("Consider enabling configuration cache to speed up this build: https://docs.gradle.org/") && line.endsWith("/userguide/configuration_cache_enabling.html") || line === "> Run with --stacktrace option to get the stack trace." || line === "> Run with --info or --debug option to get more log output." || line === "> Run with --scan to get full insights from a Build Scan (powered by Develocity)." || line === "> Get more help at https://help.gradle.org.";
}

function compactUvProgress(output) {
  if (!(hasUvSummaryMarker(output) && output.split("\n").some((line) => isUvProgressLine(line)))) {
    return output;
  }
  const compacted = collapseContiguousRuns(output, isUvProgressLine, 4, (block2) => {
    const examples = [];
    for (const line of block2) {
      const example = uvProgressExample(line);
      if (example !== void 0) {
        examples.push(example);
      }
    }
    if (examples.length !== block2.length) {
      return void 0;
    }
    const activityList = [];
    for (const line of block2) {
      const activity = uvProgressActivity(line);
      if (activity !== void 0) {
        activityList.push(activity);
      }
    }
    const activities = uniqueStrings(activityList);
    const activitySummary = activities.length === 0 ? "" : `; active: ${summarizeWithMore(activities, 5)}`;
    return `[uv progress: omitted ${block2.length} row(s); examples: ${summarizeWithMore(uniqueStrings(examples), 10)}${activitySummary}]`;
  });
  return compacted.replace(/\n+$/, "");
}

function hasUvSummaryMarker(output) {
  return output.split("\n").some((line) => line.startsWith("Using CPython ") && line.includes(" interpreter at:") || regexTest(String.raw`^(?:Resolved|Prepared|Installed|Audited) \d+ packages? in \S+`, line));
}

function isUvProgressLine(line) {
  const normalized = stripAnsi(line).trim();
  if (isDiagnosticLine(normalized)) {
    return false;
  }
  return regexTest(
    String.raw`^[\u2801-\u28FF]\s+(?:Resolving dependencies|Preparing packages|Installing packages|Building|Downloading)\b`,
    normalized
  ) || regexTest(
    String.raw`^[A-Za-z0-9_.-]+\s+-{10,}\s+\d+(?:\.\d+)?\s*(?:B|KiB|MiB|GiB|KB|MB|GB)/\d+(?:\.\d+)?\s*(?:B|KiB|MiB|GiB|KB|MB|GB)(?:\s+.+)?$`,
    normalized
  );
}

function uvProgressExample(line) {
  const normalized = stripAnsi(line).trim();
  const pkg = regexCaptureFirst(String.raw`^([A-Za-z0-9_.-]+)\s+-{10,}`, normalized);
  if (pkg !== void 0) {
    return pkg;
  }
  const firstCodePoint = normalized.codePointAt(0);
  if (firstCodePoint === void 0) {
    return void 0;
  }
  const firstChar = String.fromCodePoint(firstCodePoint);
  if (!(firstChar >= "\u2801" && firstChar <= "\u28FF")) {
    return void 0;
  }
  const withoutSpinner = normalized.slice(firstChar.length).trimStart();
  const dotsIndex = withoutSpinner.indexOf("...");
  const spacesIndex = withoutSpinner.indexOf("  ");
  const candidates = [dotsIndex, spacesIndex].filter((index2) => index2 !== -1);
  const end = candidates.length > 0 ? Math.min(...candidates) : withoutSpinner.length;
  return withoutSpinner.slice(0, end).trim();
}

function uvProgressActivity(line) {
  return regexCaptureFirst(
    String.raw`\s{2,}((?:Building|Downloading|Installing) .+)$`,
    stripAnsi(line).trim()
  );
}

function stripAnsi(text2) {
  let output = "";
  const chars = Array.from(text2);
  let i2 = 0;
  while (i2 < chars.length) {
    const ch = chars[i2];
    i2 += 1;
    if (ch !== "\x1B" || chars[i2] !== "[") {
      output += ch;
      continue;
    }
    i2 += 1;
    while (i2 < chars.length) {
      const next = chars[i2];
      i2 += 1;
      if (next >= "@" && next <= "~") {
        break;
      }
    }
  }
  return output;
}

function compactNxLernaFrameProgress(output) {
  if (!hasNxLernaFrameProgress(output)) {
    return output;
  }
  const canOmitStaticTaskTable = output.split("\n").some((line) => regexTest(String.raw`^\s*NX\s+Successfully ran target\b`, line));
  const compacted = [];
  const omitted = { count: 0 };
  for (const line of output.split("\n")) {
    if (isNxLernaFrameNoiseLine(line, canOmitStaticTaskTable)) {
      omitted.count += 1;
      continue;
    }
    if (line.trim().length === 0 && omitted.count > 0) {
      continue;
    }
    flushNxLernaOmitted(compacted, omitted);
    compacted.push(line);
  }
  flushNxLernaOmitted(compacted, omitted);
  return compacted.join("\n");
}

function flushNxLernaOmitted(compacted, omitted) {
  if (omitted.count > 0) {
    compacted.push(`[nx frame progress: omitted ${omitted.count} frame line(s)]`);
    omitted.count = 0;
  }
}

function isNxLernaFrameNoiseLine(line, canOmitStaticTaskTable) {
  return regexTest(String.raw`^\u2014{20,}$`, line) || regexTest(
    String.raw`^\s*(?:NX|Lerna \(powered by Nx\))\s+Running target \S+ for \d+ projects?$`,
    line
  ) || regexTest(
    String.raw`^\s*NX\s+Running \d+ \S+ tasks\.\.\.\s+Cache\s+Duration$`,
    line
  ) || canOmitStaticTaskTable && regexTest(
    String.raw`^\s*NX\s+Running \d+ \S+ tasks\.\.\.\s+Cache\s+Duration\s+.+$`,
    line
  ) || regexTest(
    String.raw`^\s+\u2192\s+Executing \d+/\d+ remaining tasks(?: in parallel)?\.\.\.$`,
    line
  ) || regexTest(
    String.raw`^\s+[\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F]\s+(?:nx run \S+|@[\w.-]+/[\w.-]+:\S+)$`,
    line
  );
}

function hasNxLernaFrameProgress(output) {
  return output.includes("NX   Running target") || output.includes("Lerna (powered by Nx)") || output.split("\n").some((line) => regexTest(String.raw`^\s*NX\s+Running \d+ \S+ tasks\.\.\.\s+Cache\s+Duration`, line));
}

function compactPnpmOutput(output) {
  let compacted = compactRepeatedNodeWarnings(output);
  compacted = compactPackageManagerOperations(compacted);
  return compactPnpmInstallProgress(compacted);
}

function compactPnpmInstallProgress(output) {
  const lines = output.split("\n");
  const lastProgressIndexes = /* @__PURE__ */ new Map();
  const lastDownloadIndexes = /* @__PURE__ */ new Map();
  const lastWarningCounterIndexes = /* @__PURE__ */ new Map();
  for (let index2 = 0; index2 < lines.length; index2++) {
    const line = lines[index2];
    if (isPnpmProgressLine(line)) {
      lastProgressIndexes.set(pnpmWorkspacePrefix(line), index2);
    }
    const packageName = pnpmDownloadPackage(line);
    if (packageName !== void 0) {
      lastDownloadIndexes.set(packageName, index2);
    }
    if (isPnpmWarningCounterLine(line)) {
      lastWarningCounterIndexes.set(pnpmWorkspacePrefix(line), index2);
    }
  }
  const compacted = [];
  const omittedProgress = { count: 0 };
  const omittedWarningCounters = { count: 0 };
  const omittedDownloads = /* @__PURE__ */ new Map();
  for (let index2 = 0; index2 < lines.length; index2++) {
    const line = lines[index2];
    const packageBarSize = pnpmPackageBarSize(index2 >= 1 ? lines[index2 - 1] : void 0, line);
    if (packageBarSize !== void 0) {
      compacted.push(`[pnpm install package bar: omitted ${packageBarSize} plus character(s)]`);
      continue;
    }
    const progressPrefix = pnpmWorkspacePrefix(line);
    if (isPnpmProgressLine(line) && lastProgressIndexes.get(progressPrefix) !== index2) {
      omittedProgress.count += 1;
      continue;
    }
    const packageName = pnpmDownloadPackage(line);
    if (packageName !== void 0 && lastDownloadIndexes.get(packageName) !== index2) {
      omittedDownloads.set(packageName, (omittedDownloads.get(packageName) ?? 0) + 1);
      continue;
    }
    const warningPrefix = pnpmWorkspacePrefix(line);
    if (isPnpmWarningCounterLine(line) && lastWarningCounterIndexes.get(warningPrefix) !== index2) {
      omittedWarningCounters.count += 1;
      continue;
    }
    if (isPnpmProgressLine(line)) {
      flushPnpmProgress(compacted, omittedProgress);
    } else if (packageName !== void 0) {
      flushPnpmDownload(compacted, omittedDownloads, packageName);
    } else if (isPnpmWarningCounterLine(line)) {
      flushPnpmWarningCounters(compacted, omittedWarningCounters);
    }
    compacted.push(line);
  }
  return compacted.join("\n");
}

function flushPnpmProgress(compacted, omittedProgress) {
  if (omittedProgress.count > 0) {
    compacted.push(`[pnpm install progress: omitted ${omittedProgress.count} earlier progress line(s)]`);
    omittedProgress.count = 0;
  }
}

function flushPnpmWarningCounters(compacted, omittedWarningCounters) {
  if (omittedWarningCounters.count > 0) {
    compacted.push(`[pnpm install warning counter: omitted ${omittedWarningCounters.count} earlier counter line(s)]`);
    omittedWarningCounters.count = 0;
  }
}

function flushPnpmDownload(compacted, omittedDownloads, packageName) {
  const omitted = omittedDownloads.get(packageName) ?? 0;
  omittedDownloads.delete(packageName);
  if (omitted > 0) {
    compacted.push(`[pnpm install downloads: omitted ${omitted} earlier frame(s) for ${packageName}]`);
  }
}

function isPnpmProgressLine(line) {
  const rest = stripPnpmWorkspacePrefix(line);
  return regexTest(
    String.raw`^Progress: resolved \d+, reused \d+, downloaded \d+, added \d+(?:, done)?$`,
    rest
  );
}

function pnpmDownloadPackage(line) {
  const stripped = stripPnpmWorkspacePrefix(line);
  const rest = stripPrefix(stripped, "Downloading ");
  if (rest === void 0) {
    return void 0;
  }
  const split = splitOnce(rest, ": ");
  if (split === void 0) {
    return void 0;
  }
  const [pkg, sizes] = split;
  if (regexTest(
    String.raw`^\d+(?:\.\d+)? (?:B|kB|MB|GB)/\d+(?:\.\d+)? (?:B|kB|MB|GB)(?:, done)?$`,
    sizes
  )) {
    return pkg;
  }
  return void 0;
}

function isPnpmWarningCounterLine(line) {
  return regexTest(
    String.raw`^\s*WARN\s+\d+ other warnings$`,
    stripPnpmWorkspacePrefix(line)
  );
}

function pnpmPackageBarSize(previousLine, line) {
  if (previousLine === void 0) {
    return void 0;
  }
  const countText = stripPrefix(previousLine, "Packages: +");
  if (countText === void 0) {
    return void 0;
  }
  const count2 = parseUsize(countText);
  if (count2 === void 0) {
    return void 0;
  }
  if (line.length > 0 && [...line].every((ch) => ch === "+") && line.length === count2) {
    return count2;
  }
  return void 0;
}

function pnpmWorkspacePrefix(line) {
  const end = pnpmWorkspacePrefixEnd(line);
  return end !== void 0 ? line.slice(0, end) : "";
}

function stripPnpmWorkspacePrefix(line) {
  const end = pnpmWorkspacePrefixEnd(line);
  return end !== void 0 ? line.slice(end) : line;
}

function pnpmWorkspacePrefixEnd(line) {
  const index2 = line.indexOf("|");
  if (index2 === -1) {
    return void 0;
  }
  if (index2 === 0) {
    return void 0;
  }
  let end = index2 + 1;
  for (const ch of line.slice(end)) {
    if (!isWhitespaceChar2(ch)) {
      break;
    }
    end += ch.length;
  }
  return end;
}

function compactNpmOutput(output) {
  let compacted = compactRepeatedNodeWarnings(output);
  compacted = compactPackageManagerOperations(compacted);
  compacted = compactIntralineProgress(
    compacted,
    "yarn1 install intraline progress",
    compactYarn1ProgressFrames
  );
  return omitNonDiagnosticLines(
    compacted,
    "npm install progress",
    isNpmInstallProgressLine
  );
}

function compactYarn1ProgressFrames(line) {
  return compactProgressPatternsUnlessDiagnostic(line, [String.raw`\[[#-]+\] \d+/\d+`]);
}

function isNpmInstallProgressLine(line) {
  if (isDiagnosticLine(line)) {
    return false;
  }
  const lower = asciiLowercase(line);
  if (regexTest(String.raw`^npm (?:notice|http|timing|info|verb|silly)\b`, lower)) {
    return true;
  }
  if (regexTestWithFlags(
    String.raw`^(?:reify|idealTree|fetchMetadata|extract|rollbackFailedOptional)[:\s]`,
    line,
    "i"
  )) {
    return true;
  }
  const chars = Array.from(line);
  const first2 = chars[0];
  const second = chars[1];
  return first2 !== void 0 && first2 >= "\u2801" && first2 <= "\u28FF" && second !== void 0 && isWhitespaceChar2(second);
}

function compactYarnBerryOutput(output) {
  let compacted = compactYarnBerryProgress(output);
  compacted = compactRepeatedNodeWarnings(compacted);
  compacted = compactPackageManagerOperations(compacted);
  return compactIntralineProgress(
    compacted,
    "yarn1 install intraline progress",
    compactYarn1ProgressFrames
  );
}

function compactYarnBerryProgress(output) {
  if (!hasYarnBerryCompletedOutput(output)) {
    return output;
  }
  return omitMatchingLines(
    output,
    "yarn berry progress",
    isYarnBerryProgressLine,
    "progress"
  );
}

function hasYarnBerryCompletedOutput(output) {
  return output.includes("\u27A4 YN0000:") && output.split("\n").some((line) => line.startsWith("\u27A4 YN0000: \xB7 Done in ") || line.startsWith("\u27A4 YN0000: \xB7 Done with warnings in "));
}

function isYarnBerryProgressLine(line) {
  return line.startsWith("\u27A4 YN0000:") && !line.startsWith("\u27A4 YN0000: \xB7 Done in ") && !line.startsWith("\u27A4 YN0000: \xB7 Done with warnings in ");
}

function compactMakeOutput(output) {
  let compacted = compactIntralineProgress(
    output,
    "ninja build intraline progress",
    compactNinjaProgressFrames
  );
  compacted = compactMakeProgress(compacted);
  compacted = compactGolangciLintOutput(compacted, true);
  return omitNonDiagnosticLines(
    compacted,
    "go module download",
    isGoModuleDownloadChatterLine
  );
}

function compactNinjaProgressFrames(line) {
  return compactProgressPatternsUnlessDiagnostic(
    line,
    [
      String.raw`\[\s*\d+/\d+\]\s+(?:(?:Building|Linking)\s+(?:C|CXX|CUDA|ASM|OBJC|OBJCXX)\s+(?:object|executable|static library|shared library|module)|Generating|Copying|Processing|Re-running CMake|Scanning dependencies of target|Automatic\s+(?:MOC|UIC|RCC))\b[^[]*`
    ]
  );
}

function compactMakeProgress(output) {
  const lines = output.split("\n");
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    const key3 = getMakeProgressKey(lines[i2]);
    if (key3 === void 0) {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    let j = i2 + 1;
    while (j < lines.length && getMakeProgressKey(lines[j]) === key3) {
      j += 1;
    }
    const count2 = j - i2;
    if (count2 >= 4) {
      compacted.push(lines[i2]);
      compacted.push(`[make progress: omitted ${count2 - 1} more ${key3} line(s)]`);
    } else {
      for (let k = i2; k < j; k++) {
        compacted.push(lines[k]);
      }
    }
    i2 = j;
  }
  return compacted.join("\n");
}

function getMakeProgressKey(line) {
  if (isDiagnosticLine(line)) {
    return void 0;
  }
  const trimmed = line.trim();
  const kind = regexCaptureFirst(String.raw`^\[(Compiling|Linking) .+\]$`, trimmed);
  if (kind !== void 0) {
    return asciiLowercase(kind);
  }
  const rule = splitMakeRuleLine(trimmed);
  if (rule !== void 0) {
    const [ruleName, target] = rule;
    const suffix = regexCaptureFirst(String.raw`(\.[A-Za-z0-9_.-]+)$`, target) ?? "";
    return `${ruleName} ${directoryGlob(target, suffix)}`;
  }
  const preprocessing = regexCaptureFirst(String.raw`^Preprocessing\s+(.+\.vp)$`, trimmed);
  if (preprocessing !== void 0) {
    return `Preprocessing ${directoryGlob(preprocessing, ".vp")}`;
  }
  if (regexTest(
    String.raw`^(?:gcc|g\+\+|cc|c\+\+|clang|clang\+\+|[A-Za-z0-9_-]+-gcc|[A-Za-z0-9_-]+-g\+\+)\b.*\s-c\s`,
    trimmed
  )) {
    return "compile command";
  }
  if (regexTest(
    String.raw`^make(?:\[\d+\])?: (?:Entering|Leaving) directory `,
    trimmed
  )) {
    return "make directory";
  }
  return void 0;
}

function splitMakeRuleLine(line) {
  const rules = [
    "HOSTCC",
    "MKLIB",
    "MKEXE",
    "MKDLL",
    "OCAMLC",
    "OCAMLOPT",
    "COQC",
    "COQDEP",
    "COQCHK",
    "COQDOC",
    "LINK",
    "CXX",
    "CPP",
    "CC",
    "AR",
    "AS",
    "LD",
    "GEN"
  ];
  for (const rule of rules) {
    const target = stripPrefix(line, `${rule} `);
    if (target !== void 0) {
      return [rule, target];
    }
  }
  return void 0;
}

function directoryGlob(target, suffix) {
  const slash = target.lastIndexOf("/");
  if (slash !== -1) {
    return `${target.slice(0, slash)}/*${suffix}`;
  }
  return `*${suffix}`;
}

function compactAptOutput(output) {
  let compacted = compactIntralineProgress(
    output,
    "apt intraline progress",
    compactAptProgressFrames
  );
  compacted = compactNeedrestartNoopProgress(compacted);
  compacted = compactPackageManagerOperations(compacted);
  compacted = compactAptDpkgLifecycleBlocks(compacted);
  return omitNonDiagnosticLines(compacted, "apt progress", isAptProgressLine);
}

function compactAptProgressFrames(line) {
  if (isDiagnosticLine(line)) {
    return unchangedLine(line);
  }
  const result = compactProgressPatterns(
    line,
    [
      String.raw`Reading package lists\.\.\. \d+%`,
      String.raw`Building dependency tree\.\.\. \d+%`,
      String.raw`Reading state information\.\.\. \d+%`,
      String.raw`\(Reading database \.\.\. \d+%`
    ]
  );
  const spinnerResult = removeProgressMatches(
    result.output,
    String.raw`\d+% \[(?:Working|Waiting for headers|Connecting to [^\]]+|Connected to [^\]]+)\]\s*`
  );
  return {
    output: spinnerResult.output,
    omittedFrames: result.omittedFrames + spinnerResult.omittedFrames
  };
}

function removeProgressMatches(line, pattern) {
  const matches2 = regexFindAll(pattern, line);
  if (matches2.length === 0) {
    return unchangedLine(line);
  }
  let output = "";
  let cursor = 0;
  for (const match2 of matches2) {
    output += line.slice(cursor, match2.start);
    cursor = match2.end;
  }
  output += line.slice(cursor);
  return { output, omittedFrames: matches2.length };
}

function compactNeedrestartNoopProgress(output) {
  if (!hasNeedrestartNoopSummary(output) || hasNeedrestartActionableState(output)) {
    return output;
  }
  let omittedFrames = 0;
  const compacted = output.split("\n").map((line) => {
    const result = compactNeedrestartProgressLine(line);
    omittedFrames += result.omittedFrames;
    return result.output;
  }).join("\n");
  if (omittedFrames > 0) {
    return `[needrestart progress: omitted ${omittedFrames} no-op scanning frame(s)]
${compacted}`;
  }
  return output;
}

function hasNeedrestartNoopSummary(output) {
  return output.split("\n").some(isNeedrestartNoopSummaryLine);
}

function isNeedrestartNoopSummaryLine(line) {
  switch (line.trim()) {
    case "Running kernel seems to be up-to-date.":
    case "The processor microcode seems to be up-to-date.":
    case "No services need to be restarted.":
    case "No containers need to be restarted.":
    case "No user sessions are running outdated binaries.":
    case "No VM guests are running outdated hypervisor (qemu) binaries on this host.":
      return true;
    default:
      return false;
  }
}

function hasNeedrestartActionableState(output) {
  return output.split("\n").some((line) => {
    const trimmed = line.trim();
    return !isNeedrestartNoopSummaryLine(trimmed) && regexTestWithFlags(
      String.raw`\b(?:pending|reboot|required|restart-needed|NEEDRESTART-|Outdated Libraries|Services to be restarted|Containers to be restarted|User sessions running outdated|VM guests are running outdated|need restarting)\b`,
      trimmed,
      "i"
    );
  });
}

function compactNeedrestartProgressLine(line) {
  if (!line.includes("Scanning ")) {
    return unchangedLine(line);
  }
  const result = removeProgressMatches(
    line,
    String.raw`Scanning (?:processes|processor microcode|linux images)\.\.\. \[[^\]\n]*\]\s*`
  );
  return {
    output: result.output.trim().length === 0 ? "[needrestart progress]" : result.output,
    omittedFrames: result.omittedFrames
  };
}

function compactAptDpkgLifecycleBlocks(output) {
  return collapseContiguousRuns(output, isAptDpkgLifecycleLine, 4, (block2) => {
    const packages = [];
    let triggerCount = 0;
    for (const line of block2) {
      const parsed = parseAptPackageLifecycleLine(line);
      if (parsed !== void 0) {
        const [name, version2] = parsed;
        const existing = packages.find((candidate) => candidate[0] === name);
        if (existing !== void 0) {
          existing[1] = version2;
        } else {
          packages.push([name, version2]);
        }
      } else if (line.startsWith("Processing triggers for ")) {
        triggerCount += 1;
      }
    }
    if (packages.length === 0) {
      return void 0;
    }
    const packageSummary = summarizePackages(packages);
    const triggerSummary = triggerCount > 0 ? `; ${triggerCount} trigger line(s)` : "";
    return `[apt packages: installed ${packages.length} package(s): ${packageSummary}; omitted ${block2.length} dpkg lifecycle line(s)${triggerSummary}]`;
  });
}

function isAptDpkgLifecycleLine(line) {
  return !isDiagnosticLine(line) && (line.startsWith("Selecting previously unselected package ") || line.startsWith("Preparing to unpack ") || line.startsWith("Unpacking ") || line.startsWith("Setting up ") || line.startsWith("Processing triggers for ") || regexTest(String.raw`^running python (?:pre-|post-)?rtupdate hooks for `, line) || regexTest(
    String.raw`^\(Reading database \.\.\. \d+ files and directories currently installed\.\)$`,
    line
  ));
}

function parseAptPackageLifecycleLine(line) {
  const selecting = stripPrefix(line, "Selecting previously unselected package ");
  if (selecting !== void 0) {
    const name = stripSuffix(selecting, ".");
    if (name !== void 0) {
      return [name, void 0];
    }
  }
  const unpackingOrSetting = stripPrefix(line, "Unpacking ") ?? stripPrefix(line, "Setting up ");
  if (unpackingOrSetting !== void 0) {
    const nameSplit = splitOnce(unpackingOrSetting, " (");
    if (nameSplit !== void 0) {
      const versionSplit = splitOnce(nameSplit[1], ")");
      if (versionSplit !== void 0) {
        return [nameSplit[0], versionSplit[0]];
      }
    }
  }
  const preparing = stripPrefix(line, "Preparing to unpack ");
  if (preparing !== void 0) {
    const debSplit = splitOnce(preparing, " ");
    if (debSplit !== void 0) {
      const debSegments = debSplit[0].split("/");
      const fileName = debSegments[debSegments.length - 1];
      const nameSplit = splitOnce(fileName, "_");
      if (nameSplit !== void 0) {
        const versionSplit = rsplitOnce(nameSplit[1], "_");
        if (versionSplit !== void 0) {
          return [nameSplit[0], versionSplit[0]];
        }
      }
    }
  }
  return void 0;
}

function summarizePackages(packages) {
  return summarizeWithMore(
    packages.map(([name, version2]) => version2 !== void 0 ? `${name} (${version2})` : name),
    18
  );
}

function isAptProgressLine(line) {
  return !isDiagnosticLine(line) && (regexTest(String.raw`^\d+% \[`, line) || regexTest(String.raw`\b(?:Hit|Get|Ign):\d+ `, line) || line.includes("Reading package lists...") || line.includes("Building dependency tree...") || line.includes("Reading state information...") || line.startsWith("Selecting previously unselected package ") || line.startsWith("Preparing to unpack ") || line.startsWith("Unpacking ") || line.startsWith("Setting up ") || line.startsWith("Processing triggers for ") || line.startsWith("Fetched ") || line.startsWith("Need to get ") || line.startsWith("After this operation ") || line.startsWith("debconf: ") || line.startsWith("(Reading database "));
}

function isPythonEcosystemNoiseLine(line) {
  return line.startsWith(`WARNING: Running pip as the 'root' user can result in broken permissions`) || line.startsWith("It is recommended to use a virtual environment instead: ") || line.includes("DeprecationWarning: The distutils package is deprecated") || line.includes("SetuptoolsDeprecationWarning:") || line.includes("`numpy.distutils` is deprecated since NumPy 1.23.0") || line.startsWith("Partial import of sklearn during the build process.") || line.startsWith("Matplotlib is not built with the correct FreeType version");
}

function compactSetuptoolsDeprecationBlocks(output) {
  if (!output.includes("SetuptoolsDeprecationWarning") && !output.includes("EasyInstallDeprecationWarning") && !output.includes("DeprecationWarning:")) {
    return output;
  }
  const lines = output.split("\n");
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    if (!isSetuptoolsDeprecationHeader(lines[i2])) {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    const start = i2;
    i2 += 1;
    let seenSentinel = false;
    while (i2 < lines.length && i2 - start < 30) {
      const line = lines[i2];
      if (isStrictCompilerDiagnosticLine(line) || isUnsafeCompactionContextLine(line)) {
        break;
      }
      if (regexTest(String.raw`^\s*!!\s*$`, line)) {
        if (seenSentinel) {
          i2 += 1;
          break;
        }
        seenSentinel = true;
        i2 += 1;
        continue;
      }
      if (line.trim().length === 0 && i2 + 1 < lines.length && regexTest(String.raw`^\S`, lines[i2 + 1]) && !isSetuptoolsBannerLine(lines[i2 + 1])) {
        break;
      }
      if (!isSetuptoolsBannerLine(line) && regexTest(String.raw`^\S`, line)) {
        break;
      }
      i2 += 1;
    }
    const block2 = lines.slice(start, i2);
    if (block2.length >= 3 && !block2.slice(1).some((line) => isUnsafeCompactionContextLine(line))) {
      compacted.push(`[setuptools deprecation: ${setuptoolsWarningName(block2[0])}; omitted ${block2.length - 1} banner line(s)]`);
    } else {
      for (const line of block2) {
        compacted.push(line);
      }
    }
  }
  return compacted.join("\n");
}

function isSetuptoolsDeprecationHeader(line) {
  return line.includes("SetuptoolsDeprecationWarning:") || line.includes("EasyInstallDeprecationWarning:") || line.includes("DeprecationWarning:");
}

function setuptoolsWarningName(line) {
  return regexCaptureFirst(
    String.raw`([A-Za-z_][A-Za-z0-9_]*DeprecationWarning|DeprecationWarning):`,
    line
  ) ?? "deprecation warning";
}

function isSetuptoolsBannerLine(line) {
  return line.trim().length === 0 || startsWithWhitespace(line) || regexTest(String.raw`^\s*[-!*]{3,}\s*$`, line) || isSetuptoolsDeprecationHeader(line);
}

function compactCythonPerformanceHints(output) {
  if (!output.includes("performance hint:")) {
    return output;
  }
  const lines = output.split("\n");
  const compacted = [];
  let omitted = 0;
  let keptFirstInRun = false;
  const flush = () => {
    if (omitted > 0) {
      compacted.push(`[cython performance hints: omitted ${omitted} hint block(s)]`);
      omitted = 0;
    }
    keptFirstInRun = false;
  };
  let i2 = 0;
  while (i2 < lines.length) {
    if (!isCythonPerformanceHintHeader(lines[i2])) {
      flush();
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    const start = i2;
    i2 += 1;
    let hasUnsafeContext = false;
    while (i2 < lines.length && i2 - start < 12) {
      const line = lines[i2];
      if (isCythonPerformanceHintHeader(line) || isStrictCompilerDiagnosticLine(line) || isUnsafeCompactionContextLine(line)) {
        hasUnsafeContext = isUnsafeCompactionContextLine(line);
        if (hasUnsafeContext) {
          i2 += 1;
        }
        break;
      }
      if (line.trim().length === 0 && i2 + 1 < lines.length && !startsWithWhitespace(lines[i2 + 1])) {
        i2 += 1;
        break;
      }
      if (!startsWithWhitespace(line) && !line.startsWith("Possible solutions:")) {
        break;
      }
      i2 += 1;
    }
    const block2 = lines.slice(start, i2);
    if (hasUnsafeContext) {
      flush();
      for (const line of block2) {
        compacted.push(line);
      }
    } else if (!keptFirstInRun) {
      for (const line of block2) {
        compacted.push(line);
      }
      keptFirstInRun = true;
    } else {
      omitted += 1;
    }
  }
  flush();
  return compacted.join("\n");
}

function isCythonPerformanceHintHeader(line) {
  return regexTest(String.raw`^\S+\.pyx:\d+:\d+:\s+performance hint: `, line);
}

function compactCompilerWarningRuns(output) {
  if (!regexTest(
    String.raw`(?:^|\n)(?:\S+:\d+(?::\d+)?:\s*(?:warning|(?:fatal\s+)?error):|\S+:\s*internal compiler error:|error: command .+ failed\b)`,
    output
  )) {
    return output;
  }
  const inputErrorCount = countCompilerErrorLines(output);
  const lines = output.split("\n");
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    const run = collectCompilerDiagnosticRun(lines, i2);
    if (run === void 0) {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    if (run.blocks.length < 4) {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    if (run.hasError) {
      for (let k = i2; k < run.end; k++) {
        compacted.push(lines[k]);
      }
      i2 = run.end;
      continue;
    }
    for (const block2 of run.blocks.slice(0, 2)) {
      compacted.push(...block2.lines);
    }
    compacted.push(`[compiler warnings: omitted ${run.blocks.length - 3} warning block(s)]`);
    compacted.push(...run.blocks[run.blocks.length - 1].lines);
    i2 = run.end;
  }
  const compactedOutput = compacted.join("\n");
  if (countCompilerErrorLines(compactedOutput) === inputErrorCount) {
    return compactedOutput;
  }
  return output;
}

function collectCompilerDiagnosticRun(lines, start) {
  const blocks = [];
  let i2 = start;
  let hasError = false;
  while (i2 < lines.length) {
    const kind = compilerDiagnosticKind(lines[i2]);
    if (kind === void 0) {
      break;
    }
    const blockStart = i2;
    i2 += 1;
    let contextLines = 0;
    while (i2 < lines.length && contextLines < 4 && compilerDiagnosticKind(lines[i2]) === void 0 && lines[i2].trim().length !== 0) {
      if (isDiagnosticLine(lines[i2]) || isCompilerContextErrorLine(lines[i2])) {
        hasError = true;
        break;
      }
      i2 += 1;
      contextLines += 1;
    }
    blocks.push({ lines: lines.slice(blockStart, i2), kind });
    hasError = hasError || kind === "error";
    if (i2 < lines.length && lines[i2].trim().length === 0) {
      break;
    }
  }
  if (blocks.length === 0) {
    return void 0;
  }
  return { blocks, end: i2, hasError };
}

function compilerDiagnosticKind(line) {
  if (isCompilerErrorLine(line)) {
    return "error";
  }
  if (regexTest(String.raw`^\S+:\d+(?::\d+)?:\s*warning:\s`, line)) {
    return "warning";
  }
  return void 0;
}

function isStrictCompilerDiagnosticLine(line) {
  return compilerDiagnosticKind(line) !== void 0 || regexTest(String.raw`^\S+:\d+(?::\d+)?:\s*note:\s`, line);
}

function isCompilerErrorLine(line) {
  return regexTest(String.raw`^\S+:\d+(?::\d+)?:\s*(?:fatal\s+)?error:\s`, line) || regexTest(String.raw`^\S+:\s*internal compiler error:\s`, line) || regexTest(String.raw`^error: command .+ failed\b`, line);
}

function isCompilerContextErrorLine(line) {
  return regexTestWithFlags(String.raw`^(?:fatal error|error):\s`, line, "i") || line.startsWith("Traceback (most recent call last):");
}

function isUnsafeCompactionContextLine(line) {
  return isCompilerContextErrorLine(line.trimStart());
}

function countCompilerErrorLines(output) {
  return output.split("\n").filter((line) => isCompilerErrorLine(line) || isUnsafeCompactionContextLine(line)).length;
}

function isPipInstallProgressLine(line) {
  return isPipRootUserWarning(line) || !isDiagnosticLine(line) && (line.startsWith("Looking in indexes: ") || line.startsWith("Looking in links: ") || line.startsWith("Collecting ") || line.startsWith("Requirement already satisfied: ") || line.startsWith("Discarding http://") || line.startsWith("Discarding https://") || line.startsWith("Downloading http://") || line.startsWith("Downloading https://") || line.startsWith("  Downloading ") || line.startsWith("  Using cached ") || line.startsWith("  Getting requirements to build wheel ") || line.startsWith("  Installing build dependencies ") || line.startsWith("  Preparing metadata ") || line.startsWith("Building wheels for collected packages: ") || line.startsWith("  Building wheel for ") || line.startsWith("  Created wheel for ") || line.startsWith("  Stored in directory: ") || line.startsWith("Installing collected packages: ") || line.startsWith("Successfully installed ") || line.startsWith("Obtaining ") || line.startsWith("[notice] A new release of pip is available: ") || line.startsWith("[notice] To update, run: ") || regexTest(
    String.raw`^\s+[\u2501\u2578\u257A ]*[\u2501\u2578\u257A][\u2501\u2578\u257A ]*\d+(?:\.\d+)?(?:\s*[KMG]?B)?[/ ]`,
    line
  ));
}

function isPipRootUserWarning(line) {
  return line.startsWith(`WARNING: Running pip as the 'root' user can result in broken permissions`) || line.startsWith("It is recommended to use a virtual environment instead: ");
}

function isPythonNinjaBuildProgressLine(line) {
  return regexTest(
    String.raw`^\[\s*\d+/\d+\]\s+Compiling (?:C|C\+\+|Cython) source \S+\.(?:c|cc|cpp|cxx|pyx)$`,
    line
  ) || regexTest(
    String.raw`^\[\s*\d+/\d+\]\s+Generating \S+ with a custom command$`,
    line
  );
}

function isPythonBuildExtProgressLine(line) {
  return !isDiagnosticLine(line) && (regexTest(
    String.raw`^running (?:bdist_wheel|build|build_py|build_ext|egg_info|install(?:_lib|_egg_info|_scripts|_headers)?|sdist|check)\b`,
    line
  ) || regexTest(String.raw`^building '.+' extension$`, line) || line.startsWith("creating build") || line.startsWith("compile options: ") || line.startsWith("extra options: ") || regexTest(String.raw`^copying .+ -> `, line) || regexTest(String.raw`^writing .+\.egg-info/`, line) || line.startsWith("reading manifest file ") || regexTest(
    String.raw`^(?:gcc|g\+\+|cc|c\+\+|clang|clang\+\+)\b.*\s(?:-c|-shared)\s`,
    line
  ) || regexTest(
    String.raw`^Compiling \S+\.pyx because (?:it changed|it depends on )`,
    line
  ) || regexTest(String.raw`^\[\s*\d+/\d+\]\s+Cythonizing \S+\.pyx`, line));
}

function compactSetuptoolsFileStagingRuns(output) {
  return collapseContiguousRuns(output, isSetuptoolsFileStagingLine, 5, (block2) => {
    const operations = uniqueStrings(
      block2.map((line) => splitWhitespace(line)[0] ?? "staging")
    );
    return `[setuptools file staging: omitted ${block2.length} ${operations.join("/")} line(s)]`;
  });
}

function isSetuptoolsFileStagingLine(line) {
  return regexTest(String.raw`^copying .+ -> .+$`, line) || regexTest(String.raw`^creating (?:build\b|[^/\s]+\.egg-info\b).*$`, line) || regexTest(
    String.raw`^creating [A-Za-z0-9_.+-]+-[A-Za-z0-9_.+-]+/[\w./+-]+$`,
    line
  ) || regexTest(String.raw`^adding (?:license file )?(?:'[^']+'|"[^"]+")$`, line) || regexTest(String.raw`^writing .+\.egg-info/.+$`, line) || regexTest(String.raw`^writing manifest file ['"].+['"]$`, line) || regexTest(String.raw`^reading manifest (?:file|template) ['"].+['"]$`, line);
}

function compactNumpyDistutilsProbes(output) {
  if (!output.includes("INFO: ")) {
    return output;
  }
  return collapseContiguousRuns(output, isNumpyDistutilsProbeLine, 4, (block2) => `[numpy.distutils probes: omitted ${block2.length} BLAS/LAPACK probe line(s)]`);
}

function isNumpyDistutilsProbeLine(line) {
  return !isDiagnosticLine(line) && line.startsWith("INFO: ") && regexTest(
    String.raw`(?:_info:|NOT AVAILABLE|libraries .* not found|Setting PTATLAS|customize |compile options:|extra options:)`,
    line
  );
}

function compactSphinxProgress(output) {
  if (!output.includes("reading sources... [") && !output.includes("writing output... [")) {
    return output;
  }
  return compactIntralineProgress(output, "sphinx progress", compactSphinxProgressLine);
}

function compactSphinxProgressLine(line) {
  if (!line.includes("reading sources... [") && !line.includes("writing output... [")) {
    return unchangedLine(line);
  }
  return compactProgressPatternsUnlessDiagnostic(
    line,
    [
      String.raw`reading sources\.\.\. \[\s*\d+%\]\s+\S+\s*`,
      String.raw`writing output\.\.\. \[\s*\d+%\]\s+\S+\s*`
    ]
  );
}

function hasSphinxProgress(output) {
  return hasSphinxOutputMarker(output) && (output.includes("reading sources... [") || output.includes("writing output... ["));
}

function hasSphinxOutputMarker(output) {
  return output.split("\n").some((line) => line.startsWith("Running Sphinx v") || line.startsWith("Sphinx v") || line.startsWith("loading pickled environment...") || line.startsWith("build succeeded") || line.startsWith("build finished with problems") || line.startsWith("The HTML pages are in "));
}

function compactDocusaurusProgress(output) {
  if (!hasDocusaurusProgress(output)) {
    return output;
  }
  return omitMatchingLines(
    output,
    "docusaurus progress",
    (line) => regexTest(String.raw`^\s*[\u25CF\u25EF]\s+(?:Client|Server)(?:\s+|$)`, line),
    "progress"
  );
}

function compactCarriageReturnProgress(output) {
  if (!output.includes("\r")) {
    return output;
  }
  return output.split("\n").map((line) => {
    const parts = line.split("\r");
    for (let idx = parts.length - 1; idx >= 0; idx--) {
      if (parts[idx].length !== 0) {
        return parts[idx];
      }
    }
    return "";
  }).join("\n");
}

function looksLikeGoRuntimePanic(output) {
  if (jsStringLen(output) < 4 * 1024 || !regexTest(
    String.raw`(?:^|\n)(?:fatal error: |runtime stack:|SIGSEGV|SIGABRT|SIGBUS)`,
    output
  )) {
    return false;
  }
  let count2 = 0;
  for (const line of output.split("\n")) {
    if (isGoRuntimeGoroutineHeader(line)) {
      count2 += 1;
      if (count2 === GO_RUNTIME_PANIC_MIN_GOROUTINES) {
        return true;
      }
    }
  }
  return false;
}

function compactGoRuntimePanicDump(output) {
  if (!looksLikeGoRuntimePanic(output)) {
    return output;
  }
  const lines = output.split("\n");
  const firstHeader = lines.findIndex((line) => isGoRuntimeGoroutineHeader(line));
  if (firstHeader === -1) {
    return output;
  }
  const blocks = collectGoGoroutineBlocks(lines, firstHeader);
  if (blocks.length < GO_RUNTIME_PANIC_MIN_GOROUTINES) {
    return output;
  }
  const compacted = lines.slice(0, firstHeader);
  for (let k = blocks[0].start; k < blocks[0].end; k++) {
    compacted.push(lines[k]);
  }
  let omittedFrameLines = 0;
  const remainingBlocks = [];
  for (const block2 of blocks.slice(1)) {
    const originalBlock = lines.slice(block2.start, block2.end);
    const compactedBlock = compactGoGoroutineBlock(originalBlock);
    omittedFrameLines += saturatingSub(originalBlock.length, compactedBlock.length);
    remainingBlocks.push(compactedBlock);
  }
  const groupedBlocks = groupRepeatedGoGoroutineBlocks(remainingBlocks);
  if (omittedFrameLines === 0 && groupedBlocks.omittedBlocks === 0) {
    return output;
  }
  const summary = [];
  if (omittedFrameLines > 0) {
    summary.push(`${blocks.length - 1} goroutine block(s) below were condensed; ${omittedFrameLines} frame line(s) omitted`);
  }
  if (groupedBlocks.omittedBlocks > 0) {
    summary.push(`${groupedBlocks.omittedBlocks} repeated goroutine block(s) grouped`);
  }
  compacted.push(`[go runtime panic: ${summary.join("; ")}]`);
  for (const block2 of groupedBlocks.blocks) {
    compacted.push(...block2);
  }
  return compacted.join("\n");
}

function collectGoGoroutineBlocks(lines, firstHeader) {
  const blocks = [];
  let start = firstHeader;
  for (let i2 = firstHeader + 1; i2 < lines.length; i2++) {
    if (isGoRuntimeGoroutineHeader(lines[i2])) {
      blocks.push({ start, end: i2 });
      start = i2;
    }
  }
  blocks.push({ start, end: lines.length });
  return blocks;
}

function compactGoGoroutineBlock(block2) {
  const footerStart = findGoGoroutineFooterStart(block2);
  const stack = block2.slice(0, footerStart);
  const footer = block2.slice(footerStart);
  if (stack.length <= 4) {
    return [...stack, ...footer];
  }
  let createdByIndex;
  for (let idx = stack.length - 1; idx >= 0; idx--) {
    if (stack[idx].startsWith("created by ")) {
      createdByIndex = idx;
      break;
    }
  }
  const kept = stack.slice(0, Math.min(3, stack.length));
  if (createdByIndex !== void 0 && createdByIndex >= kept.length) {
    kept.push(...stack.slice(createdByIndex));
  }
  kept.push(...footer);
  return kept;
}

function groupRepeatedGoGoroutineBlocks(blocks) {
  const signatures = blocks.map((block2) => goGoroutineSignature(block2));
  const counts = /* @__PURE__ */ new Map();
  for (const signature of signatures) {
    if (signature !== void 0) {
      counts.set(signature.key, (counts.get(signature.key) ?? 0) + 1);
    }
  }
  const grouped = [];
  const seen = [];
  let omittedBlocks = 0;
  for (let index2 = 0; index2 < blocks.length; index2++) {
    const block2 = blocks[index2];
    const signature = signatures[index2];
    if (signature === void 0) {
      grouped.push([...block2]);
      continue;
    }
    if ((counts.get(signature.key) ?? 0) < 3) {
      grouped.push([...block2]);
      continue;
    }
    if (seen.includes(signature.key)) {
      omittedBlocks += 1;
      continue;
    }
    seen.push(signature.key);
    grouped.push([...block2]);
    grouped.push([
      `[go runtime panic: omitted ${(counts.get(signature.key) ?? 1) - 1} similar goroutine block(s): state=${signature.state}, top=${signature.top}${signature.location.length === 0 ? "" : " at "}${signature.location}, created by=${signature.createdBy}]`,
      ""
    ]);
  }
  return { blocks: grouped, omittedBlocks };
}

function goGoroutineSignature(block2) {
  if (findGoGoroutineFooterStart(block2) < block2.length) {
    return void 0;
  }
  const first2 = block2[0];
  if (first2 === void 0) {
    return void 0;
  }
  const state = regexCaptureFirst(String.raw`\[([^\]]+)\]:$`, first2);
  if (state === void 0) {
    return void 0;
  }
  let topIndex;
  for (let index2 = 0; index2 < block2.length; index2++) {
    const line = block2[index2];
    if (index2 > 0 && line.length !== 0 && !line.startsWith("	") && !line.startsWith("created by ")) {
      topIndex = index2;
      break;
    }
  }
  if (topIndex === void 0) {
    return void 0;
  }
  const top2 = goFunctionName(block2[topIndex]);
  if (top2 === void 0) {
    return void 0;
  }
  const location2 = goFileLocation(topIndex + 1 < block2.length ? block2[topIndex + 1] : void 0);
  const createdByLine = block2.find((line) => line.startsWith("created by "));
  const createdBy = (createdByLine !== void 0 ? goCreatedByFunction(createdByLine) : void 0) ?? "<none>";
  return {
    key: `${state}\0${top2}\0${location2}\0${createdBy}`,
    state,
    top: top2,
    location: location2,
    createdBy
  };
}

function goFunctionName(line) {
  return regexCaptureFirst(String.raw`^([^\s(]+)(?:\(|$)`, line);
}

function goFileLocation(line) {
  if (line === void 0) {
    return "";
  }
  return regexCaptureFirst(String.raw`([^/\s]+\.[A-Za-z0-9]+:\d+)`, line) ?? "";
}

function goCreatedByFunction(line) {
  return regexCaptureFirst(String.raw`^created by (.+?)(?: in goroutine \d+)?$`, line);
}

function findGoGoroutineFooterStart(block2) {
  for (let i2 = 1; i2 < block2.length; i2++) {
    if (!isGoGoroutineStackLine(block2[i2])) {
      return i2;
    }
  }
  return block2.length;
}

function isGoGoroutineStackLine(line) {
  return line.length === 0 || line.startsWith("	") || line.startsWith("created by ") || regexTest(String.raw`^\S.*\)$`, line);
}

function isGoRuntimeGoroutineHeader(line) {
  return regexTest(
    String.raw`^goroutine \d+(?: gp=\S+)?(?: m=\S+)?(?: mp=\S+)? \[[^\]]+\]:$`,
    line
  );
}

function isDjangoTestBoilerplateLine(line) {
  return !isDiagnosticLine(line) && (line.startsWith("Testing against Django installed in ") || regexTest(String.raw`^Found \d+ test(?:\(s\)|s)?\.$`, line) || line.startsWith("Creating test database for alias ") || line.startsWith("Destroying test database for alias ") || line.startsWith("Skipping setup of unused database") || line.startsWith("System check identified no issues") || line.startsWith("Operations to perform:") || line.startsWith("Apply all migrations:") || regexTest(String.raw`^ {2}Applying \S+\.\S+\.\.\. OK$`, line) || regexTest(String.raw`^test_\S+ \([^)]+\) \.\.\. ok$`, line));
}

function isDjangoTestProgressLine(line) {
  return !isDiagnosticLine(line) && (line.includes(".") || line.includes("s") || line.includes("x") || line.includes("X")) && regexTest(String.raw`^[.sxXEF]+(?:\s+\[\s*\d+%\])?$`, line);
}

function isPytestSessionMetadataLine(line) {
  return !isDiagnosticLine(line) && (regexTestWithFlags(String.raw`^=+\s*test session starts\s*=+$`, line, "i") || regexTest(String.raw`^platform .*\bpytest-.*\bpluggy-`, line) || regexTest(String.raw`^(?:cachedir|rootdir|configfile|plugins): `, line) || line.startsWith("collecting ...") || regexTest(String.raw`^collected \d+ items?`, line));
}

function compactPytestProgress(output) {
  if (hasPytestTerminalSummary(output)) {
    return omitPytestProgressLines(output, isPytestProgressLine);
  }
  if (hasStrictPytestPassedProgressRun(output) && !hasPytestProgressFallbackPoison(output)) {
    return omitPytestProgressLines(output, isStrictPytestPassedProgressLine);
  }
  return output;
}

function omitPytestProgressLines(output, shouldOmit) {
  const compacted = [];
  const omittedLines = [];
  for (const line of output.split("\n")) {
    if (shouldOmit(line)) {
      omittedLines.push(line);
    } else {
      flushPytestProgressLines(compacted, omittedLines);
      compacted.push(line);
    }
  }
  flushPytestProgressLines(compacted, omittedLines);
  return compacted.join("\n");
}

function flushPytestProgressLines(compacted, omittedLines) {
  if (omittedLines.length === 0) {
    return;
  }
  const summary = omittedLines.every((line) => isStrictPytestPassedProgressLine(line)) ? `[pytest progress: omitted ${omittedLines.length} PASSED test result line(s)]` : `[pytest progress: omitted ${omittedLines.length} non-diagnostic line(s)]`;
  compacted.push(summary);
  omittedLines.length = 0;
}

function isPytestProgressLine(line) {
  return !isDiagnosticLine(line) && (regexTest(String.raw`^[-=]{20,}$`, line) || regexTest(String.raw`^[.sxX]+(?:\s+\[\s*\d+%\])?\s*$`, line) || regexTest(
    String.raw`^\S+\.py::\S+\s+(?:PASSED|SKIPPED|XFAIL)\s+\[\s*\d+%\]$`,
    line
  ));
}

function hasPytestProgressFallbackPoison(output) {
  return regexTest(
    String.raw`(?:^|\n)(?:\S+\.py::\S+\s+(?:FAILED|ERROR)\s+\[\s*\d+%\]|(?:FAIL|ERROR|INTERNALERROR)\b)|Traceback \(most recent call last\):`,
    output
  ) || hasHardCrashLine(output);
}

function hasHardCrashLine(output) {
  return regexTestWithFlags(
    String.raw`(?:Fatal Python error:|Aborted|Abort trap|core dumped|segmentation fault)`,
    output,
    "i"
  );
}

function hasStrictPytestPassedProgressRun(output) {
  let runLength = 0;
  for (const line of output.split("\n")) {
    if (isStrictPytestPassedProgressLine(line)) {
      runLength += 1;
      if (runLength >= 5) {
        return true;
      }
    } else {
      runLength = 0;
    }
  }
  return false;
}

function isStrictPytestPassedProgressLine(line) {
  return !isDiagnosticLine(line) && regexTest(String.raw`^\S+\.py::\S+\s+PASSED\s+\[\s*\d+%\]$`, line);
}

function hasPytestTerminalSummary(output) {
  return regexTestWithFlags(
    String.raw`(?:^|\n)(?:=+\s*)?[^=\n]*(?:passed|failed|errors?|warnings?|skipped|xfailed|xpassed)[^=\n]*\bin \d+(?:\.\d+)?s\s*(?:=+)?\s*(?:\n|$)`,
    output,
    "i"
  );
}

function compactPytestFailureBlocks(output) {
  if (!hasPytestTerminalSummary(output)) {
    return output;
  }
  const shortSummaryLines = countPytestShortSummaryLines(output);
  const sectionHeaders = countPytestSectionHeaders(output);
  const lines = output.split("\n");
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    const section = pytestSectionName(lines[i2]);
    if (section !== "FAILURES" && section !== "ERRORS") {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    compacted.push(lines[i2]);
    const start = i2 + 1;
    let end = start;
    while (end < lines.length && !isPytestSectionHeader(lines[end])) {
      end += 1;
    }
    compacted.push(...compactPytestFailureRegion(
      lines.slice(start, end),
      asciiLowercase(section ?? "")
    ));
    i2 = end;
  }
  const result = compacted.join("\n");
  if (countPytestShortSummaryLines(result) === shortSummaryLines && countPytestSectionHeaders(result) === sectionHeaders) {
    return result;
  }
  return output;
}

function compactPytestFailureRegion(lines, label3) {
  const entries2 = [];
  const groups = /* @__PURE__ */ new Map();
  let i2 = 0;
  while (i2 < lines.length) {
    const name = parsePytestFailureBlockHeader(lines[i2]);
    if (name === void 0) {
      entries2.push({ type: "line", line: lines[i2] });
      i2 += 1;
      continue;
    }
    const header2 = lines[i2];
    i2 += 1;
    const bodyStart = i2;
    while (i2 < lines.length && parsePytestFailureBlockHeader(lines[i2]) === void 0 && !isPytestSectionHeader(lines[i2])) {
      i2 += 1;
    }
    const body = lines.slice(bodyStart, i2);
    const key3 = pytestFailureBlockKey(body);
    const block2 = { header: header2, name, body, key: key3 };
    if (key3 !== void 0) {
      const list2 = groups.get(key3);
      if (list2 !== void 0) {
        list2.push(block2);
      } else {
        groups.set(key3, [block2]);
      }
    }
    entries2.push({ type: "block", block: block2 });
  }
  const emittedGroups = [];
  const compacted = [];
  for (const entry of entries2) {
    if (entry.type === "line") {
      compacted.push(entry.line);
      continue;
    }
    const block2 = entry.block;
    const group2 = block2.key !== void 0 ? groups.get(block2.key) : void 0;
    const alreadyEmitted = block2.key !== void 0 && emittedGroups.includes(block2.key);
    if (block2.key === void 0 || group2 === void 0 || group2.length < 2 || alreadyEmitted) {
      if (block2.key === void 0 || group2 === void 0 || group2.length < 2) {
        compacted.push(block2.header);
        compacted.push(...block2.body);
      }
      continue;
    }
    emittedGroups.push(block2.key);
    const first2 = group2[0];
    compacted.push(first2.header);
    compacted.push(...first2.body);
    const duplicates = group2.slice(1);
    compacted.push(`[pytest ${label3}: ${duplicates.length} duplicate traceback block(s) match ${first2.name}; also: ${summarizeWithMore(duplicates.map((duplicate) => duplicate.name), 8)}]`);
  }
  return compacted;
}

function parsePytestFailureBlockHeader(line) {
  return regexCaptureFirst(String.raw`^_{3,}\s+(.+?)\s+_{3,}\s*$`, line);
}

function pytestFailureBlockKey(body) {
  if (body.length < 3 || body.some((line) => isPytestSummaryLine(line))) {
    return void 0;
  }
  const normalized = body.map((line) => normalizePytestFailureLine(line)).filter((line) => line.trim().length !== 0).join("\n");
  if (normalized.split("\n").length >= 3) {
    return normalized;
  }
  return void 0;
}

function normalizePytestFailureLine(line) {
  const stripped = stripAnsi(line);
  return stripped.replace(new RegExp(String.raw`^\[gw\d+\]\s*`), "");
}

function isPytestSummaryLine(line) {
  return regexTest(String.raw`^(?:FAILED|ERROR)\s+\S`, line);
}

function countPytestShortSummaryLines(output) {
  return output.split("\n").filter((line) => isPytestSummaryLine(line)).length;
}

function countPytestSectionHeaders(output) {
  return output.split("\n").filter((line) => isPytestSectionHeader(line)).length;
}

function isPytestSectionHeader(line) {
  return pytestSectionName(line) !== void 0 || regexTest(String.raw`^=+\s+.*\bin \d+(?:\.\d+)?s\b.*\s*=+\s*$`, line);
}

function pytestSectionName(line) {
  const name = regexCaptureFirst(String.raw`^=+\s+([A-Za-z][A-Za-z ]+)\s+=+\s*$`, line);
  return name !== void 0 ? name.trim() : void 0;
}

function compactPytestWarningsSummary(output) {
  const lines = output.split("\n");
  const compacted = [];
  let i2 = 0;
  while (i2 < lines.length) {
    if (!regexTestWithFlags(String.raw`^=+\s*warnings summary\s*=+$`, lines[i2], "i")) {
      compacted.push(lines[i2]);
      i2 += 1;
      continue;
    }
    compacted.push(lines[i2]);
    let j = i2 + 1;
    while (j < lines.length && !regexTest(String.raw`^=+\s+.+\s+=+$`, lines[j])) {
      j += 1;
    }
    compacted.push(...compactPytestWarningsSummaryRegion(lines.slice(i2 + 1, j)));
    i2 = j;
  }
  return compacted.join("\n");
}

function compactPytestWarningsSummaryRegion(lines) {
  const entries2 = [];
  const groups = /* @__PURE__ */ new Map();
  let i2 = 0;
  while (i2 < lines.length) {
    if (!isPytestWarningTestIdLine(lines[i2])) {
      entries2.push({ type: "line", line: lines[i2] });
      i2 += 1;
      continue;
    }
    const testIds = [];
    while (i2 < lines.length && isPytestWarningTestIdLine(lines[i2])) {
      testIds.push(lines[i2]);
      i2 += 1;
    }
    const body = [];
    while (i2 < lines.length && !isPytestWarningTestIdLine(lines[i2]) && !lines[i2].startsWith("-- Docs: ")) {
      body.push(lines[i2]);
      i2 += 1;
    }
    const parsed = parsePytestWarningBody(body);
    const block2 = {
      testIds,
      body,
      key: parsed?.key,
      warningClass: parsed?.warningClass,
      message: parsed?.message
    };
    if (block2.key !== void 0) {
      const list2 = groups.get(block2.key);
      if (list2 !== void 0) {
        list2.push(block2);
      } else {
        groups.set(block2.key, [block2]);
      }
    }
    entries2.push({ type: "block", block: block2 });
  }
  const emittedGroups = [];
  const compacted = [];
  for (const entry of entries2) {
    if (entry.type === "line") {
      compacted.push(entry.line);
      continue;
    }
    const block2 = entry.block;
    const group2 = block2.key !== void 0 ? groups.get(block2.key) : void 0;
    const shouldGroup = group2 !== void 0 && (group2.length > 1 || group2[0].testIds.length > 1);
    const alreadyEmitted = block2.key !== void 0 && emittedGroups.includes(block2.key);
    if (!shouldGroup || block2.key === void 0 || alreadyEmitted) {
      if (!shouldGroup) {
        compacted.push(...formatPytestWarningBlock(block2));
      }
      continue;
    }
    if (group2 === void 0) {
      continue;
    }
    emittedGroups.push(block2.key);
    const totalTestIds = group2.reduce((sum2, item) => sum2 + item.testIds.length, 0);
    compacted.push(group2[0].testIds[0]);
    if (totalTestIds > 1) {
      compacted.push(`[pytest warnings summary: ${totalTestIds} test id line(s) share ${block2.warningClass ?? "warning"}: ${block2.message ?? ""}]`);
    }
    compacted.push(...group2[0].body);
    const duplicateBodies = group2.length - 1;
    if (duplicateBodies > 0) {
      const locations = [];
      for (const item of group2) {
        const location2 = parsePytestWarningLocation(item.body);
        if (location2 !== void 0 && !locations.includes(location2)) {
          locations.push(location2);
        }
      }
      const locationSummary = locations.length > 1 ? ` from ${locations.length} location(s)` : "";
      compacted.push(`[pytest warnings summary: omitted ${duplicateBodies} duplicate warning block(s)${locationSummary}]`);
    }
  }
  return compacted;
}

function formatPytestWarningBlock(block2) {
  if (block2.testIds.length <= 1) {
    return [...block2.testIds, ...block2.body];
  }
  const lines = [block2.testIds[0]];
  lines.push(`[pytest warnings summary: omitted ${block2.testIds.length - 1} test id line(s)]`);
  lines.push(...block2.body);
  return lines;
}

function parsePytestWarningBody(body) {
  const regex = new RegExp(String.raw`^\s+.+?:\d+:\s+([A-Za-z_][A-Za-z0-9_.]*Warning):\s+(.+)$`);
  for (const line of body) {
    const captures = regex.exec(line);
    if (captures === null) {
      continue;
    }
    const warningClass = captures[1];
    const messageRaw = captures[2];
    if (warningClass === void 0 || messageRaw === void 0) {
      return void 0;
    }
    const message = normalizePytestWarningMessage(messageRaw);
    return {
      key: `${warningClass}\0${message}`,
      warningClass,
      message
    };
  }
  return void 0;
}

function parsePytestWarningLocation(body) {
  for (const line of body) {
    const location2 = regexCaptureFirst(
      String.raw`^\s+(.+?:\d+):\s+[A-Za-z_][A-Za-z0-9_.]*Warning:\s+.+$`,
      line
    );
    if (location2 !== void 0) {
      return location2;
    }
  }
  return void 0;
}

function normalizePytestWarningMessage(message) {
  return splitWhitespace(message).join(" ");
}

function isPytestWarningTestIdLine(line) {
  const trimmed = line.trimEnd();
  return line === trimmed && (!trimmed.includes(" ") && (trimmed.includes(".py::") || regexTest(String.raw`^\S+\.py:\d+$`, trimmed)) || regexTest(String.raw`^\S+\.py:\s+\d+ warnings?$`, trimmed));
}

function compactGrepContentOutput(output, largeOutputThreshold) {
  const lines = splitToolOutputLines(output);
  if (shouldSkipToolOutputCompaction(lines, output, 8)) {
    return unchanged(output);
  }
  const grepLines = lines.filter((line) => line !== "--");
  const parsedMatches = [];
  for (const line of grepLines) {
    const parsed = parseGrepContentLine(line);
    if (parsed !== void 0) {
      parsedMatches.push(parsed);
    }
  }
  if (parsedMatches.length < 8 || parsedMatches.length < 20 && jsStringLen(output) < 4e3) {
    return unchanged(output);
  }
  if (parsedMatches.length !== grepLines.length && (fitsLargeOutputThreshold(output, largeOutputThreshold) || parsedMatches.length / grepLines.length < 0.6)) {
    return unchanged(output);
  }
  const sortedGroups = grepContentGroups(parsedMatches);
  const commonPrefix = commonDirectoryPrefix(parsedMatches.map((m) => m.path));
  const bodyBudget = compactedBodyBudget(largeOutputThreshold);
  const lossless = renderGrepContentGroups(sortedGroups, commonPrefix, sortedGroups.length, indexAll);
  if (byteLength(lossless) >= byteLength(output) && fitsLargeOutputThreshold(output, largeOutputThreshold)) {
    return unchanged(output);
  }
  if (fitsLargeOutputThreshold(lossless, largeOutputThreshold)) {
    return { output: lossless, lossless: true };
  }
  const aggressive = renderGrepContentGroups(sortedGroups, commonPrefix, 12, selectHeadTailToShow);
  if (fitsLargeOutputThreshold(aggressive, bodyBudget)) {
    return lossy(aggressive);
  }
  const fallback2 = renderBudgetedGrepContentGroups(sortedGroups, commonPrefix, largeOutputThreshold);
  if (byteLength(fallback2) < byteLength(aggressive)) {
    return lossy(fallback2);
  }
  return lossy(aggressive);
}

function grepContentGroups(matches2) {
  const groups = /* @__PURE__ */ new Map();
  for (const m of matches2) {
    const list2 = groups.get(m.path);
    if (list2 !== void 0) {
      list2.push(m);
    } else {
      groups.set(m.path, [m]);
    }
  }
  return [...groups.entries()];
}

function renderGrepContentGroups(sortedGroups, commonPrefix, maxGroups, selectMatches) {
  const totalMatches = totalGroupItems(sortedGroups);
  const compacted = [];
  compacted.push(`[grep content: ${totalMatches} matches across ${sortedGroups.length} file(s)${commonPrefix.length === 0 ? "" : ` under ${commonPrefix}`}]`);
  for (const [filePath, fileMatches] of sortedGroups.slice(0, maxGroups)) {
    const displayPath = displayPathUnderPrefix(filePath, commonPrefix);
    if (fileMatches.length === 1) {
      compacted.push(`${displayPath}:${formatGrepMatch(fileMatches[0])}`);
      continue;
    }
    compacted.push("");
    compacted.push(`${displayPath} (${fileMatches.length} match(es)):`);
    const shown = selectMatches(fileMatches);
    let previousIndex;
    for (const { item: m, index: index2 } of shown) {
      if (previousIndex !== void 0 && index2 > previousIndex + 1) {
        compacted.push(`  ... ${index2 - previousIndex - 1} more match(es) omitted in this file`);
      }
      compacted.push(`  ${formatGrepMatch(m)}`);
      previousIndex = index2;
    }
    const omittedAfterLast = previousIndex !== void 0 ? saturatingSub(fileMatches.length, previousIndex + 1) : fileMatches.length;
    if (omittedAfterLast > 0) {
      compacted.push(`  ... ${omittedAfterLast} more match(es) omitted in this file`);
    }
  }
  if (sortedGroups.length > maxGroups) {
    const omittedMatches = totalGroupItems(sortedGroups.slice(maxGroups));
    compacted.push("");
    compacted.push(`[omitted ${omittedMatches} match(es) in ${sortedGroups.length - maxGroups} file(s); see original output for full results]`);
  }
  return compacted.join("\n");
}

function parseGrepContentLine(line) {
  const numbered = parseNumberedGrepContentLine(line);
  if (numbered !== void 0) {
    return numbered;
  }
  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) {
    return void 0;
  }
  if (separatorIndex === 0 || separatorIndex === line.length - 1) {
    return void 0;
  }
  const path = line.slice(0, separatorIndex);
  if (!looksLikeGrepPath(path)) {
    return void 0;
  }
  return {
    path: normalizeDisplayPathSeparators(path),
    lineNumber: void 0,
    separator: ":",
    text: line.slice(separatorIndex + 1)
  };
}

function parseNumberedGrepContentLine(line) {
  const bytes = new TextEncoder().encode(line);
  const decoder2 = new TextDecoder();
  const sliceStr = (start, end) => decoder2.decode(bytes.subarray(start, end));
  const isAsciiDigitByte = (byte) => byte >= 48 && byte <= 57;
  const colon = 58;
  const dash = 45;
  const upperBound = saturatingSub(bytes.length, 2);
  for (let i2 = 1; i2 < upperBound; i2++) {
    const pathSeparator = bytes[i2];
    if (pathSeparator !== colon && pathSeparator !== dash) {
      continue;
    }
    const numberStart = i2 + 1;
    let numberEnd = numberStart;
    while (numberEnd < bytes.length && isAsciiDigitByte(bytes[numberEnd])) {
      numberEnd += 1;
    }
    if (numberEnd === numberStart) {
      continue;
    }
    if (numberEnd >= bytes.length) {
      return void 0;
    }
    const separator2 = bytes[numberEnd];
    if (separator2 !== colon && separator2 !== dash) {
      continue;
    }
    const path = sliceStr(0, i2);
    if (!looksLikeGrepPath(path)) {
      continue;
    }
    return {
      path: normalizeDisplayPathSeparators(path),
      lineNumber: sliceStr(numberStart, numberEnd),
      separator: String.fromCharCode(separator2),
      text: sliceStr(numberEnd + 1, bytes.length)
    };
  }
  return void 0;
}

function looksLikeGrepPath(path) {
  return path.includes("/") || path.includes("\\") || regexTest(String.raw`\.[A-Za-z0-9_-]+$`, path);
}

function renderBudgetedGrepContentGroups(sortedGroups, commonPrefix, largeOutputThreshold) {
  const budget = compactedBodyBudget(largeOutputThreshold);
  let smallest = renderBudgetedGrepContentGroupsWithLimit(sortedGroups, commonPrefix, 1, 1);
  for (const maxGroups of [10, 8, 6, 4, 2, 1]) {
    for (const maxMatchesPerGroup of [12, 6, 3, 1]) {
      const candidate = renderBudgetedGrepContentGroupsWithLimit(
        sortedGroups,
        commonPrefix,
        maxGroups,
        maxMatchesPerGroup
      );
      if (fitsLargeOutputThreshold(candidate, budget)) {
        return candidate;
      }
      smallest = candidate;
    }
  }
  return smallest;
}

function renderBudgetedGrepContentGroupsWithLimit(sortedGroups, commonPrefix, maxGroups, maxMatchesPerGroup) {
  const totalMatches = totalGroupItems(sortedGroups);
  const compacted = [];
  compacted.push(`[grep content: ${totalMatches} matches across ${sortedGroups.length} file(s)${commonPrefix.length === 0 ? "" : ` under ${truncatePathMiddle(commonPrefix, COMMON_PREFIX_DISPLAY_WIDTH)}`}; compact summary]`);
  for (const [filePath, fileMatches] of sortedGroups.slice(0, maxGroups)) {
    compacted.push(formatBudgetedGrepGroup(filePath, fileMatches, commonPrefix, maxMatchesPerGroup));
  }
  if (sortedGroups.length > maxGroups) {
    const omittedMatches = totalGroupItems(sortedGroups.slice(maxGroups));
    compacted.push(`[omitted ${omittedMatches} match(es) in ${sortedGroups.length - maxGroups} file(s)]`);
  }
  const extensionSummary = summarizeExtensions(sortedGroups.map(([filePath]) => filePath));
  if (extensionSummary.length !== 0) {
    compacted.push(`[extensions: ${truncateInlineText(extensionSummary, EXTENSION_SUMMARY_INLINE_WIDTH)}]`);
  }
  return compacted.join("\n");
}

function formatBudgetedGrepGroup(filePath, fileMatches, commonPrefix, maxMatches) {
  const displayPath = truncatePathMiddle(displayPathUnderPrefix(filePath, commonPrefix), 140);
  const shown = selectEvenlySpacedGrepMatches(fileMatches, maxMatches);
  const lines = [`${displayPath} (${fileMatches.length} match(es)):`];
  for (const { item: m } of shown) {
    lines.push(`  ${excerptInlineText(formatGrepMatch(m), 180)}`);
  }
  if (fileMatches.length > shown.length) {
    lines.push(`  ... ${fileMatches.length - shown.length} more match(es) omitted in this file`);
  }
  return lines.join("\n");
}

function selectEvenlySpacedGrepMatches(matches2, maxMatches) {
  if (matches2.length <= maxMatches) {
    return indexAll(matches2);
  }
  if (maxMatches <= 1) {
    return [{ item: matches2[0], index: 0 }];
  }
  const selected = [];
  const seen = [];
  for (let i2 = 0; i2 < maxMatches; i2++) {
    const index2 = Math.round(i2 * (matches2.length - 1) / (maxMatches - 1));
    if (!seen.includes(index2)) {
      seen.push(index2);
      selected.push({ index: index2, item: matches2[index2] });
    }
  }
  return selected;
}

function formatGrepMatch(m) {
  if (m.lineNumber !== void 0) {
    return `${m.lineNumber}${m.separator} ${m.text}`;
  }
  return ` ${m.text}`;
}

function compactGrepCountOutput(output) {
  const TOP_COUNT_ROWS = 20;
  const lines = splitToolOutputLines(output);
  if (shouldSkipToolOutputCompaction(lines, output, 30)) {
    return unchanged(output);
  }
  const parsedCounts = [];
  for (const line of lines) {
    const parsed = parseGrepCountLine(line);
    if (parsed !== void 0) {
      parsedCounts.push(parsed);
    }
  }
  if (parsedCounts.length < 30 || parsedCounts.length / lines.length < 0.8) {
    return unchanged(output);
  }
  let totalMatches = 0;
  for (const m of parsedCounts) {
    totalMatches += m.count;
  }
  const sortedCounts = [...parsedCounts];
  sortedCounts.sort((a, b) => b.count - a.count || compareStrings(a.path, b.path));
  const compacted = [`[grep count: ${totalMatches} match(es) across ${parsedCounts.length} file(s) with matches]`];
  compacted.push("");
  compacted.push("Top files by match count:");
  for (const m of sortedCounts.slice(0, TOP_COUNT_ROWS)) {
    compacted.push(`  ${String(m.count).padStart(6)}  ${m.path}`);
  }
  if (sortedCounts.length > TOP_COUNT_ROWS) {
    compacted.push(`  ... ${sortedCounts.length - TOP_COUNT_ROWS} more file(s) omitted`);
  }
  const directoryCounts = summarizeCountDirectories(parsedCounts);
  if (directoryCounts.length !== 0) {
    compacted.push("");
    compacted.push("Top directories by match count:");
    for (const summary of directoryCounts.slice(0, TOP_COUNT_ROWS)) {
      compacted.push(`  ${String(summary.count).padStart(6)} in ${summary.files} file(s)  ${summary.directory}`);
    }
    if (directoryCounts.length > TOP_COUNT_ROWS) {
      const omittedDirectories = directoryCounts.length - TOP_COUNT_ROWS;
      compacted.push(`  ... ${omittedDirectories} more director${omittedDirectories === 1 ? "y" : "ies"} omitted`);
    }
  }
  const extensionSummary = summarizeExtensions(parsedCounts.map((m) => m.path));
  if (extensionSummary.length !== 0) {
    compacted.push("");
    compacted.push(`[extensions: ${extensionSummary}]`);
  }
  return lossy(compacted.join("\n"));
}

function parseGrepCountLine(line) {
  const split = rsplitOnce(line, ":");
  if (split === void 0) {
    return void 0;
  }
  const [path, count2] = split;
  if (path.length === 0) {
    return void 0;
  }
  const parsed = parseUsize(count2);
  if (parsed === void 0) {
    return void 0;
  }
  return { path, count: parsed };
}

function summarizeCountDirectories(counts) {
  const directories = /* @__PURE__ */ new Map();
  for (const m of counts) {
    const directory = directoryOfPath(m.path);
    let entry = directories.get(directory);
    if (entry === void 0) {
      entry = { directory, count: 0, files: 0 };
      directories.set(directory, entry);
    }
    entry.count += m.count;
    entry.files += 1;
  }
  const values = [...directories.values()];
  values.sort((a, b) => b.count - a.count || b.files - a.files || compareStrings(a.directory, b.directory));
  return values;
}

function compactPathListOutput(output, label3, largeOutputThreshold) {
  const paths = splitToolOutputLines(output).map((line) => normalizeDisplayPathSeparators(line));
  if (shouldSkipToolOutputCompaction(paths, output, 25)) {
    return unchanged(output);
  }
  const commonPrefix = commonDirectoryPrefix(paths);
  const groups = /* @__PURE__ */ new Map();
  for (const filePath of paths) {
    const groupPath = pathListGroupPath(filePath, commonPrefix);
    const list2 = groups.get(groupPath);
    if (list2 !== void 0) {
      list2.push(filePath);
    } else {
      groups.set(groupPath, [filePath]);
    }
  }
  const sortedGroups = [...groups.entries()];
  sortedGroups.sort((a, b) => b[1].length - a[1].length || compareStrings(a[0], b[0]));
  const bodyBudget = compactedBodyBudget(largeOutputThreshold);
  const primary = renderPathListGroups(
    paths,
    label3,
    commonPrefix,
    sortedGroups,
    sortedGroups.length,
    false
  );
  if (byteLength(primary) >= byteLength(output) && fitsLargeOutputThreshold(output, largeOutputThreshold)) {
    return unchanged(output);
  }
  if (fitsLargeOutputThreshold(primary, bodyBudget)) {
    return { output: primary, lossless: true };
  }
  return lossy(renderBudgetedFlatPathList(
    paths,
    label3,
    commonPrefix,
    largeOutputThreshold
  ));
}

function renderPathListGroups(paths, label3, commonPrefix, sortedGroups, maxGroups, compactSelection) {
  const compacted = [`[${label3}: ${paths.length} path(s)${commonPrefix.length === 0 ? "" : ` under ${commonPrefix}`}; grouped by directory]`];
  for (const [groupPath, groupPaths] of sortedGroups.slice(0, maxGroups)) {
    const sortedGroupPaths = [...groupPaths];
    sortedGroupPaths.sort((a, b) => naturalCmp(a, b));
    compacted.push("");
    compacted.push(`${groupPath}/ (${groupPaths.length} path(s))`);
    const shown = compactSelection ? selectHeadTailToShow(sortedGroupPaths) : indexAll(sortedGroupPaths);
    let previousIndex;
    for (const { item: filePath, index: index2 } of shown) {
      if (previousIndex !== void 0 && index2 > previousIndex + 1) {
        compacted.push(`  ... ${index2 - previousIndex - 1} more path(s) in this group`);
      }
      compacted.push(`  ${displayPathInPathListGroup(filePath, groupPath)}`);
      previousIndex = index2;
    }
    const omittedAfterLast = previousIndex !== void 0 ? saturatingSub(groupPaths.length, previousIndex + 1) : groupPaths.length;
    if (omittedAfterLast > 0) {
      compacted.push(`  ... ${omittedAfterLast} more path(s) in this group`);
    }
  }
  if (sortedGroups.length > maxGroups) {
    const omittedPaths = totalGroupItems(sortedGroups.slice(maxGroups));
    compacted.push("");
    compacted.push(`[omitted ${omittedPaths} path(s) in ${sortedGroups.length - maxGroups} smaller group(s)]`);
  }
  const extensionSummary = summarizeExtensions(paths);
  if (extensionSummary.length !== 0) {
    compacted.push("");
    compacted.push(`[extensions: ${extensionSummary}]`);
  }
  return compacted.join("\n");
}

function selectHeadTailToShow(items) {
  if (items.length <= 40) {
    return indexAll(items);
  }
  const indexes = [];
  for (let i2 = 0; i2 < 12; i2++) {
    indexes.push(i2);
  }
  for (let i2 = items.length - 12; i2 < items.length; i2++) {
    indexes.push(i2);
  }
  return indexes.map((index2) => ({ index: index2, item: items[index2] }));
}

function renderBudgetedFlatPathList(paths, label3, commonPrefix, largeOutputThreshold) {
  const sortedPaths = sortPathsForConcretePreview(paths);
  const extensionSummary = summarizeExtensions(paths);
  const budget = compactedBodyBudget(largeOutputThreshold);
  const selected = [];
  const lines = [`[${label3}: ${paths.length} path(s)${commonPrefix.length === 0 ? "" : ` under ${truncatePathMiddle(commonPrefix, COMMON_PREFIX_DISPLAY_WIDTH)}`}; concrete paths]`];
  let selectedBytes = joinedLineBytes(lines);
  for (const filePath of sortedPaths) {
    let displayPath = displayPathUnderPrefix(filePath, commonPrefix);
    const suffixLines = pathListSuffixLines(selected.length + 1, paths.length, extensionSummary);
    const suffixBytes = joinedLineBytes(suffixLines);
    const separatorBytes = suffixBytes > 0 || lines.length !== 0 ? 1 : 0;
    const nextBytes = selectedBytes + 1 + byteLength(displayPath);
    if (nextBytes + separatorBytes + suffixBytes > budget) {
      if (selected.length !== 0) {
        break;
      }
      if (selectedBytes > budget) {
        break;
      }
      let available = budget - selectedBytes;
      if (separatorBytes > available) {
        break;
      }
      available -= separatorBytes;
      if (suffixBytes > available) {
        break;
      }
      available -= suffixBytes;
      if (available === 0) {
        break;
      }
      displayPath = truncatePathMiddle(displayPath, available);
      if (selectedBytes + 1 + byteLength(displayPath) + separatorBytes + suffixBytes > budget) {
        break;
      }
    }
    selectedBytes += 1 + byteLength(displayPath);
    selected.push(displayPath);
  }
  lines.push(...selected);
  lines.push(...pathListSuffixLines(selected.length, paths.length, extensionSummary));
  return lines.join("\n");
}

function pathListSuffixLines(selectedCount, pathCount, extensionSummary) {
  const lines = [];
  if (selectedCount < pathCount) {
    lines.push(`[omitted ${pathCount - selectedCount} path(s); see original output for full results]`);
  }
  if (extensionSummary.length !== 0) {
    lines.push(`[extensions: ${truncateInlineText(extensionSummary, EXTENSION_SUMMARY_INLINE_WIDTH)}]`);
  }
  return lines;
}

function sortPathsForConcretePreview(paths) {
  const extensionCounts = /* @__PURE__ */ new Map();
  for (const filePath of paths) {
    const extension = pathExtension(filePath);
    extensionCounts.set(extension, (extensionCounts.get(extension) ?? 0) + 1);
  }
  const sorted = [...paths];
  sorted.sort((a, b) => {
    const countA = extensionCounts.get(pathExtension(a)) ?? 0;
    const countB = extensionCounts.get(pathExtension(b)) ?? 0;
    return countA - countB || naturalCmp(a, b);
  });
  return sorted;
}

function displayPathInPathListGroup(filePath, groupPath) {
  if (groupPath === ".") {
    return filePath;
  }
  const prefix = groupPath.endsWith("/") ? groupPath : `${groupPath}/`;
  return stripPrefix(filePath, prefix) ?? filePath;
}

function pathListGroupPath(filePath, commonPrefix) {
  const relative2 = commonPrefix.length === 0 ? filePath : trimStartMatchesChars(filePath.slice(commonPrefix.length), ["/"]);
  if (relative2.length === 0 || !relative2.includes("/")) {
    return joinDisplayPath(commonPrefix, ".");
  }
  const segments = trimStartMatchesChars(relative2, ["/"]).split("/");
  const firstSegment = segments.length > 0 ? segments[0] : "";
  const segment = firstSegment.length === 0 ? "." : firstSegment;
  return joinDisplayPath(commonPrefix, segment);
}

function commonDirectoryPrefix(paths) {
  if (paths.length === 0) {
    return "";
  }
  const directories = paths.map((filePath) => {
    const index2 = filePath.lastIndexOf("/");
    return index2 > 0 ? filePath.slice(0, index2) : "";
  });
  const firstParts = directories[0].split("/");
  let prefixLength = firstParts.length;
  for (const directory of directories.slice(1)) {
    const parts = directory.split("/");
    let i2 = 0;
    while (i2 < prefixLength && i2 < parts.length && firstParts[i2] === parts[i2]) {
      i2 += 1;
    }
    prefixLength = i2;
  }
  return firstParts.slice(0, prefixLength).join("/");
}

function directoryOfPath(filePath) {
  const normalized = normalizeDisplayPathSeparators(filePath);
  const index2 = normalized.lastIndexOf("/");
  return index2 > 0 ? normalized.slice(0, index2) : ".";
}

function splitToolOutputLines(output) {
  if (output.length === 0) {
    return [];
  }
  const pieces = [];
  let start = 0;
  for (let i2 = 0; i2 < output.length; i2++) {
    if (output[i2] === "\n") {
      pieces.push(output.slice(start, i2 + 1));
      start = i2 + 1;
    }
  }
  if (start < output.length) {
    pieces.push(output.slice(start));
  }
  const result = [];
  for (const piece of pieces) {
    let line = piece;
    if (line.endsWith("\r\n")) {
      line = line.slice(0, line.length - 2);
    } else if (line.endsWith("\n")) {
      line = line.slice(0, line.length - 1);
    }
    if (line.length !== 0) {
      result.push(line);
    }
  }
  return result;
}

function joinDisplayPath(prefix, child) {
  if (prefix.length === 0 || child === ".") {
    return prefix.length === 0 ? child : prefix;
  }
  return `${prefix.replace(/\/+$/, "")}/${child}`;
}

function normalizeDisplayPathSeparators(filePath) {
  return filePath.replaceAll("\\", "/");
}

function displayPathUnderPrefix(filePath, commonPrefix) {
  const normalized = normalizeDisplayPathSeparators(filePath);
  if (commonPrefix.length === 0) {
    return normalized;
  }
  const relative2 = trimStartMatchesChars(normalized.slice(commonPrefix.length), ["/"]);
  return relative2.length === 0 ? "." : relative2;
}

function summarizeExtensions(paths) {
  const counts = [];
  for (const filePath of paths) {
    const extension = pathExtension(filePath);
    const existing = counts.find((candidate) => candidate.extension === extension);
    if (existing !== void 0) {
      existing.count += 1;
    } else {
      counts.push({ extension, count: 1 });
    }
  }
  counts.sort((a, b) => b.count - a.count);
  return counts.slice(0, 8).map((entry) => `${entry.extension}=${entry.count}`).join(", ");
}

function pathExtension(filePath) {
  const pathOnly = filePath.split("::")[0];
  const slashSegments = pathOnly.split("/");
  const basename3 = slashSegments[slashSegments.length - 1];
  const index2 = basename3.lastIndexOf(".");
  if (index2 < 0) {
    return "[no extension]";
  }
  if (index2 === 0 || index2 === basename3.length - 1) {
    return "[no extension]";
  }
  return basename3.slice(index2);
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
export { compact, byteLength, countLines3, countsOf, minusCounts, reductionOf, pct, buildReport, compactSegment, segmentsEqual, jsStringLen, sliceJsUnits, splitWhitespace, saturatingSub, arraySliceEqual, isAsciiDigit2, isAsciiAlphabetic, trimStartMatchesChars, regexReplaceAll, regexTest, regexTestWithFlags, regexFind, regexCaptureFirst, regexFindAll, unchanged, lossy, indexAll, joinedLineBytes, shouldSkipToolOutputCompaction, fitsLargeOutputThreshold, compactedBodyBudget, totalGroupItems, truncateInlineText, excerptInlineText, normalizeInlineWhitespace, highSignalTextIndex, excerptAroundIndex, truncatePathMiddle, getPathPartsForMiddleTruncation, splitPathSegments, naturalCmp, compareNumber, compareString, compareCodePoint, classifyCommandResult, previewShellOutputCompaction, compactToolOutput, classifyCommandKinds, isShellSourceReadCommand, isSourceReadSegment, classifyCommandSegmentOrPipeline, classifyCommandSegment, splitUnquotedPipes, pushTrimmedPart, isBenignPipelineTail, stripPrefix, stripSuffix, splitOnce, rsplitOnce, asciiLowercase, parseUsize, isAptCommand, isPnpmInstallCommand, isGitProgressCommand, isGitCleanOrResetCommand, isGitCleanForceOption, isBenignGitCommand, gitSubcommandIndex, isJsTestCommand, isYarnBerryCommand, isNxCommand, isDjangoTestCommand, isGolangciLintCommand, isClangFormatLinterCommand, isGradleCommand, isCmakeConfigureCommand, isMavenCommand, isDotnetCommand, isUvCommand, isPipInstallCommand, isGoCommand, isPytestCommand, isPythonUnittestCommand, isPythonBuildCommand, isPythonBuildExtCommand, isPythonScriptCommand, isHeredocStdinPythonCommand, isBenignSetupCommand, isSourceActivateCommand, isBenignCorepackYarnSetupCommand, isBenignPythonVenvCommand, isBenignGofmtWriteCommand, isBenignTarballCleanupCommand, isBenignPythonBuildCleanupCommand, isBenignVersionCommand, isAssignmentList, stripEnvironmentAssignmentPrefix, stripSafeCommandWrappers, isLiteralSeparatorCommand, isSafeShellGrepCommand, isShellGrepFlagWithValue, isSafeShellGrepFlag, isUnsafeShellGrepFlag, isSafeStreamingGrepTail, isSafeStreamingFlagOnlyTail, isSavedToolOutputPath, normalizeSegment, replaceSafeCommandSubstitutions, splitCommandSegments, pushCommandSegment, stripQuotedText, isEscapedByOddBackslashes, isWhitespaceChar2, startsWithWhitespace, stripHeredocBodies, parseHeredocOpener, lastChainSegment, hasErrexitBeforeFirstCommand, isSetECommand, commandRunsGoTest, commandMentionsSavedToolOutput, looksLikeNpmPackOutput, hasDocusaurusProgress, hasPassingGoTestOutput, hasGoTestFailureOutput, pythonExecutablePattern, pythonWithOptionsPattern, compactShellOutput, applyStringCompactor, compactCommandEntry, stringCompactionResult, applyPythonBuildNoise, compactGoCommandOutput, compactMavenOutput, compactPythonEcosystemNoise, compactPipInstallProgress, compactPythonNinjaBuildProgress, compactPythonBuildExtProgress, compactSphinxProgressFallback, compactPytestSessionMetadata, compactDjangoTestBoilerplate, compactDjangoTestProgress, compactClangFormatLinterOutput, compactDotnetTimingProgress, flushDotnetTimingProgress, isDotnetStandaloneTimingLine, compactGitCleanRemovingRuns, isGitCleanRemovingLine, collapseContiguousRuns, collapseRunsWithExamples, compactRepeatedNodeWarnings, getNodeWarningKey, omitMatchingLines, omitNonDiagnosticLines, flushOmittedLines, compactPackageManagerOperations, hasPackageManagerOperations, isPackageManagerOperationLine, packageManagerOperationExample, parsePackageManagerOperation, uniqueStrings, summarizeWithMore, compactNpmPackOutput, flushNpmPackOmitted, isNpmPackFileListingLine, stripNpmSpinnerPrefix, isDecimalNumber, compactGoOutput, flushGoDownloads, isGoModuleDownloadChatterLine, compactRepeatedDiagnosticBlocks, findRepeatedDiagnosticBlock, isDiagnosticLine, compactCargoProgress, hasCargoProgressOutput, hasCargoProgressEvidence, isCargoProgressLine, hasCargoFailure, hasCargoTerminalSummary, compactUnittestOutput, hasPassingUnittestSummary, isUnittestSuccessProgressLine, isClangFormatDebugLine, compactCmakeConfigureProbeRuns, isCmakeConfigureProbeLine, isCmakeLookingForProbeLine, compactMavenDependencyTransfer, compactMavenPassingTests, compactMavenInfoBoilerplate, hasMavenDependencyTransfer, hasMavenPassingTests, hasMavenInfoBoilerplate, isMavenOutput, isMavenDependencyTransferLine, mavenDependencyTransferExample, isMavenPassingTestLine, mavenPassingTestExample, isMavenInfoBoilerplateLine, compactGolangciLintOutput, hasGolangciLintMarker, isGolangciLintOmittableLine, hasGolangciLintSafeInfoPrefix, compactGitProgress, unchangedLine, pushCompactedLine, compactGitProgressLine, compactProgressPatternsUnlessDiagnostic, compactProgressPatterns, compactRepeatedProgressFrames, getGitProgressLineKey, compactJsTestOutput, compactJestRunsProgress, hasPassingJsTestSummary, hasJestRunsProgress, hasJestSummaryMarker, isJestRunsProgressLine, isJsTestProgressLine, compactGradleOutput, compactIntralineProgress, compactGradleProgressFrames, isGradleProgressFrameSeparator, isGradleBoilerplateLine, compactUvProgress, hasUvSummaryMarker, isUvProgressLine, uvProgressExample, uvProgressActivity, stripAnsi, compactNxLernaFrameProgress, flushNxLernaOmitted, isNxLernaFrameNoiseLine, hasNxLernaFrameProgress, compactPnpmOutput, compactPnpmInstallProgress, flushPnpmProgress, flushPnpmWarningCounters, flushPnpmDownload, isPnpmProgressLine, pnpmDownloadPackage, isPnpmWarningCounterLine, pnpmPackageBarSize, pnpmWorkspacePrefix, stripPnpmWorkspacePrefix, pnpmWorkspacePrefixEnd, compactNpmOutput, compactYarn1ProgressFrames, isNpmInstallProgressLine, compactYarnBerryOutput, compactYarnBerryProgress, hasYarnBerryCompletedOutput, isYarnBerryProgressLine, compactMakeOutput, compactNinjaProgressFrames, compactMakeProgress, getMakeProgressKey, splitMakeRuleLine, directoryGlob, compactAptOutput, compactAptProgressFrames, removeProgressMatches, compactNeedrestartNoopProgress, hasNeedrestartNoopSummary, isNeedrestartNoopSummaryLine, hasNeedrestartActionableState, compactNeedrestartProgressLine, compactAptDpkgLifecycleBlocks, isAptDpkgLifecycleLine, parseAptPackageLifecycleLine, summarizePackages, isAptProgressLine, isPythonEcosystemNoiseLine, compactSetuptoolsDeprecationBlocks, isSetuptoolsDeprecationHeader, setuptoolsWarningName, isSetuptoolsBannerLine, compactCythonPerformanceHints, isCythonPerformanceHintHeader, compactCompilerWarningRuns, collectCompilerDiagnosticRun, compilerDiagnosticKind, isStrictCompilerDiagnosticLine, isCompilerErrorLine, isCompilerContextErrorLine, isUnsafeCompactionContextLine, countCompilerErrorLines, isPipInstallProgressLine, isPipRootUserWarning, isPythonNinjaBuildProgressLine, isPythonBuildExtProgressLine, compactSetuptoolsFileStagingRuns, isSetuptoolsFileStagingLine, compactNumpyDistutilsProbes, isNumpyDistutilsProbeLine, compactSphinxProgress, compactSphinxProgressLine, hasSphinxProgress, hasSphinxOutputMarker, compactDocusaurusProgress, compactCarriageReturnProgress, looksLikeGoRuntimePanic, compactGoRuntimePanicDump, collectGoGoroutineBlocks, compactGoGoroutineBlock, groupRepeatedGoGoroutineBlocks, goGoroutineSignature, goFunctionName, goFileLocation, goCreatedByFunction, findGoGoroutineFooterStart, isGoGoroutineStackLine, isGoRuntimeGoroutineHeader, isDjangoTestBoilerplateLine, isDjangoTestProgressLine, isPytestSessionMetadataLine, compactPytestProgress, omitPytestProgressLines, flushPytestProgressLines, isPytestProgressLine, hasPytestProgressFallbackPoison, hasHardCrashLine, hasStrictPytestPassedProgressRun, isStrictPytestPassedProgressLine, hasPytestTerminalSummary, compactPytestFailureBlocks, compactPytestFailureRegion, parsePytestFailureBlockHeader, pytestFailureBlockKey, normalizePytestFailureLine, isPytestSummaryLine, countPytestShortSummaryLines, countPytestSectionHeaders, isPytestSectionHeader, pytestSectionName, compactPytestWarningsSummary, compactPytestWarningsSummaryRegion, formatPytestWarningBlock, parsePytestWarningBody, parsePytestWarningLocation, normalizePytestWarningMessage, isPytestWarningTestIdLine, compactGrepContentOutput, grepContentGroups, renderGrepContentGroups, parseGrepContentLine, parseNumberedGrepContentLine, looksLikeGrepPath, renderBudgetedGrepContentGroups, renderBudgetedGrepContentGroupsWithLimit, formatBudgetedGrepGroup, selectEvenlySpacedGrepMatches, formatGrepMatch, compactGrepCountOutput, parseGrepCountLine, summarizeCountDirectories, compactPathListOutput, renderPathListGroups, selectHeadTailToShow, renderBudgetedFlatPathList, pathListSuffixLines, sortPathsForConcretePreview, displayPathInPathListGroup, pathListGroupPath, commonDirectoryPrefix, directoryOfPath, splitToolOutputLines, joinDisplayPath, normalizeDisplayPathSeparators, displayPathUnderPrefix, summarizeExtensions, pathExtension, compareStrings, DEFAULT_LARGE_OUTPUT_THRESHOLD, DEFAULT_SHELL_GREP_LARGE_OUTPUT_THRESHOLD, DEFAULT_MIN_SAVED_CHARS, textEncoder2, COMPACTED_REFERENCE_OVERHEAD_BUDGET, COMMON_PREFIX_DISPLAY_WIDTH, EXTENSION_SUMMARY_INLINE_WIDTH, GO_RUNTIME_PANIC_MIN_GOROUTINES, CARGO_PROGRESS_PREFIXES, COMMAND_COMPACTOR_ORDER, BENIGN_SEGMENT };
