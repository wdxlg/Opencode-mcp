// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/themables.ts
import { __esm } from "./module-0000.mjs";
import { Codicon, init_codicons } from "./module-0085.mjs";


// src/vs/base/common/themables.ts
var ThemeColor, ThemeIcon;

var init_themables = __esm({
  "src/vs/base/common/themables.ts"() {
    init_codicons();
    ((ThemeColor2) => {
      function isThemeColor(obj) {
        return !!obj && typeof obj === "object" && typeof obj.id === "string";
      }
      ThemeColor2.isThemeColor = isThemeColor;
    })(ThemeColor || (ThemeColor = {}));
    ((ThemeIcon2) => {
      ThemeIcon2.iconNameSegment = "[A-Za-z0-9]+";
      ThemeIcon2.iconNameExpression = "[A-Za-z0-9-]+";
      ThemeIcon2.iconModifierExpression = "~[A-Za-z]+";
      ThemeIcon2.iconNameCharacter = "[A-Za-z0-9~-]";
      const ThemeIconIdRegex = new RegExp(`^(${ThemeIcon2.iconNameExpression})(${ThemeIcon2.iconModifierExpression})?$`);
      function asClassNameArray(icon) {
        const match = ThemeIconIdRegex.exec(icon.id);
        if (!match) {
          return asClassNameArray(Codicon.error);
        }
        const [, id2, modifier] = match;
        const classNames = ["codicon", "codicon-" + id2];
        if (modifier) {
          classNames.push("codicon-modifier-" + modifier.substring(1));
        }
        return classNames;
      }
      ThemeIcon2.asClassNameArray = asClassNameArray;
      function asClassName(icon) {
        return asClassNameArray(icon).join(" ");
      }
      ThemeIcon2.asClassName = asClassName;
      function asCSSSelector(icon) {
        return "." + asClassNameArray(icon).join(".");
      }
      ThemeIcon2.asCSSSelector = asCSSSelector;
      function isThemeIcon(obj) {
        return !!obj && typeof obj === "object" && typeof obj.id === "string" && (typeof obj.color === "undefined" || ThemeColor.isThemeColor(obj.color));
      }
      ThemeIcon2.isThemeIcon = isThemeIcon;
      const _regexFromString = new RegExp(`^\\$\\((${ThemeIcon2.iconNameExpression}(?:${ThemeIcon2.iconModifierExpression})?)\\)$`);
      function fromString(str) {
        const match = _regexFromString.exec(str);
        if (!match) {
          return void 0;
        }
        const [, name] = match;
        return { id: name };
      }
      ThemeIcon2.fromString = fromString;
      function fromId(id2) {
        return { id: id2 };
      }
      ThemeIcon2.fromId = fromId;
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
      ThemeIcon2.modify = modify;
      function getModifier(icon) {
        const tildeIndex = icon.id.lastIndexOf("~");
        if (tildeIndex !== -1) {
          return icon.id.substring(tildeIndex + 1);
        }
        return void 0;
      }
      ThemeIcon2.getModifier = getModifier;
      function isEqual3(ti1, ti2) {
        return ti1.id === ti2.id && ti1.color?.id === ti2.color?.id;
      }
      ThemeIcon2.isEqual = isEqual3;
      function isFile(icon) {
        return icon?.id === Codicon.file.id;
      }
      ThemeIcon2.isFile = isFile;
      function isFolder(icon) {
        return icon?.id === Codicon.folder.id;
      }
      ThemeIcon2.isFolder = isFolder;
    })(ThemeIcon || (ThemeIcon = {}));
  }
});
export { ThemeColor, ThemeIcon, init_themables };
