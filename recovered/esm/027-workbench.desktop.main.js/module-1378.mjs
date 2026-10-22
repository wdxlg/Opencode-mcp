// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/jsonEdit.ts
import { findNodeAtLocation, parseTree } from "./module-0883.mjs";
import { format4, isEOL } from "./module-1377.mjs";


// src/vs/base/common/jsonEdit.ts
function removeProperty(text2, path, formattingOptions) {
  return setProperty(text2, path, void 0, formattingOptions);
}

function setProperty(text2, originalPath, value2, formattingOptions, getInsertionIndex) {
  const path = originalPath.slice();
  const errors = [];
  const root = parseTree(text2, errors);
  let parent = void 0;
  let lastSegment = void 0;
  while (path.length > 0) {
    lastSegment = path.pop();
    parent = findNodeAtLocation(root, path);
    if (parent === void 0 && value2 !== void 0) {
      if (typeof lastSegment === "string") {
        value2 = { [lastSegment]: value2 };
      } else {
        value2 = [value2];
      }
    } else {
      break;
    }
  }
  if (!parent) {
    if (value2 === void 0) {
      return [];
    }
    return withFormatting(text2, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value2) }, formattingOptions);
  } else if (parent.type === "object" && typeof lastSegment === "string" && Array.isArray(parent.children)) {
    const existing = findNodeAtLocation(parent, [lastSegment]);
    if (existing !== void 0) {
      if (value2 === void 0) {
        if (!existing.parent) {
          throw new Error("Malformed AST");
        }
        const propertyIndex = parent.children.indexOf(existing.parent);
        let removeBegin;
        let removeEnd = existing.parent.offset + existing.parent.length;
        if (propertyIndex > 0) {
          const previous = parent.children[propertyIndex - 1];
          removeBegin = previous.offset + previous.length;
        } else {
          removeBegin = parent.offset + 1;
          if (parent.children.length > 1) {
            const next = parent.children[1];
            removeEnd = next.offset;
          }
        }
        return withFormatting(text2, { offset: removeBegin, length: removeEnd - removeBegin, content: "" }, formattingOptions);
      } else {
        return withFormatting(text2, { offset: existing.offset, length: existing.length, content: JSON.stringify(value2) }, formattingOptions);
      }
    } else {
      if (value2 === void 0) {
        return [];
      }
      const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value2)}`;
      const index2 = getInsertionIndex ? getInsertionIndex(parent.children.map((p) => p.children[0].value)) : parent.children.length;
      let edit3;
      if (index2 > 0) {
        const previous = parent.children[index2 - 1];
        edit3 = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      } else if (parent.children.length === 0) {
        edit3 = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        edit3 = { offset: parent.offset + 1, length: 0, content: newProperty + "," };
      }
      return withFormatting(text2, edit3, formattingOptions);
    }
  } else if (parent.type === "array" && typeof lastSegment === "number" && Array.isArray(parent.children)) {
    if (value2 !== void 0) {
      const newProperty = `${JSON.stringify(value2)}`;
      let edit3;
      if (parent.children.length === 0 || lastSegment === 0) {
        edit3 = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + "," };
      } else {
        const index2 = lastSegment === -1 || lastSegment > parent.children.length ? parent.children.length : lastSegment;
        const previous = parent.children[index2 - 1];
        edit3 = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text2, edit3, formattingOptions);
    } else {
      const removalIndex = lastSegment;
      const toRemove = parent.children[removalIndex];
      let edit3;
      if (parent.children.length === 1) {
        edit3 = { offset: parent.offset + 1, length: parent.length - 2, content: "" };
      } else if (parent.children.length - 1 === removalIndex) {
        const previous = parent.children[removalIndex - 1];
        const offset = previous.offset + previous.length;
        const parentEndOffset = parent.offset + parent.length;
        edit3 = { offset, length: parentEndOffset - 2 - offset, content: "" };
      } else {
        edit3 = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: "" };
      }
      return withFormatting(text2, edit3, formattingOptions);
    }
  } else {
    throw new Error(`Can not add ${typeof lastSegment !== "number" ? "index" : "property"} to parent of type ${parent.type}`);
  }
}

function withFormatting(text2, edit3, formattingOptions) {
  let newText = applyEdit(text2, edit3);
  let begin = edit3.offset;
  let end = edit3.offset + edit3.content.length;
  if (edit3.length === 0 || edit3.content.length === 0) {
    while (begin > 0 && !isEOL(newText, begin - 1)) {
      begin--;
    }
    while (end < newText.length && !isEOL(newText, end)) {
      end++;
    }
  }
  const edits = format4(newText, { offset: begin, length: end - begin }, formattingOptions);
  for (let i2 = edits.length - 1; i2 >= 0; i2--) {
    const curr = edits[i2];
    newText = applyEdit(newText, curr);
    begin = Math.min(begin, curr.offset);
    end = Math.max(end, curr.offset + curr.length);
    end += curr.content.length - curr.length;
  }
  const editLength = text2.length - (newText.length - end) - begin;
  return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}

function applyEdit(text2, edit3) {
  return text2.substring(0, edit3.offset) + edit3.content + text2.substring(edit3.offset + edit3.length);
}

function applyEdits(text2, edits) {
  const sortedEdits = edits.slice(0).sort((a, b) => {
    const diff4 = a.offset - b.offset;
    if (diff4 === 0) {
      return a.length - b.length;
    }
    return diff4;
  });
  let lastModifiedOffset = text2.length;
  for (let i2 = sortedEdits.length - 1; i2 >= 0; i2--) {
    const e = sortedEdits[i2];
    if (e.offset + e.length <= lastModifiedOffset) {
      text2 = applyEdit(text2, e);
    } else {
      throw new Error("Overlapping edit");
    }
    lastModifiedOffset = e.offset;
  }
  return text2;
}
export { removeProperty, setProperty, withFormatting, applyEdit, applyEdits };
