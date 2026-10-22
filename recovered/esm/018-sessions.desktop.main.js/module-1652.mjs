// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/settingsMerge.ts
import { getDisallowedIgnoredSettings } from "./module-1639.mjs";
import { distinct } from "./module-0007.mjs";
import { parse5, visit } from "./module-0885.mjs";
import { edit2 } from "./module-1651.mjs";
import { applyEdits, setProperty, withFormatting } from "./module-1377.mjs";
import { getEOL } from "./module-1376.mjs";


// src/vs/platform/userDataSync/common/settingsMerge.ts
function getIgnoredSettings2(defaultIgnoredSettings, configurationService, settingsContent) {
  let value2 = [];
  if (settingsContent) {
    value2 = getIgnoredSettingsFromContent(settingsContent);
  } else {
    value2 = getIgnoredSettingsFromConfig(configurationService);
  }
  const added = [], removed = [...getDisallowedIgnoredSettings()];
  if (Array.isArray(value2)) {
    for (const key3 of value2) {
      if (key3.startsWith("-")) {
        removed.push(key3.substring(1));
      } else {
        added.push(key3);
      }
    }
  }
  return distinct([...defaultIgnoredSettings, ...added].filter((setting) => !removed.includes(setting)));
}

function getIgnoredSettingsFromConfig(configurationService) {
  let userValue = configurationService.inspect("settingsSync.ignoredSettings").userValue;
  if (userValue !== void 0) {
    return userValue;
  }
  userValue = configurationService.inspect("sync.ignoredSettings").userValue;
  if (userValue !== void 0) {
    return userValue;
  }
  return configurationService.getValue("settingsSync.ignoredSettings") || [];
}

function getIgnoredSettingsFromContent(settingsContent) {
  const parsed = parse5(settingsContent);
  return parsed ? parsed["settingsSync.ignoredSettings"] || parsed["sync.ignoredSettings"] || [] : [];
}

function updateIgnoredSettings(targetContent, sourceContent, ignoredSettings, formattingOptions) {
  if (ignoredSettings.length) {
    const sourceTree = parseSettings(sourceContent);
    const source = parse5(sourceContent) || {};
    const target = parse5(targetContent);
    if (!target) {
      return targetContent;
    }
    const settingsToAdd = [];
    for (const key3 of ignoredSettings) {
      const sourceValue = source[key3];
      const targetValue = target[key3];
      if (sourceValue === void 0) {
        targetContent = edit2(targetContent, [key3], void 0, formattingOptions);
      } else if (targetValue !== void 0) {
        targetContent = edit2(targetContent, [key3], sourceValue, formattingOptions);
      } else {
        settingsToAdd.push(findSettingNode(key3, sourceTree));
      }
    }
    settingsToAdd.sort((a, b) => a.startOffset - b.startOffset);
    settingsToAdd.forEach((s) => targetContent = addSetting(s.setting.key, sourceContent, targetContent, formattingOptions));
  }
  return targetContent;
}

function addSetting(key3, sourceContent, targetContent, formattingOptions) {
  const source = parse5(sourceContent);
  const sourceTree = parseSettings(sourceContent);
  const targetTree = parseSettings(targetContent);
  const insertLocation = getInsertLocation(key3, sourceTree, targetTree);
  return insertAtLocation(targetContent, key3, source[key3], insertLocation, targetTree, formattingOptions);
}

function getInsertLocation(key3, sourceTree, targetTree) {
  const sourceNodeIndex = sourceTree.findIndex((node) => node.setting?.key === key3);
  const sourcePreviousNode = sourceTree[sourceNodeIndex - 1];
  if (sourcePreviousNode) {
    if (sourcePreviousNode.setting) {
      const targetPreviousSetting = findSettingNode(sourcePreviousNode.setting.key, targetTree);
      if (targetPreviousSetting) {
        return { index: targetTree.indexOf(targetPreviousSetting), insertAfter: true };
      }
    } else {
      const sourcePreviousSettingNode = findPreviousSettingNode(sourceNodeIndex, sourceTree);
      if (sourcePreviousSettingNode) {
        const targetPreviousSetting = findSettingNode(sourcePreviousSettingNode.setting.key, targetTree);
        if (targetPreviousSetting) {
          const targetNextSetting = findNextSettingNode(targetTree.indexOf(targetPreviousSetting), targetTree);
          const sourceCommentNodes = findNodesBetween(sourceTree, sourcePreviousSettingNode, sourceTree[sourceNodeIndex]);
          if (targetNextSetting) {
            const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetNextSetting);
            const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes, targetCommentNodes);
            if (targetCommentNode) {
              return { index: targetTree.indexOf(targetCommentNode), insertAfter: true };
            } else {
              return { index: targetTree.indexOf(targetNextSetting), insertAfter: false };
            }
          } else {
            const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetTree[targetTree.length - 1]);
            const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes, targetCommentNodes);
            if (targetCommentNode) {
              return { index: targetTree.indexOf(targetCommentNode), insertAfter: true };
            } else {
              return { index: targetTree.length - 1, insertAfter: true };
            }
          }
        }
      }
    }
    const sourceNextNode = sourceTree[sourceNodeIndex + 1];
    if (sourceNextNode) {
      if (sourceNextNode.setting) {
        const targetNextSetting = findSettingNode(sourceNextNode.setting.key, targetTree);
        if (targetNextSetting) {
          return { index: targetTree.indexOf(targetNextSetting), insertAfter: false };
        }
      } else {
        const sourceNextSettingNode = findNextSettingNode(sourceNodeIndex, sourceTree);
        if (sourceNextSettingNode) {
          const targetNextSetting = findSettingNode(sourceNextSettingNode.setting.key, targetTree);
          if (targetNextSetting) {
            const targetPreviousSetting = findPreviousSettingNode(targetTree.indexOf(targetNextSetting), targetTree);
            const sourceCommentNodes = findNodesBetween(sourceTree, sourceTree[sourceNodeIndex], sourceNextSettingNode);
            if (targetPreviousSetting) {
              const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetNextSetting);
              const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes.reverse(), targetCommentNodes.reverse());
              if (targetCommentNode) {
                return { index: targetTree.indexOf(targetCommentNode), insertAfter: false };
              } else {
                return { index: targetTree.indexOf(targetPreviousSetting), insertAfter: true };
              }
            } else {
              const targetCommentNodes = findNodesBetween(targetTree, targetTree[0], targetNextSetting);
              const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes.reverse(), targetCommentNodes.reverse());
              if (targetCommentNode) {
                return { index: targetTree.indexOf(targetCommentNode), insertAfter: false };
              } else {
                return { index: 0, insertAfter: false };
              }
            }
          }
        }
      }
    }
  }
  return { index: targetTree.length - 1, insertAfter: true };
}

function insertAtLocation(content, key3, value2, location2, tree, formattingOptions) {
  let edits;
  if (location2.index === -1) {
    edits = setProperty(content, [key3], value2, formattingOptions);
  } else {
    edits = getEditToInsertAtLocation(content, key3, value2, location2, tree, formattingOptions).map((edit3) => withFormatting(content, edit3, formattingOptions)[0]);
  }
  return applyEdits(content, edits);
}

function getEditToInsertAtLocation(content, key3, value2, location2, tree, formattingOptions) {
  const newProperty = `${JSON.stringify(key3)}: ${JSON.stringify(value2)}`;
  const eol = getEOL(formattingOptions, content);
  const node = tree[location2.index];
  if (location2.insertAfter) {
    const edits = [];
    if (node.setting) {
      edits.push({ offset: node.endOffset, length: 0, content: "," + newProperty });
    } else {
      const nextSettingNode = findNextSettingNode(location2.index, tree);
      const previousSettingNode = findPreviousSettingNode(location2.index, tree);
      const previousSettingCommaOffset = previousSettingNode?.setting?.commaOffset;
      if (previousSettingNode && previousSettingCommaOffset === void 0) {
        edits.push({ offset: previousSettingNode.endOffset, length: 0, content: "," });
      }
      const isPreviouisSettingIncludesComment = previousSettingCommaOffset !== void 0 && previousSettingCommaOffset > node.endOffset;
      edits.push({
        offset: isPreviouisSettingIncludesComment ? previousSettingCommaOffset + 1 : node.endOffset,
        length: 0,
        content: nextSettingNode ? eol + newProperty + "," : eol + newProperty
      });
    }
    return edits;
  } else {
    if (node.setting) {
      return [{ offset: node.startOffset, length: 0, content: newProperty + "," }];
    }
    const content2 = (tree[location2.index - 1] && !tree[location2.index - 1].setting ? eol : "") + newProperty + (findNextSettingNode(location2.index, tree) ? "," : "") + eol;
    return [{ offset: node.startOffset, length: 0, content: content2 }];
  }
}

function findSettingNode(key3, tree) {
  return tree.filter((node) => node.setting?.key === key3)[0];
}

function findPreviousSettingNode(index2, tree) {
  for (let i2 = index2 - 1; i2 >= 0; i2--) {
    if (tree[i2].setting) {
      return tree[i2];
    }
  }
  return void 0;
}

function findNextSettingNode(index2, tree) {
  for (let i2 = index2 + 1; i2 < tree.length; i2++) {
    if (tree[i2].setting) {
      return tree[i2];
    }
  }
  return void 0;
}

function findNodesBetween(nodes, from, till) {
  const fromIndex = nodes.indexOf(from);
  const tillIndex = nodes.indexOf(till);
  return nodes.filter((node, index2) => fromIndex < index2 && index2 < tillIndex);
}

function findLastMatchingTargetCommentNode(sourceComments, targetComments) {
  if (sourceComments.length && targetComments.length) {
    let index2 = 0;
    for (; index2 < targetComments.length && index2 < sourceComments.length; index2++) {
      if (sourceComments[index2].value !== targetComments[index2].value) {
        return targetComments[index2 - 1];
      }
    }
    return targetComments[index2 - 1];
  }
  return void 0;
}

function parseSettings(content) {
  const nodes = [];
  let hierarchyLevel = -1;
  let startOffset;
  let key3;
  const visitor = {
    onObjectBegin: (offset) => {
      hierarchyLevel++;
    },
    onObjectProperty: (name, offset, length) => {
      if (hierarchyLevel === 0) {
        startOffset = offset;
        key3 = name;
      }
    },
    onObjectEnd: (offset, length) => {
      hierarchyLevel--;
      if (hierarchyLevel === 0) {
        nodes.push({
          startOffset,
          endOffset: offset + length,
          value: content.substring(startOffset, offset + length),
          setting: {
            key: key3,
            commaOffset: void 0
          }
        });
      }
    },
    onArrayBegin: (offset, length) => {
      hierarchyLevel++;
    },
    onArrayEnd: (offset, length) => {
      hierarchyLevel--;
      if (hierarchyLevel === 0) {
        nodes.push({
          startOffset,
          endOffset: offset + length,
          value: content.substring(startOffset, offset + length),
          setting: {
            key: key3,
            commaOffset: void 0
          }
        });
      }
    },
    onLiteralValue: (value2, offset, length) => {
      if (hierarchyLevel === 0) {
        nodes.push({
          startOffset,
          endOffset: offset + length,
          value: content.substring(startOffset, offset + length),
          setting: {
            key: key3,
            commaOffset: void 0
          }
        });
      }
    },
    onSeparator: (sep2, offset, length) => {
      if (hierarchyLevel === 0) {
        if (sep2 === ",") {
          let index2 = nodes.length - 1;
          for (; index2 >= 0; index2--) {
            if (nodes[index2].setting) {
              break;
            }
          }
          const node = nodes[index2];
          if (node) {
            nodes.splice(index2, 1, {
              startOffset: node.startOffset,
              endOffset: node.endOffset,
              value: node.value,
              setting: {
                key: node.setting.key,
                commaOffset: offset
              }
            });
          }
        }
      }
    },
    onComment: (offset, length) => {
      if (hierarchyLevel === 0) {
        nodes.push({
          startOffset: offset,
          endOffset: offset + length,
          value: content.substring(offset, offset + length)
        });
      }
    }
  };
  visit(content, visitor);
  return nodes;
}
export { getIgnoredSettings2, getIgnoredSettingsFromConfig, getIgnoredSettingsFromContent, updateIgnoredSettings, addSetting, getInsertLocation, insertAtLocation, getEditToInsertAtLocation, findSettingNode, findPreviousSettingNode, findNextSettingNode, findNodesBetween, findLastMatchingTargetCommentNode, parseSettings };
