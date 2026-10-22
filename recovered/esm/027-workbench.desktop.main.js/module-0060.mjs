// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/changeTracker.ts
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/base/common/observableInternal/changeTracker.ts
function recordChanges(obs) {
  return {
    createChangeSummary: (_previousChangeSummary) => {
      return {
        changes: []
      };
    },
    handleChange(ctx, changeSummary) {
      for (const key3 in obs) {
        if (ctx.didChange(obs[key3])) {
          changeSummary.changes.push({ key: key3, change: ctx.change });
        }
      }
      return true;
    },
    beforeUpdate(reader, changeSummary) {
      for (const key3 in obs) {
        if (key3 === "changes") {
          throw new BugIndicatingError('property name "changes" is reserved for change tracking');
        }
        changeSummary[key3] = obs[key3].read(reader);
      }
    }
  };
}

function recordChangesLazy(getObs) {
  let obs = void 0;
  return {
    createChangeSummary: (_previousChangeSummary) => {
      return {
        changes: []
      };
    },
    handleChange(ctx, changeSummary) {
      if (!obs) {
        obs = getObs();
      }
      for (const key3 in obs) {
        if (ctx.didChange(obs[key3])) {
          changeSummary.changes.push({ key: key3, change: ctx.change });
        }
      }
      return true;
    },
    beforeUpdate(reader, changeSummary) {
      if (!obs) {
        obs = getObs();
      }
      for (const key3 in obs) {
        if (key3 === "changes") {
          throw new BugIndicatingError('property name "changes" is reserved for change tracking');
        }
        changeSummary[key3] = obs[key3].read(reader);
      }
    }
  };
}
export { recordChanges, recordChangesLazy };
