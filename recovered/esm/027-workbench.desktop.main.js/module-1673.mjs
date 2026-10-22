// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/plistParser.ts



// src/vs/workbench/services/themes/common/plistParser.ts
function parse11(content2) {
  return _parse(content2, null, null);
}

function _parse(content2, filename, locationKeyName) {
  const len = content2.length;
  let pos = 0;
  let line = 1;
  let char = 0;
  if (len > 0 && content2.charCodeAt(0) === 65279 /* BOM */) {
    pos = 1;
  }
  function advancePosBy(by) {
    if (locationKeyName === null) {
      pos = pos + by;
    } else {
      while (by > 0) {
        const chCode = content2.charCodeAt(pos);
        if (chCode === 10 /* LINE_FEED */) {
          pos++;
          line++;
          char = 0;
        } else {
          pos++;
          char++;
        }
        by--;
      }
    }
  }
  function advancePosTo(to) {
    if (locationKeyName === null) {
      pos = to;
    } else {
      advancePosBy(to - pos);
    }
  }
  function skipWhitespace() {
    while (pos < len) {
      const chCode = content2.charCodeAt(pos);
      if (chCode !== 32 /* SPACE */ && chCode !== 9 /* TAB */ && chCode !== 13 /* CARRIAGE_RETURN */ && chCode !== 10 /* LINE_FEED */) {
        break;
      }
      advancePosBy(1);
    }
  }
  function advanceIfStartsWith(str) {
    if (content2.substr(pos, str.length) === str) {
      advancePosBy(str.length);
      return true;
    }
    return false;
  }
  function advanceUntil(str) {
    const nextOccurence = content2.indexOf(str, pos);
    if (nextOccurence !== -1) {
      advancePosTo(nextOccurence + str.length);
    } else {
      advancePosTo(len);
    }
  }
  function captureUntil(str) {
    const nextOccurence = content2.indexOf(str, pos);
    if (nextOccurence !== -1) {
      const r2 = content2.substring(pos, nextOccurence);
      advancePosTo(nextOccurence + str.length);
      return r2;
    } else {
      const r2 = content2.substr(pos);
      advancePosTo(len);
      return r2;
    }
  }
  let state = 0 /* ROOT_STATE */;
  let cur = null;
  const stateStack = [];
  const objStack = [];
  let curKey = null;
  function pushState(newState, newCur) {
    stateStack.push(state);
    objStack.push(cur);
    state = newState;
    cur = newCur;
  }
  function popState() {
    if (stateStack.length === 0) {
      return fail2("illegal state stack");
    }
    state = stateStack.pop();
    cur = objStack.pop();
  }
  function fail2(msg) {
    throw new Error("Near offset " + pos + ": " + msg + " ~~~" + content2.substr(pos, 50) + "~~~");
  }
  const dictState = {
    enterDict: function() {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      const newDict = {};
      if (locationKeyName !== null) {
        newDict[locationKeyName] = {
          filename,
          line,
          char
        };
      }
      cur[curKey] = newDict;
      curKey = null;
      pushState(1 /* DICT_STATE */, newDict);
    },
    enterArray: function() {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      const newArr = [];
      cur[curKey] = newArr;
      curKey = null;
      pushState(2 /* ARR_STATE */, newArr);
    }
  };
  const arrState = {
    enterDict: function() {
      const newDict = {};
      if (locationKeyName !== null) {
        newDict[locationKeyName] = {
          filename,
          line,
          char
        };
      }
      cur.push(newDict);
      pushState(1 /* DICT_STATE */, newDict);
    },
    enterArray: function() {
      const newArr = [];
      cur.push(newArr);
      pushState(2 /* ARR_STATE */, newArr);
    }
  };
  function enterDict() {
    if (state === 1 /* DICT_STATE */) {
      dictState.enterDict();
    } else if (state === 2 /* ARR_STATE */) {
      arrState.enterDict();
    } else {
      cur = {};
      if (locationKeyName !== null) {
        cur[locationKeyName] = {
          filename,
          line,
          char
        };
      }
      pushState(1 /* DICT_STATE */, cur);
    }
  }
  function leaveDict() {
    if (state === 1 /* DICT_STATE */) {
      popState();
    } else if (state === 2 /* ARR_STATE */) {
      return fail2("unexpected </dict>");
    } else {
      return fail2("unexpected </dict>");
    }
  }
  function enterArray() {
    if (state === 1 /* DICT_STATE */) {
      dictState.enterArray();
    } else if (state === 2 /* ARR_STATE */) {
      arrState.enterArray();
    } else {
      cur = [];
      pushState(2 /* ARR_STATE */, cur);
    }
  }
  function leaveArray() {
    if (state === 1 /* DICT_STATE */) {
      return fail2("unexpected </array>");
    } else if (state === 2 /* ARR_STATE */) {
      popState();
    } else {
      return fail2("unexpected </array>");
    }
  }
  function acceptKey(val) {
    if (state === 1 /* DICT_STATE */) {
      if (curKey !== null) {
        return fail2("too many <key>");
      }
      curKey = val;
    } else if (state === 2 /* ARR_STATE */) {
      return fail2("unexpected <key>");
    } else {
      return fail2("unexpected <key>");
    }
  }
  function acceptString(val) {
    if (state === 1 /* DICT_STATE */) {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2 /* ARR_STATE */) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptReal(val) {
    if (isNaN(val)) {
      return fail2("cannot parse float");
    }
    if (state === 1 /* DICT_STATE */) {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2 /* ARR_STATE */) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptInteger(val) {
    if (isNaN(val)) {
      return fail2("cannot parse integer");
    }
    if (state === 1 /* DICT_STATE */) {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2 /* ARR_STATE */) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptDate(val) {
    if (state === 1 /* DICT_STATE */) {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2 /* ARR_STATE */) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptData(val) {
    if (state === 1 /* DICT_STATE */) {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2 /* ARR_STATE */) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function acceptBool(val) {
    if (state === 1 /* DICT_STATE */) {
      if (curKey === null) {
        return fail2("missing <key>");
      }
      cur[curKey] = val;
      curKey = null;
    } else if (state === 2 /* ARR_STATE */) {
      cur.push(val);
    } else {
      cur = val;
    }
  }
  function escapeVal(str) {
    return str.replace(/&#([0-9]+);/g, function(_, m0) {
      return String.fromCodePoint(parseInt(m0, 10));
    }).replace(/&#x([0-9a-f]+);/g, function(_, m0) {
      return String.fromCodePoint(parseInt(m0, 16));
    }).replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, function(_) {
      switch (_) {
        case "&amp;":
          return "&";
        case "&lt;":
          return "<";
        case "&gt;":
          return ">";
        case "&quot;":
          return '"';
        case "&apos;":
          return "'";
      }
      return _;
    });
  }
  function parseOpenTag() {
    let r2 = captureUntil(">");
    let isClosed = false;
    if (r2.charCodeAt(r2.length - 1) === 47 /* SLASH */) {
      isClosed = true;
      r2 = r2.substring(0, r2.length - 1);
    }
    return {
      name: r2.trim(),
      isClosed
    };
  }
  function parseTagValue(tag2) {
    if (tag2.isClosed) {
      return "";
    }
    const val = captureUntil("</");
    advanceUntil(">");
    return escapeVal(val);
  }
  while (pos < len) {
    skipWhitespace();
    if (pos >= len) {
      break;
    }
    const chCode = content2.charCodeAt(pos);
    advancePosBy(1);
    if (chCode !== 60 /* LESS_THAN */) {
      return fail2("expected <");
    }
    if (pos >= len) {
      return fail2("unexpected end of input");
    }
    const peekChCode = content2.charCodeAt(pos);
    if (peekChCode === 63 /* QUESTION_MARK */) {
      advancePosBy(1);
      advanceUntil("?>");
      continue;
    }
    if (peekChCode === 33 /* EXCLAMATION_MARK */) {
      advancePosBy(1);
      if (advanceIfStartsWith("--")) {
        advanceUntil("-->");
        continue;
      }
      advanceUntil(">");
      continue;
    }
    if (peekChCode === 47 /* SLASH */) {
      advancePosBy(1);
      skipWhitespace();
      if (advanceIfStartsWith("plist")) {
        advanceUntil(">");
        continue;
      }
      if (advanceIfStartsWith("dict")) {
        advanceUntil(">");
        leaveDict();
        continue;
      }
      if (advanceIfStartsWith("array")) {
        advanceUntil(">");
        leaveArray();
        continue;
      }
      return fail2("unexpected closed tag");
    }
    const tag2 = parseOpenTag();
    switch (tag2.name) {
      case "dict":
        enterDict();
        if (tag2.isClosed) {
          leaveDict();
        }
        continue;
      case "array":
        enterArray();
        if (tag2.isClosed) {
          leaveArray();
        }
        continue;
      case "key":
        acceptKey(parseTagValue(tag2));
        continue;
      case "string":
        acceptString(parseTagValue(tag2));
        continue;
      case "real":
        acceptReal(parseFloat(parseTagValue(tag2)));
        continue;
      case "integer":
        acceptInteger(parseInt(parseTagValue(tag2), 10));
        continue;
      case "date":
        acceptDate(new Date(parseTagValue(tag2)));
        continue;
      case "data":
        acceptData(parseTagValue(tag2));
        continue;
      case "true":
        parseTagValue(tag2);
        acceptBool(true);
        continue;
      case "false":
        parseTagValue(tag2);
        acceptBool(false);
        continue;
    }
    if (/^plist/.test(tag2.name)) {
      continue;
    }
    return fail2("unexpected opened tag " + tag2.name);
  }
  return cur;
}
export { parse11, _parse };
