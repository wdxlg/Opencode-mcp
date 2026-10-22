// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/textMateScopeMatcher.ts



// src/vs/workbench/services/themes/common/textMateScopeMatcher.ts
function createMatchers(selector, matchesName, results) {
  const tokenizer = newTokenizer(selector);
  let token = tokenizer.next();
  while (token !== null) {
    let priority = 0;
    if (token.length === 2 && token.charAt(1) === ":") {
      switch (token.charAt(0)) {
        case "R":
          priority = 1;
          break;
        case "L":
          priority = -1;
          break;
        default:
          console.log(`Unknown priority ${token} in scope selector`);
      }
      token = tokenizer.next();
    }
    const matcher = parseConjunction();
    if (matcher) {
      results.push({ matcher, priority });
    }
    if (token !== ",") {
      break;
    }
    token = tokenizer.next();
  }
  function parseOperand() {
    if (token === "-") {
      token = tokenizer.next();
      const expressionToNegate = parseOperand();
      if (!expressionToNegate) {
        return null;
      }
      return (matcherInput) => {
        const score3 = expressionToNegate(matcherInput);
        return score3 < 0 ? 0 : -1;
      };
    }
    if (token === "(") {
      token = tokenizer.next();
      const expressionInParents = parseInnerExpression();
      if (token === ")") {
        token = tokenizer.next();
      }
      return expressionInParents;
    }
    if (isIdentifier(token)) {
      const identifiers2 = [];
      do {
        identifiers2.push(token);
        token = tokenizer.next();
      } while (isIdentifier(token));
      return (matcherInput) => matchesName(identifiers2, matcherInput);
    }
    return null;
  }
  function parseConjunction() {
    let matcher = parseOperand();
    if (!matcher) {
      return null;
    }
    const matchers = [];
    while (matcher) {
      matchers.push(matcher);
      matcher = parseOperand();
    }
    return (matcherInput) => {
      let min = matchers[0](matcherInput);
      for (let i2 = 1; min >= 0 && i2 < matchers.length; i2++) {
        min = Math.min(min, matchers[i2](matcherInput));
      }
      return min;
    };
  }
  function parseInnerExpression() {
    let matcher = parseConjunction();
    if (!matcher) {
      return null;
    }
    const matchers = [];
    while (matcher) {
      matchers.push(matcher);
      if (token === "|" || token === ",") {
        do {
          token = tokenizer.next();
        } while (token === "|" || token === ",");
      } else {
        break;
      }
      matcher = parseConjunction();
    }
    return (matcherInput) => {
      let max = matchers[0](matcherInput);
      for (let i2 = 1; i2 < matchers.length; i2++) {
        max = Math.max(max, matchers[i2](matcherInput));
      }
      return max;
    };
  }
}

function isIdentifier(token) {
  return !!token && !!token.match(/[\w\.:]+/);
}

function newTokenizer(input) {
  const regex = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g;
  let match2 = regex.exec(input);
  return {
    next: () => {
      if (!match2) {
        return null;
      }
      const res = match2[0];
      match2 = regex.exec(input);
      return res;
    }
  };
}
export { createMatchers, isIdentifier, newTokenizer };
