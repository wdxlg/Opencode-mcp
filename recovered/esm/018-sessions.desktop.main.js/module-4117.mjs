// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/surveys/browser/surveyEditorPane.ts
import { EditorPane } from "./module-1090.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { status } from "./module-0076.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorService } from "./module-0935.mjs";
import { shuffle } from "./module-0007.mjs";


// src/vs/workbench/contrib/surveys/browser/surveyEditorPane.ts
var SurveyEditorPane = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, editorService) {
    super(SurveyEditorPane.ID, group2, telemetryService, themeService, storageService);
    this.editorService = editorService;
    this.inputDisposables = this._register(new DisposableStore());
    this.answers = /* @__PURE__ */ new Map();
    this.renderNonce = 0;
  }
  static {
    this.ID = "workbench.editor.survey";
  }
  createEditor(parent) {
    this.container = append(parent, $("div.survey-editor-pane"));
    this.container.setAttribute("role", "form");
    this.container.setAttribute("aria-label", localize(19423, null));
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (token.isCancellationRequested || !this.container) {
      return;
    }
    this.resetState();
    this.renderForm(this.container, input.survey);
  }
  clearInput() {
    this.resetState();
    super.clearInput();
  }
  resetState() {
    this.inputDisposables.clear();
    this.answers.clear();
    this.firstInput = void 0;
    this.renderNonce++;
    if (this.container) {
      clearNode(this.container);
    }
  }
  renderForm(container2, survey) {
    const form = append(container2, $("div.survey-form"));
    const title = append(form, $("div.survey-title"));
    const titleIcon = append(title, $("span.survey-title-icon"));
    titleIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.sparkle));
    titleIcon.setAttribute("aria-hidden", "true");
    const titleText = append(title, $("span"));
    titleText.textContent = survey.title;
    const description = append(form, $("div.survey-description"));
    description.textContent = survey.description;
    for (const question of survey.questions) {
      this.renderQuestion(form, question);
    }
    const submitRow = append(form, $("div.survey-submit-row"));
    const submitButton = this.inputDisposables.add(new Button(submitRow, { ...defaultButtonStyles }));
    submitButton.label = localize(19425, null);
    submitButton.enabled = false;
    const hintId = `survey-hint-${this.renderNonce}`;
    const hint = append(submitRow, $("div.survey-submit-hint"));
    hint.id = hintId;
    hint.textContent = localize(19426, null);
    submitButton.element.setAttribute("aria-describedby", hintId);
    const requiredQuestionIds = survey.questions.filter((q) => q.required).map((q) => q.id);
    const updateSubmitState = () => {
      const allRequiredAnswered = requiredQuestionIds.every((id2) => {
        const answer = this.answers.get(id2);
        return answer && answer.length > 0;
      });
      submitButton.enabled = allRequiredAnswered;
      hint.style.display = allRequiredAnswered ? "none" : "";
    };
    this.inputDisposables.add(submitButton.onDidClick(() => {
      submitButton.enabled = false;
      this.handleSubmit(container2, survey);
    }));
    this.inputDisposables.add(addDisposableListener(form, "change", () => {
      updateSubmitState();
    }));
  }
  renderQuestion(parent, question) {
    const questionEl = append(parent, $("div.survey-question"));
    const labelId = `survey-q-${this.renderNonce}-${question.id}`;
    const label3 = append(questionEl, $("div.survey-question-label"));
    label3.id = labelId;
    label3.textContent = question.required ? question.label : localize(19424, null, question.label);
    const namePrefix = `${this.renderNonce}-${question.id}`;
    switch (question.type) {
      case "segment" /* Segment */:
        this.renderSegmentQuestion(questionEl, question, labelId, namePrefix);
        break;
      case "radio" /* Radio */:
        this.renderListQuestion(questionEl, question, labelId, namePrefix);
        break;
    }
  }
  renderSegmentQuestion(parent, question, labelId, namePrefix) {
    const group2 = append(parent, $("div.survey-segment-group"));
    group2.setAttribute("role", "radiogroup");
    group2.setAttribute("aria-labelledby", labelId);
    if (question.required) {
      group2.setAttribute("aria-required", "true");
    }
    for (let i2 = 0; i2 < question.options.length; i2++) {
      const option2 = question.options[i2];
      const radio = append(group2, $("input.survey-segment-input"));
      radio.type = "radio";
      radio.name = namePrefix;
      radio.value = option2.id;
      radio.id = `survey-seg-${namePrefix}-${i2}`;
      if (!this.firstInput) {
        this.firstInput = radio;
      }
      const optionLabel = append(group2, $("label.survey-segment-label"));
      optionLabel.htmlFor = radio.id;
      optionLabel.textContent = option2.label;
      this.inputDisposables.add(addDisposableListener(radio, "change", () => {
        if (radio.checked) {
          this.answers.set(question.id, [option2.id]);
        }
      }));
    }
  }
  renderListQuestion(parent, question, labelId, namePrefix) {
    const group2 = append(parent, $("div.survey-list-group"));
    group2.setAttribute("role", "radiogroup");
    group2.setAttribute("aria-labelledby", labelId);
    if (question.required) {
      group2.setAttribute("aria-required", "true");
    }
    if (question.columns === 2) {
      group2.classList.add("columns-2");
    }
    const options3 = question.shuffleOptions ? shuffleOptionsExceptLast(question.options) : question.options;
    for (let i2 = 0; i2 < options3.length; i2++) {
      const option2 = options3[i2];
      const optionLabel = append(group2, $("label.survey-list-option"));
      const radio = append(optionLabel, $("input.survey-list-input"));
      radio.type = "radio";
      radio.name = namePrefix;
      radio.value = option2.id;
      if (!this.firstInput) {
        this.firstInput = radio;
      }
      const text2 = append(optionLabel, $("span"));
      text2.textContent = option2.label;
      this.inputDisposables.add(addDisposableListener(radio, "change", () => {
        if (radio.checked) {
          this.answers.set(question.id, [option2.id]);
        }
      }));
    }
  }
  handleSubmit(container2, survey) {
    const answersSnapshot = {};
    for (const [key3, value2] of this.answers) {
      answersSnapshot[key3] = [...value2];
    }
    let score3 = -1;
    let primaryBenefit = "";
    let primaryFriction = "";
    let programmingExperience = -1;
    for (const question of survey.questions) {
      if (!question.telemetryKey) {
        continue;
      }
      const answer = answersSnapshot[question.id]?.[0] ?? "";
      if (question.asMeasurement) {
        const index2 = answer ? question.options.findIndex((o) => o.id === answer) : -1;
        switch (question.telemetryKey) {
          case "score":
            score3 = index2;
            break;
          case "programmingExperience":
            programmingExperience = index2;
            break;
        }
      } else {
        switch (question.telemetryKey) {
          case "primaryBenefit":
            primaryBenefit = answer;
            break;
          case "primaryFriction":
            primaryFriction = answer;
            break;
        }
      }
    }
    const source = this.input?.source ?? "";
    this.telemetryService.publicLog2("survey/submit", {
      surveyId: survey.id,
      source,
      score: score3,
      primaryBenefit,
      primaryFriction,
      programmingExperience
    });
    const submittedInput = this.input;
    this.showSuccess(container2, submittedInput);
  }
  showSuccess(container2, submittedInput) {
    clearNode(container2);
    const success = append(container2, $("div.survey-success"));
    success.setAttribute("role", "status");
    success.setAttribute("aria-live", "polite");
    const icon2 = append(success, $("div.survey-success-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.checkAll));
    icon2.setAttribute("aria-hidden", "true");
    const successMessage = localize(19428, null);
    const message = append(success, $("div.survey-success-message"));
    message.textContent = successMessage;
    const detail2 = append(success, $("div.survey-success-detail"));
    detail2.textContent = localize(19427, null);
    status(successMessage);
    success.tabIndex = -1;
    success.focus();
    const timeout2 = setTimeout(() => {
      if (submittedInput) {
        this.editorService.closeEditor({ editor: submittedInput, groupId: this.group.id }).catch(onUnexpectedError);
      }
    }, 5e3);
    this.inputDisposables.add({ dispose: () => clearTimeout(timeout2) });
  }
  focus() {
    super.focus();
    this.firstInput?.focus();
  }
  layout() {
  }
};

SurveyEditorPane = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IEditorService)
], SurveyEditorPane);

function shuffleOptionsExceptLast(options3) {
  if (options3.length < 2) {
    return options3;
  }
  const shuffledOptions = options3.slice(0, -1);
  shuffle(shuffledOptions);
  return [...shuffledOptions, options3[options3.length - 1]];
}
export { shuffleOptionsExceptLast, SurveyEditorPane };
