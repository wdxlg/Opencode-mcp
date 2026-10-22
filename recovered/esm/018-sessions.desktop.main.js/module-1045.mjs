// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/semver/semver.js



// src/vs/base/common/semver/semver.js
var exports = {};

var module = { exports };

!(function(e4, r2) {
  if ("object" == typeof exports && "object" == typeof module) module.exports = r2();
  else if ("function" == typeof define && define.amd) define([], r2);
  else {
    var t2 = r2();
    for (var n2 in t2) ("object" == typeof exports ? exports : e4)[n2] = t2[n2];
  }
})("undefined" != typeof self ? self : void 0, (function() {
  return (function(e4) {
    var r2 = {};
    function t2(n2) {
      if (r2[n2]) return r2[n2].exports;
      var o = r2[n2] = { i: n2, l: false, exports: {} };
      return e4[n2].call(o.exports, o, o.exports, t2), o.l = true, o.exports;
    }
    return t2.m = e4, t2.c = r2, t2.d = function(e5, r3, n2) {
      t2.o(e5, r3) || Object.defineProperty(e5, r3, { enumerable: true, get: n2 });
    }, t2.r = function(e5) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e5, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e5, "__esModule", { value: true });
    }, t2.t = function(e5, r3) {
      if (1 & r3 && (e5 = t2(e5)), 8 & r3) return e5;
      if (4 & r3 && "object" == typeof e5 && e5 && e5.__esModule) return e5;
      var n2 = /* @__PURE__ */ Object.create(null);
      if (t2.r(n2), Object.defineProperty(n2, "default", { enumerable: true, value: e5 }), 2 & r3 && "string" != typeof e5) for (var o in e5) t2.d(n2, o, function(r4) {
        return e5[r4];
      }.bind(null, o));
      return n2;
    }, t2.n = function(e5) {
      var r3 = e5 && e5.__esModule ? function() {
        return e5.default;
      } : function() {
        return e5;
      };
      return t2.d(r3, "a", r3), r3;
    }, t2.o = function(e5, r3) {
      return Object.prototype.hasOwnProperty.call(e5, r3);
    }, t2.p = "", t2(t2.s = 0);
  })([function(e4, r2, t2) {
    (function(t3) {
      var n2;
      r2 = e4.exports = H, n2 = "object" == typeof t3 && t3.env && t3.env.NODE_DEBUG && /\bsemver\b/i.test(t3.env.NODE_DEBUG) ? function() {
        var e5 = Array.prototype.slice.call(arguments, 0);
        e5.unshift("SEMVER"), console.log.apply(console, e5);
      } : function() {
      }, r2.SEMVER_SPEC_VERSION = "2.0.0";
      var o = 256, i2 = Number.MAX_SAFE_INTEGER || 9007199254740991, s = r2.re = [], a = r2.src = [], u = 0, c = u++;
      a[c] = "0|[1-9]\\d*";
      var p = u++;
      a[p] = "[0-9]+";
      var f = u++;
      a[f] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
      var l = u++;
      a[l] = "(" + a[c] + ")\\.(" + a[c] + ")\\.(" + a[c] + ")";
      var h3 = u++;
      a[h3] = "(" + a[p] + ")\\.(" + a[p] + ")\\.(" + a[p] + ")";
      var v2 = u++;
      a[v2] = "(?:" + a[c] + "|" + a[f] + ")";
      var m = u++;
      a[m] = "(?:" + a[p] + "|" + a[f] + ")";
      var w = u++;
      a[w] = "(?:-(" + a[v2] + "(?:\\." + a[v2] + ")*))";
      var g = u++;
      a[g] = "(?:-?(" + a[m] + "(?:\\." + a[m] + ")*))";
      var y = u++;
      a[y] = "[0-9A-Za-z-]+";
      var d = u++;
      a[d] = "(?:\\+(" + a[y] + "(?:\\." + a[y] + ")*))";
      var b = u++, j = "v?" + a[l] + a[w] + "?" + a[d] + "?";
      a[b] = "^" + j + "$";
      var E = "[v=\\s]*" + a[h3] + a[g] + "?" + a[d] + "?", T = u++;
      a[T] = "^" + E + "$";
      var x = u++;
      a[x] = "((?:<|>)?=?)";
      var $129 = u++;
      a[$129] = a[p] + "|x|X|\\*";
      var k = u++;
      a[k] = a[c] + "|x|X|\\*";
      var S = u++;
      a[S] = "[v=\\s]*(" + a[k] + ")(?:\\.(" + a[k] + ")(?:\\.(" + a[k] + ")(?:" + a[w] + ")?" + a[d] + "?)?)?";
      var R = u++;
      a[R] = "[v=\\s]*(" + a[$129] + ")(?:\\.(" + a[$129] + ")(?:\\.(" + a[$129] + ")(?:" + a[g] + ")?" + a[d] + "?)?)?";
      var I = u++;
      a[I] = "^" + a[x] + "\\s*" + a[S] + "$";
      var _ = u++;
      a[_] = "^" + a[x] + "\\s*" + a[R] + "$";
      var O = u++;
      a[O] = "(?:^|[^\\d])(\\d{1,16})(?:\\.(\\d{1,16}))?(?:\\.(\\d{1,16}))?(?:$|[^\\d])";
      var A = u++;
      a[A] = "(?:~>?)";
      var M = u++;
      a[M] = "(\\s*)" + a[A] + "\\s+", s[M] = new RegExp(a[M], "g");
      var V = u++;
      a[V] = "^" + a[A] + a[S] + "$";
      var P = u++;
      a[P] = "^" + a[A] + a[R] + "$";
      var C = u++;
      a[C] = "(?:\\^)";
      var L = u++;
      a[L] = "(\\s*)" + a[C] + "\\s+", s[L] = new RegExp(a[L], "g");
      var N = u++;
      a[N] = "^" + a[C] + a[S] + "$";
      var q = u++;
      a[q] = "^" + a[C] + a[R] + "$";
      var D = u++;
      a[D] = "^" + a[x] + "\\s*(" + E + ")$|^$";
      var X = u++;
      a[X] = "^" + a[x] + "\\s*(" + j + ")$|^$";
      var z = u++;
      a[z] = "(\\s*)" + a[x] + "\\s*(" + E + "|" + a[S] + ")", s[z] = new RegExp(a[z], "g");
      var G = u++;
      a[G] = "^\\s*(" + a[S] + ")\\s+-\\s+(" + a[S] + ")\\s*$";
      var Z = u++;
      a[Z] = "^\\s*(" + a[R] + ")\\s+-\\s+(" + a[R] + ")\\s*$";
      var B = u++;
      a[B] = "(<|>)?=?\\s*\\*";
      for (var U = 0; U < 35; U++) n2(U, a[U]), s[U] || (s[U] = new RegExp(a[U]));
      function F(e5, r3) {
        if (e5 instanceof H) return e5;
        if ("string" != typeof e5) return null;
        if (e5.length > o) return null;
        if (!(r3 ? s[T] : s[b]).test(e5)) return null;
        try {
          return new H(e5, r3);
        } catch (e6) {
          return null;
        }
      }
      function H(e5, r3) {
        if (e5 instanceof H) {
          if (e5.loose === r3) return e5;
          e5 = e5.version;
        } else if ("string" != typeof e5) throw new TypeError("Invalid Version: " + e5);
        if (e5.length > o) throw new TypeError("version is longer than " + o + " characters");
        if (!(this instanceof H)) return new H(e5, r3);
        n2("SemVer", e5, r3), this.loose = r3;
        var t4 = e5.trim().match(r3 ? s[T] : s[b]);
        if (!t4) throw new TypeError("Invalid Version: " + e5);
        if (this.raw = e5, this.major = +t4[1], this.minor = +t4[2], this.patch = +t4[3], this.major > i2 || this.major < 0) throw new TypeError("Invalid major version");
        if (this.minor > i2 || this.minor < 0) throw new TypeError("Invalid minor version");
        if (this.patch > i2 || this.patch < 0) throw new TypeError("Invalid patch version");
        t4[4] ? this.prerelease = t4[4].split(".").map((function(e6) {
          if (/^[0-9]+$/.test(e6)) {
            var r4 = +e6;
            if (r4 >= 0 && r4 < i2) return r4;
          }
          return e6;
        })) : this.prerelease = [], this.build = t4[5] ? t4[5].split(".") : [], this.format();
      }
      r2.parse = F, r2.valid = function(e5, r3) {
        var t4 = F(e5, r3);
        return t4 ? t4.version : null;
      }, r2.clean = function(e5, r3) {
        var t4 = F(e5.trim().replace(/^[=v]+/, ""), r3);
        return t4 ? t4.version : null;
      }, r2.SemVer = H, H.prototype.format = function() {
        return this.version = this.major + "." + this.minor + "." + this.patch, this.prerelease.length && (this.version += "-" + this.prerelease.join(".")), this.version;
      }, H.prototype.toString = function() {
        return this.version;
      }, H.prototype.compare = function(e5) {
        return n2("SemVer.compare", this.version, this.loose, e5), e5 instanceof H || (e5 = new H(e5, this.loose)), this.compareMain(e5) || this.comparePre(e5);
      }, H.prototype.compareMain = function(e5) {
        return e5 instanceof H || (e5 = new H(e5, this.loose)), K(this.major, e5.major) || K(this.minor, e5.minor) || K(this.patch, e5.patch);
      }, H.prototype.comparePre = function(e5) {
        if (e5 instanceof H || (e5 = new H(e5, this.loose)), this.prerelease.length && !e5.prerelease.length) return -1;
        if (!this.prerelease.length && e5.prerelease.length) return 1;
        if (!this.prerelease.length && !e5.prerelease.length) return 0;
        var r3 = 0;
        do {
          var t4 = this.prerelease[r3], o2 = e5.prerelease[r3];
          if (n2("prerelease compare", r3, t4, o2), void 0 === t4 && void 0 === o2) return 0;
          if (void 0 === o2) return 1;
          if (void 0 === t4) return -1;
          if (t4 !== o2) return K(t4, o2);
        } while (++r3);
      }, H.prototype.inc = function(e5, r3) {
        switch (e5) {
          case "premajor":
            this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r3);
            break;
          case "preminor":
            this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r3);
            break;
          case "prepatch":
            this.prerelease.length = 0, this.inc("patch", r3), this.inc("pre", r3);
            break;
          case "prerelease":
            0 === this.prerelease.length && this.inc("patch", r3), this.inc("pre", r3);
            break;
          case "major":
            0 === this.minor && 0 === this.patch && 0 !== this.prerelease.length || this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
            break;
          case "minor":
            0 === this.patch && 0 !== this.prerelease.length || this.minor++, this.patch = 0, this.prerelease = [];
            break;
          case "patch":
            0 === this.prerelease.length && this.patch++, this.prerelease = [];
            break;
          case "pre":
            if (0 === this.prerelease.length) this.prerelease = [0];
            else {
              for (var t4 = this.prerelease.length; --t4 >= 0; ) "number" == typeof this.prerelease[t4] && (this.prerelease[t4]++, t4 = -2);
              -1 === t4 && this.prerelease.push(0);
            }
            r3 && (this.prerelease[0] === r3 ? isNaN(this.prerelease[1]) && (this.prerelease = [r3, 0]) : this.prerelease = [r3, 0]);
            break;
          default:
            throw new Error("invalid increment argument: " + e5);
        }
        return this.format(), this.raw = this.version, this;
      }, r2.inc = function(e5, r3, t4, n3) {
        "string" == typeof t4 && (n3 = t4, t4 = void 0);
        try {
          return new H(e5, t4).inc(r3, n3).version;
        } catch (e6) {
          return null;
        }
      }, r2.diff = function(e5, r3) {
        if (ee(e5, r3)) return null;
        var t4 = F(e5), n3 = F(r3);
        if (t4.prerelease.length || n3.prerelease.length) {
          for (var o2 in t4) if (("major" === o2 || "minor" === o2 || "patch" === o2) && t4[o2] !== n3[o2]) return "pre" + o2;
          return "prerelease";
        }
        for (var o2 in t4) if (("major" === o2 || "minor" === o2 || "patch" === o2) && t4[o2] !== n3[o2]) return o2;
      }, r2.compareIdentifiers = K;
      var J = /^[0-9]+$/;
      function K(e5, r3) {
        var t4 = J.test(e5), n3 = J.test(r3);
        return t4 && n3 && (e5 = +e5, r3 = +r3), t4 && !n3 ? -1 : n3 && !t4 ? 1 : e5 < r3 ? -1 : e5 > r3 ? 1 : 0;
      }
      function Q(e5, r3, t4) {
        return new H(e5, t4).compare(new H(r3, t4));
      }
      function W(e5, r3, t4) {
        return Q(e5, r3, t4) > 0;
      }
      function Y(e5, r3, t4) {
        return Q(e5, r3, t4) < 0;
      }
      function ee(e5, r3, t4) {
        return 0 === Q(e5, r3, t4);
      }
      function re(e5, r3, t4) {
        return 0 !== Q(e5, r3, t4);
      }
      function te(e5, r3, t4) {
        return Q(e5, r3, t4) >= 0;
      }
      function ne(e5, r3, t4) {
        return Q(e5, r3, t4) <= 0;
      }
      function oe(e5, r3, t4, n3) {
        var o2;
        switch (r3) {
          case "===":
            "object" == typeof e5 && (e5 = e5.version), "object" == typeof t4 && (t4 = t4.version), o2 = e5 === t4;
            break;
          case "!==":
            "object" == typeof e5 && (e5 = e5.version), "object" == typeof t4 && (t4 = t4.version), o2 = e5 !== t4;
            break;
          case "":
          case "=":
          case "==":
            o2 = ee(e5, t4, n3);
            break;
          case "!=":
            o2 = re(e5, t4, n3);
            break;
          case ">":
            o2 = W(e5, t4, n3);
            break;
          case ">=":
            o2 = te(e5, t4, n3);
            break;
          case "<":
            o2 = Y(e5, t4, n3);
            break;
          case "<=":
            o2 = ne(e5, t4, n3);
            break;
          default:
            throw new TypeError("Invalid operator: " + r3);
        }
        return o2;
      }
      function ie(e5, r3) {
        if (e5 instanceof ie) {
          if (e5.loose === r3) return e5;
          e5 = e5.value;
        }
        if (!(this instanceof ie)) return new ie(e5, r3);
        n2("comparator", e5, r3), this.loose = r3, this.parse(e5), this.semver === se ? this.value = "" : this.value = this.operator + this.semver.version, n2("comp", this);
      }
      r2.rcompareIdentifiers = function(e5, r3) {
        return K(r3, e5);
      }, r2.major = function(e5, r3) {
        return new H(e5, r3).major;
      }, r2.minor = function(e5, r3) {
        return new H(e5, r3).minor;
      }, r2.patch = function(e5, r3) {
        return new H(e5, r3).patch;
      }, r2.compare = Q, r2.compareLoose = function(e5, r3) {
        return Q(e5, r3, true);
      }, r2.rcompare = function(e5, r3, t4) {
        return Q(r3, e5, t4);
      }, r2.sort = function(e5, t4) {
        return e5.sort((function(e6, n3) {
          return r2.compare(e6, n3, t4);
        }));
      }, r2.rsort = function(e5, t4) {
        return e5.sort((function(e6, n3) {
          return r2.rcompare(e6, n3, t4);
        }));
      }, r2.gt = W, r2.lt = Y, r2.eq = ee, r2.neq = re, r2.gte = te, r2.lte = ne, r2.cmp = oe, r2.Comparator = ie;
      var se = {};
      function ae(e5, r3) {
        if (e5 instanceof ae) return e5.loose === r3 ? e5 : new ae(e5.raw, r3);
        if (e5 instanceof ie) return new ae(e5.value, r3);
        if (!(this instanceof ae)) return new ae(e5, r3);
        if (this.loose = r3, this.raw = e5, this.set = e5.split(/\s*\|\|\s*/).map((function(e6) {
          return this.parseRange(e6.trim());
        }), this).filter((function(e6) {
          return e6.length;
        })), !this.set.length) throw new TypeError("Invalid SemVer Range: " + e5);
        this.format();
      }
      function ue(e5) {
        return !e5 || "x" === e5.toLowerCase() || "*" === e5;
      }
      function ce(e5, r3, t4, n3, o2, i3, s2, a2, u2, c2, p2, f2, l2) {
        return ((r3 = ue(t4) ? "" : ue(n3) ? ">=" + t4 + ".0.0" : ue(o2) ? ">=" + t4 + "." + n3 + ".0" : ">=" + r3) + " " + (a2 = ue(u2) ? "" : ue(c2) ? "<" + (+u2 + 1) + ".0.0" : ue(p2) ? "<" + u2 + "." + (+c2 + 1) + ".0" : f2 ? "<=" + u2 + "." + c2 + "." + p2 + "-" + f2 : "<=" + a2)).trim();
      }
      function pe(e5, r3) {
        for (var t4 = 0; t4 < e5.length; t4++) if (!e5[t4].test(r3)) return false;
        if (r3.prerelease.length) {
          for (t4 = 0; t4 < e5.length; t4++) if (n2(e5[t4].semver), e5[t4].semver !== se && e5[t4].semver.prerelease.length > 0) {
            var o2 = e5[t4].semver;
            if (o2.major === r3.major && o2.minor === r3.minor && o2.patch === r3.patch) return true;
          }
          return false;
        }
        return true;
      }
      function fe(e5, r3, t4) {
        try {
          r3 = new ae(r3, t4);
        } catch (e6) {
          return false;
        }
        return r3.test(e5);
      }
      function le(e5, r3, t4, n3) {
        var o2, i3, s2, a2, u2;
        switch (e5 = new H(e5, n3), r3 = new ae(r3, n3), t4) {
          case ">":
            o2 = W, i3 = ne, s2 = Y, a2 = ">", u2 = ">=";
            break;
          case "<":
            o2 = Y, i3 = te, s2 = W, a2 = "<", u2 = "<=";
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (fe(e5, r3, n3)) return false;
        for (var c2 = 0; c2 < r3.set.length; ++c2) {
          var p2 = r3.set[c2], f2 = null, l2 = null;
          if (p2.forEach((function(e6) {
            e6.semver === se && (e6 = new ie(">=0.0.0")), f2 = f2 || e6, l2 = l2 || e6, o2(e6.semver, f2.semver, n3) ? f2 = e6 : s2(e6.semver, l2.semver, n3) && (l2 = e6);
          })), f2.operator === a2 || f2.operator === u2) return false;
          if ((!l2.operator || l2.operator === a2) && i3(e5, l2.semver)) return false;
          if (l2.operator === u2 && s2(e5, l2.semver)) return false;
        }
        return true;
      }
      ie.prototype.parse = function(e5) {
        var r3 = this.loose ? s[D] : s[X], t4 = e5.match(r3);
        if (!t4) throw new TypeError("Invalid comparator: " + e5);
        this.operator = t4[1], "=" === this.operator && (this.operator = ""), t4[2] ? this.semver = new H(t4[2], this.loose) : this.semver = se;
      }, ie.prototype.toString = function() {
        return this.value;
      }, ie.prototype.test = function(e5) {
        return n2("Comparator.test", e5, this.loose), this.semver === se || ("string" == typeof e5 && (e5 = new H(e5, this.loose)), oe(e5, this.operator, this.semver, this.loose));
      }, ie.prototype.intersects = function(e5, r3) {
        if (!(e5 instanceof ie)) throw new TypeError("a Comparator is required");
        var t4;
        if ("" === this.operator) return t4 = new ae(e5.value, r3), fe(this.value, t4, r3);
        if ("" === e5.operator) return t4 = new ae(this.value, r3), fe(e5.semver, t4, r3);
        var n3 = !(">=" !== this.operator && ">" !== this.operator || ">=" !== e5.operator && ">" !== e5.operator), o2 = !("<=" !== this.operator && "<" !== this.operator || "<=" !== e5.operator && "<" !== e5.operator), i3 = this.semver.version === e5.semver.version, s2 = !(">=" !== this.operator && "<=" !== this.operator || ">=" !== e5.operator && "<=" !== e5.operator), a2 = oe(this.semver, "<", e5.semver, r3) && (">=" === this.operator || ">" === this.operator) && ("<=" === e5.operator || "<" === e5.operator), u2 = oe(this.semver, ">", e5.semver, r3) && ("<=" === this.operator || "<" === this.operator) && (">=" === e5.operator || ">" === e5.operator);
        return n3 || o2 || i3 && s2 || a2 || u2;
      }, r2.Range = ae, ae.prototype.format = function() {
        return this.range = this.set.map((function(e5) {
          return e5.join(" ").trim();
        })).join("||").trim(), this.range;
      }, ae.prototype.toString = function() {
        return this.range;
      }, ae.prototype.parseRange = function(e5) {
        var r3 = this.loose;
        e5 = e5.trim(), n2("range", e5, r3);
        var t4 = r3 ? s[Z] : s[G];
        e5 = e5.replace(t4, ce), n2("hyphen replace", e5), e5 = e5.replace(s[z], "$1$2$3"), n2("comparator trim", e5, s[z]), e5 = (e5 = (e5 = e5.replace(s[M], "$1~")).replace(s[L], "$1^")).split(/\s+/).join(" ");
        var o2 = r3 ? s[D] : s[X], i3 = e5.split(" ").map((function(e6) {
          return (function(e7, r4) {
            return n2("comp", e7), e7 = (function(e8, r5) {
              return e8.trim().split(/\s+/).map((function(e9) {
                return (function(e10, r6) {
                  n2("caret", e10, r6);
                  var t5 = r6 ? s[q] : s[N];
                  return e10.replace(t5, (function(r7, t6, o3, i4, s2) {
                    var a2;
                    return n2("caret", e10, r7, t6, o3, i4, s2), ue(t6) ? a2 = "" : ue(o3) ? a2 = ">=" + t6 + ".0.0 <" + (+t6 + 1) + ".0.0" : ue(i4) ? a2 = "0" === t6 ? ">=" + t6 + "." + o3 + ".0 <" + t6 + "." + (+o3 + 1) + ".0" : ">=" + t6 + "." + o3 + ".0 <" + (+t6 + 1) + ".0.0" : s2 ? (n2("replaceCaret pr", s2), "-" !== s2.charAt(0) && (s2 = "-" + s2), a2 = "0" === t6 ? "0" === o3 ? ">=" + t6 + "." + o3 + "." + i4 + s2 + " <" + t6 + "." + o3 + "." + (+i4 + 1) : ">=" + t6 + "." + o3 + "." + i4 + s2 + " <" + t6 + "." + (+o3 + 1) + ".0" : ">=" + t6 + "." + o3 + "." + i4 + s2 + " <" + (+t6 + 1) + ".0.0") : (n2("no pr"), a2 = "0" === t6 ? "0" === o3 ? ">=" + t6 + "." + o3 + "." + i4 + " <" + t6 + "." + o3 + "." + (+i4 + 1) : ">=" + t6 + "." + o3 + "." + i4 + " <" + t6 + "." + (+o3 + 1) + ".0" : ">=" + t6 + "." + o3 + "." + i4 + " <" + (+t6 + 1) + ".0.0"), n2("caret return", a2), a2;
                  }));
                })(e9, r5);
              })).join(" ");
            })(e7, r4), n2("caret", e7), e7 = (function(e8, r5) {
              return e8.trim().split(/\s+/).map((function(e9) {
                return (function(e10, r6) {
                  var t5 = r6 ? s[P] : s[V];
                  return e10.replace(t5, (function(r7, t6, o3, i4, s2) {
                    var a2;
                    return n2("tilde", e10, r7, t6, o3, i4, s2), ue(t6) ? a2 = "" : ue(o3) ? a2 = ">=" + t6 + ".0.0 <" + (+t6 + 1) + ".0.0" : ue(i4) ? a2 = ">=" + t6 + "." + o3 + ".0 <" + t6 + "." + (+o3 + 1) + ".0" : s2 ? (n2("replaceTilde pr", s2), "-" !== s2.charAt(0) && (s2 = "-" + s2), a2 = ">=" + t6 + "." + o3 + "." + i4 + s2 + " <" + t6 + "." + (+o3 + 1) + ".0") : a2 = ">=" + t6 + "." + o3 + "." + i4 + " <" + t6 + "." + (+o3 + 1) + ".0", n2("tilde return", a2), a2;
                  }));
                })(e9, r5);
              })).join(" ");
            })(e7, r4), n2("tildes", e7), e7 = (function(e8, r5) {
              return n2("replaceXRanges", e8, r5), e8.split(/\s+/).map((function(e9) {
                return (function(e10, r6) {
                  e10 = e10.trim();
                  var t5 = r6 ? s[_] : s[I];
                  return e10.replace(t5, (function(r7, t6, o3, i4, s2, a2) {
                    n2("xRange", e10, r7, t6, o3, i4, s2, a2);
                    var u2 = ue(o3), c2 = u2 || ue(i4), p2 = c2 || ue(s2);
                    return "=" === t6 && p2 && (t6 = ""), u2 ? r7 = ">" === t6 || "<" === t6 ? "<0.0.0" : "*" : t6 && p2 ? (c2 && (i4 = 0), p2 && (s2 = 0), ">" === t6 ? (t6 = ">=", c2 ? (o3 = +o3 + 1, i4 = 0, s2 = 0) : p2 && (i4 = +i4 + 1, s2 = 0)) : "<=" === t6 && (t6 = "<", c2 ? o3 = +o3 + 1 : i4 = +i4 + 1), r7 = t6 + o3 + "." + i4 + "." + s2) : c2 ? r7 = ">=" + o3 + ".0.0 <" + (+o3 + 1) + ".0.0" : p2 && (r7 = ">=" + o3 + "." + i4 + ".0 <" + o3 + "." + (+i4 + 1) + ".0"), n2("xRange return", r7), r7;
                  }));
                })(e9, r5);
              })).join(" ");
            })(e7, r4), n2("xrange", e7), e7 = (function(e8, r5) {
              return n2("replaceStars", e8, r5), e8.trim().replace(s[B], "");
            })(e7, r4), n2("stars", e7), e7;
          })(e6, r3);
        })).join(" ").split(/\s+/);
        return this.loose && (i3 = i3.filter((function(e6) {
          return !!e6.match(o2);
        }))), i3 = i3.map((function(e6) {
          return new ie(e6, r3);
        }));
      }, ae.prototype.intersects = function(e5, r3) {
        if (!(e5 instanceof ae)) throw new TypeError("a Range is required");
        return this.set.some((function(t4) {
          return t4.every((function(t5) {
            return e5.set.some((function(e6) {
              return e6.every((function(e7) {
                return t5.intersects(e7, r3);
              }));
            }));
          }));
        }));
      }, r2.toComparators = function(e5, r3) {
        return new ae(e5, r3).set.map((function(e6) {
          return e6.map((function(e7) {
            return e7.value;
          })).join(" ").trim().split(" ");
        }));
      }, ae.prototype.test = function(e5) {
        if (!e5) return false;
        "string" == typeof e5 && (e5 = new H(e5, this.loose));
        for (var r3 = 0; r3 < this.set.length; r3++) if (pe(this.set[r3], e5)) return true;
        return false;
      }, r2.satisfies = fe, r2.maxSatisfying = function(e5, r3, t4) {
        var n3 = null, o2 = null;
        try {
          var i3 = new ae(r3, t4);
        } catch (e6) {
          return null;
        }
        return e5.forEach((function(e6) {
          i3.test(e6) && (n3 && -1 !== o2.compare(e6) || (o2 = new H(n3 = e6, t4)));
        })), n3;
      }, r2.minSatisfying = function(e5, r3, t4) {
        var n3 = null, o2 = null;
        try {
          var i3 = new ae(r3, t4);
        } catch (e6) {
          return null;
        }
        return e5.forEach((function(e6) {
          i3.test(e6) && (n3 && 1 !== o2.compare(e6) || (o2 = new H(n3 = e6, t4)));
        })), n3;
      }, r2.validRange = function(e5, r3) {
        try {
          return new ae(e5, r3).range || "*";
        } catch (e6) {
          return null;
        }
      }, r2.ltr = function(e5, r3, t4) {
        return le(e5, r3, "<", t4);
      }, r2.gtr = function(e5, r3, t4) {
        return le(e5, r3, ">", t4);
      }, r2.outside = le, r2.prerelease = function(e5, r3) {
        var t4 = F(e5, r3);
        return t4 && t4.prerelease.length ? t4.prerelease : null;
      }, r2.intersects = function(e5, r3, t4) {
        return e5 = new ae(e5, t4), r3 = new ae(r3, t4), e5.intersects(r3);
      }, r2.coerce = function(e5) {
        if (e5 instanceof H) return e5;
        if ("string" != typeof e5) return null;
        var r3 = e5.match(s[O]);
        return null == r3 ? null : F((r3[1] || "0") + "." + (r3[2] || "0") + "." + (r3[3] || "0"));
      };
    }).call(this, t2(1));
  }, function(e4, r2) {
    var t2, n2, o = e4.exports = {};
    function i2() {
      throw new Error("setTimeout has not been defined");
    }
    function s() {
      throw new Error("clearTimeout has not been defined");
    }
    function a(e5) {
      if (t2 === setTimeout) return setTimeout(e5, 0);
      if ((t2 === i2 || !t2) && setTimeout) return t2 = setTimeout, setTimeout(e5, 0);
      try {
        return t2(e5, 0);
      } catch (r3) {
        try {
          return t2.call(null, e5, 0);
        } catch (r4) {
          return t2.call(this, e5, 0);
        }
      }
    }
    !(function() {
      try {
        t2 = "function" == typeof setTimeout ? setTimeout : i2;
      } catch (e5) {
        t2 = i2;
      }
      try {
        n2 = "function" == typeof clearTimeout ? clearTimeout : s;
      } catch (e5) {
        n2 = s;
      }
    })();
    var u, c = [], p = false, f = -1;
    function l() {
      p && u && (p = false, u.length ? c = u.concat(c) : f = -1, c.length && h3());
    }
    function h3() {
      if (!p) {
        var e5 = a(l);
        p = true;
        for (var r3 = c.length; r3; ) {
          for (u = c, c = []; ++f < r3; ) u && u[f].run();
          f = -1, r3 = c.length;
        }
        u = null, p = false, (function(e6) {
          if (n2 === clearTimeout) return clearTimeout(e6);
          if ((n2 === s || !n2) && clearTimeout) return n2 = clearTimeout, clearTimeout(e6);
          try {
            n2(e6);
          } catch (r4) {
            try {
              return n2.call(null, e6);
            } catch (r5) {
              return n2.call(this, e6);
            }
          }
        })(e5);
      }
    }
    function v2(e5, r3) {
      this.fun = e5, this.array = r3;
    }
    function m() {
    }
    o.nextTick = function(e5) {
      var r3 = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var t3 = 1; t3 < arguments.length; t3++) r3[t3 - 1] = arguments[t3];
      c.push(new v2(e5, r3)), 1 !== c.length || p || a(h3);
    }, v2.prototype.run = function() {
      this.fun.apply(null, this.array);
    }, o.title = "browser", o.browser = true, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = m, o.addListener = m, o.once = m, o.off = m, o.removeListener = m, o.removeAllListeners = m, o.emit = m, o.prependListener = m, o.prependOnceListener = m, o.listeners = function(e5) {
      return [];
    }, o.binding = function(e5) {
      throw new Error("process.binding is not supported");
    }, o.cwd = function() {
      return "/";
    }, o.chdir = function(e5) {
      throw new Error("process.chdir is not supported");
    }, o.umask = function() {
      return 0;
    };
  }]);
}));

var SEMVER_SPEC_VERSION = module.exports.SEMVER_SPEC_VERSION;

var parse8 = module.exports.parse;

var valid = module.exports.valid;

var coerce = module.exports.coerce;

var clean = module.exports.clean;

var inc = module.exports.inc;

var major = module.exports.major;

var minor = module.exports.minor;

var patch = module.exports.patch;

var prerelease = module.exports.prerelease;

var gt = module.exports.gt;

var gte = module.exports.gte;

var lt = module.exports.lt;

var lte = module.exports.lte;

var eq = module.exports.eq;

var neq = module.exports.neq;

var cmp3 = module.exports.cmp;

var compare2 = module.exports.compare;

var rcompare = module.exports.rcompare;

var compareIdentifiers = module.exports.compareIdentifiers;

var rcompareIdentifiers = module.exports.rcompareIdentifiers;

var compareBuild = module.exports.compareBuild;

var sort = module.exports.sort;

var rsort = module.exports.rsort;

var diff2 = module.exports.diff;

var validRange = module.exports.validRange;

var satisfies = module.exports.satisfies;

var maxSatisfying = module.exports.maxSatisfying;

var minSatisfying = module.exports.minSatisfying;

var minVersion = module.exports.minVersion;

var gtr = module.exports.gtr;

var ltr = module.exports.ltr;

var outside = module.exports.outside;

var intersects2 = module.exports.intersects;

var SemVer = module.exports.SemVer;

var Comparator2 = module.exports.Comparator;

var Range5 = module.exports.Range;
export { exports, module, SEMVER_SPEC_VERSION, parse8, valid, coerce, clean, inc, major, minor, patch, prerelease, gt, gte, lt, lte, eq, neq, cmp3, compare2, rcompare, compareIdentifiers, rcompareIdentifiers, compareBuild, sort, rsort, diff2, validRange, satisfies, maxSatisfying, minSatisfying, minVersion, gtr, ltr, outside, intersects2, SemVer, Comparator2, Range5 };
