// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatService/chatQuestionCarouselHelpers.ts



// src/vs/workbench/contrib/chat/common/chatService/chatQuestionCarouselHelpers.ts
function getOptionsWithDefaultsFirst(question) {
  const options3 = question.options ?? [];
  const orderedOptions = options3.map((option2, index2) => ({ option: option2, originalIndex: index2 }));
  const defaultOptionIds = Array.isArray(question.defaultValue) ? question.defaultValue : typeof question.defaultValue === "string" ? [question.defaultValue] : [];
  if (defaultOptionIds.length === 0) {
    return orderedOptions;
  }
  const defaultIds = new Set(defaultOptionIds);
  const defaults = [];
  const nonDefaults = [];
  for (const item of orderedOptions) {
    if (defaultIds.has(item.option.id)) {
      defaults.push(item);
    } else {
      nonDefaults.push(item);
    }
  }
  return [...defaults, ...nonDefaults];
}

function getDisplayedQuestionText(question) {
  return question.message ?? question.title;
}

function findQuestionValidationFailure(value2, validation) {
  if (validation.minLength !== void 0 && value2.length < validation.minLength) {
    return { kind: "minLength", limit: validation.minLength };
  }
  if (validation.maxLength !== void 0 && value2.length > validation.maxLength) {
    return { kind: "maxLength", limit: validation.maxLength };
  }
  switch (validation.format) {
    case "email":
      if (!value2.includes("@")) {
        return { kind: "email" };
      }
      break;
    case "uri":
      if (!URL.canParse(value2)) {
        return { kind: "uri" };
      }
      break;
    case "date":
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value2) || isNaN(new Date(value2).getTime())) {
        return { kind: "date" };
      }
      break;
    case "date-time":
      if (isNaN(new Date(value2).getTime())) {
        return { kind: "dateTime" };
      }
      break;
  }
  if (validation.isInteger !== void 0 || validation.minimum !== void 0 || validation.maximum !== void 0) {
    const num = Number(value2);
    if (isNaN(num)) {
      return { kind: "number" };
    }
    if (validation.isInteger && !Number.isInteger(num)) {
      return { kind: "integer" };
    }
    if (validation.minimum !== void 0 && num < validation.minimum) {
      return { kind: "minimum", limit: validation.minimum };
    }
    if (validation.maximum !== void 0 && num > validation.maximum) {
      return { kind: "maximum", limit: validation.maximum };
    }
  }
  return void 0;
}
export { getOptionsWithDefaultsFirst, getDisplayedQuestionText, findQuestionValidationFailure };
