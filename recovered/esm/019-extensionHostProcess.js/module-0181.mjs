// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/markdown/common/markedKatexExtension.ts
import { htmlAttributeEncodeValue } from "./module-0023.mjs";


// src/vs/workbench/contrib/markdown/common/markedKatexExtension.ts
var mathInlineRegExp = /(?<![a-zA-Z0-9])(?<dollars>\${1,2})(?!\.|\(["'])((?:\\.|[^\\\n])*?(?:\\.|[^\\\n\$]))\k<dollars>(?![a-zA-Z0-9])/;

var katexContainerClassName = "vscode-katex-container";

var katexContainerLatexAttributeName = "data-latex";

var inlineRule = new RegExp("^" + mathInlineRegExp.source);

var MarkedKatexExtension;

((MarkedKatexExtension2) => {
  const blockRule = /^(\${1,2})\n((?:\\[^]|[^\\])+?)\n\1(?:\n|$)/;
  function extension(katex, options2 = {}) {
    return {
      extensions: [
        inlineKatex(options2, createRenderer(katex, options2, false)),
        blockKatex(options2, createRenderer(katex, options2, true))
      ]
    };
  }
  MarkedKatexExtension2.extension = extension;
  function createRenderer(katex, options2, isBlock) {
    return (token) => {
      let out;
      try {
        const html2 = katex.renderToString(token.text, {
          ...options2,
          throwOnError: true,
          displayMode: token.displayMode
        });
        out = `<span class="${katexContainerClassName}" ${katexContainerLatexAttributeName}="${htmlAttributeEncodeValue(token.text)}">${html2}</span>`;
      } catch {
        out = token.raw;
      }
      return out + (isBlock ? "\n" : "");
    };
  }
  function inlineKatex(options2, renderer) {
    const ruleReg = inlineRule;
    return {
      name: "inlineKatex",
      level: "inline",
      start(src) {
        let index;
        let indexSrc = src;
        while (indexSrc) {
          index = indexSrc.indexOf("$");
          if (index === -1) {
            return;
          }
          const possibleKatex = indexSrc.substring(index);
          if (possibleKatex.match(ruleReg)) {
            return index;
          }
          indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, "");
        }
        return;
      },
      tokenizer(src, tokens) {
        const match2 = src.match(ruleReg);
        if (match2) {
          return {
            type: "inlineKatex",
            raw: match2[0],
            text: match2[2].trim(),
            displayMode: match2[1].length === 2
          };
        }
        return;
      },
      renderer
    };
  }
  function blockKatex(options2, renderer) {
    return {
      name: "blockKatex",
      level: "block",
      start(src) {
        return src.match(new RegExp(blockRule.source, "m"))?.index;
      },
      tokenizer(src, tokens) {
        const match2 = src.match(blockRule);
        if (match2) {
          return {
            type: "blockKatex",
            raw: match2[0],
            text: match2[2].trim(),
            displayMode: match2[1].length === 2
          };
        }
        return;
      },
      renderer
    };
  }
})(MarkedKatexExtension || (MarkedKatexExtension = {}));
export { mathInlineRegExp, katexContainerClassName, katexContainerLatexAttributeName, inlineRule, MarkedKatexExtension };
