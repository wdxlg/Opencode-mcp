// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpElicitationService.ts
import { localize } from "./module-0001.mjs";
import { assertNever, softAssertNever } from "./module-0009.mjs";
import { McpConnectionState, MpcResponseError } from "./module-1206.mjs";
import { MCP } from "./module-1205.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ChatModel } from "./module-1193.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { mcpServerToSourceData } from "./module-2174.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Action } from "./module-0082.mjs";
import { CancellationError } from "./module-0004.mjs";
import { autorun } from "./module-0052.mjs";
import { ChatElicitationRequestPart } from "./module-2874.mjs";
import { URI } from "./module-0032.mjs";
import { isDefined } from "./module-0010.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IChatService } from "./module-0973.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpElicitationService.ts
var noneItem = { id: void 0, label: localize(16924, null), description: localize(16925, null), alwaysShow: true };

function isFormElicitation(params) {
  return params.mode === "form" || params.mode === void 0 && !!params.requestedSchema;
}

function isUrlElicitation(params) {
  return params.mode === "url";
}

function isLegacyTitledEnumSchema(schema10) {
  const cast = schema10;
  return cast.type === "string" && Array.isArray(cast.enum) && Array.isArray(cast.enumNames);
}

function isUntitledEnumSchema(schema10) {
  const cast = schema10;
  return cast.type === "string" && Array.isArray(cast.enum);
}

function isTitledSingleEnumSchema(schema10) {
  const cast = schema10;
  return cast.type === "string" && Array.isArray(cast.oneOf);
}

function isUntitledMultiEnumSchema(schema10) {
  const cast = schema10;
  return cast.type === "array" && !!cast.items?.enum;
}

function isTitledMultiEnumSchema(schema10) {
  const cast = schema10;
  return cast.type === "array" && !!cast.items?.anyOf;
}

var McpElicitationService = class {
  constructor(_notificationService, _quickInputService, _chatService, _openerService) {
    this._notificationService = _notificationService;
    this._quickInputService = _quickInputService;
    this._chatService = _chatService;
    this._openerService = _openerService;
  }
  elicit(server, context2, elicitation, token) {
    if (isFormElicitation(elicitation)) {
      return this._elicitForm(server, context2, elicitation, token);
    } else if (isUrlElicitation(elicitation)) {
      return this._elicitUrl(server, context2, elicitation, token);
    } else {
      softAssertNever(elicitation);
      return Promise.reject(new MpcResponseError("Unsupported elicitation type", MCP.INVALID_PARAMS, void 0));
    }
  }
  async _elicitForm(server, context2, elicitation, token) {
    const store = new DisposableStore();
    const value2 = await new Promise((resolve3) => {
      const chatModel = context2?.chatSessionResource && this._chatService.getSession(context2.chatSessionResource);
      if (chatModel instanceof ChatModel) {
        const request2 = chatModel.getRequests().at(-1);
        if (request2) {
          const { questions, idToPropertyMap } = this._convertSchemaToQuestions(elicitation);
          const carousel = new ChatQuestionCarouselData(
            questions,
            /* allowSkip */
            true,
            /* resolveId */
            void 0,
            /* data */
            void 0,
            /* isUsed */
            void 0,
            /* message */
            new MarkdownString(elicitation.message),
            /* source */
            mcpServerToSourceData(server)
          );
          chatModel.acceptResponseProgress(request2, carousel);
          store.add(token.onCancellationRequested(() => {
            carousel.completion.complete({ answers: void 0 });
          }));
          carousel.completion.p.then((result) => {
            if (!result.answers) {
              resolve3({ action: "cancel" });
            } else {
              const content = this._convertCarouselAnswersToElicitResult(
                result.answers,
                idToPropertyMap,
                elicitation.requestedSchema.properties
              );
              resolve3({ action: "accept", content });
            }
          });
          return;
        }
      }
      const handle2 = this._notificationService.notify({
        message: elicitation.message,
        source: localize(16929, null, server.definition.label),
        severity: Severity2.Info,
        actions: {
          primary: [store.add(new Action("mcp.elicit.give", localize(16927, null), void 0, true, () => resolve3(this._doElicitForm(elicitation, token))))],
          secondary: [store.add(new Action("mcp.elicit.cancel", localize(16923, null), void 0, true, () => resolve3({ action: "decline" })))]
        }
      });
      store.add(handle2.onDidClose(() => resolve3({ action: "cancel" })));
      store.add(token.onCancellationRequested(() => resolve3({ action: "cancel" })));
    }).finally(() => store.dispose());
    return { kind: 0 /* Form */, value: value2, dispose: () => {
    } };
  }
  async _elicitUrl(server, context2, elicitation, token) {
    const promiseStore = new DisposableStore();
    const completePromise = new Promise((resolve3, reject) => {
      promiseStore.add(token.onCancellationRequested(() => reject(new CancellationError())));
      promiseStore.add(autorun((reader) => {
        const cnx = server.connection.read(reader);
        const handler = cnx?.handler.read(reader);
        if (handler) {
          reader.store.add(handler.onDidReceiveElicitationCompleteNotification((e4) => {
            if (e4.params.elicitationId === elicitation.elicitationId) {
              resolve3();
            }
          }));
        } else if (!McpConnectionState.isRunning(server.connectionState.read(reader))) {
          reject(new CancellationError());
        }
      }));
    }).finally(() => promiseStore.dispose());
    const store = new DisposableStore();
    const value2 = await new Promise((resolve3) => {
      const chatModel = context2?.chatSessionResource && this._chatService.getSession(context2.chatSessionResource);
      if (chatModel instanceof ChatModel) {
        const request2 = chatModel.getRequests().at(-1);
        if (request2) {
          const part = new ChatElicitationRequestPart(
            localize(16935, null),
            new MarkdownString().appendText(elicitation.message).appendMarkdown("\n\n" + localize(16931, null)).appendCodeblock("", elicitation.url),
            localize(16947, null, server.definition.label),
            localize(16933, null, URI.parse(elicitation.url).authority),
            localize(16928, null),
            async () => {
              const result = await this._doElicitUrl(elicitation, token);
              resolve3(result);
              completePromise.then(() => part.hide());
              return result.action === "accept" ? "accepted" /* Accepted */ : "rejected" /* Rejected */;
            },
            () => {
              resolve3({ action: "decline" });
              return Promise.resolve("rejected" /* Rejected */);
            },
            mcpServerToSourceData(server)
          );
          chatModel.acceptResponseProgress(request2, part);
        }
      } else {
        const handle2 = this._notificationService.notify({
          message: elicitation.message + " " + localize(16932, null, elicitation.url),
          source: localize(16929, null, server.definition.label),
          severity: Severity2.Info,
          actions: {
            primary: [store.add(new Action("mcp.elicit.url.open2", localize(16934, null), void 0, true, () => resolve3(this._doElicitUrl(elicitation, token))))],
            secondary: [store.add(new Action("mcp.elicit.cancel", localize(16923, null), void 0, true, () => resolve3({ action: "decline" })))]
          }
        });
        store.add(handle2.onDidClose(() => resolve3({ action: "cancel" })));
        store.add(token.onCancellationRequested(() => resolve3({ action: "cancel" })));
      }
    }).finally(() => store.dispose());
    return {
      kind: 1 /* URL */,
      value: value2,
      wait: completePromise,
      dispose: () => promiseStore.dispose()
    };
  }
  async _doElicitUrl(elicitation, token) {
    if (token.isCancellationRequested) {
      return { action: "cancel" };
    }
    try {
      if (await this._openerService.open(elicitation.url, { allowCommands: false })) {
        return { action: "accept" };
      }
    } catch {
    }
    return { action: "decline" };
  }
  async _doElicitForm(elicitation, token) {
    const quickPick = this._quickInputService.createQuickPick();
    const store = new DisposableStore();
    try {
      const properties = Object.entries(elicitation.requestedSchema.properties);
      const requiredFields = new Set(elicitation.requestedSchema.required || []);
      const results = {};
      const backSnapshots = [];
      quickPick.title = elicitation.message;
      quickPick.totalSteps = properties.length;
      quickPick.ignoreFocusOut = true;
      for (let i2 = 0; i2 < properties.length; i2++) {
        const [propertyName, schema10] = properties[i2];
        const isRequired = requiredFields.has(propertyName);
        const restore2 = backSnapshots.at(i2);
        store.clear();
        quickPick.step = i2 + 1;
        quickPick.title = schema10.title || propertyName;
        quickPick.placeholder = this._getFieldPlaceholder(schema10, isRequired);
        quickPick.value = restore2?.value ?? "";
        quickPick.validationMessage = "";
        quickPick.buttons = i2 > 0 ? [this._quickInputService.backButton] : [];
        let result;
        if (schema10.type === "boolean") {
          result = await this._handleEnumField(quickPick, { enum: [{ const: "true" }, { const: "false" }], default: schema10.default ? String(schema10.default) : void 0 }, isRequired, store, token);
          if (result.type === "value") {
            result.value = result.value === "true" ? true : false;
          }
        } else if (isLegacyTitledEnumSchema(schema10)) {
          result = await this._handleEnumField(quickPick, { enum: schema10.enum.map((v2, i3) => ({ const: v2, title: schema10.enumNames[i3] })), default: schema10.default }, isRequired, store, token);
        } else if (isUntitledEnumSchema(schema10)) {
          result = await this._handleEnumField(quickPick, { enum: schema10.enum.map((v2) => ({ const: v2 })), default: schema10.default }, isRequired, store, token);
        } else if (isTitledSingleEnumSchema(schema10)) {
          result = await this._handleEnumField(quickPick, { enum: schema10.oneOf, default: schema10.default }, isRequired, store, token);
        } else if (isTitledMultiEnumSchema(schema10)) {
          result = await this._handleMultiEnumField(quickPick, { enum: schema10.items.anyOf, default: schema10.default }, isRequired, store, token);
        } else if (isUntitledMultiEnumSchema(schema10)) {
          result = await this._handleMultiEnumField(quickPick, { enum: schema10.items.enum.map((v2) => ({ const: v2 })), default: schema10.default }, isRequired, store, token);
        } else {
          result = await this._handleInputField(quickPick, schema10, isRequired, store, token);
          if (result.type === "value" && (schema10.type === "number" || schema10.type === "integer")) {
            result.value = Number(result.value);
          }
        }
        if (result.type === "back") {
          i2 -= 2;
          continue;
        }
        if (result.type === "cancel") {
          return { action: "cancel" };
        }
        backSnapshots[i2] = { value: quickPick.value };
        if (result.value === void 0) {
          delete results[propertyName];
        } else {
          results[propertyName] = result.value;
        }
      }
      return {
        action: "accept",
        content: results
      };
    } finally {
      store.dispose();
      quickPick.dispose();
    }
  }
  _getFieldPlaceholder(schema10, required) {
    let placeholder = schema10.description || "";
    if (!required) {
      placeholder = placeholder ? `${placeholder} (${localize(16948, null)})` : localize(16948, null);
    }
    return placeholder;
  }
  async _handleEnumField(quickPick, schema10, required, store, token) {
    const items = schema10.enum.map(({ const: value2, title }) => ({
      id: value2,
      label: value2,
      description: title
    }));
    if (!required) {
      items.push(noneItem);
    }
    quickPick.canSelectMany = false;
    quickPick.items = items;
    if (schema10.default !== void 0) {
      quickPick.activeItems = items.filter((item) => item.id === schema10.default);
    }
    return new Promise((resolve3) => {
      store.add(token.onCancellationRequested(() => resolve3({ type: "cancel" })));
      store.add(quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        if (selected) {
          resolve3({ type: "value", value: selected.id });
        }
      }));
      store.add(quickPick.onDidTriggerButton(() => resolve3({ type: "back" })));
      store.add(quickPick.onDidHide(() => resolve3({ type: "cancel" })));
      quickPick.show();
    });
  }
  async _handleMultiEnumField(quickPick, schema10, required, store, token) {
    const items = schema10.enum.map(({ const: value2, title }) => ({
      id: value2,
      label: value2,
      description: title,
      picked: !!schema10.default?.includes(value2),
      pickable: true
    }));
    if (!required) {
      items.push(noneItem);
    }
    quickPick.canSelectMany = true;
    quickPick.items = items;
    return new Promise((resolve3) => {
      store.add(token.onCancellationRequested(() => resolve3({ type: "cancel" })));
      store.add(quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        if (selected.id === void 0) {
          resolve3({ type: "value", value: void 0 });
        } else {
          resolve3({ type: "value", value: quickPick.selectedItems.map((i2) => i2.id).filter(isDefined) });
        }
      }));
      store.add(quickPick.onDidTriggerButton(() => resolve3({ type: "back" })));
      store.add(quickPick.onDidHide(() => resolve3({ type: "cancel" })));
      quickPick.show();
    });
  }
  async _handleInputField(quickPick, schema10, required, store, token) {
    quickPick.canSelectMany = false;
    const updateItems = () => {
      const items = [];
      if (quickPick.value) {
        const validation = this._validateInput(quickPick.value, schema10);
        quickPick.validationMessage = validation.message;
        if (validation.isValid) {
          items.push({ id: "$current", label: `\u27A4 ${quickPick.value}` });
        }
      } else {
        quickPick.validationMessage = "";
        if (schema10.default) {
          items.push({ id: "$default", label: `${schema10.default}`, description: localize(16936, null) });
        }
      }
      if (quickPick.validationMessage) {
        quickPick.severity = Severity2.Warning;
      } else {
        quickPick.severity = Severity2.Ignore;
        if (!required) {
          items.push(noneItem);
        }
      }
      quickPick.items = items;
    };
    updateItems();
    return new Promise((resolve3) => {
      if (token.isCancellationRequested) {
        resolve3({ type: "cancel" });
        return;
      }
      store.add(token.onCancellationRequested(() => resolve3({ type: "cancel" })));
      store.add(quickPick.onDidChangeValue(updateItems));
      store.add(quickPick.onDidAccept(() => {
        const id2 = quickPick.selectedItems[0].id;
        if (!id2) {
          resolve3({ type: "value", value: void 0 });
        } else if (id2 === "$default") {
          resolve3({ type: "value", value: String(schema10.default) });
        } else if (!quickPick.validationMessage) {
          resolve3({ type: "value", value: quickPick.value });
        }
      }));
      store.add(quickPick.onDidTriggerButton(() => resolve3({ type: "back" })));
      store.add(quickPick.onDidHide(() => resolve3({ type: "cancel" })));
      quickPick.show();
    });
  }
  _validateInput(value2, schema10) {
    switch (schema10.type) {
      case "string":
        return this._validateString(value2, schema10);
      case "number":
      case "integer":
        return this._validateNumber(value2, schema10);
      default:
        assertNever(schema10);
    }
  }
  _validateString(value2, schema10) {
    if (schema10.minLength && value2.length < schema10.minLength) {
      return { isValid: false, message: localize(16944, null, schema10.minLength) };
    }
    if (schema10.maxLength && value2.length > schema10.maxLength) {
      return { isValid: false, message: localize(16942, null, schema10.maxLength) };
    }
    if (schema10.format) {
      const formatValid = this._validateStringFormat(value2, schema10.format);
      if (!formatValid.isValid) {
        return formatValid;
      }
    }
    return { isValid: true, parsedValue: value2 };
  }
  _validateStringFormat(value2, format5) {
    switch (format5) {
      case "email":
        return value2.includes("@") ? { isValid: true } : { isValid: false, message: localize(16939, null) };
      case "uri":
        if (URL.canParse(value2)) {
          return { isValid: true };
        } else {
          return { isValid: false, message: localize(16946, null) };
        }
      case "date": {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value2)) {
          return { isValid: false, message: localize(16937, null) };
        }
        const date = new Date(value2);
        return !isNaN(date.getTime()) ? { isValid: true } : { isValid: false, message: localize(16937, null) };
      }
      case "date-time": {
        const dateTime = new Date(value2);
        return !isNaN(dateTime.getTime()) ? { isValid: true } : { isValid: false, message: localize(16938, null) };
      }
      default:
        return { isValid: true };
    }
  }
  _validateNumber(value2, schema10) {
    const parsed = Number(value2);
    if (isNaN(parsed)) {
      return { isValid: false, message: localize(16945, null) };
    }
    if (schema10.type === "integer" && !Number.isInteger(parsed)) {
      return { isValid: false, message: localize(16940, null) };
    }
    if (schema10.minimum !== void 0 && parsed < schema10.minimum) {
      return { isValid: false, message: localize(16943, null, schema10.minimum) };
    }
    if (schema10.maximum !== void 0 && parsed > schema10.maximum) {
      return { isValid: false, message: localize(16941, null, schema10.maximum) };
    }
    return { isValid: true, parsedValue: parsed };
  }
  /**
   * Converts an MCP elicitation schema into IChatQuestion[] for the carousel UI.
   * Returns the questions and a map from question ID to schema property name.
   */
  _convertSchemaToQuestions(elicitation) {
    const properties = Object.entries(elicitation.requestedSchema.properties);
    const requiredFields = new Set(elicitation.requestedSchema.required || []);
    const questions = [];
    const idToPropertyMap = /* @__PURE__ */ new Map();
    for (const [propertyName, schema10] of properties) {
      const id2 = generateUuid();
      idToPropertyMap.set(id2, propertyName);
      const title = schema10.title || propertyName;
      const description = schema10.description;
      const isRequired = requiredFields.has(propertyName);
      if (schema10.type === "boolean") {
        questions.push({
          id: id2,
          type: "singleSelect",
          title,
          description,
          required: isRequired,
          allowFreeformInput: false,
          options: [
            { id: "true", label: localize(16930, null), value: "true" },
            { id: "false", label: localize(16926, null), value: "false" }
          ],
          defaultValue: schema10.default !== void 0 ? String(schema10.default) : void 0
        });
      } else if (isLegacyTitledEnumSchema(schema10)) {
        questions.push({
          id: id2,
          type: "singleSelect",
          title,
          description,
          required: isRequired,
          allowFreeformInput: false,
          options: schema10.enum.map((v2, i2) => ({
            id: v2,
            label: schema10.enumNames[i2] ? `${v2} - ${schema10.enumNames[i2]}` : v2,
            value: v2
          })),
          defaultValue: schema10.default
        });
      } else if (isTitledSingleEnumSchema(schema10)) {
        questions.push({
          id: id2,
          type: "singleSelect",
          title,
          description,
          required: isRequired,
          allowFreeformInput: false,
          options: schema10.oneOf.map(({ const: value2, title: optTitle }) => ({
            id: value2,
            label: optTitle ? `${value2} - ${optTitle}` : value2,
            value: value2
          })),
          defaultValue: schema10.default
        });
      } else if (isUntitledEnumSchema(schema10)) {
        questions.push({
          id: id2,
          type: "singleSelect",
          title,
          description,
          required: isRequired,
          allowFreeformInput: false,
          options: schema10.enum.map((v2) => ({ id: v2, label: v2, value: v2 })),
          defaultValue: schema10.default
        });
      } else if (isTitledMultiEnumSchema(schema10)) {
        questions.push({
          id: id2,
          type: "multiSelect",
          title,
          description,
          required: isRequired,
          allowFreeformInput: false,
          options: schema10.items.anyOf.map(({ const: value2, title: optTitle }) => ({
            id: value2,
            label: optTitle ? `${value2} - ${optTitle}` : value2,
            value: value2
          })),
          defaultValue: schema10.default
        });
      } else if (isUntitledMultiEnumSchema(schema10)) {
        questions.push({
          id: id2,
          type: "multiSelect",
          title,
          description,
          required: isRequired,
          allowFreeformInput: false,
          options: schema10.items.enum.map((v2) => ({ id: v2, label: v2, value: v2 })),
          defaultValue: schema10.default
        });
      } else {
        const validation = {};
        if (schema10.type === "string") {
          if (schema10.minLength !== void 0) {
            validation.minLength = schema10.minLength;
          }
          if (schema10.maxLength !== void 0) {
            validation.maxLength = schema10.maxLength;
          }
          if (schema10.format) {
            validation.format = schema10.format;
          }
        } else if (schema10.type === "number" || schema10.type === "integer") {
          if (schema10.minimum !== void 0) {
            validation.minimum = schema10.minimum;
          }
          if (schema10.maximum !== void 0) {
            validation.maximum = schema10.maximum;
          }
          if (schema10.type === "integer") {
            validation.isInteger = true;
          }
        }
        questions.push({
          id: id2,
          type: "text",
          title,
          description,
          required: isRequired,
          defaultValue: schema10.default !== void 0 ? String(schema10.default) : void 0,
          validation: Object.keys(validation).length > 0 ? validation : void 0
        });
      }
    }
    return { questions, idToPropertyMap };
  }
  /**
   * Converts carousel answers (keyed by question ID) back into the
   * MCP ElicitResult content format (keyed by schema property names),
   * coercing types as needed.
   */
  _convertCarouselAnswersToElicitResult(answers, idToPropertyMap, schemaProperties) {
    const content = {};
    for (const [questionId, answer] of Object.entries(answers)) {
      const propertyName = idToPropertyMap.get(questionId);
      if (!propertyName) {
        continue;
      }
      const schema10 = schemaProperties[propertyName];
      if (!schema10) {
        continue;
      }
      let rawValue = answer;
      if (typeof answer === "object" && answer !== null) {
        const obj = answer;
        if ("selectedValue" in obj) {
          rawValue = obj.selectedValue;
        } else if ("selectedValues" in obj) {
          rawValue = obj.selectedValues;
        } else if ("freeformValue" in obj && obj.freeformValue) {
          rawValue = obj.freeformValue;
        }
      }
      if (rawValue === void 0 || rawValue === null) {
        continue;
      }
      if (schema10.type === "boolean") {
        content[propertyName] = rawValue === "true" || rawValue === true;
      } else if (schema10.type === "number" || schema10.type === "integer") {
        const num = Number(rawValue);
        if (!isNaN(num)) {
          content[propertyName] = num;
        }
      } else if (schema10.type === "array") {
        if (Array.isArray(rawValue)) {
          content[propertyName] = rawValue.map((v2) => String(v2));
        }
      } else {
        content[propertyName] = String(rawValue);
      }
    }
    return content;
  }
};

McpElicitationService = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IOpenerService)
], McpElicitationService);
export { isFormElicitation, isUrlElicitation, isLegacyTitledEnumSchema, isUntitledEnumSchema, isTitledSingleEnumSchema, isUntitledMultiEnumSchema, isTitledMultiEnumSchema, noneItem, McpElicitationService };
