// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/themables.ts
import { Codicon } from "./module-0083.mjs";


// src/vs/base/common/themables.ts
var ThemeColor;

((ThemeColor3) => {
  function isThemeColor(obj) {
    return !!obj && typeof obj === "object" && typeof obj.id === "string";
  }
  ThemeColor3.isThemeColor = isThemeColor;
})(ThemeColor || (ThemeColor = {}));

var ThemeIcon;

((ThemeIcon3) => {
  ThemeIcon3.iconNameSegment = "[A-Za-z0-9]+";
  ThemeIcon3.iconNameExpression = "[A-Za-z0-9-]+";
  ThemeIcon3.iconModifierExpression = "~[A-Za-z]+";
  ThemeIcon3.iconNameCharacter = "[A-Za-z0-9~-]";
  const ThemeIconIdRegex = new RegExp(`^(${ThemeIcon3.iconNameExpression})(${ThemeIcon3.iconModifierExpression})?$`);
  function asClassNameArray(icon) {
    const match2 = ThemeIconIdRegex.exec(icon.id);
    if (!match2) {
      return asClassNameArray(Codicon.error);
    }
    const [, id2, modifier] = match2;
    const classNames = ["codicon", "codicon-" + id2];
    if (modifier) {
      classNames.push("codicon-modifier-" + modifier.substring(1));
    }
    return classNames;
  }
  ThemeIcon3.asClassNameArray = asClassNameArray;
  function asClassName(icon) {
    return asClassNameArray(icon).join(" ");
  }
  ThemeIcon3.asClassName = asClassName;
  function asCSSSelector(icon) {
    return "." + asClassNameArray(icon).join(".");
  }
  ThemeIcon3.asCSSSelector = asCSSSelector;
  function isThemeIcon(obj) {
    return !!obj && typeof obj === "object" && typeof obj.id === "string" && (typeof obj.color === "undefined" || ThemeColor.isThemeColor(obj.color));
  }
  ThemeIcon3.isThemeIcon = isThemeIcon;
  const _regexFromString = new RegExp(`^\\$\\((${ThemeIcon3.iconNameExpression}(?:${ThemeIcon3.iconModifierExpression})?)\\)$`);
  function fromString(str) {
    const match2 = _regexFromString.exec(str);
    if (!match2) {
      return void 0;
    }
    const [, name] = match2;
    return { id: name };
  }
  ThemeIcon3.fromString = fromString;
  function fromId(id2) {
    return { id: id2 };
  }
  ThemeIcon3.fromId = fromId;
  function modify(icon, modifier) {
    let id2 = icon.id;
    const tildeIndex = id2.lastIndexOf("~");
    if (tildeIndex !== -1) {
      id2 = id2.substring(0, tildeIndex);
    }
    if (modifier) {
      id2 = `${id2}~${modifier}`;
    }
    return { id: id2 };
  }
  ThemeIcon3.modify = modify;
  function getModifier(icon) {
    const tildeIndex = icon.id.lastIndexOf("~");
    if (tildeIndex !== -1) {
      return icon.id.substring(tildeIndex + 1);
    }
    return void 0;
  }
  ThemeIcon3.getModifier = getModifier;
  function isEqual3(ti1, ti2) {
    return ti1.id === ti2.id && ti1.color?.id === ti2.color?.id;
  }
  ThemeIcon3.isEqual = isEqual3;
  function isFile(icon) {
    return icon?.id === Codicon.file.id;
  }
  ThemeIcon3.isFile = isFile;
  function isFolder(icon) {
    return icon?.id === Codicon.folder.id;
  }
  ThemeIcon3.isFolder = isFolder;
})(ThemeIcon || (ThemeIcon = {}));
export { ThemeColor, ThemeIcon };
