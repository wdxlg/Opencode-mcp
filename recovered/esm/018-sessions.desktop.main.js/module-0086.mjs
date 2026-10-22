// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/themables.ts
import { Codicon } from "./module-0085.mjs";


// src/vs/base/common/themables.ts
var ThemeColor;

((ThemeColor3) => {
  function isThemeColor2(obj) {
    return !!obj && typeof obj === "object" && typeof obj.id === "string";
  }
  ThemeColor3.isThemeColor = isThemeColor2;
})(ThemeColor || (ThemeColor = {}));

function themeColorFromId(id2) {
  return { id: id2 };
}

var ThemeIcon;

((ThemeIcon6) => {
  ThemeIcon6.iconNameSegment = "[A-Za-z0-9]+";
  ThemeIcon6.iconNameExpression = "[A-Za-z0-9-]+";
  ThemeIcon6.iconModifierExpression = "~[A-Za-z]+";
  ThemeIcon6.iconNameCharacter = "[A-Za-z0-9~-]";
  const ThemeIconIdRegex = new RegExp(`^(${ThemeIcon6.iconNameExpression})(${ThemeIcon6.iconModifierExpression})?$`);
  function asClassNameArray(icon2) {
    const match2 = ThemeIconIdRegex.exec(icon2.id);
    if (!match2) {
      return asClassNameArray(Codicon.error);
    }
    const [, id2, modifier] = match2;
    const classNames2 = ["codicon", "codicon-" + id2];
    if (modifier) {
      classNames2.push("codicon-modifier-" + modifier.substring(1));
    }
    return classNames2;
  }
  ThemeIcon6.asClassNameArray = asClassNameArray;
  function asClassName(icon2) {
    return asClassNameArray(icon2).join(" ");
  }
  ThemeIcon6.asClassName = asClassName;
  function asCSSSelector(icon2) {
    return "." + asClassNameArray(icon2).join(".");
  }
  ThemeIcon6.asCSSSelector = asCSSSelector;
  function isThemeIcon(obj) {
    return !!obj && typeof obj === "object" && typeof obj.id === "string" && (typeof obj.color === "undefined" || ThemeColor.isThemeColor(obj.color));
  }
  ThemeIcon6.isThemeIcon = isThemeIcon;
  const _regexFromString = new RegExp(`^\\$\\((${ThemeIcon6.iconNameExpression}(?:${ThemeIcon6.iconModifierExpression})?)\\)$`);
  function fromString(str) {
    const match2 = _regexFromString.exec(str);
    if (!match2) {
      return void 0;
    }
    const [, name] = match2;
    return { id: name };
  }
  ThemeIcon6.fromString = fromString;
  function fromId(id2) {
    return { id: id2 };
  }
  ThemeIcon6.fromId = fromId;
  function modify2(icon2, modifier) {
    let id2 = icon2.id;
    const tildeIndex = id2.lastIndexOf("~");
    if (tildeIndex !== -1) {
      id2 = id2.substring(0, tildeIndex);
    }
    if (modifier) {
      id2 = `${id2}~${modifier}`;
    }
    return { id: id2 };
  }
  ThemeIcon6.modify = modify2;
  function getModifier(icon2) {
    const tildeIndex = icon2.id.lastIndexOf("~");
    if (tildeIndex !== -1) {
      return icon2.id.substring(tildeIndex + 1);
    }
    return void 0;
  }
  ThemeIcon6.getModifier = getModifier;
  function isEqual4(ti1, ti2) {
    return ti1.id === ti2.id && ti1.color?.id === ti2.color?.id;
  }
  ThemeIcon6.isEqual = isEqual4;
  function isFile2(icon2) {
    return icon2?.id === Codicon.file.id;
  }
  ThemeIcon6.isFile = isFile2;
  function isFolder(icon2) {
    return icon2?.id === Codicon.folder.id;
  }
  ThemeIcon6.isFolder = isFolder;
})(ThemeIcon || (ThemeIcon = {}));
export { themeColorFromId, ThemeColor, ThemeIcon };
