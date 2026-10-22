// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/tree/quickInputTree.ts



// src/vs/platform/quickinput/browser/tree/quickInputTree.ts
function getParentNodeState(parentChildren) {
  let containsChecks = false;
  let containsUnchecks = false;
  let containsMixed = false;
  for (const element of parentChildren) {
    switch (element.element?.checked) {
      case "mixed":
        containsMixed = true;
        break;
      case true:
        containsChecks = true;
        break;
      default:
        containsUnchecks = true;
        break;
    }
    if (containsChecks && containsUnchecks && containsMixed) {
      break;
    }
  }
  const newState = containsUnchecks ? containsMixed ? "mixed" : containsChecks ? "mixed" : false : containsMixed ? "mixed" : containsChecks;
  return newState;
}
export { getParentNodeState };
