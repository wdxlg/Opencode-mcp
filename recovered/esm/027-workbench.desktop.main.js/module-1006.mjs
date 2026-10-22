// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/legacyProtocolCompatibility.ts
import { hasKey } from "./module-0010.mjs";


// src/vs/platform/agentHost/common/state/legacyProtocolCompatibility.ts
function readLegacyTurnError(turn) {
  if (!hasKey(turn, { error: true })) {
    return void 0;
  }
  return turn.error;
}

function normalizeLegacyTurnError(turn) {
  if (turn.state !== "error" /* Error */ || !hasKey(turn, { error: true })) {
    return turn;
  }
  const { error, ...normalizedTurn } = turn;
  const finalPart = turn.responseParts[turn.responseParts.length - 1];
  return {
    ...normalizedTurn,
    responseParts: finalPart?.kind === "error" /* Error */ ? turn.responseParts : [...turn.responseParts, { kind: "error" /* Error */, error }]
  };
}

function normalizeLegacyChatStateErrors(state) {
  const turns = state.turns.map(normalizeLegacyTurnError);
  return turns.some((turn, index2) => turn !== state.turns[index2]) ? { ...state, turns } : state;
}

function normalizeLegacyActionEnvelope(envelope) {
  const action = envelope.action;
  switch (action.type) {
    case "chat/error" /* ChatError */:
      if (hasKey(action, { error: true })) {
        const { error, ...normalizedAction } = action;
        return {
          ...envelope,
          action: {
            ...normalizedAction,
            part: { kind: "error" /* Error */, error }
          }
        };
      }
      return { ...envelope, action };
    case "chat/turnsLoaded" /* ChatTurnsLoaded */: {
      const turns = action.turns.map(normalizeLegacyTurnError);
      return turns.some((turn, index2) => turn !== action.turns[index2]) ? { ...envelope, action: { ...action, turns } } : { ...envelope, action };
    }
    default:
      return { ...envelope, action };
  }
}
export { readLegacyTurnError, normalizeLegacyTurnError, normalizeLegacyChatStateErrors, normalizeLegacyActionEnvelope };
