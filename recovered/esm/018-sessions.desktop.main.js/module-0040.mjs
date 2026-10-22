// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/numbers.ts
import { assert } from "./module-0009.mjs";


// src/vs/base/common/numbers.ts
function clamp(value2, min, max) {
  return Math.min(Math.max(value2, min), max);
}

function formatTokenCount(count2) {
  if (count2 >= 1e6) {
    const value2 = count2 / 1e6;
    const floored = Math.floor(value2 * 10) / 10;
    return floored % 1 === 0 ? `${floored.toFixed(0)}M` : `${floored.toFixed(1)}M`;
  } else if (count2 > 9e5) {
    return "1M";
  } else if (count2 >= 1e3) {
    return `${Math.round(count2 / 1e3)}K`;
  }
  return count2.toString();
}

function rot(index2, modulo) {
  return (modulo + index2 % modulo) % modulo;
}

var MovingAverage = class {
  constructor() {
    this._n = 1;
    this._val = 0;
  }
  update(value2) {
    this._val = this._val + (value2 - this._val) / this._n;
    this._n += 1;
    return this._val;
  }
  get value() {
    return this._val;
  }
};

var SlidingWindowAverage = class {
  constructor(size3) {
    this._n = 0;
    this._val = 0;
    this._values = [];
    this._index = 0;
    this._sum = 0;
    this._values = new Array(size3);
    this._values.fill(0, 0, size3);
  }
  update(value2) {
    const oldValue = this._values[this._index];
    this._values[this._index] = value2;
    this._index = (this._index + 1) % this._values.length;
    this._sum -= oldValue;
    this._sum += value2;
    if (this._n < this._values.length) {
      this._n += 1;
    }
    this._val = this._sum / this._n;
    return this._val;
  }
  get value() {
    return this._val;
  }
};

function isPointWithinTriangle(x, y, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax;
  const v0y = cy - ay;
  const v1x = bx - ax;
  const v1y = by - ay;
  const v2x = x - ax;
  const v2y = y - ay;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v2 = (dot00 * dot12 - dot01 * dot02) * invDenom;
  return u >= 0 && v2 >= 0 && u + v2 < 1;
}

function randomChance(p) {
  assert(p >= 0 && p <= 1, "p must be between 0 and 1");
  return Math.random() < p;
}
export { clamp, formatTokenCount, rot, isPointWithinTriangle, randomChance, MovingAverage, SlidingWindowAverage };
