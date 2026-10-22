// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/utils/promptEditHelper.ts



// src/vs/workbench/contrib/chat/common/promptSyntax/utils/promptEditHelper.ts
var isSimpleNameRegex = /^[\w\/\.-]+$/;

function formatArrayValue(name, quotePreference) {
  switch (quotePreference) {
    case "'":
      return `'${name}'`;
    case '"':
      return `"${name}"`;
  }
  return isSimpleNameRegex.test(name) ? name : `'${name}'`;
}

function getQuotePreference(arrayValue, model) {
  const firstStringItem = arrayValue.items.find((item) => item.type === "scalar" && isSimpleNameRegex.test(item.value));
  const firstChar = firstStringItem ? model.getValueInRange(firstStringItem.range).charAt(0) : void 0;
  if (firstChar === `'` || firstChar === `"`) {
    return firstChar;
  }
  return "";
}
export { formatArrayValue, getQuotePreference, isSimpleNameRegex };
