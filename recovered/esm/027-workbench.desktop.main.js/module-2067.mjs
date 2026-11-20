// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/askQuestionsTool.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { Disposable } from "./module-0012.mjs";
import { StopWatch } from "./module-0016.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { CancellationError } from "./module-0004.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { IChatService, IChatToolInvocation } from "./module-0972.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { hasKey } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isOpenCodeFullAutoMode } from "./module-0964.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/askQuestionsTool.ts
// OpenCode: 全自动模式（opencode.chat.permissionMode = fullAuto）或 chat.autoReply 下，提问不等待用户，直接采用推荐项。
// 选项题：模型标了 recommended 的选项（单选取第一个、多选取全部）；没标时回退为第一个选项。
// 自由回答题：recommendedAnswer；没有时回答 AUTO_ANSWER_FREE_TEXT。
var AUTO_ANSWER_FREE_TEXT = "\u8bf7\u6309\u4f60\u63a8\u8350\u7684\u65b9\u6848\u7ee7\u7eed";

var RECOMMENDED_TAG = "\uff08\u63a8\u8350\uff09";

/** 有效推荐项：模型标注的 recommended 选项（单选只取第一个）；一个都没标时回退为第一个选项。 */
function getEffectiveRecommendedOptions(question) {
  const options = Array.isArray(question?.options) ? question.options.filter((opt) => opt && typeof opt.label === "string") : [];
  if (options.length === 0) {
    return [];
  }
  const marked = options.filter((opt) => opt.recommended === true);
  if (marked.length === 0) {
    return [options[0]];
  }
  return question.multiSelect ? marked : [marked[0]];
}

/** 全自动作答：返回与用户作答相同结构的答案 { selected, freeText, skipped }。 */
function buildRecommendedAnswer(question) {
  const recommended = getEffectiveRecommendedOptions(question);
  if (recommended.length > 0) {
    return { selected: recommended.map((opt) => opt.label), freeText: null, skipped: false };
  }
  const freeText = typeof question?.recommendedAnswer === "string" && question.recommendedAnswer.trim() ? question.recommendedAnswer.trim() : AUTO_ANSWER_FREE_TEXT;
  return { selected: [], freeText, skipped: false };
}

var AskQuestionsToolId = "vscode_askQuestions";

var SoftLimits = {
  header: 50,
  question: 200
};

var HardLimits = {
  header: 75
};

function truncateToLimit(value2, limit) {
  if (value2 === void 0) {
    return void 0;
  }
  if (value2.length > limit) {
    return value2.slice(0, limit - 3) + "...";
  }
  return value2;
}

function createAskQuestionsToolData() {
  const questionSchema = {
    type: "object",
    properties: {
      header: {
        type: "string",
        description: `Short identifier for the question. Must be unique so answers can be mapped back to the question. Maximum ${SoftLimits.header} characters.`,
        maxLength: SoftLimits.header
      },
      question: {
        type: "string",
        description: `The question text to display to the user. Keep it concise, ideally one sentence. Maximum ${SoftLimits.question} characters.`,
        maxLength: SoftLimits.question
      },
      multiSelect: {
        type: "boolean",
        description: "Allow selecting multiple options when options are provided."
      },
      allowFreeformInput: {
        type: "boolean",
        description: "Allow freeform text answers in addition to option selection. Defaults to true; set to false to restrict to predefined options only."
      },
      message: {
        type: "string",
        description: "Optional markdown message to display below the question text, providing additional context or details."
      },
      recommendedAnswer: {
        type: "string",
        description: "For free-text questions (no options): the answer you recommend. Pre-filled for the user and used automatically in full-auto mode."
      },
      options: {
        type: "array",
        description: "Optional list of selectable answers. If omitted, the question is free text.",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Display label and value for the option."
            },
            description: {
              type: "string",
              description: "Optional secondary text shown with the option."
            },
            recommended: {
              type: "boolean",
              description: "Mark the option you recommend. Every question with options MUST have exactly one option with recommended: true (for multiSelect, mark each recommended option). It is shown to the user as the highlighted default and is chosen automatically when the user enabled full-auto mode."
            }
          },
          required: ["label"]
        }
      }
    },
    required: ["header", "question"]
  };
  const inputSchema3 = {
    type: "object",
    properties: {
      questions: {
        type: "array",
        description: "List of questions to ask the user. Order is preserved.",
        items: questionSchema,
        minItems: 1
      }
    },
    required: ["questions"]
  };
  return {
    id: AskQuestionsToolId,
    toolReferenceName: "askQuestions",
    legacyToolReferenceFullNames: [AskQuestionsToolId, "vscode/askQuestions"],
    canBeReferencedInPrompt: false,
    icon: ThemeIcon.fromId(Codicon.question.id),
    displayName: localize(13398, null),
    userDescription: localize(13399, null),
    modelDescription: "Use this tool to ask the user a small number of clarifying questions before proceeding. Provide the questions array with concise headers and prompts. Use options for fixed choices, set multiSelect when multiple selections are allowed. Users can always provide a freeform text answer alongside options unless you set allowFreeformInput to false. Always mark exactly one recommended option per question (recommended: true) and give recommendedAnswer for free-text questions; when the user has enabled full-auto mode the questions are not shown for input and your recommended answers are used directly.",
    source: ToolDataSource.Internal,
    inputSchema: inputSchema3
  };
}

var AskQuestionsToolData = createAskQuestionsToolData();

var AskQuestionsTool = class extends Disposable {
  constructor(chatService, telemetryService, logService, configService) {
    super();
    this.chatService = chatService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.configService = configService;
  }
  async invoke(invocation, _countTokens, progress, token) {
    const stopWatch = StopWatch.create(true);
    const parameters = invocation.parameters;
    const { questions } = parameters;
    this.logService.trace(`[AskQuestionsTool] Invoking with ${questions?.length ?? 0} question(s)`);
    if (!questions || questions.length === 0) {
      throw new Error(localize(13396, null));
    }
    const chatSessionResource = invocation.context?.sessionResource;
    const chatRequestId = invocation.chatRequestId;
    const { request: request2, sessionResource } = this.getRequest(chatSessionResource, chatRequestId);
    if (!sessionResource || !request2) {
      this.logService.warn("[AskQuestionsTool] Missing chat context; marking all questions as skipped.");
      return this.createSkippedResult(questions);
    }
    const resolveId = invocation.chatStreamToolCallId ?? invocation.callId;
    const fullAuto = isOpenCodeFullAutoMode(this.configService);
    if (fullAuto || this.configService.getValue("chat.autoReply" /* AutoReply */)) {
      this.logService.info(`[AskQuestionsTool] ${fullAuto ? "Full-auto mode" : "Auto-reply enabled"}: answering with recommended options`);
      const { carousel: carousel2, idToHeaderMap: idToHeaderMap2 } = this.toQuestionCarousel(questions, resolveId);
      carousel2.terminalId = this.extractTerminalId(request2);
      const autoAnswers = this.createRecommendedAnswers(questions);
      carousel2.data = this.buildRecommendedCarouselAnswers(questions, carousel2, idToHeaderMap2, autoAnswers);
      carousel2.isUsed = true;
      this.chatService.appendProgress(request2, carousel2);
      this.chatService.appendProgress(request2, {
        kind: "markdownContent",
        content: new MarkdownString(this.describeRecommendedAnswers(questions, autoAnswers, fullAuto))
      });
      return {
        content: [{ kind: "text", value: JSON.stringify({ answers: autoAnswers, autoAnswered: fullAuto ? "full-auto mode: the user is not waiting; recommended options were chosen automatically" : "auto-reply: recommended options were chosen automatically" }) }]
      };
    }
    const { carousel, idToHeaderMap } = this.toQuestionCarousel(questions, resolveId);
    carousel.terminalId = this.extractTerminalId(request2);
    this.logService.trace(`[AskQuestionsTool] request=${request2.id} terminalExecutionId=${request2.terminalExecutionId ?? "undefined"} carousel.terminalId=${carousel.terminalId ?? "undefined"}`);
    this.chatService.appendProgress(request2, carousel);
    const externalAnswerListener = this.chatService.onDidReceiveQuestionCarouselAnswer((event) => {
      if (event.resolveId !== carousel.resolveId || carousel.isUsed) {
        return;
      }
      carousel.dismiss(event.answers);
    });
    let answerResult;
    try {
      answerResult = await raceCancellation(carousel.completion.p, token);
    } catch (error) {
      if (error instanceof CancellationError) {
        carousel.dismiss(void 0);
      }
      throw error;
    } finally {
      externalAnswerListener.dispose();
    }
    if (!answerResult) {
      carousel.dismiss(void 0);
      throw new CancellationError();
    }
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (carousel.dismissedByTerminalInput && carousel.terminalId) {
      this.logService.info(`[AskQuestionsTool] Carousel dismissed because user typed directly in terminal ${carousel.terminalId}`);
      return {
        content: [{
          kind: "text",
          value: `The user is replying to the terminal prompts directly. Do not ask more questions or send input to the terminal. You will be automatically notified when the command in terminal ${carousel.terminalId} completes.`
        }]
      };
    }
    progress.report({ message: localize(13397, null) });
    const converted = this.convertCarouselAnswers(questions, answerResult?.answers, idToHeaderMap);
    const { answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount } = this.collectMetrics(questions, converted);
    this.sendTelemetry(invocation.chatRequestId, questions.length, answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount, stopWatch.elapsed());
    const toolResultJson = JSON.stringify(converted);
    this.logService.trace(`[AskQuestionsTool] Returning tool result with metrics: questions=${questions.length}, answered=${answeredCount}, skipped=${skippedCount}, freeText=${freeTextCount}, recommendedAvailable=${recommendedAvailableCount}, recommendedSelected=${recommendedSelectedCount}`);
    return {
      content: [{ kind: "text", value: toolResultJson }]
    };
  }
  async prepareToolInvocation(context2, _token) {
    const parameters = context2.parameters;
    const { questions } = parameters;
    if (!questions || questions.length === 0) {
      throw new Error(localize(13396, null));
    }
    for (const question of questions) {
      if (question.options && question.options.length === 1 && !question.allowFreeformInput) {
        throw new Error(localize(13391, null, question.header));
      }
    }
    const questionCount = questions.length;
    const headers = questions.map((q) => q.header).join(", ");
    const message = questionCount === 1 ? localize(13394, null, headers) : localize(13392, null, questionCount, headers);
    const pastMessage = questionCount === 1 ? localize(13395, null, headers) : localize(13393, null, questionCount, headers);
    return {
      invocationMessage: new MarkdownString(message),
      pastTenseMessage: new MarkdownString(pastMessage)
    };
  }
  getRequest(chatSessionResource, chatRequestId) {
    if (!chatSessionResource) {
      return { request: void 0, sessionResource: void 0 };
    }
    const model = this.chatService.getSession(chatSessionResource);
    let request2;
    if (model) {
      if (chatRequestId) {
        request2 = model.getRequests().find((r2) => r2.id === chatRequestId);
      }
      if (!request2) {
        request2 = model.getRequests().at(-1);
      }
    }
    if (!request2) {
      return { request: void 0, sessionResource: chatSessionResource };
    }
    return { request: request2, sessionResource: chatSessionResource };
  }
  /**
   * Resolves the terminal execution ID for the request.
   * Prefer structured metadata and fall back to legacy message parsing for
   * old sessions that may not carry the metadata yet.
   * As a final fallback, search completed runInTerminal tool invocations in
   * the response for the terminal ID, but only when the tool output indicates
   * the terminal is still running and waiting for input (foreground/timeout
   * path where the model calls ask_questions from the same turn as
   * runInTerminal).
   */
  extractTerminalId(request2) {
    if (request2.terminalExecutionId) {
      return request2.terminalExecutionId;
    }
    const match2 = request2.message.text.match(/\[Terminal (?<termId>\S+) notification:/);
    if (match2?.groups?.termId) {
      return match2.groups.termId;
    }
    const response = request2.response;
    if (response) {
      const parts = response.response.value;
      for (let i2 = parts.length - 1; i2 >= 0; i2--) {
        const part = parts[i2];
        if (part.kind === "toolInvocation" && part.toolId === "run_in_terminal" /* RunInTerminal */) {
          const state = part.state.get();
          if (state.type === IChatToolInvocation.StateKind.Completed && state.contentForModel) {
            for (const item of state.contentForModel) {
              if (item.kind === "text") {
                const idMatch = item.value.match(/(?:running in terminal ID|may still be running in terminal ID) ([0-9a-fA-F-]+)/);
                if (idMatch) {
                  return idMatch[1];
                }
              }
            }
          }
        }
      }
    }
    return void 0;
  }
  toQuestionCarousel(questions, resolveId) {
    const idToHeaderMap = /* @__PURE__ */ new Map();
    const carouselResolveId = resolveId ?? generateUuid();
    const mappedQuestions = questions.map((question, index2) => this.toChatQuestion(question, idToHeaderMap, carouselResolveId, index2));
    return {
      carousel: new ChatQuestionCarouselData(mappedQuestions, true, carouselResolveId),
      idToHeaderMap
    };
  }
  toChatQuestion(question, idToHeaderMap, resolveId, index2) {
    let type;
    if (!question.options || question.options.length === 0) {
      type = "text";
    } else if (question.multiSelect) {
      type = "multiSelect";
    } else {
      type = "singleSelect";
    }
    let defaultValue;
    const recommendedOptions = getEffectiveRecommendedOptions(question);
    if (recommendedOptions.length > 0) {
      defaultValue = question.multiSelect ? recommendedOptions.map((opt) => opt.label) : recommendedOptions[0].label;
    } else if (typeof question.recommendedAnswer === "string" && question.recommendedAnswer.trim()) {
      defaultValue = question.recommendedAnswer.trim();
    }
    const internalId = `${resolveId}:${index2}`;
    idToHeaderMap.set(internalId, question.header);
    const displayTitle = truncateToLimit(question.header, HardLimits.header) ?? question.header;
    return {
      id: internalId,
      type,
      title: displayTitle,
      message: question.question,
      detailedMessage: question.message,
      options: question.options?.map((opt) => ({
        id: opt.label,
        label: (opt.description ? `${opt.label} - ${opt.description}` : opt.label) + (recommendedOptions.includes(opt) ? RECOMMENDED_TAG : ""),
        value: opt.label
      })),
      defaultValue,
      allowFreeformInput: question.allowFreeformInput ?? true
    };
  }
  convertCarouselAnswers(questions, carouselAnswers, idToHeaderMap) {
    const result = { answers: {} };
    if (carouselAnswers) {
      this.logService.trace(`[AskQuestionsTool] Carousel answer keys: ${Object.keys(carouselAnswers).join(", ")}`);
      this.logService.trace(`[AskQuestionsTool] Question headers: ${questions.map((q) => q.header).join(", ")}`);
    }
    const headerToIdMap = /* @__PURE__ */ new Map();
    for (const [internalId, originalHeader] of idToHeaderMap) {
      headerToIdMap.set(originalHeader, internalId);
    }
    for (const question of questions) {
      if (!carouselAnswers) {
        result.answers[question.header] = {
          selected: [],
          freeText: null,
          skipped: true
        };
        continue;
      }
      const internalId = headerToIdMap.get(question.header);
      const answer = internalId ? carouselAnswers[internalId] : void 0;
      this.logService.trace(`[AskQuestionsTool] Processing question "${question.header}" (internal ID: ${internalId}), raw answer: ${JSON.stringify(answer)}, type: ${typeof answer}`);
      if (answer === void 0) {
        result.answers[question.header] = {
          selected: [],
          freeText: null,
          skipped: true
        };
      } else if (typeof answer === "string") {
        if (question.options?.some((opt) => opt.label === answer)) {
          result.answers[question.header] = {
            selected: [answer],
            freeText: null,
            skipped: false
          };
        } else {
          result.answers[question.header] = {
            selected: [],
            freeText: answer,
            skipped: false
          };
        }
      } else if (Array.isArray(answer)) {
        result.answers[question.header] = {
          selected: answer.map((a) => String(a)),
          freeText: null,
          skipped: false
        };
      } else if (typeof answer === "object" && hasKey(answer, { selectedValues: true })) {
        const { selectedValues, freeformValue } = answer;
        result.answers[question.header] = {
          selected: selectedValues,
          freeText: freeformValue ?? null,
          skipped: false
        };
      } else if (typeof answer === "object" && (hasKey(answer, { selectedValue: true }) || hasKey(answer, { freeformValue: true }))) {
        const { selectedValue, freeformValue } = answer;
        if (freeformValue) {
          result.answers[question.header] = {
            selected: [],
            freeText: freeformValue,
            skipped: false
          };
        } else if (selectedValue !== void 0) {
          if (question.options?.some((opt) => opt.label === selectedValue)) {
            result.answers[question.header] = {
              selected: [selectedValue],
              freeText: null,
              skipped: false
            };
          } else {
            result.answers[question.header] = {
              selected: [],
              freeText: selectedValue,
              skipped: false
            };
          }
        } else {
          result.answers[question.header] = {
            selected: [],
            freeText: null,
            skipped: true
          };
        }
      } else {
        this.logService.warn(`[AskQuestionsTool] Unknown answer format for "${question.header}": ${JSON.stringify(answer)}`);
        result.answers[question.header] = {
          selected: [],
          freeText: null,
          skipped: true
        };
      }
    }
    return result;
  }
  collectMetrics(questions, result) {
    const answers = Object.values(result.answers);
    const answeredCount = answers.filter((a) => !a.skipped).length;
    const skippedCount = answers.filter((a) => a.skipped).length;
    const freeTextCount = answers.filter((a) => a.freeText !== null).length;
    const recommendedAvailableCount = questions.filter((q) => getEffectiveRecommendedOptions(q).length > 0).length;
    const recommendedSelectedCount = questions.filter((q) => {
      const answer = result.answers[q.header];
      const recommendedOption = getEffectiveRecommendedOptions(q)[0];
      return answer && !answer.skipped && recommendedOption && answer.selected.includes(recommendedOption.label);
    }).length;
    return { answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount };
  }
  createSkippedResult(questions) {
    const skippedAnswers = {};
    for (const question of questions) {
      skippedAnswers[question.header] = { selected: [], freeText: null, skipped: true };
    }
    return {
      content: [{ kind: "text", value: JSON.stringify({ answers: skippedAnswers }) }]
    };
  }
  createRecommendedAnswers(questions) {
    const answers = {};
    for (const question of questions) {
      answers[question.header] = buildRecommendedAnswer(question);
    }
    return answers;
  }
  /** 对话里的可见记录，例如「全自动：已选择推荐项 X」。 */
  describeRecommendedAnswers(questions, answers, fullAuto) {
    const prefix = fullAuto ? "\u5168\u81ea\u52a8" : "\u81ea\u52a8\u56de\u590d";
    const escape = (value2) => String(value2).replace(/[\\`*_{}\[\]<>()#+!|~-]/g, "\\$&");
    const lines = questions.map((question) => {
      const answer = answers[question.header];
      const what = answer.selected.length ? `\u5df2\u9009\u62e9\u63a8\u8350\u9879 ${answer.selected.map((label3) => `\u300c${escape(label3)}\u300d`).join("\u3001")}` : `\u5df2\u56de\u7b54 \u300c${escape(answer.freeText)}\u300d`;
      return questions.length > 1 ? `- ${prefix}\uff1a${escape(question.header)} \u2192 ${what}` : `${prefix}\uff1a${what}`;
    });
    return `\n\n${lines.join("\n")}\n\n`;
  }
  /**
   * Build carousel answer data keyed by carousel question IDs so the completed summary in the UI
   * shows the automatically chosen recommended answers.
   */
  buildRecommendedCarouselAnswers(questions, carousel, idToHeaderMap, answers) {
    const data = {};
    const headerToIdMap = /* @__PURE__ */ new Map();
    for (const [internalId, originalHeader] of idToHeaderMap) {
      headerToIdMap.set(originalHeader, internalId);
    }
    for (const question of questions) {
      const internalId = headerToIdMap.get(question.header);
      const answer = answers[question.header];
      if (!internalId || !answer) {
        continue;
      }
      const chatQuestion = carousel.questions.find((q) => q.id === internalId);
      if (!chatQuestion) {
        continue;
      }
      if (chatQuestion.type === "multiSelect") {
        data[internalId] = { selectedValues: answer.selected, freeformValue: answer.freeText ?? void 0 };
      } else if (chatQuestion.type === "singleSelect") {
        data[internalId] = answer.selected.length ? { selectedValue: answer.selected[0] } : { freeformValue: answer.freeText ?? "" };
      } else {
        data[internalId] = answer.freeText ?? "";
      }
    }
    return data;
  }
  sendTelemetry(requestId, questionCount, answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount, duration) {
    this.telemetryService.publicLog2("askQuestionsToolInvoked", {
      requestId,
      questionCount,
      answeredCount,
      skippedCount,
      freeTextCount,
      recommendedAvailableCount,
      recommendedSelectedCount,
      duration
    });
  }
};

AskQuestionsTool = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IConfigurationService)
], AskQuestionsTool);
export { truncateToLimit, createAskQuestionsToolData, getEffectiveRecommendedOptions, buildRecommendedAnswer, AUTO_ANSWER_FREE_TEXT, AskQuestionsToolId, SoftLimits, HardLimits, AskQuestionsToolData, AskQuestionsTool };
