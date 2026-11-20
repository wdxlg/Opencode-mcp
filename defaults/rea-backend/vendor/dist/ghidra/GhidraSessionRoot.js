import * as __reaScope from "../../../native/context.mjs";
import { dirname, isAbsolute, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
/** Session roots may not contain a dot-prefixed path element. */
const hasDotPrefixElement = (directory) => __reaScope.backendResolve(directory)
    .split(sep)
    .some((element) => element.startsWith("."));
/** Nearest ancestor of `directory`, inclusive, that has no dot-prefixed element. */
const nearestSafeAncestor = (directory) => {
    let current = __reaScope.backendResolve(directory);
    for (;;) {
        if (!hasDotPrefixElement(current))
            return current;
        const parent = dirname(current);
        if (parent === current)
            return undefined;
        current = parent;
    }
};
/**
 * Select a session root usable as the parent of a Ghidra project path.
 *
 * Ghidra validates every project path element with `NamingUtilities.checkName`
 * and aborts the headless analyzer on any element that starts with `.`, so an
 * inherited `TMPDIR` such as `~/.cache/<tool>` fails every Ghidra operation
 * with a generic analysis failure. Prefer the inherited base when it is usable,
 * then a dot-free platform temp directory, then the nearest dot-free ancestor.
 */
export const ghidraSessionRoot = (options = {}) => {
    const base = __reaScope.backendResolve(options.base ?? __reaScope.backendTempDir());
    if (!hasDotPrefixElement(base))
        return base;
    const platform = options.platform ?? process.platform;
    const fallback = options.fallback ?? (platform === "win32" ? undefined : "/tmp");
    if (fallback !== undefined &&
        isAbsolute(fallback) &&
        !hasDotPrefixElement(fallback))
        return __reaScope.backendResolve(fallback);
    return nearestSafeAncestor(base) ?? base;
};
