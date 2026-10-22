// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/surveys/browser/surveyQuestions.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/surveys/browser/surveyQuestions.ts
var CopilotPMFSurvey = {
  id: "copilot-pmf",
  title: localize(19463, null),
  description: localize(19429, null),
  questions: [
    {
      type: "segment" /* Segment */,
      id: "disappointment",
      required: true,
      telemetryKey: "score",
      asMeasurement: true,
      label: localize(19430, null),
      options: [
        { id: "not-at-all", label: localize(19432, null) },
        { id: "slightly", label: localize(19433, null) },
        { id: "somewhat", label: localize(19434, null) },
        { id: "very", label: localize(19435, null) },
        { id: "extremely", label: localize(19431, null) }
      ]
    },
    {
      type: "radio" /* Radio */,
      id: "primary-benefit",
      telemetryKey: "primaryBenefit",
      label: localize(19436, null),
      columns: 2,
      shuffleOptions: true,
      options: [
        { id: "shipping-faster", label: localize(19444, null) },
        { id: "getting-unstuck", label: localize(19438, null) },
        { id: "multi-file", label: localize(19439, null) },
        { id: "automating", label: localize(19437, null) },
        { id: "understanding", label: localize(19445, null) },
        { id: "planning", label: localize(19442, null) },
        { id: "reviewing", label: localize(19443, null) },
        { id: "no-clear-value", label: localize(19440, null) },
        { id: "other", label: localize(19441, null) }
      ]
    },
    {
      type: "radio" /* Radio */,
      id: "primary-friction",
      telemetryKey: "primaryFriction",
      label: localize(19446, null),
      columns: 2,
      shuffleOptions: true,
      options: [
        { id: "trust", label: localize(19456, null) },
        { id: "context", label: localize(19448, null) },
        { id: "bigger-tasks", label: localize(19447, null) },
        { id: "reviewing-time", label: localize(19451, null) },
        { id: "steering", label: localize(19455, null) },
        { id: "slow", label: localize(19454, null) },
        { id: "setup", label: localize(19453, null) },
        { id: "security", label: localize(19452, null) },
        { id: "cost", label: localize(19449, null) },
        { id: "other", label: localize(19450, null) }
      ]
    },
    {
      type: "segment" /* Segment */,
      id: "programming-experience",
      telemetryKey: "programmingExperience",
      asMeasurement: true,
      label: localize(19457, null),
      options: [
        { id: "less-than-3", label: localize(19462, null) },
        { id: "3-to-5", label: localize(19460, null) },
        { id: "6-to-9", label: localize(19461, null) },
        { id: "10-to-19", label: localize(19458, null) },
        { id: "20-plus", label: localize(19459, null) }
      ]
    }
  ]
};
export { CopilotPMFSurvey };
