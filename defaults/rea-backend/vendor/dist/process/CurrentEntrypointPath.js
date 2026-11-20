import * as __reaScope from "../../../native/context.mjs";
import { resolve } from "node:path";
/** Node's absolute argv script selection, or undefined when none was supplied.
 * Native executable paths have different traversal semantics and must not use this.
 */
export const normalizeEntrypointPath = (entrypoint) => entrypoint === undefined || entrypoint.length === 0
    ? undefined
    : __reaScope.backendResolve(entrypoint);
export const CURRENT_ENTRYPOINT_PATH = normalizeEntrypointPath(process.argv[1]);
