// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingStates.ts
import { mapValues } from "./module-0098.mjs";


// src/vs/workbench/contrib/testing/common/testingStates.ts
var statePriority = {
  [2 /* Running */]: 6,
  [6 /* Errored */]: 5,
  [4 /* Failed */]: 4,
  [1 /* Queued */]: 3,
  [3 /* Passed */]: 2,
  [0 /* Unset */]: 0,
  [5 /* Skipped */]: 1
};

var stateNodes = mapValues(statePriority, (priority, stateStr) => {
  const state = Number(stateStr);
  return { statusNode: true, state, priority };
});

var cmpPriority = (a, b) => statePriority[b] - statePriority[a];

var maxPriority = (...states) => {
  switch (states.length) {
    case 0:
      return 0 /* Unset */;
    case 1:
      return states[0];
    case 2:
      return statePriority[states[0]] > statePriority[states[1]] ? states[0] : states[1];
    default: {
      let max = states[0];
      for (let i2 = 1; i2 < states.length; i2++) {
        if (statePriority[max] < statePriority[states[i2]]) {
          max = states[i2];
        }
      }
      return max;
    }
  }
};

var statesInOrder = Object.keys(statePriority).map((s) => Number(s)).sort(cmpPriority);

var terminalStatePriorities = {
  [3 /* Passed */]: 0,
  [5 /* Skipped */]: 1,
  [4 /* Failed */]: 2,
  [6 /* Errored */]: 3
};

var makeEmptyCounts = () => {
  return new Uint32Array(statesInOrder.length);
};
export { statePriority, stateNodes, cmpPriority, maxPriority, statesInOrder, terminalStatePriorities, makeEmptyCounts };
