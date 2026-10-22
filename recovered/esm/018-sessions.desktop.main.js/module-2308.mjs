// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/uriTemplate.ts



// src/vs/base/common/uriTemplate.ts
var UriTemplate = class _UriTemplate {
  constructor(template2, components) {
    this.template = template2;
    this.template = template2;
    this.components = components;
  }
  /**
   * Parses a URI template string into a UriTemplate instance.
   */
  static parse(template2) {
    const components = [];
    const regex = /\{([^{}]+)\}/g;
    let match2;
    let lastPos = 0;
    while (match2 = regex.exec(template2)) {
      const [expression, inner] = match2;
      components.push(template2.slice(lastPos, match2.index));
      lastPos = match2.index + expression.length;
      if (template2[match2.index - 1] === "{" || template2[lastPos] === "}") {
        components.push(inner);
        continue;
      }
      let operator = "";
      let rest = inner;
      if (rest.length > 0 && _UriTemplate._isOperator(rest[0])) {
        operator = rest[0];
        rest = rest.slice(1);
      }
      const variables = rest.split(",").map((v2) => {
        let name = v2;
        let explodable = false;
        let repeatable = false;
        let prefixLength = void 0;
        let optional = false;
        if (name.endsWith("*")) {
          explodable = true;
          repeatable = true;
          name = name.slice(0, -1);
        }
        const prefixMatch = name.match(/^(.*?):(\d+)$/);
        if (prefixMatch) {
          name = prefixMatch[1];
          prefixLength = parseInt(prefixMatch[2], 10);
        }
        if (name.endsWith("?")) {
          optional = true;
          name = name.slice(0, -1);
        }
        return { explodable, name, optional, prefixLength, repeatable };
      });
      components.push({ expression, operator, variables });
    }
    components.push(template2.slice(lastPos));
    return new _UriTemplate(template2, components);
  }
  static {
    this._operators = ["+", "#", ".", "/", ";", "?", "&"];
  }
  static _isOperator(ch) {
    return _UriTemplate._operators.includes(ch);
  }
  /**
   * Resolves the template with the given variables.
   */
  resolve(variables) {
    let result = "";
    for (const comp of this.components) {
      if (typeof comp === "string") {
        result += comp;
      } else {
        result += this._expand(comp, variables);
      }
    }
    return result;
  }
  _expand(comp, variables) {
    const op = comp.operator;
    const varSpecs = comp.variables;
    if (varSpecs.length === 0) {
      return comp.expression;
    }
    const vals = [];
    const isNamed = op === ";" || op === "?" || op === "&";
    const isReserved = op === "+" || op === "#";
    const isFragment = op === "#";
    const isLabel = op === ".";
    const isPath = op === "/";
    const isForm = op === "?";
    const isFormCont = op === "&";
    const isParam = op === ";";
    let prefix = "";
    if (op === "+") {
      prefix = "";
    } else if (op === "#") {
      prefix = "#";
    } else if (op === ".") {
      prefix = ".";
    } else if (op === "/") {
      prefix = "";
    } else if (op === ";") {
      prefix = ";";
    } else if (op === "?") {
      prefix = "?";
    } else if (op === "&") {
      prefix = "&";
    }
    for (const v2 of varSpecs) {
      const value2 = variables[v2.name];
      const defined = Object.prototype.hasOwnProperty.call(variables, v2.name);
      if (value2 === void 0 || value2 === null || Array.isArray(value2) && value2.length === 0) {
        if (isParam) {
          if (defined && (value2 === null || value2 === void 0)) {
            vals.push(v2.name);
          }
          continue;
        }
        if (isForm || isFormCont) {
          if (defined) {
            vals.push(_UriTemplate._formPair(v2.name, "", isNamed));
          }
          continue;
        }
        continue;
      }
      if (typeof value2 === "object" && !Array.isArray(value2)) {
        if (v2.explodable) {
          const pairs2 = [];
          for (const k in value2) {
            if (Object.prototype.hasOwnProperty.call(value2, k)) {
              const thisVal = String(value2[k]);
              if (isParam) {
                pairs2.push(k + "=" + thisVal);
              } else if (isForm || isFormCont) {
                pairs2.push(k + "=" + thisVal);
              } else if (isLabel) {
                pairs2.push(k + "=" + thisVal);
              } else if (isPath) {
                pairs2.push("/" + k + "=" + _UriTemplate._encode(thisVal, isReserved));
              } else {
                pairs2.push(k + "=" + _UriTemplate._encode(thisVal, isReserved));
              }
            }
          }
          if (isLabel) {
            vals.push(pairs2.join("."));
          } else if (isPath) {
            vals.push(pairs2.join(""));
          } else if (isParam) {
            vals.push(pairs2.join(";"));
          } else if (isForm || isFormCont) {
            vals.push(pairs2.join("&"));
          } else {
            vals.push(pairs2.join(","));
          }
        } else {
          const pairs2 = [];
          for (const k in value2) {
            if (Object.prototype.hasOwnProperty.call(value2, k)) {
              pairs2.push(k);
              pairs2.push(String(value2[k]));
            }
          }
          const joined2 = pairs2.join(",");
          if (isLabel) {
            vals.push(joined2);
          } else if (isParam || isForm || isFormCont) {
            vals.push(v2.name + "=" + joined2);
          } else {
            vals.push(joined2);
          }
        }
        continue;
      }
      if (Array.isArray(value2)) {
        if (v2.explodable) {
          if (isLabel) {
            vals.push(value2.join("."));
          } else if (isPath) {
            vals.push(value2.map((x) => "/" + _UriTemplate._encode(x, isReserved)).join(""));
          } else if (isParam) {
            vals.push(value2.map((x) => v2.name + "=" + String(x)).join(";"));
          } else if (isForm || isFormCont) {
            vals.push(value2.map((x) => v2.name + "=" + String(x)).join("&"));
          } else {
            vals.push(value2.map((x) => _UriTemplate._encode(x, isReserved)).join(","));
          }
        } else {
          if (isLabel) {
            vals.push(value2.join(","));
          } else if (isParam) {
            vals.push(v2.name + "=" + value2.join(","));
          } else if (isForm || isFormCont) {
            vals.push(v2.name + "=" + value2.join(","));
          } else {
            vals.push(value2.map((x) => _UriTemplate._encode(x, isReserved)).join(","));
          }
        }
        continue;
      }
      let str = String(value2);
      if (v2.prefixLength !== void 0) {
        str = str.substring(0, v2.prefixLength);
      }
      const enc = _UriTemplate._encode(str, op === "+" || op === "#");
      if (isParam) {
        vals.push(v2.name + "=" + enc);
      } else if (isForm || isFormCont) {
        vals.push(v2.name + "=" + enc);
      } else if (isLabel) {
        vals.push(enc);
      } else if (isPath) {
        vals.push("/" + enc);
      } else {
        vals.push(enc);
      }
    }
    let joined = "";
    if (isLabel) {
      const filtered = vals.filter((v2) => v2 !== "");
      joined = filtered.length ? prefix + filtered.join(".") : "";
    } else if (isPath) {
      const filtered = vals.filter((v2) => v2 !== "");
      joined = filtered.length ? filtered.join("") : "";
      if (joined && !joined.startsWith("/")) {
        joined = "/" + joined;
      }
    } else if (isParam) {
      joined = vals.length ? prefix + vals.map((v2) => v2.replace(/=\s*$/, "")).join(";") : "";
    } else if (isForm) {
      joined = vals.length ? prefix + vals.join("&") : "";
    } else if (isFormCont) {
      joined = vals.length ? prefix + vals.join("&") : "";
    } else if (isFragment) {
      joined = prefix + vals.join(",");
    } else if (isReserved) {
      joined = vals.join(",");
    } else {
      joined = vals.join(",");
    }
    return joined;
  }
  static _encode(str, reserved) {
    return reserved ? encodeURI(str) : pctEncode(str);
  }
  static _formPair(k, v2, named) {
    return named ? k + "=" + encodeURIComponent(String(v2)) : encodeURIComponent(String(v2));
  }
};

function pctEncode(str) {
  let out = "";
  for (let i2 = 0; i2 < str.length; i2++) {
    const chr = str.charCodeAt(i2);
    if (
      // alphanum ranges:
      chr >= 48 && chr <= 57 || chr >= 65 && chr <= 90 || chr >= 97 && chr <= 122 || // unreserved characters:
      (chr === 45 || chr === 46 || chr === 95 || chr === 126)
    ) {
      out += str[i2];
    } else {
      out += "%" + chr.toString(16).toUpperCase().padStart(2, "0");
    }
  }
  return out;
}
export { pctEncode, UriTemplate };
