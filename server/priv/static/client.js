// build/dev/javascript/prelude.mjs
class CustomType {
  withFields(fields) {
    let properties = Object.keys(this).map((label) => (label in fields) ? fields[label] : this[label]);
    return new this.constructor(...properties);
  }
}

class List {
  static fromArray(array, tail) {
    let t = tail || new Empty;
    for (let i = array.length - 1;i >= 0; --i) {
      t = new NonEmpty(array[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  atLeastLength(desired) {
    let current = this;
    while (desired-- > 0 && current)
      current = current.tail;
    return current !== undefined;
  }
  hasLength(desired) {
    let current = this;
    while (desired-- > 0 && current)
      current = current.tail;
    return desired === -1 && current instanceof Empty;
  }
  countLength() {
    let current = this;
    let length = 0;
    while (current) {
      current = current.tail;
      length++;
    }
    return length - 1;
  }
}
function prepend(element, tail) {
  return new NonEmpty(element, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}

class ListIterator {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
}

class Empty extends List {
}
var List$Empty = () => new Empty;
var List$isEmpty = (value) => value instanceof Empty;

class NonEmpty extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
}
var List$NonEmpty = (head, tail) => new NonEmpty(head, tail);
var List$isNonEmpty = (value) => value instanceof NonEmpty;
var List$NonEmpty$first = (value) => value.head;
var List$NonEmpty$rest = (value) => value.tail;

class BitArray {
  bitSize;
  byteSize;
  bitOffset;
  rawBuffer;
  constructor(buffer, bitSize, bitOffset) {
    if (!(buffer instanceof Uint8Array)) {
      throw globalThis.Error("BitArray can only be constructed from a Uint8Array");
    }
    this.bitSize = bitSize ?? buffer.length * 8;
    this.byteSize = Math.trunc((this.bitSize + 7) / 8);
    this.bitOffset = bitOffset ?? 0;
    if (this.bitSize < 0) {
      throw globalThis.Error(`BitArray bit size is invalid: ${this.bitSize}`);
    }
    if (this.bitOffset < 0 || this.bitOffset > 7) {
      throw globalThis.Error(`BitArray bit offset is invalid: ${this.bitOffset}`);
    }
    if (buffer.length !== Math.trunc((this.bitOffset + this.bitSize + 7) / 8)) {
      throw globalThis.Error("BitArray buffer length is invalid");
    }
    this.rawBuffer = buffer;
  }
  byteAt(index) {
    if (index < 0 || index >= this.byteSize) {
      return;
    }
    return bitArrayByteAt(this.rawBuffer, this.bitOffset, index);
  }
  equals(other) {
    if (this.bitSize !== other.bitSize) {
      return false;
    }
    const wholeByteCount = Math.trunc(this.bitSize / 8);
    if (this.bitOffset === 0 && other.bitOffset === 0) {
      for (let i = 0;i < wholeByteCount; i++) {
        if (this.rawBuffer[i] !== other.rawBuffer[i]) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (this.rawBuffer[wholeByteCount] >> unusedLowBitCount !== other.rawBuffer[wholeByteCount] >> unusedLowBitCount) {
          return false;
        }
      }
    } else {
      for (let i = 0;i < wholeByteCount; i++) {
        const a = bitArrayByteAt(this.rawBuffer, this.bitOffset, i);
        const b = bitArrayByteAt(other.rawBuffer, other.bitOffset, i);
        if (a !== b) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const a = bitArrayByteAt(this.rawBuffer, this.bitOffset, wholeByteCount);
        const b = bitArrayByteAt(other.rawBuffer, other.bitOffset, wholeByteCount);
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (a >> unusedLowBitCount !== b >> unusedLowBitCount) {
          return false;
        }
      }
    }
    return true;
  }
  get buffer() {
    bitArrayPrintDeprecationWarning("buffer", "Use BitArray.byteAt() or BitArray.rawBuffer instead");
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error("BitArray.buffer does not support unaligned bit arrays");
    }
    return this.rawBuffer;
  }
  get length() {
    bitArrayPrintDeprecationWarning("length", "Use BitArray.bitSize or BitArray.byteSize instead");
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error("BitArray.length does not support unaligned bit arrays");
    }
    return this.rawBuffer.length;
  }
}
function bitArrayByteAt(buffer, bitOffset, index) {
  if (bitOffset === 0) {
    return buffer[index] ?? 0;
  } else {
    const a = buffer[index] << bitOffset & 255;
    const b = buffer[index + 1] >> 8 - bitOffset;
    return a | b;
  }
}

class UtfCodepoint {
  constructor(value) {
    this.value = value;
  }
}
var isBitArrayDeprecationMessagePrinted = {};
function bitArrayPrintDeprecationWarning(name, message) {
  if (isBitArrayDeprecationMessagePrinted[name]) {
    return;
  }
  console.warn(`Deprecated BitArray.${name} property used in JavaScript FFI code. ${message}.`);
  isBitArrayDeprecationMessagePrinted[name] = true;
}
class Result extends CustomType {
  static isResult(data2) {
    return data2 instanceof Result;
  }
}

class Ok extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  isOk() {
    return true;
  }
}
var Result$Ok = (value) => new Ok(value);
var Result$isOk = (value) => value instanceof Ok;
var Result$Ok$0 = (value) => value[0];

class Error extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  isOk() {
    return false;
  }
}
var Result$Error = (detail) => new Error(detail);
var Result$isError = (value) => value instanceof Error;
function isEqual(x, y) {
  let values = [x, y];
  while (values.length) {
    let a = values.pop();
    let b = values.pop();
    if (a === b)
      continue;
    if (!isObject(a) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a, b) || unequalDates(a, b) || unequalBuffers(a, b) || unequalArrays(a, b) || unequalMaps(a, b) || unequalSets(a, b) || unequalRegExps(a, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a.equals(b))
          continue;
        else
          return false;
      } catch {}
    }
    let [keys, get] = getters(a);
    const ka = keys(a);
    const kb = keys(b);
    if (ka.length !== kb.length)
      return false;
    for (let k of ka) {
      values.push(get(a, k), get(b, k));
    }
  }
  return true;
}
function getters(object) {
  if (object instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a, b) {
  return a instanceof Date && (a > b || a < b);
}
function unequalBuffers(a, b) {
  return !(a instanceof BitArray) && a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT && !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]));
}
function unequalArrays(a, b) {
  return Array.isArray(a) && a.length !== b.length;
}
function unequalMaps(a, b) {
  return a instanceof Map && a.size !== b.size;
}
function unequalSets(a, b) {
  return a instanceof Set && (a.size != b.size || [...a].some((e) => !b.has(e)));
}
function unequalRegExps(a, b) {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
}
function isObject(a) {
  return typeof a === "object" && a !== null;
}
function structurallyCompatibleObjects(a, b) {
  if (typeof a !== "object" && typeof b !== "object" && (!a || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a instanceof c))
    return false;
  return a.constructor === b.constructor;
}
function divideFloat(a, b) {
  if (b === 0) {
    return 0;
  } else {
    return a / b;
  }
}
function makeError(variant, file, module, line, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.file = file;
  error.module = module;
  error.line = line;
  error.function = fn;
  error.fn = fn;
  for (let k in extra)
    error[k] = extra[k];
  return error;
}
// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap;
var tempDataView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== undefined) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0;i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {}
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0;i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys = Object.keys(o);
    for (let i = 0;i < keys.length; i++) {
      const k = keys[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === undefined)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}

class Dict {
  constructor(size, root) {
    this.size = size;
    this.root = root;
  }
}
var bits = 5;
var mask = (1 << bits) - 1;
var noElementMarker = Symbol();
var generationKey = Symbol();
var emptyNode = /* @__PURE__ */ newNode(0);
var emptyDict = /* @__PURE__ */ new Dict(0, emptyNode);
var errorNil = /* @__PURE__ */ Result$Error(undefined);
function makeNode(generation, datamap, nodemap, data2) {
  return {
    datamap,
    nodemap,
    data: data2,
    [generationKey]: generation
  };
}
function newNode(generation) {
  return makeNode(generation, 0, 0, []);
}
function copyNode(node, generation) {
  if (node[generationKey] === generation) {
    return node;
  }
  const newData = node.data.slice(0);
  return makeNode(generation, node.datamap, node.nodemap, newData);
}
function copyAndSet(node, generation, idx, val) {
  if (node.data[idx] === val) {
    return node;
  }
  node = copyNode(node, generation);
  node.data[idx] = val;
  return node;
}
function copyAndInsertPair(node, generation, bit, idx, key, val) {
  const data2 = node.data;
  const length = data2.length;
  const newData = new Array(length + 2);
  let readIndex = 0;
  let writeIndex = 0;
  while (readIndex < idx)
    newData[writeIndex++] = data2[readIndex++];
  newData[writeIndex++] = key;
  newData[writeIndex++] = val;
  while (readIndex < length)
    newData[writeIndex++] = data2[readIndex++];
  return makeNode(generation, node.datamap | bit, node.nodemap, newData);
}
function copyAndRemovePair(node, generation, bit, idx) {
  node = copyNode(node, generation);
  const data2 = node.data;
  const length = data2.length;
  for (let w = idx, r = idx + 2;r < length; ++r, ++w) {
    data2[w] = data2[r];
  }
  data2.pop();
  data2.pop();
  node.datamap ^= bit;
  return node;
}
function make() {
  return emptyDict;
}
function from(iterable) {
  let transient = toTransient(emptyDict);
  for (const [key, value] of iterable) {
    transient = destructiveTransientInsert(key, value, transient);
  }
  return fromTransient(transient);
}
function size(dict) {
  return dict.size;
}
function get(dict, key) {
  const result = lookup(dict.root, key, getHash(key));
  return result !== noElementMarker ? Result$Ok(result) : errorNil;
}
function lookup(node, key, hash) {
  for (let shift = 0;shift < 32; shift += bits) {
    const data2 = node.data;
    const bit = hashbit(hash, shift);
    if (node.nodemap & bit) {
      node = data2[data2.length - 1 - index(node.nodemap, bit)];
    } else if (node.datamap & bit) {
      const dataidx = Math.imul(index(node.datamap, bit), 2);
      return isEqual(key, data2[dataidx]) ? data2[dataidx + 1] : noElementMarker;
    } else {
      return noElementMarker;
    }
  }
  const overflow = node.data;
  for (let i = 0;i < overflow.length; i += 2) {
    if (isEqual(key, overflow[i])) {
      return overflow[i + 1];
    }
  }
  return noElementMarker;
}
function toTransient(dict) {
  return {
    generation: nextGeneration(dict),
    root: dict.root,
    size: dict.size,
    dict
  };
}
function fromTransient(transient) {
  if (transient.root === transient.dict.root) {
    return transient.dict;
  }
  return new Dict(transient.size, transient.root);
}
function nextGeneration(dict) {
  const root = dict.root;
  if (root[generationKey] < Number.MAX_SAFE_INTEGER) {
    return root[generationKey] + 1;
  }
  const queue = [root];
  while (queue.length) {
    const node = queue.pop();
    node[generationKey] = 0;
    const nodeStart = data.length - popcount(node.nodemap);
    for (let i = nodeStart;i < node.data.length; ++i) {
      queue.push(node.data[i]);
    }
  }
  return 1;
}
var globalTransient = /* @__PURE__ */ toTransient(emptyDict);
function insert(dict, key, value) {
  globalTransient.generation = nextGeneration(dict);
  globalTransient.size = dict.size;
  const hash = getHash(key);
  const root = insertIntoNode(globalTransient, dict.root, key, value, hash, 0);
  if (root === dict.root) {
    return dict;
  }
  return new Dict(globalTransient.size, root);
}
function destructiveTransientInsert(key, value, transient) {
  const hash = getHash(key);
  transient.root = insertIntoNode(transient, transient.root, key, value, hash, 0);
  return transient;
}
function insertIntoNode(transient, node, key, value, hash, shift) {
  const data2 = node.data;
  const generation = transient.generation;
  if (shift > 32) {
    for (let i = 0;i < data2.length; i += 2) {
      if (isEqual(key, data2[i])) {
        return copyAndSet(node, generation, i + 1, value);
      }
    }
    transient.size += 1;
    return copyAndInsertPair(node, generation, 0, data2.length, key, value);
  }
  const bit = hashbit(hash, shift);
  if (node.nodemap & bit) {
    const nodeidx2 = data2.length - 1 - index(node.nodemap, bit);
    let child2 = data2[nodeidx2];
    child2 = insertIntoNode(transient, child2, key, value, hash, shift + bits);
    return copyAndSet(node, generation, nodeidx2, child2);
  }
  const dataidx = Math.imul(index(node.datamap, bit), 2);
  if ((node.datamap & bit) === 0) {
    transient.size += 1;
    return copyAndInsertPair(node, generation, bit, dataidx, key, value);
  }
  if (isEqual(key, data2[dataidx])) {
    return copyAndSet(node, generation, dataidx + 1, value);
  }
  const childShift = shift + bits;
  let child = emptyNode;
  child = insertIntoNode(transient, child, key, value, hash, childShift);
  const key2 = data2[dataidx];
  const value2 = data2[dataidx + 1];
  const hash2 = getHash(key2);
  child = insertIntoNode(transient, child, key2, value2, hash2, childShift);
  transient.size -= 1;
  const length = data2.length;
  const nodeidx = length - 1 - index(node.nodemap, bit);
  const newData = new Array(length - 1);
  let readIndex = 0;
  let writeIndex = 0;
  while (readIndex < dataidx)
    newData[writeIndex++] = data2[readIndex++];
  readIndex += 2;
  while (readIndex <= nodeidx)
    newData[writeIndex++] = data2[readIndex++];
  newData[writeIndex++] = child;
  while (readIndex < length)
    newData[writeIndex++] = data2[readIndex++];
  return makeNode(generation, node.datamap ^ bit, node.nodemap | bit, newData);
}
function destructiveTransientDelete(key, transient) {
  const hash = getHash(key);
  transient.root = deleteFromNode(transient, transient.root, key, hash, 0);
  return transient;
}
function deleteFromNode(transient, node, key, hash, shift) {
  const data2 = node.data;
  const generation = transient.generation;
  if (shift > 32) {
    for (let i = 0;i < data2.length; i += 2) {
      if (isEqual(key, data2[i])) {
        transient.size -= 1;
        return copyAndRemovePair(node, generation, 0, i);
      }
    }
    return node;
  }
  const bit = hashbit(hash, shift);
  const dataidx = Math.imul(index(node.datamap, bit), 2);
  if ((node.nodemap & bit) !== 0) {
    const nodeidx = data2.length - 1 - index(node.nodemap, bit);
    let child = data2[nodeidx];
    child = deleteFromNode(transient, child, key, hash, shift + bits);
    if (child.nodemap !== 0 || child.data.length > 2) {
      return copyAndSet(node, generation, nodeidx, child);
    }
    const length = data2.length;
    const newData = new Array(length + 1);
    let readIndex = 0;
    let writeIndex = 0;
    while (readIndex < dataidx)
      newData[writeIndex++] = data2[readIndex++];
    newData[writeIndex++] = child.data[0];
    newData[writeIndex++] = child.data[1];
    while (readIndex < nodeidx)
      newData[writeIndex++] = data2[readIndex++];
    readIndex++;
    while (readIndex < length)
      newData[writeIndex++] = data2[readIndex++];
    return makeNode(generation, node.datamap | bit, node.nodemap ^ bit, newData);
  }
  if ((node.datamap & bit) === 0 || !isEqual(key, data2[dataidx])) {
    return node;
  }
  transient.size -= 1;
  return copyAndRemovePair(node, generation, bit, dataidx);
}
function fold(dict, state, fun) {
  const queue = [dict.root];
  while (queue.length) {
    const node = queue.pop();
    const data2 = node.data;
    const edgesStart = data2.length - popcount(node.nodemap);
    for (let i = 0;i < edgesStart; i += 2) {
      state = fun(state, data2[i], data2[i + 1]);
    }
    for (let i = edgesStart;i < data2.length; ++i) {
      queue.push(data2[i]);
    }
  }
  return state;
}
function popcount(n) {
  n -= n >>> 1 & 1431655765;
  n = (n & 858993459) + (n >>> 2 & 858993459);
  return Math.imul(n + (n >>> 4) & 252645135, 16843009) >>> 24;
}
function index(bitmap, bit) {
  return popcount(bitmap & bit - 1);
}
function hashbit(hash, shift) {
  return 1 << (hash >>> shift & mask);
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
class Some extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
var Option$isSome = (value) => value instanceof Some;
var Option$Some$0 = (value) => value[0];

class None extends CustomType {
}
function to_result(option, e) {
  if (option instanceof Some) {
    let a = option[0];
    return new Ok(a);
  } else {
    return new Error(e);
  }
}
function unwrap(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$;
  }
}
function lazy_unwrap(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$();
  }
}
function map(option, fun) {
  if (option instanceof Some) {
    let x = option[0];
    return new Some(fun(x));
  } else {
    return option;
  }
}
function or(first, second) {
  if (first instanceof Some) {
    return first;
  } else {
    return second;
  }
}

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function delete$(dict, key) {
  let _pipe = toTransient(dict);
  let _pipe$1 = ((_capture) => {
    return destructiveTransientDelete(key, _capture);
  })(_pipe);
  return fromTransient(_pipe$1);
}
function keys(dict) {
  return fold(dict, toList([]), (acc, key, _) => {
    return prepend(key, acc);
  });
}

// build/dev/javascript/gleam_stdlib/gleam/order.mjs
class Lt extends CustomType {
}
var Order$Lt = () => new Lt;
class Eq extends CustomType {
}
var Order$Eq = () => new Eq;
class Gt extends CustomType {
}
var Order$Gt = () => new Gt;

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function concat_loop(loop$strings, loop$accumulator) {
  while (true) {
    let strings = loop$strings;
    let accumulator = loop$accumulator;
    if (strings instanceof Empty) {
      return accumulator;
    } else {
      let string = strings.head;
      let strings$1 = strings.tail;
      loop$strings = strings$1;
      loop$accumulator = accumulator + string;
    }
  }
}
function concat2(strings) {
  return concat_loop(strings, "");
}
function join_loop(loop$strings, loop$separator, loop$accumulator) {
  while (true) {
    let strings = loop$strings;
    let separator = loop$separator;
    let accumulator = loop$accumulator;
    if (strings instanceof Empty) {
      return accumulator;
    } else {
      let string = strings.head;
      let strings$1 = strings.tail;
      loop$strings = strings$1;
      loop$separator = separator;
      loop$accumulator = accumulator + separator + string;
    }
  }
}
function join(strings, separator) {
  if (strings instanceof Empty) {
    return "";
  } else {
    let first$1 = strings.head;
    let rest = strings.tail;
    return join_loop(rest, separator, first$1);
  }
}
function trim(string) {
  let _pipe = string;
  let _pipe$1 = trim_start(_pipe);
  return trim_end(_pipe$1);
}
function split2(x, substring) {
  if (substring === "") {
    return graphemes(x);
  } else {
    let _pipe = x;
    let _pipe$1 = identity(_pipe);
    let _pipe$2 = split(_pipe$1, substring);
    return map3(_pipe$2, identity);
  }
}
function inspect2(term) {
  let _pipe = term;
  let _pipe$1 = inspect(_pipe);
  return identity(_pipe$1);
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic/decode.mjs
class DecodeError extends CustomType {
  constructor(expected, found, path) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path;
  }
}
var DecodeError$DecodeError = (expected, found, path) => new DecodeError(expected, found, path);
class Decoder extends CustomType {
  constructor(function$) {
    super();
    this.function = function$;
  }
}
var int2 = /* @__PURE__ */ new Decoder(decode_int);
var float2 = /* @__PURE__ */ new Decoder(decode_float);
var string2 = /* @__PURE__ */ new Decoder(decode_string);
function run(data2, decoder) {
  let $ = decoder.function(data2);
  let maybe_invalid_data;
  let errors;
  maybe_invalid_data = $[0];
  errors = $[1];
  if (errors instanceof Empty) {
    return new Ok(maybe_invalid_data);
  } else {
    return new Error(errors);
  }
}
function success(data2) {
  return new Decoder((_) => {
    return [data2, toList([])];
  });
}
function map4(decoder, transformer) {
  return new Decoder((d) => {
    let $ = decoder.function(d);
    let data2;
    let errors;
    data2 = $[0];
    errors = $[1];
    return [transformer(data2), errors];
  });
}
function then$(decoder, next) {
  return new Decoder((dynamic_data) => {
    let $ = decoder.function(dynamic_data);
    let data2;
    let errors;
    data2 = $[0];
    errors = $[1];
    let decoder$1 = next(data2);
    let $1 = decoder$1.function(dynamic_data);
    let layer;
    let data$1;
    layer = $1;
    data$1 = $1[0];
    if (errors instanceof Empty) {
      return layer;
    } else {
      return [data$1, errors];
    }
  });
}
function run_decoders(loop$data, loop$failure, loop$decoders) {
  while (true) {
    let data2 = loop$data;
    let failure = loop$failure;
    let decoders = loop$decoders;
    if (decoders instanceof Empty) {
      return failure;
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder.function(data2);
      let layer;
      let errors;
      layer = $;
      errors = $[1];
      if (errors instanceof Empty) {
        return layer;
      } else {
        loop$data = data2;
        loop$failure = failure;
        loop$decoders = decoders$1;
      }
    }
  }
}
function one_of(first, alternatives) {
  return new Decoder((dynamic_data) => {
    let $ = first.function(dynamic_data);
    let layer;
    let errors;
    layer = $;
    errors = $[1];
    if (errors instanceof Empty) {
      return layer;
    } else {
      return run_decoders(dynamic_data, layer, alternatives);
    }
  });
}
function optional(inner) {
  return new Decoder((data2) => {
    let $ = is_null(data2);
    if ($) {
      return [new None, toList([])];
    } else {
      let $1 = inner.function(data2);
      let data$1;
      let errors;
      data$1 = $1[0];
      errors = $1[1];
      return [new Some(data$1), errors];
    }
  });
}
function decode_error(expected, found) {
  return toList([
    new DecodeError(expected, classify_dynamic(found), toList([]))
  ]);
}
function run_dynamic_function(data2, name, f) {
  let $ = f(data2);
  if ($ instanceof Ok) {
    let data$1 = $[0];
    return [data$1, toList([])];
  } else {
    let placeholder = $[0];
    return [
      placeholder,
      toList([new DecodeError(name, classify_dynamic(data2), toList([]))])
    ];
  }
}
function decode_int(data2) {
  return run_dynamic_function(data2, "Int", int);
}
function decode_float(data2) {
  return run_dynamic_function(data2, "Float", float);
}
function failure(placeholder, name) {
  return new Decoder((d) => {
    return [placeholder, decode_error(name, d)];
  });
}
function new_primitive_decoder(name, decoding_function) {
  return new Decoder((d) => {
    let $ = decoding_function(d);
    if ($ instanceof Ok) {
      let t = $[0];
      return [t, toList([])];
    } else {
      let placeholder = $[0];
      return [
        placeholder,
        toList([new DecodeError(name, classify_dynamic(d), toList([]))])
      ];
    }
  });
}
function decode_string(data2) {
  return run_dynamic_function(data2, "String", string);
}
function path_segment_to_string(key) {
  let decoder = one_of(string2, toList([
    (() => {
      let _pipe = int2;
      return map4(_pipe, to_string);
    })(),
    (() => {
      let _pipe = float2;
      return map4(_pipe, float_to_string);
    })()
  ]));
  let $ = run(key, decoder);
  if ($ instanceof Ok) {
    let key$1 = $[0];
    return key$1;
  } else {
    return "<" + classify_dynamic(key) + ">";
  }
}
function fold_dict(acc, key, value, key_decoder, value_decoder) {
  let $ = key_decoder(key);
  let $1 = $[1];
  if ($1 instanceof Empty) {
    let key_decoded = $[0];
    let $2 = value_decoder(value);
    let $3 = $2[1];
    if ($3 instanceof Empty) {
      let value$1 = $2[0];
      let dict$1 = insert(acc[0], key_decoded, value$1);
      return [dict$1, acc[1]];
    } else {
      let errors = $3;
      let key_identifier = path_segment_to_string(key);
      return push_path([make(), errors], toList([key_identifier]));
    }
  } else {
    let errors = $1;
    return push_path([make(), errors], toList(["keys"]));
  }
}
function dict2(key, value) {
  return new Decoder((data2) => {
    let $ = dict(data2);
    if ($ instanceof Ok) {
      let dict$1 = $[0];
      return fold(dict$1, [make(), toList([])], (a, k, v) => {
        let $1 = a[1];
        if ($1 instanceof Empty) {
          return fold_dict(a, k, v, key.function, value.function);
        } else {
          return a;
        }
      });
    } else {
      return [make(), decode_error("Dict", data2)];
    }
  });
}
function list2(inner) {
  return new Decoder((data2) => {
    return list(data2, inner.function, (p, k) => {
      return push_path(p, toList([k]));
    }, 0, toList([]));
  });
}
function push_path(layer, path) {
  let path$1 = map3(path, (key) => {
    let _pipe = key;
    let _pipe$1 = identity(_pipe);
    return path_segment_to_string(_pipe$1);
  });
  let errors = map3(layer[1], (error) => {
    return new DecodeError(error.expected, error.found, append2(path$1, error.path));
  });
  return [layer[0], errors];
}
function index3(loop$path, loop$position, loop$inner, loop$data, loop$handle_miss) {
  while (true) {
    let path = loop$path;
    let position = loop$position;
    let inner = loop$inner;
    let data2 = loop$data;
    let handle_miss = loop$handle_miss;
    if (path instanceof Empty) {
      let _pipe = data2;
      let _pipe$1 = inner(_pipe);
      return push_path(_pipe$1, reverse(position));
    } else {
      let key = path.head;
      let path$1 = path.tail;
      let $ = index2(data2, key);
      if ($ instanceof Ok) {
        let $1 = $[0];
        if ($1 instanceof Some) {
          let data$1 = $1[0];
          loop$path = path$1;
          loop$position = prepend(key, position);
          loop$inner = inner;
          loop$data = data$1;
          loop$handle_miss = handle_miss;
        } else {
          return handle_miss(data2, prepend(key, position));
        }
      } else {
        let kind = $[0];
        let $1 = inner(data2);
        let default$;
        default$ = $1[0];
        let _pipe = [
          default$,
          toList([new DecodeError(kind, classify_dynamic(data2), toList([]))])
        ];
        return push_path(_pipe, reverse(position));
      }
    }
  }
}
function subfield(field_path, field_decoder, next) {
  return new Decoder((data2) => {
    let $ = index3(field_path, toList([]), field_decoder.function, data2, (data3, position) => {
      let $12 = field_decoder.function(data3);
      let default$;
      default$ = $12[0];
      let _pipe = [
        default$,
        toList([new DecodeError("Field", "Nothing", toList([]))])
      ];
      return push_path(_pipe, reverse(position));
    });
    let out;
    let errors1;
    out = $[0];
    errors1 = $[1];
    let $1 = next(out).function(data2);
    let out$1;
    let errors2;
    out$1 = $1[0];
    errors2 = $1[1];
    return [out$1, append2(errors1, errors2)];
  });
}
function field(field_name, field_decoder, next) {
  return subfield(toList([field_name]), field_decoder, next);
}

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = undefined;
function identity(x) {
  return x;
}
function parse_int(value) {
  if (/^[-+]?(\d+)$/.test(value)) {
    return Result$Ok(parseInt(value));
  } else {
    return Result$Error(Nil);
  }
}
function parse_float(value) {
  if (/^[-+]?(\d+)\.(\d+)([eE][-+]?\d+)?$/.test(value)) {
    return Result$Ok(parseFloat(value));
  } else {
    return Result$Error(Nil);
  }
}
function to_string(term) {
  return term.toString();
}
function graphemes(string3) {
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    return arrayToList(Array.from(iterator).map((item) => item.segment));
  } else {
    return arrayToList(string3.match(/./gsu));
  }
}
var segmenter = undefined;
function graphemes_iterator(string3) {
  if (globalThis.Intl && Intl.Segmenter) {
    segmenter ||= new Intl.Segmenter;
    return segmenter.segment(string3)[Symbol.iterator]();
  }
}
function pop_codeunit(str) {
  return [str.charCodeAt(0) | 0, str.slice(1)];
}
function lowercase(string3) {
  return string3.toLowerCase();
}
function split(xs, pattern) {
  return arrayToList(xs.split(pattern));
}
function string_codeunit_slice(str, from2, length2) {
  return str.slice(from2, from2 + length2);
}
function starts_with(haystack, needle) {
  return haystack.startsWith(needle);
}
var unicode_whitespaces = [
  " ",
  "\t",
  `
`,
  "\v",
  "\f",
  "\r",
  "",
  "\u2028",
  "\u2029"
].join("");
var trim_start_regex = /* @__PURE__ */ new RegExp(`^[${unicode_whitespaces}]*`);
var trim_end_regex = /* @__PURE__ */ new RegExp(`[${unicode_whitespaces}]*$`);
function trim_start(string3) {
  return string3.replace(trim_start_regex, "");
}
function trim_end(string3) {
  return string3.replace(trim_end_regex, "");
}
function console_log(term) {
  console.log(term);
}
function round2(float3) {
  return Math.round(float3);
}
function power2(base, exponent) {
  return Math.pow(base, exponent);
}
function classify_dynamic(data2) {
  if (typeof data2 === "string") {
    return "String";
  } else if (typeof data2 === "boolean") {
    return "Bool";
  } else if (isResult(data2)) {
    return "Result";
  } else if (isList(data2)) {
    return "List";
  } else if (data2 instanceof BitArray) {
    return "BitArray";
  } else if (data2 instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data2)) {
    return "Int";
  } else if (Array.isArray(data2)) {
    return `Array`;
  } else if (typeof data2 === "number") {
    return "Float";
  } else if (data2 === null) {
    return "Nil";
  } else if (data2 === undefined) {
    return "Nil";
  } else {
    const type = typeof data2;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
var MIN_I32 = -(2 ** 31);
var MAX_I32 = 2 ** 31 - 1;
var U32 = 2 ** 32;
var MAX_SAFE = Number.MAX_SAFE_INTEGER;
var MIN_SAFE = Number.MIN_SAFE_INTEGER;
function inspect(v) {
  return new Inspector().inspect(v);
}
function float_to_string(float3) {
  const string3 = float3.toString().replace("+", "");
  if (string3.indexOf(".") >= 0) {
    return string3;
  } else {
    const index4 = string3.indexOf("e");
    if (index4 >= 0) {
      return string3.slice(0, index4) + ".0" + string3.slice(index4);
    } else {
      return string3 + ".0";
    }
  }
}

class Inspector {
  #references = new Set;
  inspect(v) {
    const t = typeof v;
    if (v === true)
      return "True";
    if (v === false)
      return "False";
    if (v === null)
      return "//js(null)";
    if (v === undefined)
      return "Nil";
    if (t === "string")
      return this.#string(v);
    if (t === "bigint" || Number.isInteger(v))
      return v.toString();
    if (t === "number")
      return float_to_string(v);
    if (v instanceof UtfCodepoint)
      return this.#utfCodepoint(v);
    if (v instanceof BitArray)
      return this.#bit_array(v);
    if (v instanceof RegExp)
      return `//js(${v})`;
    if (v instanceof Date)
      return `//js(Date("${v.toISOString()}"))`;
    if (v instanceof globalThis.Error)
      return `//js(${v.toString()})`;
    if (v instanceof Function) {
      const args = [];
      for (const i of Array(v.length).keys())
        args.push(String.fromCharCode(i + 97));
      return `//fn(${args.join(", ")}) { ... }`;
    }
    if (this.#references.size === this.#references.add(v).size) {
      return "//js(circular reference)";
    }
    let printed;
    if (Array.isArray(v)) {
      printed = `#(${v.map((v2) => this.inspect(v2)).join(", ")})`;
    } else if (isList(v)) {
      printed = this.#list(v);
    } else if (v instanceof CustomType) {
      printed = this.#customType(v);
    } else if (v instanceof Dict) {
      printed = this.#dict(v);
    } else if (v instanceof Set) {
      return `//js(Set(${[...v].map((v2) => this.inspect(v2)).join(", ")}))`;
    } else {
      printed = this.#object(v);
    }
    this.#references.delete(v);
    return printed;
  }
  #object(v) {
    const name = Object.getPrototypeOf(v)?.constructor?.name || "Object";
    const props = [];
    for (const k of Object.keys(v)) {
      props.push(`${this.inspect(k)}: ${this.inspect(v[k])}`);
    }
    const body = props.length ? " " + props.join(", ") + " " : "";
    const head = name === "Object" ? "" : name + " ";
    return `//js(${head}{${body}})`;
  }
  #dict(map5) {
    let body = "dict.from_list([";
    let first = true;
    body = fold(map5, body, (body2, key, value) => {
      if (!first)
        body2 = body2 + ", ";
      first = false;
      return body2 + "#(" + this.inspect(key) + ", " + this.inspect(value) + ")";
    });
    return body + "])";
  }
  #customType(record) {
    const props = Object.keys(record).map((label) => {
      const value = this.inspect(record[label]);
      return isNaN(parseInt(label)) ? `${label}: ${value}` : value;
    }).join(", ");
    return props ? `${record.constructor.name}(${props})` : record.constructor.name;
  }
  #list(list3) {
    if (List$isEmpty(list3)) {
      return "[]";
    }
    let char_out = 'charlist.from_string("';
    let list_out = "[";
    let current = list3;
    while (List$isNonEmpty(current)) {
      let element = current.head;
      current = current.tail;
      if (list_out !== "[") {
        list_out += ", ";
      }
      list_out += this.inspect(element);
      if (char_out) {
        if (Number.isInteger(element) && element >= 32 && element <= 126) {
          char_out += String.fromCharCode(element);
        } else {
          char_out = null;
        }
      }
    }
    if (char_out) {
      return char_out + '")';
    } else {
      return list_out + "]";
    }
  }
  #string(str) {
    let new_str = '"';
    for (let i = 0;i < str.length; i++) {
      const char = str[i];
      switch (char) {
        case `
`:
          new_str += "\\n";
          break;
        case "\r":
          new_str += "\\r";
          break;
        case "\t":
          new_str += "\\t";
          break;
        case "\f":
          new_str += "\\f";
          break;
        case "\\":
          new_str += "\\\\";
          break;
        case '"':
          new_str += "\\\"";
          break;
        default:
          if (char < " " || char > "~" && char < " ") {
            new_str += "\\u{" + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") + "}";
          } else {
            new_str += char;
          }
      }
    }
    new_str += '"';
    return new_str;
  }
  #utfCodepoint(codepoint2) {
    return `//utfcodepoint(${String.fromCodePoint(codepoint2.value)})`;
  }
  #bit_array(bits2) {
    if (bits2.bitSize === 0) {
      return "<<>>";
    }
    let acc = "<<";
    for (let i = 0;i < bits2.byteSize - 1; i++) {
      acc += bits2.byteAt(i).toString();
      acc += ", ";
    }
    if (bits2.byteSize * 8 === bits2.bitSize) {
      acc += bits2.byteAt(bits2.byteSize - 1).toString();
    } else {
      const trailingBitsCount = bits2.bitSize % 8;
      acc += bits2.byteAt(bits2.byteSize - 1) >> 8 - trailingBitsCount;
      acc += `:size(${trailingBitsCount})`;
    }
    acc += ">>";
    return acc;
  }
}
function base16_encode(bit_array2) {
  const trailingBitsCount = bit_array2.bitSize % 8;
  let result = "";
  for (let i = 0;i < bit_array2.byteSize; i++) {
    let byte = bit_array2.byteAt(i);
    if (i === bit_array2.byteSize - 1 && trailingBitsCount !== 0) {
      const unusedBitsCount = 8 - trailingBitsCount;
      byte = byte >> unusedBitsCount << unusedBitsCount;
    }
    result += byte.toString(16).padStart(2, "0").toUpperCase();
  }
  return result;
}
function index2(data2, key) {
  if (data2 instanceof Dict) {
    const result = get(data2, key);
    return Result$Ok(result.isOk() ? new Some(result[0]) : new None);
  }
  if (data2 instanceof WeakMap || data2 instanceof Map) {
    const token = {};
    const entry = data2.get(key, token);
    if (entry === token)
      return Result$Ok(new None);
    return Result$Ok(new Some(entry));
  }
  const key_is_int = Number.isInteger(key);
  if (key_is_int && key >= 0 && key < 8 && isList(data2)) {
    let i = 0;
    for (const value of data2) {
      if (i === key)
        return Result$Ok(new Some(value));
      i++;
    }
    return Result$Error("Indexable");
  }
  if (key_is_int && Array.isArray(data2) || data2 && typeof data2 === "object" || data2 && Object.getPrototypeOf(data2) === Object.prototype) {
    if (key in data2)
      return Result$Ok(new Some(data2[key]));
    return Result$Ok(new None);
  }
  return Result$Error(key_is_int ? "Indexable" : "Dict");
}
function list(data2, decode, pushPath, index4, emptyList) {
  if (!(isList(data2) || Array.isArray(data2))) {
    const error = DecodeError$DecodeError("List", classify_dynamic(data2), emptyList);
    return [emptyList, arrayToList([error])];
  }
  const decoded = [];
  for (const element of data2) {
    const layer = decode(element);
    const [out, errors] = layer;
    if (List$isNonEmpty(errors)) {
      const [_, errors2] = pushPath(layer, index4.toString());
      return [emptyList, errors2];
    }
    decoded.push(out);
    index4++;
  }
  return [arrayToList(decoded), emptyList];
}
function dict(data2) {
  if (data2 instanceof Dict) {
    return Result$Ok(data2);
  }
  if (data2 instanceof Map || data2 instanceof WeakMap) {
    return Result$Ok(from(data2));
  }
  if (data2 == null) {
    return Result$Error("Dict");
  }
  if (typeof data2 !== "object") {
    return Result$Error("Dict");
  }
  const proto = Object.getPrototypeOf(data2);
  if (proto === Object.prototype || proto === null) {
    return Result$Ok(from(Object.entries(data2)));
  }
  return Result$Error("Dict");
}
function float(data2) {
  if (typeof data2 === "number")
    return Result$Ok(data2);
  return Result$Error(0);
}
function int(data2) {
  if (Number.isInteger(data2))
    return Result$Ok(data2);
  return Result$Error(0);
}
function string(data2) {
  if (typeof data2 === "string")
    return Result$Ok(data2);
  return Result$Error("");
}
function is_null(data2) {
  return data2 === null || data2 === undefined;
}
function arrayToList(array) {
  let list3 = List$Empty();
  let i = array.length;
  while (i--) {
    list3 = List$NonEmpty(array[i], list3);
  }
  return list3;
}
function isList(data2) {
  return List$isEmpty(data2) || List$isNonEmpty(data2);
}
function isResult(data2) {
  return Result$isOk(data2) || Result$isError(data2);
}

// build/dev/javascript/gleam_stdlib/gleam/float.mjs
function max(a, b) {
  let $ = a > b;
  if ($) {
    return a;
  } else {
    return b;
  }
}
function absolute_value(x) {
  let $ = x >= 0;
  if ($) {
    return x;
  } else {
    return 0 - x;
  }
}
function negate(x) {
  return -1 * x;
}
function round(x) {
  let $ = x >= 0;
  if ($) {
    return round2(x);
  } else {
    return 0 - round2(negate(x));
  }
}
function to_precision(x, precision) {
  let $ = precision <= 0;
  if ($) {
    let factor = power2(10, identity(-precision));
    return identity(round(divideFloat(x, factor))) * factor;
  } else {
    let factor = power2(10, identity(precision));
    return divideFloat(identity(round(x * factor)), factor);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
class Ascending extends CustomType {
}

class Descending extends CustomType {
}
function length_loop(loop$list, loop$count) {
  while (true) {
    let list3 = loop$list;
    let count = loop$count;
    if (list3 instanceof Empty) {
      return count;
    } else {
      let list$1 = list3.tail;
      loop$list = list$1;
      loop$count = count + 1;
    }
  }
}
function length2(list3) {
  return length_loop(list3, 0);
}
function reverse_and_prepend(loop$prefix, loop$suffix) {
  while (true) {
    let prefix = loop$prefix;
    let suffix = loop$suffix;
    if (prefix instanceof Empty) {
      return suffix;
    } else {
      let first$1 = prefix.head;
      let rest$1 = prefix.tail;
      loop$prefix = rest$1;
      loop$suffix = prepend(first$1, suffix);
    }
  }
}
function reverse(list3) {
  return reverse_and_prepend(list3, toList([]));
}
function contains(loop$list, loop$elem) {
  while (true) {
    let list3 = loop$list;
    let elem = loop$elem;
    if (list3 instanceof Empty) {
      return false;
    } else {
      let first$1 = list3.head;
      if (isEqual(first$1, elem)) {
        return true;
      } else {
        let rest$1 = list3.tail;
        loop$list = rest$1;
        loop$elem = elem;
      }
    }
  }
}
function filter_map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list3 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list3.head;
      let rest$1 = list3.tail;
      let _block;
      let $ = fun(first$1);
      if ($ instanceof Ok) {
        let first$2 = $[0];
        _block = prepend(first$2, acc);
      } else {
        _block = acc;
      }
      let new_acc = _block;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter_map(list3, fun) {
  return filter_map_loop(list3, fun, toList([]));
}
function map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list3 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list3.head;
      let rest$1 = list3.tail;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = prepend(fun(first$1), acc);
    }
  }
}
function map3(list3, fun) {
  return map_loop(list3, fun, toList([]));
}
function index_map_loop(loop$list, loop$fun, loop$index, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let fun = loop$fun;
    let index4 = loop$index;
    let acc = loop$acc;
    if (list3 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list3.head;
      let rest$1 = list3.tail;
      let acc$1 = prepend(fun(first$1, index4), acc);
      loop$list = rest$1;
      loop$fun = fun;
      loop$index = index4 + 1;
      loop$acc = acc$1;
    }
  }
}
function index_map(list3, fun) {
  return index_map_loop(list3, fun, 0, toList([]));
}
function take_loop(loop$list, loop$n, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let n = loop$n;
    let acc = loop$acc;
    let $ = n <= 0;
    if ($) {
      return reverse(acc);
    } else {
      if (list3 instanceof Empty) {
        return reverse(acc);
      } else {
        let first$1 = list3.head;
        let rest$1 = list3.tail;
        loop$list = rest$1;
        loop$n = n - 1;
        loop$acc = prepend(first$1, acc);
      }
    }
  }
}
function take(list3, n) {
  return take_loop(list3, n, toList([]));
}
function append_loop(loop$first, loop$second) {
  while (true) {
    let first = loop$first;
    let second = loop$second;
    if (first instanceof Empty) {
      return second;
    } else {
      let first$1 = first.head;
      let rest$1 = first.tail;
      loop$first = rest$1;
      loop$second = prepend(first$1, second);
    }
  }
}
function append2(first, second) {
  return append_loop(reverse(first), second);
}
function prepend2(list3, item) {
  return prepend(item, list3);
}
function fold2(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list3 = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list3 instanceof Empty) {
      return initial;
    } else {
      let first$1 = list3.head;
      let rest$1 = list3.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, first$1);
      loop$fun = fun;
    }
  }
}
function sequences(loop$list, loop$compare, loop$growing, loop$direction, loop$prev, loop$acc) {
  while (true) {
    let list3 = loop$list;
    let compare3 = loop$compare;
    let growing = loop$growing;
    let direction = loop$direction;
    let prev = loop$prev;
    let acc = loop$acc;
    let growing$1 = prepend(prev, growing);
    if (list3 instanceof Empty) {
      if (direction instanceof Ascending) {
        return prepend(reverse(growing$1), acc);
      } else {
        return prepend(growing$1, acc);
      }
    } else {
      let new$1 = list3.head;
      let rest$1 = list3.tail;
      let $ = compare3(prev, new$1);
      if (direction instanceof Ascending) {
        if ($ instanceof Lt) {
          loop$list = rest$1;
          loop$compare = compare3;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else if ($ instanceof Eq) {
          loop$list = rest$1;
          loop$compare = compare3;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else {
          let _block;
          if (direction instanceof Ascending) {
            _block = prepend(reverse(growing$1), acc);
          } else {
            _block = prepend(growing$1, acc);
          }
          let acc$1 = _block;
          if (rest$1 instanceof Empty) {
            return prepend(toList([new$1]), acc$1);
          } else {
            let next = rest$1.head;
            let rest$2 = rest$1.tail;
            let _block$1;
            let $1 = compare3(new$1, next);
            if ($1 instanceof Lt) {
              _block$1 = new Ascending;
            } else if ($1 instanceof Eq) {
              _block$1 = new Ascending;
            } else {
              _block$1 = new Descending;
            }
            let direction$1 = _block$1;
            loop$list = rest$2;
            loop$compare = compare3;
            loop$growing = toList([new$1]);
            loop$direction = direction$1;
            loop$prev = next;
            loop$acc = acc$1;
          }
        }
      } else if ($ instanceof Lt) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare3(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending;
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending;
          } else {
            _block$1 = new Descending;
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare3;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else if ($ instanceof Eq) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare3(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending;
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending;
          } else {
            _block$1 = new Descending;
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare3;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else {
        loop$list = rest$1;
        loop$compare = compare3;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      }
    }
  }
}
function merge_ascendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list22 = loop$list2;
    let compare3 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list3 = list22;
      return reverse_and_prepend(list3, acc);
    } else if (list22 instanceof Empty) {
      let list3 = list1;
      return reverse_and_prepend(list3, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list22.head;
      let rest2 = list22.tail;
      let $ = compare3(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare3;
        loop$acc = prepend(first1, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare3;
        loop$acc = prepend(first2, acc);
      } else {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare3;
        loop$acc = prepend(first2, acc);
      }
    }
  }
}
function merge_ascending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare3 = loop$compare;
    let acc = loop$acc;
    if (sequences2 instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let ascending1 = sequences2.head;
        let ascending2 = $.head;
        let rest$1 = $.tail;
        let descending = merge_ascendings(ascending1, ascending2, compare3, toList([]));
        loop$sequences = rest$1;
        loop$compare = compare3;
        loop$acc = prepend(descending, acc);
      }
    }
  }
}
function merge_descendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list22 = loop$list2;
    let compare3 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list3 = list22;
      return reverse_and_prepend(list3, acc);
    } else if (list22 instanceof Empty) {
      let list3 = list1;
      return reverse_and_prepend(list3, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list22.head;
      let rest2 = list22.tail;
      let $ = compare3(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare3;
        loop$acc = prepend(first2, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare3;
        loop$acc = prepend(first1, acc);
      } else {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare3;
        loop$acc = prepend(first1, acc);
      }
    }
  }
}
function merge_descending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare3 = loop$compare;
    let acc = loop$acc;
    if (sequences2 instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let descending1 = sequences2.head;
        let descending2 = $.head;
        let rest$1 = $.tail;
        let ascending = merge_descendings(descending1, descending2, compare3, toList([]));
        loop$sequences = rest$1;
        loop$compare = compare3;
        loop$acc = prepend(ascending, acc);
      }
    }
  }
}
function merge_all(loop$sequences, loop$direction, loop$compare) {
  while (true) {
    let sequences2 = loop$sequences;
    let direction = loop$direction;
    let compare3 = loop$compare;
    if (sequences2 instanceof Empty) {
      return sequences2;
    } else if (direction instanceof Ascending) {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return sequence;
      } else {
        let sequences$1 = merge_ascending_pairs(sequences2, compare3, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Descending;
        loop$compare = compare3;
      }
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(sequence);
      } else {
        let sequences$1 = merge_descending_pairs(sequences2, compare3, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Ascending;
        loop$compare = compare3;
      }
    }
  }
}
function sort(list3, compare3) {
  if (list3 instanceof Empty) {
    return list3;
  } else {
    let $ = list3.tail;
    if ($ instanceof Empty) {
      return list3;
    } else {
      let x = list3.head;
      let y = $.head;
      let rest$1 = $.tail;
      let _block;
      let $1 = compare3(x, y);
      if ($1 instanceof Lt) {
        _block = new Ascending;
      } else if ($1 instanceof Eq) {
        _block = new Ascending;
      } else {
        _block = new Descending;
      }
      let direction = _block;
      let sequences$1 = sequences(rest$1, compare3, toList([x]), direction, y, toList([]));
      return merge_all(sequences$1, new Ascending, compare3);
    }
  }
}
function each(loop$list, loop$f) {
  while (true) {
    let list3 = loop$list;
    let f = loop$f;
    if (list3 instanceof Empty) {
      return;
    } else {
      let first$1 = list3.head;
      let rest$1 = list3.tail;
      f(first$1);
      loop$list = rest$1;
      loop$f = f;
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function is_ok(result) {
  if (result instanceof Ok) {
    return true;
  } else {
    return false;
  }
}
function map_error(result, fun) {
  if (result instanceof Ok) {
    return result;
  } else {
    let error = result[0];
    return new Error(fun(error));
  }
}
function try$(result, fun) {
  if (result instanceof Ok) {
    let x = result[0];
    return fun(x);
  } else {
    return result;
  }
}
function unwrap2(result, default$) {
  if (result instanceof Ok) {
    let v = result[0];
    return v;
  } else {
    return default$;
  }
}
function lazy_or(first, second) {
  if (first instanceof Ok) {
    return first;
  } else {
    return second();
  }
}
// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/function.mjs
function identity2(x) {
  return x;
}
// build/dev/javascript/gleam_json/gleam_json_ffi.mjs
function json_to_string(json) {
  return JSON.stringify(json);
}
function object(entries) {
  return Object.fromEntries(entries);
}
function identity3(x) {
  return x;
}
function array(list3) {
  const array2 = [];
  while (List$isNonEmpty(list3)) {
    array2.push(List$NonEmpty$first(list3));
    list3 = List$NonEmpty$rest(list3);
  }
  return array2;
}
function do_null() {
  return null;
}
function decode(string3) {
  try {
    const result = JSON.parse(string3);
    return Result$Ok(result);
  } catch (err) {
    return Result$Error(getJsonDecodeError(err, string3));
  }
}
function getJsonDecodeError(stdErr, json) {
  if (isUnexpectedEndOfInput(stdErr))
    return DecodeError$UnexpectedEndOfInput();
  return toUnexpectedByteError(stdErr, json);
}
function isUnexpectedEndOfInput(err) {
  const unexpectedEndOfInputRegex = /((unexpected (end|eof))|(end of data)|(unterminated string)|(json( parse error|\.parse)\: expected '(\:|\}|\])'))/i;
  return unexpectedEndOfInputRegex.test(err.message);
}
function toUnexpectedByteError(err, json) {
  let converters = [
    v8UnexpectedByteError,
    oldV8UnexpectedByteError,
    jsCoreUnexpectedByteError,
    spidermonkeyUnexpectedByteError
  ];
  for (let converter of converters) {
    let result = converter(err, json);
    if (result)
      return result;
  }
  return DecodeError$UnexpectedByte("");
}
function v8UnexpectedByteError(err) {
  const regex = /unexpected token '(.)', ".+" is not valid JSON/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  return DecodeError$UnexpectedByte(byte);
}
function oldV8UnexpectedByteError(err) {
  const regex = /unexpected token (.) in JSON at position (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  return DecodeError$UnexpectedByte(byte);
}
function spidermonkeyUnexpectedByteError(err, json) {
  const regex = /(unexpected character|expected .*) at line (\d+) column (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const line = Number(match[2]);
  const column = Number(match[3]);
  const position = getPositionFromMultiline(line, column, json);
  const byte = toHex(json[position]);
  return DecodeError$UnexpectedByte(byte);
}
function jsCoreUnexpectedByteError(err) {
  const regex = /unexpected (identifier|token) "(.)"/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[2]);
  return DecodeError$UnexpectedByte(byte);
}
function toHex(char) {
  return "0x" + char.charCodeAt(0).toString(16).toUpperCase();
}
function getPositionFromMultiline(line, column, string3) {
  if (line === 1)
    return column - 1;
  let currentLn = 1;
  let position = 0;
  string3.split("").find((char, idx) => {
    if (char === `
`)
      currentLn += 1;
    if (currentLn === line) {
      position = idx + column;
      return true;
    }
    return false;
  });
  return position;
}

// build/dev/javascript/gleam_json/gleam/json.mjs
class UnexpectedEndOfInput extends CustomType {
}
var DecodeError$UnexpectedEndOfInput = () => new UnexpectedEndOfInput;
class UnexpectedByte extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
var DecodeError$UnexpectedByte = ($0) => new UnexpectedByte($0);
class UnableToDecode extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
function do_parse(json, decoder) {
  return try$(decode(json), (dynamic_value) => {
    let _pipe = run(dynamic_value, decoder);
    return map_error(_pipe, (var0) => {
      return new UnableToDecode(var0);
    });
  });
}
function parse(json, decoder) {
  return do_parse(json, decoder);
}
function to_string2(json) {
  return json_to_string(json);
}
function string3(input) {
  return identity3(input);
}
function int3(input) {
  return identity3(input);
}
function float3(input) {
  return identity3(input);
}
function null$() {
  return do_null();
}
function object2(entries) {
  return object(entries);
}
function preprocessed_array(from2) {
  return array(from2);
}
function array2(entries, inner_type) {
  let _pipe = entries;
  let _pipe$1 = map3(_pipe, inner_type);
  return preprocessed_array(_pipe$1);
}

// build/dev/javascript/houdini/houdini.ffi.mjs
function do_escape(string4) {
  return string4.replaceAll(/[><&"']/g, (replaced) => {
    switch (replaced) {
      case ">":
        return "&gt;";
      case "<":
        return "&lt;";
      case "'":
        return "&#39;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return replaced;
    }
  });
}

// build/dev/javascript/houdini/houdini/internal/escape_js.mjs
function escape(text) {
  return do_escape(text);
}

// build/dev/javascript/houdini/houdini.mjs
function escape2(string4) {
  return escape(string4);
}

// build/dev/javascript/lustre/lustre/internals/constants.mjs
var empty_list = /* @__PURE__ */ toList([]);
var error_nil = /* @__PURE__ */ new Error(undefined);

// build/dev/javascript/lustre/lustre/vdom/vattr.ffi.mjs
var GT = /* @__PURE__ */ Order$Gt();
var LT = /* @__PURE__ */ Order$Lt();
var EQ = /* @__PURE__ */ Order$Eq();
function compare3(a, b) {
  if (a.name === b.name) {
    return EQ;
  } else if (a.name < b.name) {
    return LT;
  } else {
    return GT;
  }
}

// build/dev/javascript/lustre/lustre/vdom/vattr.mjs
class Attribute extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
}
class Property extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
}
class Event2 extends CustomType {
  constructor(kind, name, handler, include, prevent_default, stop_propagation, debounce, throttle) {
    super();
    this.kind = kind;
    this.name = name;
    this.handler = handler;
    this.include = include;
    this.prevent_default = prevent_default;
    this.stop_propagation = stop_propagation;
    this.debounce = debounce;
    this.throttle = throttle;
  }
}
class Handler extends CustomType {
  constructor(prevent_default, stop_propagation, message) {
    super();
    this.prevent_default = prevent_default;
    this.stop_propagation = stop_propagation;
    this.message = message;
  }
}
class Never extends CustomType {
  constructor(kind) {
    super();
    this.kind = kind;
  }
}
class Possible extends CustomType {
  constructor(kind) {
    super();
    this.kind = kind;
  }
}
class Always extends CustomType {
  constructor(kind) {
    super();
    this.kind = kind;
  }
}
var attribute_kind = 0;
var property_kind = 1;
var event_kind = 2;
var never_kind = 0;
var never = /* @__PURE__ */ new Never(never_kind);
var possible_kind = 1;
var possible = /* @__PURE__ */ new Possible(possible_kind);
var always_kind = 2;
var always = /* @__PURE__ */ new Always(always_kind);
function merge(loop$attributes, loop$merged) {
  while (true) {
    let attributes = loop$attributes;
    let merged = loop$merged;
    if (attributes instanceof Empty) {
      return merged;
    } else {
      let $ = attributes.head;
      if ($ instanceof Attribute) {
        let $1 = $.name;
        if ($1 === "") {
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = merged;
        } else if ($1 === "class") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "class") {
                  let kind = $.kind;
                  let class1 = $2;
                  let rest = $3.tail;
                  let class2 = $4.value;
                  let value = class1 + " " + class2;
                  let attribute$1 = new Attribute(kind, "class", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else if ($1 === "style") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "style") {
                  let kind = $.kind;
                  let style1 = $2;
                  let rest = $3.tail;
                  let style2 = $4.value;
                  let value = style1 + ";" + style2;
                  let attribute$1 = new Attribute(kind, "style", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else {
          let attribute$1 = $;
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = prepend(attribute$1, merged);
        }
      } else {
        let attribute$1 = $;
        let rest = attributes.tail;
        loop$attributes = rest;
        loop$merged = prepend(attribute$1, merged);
      }
    }
  }
}
function prepare(attributes) {
  if (attributes instanceof Empty) {
    return attributes;
  } else {
    let $ = attributes.tail;
    if ($ instanceof Empty) {
      return attributes;
    } else {
      let _pipe = attributes;
      let _pipe$1 = sort(_pipe, (a, b) => {
        return compare3(b, a);
      });
      return merge(_pipe$1, empty_list);
    }
  }
}
function attribute(name, value) {
  return new Attribute(attribute_kind, name, value);
}
function property(name, value) {
  return new Property(property_kind, name, value);
}
function event(name, handler, include, prevent_default, stop_propagation, debounce, throttle) {
  return new Event2(event_kind, name, handler, include, prevent_default, stop_propagation, debounce, throttle);
}

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute2(name, value) {
  return attribute(name, value);
}
function property2(name, value) {
  return property(name, value);
}
function class$(name) {
  return attribute2("class", name);
}
function id(value) {
  return attribute2("id", value);
}
function style(property3, value) {
  if (property3 === "") {
    return class$("");
  } else if (value === "") {
    return class$("");
  } else {
    return attribute2("style", property3 + ":" + value + ";");
  }
}
function do_styles(loop$properties, loop$styles) {
  while (true) {
    let properties = loop$properties;
    let styles = loop$styles;
    if (properties instanceof Empty) {
      return styles;
    } else {
      let $ = properties.head[0];
      if ($ === "") {
        let rest = properties.tail;
        loop$properties = rest;
        loop$styles = styles;
      } else {
        let $1 = properties.head[1];
        if ($1 === "") {
          let rest = properties.tail;
          loop$properties = rest;
          loop$styles = styles;
        } else {
          let rest = properties.tail;
          let name$1 = $;
          let value$1 = $1;
          loop$properties = rest;
          loop$styles = styles + name$1 + ":" + value$1 + ";";
        }
      }
    }
  }
}
function styles(properties) {
  return attribute2("style", do_styles(properties, ""));
}
function name(element_name) {
  return attribute2("name", element_name);
}

// build/dev/javascript/lustre/lustre/effect.mjs
class Effect extends CustomType {
  constructor(synchronous, before_paint, after_paint) {
    super();
    this.synchronous = synchronous;
    this.before_paint = before_paint;
    this.after_paint = after_paint;
  }
}

class Actions extends CustomType {
  constructor(dispatch, emit, select, root, provide) {
    super();
    this.dispatch = dispatch;
    this.emit = emit;
    this.select = select;
    this.root = root;
    this.provide = provide;
  }
}
var empty = /* @__PURE__ */ new Effect(/* @__PURE__ */ toList([]), /* @__PURE__ */ toList([]), /* @__PURE__ */ toList([]));
function perform(effect, dispatch, emit, select, root, provide) {
  let actions = new Actions(dispatch, emit, select, root, provide);
  return each(effect.synchronous, (run2) => {
    return run2(actions);
  });
}
function none() {
  return empty;
}
function from2(effect) {
  let task = (actions) => {
    let dispatch = actions.dispatch;
    return effect(dispatch);
  };
  return new Effect(toList([task]), empty.before_paint, empty.after_paint);
}
function before_paint(effect) {
  let task = (actions) => {
    let root = actions.root();
    let dispatch = actions.dispatch;
    return effect(dispatch, root);
  };
  return new Effect(empty.synchronous, toList([task]), empty.after_paint);
}
function after_paint(effect) {
  let task = (actions) => {
    let root = actions.root();
    let dispatch = actions.dispatch;
    return effect(dispatch, root);
  };
  return new Effect(empty.synchronous, empty.before_paint, toList([task]));
}
function event2(name2, data2) {
  let task = (actions) => {
    return actions.emit(name2, data2);
  };
  return new Effect(toList([task]), empty.before_paint, empty.after_paint);
}
function provide(key, value) {
  let task = (actions) => {
    return actions.provide(key, value);
  };
  return new Effect(toList([task]), empty.before_paint, empty.after_paint);
}
function batch(effects) {
  return fold2(effects, empty, (acc, eff) => {
    return new Effect(fold2(eff.synchronous, acc.synchronous, prepend2), fold2(eff.before_paint, acc.before_paint, prepend2), fold2(eff.after_paint, acc.after_paint, prepend2));
  });
}

// build/dev/javascript/lustre/lustre/internals/mutable_map.ffi.mjs
function empty2() {
  return null;
}
function get2(map5, key) {
  return map5?.get(key);
}
function get_or_compute(map5, key, compute) {
  return map5?.get(key) ?? compute();
}
function has_key(map5, key) {
  return map5 && map5.has(key);
}
function insert2(map5, key, value) {
  map5 ??= new Map;
  map5.set(key, value);
  return map5;
}
function remove(map5, key) {
  map5?.delete(key);
  return map5;
}

// build/dev/javascript/lustre/lustre/internals/ref.ffi.mjs
function sameValueZero(x, y) {
  if (typeof x === "number" && typeof y === "number") {
    return x === y || x !== x && y !== y;
  }
  return x === y;
}

// build/dev/javascript/lustre/lustre/internals/ref.mjs
function equal_lists(loop$xs, loop$ys) {
  while (true) {
    let xs = loop$xs;
    let ys = loop$ys;
    if (xs instanceof Empty) {
      if (ys instanceof Empty) {
        return true;
      } else {
        return false;
      }
    } else if (ys instanceof Empty) {
      return false;
    } else {
      let x = xs.head;
      let xs$1 = xs.tail;
      let y = ys.head;
      let ys$1 = ys.tail;
      let $ = sameValueZero(x, y);
      if ($) {
        loop$xs = xs$1;
        loop$ys = ys$1;
      } else {
        return $;
      }
    }
  }
}

// build/dev/javascript/lustre/lustre/vdom/vnode.mjs
class Fragment extends CustomType {
  constructor(kind, key, children, keyed_children) {
    super();
    this.kind = kind;
    this.key = key;
    this.children = children;
    this.keyed_children = keyed_children;
  }
}
class Element extends CustomType {
  constructor(kind, key, namespace, tag, attributes, children, keyed_children, self_closing, void$) {
    super();
    this.kind = kind;
    this.key = key;
    this.namespace = namespace;
    this.tag = tag;
    this.attributes = attributes;
    this.children = children;
    this.keyed_children = keyed_children;
    this.self_closing = self_closing;
    this.void = void$;
  }
}
class Text extends CustomType {
  constructor(kind, key, content) {
    super();
    this.kind = kind;
    this.key = key;
    this.content = content;
  }
}
class UnsafeInnerHtml extends CustomType {
  constructor(kind, key, namespace, tag, attributes, inner_html) {
    super();
    this.kind = kind;
    this.key = key;
    this.namespace = namespace;
    this.tag = tag;
    this.attributes = attributes;
    this.inner_html = inner_html;
  }
}
class Map2 extends CustomType {
  constructor(kind, key, mapper, child) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.child = child;
  }
}
class Memo extends CustomType {
  constructor(kind, key, dependencies, view) {
    super();
    this.kind = kind;
    this.key = key;
    this.dependencies = dependencies;
    this.view = view;
  }
}
var fragment_kind = 0;
var element_kind = 1;
var text_kind = 2;
var unsafe_inner_html_kind = 3;
var map_kind = 4;
var memo_kind = 5;
function is_void_html_element(tag, namespace) {
  if (namespace === "") {
    if (tag === "area") {
      return true;
    } else if (tag === "base") {
      return true;
    } else if (tag === "br") {
      return true;
    } else if (tag === "col") {
      return true;
    } else if (tag === "embed") {
      return true;
    } else if (tag === "hr") {
      return true;
    } else if (tag === "img") {
      return true;
    } else if (tag === "input") {
      return true;
    } else if (tag === "link") {
      return true;
    } else if (tag === "meta") {
      return true;
    } else if (tag === "param") {
      return true;
    } else if (tag === "source") {
      return true;
    } else if (tag === "track") {
      return true;
    } else if (tag === "wbr") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function to_keyed(key, node) {
  if (node instanceof Fragment) {
    return new Fragment(node.kind, key, node.children, node.keyed_children);
  } else if (node instanceof Element) {
    return new Element(node.kind, key, node.namespace, node.tag, node.attributes, node.children, node.keyed_children, node.self_closing, node.void);
  } else if (node instanceof Text) {
    return new Text(node.kind, key, node.content);
  } else if (node instanceof UnsafeInnerHtml) {
    return new UnsafeInnerHtml(node.kind, key, node.namespace, node.tag, node.attributes, node.inner_html);
  } else if (node instanceof Map2) {
    let child = node.child;
    return new Map2(node.kind, key, node.mapper, to_keyed(key, child));
  } else {
    let view = node.view;
    return new Memo(node.kind, key, node.dependencies, () => {
      return to_keyed(key, view());
    });
  }
}
function fragment(key, children, keyed_children) {
  return new Fragment(fragment_kind, key, children, keyed_children);
}
function element(key, namespace, tag, attributes, children, keyed_children, self_closing, void$) {
  return new Element(element_kind, key, namespace, tag, prepare(attributes), children, keyed_children, self_closing, void$);
}
function text(key, content) {
  return new Text(text_kind, key, content);
}
function unsafe_inner_html(key, namespace, tag, attributes, inner_html) {
  return new UnsafeInnerHtml(unsafe_inner_html_kind, key, namespace, tag, prepare(attributes), inner_html);
}
function map5(element2, mapper) {
  if (element2 instanceof Map2) {
    let child_mapper = element2.mapper;
    return new Map2(map_kind, element2.key, (handler) => {
      return identity2(mapper)(child_mapper(handler));
    }, identity2(element2.child));
  } else {
    return new Map2(map_kind, element2.key, identity2(mapper), identity2(element2));
  }
}
function memo(key, dependencies, view) {
  return new Memo(memo_kind, key, dependencies, view);
}

// build/dev/javascript/lustre/lustre/element.mjs
function element2(tag, attributes, children) {
  return element("", "", tag, attributes, children, empty2(), false, is_void_html_element(tag, ""));
}
function namespaced(namespace, tag, attributes, children) {
  return element("", namespace, tag, attributes, children, empty2(), false, is_void_html_element(tag, namespace));
}
function text2(content) {
  return text("", content);
}
function none2() {
  return text("", "");
}
function fragment2(children) {
  return fragment("", children, empty2());
}
function unsafe_raw_html(namespace, tag, attributes, inner_html) {
  return unsafe_inner_html("", namespace, tag, attributes, inner_html);
}
function memo2(dependencies, view) {
  return memo("", dependencies, view);
}
function ref(value) {
  return identity2(value);
}
function map6(element3, f) {
  return map5(element3, f);
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function text3(content) {
  return text2(content);
}
function style2(attrs, css) {
  return unsafe_raw_html("", "style", attrs, css);
}
function div(attrs, children) {
  return element2("div", attrs, children);
}
function svg(attrs, children) {
  return namespaced("http://www.w3.org/2000/svg", "svg", attrs, children);
}
function slot(attrs, fallback) {
  return element2("slot", attrs, fallback);
}

// build/dev/javascript/gleam_stdlib/gleam/set.mjs
class Set2 extends CustomType {
  constructor(dict3) {
    super();
    this.dict = dict3;
  }
}
var token = undefined;
function new$2() {
  return new Set2(make());
}
function size3(set) {
  return size(set.dict);
}
function contains2(set, member) {
  let _pipe = set.dict;
  let _pipe$1 = get(_pipe, member);
  return is_ok(_pipe$1);
}
function delete$2(set, member) {
  return new Set2(delete$(set.dict, member));
}
function fold3(set, initial, reducer) {
  return fold(set.dict, initial, (a, k, _) => {
    return reducer(a, k);
  });
}
function insert3(set, member) {
  return new Set2(insert(set.dict, member, token));
}
function from_list2(members) {
  let dict3 = fold2(members, make(), (m, k) => {
    return insert(m, k, token);
  });
  return new Set2(dict3);
}

// build/dev/javascript/lustre/lustre/vdom/patch.mjs
class Patch extends CustomType {
  constructor(index4, removed, changes, children) {
    super();
    this.index = index4;
    this.removed = removed;
    this.changes = changes;
    this.children = children;
  }
}
class ReplaceText extends CustomType {
  constructor(kind, content) {
    super();
    this.kind = kind;
    this.content = content;
  }
}
class ReplaceInnerHtml extends CustomType {
  constructor(kind, inner_html) {
    super();
    this.kind = kind;
    this.inner_html = inner_html;
  }
}
class Update extends CustomType {
  constructor(kind, added, removed) {
    super();
    this.kind = kind;
    this.added = added;
    this.removed = removed;
  }
}
class Move extends CustomType {
  constructor(kind, key, before) {
    super();
    this.kind = kind;
    this.key = key;
    this.before = before;
  }
}
class Replace extends CustomType {
  constructor(kind, index4, with$) {
    super();
    this.kind = kind;
    this.index = index4;
    this.with = with$;
  }
}
class Remove extends CustomType {
  constructor(kind, index4) {
    super();
    this.kind = kind;
    this.index = index4;
  }
}
class Insert extends CustomType {
  constructor(kind, children, before) {
    super();
    this.kind = kind;
    this.children = children;
    this.before = before;
  }
}
var replace_text_kind = 0;
var replace_inner_html_kind = 1;
var update_kind = 2;
var move_kind = 3;
var remove_kind = 4;
var replace_kind = 5;
var insert_kind = 6;
function new$4(index4, removed, changes, children) {
  return new Patch(index4, removed, changes, children);
}
function replace_text(content) {
  return new ReplaceText(replace_text_kind, content);
}
function replace_inner_html(inner_html) {
  return new ReplaceInnerHtml(replace_inner_html_kind, inner_html);
}
function update(added, removed) {
  return new Update(update_kind, added, removed);
}
function move(key, before) {
  return new Move(move_kind, key, before);
}
function remove2(index4) {
  return new Remove(remove_kind, index4);
}
function replace2(index4, with$) {
  return new Replace(replace_kind, index4, with$);
}
function insert4(children, before) {
  return new Insert(insert_kind, children, before);
}

// build/dev/javascript/lustre/lustre/runtime/transport.mjs
class Mount extends CustomType {
  constructor(kind, open_shadow_root, will_adopt_styles, observed_attributes, observed_properties, requested_contexts, provided_contexts, vdom, memos) {
    super();
    this.kind = kind;
    this.open_shadow_root = open_shadow_root;
    this.will_adopt_styles = will_adopt_styles;
    this.observed_attributes = observed_attributes;
    this.observed_properties = observed_properties;
    this.requested_contexts = requested_contexts;
    this.provided_contexts = provided_contexts;
    this.vdom = vdom;
    this.memos = memos;
  }
}
class Reconcile extends CustomType {
  constructor(kind, patch, memos) {
    super();
    this.kind = kind;
    this.patch = patch;
    this.memos = memos;
  }
}
class Emit extends CustomType {
  constructor(kind, name2, data2) {
    super();
    this.kind = kind;
    this.name = name2;
    this.data = data2;
  }
}
class Provide extends CustomType {
  constructor(kind, key, value) {
    super();
    this.kind = kind;
    this.key = key;
    this.value = value;
  }
}
class Batch extends CustomType {
  constructor(kind, messages) {
    super();
    this.kind = kind;
    this.messages = messages;
  }
}
var ServerMessage$isBatch = (value) => value instanceof Batch;
class AttributeChanged extends CustomType {
  constructor(kind, name2, value) {
    super();
    this.kind = kind;
    this.name = name2;
    this.value = value;
  }
}
var ServerMessage$isAttributeChanged = (value) => value instanceof AttributeChanged;
class PropertyChanged extends CustomType {
  constructor(kind, name2, value) {
    super();
    this.kind = kind;
    this.name = name2;
    this.value = value;
  }
}
var ServerMessage$isPropertyChanged = (value) => value instanceof PropertyChanged;
class EventFired extends CustomType {
  constructor(kind, path, name2, event3) {
    super();
    this.kind = kind;
    this.path = path;
    this.name = name2;
    this.event = event3;
  }
}
var ServerMessage$isEventFired = (value) => value instanceof EventFired;
class ContextProvided extends CustomType {
  constructor(kind, key, value) {
    super();
    this.kind = kind;
    this.key = key;
    this.value = value;
  }
}
var ServerMessage$isContextProvided = (value) => value instanceof ContextProvided;
var mount_kind = 0;
var reconcile_kind = 1;
var emit_kind = 2;
var provide_kind = 3;
function mount(open_shadow_root, will_adopt_styles, observed_attributes, observed_properties, requested_contexts, provided_contexts, vdom, memos) {
  return new Mount(mount_kind, open_shadow_root, will_adopt_styles, observed_attributes, observed_properties, requested_contexts, provided_contexts, vdom, memos);
}
function reconcile(patch, memos) {
  return new Reconcile(reconcile_kind, patch, memos);
}
function emit(name2, data2) {
  return new Emit(emit_kind, name2, data2);
}
function provide2(key, value) {
  return new Provide(provide_kind, key, value);
}

// build/dev/javascript/lustre/lustre/vdom/path.mjs
class Root extends CustomType {
}

class Key extends CustomType {
  constructor(key, parent) {
    super();
    this.key = key;
    this.parent = parent;
  }
}

class Index extends CustomType {
  constructor(index4, parent) {
    super();
    this.index = index4;
    this.parent = parent;
  }
}

class Subtree extends CustomType {
  constructor(parent) {
    super();
    this.parent = parent;
  }
}
var root = /* @__PURE__ */ new Root;
var separator_element = "\t";
var separator_subtree = "\r";
var separator_event = `
`;
function do_matches(loop$path, loop$candidates) {
  while (true) {
    let path = loop$path;
    let candidates = loop$candidates;
    if (candidates instanceof Empty) {
      return false;
    } else {
      let candidate = candidates.head;
      let rest = candidates.tail;
      let $ = starts_with(path, candidate);
      if ($) {
        return $;
      } else {
        loop$path = path;
        loop$candidates = rest;
      }
    }
  }
}
function add2(parent, index4, key) {
  if (key === "") {
    return new Index(index4, parent);
  } else {
    return new Key(key, parent);
  }
}
function subtree(path) {
  return new Subtree(path);
}
function finish_to_string(acc) {
  if (acc instanceof Empty) {
    return "";
  } else {
    let segments = acc.tail;
    return concat2(segments);
  }
}
function split_subtree_path(path) {
  return split2(path, separator_subtree);
}
function do_to_string(loop$full, loop$path, loop$acc) {
  while (true) {
    let full = loop$full;
    let path = loop$path;
    let acc = loop$acc;
    if (path instanceof Root) {
      return finish_to_string(acc);
    } else if (path instanceof Key) {
      let key = path.key;
      let parent = path.parent;
      loop$full = full;
      loop$path = parent;
      loop$acc = prepend(separator_element, prepend(key, acc));
    } else if (path instanceof Index) {
      let index4 = path.index;
      let parent = path.parent;
      let acc$1 = prepend(separator_element, prepend(to_string(index4), acc));
      loop$full = full;
      loop$path = parent;
      loop$acc = acc$1;
    } else if (!full) {
      return finish_to_string(acc);
    } else {
      let parent = path.parent;
      if (acc instanceof Empty) {
        loop$full = full;
        loop$path = parent;
        loop$acc = acc;
      } else {
        let acc$1 = acc.tail;
        loop$full = full;
        loop$path = parent;
        loop$acc = prepend(separator_subtree, acc$1);
      }
    }
  }
}
function child(path) {
  return do_to_string(false, path, empty_list);
}
function to_string4(path) {
  return do_to_string(true, path, empty_list);
}
function matches(path, candidates) {
  if (candidates instanceof Empty) {
    return false;
  } else {
    return do_matches(to_string4(path), candidates);
  }
}
function event3(path, event4) {
  return do_to_string(false, path, prepend(separator_event, prepend(event4, empty_list)));
}

// build/dev/javascript/lustre/lustre/vdom/cache.mjs
class Cache extends CustomType {
  constructor(events, vdoms, old_vdoms, dispatched_paths, next_dispatched_paths) {
    super();
    this.events = events;
    this.vdoms = vdoms;
    this.old_vdoms = old_vdoms;
    this.dispatched_paths = dispatched_paths;
    this.next_dispatched_paths = next_dispatched_paths;
  }
}

class Events extends CustomType {
  constructor(handlers, children) {
    super();
    this.handlers = handlers;
    this.children = children;
  }
}

class Child extends CustomType {
  constructor(mapper, events) {
    super();
    this.mapper = mapper;
    this.events = events;
  }
}

class AddedChildren extends CustomType {
  constructor(handlers, children, vdoms) {
    super();
    this.handlers = handlers;
    this.children = children;
    this.vdoms = vdoms;
  }
}

class DecodedEvent extends CustomType {
  constructor(path, handler) {
    super();
    this.path = path;
    this.handler = handler;
  }
}

class DispatchedEvent extends CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
function compose_mapper(mapper, child_mapper) {
  return (msg) => {
    return mapper(child_mapper(msg));
  };
}
function new_events() {
  return new Events(empty2(), empty2());
}
function new$5() {
  return new Cache(new_events(), empty2(), empty2(), empty_list, empty_list);
}
function tick(cache) {
  return new Cache(cache.events, empty2(), cache.vdoms, cache.next_dispatched_paths, empty_list);
}
function events(cache) {
  return cache.events;
}
function update_events(cache, events2) {
  return new Cache(events2, cache.vdoms, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths);
}
function memos(cache) {
  return cache.vdoms;
}
function get_old_memo(cache, old, new$6) {
  return get_or_compute(cache.old_vdoms, old, new$6);
}
function keep_memo(cache, old, new$6) {
  let node = get_or_compute(cache.old_vdoms, old, new$6);
  let vdoms = insert2(cache.vdoms, new$6, node);
  return new Cache(cache.events, vdoms, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths);
}
function add_memo(cache, new$6, node) {
  let vdoms = insert2(cache.vdoms, new$6, node);
  return new Cache(cache.events, vdoms, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths);
}
function get_subtree(events2, path, old_mapper) {
  let child2 = get_or_compute(events2.children, path, () => {
    return new Child(old_mapper, new_events());
  });
  return child2.events;
}
function update_subtree(parent, path, mapper, events2) {
  let new_child = new Child(mapper, events2);
  let children = insert2(parent.children, path, new_child);
  return new Events(parent.handlers, children);
}
function do_add_event(handlers, path, name2, handler) {
  return insert2(handlers, event3(path, name2), handler);
}
function add_event(events2, path, name2, handler) {
  let handlers = do_add_event(events2.handlers, path, name2, handler);
  return new Events(handlers, events2.children);
}
function do_remove_event(handlers, path, name2) {
  return remove(handlers, event3(path, name2));
}
function remove_event(events2, path, name2) {
  let handlers = do_remove_event(events2.handlers, path, name2);
  return new Events(handlers, events2.children);
}
function add_attributes(handlers, path, attributes) {
  return fold2(attributes, handlers, (events2, attribute3) => {
    if (attribute3 instanceof Event2) {
      let name2 = attribute3.name;
      let handler = attribute3.handler;
      return do_add_event(events2, path, name2, handler);
    } else {
      return events2;
    }
  });
}
function do_add_children(loop$handlers, loop$children, loop$vdoms, loop$parent, loop$child_index, loop$nodes) {
  while (true) {
    let handlers = loop$handlers;
    let children = loop$children;
    let vdoms = loop$vdoms;
    let parent = loop$parent;
    let child_index = loop$child_index;
    let nodes = loop$nodes;
    let next = child_index + 1;
    if (nodes instanceof Empty) {
      return new AddedChildren(handlers, children, vdoms);
    } else {
      let $ = nodes.head;
      if ($ instanceof Fragment) {
        let rest = nodes.tail;
        let key = $.key;
        let nodes$1 = $.children;
        let path = add2(parent, child_index, key);
        let $1 = do_add_children(handlers, children, vdoms, path, 0, nodes$1);
        let handlers$1;
        let children$1;
        let vdoms$1;
        handlers$1 = $1.handlers;
        children$1 = $1.children;
        vdoms$1 = $1.vdoms;
        loop$handlers = handlers$1;
        loop$children = children$1;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof Element) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let nodes$1 = $.children;
        let path = add2(parent, child_index, key);
        let handlers$1 = add_attributes(handlers, path, attributes);
        let $1 = do_add_children(handlers$1, children, vdoms, path, 0, nodes$1);
        let handlers$2;
        let children$1;
        let vdoms$1;
        handlers$2 = $1.handlers;
        children$1 = $1.children;
        vdoms$1 = $1.vdoms;
        loop$handlers = handlers$2;
        loop$children = children$1;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof Text) {
        let rest = nodes.tail;
        loop$handlers = handlers;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof UnsafeInnerHtml) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let path = add2(parent, child_index, key);
        let handlers$1 = add_attributes(handlers, path, attributes);
        loop$handlers = handlers$1;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof Map2) {
        let rest = nodes.tail;
        let key = $.key;
        let mapper = $.mapper;
        let child2 = $.child;
        let path = add2(parent, child_index, key);
        let added = do_add_children(empty2(), empty2(), vdoms, subtree(path), 0, prepend(child2, empty_list));
        let vdoms$1 = added.vdoms;
        let child_events = new Events(added.handlers, added.children);
        let child$1 = new Child(mapper, child_events);
        let children$1 = insert2(children, child(path), child$1);
        loop$handlers = handlers;
        loop$children = children$1;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else {
        let rest = nodes.tail;
        let view = $.view;
        let child_node = view();
        let vdoms$1 = insert2(vdoms, view, child_node);
        let next$1 = child_index;
        let rest$1 = prepend(child_node, rest);
        loop$handlers = handlers;
        loop$children = children;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next$1;
        loop$nodes = rest$1;
      }
    }
  }
}
function add_children(cache, events2, path, child_index, nodes) {
  let vdoms = cache.vdoms;
  let handlers;
  let children;
  handlers = events2.handlers;
  children = events2.children;
  let $ = do_add_children(handlers, children, vdoms, path, child_index, nodes);
  let handlers$1;
  let children$1;
  let vdoms$1;
  handlers$1 = $.handlers;
  children$1 = $.children;
  vdoms$1 = $.vdoms;
  return [
    new Cache(cache.events, vdoms$1, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths),
    new Events(handlers$1, children$1)
  ];
}
function add_child(cache, events2, parent, index4, child2) {
  let children = prepend(child2, empty_list);
  return add_children(cache, events2, parent, index4, children);
}
function from_node(root2) {
  let cache = new$5();
  let $ = add_child(cache, cache.events, root, 0, root2);
  let cache$1;
  let events$1;
  cache$1 = $[0];
  events$1 = $[1];
  return new Cache(events$1, cache$1.vdoms, cache$1.old_vdoms, cache$1.dispatched_paths, cache$1.next_dispatched_paths);
}
function remove_attributes(handlers, path, attributes) {
  return fold2(attributes, handlers, (events2, attribute3) => {
    if (attribute3 instanceof Event2) {
      let name2 = attribute3.name;
      return do_remove_event(events2, path, name2);
    } else {
      return events2;
    }
  });
}
function do_remove_children(loop$handlers, loop$children, loop$vdoms, loop$parent, loop$index, loop$nodes) {
  while (true) {
    let handlers = loop$handlers;
    let children = loop$children;
    let vdoms = loop$vdoms;
    let parent = loop$parent;
    let index4 = loop$index;
    let nodes = loop$nodes;
    let next = index4 + 1;
    if (nodes instanceof Empty) {
      return new Events(handlers, children);
    } else {
      let $ = nodes.head;
      if ($ instanceof Fragment) {
        let rest = nodes.tail;
        let key = $.key;
        let nodes$1 = $.children;
        let path = add2(parent, index4, key);
        let $1 = do_remove_children(handlers, children, vdoms, path, 0, nodes$1);
        let handlers$1;
        let children$1;
        handlers$1 = $1.handlers;
        children$1 = $1.children;
        loop$handlers = handlers$1;
        loop$children = children$1;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof Element) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let nodes$1 = $.children;
        let path = add2(parent, index4, key);
        let handlers$1 = remove_attributes(handlers, path, attributes);
        let $1 = do_remove_children(handlers$1, children, vdoms, path, 0, nodes$1);
        let handlers$2;
        let children$1;
        handlers$2 = $1.handlers;
        children$1 = $1.children;
        loop$handlers = handlers$2;
        loop$children = children$1;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof Text) {
        let rest = nodes.tail;
        loop$handlers = handlers;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof UnsafeInnerHtml) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let path = add2(parent, index4, key);
        let handlers$1 = remove_attributes(handlers, path, attributes);
        loop$handlers = handlers$1;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof Map2) {
        let rest = nodes.tail;
        let key = $.key;
        let path = add2(parent, index4, key);
        let children$1 = remove(children, child(path));
        loop$handlers = handlers;
        loop$children = children$1;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else {
        let rest = nodes.tail;
        let view = $.view;
        let $1 = has_key(vdoms, view);
        if ($1) {
          let child2 = get2(vdoms, view);
          let nodes$1 = prepend(child2, rest);
          loop$handlers = handlers;
          loop$children = children;
          loop$vdoms = vdoms;
          loop$parent = parent;
          loop$index = index4;
          loop$nodes = nodes$1;
        } else {
          loop$handlers = handlers;
          loop$children = children;
          loop$vdoms = vdoms;
          loop$parent = parent;
          loop$index = next;
          loop$nodes = rest;
        }
      }
    }
  }
}
function remove_child(cache, events2, parent, child_index, child2) {
  return do_remove_children(events2.handlers, events2.children, cache.old_vdoms, parent, child_index, prepend(child2, empty_list));
}
function replace_child(cache, events2, parent, child_index, prev, next) {
  let events$1 = remove_child(cache, events2, parent, child_index, prev);
  return add_child(cache, events$1, parent, child_index, next);
}
function dispatch(cache, event4) {
  let next_dispatched_paths = prepend(event4.path, cache.next_dispatched_paths);
  let cache$1 = new Cache(cache.events, cache.vdoms, cache.old_vdoms, cache.dispatched_paths, next_dispatched_paths);
  if (event4 instanceof DecodedEvent) {
    let handler = event4.handler;
    return [cache$1, new Ok(handler)];
  } else {
    return [cache$1, error_nil];
  }
}
function has_dispatched_events(cache, path) {
  return matches(path, cache.dispatched_paths);
}
function get_handler(loop$events, loop$path, loop$mapper) {
  while (true) {
    let events2 = loop$events;
    let path = loop$path;
    let mapper = loop$mapper;
    if (path instanceof Empty) {
      return error_nil;
    } else {
      let $ = path.tail;
      if ($ instanceof Empty) {
        let key = path.head;
        let $1 = has_key(events2.handlers, key);
        if ($1) {
          let handler = get2(events2.handlers, key);
          return new Ok(map4(handler, (handler2) => {
            return new Handler(handler2.prevent_default, handler2.stop_propagation, identity2(mapper)(handler2.message));
          }));
        } else {
          return error_nil;
        }
      } else {
        let key = path.head;
        let path$1 = $;
        let $1 = has_key(events2.children, key);
        if ($1) {
          let child2 = get2(events2.children, key);
          let mapper$1 = compose_mapper(mapper, child2.mapper);
          loop$events = child2.events;
          loop$path = path$1;
          loop$mapper = mapper$1;
        } else {
          return error_nil;
        }
      }
    }
  }
}
function decode2(cache, path, name2, event4) {
  let parts = split_subtree_path(path + separator_event + name2);
  let $ = get_handler(cache.events, parts, identity2);
  if ($ instanceof Ok) {
    let handler = $[0];
    let $1 = run(event4, handler);
    if ($1 instanceof Ok) {
      let handler$1 = $1[0];
      return new DecodedEvent(path, handler$1);
    } else {
      return new DispatchedEvent(path);
    }
  } else {
    return new DispatchedEvent(path);
  }
}
function handle(cache, path, name2, event4) {
  let _pipe = decode2(cache, path, name2, event4);
  return ((_capture) => {
    return dispatch(cache, _capture);
  })(_pipe);
}

// build/dev/javascript/lustre/lustre/runtime/server/runtime.mjs
class ClientDispatchedMessage extends CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
var Message$isClientDispatchedMessage = (value) => value instanceof ClientDispatchedMessage;
class ClientRegisteredCallback extends CustomType {
  constructor(callback) {
    super();
    this.callback = callback;
  }
}
var Message$isClientRegisteredCallback = (value) => value instanceof ClientRegisteredCallback;
class ClientDeregisteredCallback extends CustomType {
  constructor(callback) {
    super();
    this.callback = callback;
  }
}
var Message$isClientDeregisteredCallback = (value) => value instanceof ClientDeregisteredCallback;
class EffectDispatchedMessage extends CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
var Message$EffectDispatchedMessage = (message) => new EffectDispatchedMessage(message);
var Message$isEffectDispatchedMessage = (value) => value instanceof EffectDispatchedMessage;
class EffectEmitEvent extends CustomType {
  constructor(name2, data2) {
    super();
    this.name = name2;
    this.data = data2;
  }
}
var Message$EffectEmitEvent = (name2, data2) => new EffectEmitEvent(name2, data2);
var Message$isEffectEmitEvent = (value) => value instanceof EffectEmitEvent;
class EffectProvidedValue extends CustomType {
  constructor(key, value) {
    super();
    this.key = key;
    this.value = value;
  }
}
var Message$EffectProvidedValue = (key, value) => new EffectProvidedValue(key, value);
var Message$isEffectProvidedValue = (value) => value instanceof EffectProvidedValue;
class SystemRequestedShutdown extends CustomType {
}
var Message$isSystemRequestedShutdown = (value) => value instanceof SystemRequestedShutdown;

// build/dev/javascript/lustre/lustre/runtime/app.mjs
class App extends CustomType {
  constructor(name2, init, update2, view, config2) {
    super();
    this.name = name2;
    this.init = init;
    this.update = update2;
    this.view = view;
    this.config = config2;
  }
}
class Config2 extends CustomType {
  constructor(open_shadow_root, adopt_styles, delegates_focus, attributes, properties, contexts, is_form_associated, on_form_autofill, on_form_reset, on_form_restore, on_connect, on_adopt, on_disconnect) {
    super();
    this.open_shadow_root = open_shadow_root;
    this.adopt_styles = adopt_styles;
    this.delegates_focus = delegates_focus;
    this.attributes = attributes;
    this.properties = properties;
    this.contexts = contexts;
    this.is_form_associated = is_form_associated;
    this.on_form_autofill = on_form_autofill;
    this.on_form_reset = on_form_reset;
    this.on_form_restore = on_form_restore;
    this.on_connect = on_connect;
    this.on_adopt = on_adopt;
    this.on_disconnect = on_disconnect;
  }
}
class Option extends CustomType {
  constructor(apply) {
    super();
    this.apply = apply;
  }
}
var default_config = /* @__PURE__ */ new Config2(true, true, false, empty_list, empty_list, empty_list, false, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None);
function configure(options) {
  return fold2(options, default_config, (config2, option) => {
    return option.apply(config2);
  });
}

// build/dev/javascript/lustre/lustre/internals/equals.ffi.mjs
var isEqual2 = (a, b) => {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  const type = typeof a;
  if (type !== typeof b) {
    return false;
  }
  if (type !== "object") {
    return false;
  }
  const ctor = a.constructor;
  if (ctor !== b.constructor) {
    return false;
  }
  if (Array.isArray(a)) {
    return areArraysEqual(a, b);
  }
  return areObjectsEqual(a, b);
};
var areArraysEqual = (a, b) => {
  let index4 = a.length;
  if (index4 !== b.length) {
    return false;
  }
  while (index4--) {
    if (!isEqual2(a[index4], b[index4])) {
      return false;
    }
  }
  return true;
};
var areObjectsEqual = (a, b) => {
  const properties = Object.keys(a);
  let index4 = properties.length;
  if (Object.keys(b).length !== index4) {
    return false;
  }
  while (index4--) {
    const property3 = properties[index4];
    if (!Object.hasOwn(b, property3)) {
      return false;
    }
    if (!isEqual2(a[property3], b[property3])) {
      return false;
    }
  }
  return true;
};

// build/dev/javascript/lustre/lustre/vdom/diff.mjs
class Diff extends CustomType {
  constructor(patch, cache) {
    super();
    this.patch = patch;
    this.cache = cache;
  }
}
class PartialDiff extends CustomType {
  constructor(patch, cache, events2) {
    super();
    this.patch = patch;
    this.cache = cache;
    this.events = events2;
  }
}

class AttributeChange extends CustomType {
  constructor(added, removed, events2) {
    super();
    this.added = added;
    this.removed = removed;
    this.events = events2;
  }
}
function is_controlled(cache, namespace, tag, path) {
  if (tag === "input" && namespace === "") {
    return has_dispatched_events(cache, path);
  } else if (tag === "select" && namespace === "") {
    return has_dispatched_events(cache, path);
  } else if (tag === "textarea" && namespace === "") {
    return has_dispatched_events(cache, path);
  } else {
    return false;
  }
}
function diff_attributes(loop$controlled, loop$path, loop$events, loop$old, loop$new, loop$added, loop$removed) {
  while (true) {
    let controlled = loop$controlled;
    let path = loop$path;
    let events2 = loop$events;
    let old = loop$old;
    let new$6 = loop$new;
    let added = loop$added;
    let removed = loop$removed;
    if (old instanceof Empty) {
      if (new$6 instanceof Empty) {
        return new AttributeChange(added, removed, events2);
      } else {
        let $ = new$6.head;
        if ($ instanceof Event2) {
          let next = $;
          let new$1 = new$6.tail;
          let name2 = $.name;
          let handler = $.handler;
          let events$1 = add_event(events2, path, name2, handler);
          let added$1 = prepend(next, added);
          loop$controlled = controlled;
          loop$path = path;
          loop$events = events$1;
          loop$old = old;
          loop$new = new$1;
          loop$added = added$1;
          loop$removed = removed;
        } else {
          let next = $;
          let new$1 = new$6.tail;
          let added$1 = prepend(next, added);
          loop$controlled = controlled;
          loop$path = path;
          loop$events = events2;
          loop$old = old;
          loop$new = new$1;
          loop$added = added$1;
          loop$removed = removed;
        }
      }
    } else if (new$6 instanceof Empty) {
      let $ = old.head;
      if ($ instanceof Event2) {
        let prev = $;
        let old$1 = old.tail;
        let name2 = $.name;
        let events$1 = remove_event(events2, path, name2);
        let removed$1 = prepend(prev, removed);
        loop$controlled = controlled;
        loop$path = path;
        loop$events = events$1;
        loop$old = old$1;
        loop$new = new$6;
        loop$added = added;
        loop$removed = removed$1;
      } else {
        let prev = $;
        let old$1 = old.tail;
        let removed$1 = prepend(prev, removed);
        loop$controlled = controlled;
        loop$path = path;
        loop$events = events2;
        loop$old = old$1;
        loop$new = new$6;
        loop$added = added;
        loop$removed = removed$1;
      }
    } else {
      let prev = old.head;
      let remaining_old = old.tail;
      let next = new$6.head;
      let remaining_new = new$6.tail;
      let $ = compare3(prev, next);
      if ($ instanceof Lt) {
        if (prev instanceof Event2) {
          let name2 = prev.name;
          loop$controlled = controlled;
          loop$path = path;
          loop$events = remove_event(events2, path, name2);
          loop$old = remaining_old;
          loop$new = new$6;
          loop$added = added;
          loop$removed = prepend(prev, removed);
        } else {
          loop$controlled = controlled;
          loop$path = path;
          loop$events = events2;
          loop$old = remaining_old;
          loop$new = new$6;
          loop$added = added;
          loop$removed = prepend(prev, removed);
        }
      } else if ($ instanceof Eq) {
        if (prev instanceof Attribute) {
          if (next instanceof Attribute) {
            let _block;
            let $1 = next.name;
            if ($1 === "value") {
              _block = controlled || prev.value !== next.value;
            } else if ($1 === "checked") {
              _block = controlled || prev.value !== next.value;
            } else if ($1 === "selected") {
              _block = controlled || prev.value !== next.value;
            } else {
              _block = prev.value !== next.value;
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (next instanceof Event2) {
            let name2 = next.name;
            let handler = next.handler;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = add_event(events2, path, name2, handler);
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          } else {
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          }
        } else if (prev instanceof Property) {
          if (next instanceof Property) {
            let _block;
            let $1 = next.name;
            if ($1 === "scrollLeft") {
              _block = true;
            } else if ($1 === "scrollRight") {
              _block = true;
            } else if ($1 === "value") {
              _block = controlled || !isEqual2(prev.value, next.value);
            } else if ($1 === "checked") {
              _block = controlled || !isEqual2(prev.value, next.value);
            } else if ($1 === "selected") {
              _block = controlled || !isEqual2(prev.value, next.value);
            } else {
              _block = !isEqual2(prev.value, next.value);
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (next instanceof Event2) {
            let name2 = next.name;
            let handler = next.handler;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = add_event(events2, path, name2, handler);
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          } else {
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          }
        } else if (next instanceof Event2) {
          let name2 = next.name;
          let handler = next.handler;
          let has_changes = prev.prevent_default.kind !== next.prevent_default.kind || prev.stop_propagation.kind !== next.stop_propagation.kind || prev.debounce !== next.debounce || prev.throttle !== next.throttle;
          let _block;
          if (has_changes) {
            _block = prepend(next, added);
          } else {
            _block = added;
          }
          let added$1 = _block;
          loop$controlled = controlled;
          loop$path = path;
          loop$events = add_event(events2, path, name2, handler);
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = added$1;
          loop$removed = removed;
        } else {
          let name2 = prev.name;
          loop$controlled = controlled;
          loop$path = path;
          loop$events = remove_event(events2, path, name2);
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = prepend(next, added);
          loop$removed = prepend(prev, removed);
        }
      } else if (next instanceof Event2) {
        let name2 = next.name;
        let handler = next.handler;
        loop$controlled = controlled;
        loop$path = path;
        loop$events = add_event(events2, path, name2, handler);
        loop$old = old;
        loop$new = remaining_new;
        loop$added = prepend(next, added);
        loop$removed = removed;
      } else {
        loop$controlled = controlled;
        loop$path = path;
        loop$events = events2;
        loop$old = old;
        loop$new = remaining_new;
        loop$added = prepend(next, added);
        loop$removed = removed;
      }
    }
  }
}
function do_diff(loop$old, loop$old_keyed, loop$new, loop$new_keyed, loop$moved, loop$moved_offset, loop$removed, loop$node_index, loop$patch_index, loop$changes, loop$children, loop$path, loop$cache, loop$events) {
  while (true) {
    let old = loop$old;
    let old_keyed = loop$old_keyed;
    let new$6 = loop$new;
    let new_keyed = loop$new_keyed;
    let moved = loop$moved;
    let moved_offset = loop$moved_offset;
    let removed = loop$removed;
    let node_index = loop$node_index;
    let patch_index = loop$patch_index;
    let changes = loop$changes;
    let children = loop$children;
    let path = loop$path;
    let cache = loop$cache;
    let events2 = loop$events;
    if (old instanceof Empty) {
      if (new$6 instanceof Empty) {
        let patch = new Patch(patch_index, removed, changes, children);
        return new PartialDiff(patch, cache, events2);
      } else {
        let $ = add_children(cache, events2, path, node_index, new$6);
        let cache$1;
        let events$1;
        cache$1 = $[0];
        events$1 = $[1];
        let insert5 = insert4(new$6, node_index - moved_offset);
        let changes$1 = prepend(insert5, changes);
        let patch = new Patch(patch_index, removed, changes$1, children);
        return new PartialDiff(patch, cache$1, events$1);
      }
    } else if (new$6 instanceof Empty) {
      let prev = old.head;
      let old$1 = old.tail;
      let _block;
      let $ = prev.key === "" || !has_key(moved, prev.key);
      if ($) {
        _block = removed + 1;
      } else {
        _block = removed;
      }
      let removed$1 = _block;
      let events$1 = remove_child(cache, events2, path, node_index, prev);
      loop$old = old$1;
      loop$old_keyed = old_keyed;
      loop$new = new$6;
      loop$new_keyed = new_keyed;
      loop$moved = moved;
      loop$moved_offset = moved_offset;
      loop$removed = removed$1;
      loop$node_index = node_index;
      loop$patch_index = patch_index;
      loop$changes = changes;
      loop$children = children;
      loop$path = path;
      loop$cache = cache;
      loop$events = events$1;
    } else {
      let prev = old.head;
      let next = new$6.head;
      if (prev.key !== next.key) {
        let old_remaining = old.tail;
        let new_remaining = new$6.tail;
        let next_did_exist = has_key(old_keyed, next.key);
        let prev_does_exist = has_key(new_keyed, prev.key);
        if (prev_does_exist) {
          if (next_did_exist) {
            let $ = has_key(moved, prev.key);
            if ($) {
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new$6;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset - 1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            } else {
              let match = get2(old_keyed, next.key);
              let before = node_index - moved_offset;
              let changes$1 = prepend(move(next.key, before), changes);
              let moved$1 = insert2(moved, next.key, undefined);
              loop$old = prepend(match, old);
              loop$old_keyed = old_keyed;
              loop$new = new$6;
              loop$new_keyed = new_keyed;
              loop$moved = moved$1;
              loop$moved_offset = moved_offset + 1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$changes = changes$1;
              loop$children = children;
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            }
          } else {
            let before = node_index - moved_offset;
            let $ = add_child(cache, events2, path, node_index, next);
            let cache$1;
            let events$1;
            cache$1 = $[0];
            events$1 = $[1];
            let insert5 = insert4(toList([next]), before);
            let changes$1 = prepend(insert5, changes);
            loop$old = old;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset + 1;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes$1;
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if (next_did_exist) {
          let index4 = node_index - moved_offset;
          let changes$1 = prepend(remove2(index4), changes);
          let events$1 = remove_child(cache, events2, path, node_index, prev);
          loop$old = old_remaining;
          loop$old_keyed = old_keyed;
          loop$new = new$6;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset - 1;
          loop$removed = removed;
          loop$node_index = node_index;
          loop$patch_index = patch_index;
          loop$changes = changes$1;
          loop$children = children;
          loop$path = path;
          loop$cache = cache;
          loop$events = events$1;
        } else {
          let change = replace2(node_index - moved_offset, next);
          let $ = replace_child(cache, events2, path, node_index, prev, next);
          let cache$1;
          let events$1;
          cache$1 = $[0];
          events$1 = $[1];
          loop$old = old_remaining;
          loop$old_keyed = old_keyed;
          loop$new = new_remaining;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset;
          loop$removed = removed;
          loop$node_index = node_index + 1;
          loop$patch_index = patch_index;
          loop$changes = prepend(change, changes);
          loop$children = children;
          loop$path = path;
          loop$cache = cache$1;
          loop$events = events$1;
        }
      } else {
        let $ = old.head;
        if ($ instanceof Fragment) {
          let $1 = new$6.head;
          if ($1 instanceof Fragment) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$6.tail;
            let $2 = do_diff(prev2.children, prev2.keyed_children, next2.children, next2.keyed_children, empty2(), 0, 0, 0, node_index, empty_list, empty_list, add2(path, node_index, next2.key), cache, events2);
            let patch;
            let cache$1;
            let events$1;
            patch = $2.patch;
            cache$1 = $2.cache;
            events$1 = $2.events;
            let _block;
            let $3 = patch.changes;
            if ($3 instanceof Empty) {
              let $4 = patch.children;
              if ($4 instanceof Empty) {
                let $5 = patch.removed;
                if ($5 === 0) {
                  _block = children;
                } else {
                  _block = prepend(patch, children);
                }
              } else {
                _block = prepend(patch, children);
              }
            } else {
              _block = prepend(patch, children);
            }
            let children$1 = _block;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes;
            loop$children = children$1;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$6.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1;
            let events$1;
            cache$1 = $2[0];
            events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof Element) {
          let $1 = new$6.head;
          if ($1 instanceof Element) {
            let prev2 = $;
            let next2 = $1;
            if (prev2.namespace === next2.namespace && prev2.tag === next2.tag) {
              let old$1 = old.tail;
              let new$1 = new$6.tail;
              let child_path = add2(path, node_index, next2.key);
              let controlled = is_controlled(cache, next2.namespace, next2.tag, child_path);
              let $2 = diff_attributes(controlled, child_path, events2, prev2.attributes, next2.attributes, empty_list, empty_list);
              let added_attrs;
              let removed_attrs;
              let events$1;
              added_attrs = $2.added;
              removed_attrs = $2.removed;
              events$1 = $2.events;
              let _block;
              if (added_attrs instanceof Empty && removed_attrs instanceof Empty) {
                _block = empty_list;
              } else {
                _block = toList([update(added_attrs, removed_attrs)]);
              }
              let initial_child_changes = _block;
              let $3 = do_diff(prev2.children, prev2.keyed_children, next2.children, next2.keyed_children, empty2(), 0, 0, 0, node_index, initial_child_changes, empty_list, child_path, cache, events$1);
              let patch;
              let cache$1;
              let events$2;
              patch = $3.patch;
              cache$1 = $3.cache;
              events$2 = $3.events;
              let _block$1;
              let $4 = patch.changes;
              if ($4 instanceof Empty) {
                let $5 = patch.children;
                if ($5 instanceof Empty) {
                  let $6 = patch.removed;
                  if ($6 === 0) {
                    _block$1 = children;
                  } else {
                    _block$1 = prepend(patch, children);
                  }
                } else {
                  _block$1 = prepend(patch, children);
                }
              } else {
                _block$1 = prepend(patch, children);
              }
              let children$1 = _block$1;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children$1;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events$2;
            } else {
              let prev3 = $;
              let old_remaining = old.tail;
              let next3 = $1;
              let new_remaining = new$6.tail;
              let change = replace2(node_index - moved_offset, next3);
              let $2 = replace_child(cache, events2, path, node_index, prev3, next3);
              let cache$1;
              let events$1;
              cache$1 = $2[0];
              events$1 = $2[1];
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new_remaining;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = prepend(change, changes);
              loop$children = children;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events$1;
            }
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$6.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1;
            let events$1;
            cache$1 = $2[0];
            events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof Text) {
          let $1 = new$6.head;
          if ($1 instanceof Text) {
            let prev2 = $;
            let next2 = $1;
            if (prev2.content === next2.content) {
              let old$1 = old.tail;
              let new$1 = new$6.tail;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            } else {
              let old$1 = old.tail;
              let next3 = $1;
              let new$1 = new$6.tail;
              let child2 = new$4(node_index, 0, toList([replace_text(next3.content)]), empty_list);
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = prepend(child2, children);
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            }
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$6.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1;
            let events$1;
            cache$1 = $2[0];
            events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof UnsafeInnerHtml) {
          let $1 = new$6.head;
          if ($1 instanceof UnsafeInnerHtml) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$6.tail;
            let child_path = add2(path, node_index, next2.key);
            let $2 = diff_attributes(false, child_path, events2, prev2.attributes, next2.attributes, empty_list, empty_list);
            let added_attrs;
            let removed_attrs;
            let events$1;
            added_attrs = $2.added;
            removed_attrs = $2.removed;
            events$1 = $2.events;
            let _block;
            if (added_attrs instanceof Empty && removed_attrs instanceof Empty) {
              _block = empty_list;
            } else {
              _block = toList([update(added_attrs, removed_attrs)]);
            }
            let child_changes = _block;
            let _block$1;
            let $3 = prev2.inner_html === next2.inner_html;
            if ($3) {
              _block$1 = child_changes;
            } else {
              _block$1 = prepend(replace_inner_html(next2.inner_html), child_changes);
            }
            let child_changes$1 = _block$1;
            let _block$2;
            if (child_changes$1 instanceof Empty) {
              _block$2 = children;
            } else {
              _block$2 = prepend(new$4(node_index, 0, child_changes$1, toList([])), children);
            }
            let children$1 = _block$2;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes;
            loop$children = children$1;
            loop$path = path;
            loop$cache = cache;
            loop$events = events$1;
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$6.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1;
            let events$1;
            cache$1 = $2[0];
            events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof Map2) {
          let $1 = new$6.head;
          if ($1 instanceof Map2) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$6.tail;
            let child_path = add2(path, node_index, next2.key);
            let child_key = child(child_path);
            let $2 = do_diff(prepend(prev2.child, empty_list), empty2(), prepend(next2.child, empty_list), empty2(), empty2(), 0, 0, 0, node_index, empty_list, empty_list, subtree(child_path), cache, get_subtree(events2, child_key, prev2.mapper));
            let patch;
            let cache$1;
            let child_events;
            patch = $2.patch;
            cache$1 = $2.cache;
            child_events = $2.events;
            let events$1 = update_subtree(events2, child_key, next2.mapper, child_events);
            let _block;
            let $3 = patch.changes;
            if ($3 instanceof Empty) {
              let $4 = patch.children;
              if ($4 instanceof Empty) {
                let $5 = patch.removed;
                if ($5 === 0) {
                  _block = children;
                } else {
                  _block = prepend(patch, children);
                }
              } else {
                _block = prepend(patch, children);
              }
            } else {
              _block = prepend(patch, children);
            }
            let children$1 = _block;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes;
            loop$children = children$1;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$6.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1;
            let events$1;
            cache$1 = $2[0];
            events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else {
          let $1 = new$6.head;
          if ($1 instanceof Memo) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$6.tail;
            let $2 = equal_lists(prev2.dependencies, next2.dependencies);
            if ($2) {
              let cache$1 = keep_memo(cache, prev2.view, next2.view);
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events2;
            } else {
              let prev_node = get_old_memo(cache, prev2.view, prev2.view);
              let next_node = next2.view();
              let cache$1 = add_memo(cache, next2.view, next_node);
              loop$old = prepend(prev_node, old$1);
              loop$old_keyed = old_keyed;
              loop$new = prepend(next_node, new$1);
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events2;
            }
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$6.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1;
            let events$1;
            cache$1 = $2[0];
            events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        }
      }
    }
  }
}
function diff(cache, old, new$6) {
  let cache$1 = tick(cache);
  let $ = do_diff(prepend(old, empty_list), empty2(), prepend(new$6, empty_list), empty2(), empty2(), 0, 0, 0, 0, empty_list, empty_list, root, cache$1, events(cache$1));
  let patch;
  let cache$2;
  let events2;
  patch = $.patch;
  cache$2 = $.cache;
  events2 = $.events;
  return new Diff(patch, update_events(cache$2, events2));
}

// build/dev/javascript/lustre/lustre/internals/list.ffi.mjs
var toList2 = (arr) => arr.reduceRight((xs, x) => List$NonEmpty(x, xs), empty_list);
var iterate = (list4, callback) => {
  if (Array.isArray(list4)) {
    for (let i = 0;i < list4.length; i++) {
      callback(list4[i]);
    }
  } else if (list4) {
    for (list4;List$NonEmpty$rest(list4); list4 = List$NonEmpty$rest(list4)) {
      callback(List$NonEmpty$first(list4));
    }
  }
};
var append4 = (a, b) => {
  if (!List$NonEmpty$rest(a)) {
    return b;
  } else if (!List$NonEmpty$rest(b)) {
    return a;
  } else {
    return append2(a, b);
  }
};

// build/dev/javascript/lustre/lustre/internals/constants.ffi.mjs
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var SUPPORTS_MOVE_BEFORE = !!globalThis.HTMLElement?.prototype?.moveBefore;

// build/dev/javascript/lustre/lustre/vdom/reconciler.ffi.mjs
var setTimeout = globalThis.setTimeout;
var clearTimeout = globalThis.clearTimeout;
var createElementNS = (ns, name2) => globalThis.document.createElementNS(ns, name2);
var createTextNode = (data2) => globalThis.document.createTextNode(data2);
var createComment = (data2) => globalThis.document.createComment(data2);
var createDocumentFragment = () => globalThis.document.createDocumentFragment();
var insertBefore = (parent, node, reference) => parent.insertBefore(node, reference);
var moveBefore = SUPPORTS_MOVE_BEFORE ? (parent, node, reference) => parent.moveBefore(node, reference) : insertBefore;
var removeChild = (parent, child2) => parent.removeChild(child2);
var getAttribute = (node, name2) => node.getAttribute(name2);
var setAttribute = (node, name2, value) => node.setAttribute(name2, value);
var removeAttribute = (node, name2) => node.removeAttribute(name2);
var addEventListener = (node, name2, handler, options) => node.addEventListener(name2, handler, options);
var removeEventListener = (node, name2, handler) => node.removeEventListener(name2, handler);
var setInnerHtml = (node, innerHtml) => node.innerHTML = innerHtml;
var setData = (node, data2) => node.data = data2;
var meta = Symbol("lustre");

class MetadataNode {
  constructor(kind, parent, node, key) {
    this.kind = kind;
    this.key = key;
    this.parent = parent;
    this.children = [];
    this.node = node;
    this.endNode = null;
    this.handlers = new Map;
    this.throttles = new Map;
    this.debouncers = new Map;
  }
  get isVirtual() {
    return this.kind === fragment_kind || this.kind === map_kind;
  }
  get parentNode() {
    return this.isVirtual ? this.node.parentNode : this.node;
  }
}
var insertMetadataChild = (kind, parent, node, index4, key) => {
  const child2 = new MetadataNode(kind, parent, node, key);
  node[meta] = child2;
  parent?.children.splice(index4, 0, child2);
  return child2;
};
var getPath = (node) => {
  let path = "";
  for (let current = node[meta];current.parent; current = current.parent) {
    const separator = current.parent && current.parent.kind === map_kind ? separator_subtree : separator_element;
    if (current.key) {
      path = `${separator}${current.key}${path}`;
    } else {
      const index4 = current.parent.children.indexOf(current);
      path = `${separator}${index4}${path}`;
    }
  }
  return path.slice(1);
};

class Reconciler {
  #root = null;
  #decodeEvent;
  #dispatch;
  #debug = false;
  constructor(root2, decodeEvent, dispatch2, { debug = false } = {}) {
    this.#root = root2;
    this.#decodeEvent = decodeEvent;
    this.#dispatch = dispatch2;
    this.#debug = debug;
  }
  mount(vdom) {
    insertMetadataChild(element_kind, null, this.#root, 0, null);
    this.#insertChild(this.#root, null, this.#root[meta], 0, vdom);
  }
  push(patch, memos2 = null) {
    this.#memos = memos2;
    this.#stack.push({ node: this.#root[meta], patch });
    this.#reconcile();
  }
  #memos;
  #stack = [];
  #reconcile() {
    const stack = this.#stack;
    while (stack.length) {
      const { node, patch } = stack.pop();
      const { children: childNodes } = node;
      const { changes, removed, children: childPatches } = patch;
      iterate(changes, (change) => this.#patch(node, change));
      if (removed) {
        this.#removeChildren(node, childNodes.length - removed, removed);
      }
      iterate(childPatches, (childPatch) => {
        const child2 = childNodes[childPatch.index | 0];
        this.#stack.push({ node: child2, patch: childPatch });
      });
    }
  }
  #patch(node, change) {
    switch (change.kind) {
      case replace_text_kind:
        this.#replaceText(node, change);
        break;
      case replace_inner_html_kind:
        this.#replaceInnerHtml(node, change);
        break;
      case update_kind:
        this.#update(node, change);
        break;
      case move_kind:
        this.#move(node, change);
        break;
      case remove_kind:
        this.#remove(node, change);
        break;
      case replace_kind:
        this.#replace(node, change);
        break;
      case insert_kind:
        this.#insert(node, change);
        break;
    }
  }
  #insert(parent, { children, before }) {
    const fragment3 = createDocumentFragment();
    const beforeEl = this.#getReference(parent, before);
    this.#insertChildren(fragment3, null, parent, before | 0, children);
    insertBefore(parent.parentNode, fragment3, beforeEl);
  }
  #replace(parent, { index: index4, with: child2 }) {
    this.#removeChildren(parent, index4 | 0, 1);
    const beforeEl = this.#getReference(parent, index4);
    this.#insertChild(parent.parentNode, beforeEl, parent, index4 | 0, child2);
  }
  #getReference(node, index4) {
    index4 = index4 | 0;
    const { children } = node;
    const childCount = children.length;
    if (index4 < childCount)
      return children[index4].node;
    if (node.endNode)
      return node.endNode;
    if (!node.isVirtual)
      return null;
    while (node.isVirtual && node.children.length) {
      if (node.endNode)
        return node.endNode.nextSibling;
      node = node.children[node.children.length - 1];
    }
    return node.node.nextSibling;
  }
  #move(parent, { key, before }) {
    before = before | 0;
    const { children, parentNode } = parent;
    const beforeEl = children[before].node;
    let prev = children[before];
    for (let i = before + 1;i < children.length; ++i) {
      const next = children[i];
      children[i] = prev;
      prev = next;
      if (next.key === key) {
        children[before] = next;
        break;
      }
    }
    this.#moveChild(parentNode, prev, beforeEl);
  }
  #moveChildren(domParent, children, beforeEl) {
    for (let i = 0;i < children.length; ++i) {
      this.#moveChild(domParent, children[i], beforeEl);
    }
  }
  #moveChild(domParent, child2, beforeEl) {
    moveBefore(domParent, child2.node, beforeEl);
    if (child2.isVirtual) {
      this.#moveChildren(domParent, child2.children, beforeEl);
    }
    if (child2.endNode) {
      moveBefore(domParent, child2.endNode, beforeEl);
    }
  }
  #remove(parent, { index: index4 }) {
    this.#removeChildren(parent, index4, 1);
  }
  #removeChildren(parent, index4, count) {
    const { children, parentNode } = parent;
    const deleted = children.splice(index4, count);
    for (let i = 0;i < deleted.length; ++i) {
      const child2 = deleted[i];
      const { node, endNode, isVirtual, children: nestedChildren } = child2;
      removeChild(parentNode, node);
      if (endNode) {
        removeChild(parentNode, endNode);
      }
      this.#removeDebouncers(child2);
      if (isVirtual) {
        deleted.push(...nestedChildren);
      }
    }
  }
  #removeDebouncers(node) {
    const { debouncers, children } = node;
    for (const { timeout } of debouncers.values()) {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
    debouncers.clear();
    iterate(children, (child2) => this.#removeDebouncers(child2));
  }
  #update({ node, handlers, throttles, debouncers }, { added, removed }) {
    iterate(removed, ({ name: name2 }) => {
      if (handlers.delete(name2)) {
        removeEventListener(node, name2, handleEvent);
        this.#updateDebounceThrottle(throttles, name2, 0);
        this.#updateDebounceThrottle(debouncers, name2, 0);
      } else {
        removeAttribute(node, name2);
        SYNCED_ATTRIBUTES[name2]?.removed?.(node, name2);
      }
    });
    iterate(added, (attribute3) => this.#createAttribute(node, attribute3));
  }
  #replaceText({ node }, { content }) {
    setData(node, content ?? "");
  }
  #replaceInnerHtml({ node }, { inner_html }) {
    setInnerHtml(node, inner_html ?? "");
  }
  #insertChildren(domParent, beforeEl, metaParent, index4, children) {
    iterate(children, (child2) => this.#insertChild(domParent, beforeEl, metaParent, index4++, child2));
  }
  #insertChild(domParent, beforeEl, metaParent, index4, vnode) {
    switch (vnode.kind) {
      case element_kind: {
        const node = this.#createElement(metaParent, index4, vnode);
        this.#insertChildren(node, null, node[meta], 0, vnode.children);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case text_kind: {
        const node = this.#createTextNode(metaParent, index4, vnode);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case fragment_kind: {
        const marker = "lustre:fragment";
        const head = this.#createHead(marker, metaParent, index4, vnode);
        insertBefore(domParent, head, beforeEl);
        this.#insertChildren(domParent, beforeEl, head[meta], 0, vnode.children);
        if (this.#debug) {
          head[meta].endNode = createComment(` /${marker} `);
          insertBefore(domParent, head[meta].endNode, beforeEl);
        }
        break;
      }
      case unsafe_inner_html_kind: {
        const node = this.#createElement(metaParent, index4, vnode);
        this.#replaceInnerHtml({ node }, vnode);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case map_kind: {
        const head = this.#createHead("lustre:map", metaParent, index4, vnode);
        insertBefore(domParent, head, beforeEl);
        this.#insertChild(domParent, beforeEl, head[meta], 0, vnode.child);
        break;
      }
      case memo_kind: {
        const child2 = this.#memos?.get(vnode.view) ?? vnode.view();
        this.#insertChild(domParent, beforeEl, metaParent, index4, child2);
        break;
      }
    }
  }
  #createElement(parent, index4, { kind, key, tag, namespace, attributes }) {
    const node = createElementNS(namespace || NAMESPACE_HTML, tag);
    insertMetadataChild(kind, parent, node, index4, key);
    if (this.#debug && key) {
      setAttribute(node, "data-lustre-key", key);
    }
    iterate(attributes, (attribute3) => this.#createAttribute(node, attribute3));
    return node;
  }
  #createTextNode(parent, index4, { kind, key, content }) {
    const node = createTextNode(content ?? "");
    insertMetadataChild(kind, parent, node, index4, key);
    return node;
  }
  #createHead(marker, parent, index4, { kind, key }) {
    const node = this.#debug ? createComment(markerComment(marker, key)) : createTextNode("");
    insertMetadataChild(kind, parent, node, index4, key);
    return node;
  }
  #createAttribute(node, attribute3) {
    const { debouncers, handlers, throttles } = node[meta];
    const {
      kind,
      name: name2,
      value,
      prevent_default: prevent,
      debounce: debounceDelay,
      throttle: throttleDelay
    } = attribute3;
    switch (kind) {
      case attribute_kind: {
        const valueOrDefault = value ?? "";
        if (name2 === "virtual:defaultValue") {
          node.defaultValue = valueOrDefault;
          return;
        } else if (name2 === "virtual:defaultChecked") {
          node.defaultChecked = true;
          return;
        } else if (name2 === "virtual:defaultSelected") {
          node.defaultSelected = true;
          return;
        }
        if (valueOrDefault !== getAttribute(node, name2)) {
          setAttribute(node, name2, valueOrDefault);
        }
        SYNCED_ATTRIBUTES[name2]?.added?.(node, valueOrDefault);
        break;
      }
      case property_kind:
        node[name2] = value;
        break;
      case event_kind: {
        if (handlers.has(name2)) {
          removeEventListener(node, name2, handleEvent);
        }
        const passive = prevent.kind === never_kind;
        addEventListener(node, name2, handleEvent, { passive });
        this.#updateDebounceThrottle(throttles, name2, throttleDelay);
        this.#updateDebounceThrottle(debouncers, name2, debounceDelay);
        handlers.set(name2, (event4) => this.#handleEvent(attribute3, event4));
        break;
      }
    }
  }
  #updateDebounceThrottle(map7, name2, delay) {
    const debounceOrThrottle = map7.get(name2);
    if (delay > 0) {
      if (debounceOrThrottle) {
        debounceOrThrottle.delay = delay;
      } else {
        map7.set(name2, { delay });
      }
    } else if (debounceOrThrottle) {
      const { timeout } = debounceOrThrottle;
      if (timeout) {
        clearTimeout(timeout);
      }
      map7.delete(name2);
    }
  }
  #handleEvent(attribute3, event4) {
    const { currentTarget, type } = event4;
    const { debouncers, throttles } = currentTarget[meta];
    const path = getPath(currentTarget);
    const {
      prevent_default: prevent,
      stop_propagation: stop,
      include
    } = attribute3;
    if (prevent.kind === always_kind)
      event4.preventDefault();
    if (stop.kind === always_kind)
      event4.stopPropagation();
    if (type === "submit") {
      event4.detail ??= {};
      event4.detail.formData = [
        ...new FormData(event4.target, event4.submitter).entries()
      ];
    }
    const data2 = this.#decodeEvent(event4, path, type, include);
    const throttle = throttles.get(type);
    if (throttle) {
      const now = Date.now();
      const last = throttle.last || 0;
      if (now > last + throttle.delay) {
        throttle.last = now;
        throttle.lastEvent = event4;
        this.#dispatch(event4, data2);
      }
    }
    const debounce = debouncers.get(type);
    if (debounce) {
      clearTimeout(debounce.timeout);
      debounce.timeout = setTimeout(() => {
        if (event4 === throttles.get(type)?.lastEvent)
          return;
        this.#dispatch(event4, data2);
      }, debounce.delay);
    }
    if (!throttle && !debounce) {
      this.#dispatch(event4, data2);
    }
  }
}
var markerComment = (marker, key) => {
  if (key) {
    return ` ${marker} key="${escape2(key)}" `;
  } else {
    return ` ${marker} `;
  }
};
var handleEvent = (event4) => {
  const { currentTarget, type } = event4;
  const handler = currentTarget[meta].handlers.get(type);
  handler(event4);
};
var syncedBooleanAttribute = (name2) => {
  return {
    added(node) {
      node[name2] = true;
    },
    removed(node) {
      node[name2] = false;
    }
  };
};
var syncedAttribute = (name2) => {
  return {
    added(node, value) {
      node[name2] = value;
    }
  };
};
var SYNCED_ATTRIBUTES = {
  checked: syncedBooleanAttribute("checked"),
  selected: syncedBooleanAttribute("selected"),
  value: syncedAttribute("value"),
  autofocus: {
    added(node) {
      queueMicrotask(() => {
        node.focus?.();
      });
    }
  },
  autoplay: {
    added(node) {
      try {
        node.play?.();
      } catch (e) {
        console.error(e);
      }
    }
  }
};

// build/dev/javascript/lustre/lustre/element/keyed.mjs
function do_extract_keyed_children(loop$key_children_pairs, loop$keyed_children, loop$children) {
  while (true) {
    let key_children_pairs = loop$key_children_pairs;
    let keyed_children = loop$keyed_children;
    let children = loop$children;
    if (key_children_pairs instanceof Empty) {
      return [keyed_children, reverse(children)];
    } else {
      let rest = key_children_pairs.tail;
      let key = key_children_pairs.head[0];
      let element$1 = key_children_pairs.head[1];
      let keyed_element = to_keyed(key, element$1);
      let _block;
      if (key === "") {
        _block = keyed_children;
      } else {
        _block = insert2(keyed_children, key, keyed_element);
      }
      let keyed_children$1 = _block;
      let children$1 = prepend(keyed_element, children);
      loop$key_children_pairs = rest;
      loop$keyed_children = keyed_children$1;
      loop$children = children$1;
    }
  }
}
function extract_keyed_children(children) {
  return do_extract_keyed_children(children, empty2(), empty_list);
}
function element3(tag, attributes, children) {
  let $ = extract_keyed_children(children);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return element("", "", tag, attributes, children$1, keyed_children, false, is_void_html_element(tag, ""));
}
function namespaced2(namespace, tag, attributes, children) {
  let $ = extract_keyed_children(children);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return element("", namespace, tag, attributes, children$1, keyed_children, false, is_void_html_element(tag, namespace));
}
function fragment3(children) {
  let $ = extract_keyed_children(children);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return fragment("", children$1, keyed_children);
}

// build/dev/javascript/lustre/lustre/vdom/virtualise.ffi.mjs
var virtualise = (root2) => {
  const rootMeta = insertMetadataChild(element_kind, null, root2, 0, null);
  for (let child2 = root2.firstChild;child2; child2 = child2.nextSibling) {
    const result = virtualiseChild(rootMeta, root2, child2, 0);
    if (result)
      return result.vnode;
  }
  const placeholder = globalThis.document.createTextNode("");
  insertMetadataChild(text_kind, rootMeta, placeholder, 0, null);
  root2.insertBefore(placeholder, root2.firstChild);
  return none2();
};
var virtualiseChild = (meta2, domParent, child2, index4) => {
  if (child2.nodeType === COMMENT_NODE) {
    const data2 = child2.data.trim();
    if (data2.startsWith("lustre:fragment")) {
      return virtualiseFragment(meta2, domParent, child2, index4);
    }
    if (data2.startsWith("lustre:map")) {
      return virtualiseMap(meta2, domParent, child2, index4);
    }
    if (data2.startsWith("lustre:memo")) {
      return virtualiseMemo(meta2, domParent, child2, index4);
    }
    return null;
  }
  if (child2.nodeType === ELEMENT_NODE) {
    return virtualiseElement(meta2, child2, index4);
  }
  if (child2.nodeType === TEXT_NODE) {
    return virtualiseText(meta2, child2, index4);
  }
  return null;
};
var virtualiseElement = (metaParent, node, index4) => {
  const key = node.getAttribute("data-lustre-key") ?? "";
  if (key) {
    node.removeAttribute("data-lustre-key");
  }
  const meta2 = insertMetadataChild(element_kind, metaParent, node, index4, key);
  const tag = node.localName;
  const namespace = node.namespaceURI;
  const isHtmlElement = !namespace || namespace === NAMESPACE_HTML;
  if (isHtmlElement && INPUT_ELEMENTS.includes(tag)) {
    virtualiseInputEvents(tag, node);
  }
  const attributes = virtualiseAttributes(node);
  const children = [];
  for (let childNode = node.firstChild;childNode; ) {
    const child2 = virtualiseChild(meta2, node, childNode, children.length);
    if (child2) {
      children.push([child2.key, child2.vnode]);
      childNode = child2.next;
    } else {
      childNode = childNode.nextSibling;
    }
  }
  const vnode = isHtmlElement ? element3(tag, attributes, toList3(children)) : namespaced2(namespace, tag, attributes, toList3(children));
  return childResult(key, vnode, node.nextSibling);
};
var virtualiseText = (meta2, node, index4) => {
  insertMetadataChild(text_kind, meta2, node, index4, null);
  return childResult("", text2(node.data), node.nextSibling);
};
var virtualiseFragment = (metaParent, domParent, node, index4) => {
  const key = parseKey(node.data);
  const meta2 = insertMetadataChild(fragment_kind, metaParent, node, index4, key);
  const children = [];
  node = node.nextSibling;
  while (node && (node.nodeType !== COMMENT_NODE || node.data.trim() !== "/lustre:fragment")) {
    const child2 = virtualiseChild(meta2, domParent, node, children.length);
    if (child2) {
      children.push([child2.key, child2.vnode]);
      node = child2.next;
    } else {
      node = node.nextSibling;
    }
  }
  meta2.endNode = node;
  const vnode = fragment3(toList3(children));
  return childResult(key, vnode, node?.nextSibling);
};
var virtualiseMap = (metaParent, domParent, node, index4) => {
  const key = parseKey(node.data);
  const meta2 = insertMetadataChild(map_kind, metaParent, node, index4, key);
  const child2 = virtualiseNextChild(meta2, domParent, node, 0);
  if (!child2)
    return null;
  const vnode = map6(child2.vnode, (x) => x);
  return childResult(key, vnode, child2.next);
};
var virtualiseMemo = (meta2, domParent, node, index4) => {
  const key = parseKey(node.data);
  const child2 = virtualiseNextChild(meta2, domParent, node, index4);
  if (!child2)
    return null;
  domParent.removeChild(node);
  const vnode = memo2(toList3([ref({})]), () => child2.vnode);
  return childResult(key, vnode, child2.next);
};
var virtualiseNextChild = (meta2, domParent, node, index4) => {
  while (true) {
    node = node.nextSibling;
    if (!node)
      return null;
    const child2 = virtualiseChild(meta2, domParent, node, index4);
    if (child2)
      return child2;
  }
};
var childResult = (key, vnode, next) => {
  return { key, vnode, next };
};
var virtualiseAttributes = (node) => {
  const attributes = [];
  for (let i = 0;i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    if (attr.name !== "xmlns") {
      attributes.push(attribute2(attr.localName, attr.value));
    }
  }
  return toList3(attributes);
};
var INPUT_ELEMENTS = ["input", "select", "textarea"];
var virtualiseInputEvents = (tag, node) => {
  const value = node.value;
  const checked = node.checked;
  if (tag === "input" && node.type === "checkbox" && !checked)
    return;
  if (tag === "input" && node.type === "radio" && !checked)
    return;
  if (node.type !== "checkbox" && node.type !== "radio" && !value)
    return;
  queueMicrotask(() => {
    node.value = value;
    node.checked = checked;
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
    if (globalThis.document.activeElement !== node) {
      node.dispatchEvent(new Event("blur", { bubbles: true }));
    }
  });
};
var parseKey = (data2) => {
  const keyMatch = data2.match(/key="([^"]*)"/);
  if (!keyMatch)
    return "";
  return unescapeKey(keyMatch[1]);
};
var unescapeKey = (key) => {
  return key.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
};
var toList3 = (arr) => arr.reduceRight((xs, x) => List$NonEmpty(x, xs), empty_list);

// build/dev/javascript/lustre/lustre/runtime/client/runtime.ffi.mjs
var is_browser = () => !!globalThis.document;
class Runtime {
  constructor(root2, [model, effects], view, update2, options) {
    this.root = root2;
    this.#model = model;
    this.#view = view;
    this.#update = update2;
    this.root.addEventListener("context-request", (event4) => {
      if (!(event4.context && event4.callback))
        return;
      if (!this.#contexts.has(event4.context))
        return;
      event4.stopImmediatePropagation();
      const context = this.#contexts.get(event4.context);
      if (event4.subscribe) {
        const unsubscribe = () => {
          context.subscribers = context.subscribers.filter((subscriber) => subscriber !== event4.callback);
        };
        context.subscribers.push([event4.callback, unsubscribe]);
        event4.callback(context.value, unsubscribe);
      } else {
        event4.callback(context.value);
      }
    });
    const decodeEvent = (event4, path, name2) => decode2(this.#cache, path, name2, event4);
    const dispatch2 = (event4, data2) => {
      const [cache, result] = dispatch(this.#cache, data2);
      this.#cache = cache;
      if (Result$isOk(result)) {
        const handler = Result$Ok$0(result);
        if (handler.stop_propagation)
          event4.stopPropagation();
        if (handler.prevent_default)
          event4.preventDefault();
        this.dispatch(handler.message, false);
      }
    };
    this.#reconciler = new Reconciler(this.root, decodeEvent, dispatch2, options);
    this.#vdom = virtualise(this.root);
    this.#cache = new$5();
    this.#handleEffects(effects);
    this.#render();
  }
  root = null;
  dispatch(msg, shouldFlush = false) {
    if (this.#shouldQueue) {
      this.#queue.push(msg);
    } else {
      const [model, effects] = this.#update(this.#model, msg);
      this.#model = model;
      this.#tick(effects, shouldFlush);
    }
  }
  emit(event4, data2) {
    const target = this.root.host ?? this.root;
    target.dispatchEvent(new CustomEvent(event4, {
      detail: data2,
      bubbles: true,
      composed: true
    }));
  }
  provide(key, value) {
    if (!this.#contexts.has(key)) {
      this.#contexts.set(key, { value, subscribers: [] });
    } else {
      const context = this.#contexts.get(key);
      if (isEqual2(context.value, value)) {
        return;
      }
      context.value = value;
      for (let i = context.subscribers.length - 1;i >= 0; i--) {
        const [subscriber, unsubscribe] = context.subscribers[i];
        if (!subscriber) {
          context.subscribers.splice(i, 1);
          continue;
        }
        subscriber(value, unsubscribe);
      }
    }
  }
  #model;
  #view;
  #update;
  #vdom;
  #cache;
  #reconciler;
  #contexts = new Map;
  #shouldQueue = false;
  #queue = [];
  #beforePaint = empty_list;
  #afterPaint = empty_list;
  #renderTimer = null;
  #actions = {
    dispatch: (msg) => this.dispatch(msg),
    emit: (event4, data2) => this.emit(event4, data2),
    select: () => {},
    root: () => this.root,
    provide: (key, value) => this.provide(key, value)
  };
  #tick(effects, shouldFlush = false) {
    this.#handleEffects(effects);
    if (!this.#renderTimer) {
      if (shouldFlush) {
        this.#renderTimer = "sync";
        queueMicrotask(() => this.#render());
      } else {
        this.#renderTimer = window.requestAnimationFrame(() => this.#render());
      }
    }
  }
  #handleEffects(effects) {
    this.#shouldQueue = true;
    while (true) {
      iterate(effects.synchronous, (effect) => effect(this.#actions));
      this.#beforePaint = append4(this.#beforePaint, effects.before_paint);
      this.#afterPaint = append4(this.#afterPaint, effects.after_paint);
      if (!this.#queue.length)
        break;
      const msg = this.#queue.shift();
      [this.#model, effects] = this.#update(this.#model, msg);
    }
    this.#shouldQueue = false;
  }
  #render() {
    this.#renderTimer = null;
    const next = this.#view(this.#model);
    const { patch, cache } = diff(this.#cache, this.#vdom, next);
    this.#cache = cache;
    this.#vdom = next;
    this.#reconciler.push(patch, memos(cache));
    if (List$isNonEmpty(this.#beforePaint)) {
      const effects = makeEffect(this.#beforePaint);
      this.#beforePaint = empty_list;
      queueMicrotask(() => {
        this.#tick(effects, true);
      });
    }
    if (List$isNonEmpty(this.#afterPaint)) {
      const effects = makeEffect(this.#afterPaint);
      this.#afterPaint = empty_list;
      window.requestAnimationFrame(() => this.#tick(effects, true));
    }
  }
}
function makeEffect(synchronous) {
  return {
    synchronous,
    after_paint: empty_list,
    before_paint: empty_list
  };
}
var copiedStyleSheets = new WeakMap;
async function adoptStylesheets(shadowRoot) {
  const pendingParentStylesheets = [];
  for (const node of globalThis.document.querySelectorAll("link[rel=stylesheet], style")) {
    if (node.sheet)
      continue;
    pendingParentStylesheets.push(new Promise((resolve, reject) => {
      node.addEventListener("load", resolve);
      node.addEventListener("error", reject);
    }));
  }
  await Promise.allSettled(pendingParentStylesheets);
  if (!shadowRoot.host.isConnected) {
    return [];
  }
  shadowRoot.adoptedStyleSheets = shadowRoot.host.getRootNode().adoptedStyleSheets;
  const pending = [];
  for (const sheet of globalThis.document.styleSheets) {
    try {
      shadowRoot.adoptedStyleSheets.push(sheet);
    } catch {
      try {
        let copiedSheet = copiedStyleSheets.get(sheet);
        if (!copiedSheet) {
          copiedSheet = new CSSStyleSheet;
          for (const rule of sheet.cssRules) {
            copiedSheet.insertRule(rule.cssText, copiedSheet.cssRules.length);
          }
          copiedStyleSheets.set(sheet, copiedSheet);
        }
        shadowRoot.adoptedStyleSheets.push(copiedSheet);
      } catch {
        const node = sheet.ownerNode.cloneNode();
        shadowRoot.prepend(node);
        pending.push(node);
      }
    }
  }
  return pending;
}

class ContextRequestEvent extends Event {
  constructor(context, callback, subscribe) {
    super("context-request", { bubbles: true, composed: true });
    this.context = context;
    this.callback = callback;
    this.subscribe = subscribe;
  }
}

// build/dev/javascript/lustre/lustre/runtime/client/component.ffi.mjs
var make_component = ({ init, update: update2, view, config: config2 }, name2) => {
  if (!is_browser())
    return Result$Error(Error$NotABrowser());
  if (!name2.includes("-"))
    return Result$Error(Error$BadComponentName(name2));
  if (globalThis.customElements.get(name2)) {
    return Result$Error(Error$ComponentAlreadyRegistered(name2));
  }
  const attributes = new Map;
  const observedAttributes = [];
  iterate(config2.attributes, ([name3, decoder]) => {
    if (attributes.has(name3))
      return;
    attributes.set(name3, decoder);
    observedAttributes.push(name3);
  });
  const [model, effects] = init(undefined);
  const component = class Component extends globalThis.HTMLElement {
    static get observedAttributes() {
      return observedAttributes;
    }
    static formAssociated = config2.is_form_associated;
    #runtime;
    #adoptedStyleNodes = [];
    #contextSubscriptions = new Map;
    constructor() {
      super();
      this.internals = this.attachInternals();
      if (!this.internals.shadowRoot) {
        this.attachShadow({
          mode: config2.open_shadow_root ? "open" : "closed",
          delegatesFocus: config2.delegates_focus
        });
      }
      if (config2.adopt_styles) {
        this.#adoptStyleSheets();
      }
      this.#runtime = new Runtime(this.internals.shadowRoot, [model, effects], view, update2);
    }
    connectedCallback() {
      this.#requestContexts();
      if (Option$isSome(config2.on_connect)) {
        this.dispatch(Option$Some$0(config2.on_connect));
      }
    }
    adoptedCallback() {
      if (config2.adopt_styles) {
        this.#adoptStyleSheets();
      }
      this.#unsubscribeContexts();
      if (Option$isSome(config2.on_adopt)) {
        this.dispatch(Option$Some$0(config2.on_adopt));
      }
    }
    disconnectedCallback() {
      this.#unsubscribeContexts();
      if (Option$isSome(config2.on_disconnect)) {
        this.dispatch(Option$Some$0(config2.on_disconnect));
      }
    }
    attributeChangedCallback(name3, _, value) {
      const decoded = attributes.get(name3)(value ?? "");
      if (Result$isOk(decoded)) {
        this.dispatch(Result$Ok$0(decoded), true);
      }
    }
    formResetCallback() {
      if (Option$isSome(config2.on_form_reset)) {
        this.dispatch(Option$Some$0(config2.on_form_reset));
      }
    }
    formStateRestoreCallback(state, reason) {
      switch (reason) {
        case "restore":
          if (Option$isSome(config2.on_form_restore)) {
            this.dispatch(Option$Some$0(config2.on_form_restore)(state));
          }
          break;
        case "autocomplete":
          if (Option$isSome(config2.on_form_autofill)) {
            this.dispatch(Option$Some$0(config2.on_form_autofill)(state));
          }
          break;
      }
    }
    send(message) {
      if (Message$isEffectDispatchedMessage(message)) {
        this.dispatch(message.message, false);
      } else if (Message$isEffectEmitEvent(message)) {
        this.emit(message.name, message.data);
      } else if (Message$isSystemRequestedShutdown(message)) {}
    }
    dispatch(msg, shouldFlush = false) {
      this.#runtime.dispatch(msg, shouldFlush);
    }
    emit(event4, data2) {
      this.#runtime.emit(event4, data2);
    }
    provide(key, value) {
      this.#runtime.provide(key, value);
    }
    #requestContexts() {
      const requested = new Set;
      iterate(config2.contexts, ([key, decoder]) => {
        if (!key)
          return;
        if (requested.has(key))
          return;
        this.dispatchEvent(new ContextRequestEvent(key, (value, unsubscribe) => {
          const previousUnsubscribe = this.#contextSubscriptions.get(key);
          if (previousUnsubscribe !== unsubscribe) {
            previousUnsubscribe?.();
          }
          const decoded = run(value, decoder);
          this.#contextSubscriptions.set(key, unsubscribe);
          if (Result$isOk(decoded)) {
            this.dispatch(Result$Ok$0(decoded), true);
          }
        }, true));
        requested.add(key);
      });
    }
    #unsubscribeContexts() {
      for (const [_, unsubscribe] of this.#contextSubscriptions) {
        unsubscribe?.();
      }
      this.#contextSubscriptions.clear();
    }
    async#adoptStyleSheets() {
      while (this.#adoptedStyleNodes.length) {
        this.#adoptedStyleNodes.pop().remove();
        this.shadowRoot.firstChild.remove();
      }
      this.#adoptedStyleNodes = await adoptStylesheets(this.internals.shadowRoot);
    }
  };
  iterate(config2.properties, ([name3, decoder]) => {
    if (Object.hasOwn(component.prototype, name3)) {
      return;
    }
    Object.defineProperty(component.prototype, name3, {
      get() {
        return this[`_${name3}`];
      },
      set(value) {
        this[`_${name3}`] = value;
        const decoded = run(value, decoder);
        if (Result$isOk(decoded)) {
          this.dispatch(Result$Ok$0(decoded), true);
        }
      }
    });
  });
  globalThis.customElements.define(name2, component);
  return Result$Ok(undefined);
};
var set_pseudo_state = (root2, value) => {
  if (!is_browser())
    return;
  if (root2 instanceof ShadowRoot) {
    root2.host.internals.states.add(value);
  }
};
var remove_pseudo_state = (root2, value) => {
  if (!is_browser())
    return;
  if (root2 instanceof ShadowRoot) {
    root2.host.internals.states.delete(value);
  }
};

// build/dev/javascript/lustre/lustre/component.mjs
function on_attribute_change(name2, decoder) {
  return new Option((config2) => {
    let attributes = prepend([name2, decoder], config2.attributes);
    return new Config2(config2.open_shadow_root, config2.adopt_styles, config2.delegates_focus, attributes, config2.properties, config2.contexts, config2.is_form_associated, config2.on_form_autofill, config2.on_form_reset, config2.on_form_restore, config2.on_connect, config2.on_adopt, config2.on_disconnect);
  });
}
function on_property_change(name2, decoder) {
  return new Option((config2) => {
    let properties = prepend([name2, decoder], config2.properties);
    return new Config2(config2.open_shadow_root, config2.adopt_styles, config2.delegates_focus, config2.attributes, properties, config2.contexts, config2.is_form_associated, config2.on_form_autofill, config2.on_form_reset, config2.on_form_restore, config2.on_connect, config2.on_adopt, config2.on_disconnect);
  });
}
function on_context_change(key, decoder) {
  return new Option((config2) => {
    let contexts = prepend([key, decoder], config2.contexts);
    return new Config2(config2.open_shadow_root, config2.adopt_styles, config2.delegates_focus, config2.attributes, config2.properties, contexts, config2.is_form_associated, config2.on_form_autofill, config2.on_form_reset, config2.on_form_restore, config2.on_connect, config2.on_adopt, config2.on_disconnect);
  });
}
function adopt_styles(adopt) {
  return new Option((config2) => {
    return new Config2(config2.open_shadow_root, adopt, config2.delegates_focus, config2.attributes, config2.properties, config2.contexts, config2.is_form_associated, config2.on_form_autofill, config2.on_form_reset, config2.on_form_restore, config2.on_connect, config2.on_adopt, config2.on_disconnect);
  });
}
function default_slot(attributes, fallback) {
  return slot(attributes, fallback);
}
function named_slot(name2, attributes, fallback) {
  return slot(prepend(attribute2("name", name2), attributes), fallback);
}
function slot2(name2) {
  return attribute2("slot", name2);
}
function set_pseudo_state2(value) {
  return before_paint((_, root2) => {
    return set_pseudo_state(root2, value);
  });
}
function remove_pseudo_state2(value) {
  return before_paint((_, root2) => {
    return remove_pseudo_state(root2, value);
  });
}

// build/dev/javascript/lustre/lustre/runtime/client/spa.ffi.mjs
class Spa {
  #runtime;
  constructor(root2, [init, effects], update2, view) {
    this.#runtime = new Runtime(root2, [init, effects], view, update2);
  }
  send(message) {
    if (Message$isEffectDispatchedMessage(message)) {
      this.dispatch(message.message, false);
    } else if (Message$isEffectEmitEvent(message)) {
      this.emit(message.name, message.data);
    } else if (Message$isSystemRequestedShutdown(message)) {}
  }
  dispatch(msg) {
    this.#runtime.dispatch(msg);
  }
  emit(event4, data2) {
    this.#runtime.emit(event4, data2);
  }
}
var start = ({ init, update: update2, view }, selector, flags) => {
  if (!is_browser())
    return Result$Error(Error$NotABrowser());
  const root2 = selector instanceof HTMLElement ? selector : globalThis.document.querySelector(selector);
  if (!root2)
    return Result$Error(Error$ElementNotFound(selector));
  return Result$Ok(new Spa(root2, init(flags), update2, view));
};

// build/dev/javascript/lustre/lustre/runtime/server/runtime.ffi.mjs
class Runtime2 {
  #model;
  #update;
  #view;
  #config;
  #vdom;
  #cache;
  #providers = make();
  #callbacks = /* @__PURE__ */ new Set;
  constructor(_, init, update2, view, config2, start_arguments) {
    const [model, effects] = init(start_arguments);
    this.#model = model;
    this.#update = update2;
    this.#view = view;
    this.#config = config2;
    this.#vdom = this.#view(this.#model);
    this.#cache = from_node(this.#vdom);
    this.#handle_effect(effects);
  }
  send(msg) {
    if (Message$isClientDispatchedMessage(msg)) {
      const { message } = msg;
      const next = this.#handle_client_message(message);
      const diff2 = diff(this.#cache, this.#vdom, next);
      this.#vdom = next;
      this.#cache = diff2.cache;
      this.broadcast(reconcile(diff2.patch, memos(diff2.cache)));
    } else if (Message$isClientRegisteredCallback(msg)) {
      const { callback } = msg;
      this.#callbacks.add(callback);
      callback(mount(this.#config.open_shadow_root, this.#config.adopt_styles, keys(this.#config.attributes), keys(this.#config.properties), keys(this.#config.contexts), this.#providers, this.#vdom, memos(this.#cache)));
      if (Option$isSome(config.on_connect)) {
        this.#dispatch(Option$Some$0(config.on_connect));
      }
    } else if (Message$isClientDeregisteredCallback(msg)) {
      const { callback } = msg;
      this.#callbacks.delete(callback);
      if (Option$isSome(config.on_disconnect)) {
        this.#dispatch(Option$Some$0(config.on_disconnect));
      }
    } else if (Message$isEffectDispatchedMessage(msg)) {
      const { message } = msg;
      const [model, effect] = this.#update(this.#model, message);
      const next = this.#view(model);
      const diff2 = diff(this.#cache, this.#vdom, next);
      this.#handle_effect(effect);
      this.#model = model;
      this.#vdom = next;
      this.#cache = diff2.cache;
      this.broadcast(reconcile(diff2.patch, memos(diff2.cache)));
    } else if (Message$isEffectEmitEvent(msg)) {
      const { name: name2, data: data2 } = msg;
      this.broadcast(emit(name2, data2));
    } else if (Message$isEffectProvidedValue(msg)) {
      const { key, value } = msg;
      const existing = get(this.#providers, key);
      if (Result$isOk(existing) && isEqual2(Result$Ok$0(existing), value)) {
        return;
      }
      this.#providers = insert(this.#providers, key, value);
      this.broadcast(provide2(key, value));
    } else if (Message$isSystemRequestedShutdown(msg)) {
      this.#model = null;
      this.#update = null;
      this.#view = null;
      this.#config = null;
      this.#vdom = null;
      this.#cache = null;
      this.#providers = null;
      this.#callbacks.clear();
    }
  }
  broadcast(msg) {
    for (const callback of this.#callbacks) {
      callback(msg);
    }
  }
  #handle_client_message(msg) {
    if (ServerMessage$isBatch(msg)) {
      const { messages } = msg;
      let model = this.#model;
      let effect = none();
      for (let list4 = messages;List$NonEmpty$rest(list4); list4 = List$NonEmpty$rest(list4)) {
        const result = this.#handle_client_message(List$NonEmpty$first(list4));
        if (Result$isOk(result)) {
          model = Result$Ok$0(result)[0];
          effect = batch(toList2([effect, Result$Ok$0(result)[1]]));
          break;
        }
      }
      this.#handle_effect(effect);
      this.#model = model;
      return this.#view(model);
    } else if (ServerMessage$isAttributeChanged(msg)) {
      const { name: name2, value } = msg;
      const result = this.#handle_attribute_change(name2, value);
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      return this.#dispatch(Result$Ok$0(result));
    } else if (ServerMessage$isPropertyChanged(msg)) {
      const { name: name2, value } = msg;
      const result = this.#handle_properties_change(name2, value);
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      return this.#dispatch(Result$Ok$0(result));
    } else if (ServerMessage$isEventFired(msg)) {
      const { path, name: name2, event: event4 } = msg;
      const [cache, result] = handle(this.#cache, path, name2, event4);
      this.#cache = cache;
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      const { message } = Result$Ok$0(result);
      return this.#dispatch(message);
    } else if (ServerMessage$isContextProvided(msg)) {
      const { key, value } = msg;
      let result = get(this.#config.contexts, key);
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      result = run(value, Result$Ok$0(result));
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      return this.#dispatch(Result$Ok$0(result));
    }
  }
  #dispatch(msg) {
    const [model, effects] = this.#update(this.#model, msg);
    this.#handle_effect(effects);
    this.#model = model;
    return this.#view(this.#model);
  }
  #handle_attribute_change(name2, value) {
    const result = get(this.#config.attributes, name2);
    if (!Result$isOk(result)) {
      return result;
    }
    return Result$Ok$0(result)(value);
  }
  #handle_properties_change(name2, value) {
    const result = get(this.#config.properties, name2);
    if (!Result$isOk(result)) {
      return result;
    }
    return Result$Ok$0(result)(value);
  }
  #handle_effect(effect) {
    const dispatch2 = (message) => this.send(Message$EffectDispatchedMessage(message));
    const emit2 = (name2, data2) => this.send(Message$EffectEmitEvent(name2, data2));
    const select = () => {
      return;
    };
    const internals = () => {
      return;
    };
    const provide3 = (key, value) => this.send(Message$EffectProvidedValue(key, value));
    globalThis.queueMicrotask(() => {
      perform(effect, dispatch2, emit2, select, internals, provide3);
    });
  }
}

// build/dev/javascript/lustre/lustre.mjs
class BadComponentName extends CustomType {
  constructor(name2) {
    super();
    this.name = name2;
  }
}
var Error$BadComponentName = (name2) => new BadComponentName(name2);
class ComponentAlreadyRegistered extends CustomType {
  constructor(name2) {
    super();
    this.name = name2;
  }
}
var Error$ComponentAlreadyRegistered = (name2) => new ComponentAlreadyRegistered(name2);
class ElementNotFound extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
}
var Error$ElementNotFound = (selector) => new ElementNotFound(selector);
class NotABrowser extends CustomType {
}
var Error$NotABrowser = () => new NotABrowser;
function application(init, update2, view) {
  return new App(new None, init, update2, view, default_config);
}
function component(init, update2, view, options) {
  return new App(new None, init, update2, view, configure(options));
}
function start4(app, selector, arguments$) {
  return guard(!is_browser(), new Error(new NotABrowser), () => {
    return start(app, selector, arguments$);
  });
}

// build/dev/javascript/lustre/lustre/element/svg.mjs
var namespace = "http://www.w3.org/2000/svg";
function circle(attrs) {
  return namespaced(namespace, "circle", attrs, empty_list);
}
function rect(attrs) {
  return namespaced(namespace, "rect", attrs, empty_list);
}
function pattern(attrs, children) {
  return namespaced(namespace, "pattern", attrs, children);
}
function path(attrs) {
  return namespaced(namespace, "path", attrs, empty_list);
}
// build/dev/javascript/clique/clique/bounds.mjs
function init() {
  return [0, 0, 0, 0];
}
function to_json4(bounds) {
  return preprocessed_array(toList([
    float3(bounds[0]),
    float3(bounds[1]),
    float3(bounds[2]),
    float3(bounds[3])
  ]));
}

// build/dev/javascript/clique/clique/transform.mjs
function new$6(x, y, zoom) {
  return [x, y, zoom];
}
function init2() {
  return [0, 0, 1];
}
function decoder() {
  let tuple_decoder = field(0, float2, (x) => {
    return field(1, float2, (y) => {
      return field(2, float2, (zoom) => {
        return success([x, y, zoom]);
      });
    });
  });
  let object_decoder = field("x", float2, (x) => {
    return field("y", float2, (y) => {
      return field("zoom", float2, (zoom) => {
        return success([x, y, zoom]);
      });
    });
  });
  return one_of(tuple_decoder, toList([object_decoder]));
}
function to_css_matrix(transform) {
  return "matrix(" + float_to_string(transform[2]) + ", 0, 0, " + float_to_string(transform[2]) + ", " + float_to_string(transform[0]) + ", " + float_to_string(transform[1]) + ")";
}
function to_json5(transform) {
  return preprocessed_array(toList([
    float3(transform[0]),
    float3(transform[1]),
    float3(transform[2])
  ]));
}
function to_string5(transform) {
  return float_to_string(transform[0]) + " " + float_to_string(transform[1]) + " " + float_to_string(transform[2]);
}

// build/dev/javascript/clique/clique/internal/context.mjs
function provide_scale(value) {
  return provide("clique/scale", float3(value));
}
function on_scale_change(handler) {
  return on_context_change("clique/scale", then$(float2, (scale) => {
    return success(handler(scale));
  }));
}
function provide_transform(value) {
  return provide("clique/transform", to_json5(value));
}
function on_transform_change(handler) {
  return on_context_change("clique/transform", then$(decoder(), (transform) => {
    return success(handler(transform));
  }));
}
function provide_connection(value) {
  return provide("clique/connection", (() => {
    if (value instanceof Some) {
      let node = value[0][0];
      let handle2 = value[0][1];
      return object2(toList([
        ["node", string3(node)],
        ["handle", string3(handle2)]
      ]));
    } else {
      return null$();
    }
  })());
}
function on_connection_change(handler) {
  return on_context_change("clique/connection", then$(optional(field("node", string2, (node) => {
    return field("handle", string2, (handle2) => {
      return success([node, handle2]);
    });
  })), (connection) => {
    return success(handler(connection));
  }));
}

// build/dev/javascript/clique/clique/internal/number.mjs
function parse2(value) {
  let $ = parse_int(value);
  if ($ instanceof Ok) {
    let n = $[0];
    return new Ok(identity(n));
  } else {
    return parse_float(value);
  }
}

// build/dev/javascript/clique/clique/background.ffi.mjs
var uuid = () => `background-${globalThis.crypto.randomUUID()}`;
var mod = (x, y) => x % y;

// build/dev/javascript/clique/clique/background.mjs
class Dots extends CustomType {
}
class Lines extends CustomType {
}
class Model extends CustomType {
  constructor(id2, pattern2, transform, gap, scaled_gap, size4, scaled_size, offset, scaled_offset) {
    super();
    this.id = id2;
    this.pattern = pattern2;
    this.transform = transform;
    this.gap = gap;
    this.scaled_gap = scaled_gap;
    this.size = size4;
    this.scaled_size = scaled_size;
    this.offset = offset;
    this.scaled_offset = scaled_offset;
  }
}

class ParentSetGap extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class ParentSetOffset extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class ParentSetPattern extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}

class ParentSetSize extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}

class ViewportProvidedTransform extends CustomType {
  constructor(transform) {
    super();
    this.transform = transform;
  }
}
var tag = "clique-background";
function pattern2(value) {
  return attribute2("pattern", (() => {
    if (value instanceof Dots) {
      return "dots";
    } else {
      return "lines";
    }
  })());
}
function dots() {
  return pattern2(new Dots);
}
function lines() {
  return pattern2(new Lines);
}
function gap(x, y) {
  let $ = is_browser();
  if ($) {
    return property2("gap", object2(toList([["x", float3(x)], ["y", float3(y)]])));
  } else {
    return attribute2("gap", float_to_string(x) + " " + float_to_string(y));
  }
}
function size4(value) {
  let $ = is_browser();
  if ($) {
    return property2("size", float3(value));
  } else {
    return attribute2("size", float_to_string(value));
  }
}
function init3(_) {
  let model = new Model(uuid(), new Dots, init2(), [20, 20], [20, 20], 1, 1, [0, 0], [0, 0]);
  let effect = none();
  return [model, effect];
}
function options() {
  return toList([
    adopt_styles(false),
    on_attribute_change("pattern", (value) => {
      let $ = trim(value);
      if ($ === "dots") {
        return new Ok(new ParentSetPattern(new Dots));
      } else if ($ === "lines") {
        return new Ok(new ParentSetPattern(new Lines));
      } else {
        return new Error(undefined);
      }
    }),
    on_attribute_change("gap", (value) => {
      let $ = (() => {
        let _pipe = split2(value, " ");
        return map3(_pipe, trim);
      })();
      if ($ instanceof Empty) {
        return new Error(undefined);
      } else {
        let $1 = $.tail;
        if ($1 instanceof Empty) {
          let gap$1 = $.head;
          let $2 = parse2(gap$1);
          if ($2 instanceof Ok) {
            let value$1 = $2[0];
            return new Ok(new ParentSetGap(value$1, value$1));
          } else {
            return new Error(undefined);
          }
        } else {
          let $2 = $1.tail;
          if ($2 instanceof Empty) {
            let gap_x = $.head;
            let gap_y = $1.head;
            let $3 = parse2(gap_x);
            let $4 = parse2(gap_y);
            if ($3 instanceof Ok && $4 instanceof Ok) {
              let x = $3[0];
              let y = $4[0];
              return new Ok(new ParentSetGap(x, y));
            } else {
              return new Error(undefined);
            }
          } else {
            return new Error(undefined);
          }
        }
      }
    }),
    on_property_change("gap", field("x", float2, (x) => {
      return field("y", float2, (y) => {
        return success(new ParentSetGap(x, y));
      });
    })),
    on_attribute_change("offset", (value) => {
      let $ = (() => {
        let _pipe = split2(value, " ");
        return map3(_pipe, trim);
      })();
      if ($ instanceof Empty) {
        return new Error(undefined);
      } else {
        let $1 = $.tail;
        if ($1 instanceof Empty) {
          let offset$1 = $.head;
          let $2 = parse2(offset$1);
          if ($2 instanceof Ok) {
            let value$1 = $2[0];
            return new Ok(new ParentSetOffset(value$1, value$1));
          } else {
            return new Error(undefined);
          }
        } else {
          let $2 = $1.tail;
          if ($2 instanceof Empty) {
            let offset_x = $.head;
            let offset_y = $1.head;
            let $3 = parse2(offset_x);
            let $4 = parse2(offset_y);
            if ($3 instanceof Ok && $4 instanceof Ok) {
              let x = $3[0];
              let y = $4[0];
              return new Ok(new ParentSetOffset(x, y));
            } else {
              return new Error(undefined);
            }
          } else {
            return new Error(undefined);
          }
        }
      }
    }),
    on_property_change("offset", field("x", float2, (x) => {
      return field("y", float2, (y) => {
        return success(new ParentSetOffset(x, y));
      });
    })),
    on_attribute_change("size", (value) => {
      let $ = parse2(value);
      if ($ instanceof Ok) {
        let n = $[0];
        return new Ok(new ParentSetSize(n));
      } else {
        return new Error(undefined);
      }
    }),
    on_property_change("size", (() => {
      let _pipe = float2;
      return map4(_pipe, (var0) => {
        return new ParentSetSize(var0);
      });
    })()),
    on_transform_change((var0) => {
      return new ViewportProvidedTransform(var0);
    })
  ]);
}
function update2(model, msg) {
  if (msg instanceof ParentSetGap) {
    let x = msg.x;
    let y = msg.y;
    let gap$1 = [x, y];
    let scaled_gap = [x * model.transform[2], y * model.transform[2]];
    let model$1 = new Model(model.id, model.pattern, model.transform, gap$1, scaled_gap, model.size, model.scaled_size, model.offset, model.scaled_offset);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetOffset) {
    let x = msg.x;
    let y = msg.y;
    let offset$1 = [x, y];
    let scaled_offset = [
      x * model.transform[2] + model.scaled_gap[0] / 2,
      y * model.transform[2] + model.scaled_gap[1] / 2
    ];
    let model$1 = new Model(model.id, model.pattern, model.transform, model.gap, model.scaled_gap, model.size, model.scaled_size, offset$1, scaled_offset);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetPattern) {
    let value = msg.value;
    let model$1 = new Model(model.id, value, model.transform, model.gap, model.scaled_gap, model.size, model.scaled_size, model.offset, model.scaled_offset);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetSize) {
    let value = msg.value;
    let size$1 = max(1, value);
    let scaled_size = size$1 * model.transform[2];
    let model$1 = new Model(model.id, model.pattern, model.transform, model.gap, model.scaled_gap, size$1, scaled_size, model.offset, model.scaled_offset);
    let effect = none();
    return [model$1, effect];
  } else {
    let transform = msg.transform;
    let scaled_gap = [model.gap[0] * transform[2], model.gap[1] * transform[2]];
    let scaled_size = model.size * transform[2];
    let scaled_offset = [
      model.offset[0] * transform[2] + scaled_gap[0] / 2,
      model.offset[1] * transform[2] + scaled_gap[1] / 2
    ];
    let model$1 = new Model(model.id, model.pattern, transform, model.gap, scaled_gap, model.size, scaled_size, model.offset, scaled_offset);
    let effect = none();
    return [model$1, effect];
  }
}
function view_pattern(id2, transform, gap2, attributes, children) {
  return pattern(prepend(id(id2), prepend(attribute2("x", float_to_string(mod(transform[0], gap2[0]))), prepend(attribute2("y", float_to_string(mod(transform[1], gap2[1]))), prepend(attribute2("width", float_to_string(gap2[0])), prepend(attribute2("height", float_to_string(gap2[1])), prepend(attribute2("patternUnits", "userSpaceOnUse"), attributes)))))), children);
}
function view_dot_pattern(radius) {
  return circle(toList([
    attribute2("cx", float_to_string(radius)),
    attribute2("cy", float_to_string(radius)),
    attribute2("r", float_to_string(radius))
  ]));
}
function view_line_pattern(dimensions) {
  let path2 = "M" + float_to_string(dimensions[0] / 2) + " 0 V" + float_to_string(dimensions[1]) + " M0 " + float_to_string(dimensions[1] / 2) + " H" + float_to_string(dimensions[0]);
  return path(toList([attribute2("d", path2), attribute2("stroke-width", "1")]));
}
function view_background(id2) {
  return rect(toList([
    attribute2("x", "0"),
    attribute2("y", "0"),
    attribute2("width", "100%"),
    attribute2("height", "100%"),
    attribute2("fill", "url(#" + id2 + ")")
  ]));
}
function view(model) {
  return fragment2(toList([
    style2(toList([]), `
      svg {
        background-color: inherit;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }

      path {
        stroke: currentcolor;
        stroke-width: 1;
      }

      circle {
        fill: currentcolor;
      }
      `),
    svg(toList([]), toList([
      view_pattern(model.id, model.transform, model.scaled_gap, toList([
        attribute2("patternTransform", (() => {
          let $ = model.pattern;
          if ($ instanceof Dots) {
            return "translate(-" + float_to_string(model.scaled_offset[0] + model.scaled_gap[0] / 2) + ", -" + float_to_string(model.scaled_offset[1] + model.scaled_gap[1] / 2) + ") translate(-" + float_to_string(model.scaled_size) + ", -" + float_to_string(model.scaled_size) + ")";
          } else {
            return "translate(-" + float_to_string(model.scaled_offset[0]) + ", -" + float_to_string(model.scaled_offset[1]) + ")";
          }
        })())
      ]), toList([
        (() => {
          let $ = model.pattern;
          if ($ instanceof Dots) {
            return view_dot_pattern(model.scaled_size);
          } else {
            return view_line_pattern(model.scaled_gap);
          }
        })()
      ])),
      view_background(model.id)
    ]))
  ]));
}
function register() {
  return make_component(component(init3, update2, view, options()), tag);
}
function root2(attributes) {
  return element2(tag, prepend(slot2("background"), attributes), toList([]));
}
// build/dev/javascript/justin/justin.mjs
function add3(words, word) {
  if (word === "") {
    return words;
  } else {
    return prepend(word, words);
  }
}
function is_upper(g) {
  return lowercase(g) !== g;
}
function split3(loop$in, loop$up, loop$word, loop$words) {
  while (true) {
    let in$ = loop$in;
    let up = loop$up;
    let word = loop$word;
    let words = loop$words;
    if (in$ instanceof Empty) {
      if (word === "") {
        return reverse(words);
      } else {
        return reverse(add3(words, word));
      }
    } else {
      let $ = in$.head;
      if ($ === `
`) {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === "\t") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === "!") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === "?") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === "#") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === ".") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === "-") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === "_") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else if ($ === " ") {
        let in$1 = in$.tail;
        loop$in = in$1;
        loop$up = false;
        loop$word = "";
        loop$words = add3(words, word);
      } else {
        let g = $;
        let in$1 = in$.tail;
        let $1 = is_upper(g);
        if ($1) {
          if (up) {
            loop$in = in$1;
            loop$up = up;
            loop$word = word + g;
            loop$words = words;
          } else {
            loop$in = in$1;
            loop$up = true;
            loop$word = g;
            loop$words = add3(words, word);
          }
        } else {
          loop$in = in$1;
          loop$up = false;
          loop$word = word + g;
          loop$words = words;
        }
      }
    }
  }
}
function split_words(text4) {
  let _pipe = text4;
  let _pipe$1 = graphemes(_pipe);
  return split3(_pipe$1, false, "", toList([]));
}
function kebab_case(text4) {
  let _pipe = text4;
  let _pipe$1 = split_words(_pipe);
  let _pipe$2 = join(_pipe$1, "-");
  return lowercase(_pipe$2);
}

// build/dev/javascript/lustre/lustre/event.mjs
function emit2(event4, data2) {
  return event2(event4, data2);
}
function on(name2, handler) {
  return event(name2, map4(handler, (msg) => {
    return new Handler(false, false, msg);
  }), empty_list, never, never, 0, 0);
}
function advanced(name2, handler) {
  return event(name2, handler, empty_list, possible, possible, 0, 0);
}
function handler(message, prevent_default, stop_propagation) {
  return new Handler(prevent_default, stop_propagation, message);
}
function prevent_default(event4) {
  if (event4 instanceof Event2) {
    return new Event2(event4.kind, event4.name, event4.handler, event4.include, always, event4.stop_propagation, event4.debounce, event4.throttle);
  } else {
    return event4;
  }
}

// build/dev/javascript/clique/clique/internal/dom.ffi.mjs
var is_element = (dynamic2) => dynamic2 instanceof HTMLElement;
var get_attribute = (element4, key) => {
  if (element4.hasAttribute(key)) {
    return new Ok(element4.getAttribute(key));
  } else {
    return new Error(undefined);
  }
};
var make_fallback_element = () => document.createElement("div");
var assigned_elements = (slot3) => {
  if (slot3 instanceof HTMLSlotElement) {
    return List.fromArray(Array.from(slot3.assignedElements()));
  } else {
    return new Empty;
  }
};
var nearest = (element4, selector) => {
  const found = element4.closest(selector);
  if (found) {
    return new Ok(found);
  } else {
    return new Error(undefined);
  }
};
var add_event_listener = (shadow_root, name2, handler2) => {
  const host = shadow_root.host;
  if (host) {
    host.addEventListener(name2, handler2);
  }
};
var prevent_default2 = (event4, yes) => {
  if (yes)
    event4.preventDefault();
};
var stop_propagation = (event4, yes) => {
  if (yes)
    event4.stopPropagation();
};

// build/dev/javascript/clique/clique/internal/dom.mjs
function add_event_listener2(name2, decoder2) {
  return before_paint((dispatch2, shadow_root) => {
    return add_event_listener(shadow_root, name2, (event4) => {
      let $ = run(event4, decoder2);
      if ($ instanceof Ok) {
        let handler2 = $[0];
        let $1 = prevent_default2(event4, handler2.prevent_default);
        let $2 = stop_propagation(event4, handler2.stop_propagation);
        return dispatch2(handler2.message);
      } else {
        return;
      }
    });
  });
}
function attribute3(element4, name2) {
  return get_attribute(element4, name2);
}
function element_decoder() {
  return new_primitive_decoder("HtmlElement", (dynamic2) => {
    let $ = is_element(dynamic2);
    if ($) {
      return new Ok(identity2(dynamic2));
    } else {
      return new Error(make_fallback_element());
    }
  });
}

// build/dev/javascript/clique/clique/internal/drag.mjs
class Settled extends CustomType {
}
class Active extends CustomType {
  constructor(x, y, vx, vy) {
    super();
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}
class Inertia extends CustomType {
  constructor(vx, vy) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
}
var friction = 0.85;
var min_velocity = 0.2;
var threshold = 5;
function start5(x, y) {
  return new Active(x, y, 0, 0);
}
function on_animation_frame(handler2) {
  return after_paint((dispatch2, _) => {
    return dispatch2(handler2);
  });
}
function update3(state, x, y) {
  if (state instanceof Settled) {
    return [start5(x, y), 0, 0];
  } else if (state instanceof Active) {
    let dx = x - state.x;
    let dy = y - state.y;
    let vx = dx * friction;
    let vy = dy * friction;
    return [new Active(x, y, vx, vy), dx, dy];
  } else {
    return [start5(x, y), 0, 0];
  }
}
function tick2(state, tick3) {
  if (state instanceof Settled) {
    return [state, 0, 0, none()];
  } else if (state instanceof Active) {
    return [state, 0, 0, none()];
  } else {
    let vx = state.vx;
    let vy = state.vy;
    let vx$1 = vx * friction;
    let vx_abs = absolute_value(vx$1);
    let vy$1 = vy * friction;
    let vy_abs = absolute_value(vy$1);
    let $ = vx_abs < min_velocity && vy_abs < min_velocity;
    if ($) {
      return [new Settled, vx$1, vy$1, none()];
    } else {
      return [new Inertia(vx$1, vy$1), vx$1, vy$1, on_animation_frame(tick3)];
    }
  }
}
function stop(state, tick3) {
  if (state instanceof Settled) {
    return [new Settled, none()];
  } else if (state instanceof Active) {
    let vx = state.vx;
    let vy = state.vy;
    let vx_abs = absolute_value(vx);
    let vy_abs = absolute_value(vy);
    let velocity_magnitude = vx_abs + vy_abs;
    let $ = velocity_magnitude > threshold;
    if ($) {
      return [new Inertia(vx, vy), on_animation_frame(tick3)];
    } else {
      return [new Settled, none()];
    }
  } else {
    return [new Settled, none()];
  }
}

// build/dev/javascript/clique/clique/internal/prop.mjs
class Prop extends CustomType {
  constructor(value, state) {
    super();
    this.value = value;
    this.state = state;
  }
}
class Unchanged extends CustomType {
}
class Touched extends CustomType {
}
class Controlled extends CustomType {
}
function new$8(value) {
  return new Prop(value, new Unchanged);
}
function controlled(value) {
  return new Prop(value, new Controlled);
}
function uncontrolled(prop, value) {
  let $ = prop.state;
  if ($ instanceof Unchanged) {
    return new Prop(value, prop.state);
  } else if ($ instanceof Touched) {
    return prop;
  } else {
    return prop;
  }
}
function update4(prop, value) {
  let $ = prop.state;
  if ($ instanceof Unchanged) {
    return new Prop(value, new Touched);
  } else if ($ instanceof Touched) {
    return new Prop(value, new Touched);
  } else {
    return prop;
  }
}

// build/dev/javascript/clique/clique/node.ffi.mjs
var set_transform = (shadow_root, value) => {
  const host = shadow_root.host;
  if (host) {
    host.style.transform = value;
  }
};
var add_window_mousemove_listener = (callback, handle_mouseup) => {
  const style3 = document.createElement("style");
  style3.textContent = `
    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
  `;
  document.head.appendChild(style3);
  let rafId = null;
  let data2 = null;
  let throttledCallback = (event4) => {
    data2 = event4;
    if (!rafId) {
      rafId = window.requestAnimationFrame(() => {
        callback(data2);
        rafId = data2 = null;
      });
    }
  };
  window.addEventListener("mousemove", throttledCallback, { passive: true });
  window.addEventListener("mouseup", () => {
    document.head.removeChild(style3);
    rafId = data2 = null;
    window.removeEventListener("mousemove", throttledCallback);
    handle_mouseup();
  }, { once: true });
};

// build/dev/javascript/clique/clique/node.mjs
class Model2 extends CustomType {
  constructor(id2, position, dragging, scale) {
    super();
    this.id = id2;
    this.position = position;
    this.dragging = dragging;
    this.scale = scale;
  }
}

class BrowserPainted extends CustomType {
}

class InertiaSimulationTicked extends CustomType {
}

class ParentProvidedScale extends CustomType {
  constructor(scale) {
    super();
    this.scale = scale;
  }
}

class ParentSetId extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
}

class ParentSetInitialPosition extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class ParentUpdatedPosition extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class UserDraggedNode extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class UserSelectedNode extends CustomType {
}

class UserStartedDrag extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class UserStoppedDrag extends CustomType {
}
var tag3 = "clique-node";
function position(x, y) {
  return property2("position", preprocessed_array(toList([float3(x), float3(y)])));
}
function on_change(handler2) {
  return on("clique:change", subfield(toList(["target", "id"]), string2, (id2) => {
    return subfield(toList(["detail", "dx"]), float2, (dx) => {
      return subfield(toList(["detail", "dy"]), float2, (dy) => {
        return success(handler2(id2, dx, dy));
      });
    });
  }));
}
function emit_change(dx, dy) {
  return guard(dx === 0 && dy === 0, none(), () => {
    return emit2("clique:change", object2(toList([["dx", float3(dx)], ["dy", float3(dy)]])));
  });
}
function on_select(handler2) {
  return on("clique:select", subfield(toList(["target", "id"]), string2, (id2) => {
    return success(handler2(id2));
  }));
}
function emit_select() {
  return emit2("clique:select", null$());
}
function emit_drag(x, y, dx, dy) {
  return emit2("clique:drag", object2(toList([
    ["x", float3(x)],
    ["y", float3(y)],
    ["dx", float3(dx)],
    ["dy", float3(dy)]
  ])));
}
function on_mount(handler2) {
  return on("clique:mount", field("target", element_decoder(), (target) => {
    return subfield(toList(["target", "id"]), string2, (id2) => {
      return success(handler2(target, id2));
    });
  }));
}
function emit_mount() {
  return emit2("clique:mount", null$());
}
function provide3(id2) {
  return provide("clique/node", object2(toList([["id", string3(id2)]])));
}
function on_context_change2(handler2) {
  return on_context_change("clique/node", field("id", string2, (id2) => {
    return success(handler2(id2));
  }));
}
function options2() {
  return toList([
    adopt_styles(false),
    on_attribute_change("id", (value) => {
      return new Ok(new ParentSetId(trim(value)));
    }),
    on_attribute_change("position", (value) => {
      let $ = (() => {
        let _pipe = split2(value, " ");
        return map3(_pipe, trim);
      })();
      if ($ instanceof Empty) {
        return new Error(undefined);
      } else {
        let $1 = $.tail;
        if ($1 instanceof Empty) {
          return new Error(undefined);
        } else {
          let $2 = $1.tail;
          if ($2 instanceof Empty) {
            let x = $.head;
            let y = $1.head;
            let $3 = parse2(x);
            let $4 = parse2(y);
            if ($3 instanceof Ok && $4 instanceof Ok) {
              let x$1 = $3[0];
              let y$1 = $4[0];
              return new Ok(new ParentSetInitialPosition(x$1, y$1));
            } else {
              return new Error(undefined);
            }
          } else {
            return new Error(undefined);
          }
        }
      }
    }),
    on_property_change("position", field(0, float2, (x) => {
      return field(1, float2, (y) => {
        return success(new ParentUpdatedPosition(x, y));
      });
    })),
    on_scale_change((var0) => {
      return new ParentProvidedScale(var0);
    })
  ]);
}
function set_transform2(position2) {
  return before_paint((_, shadow_root) => {
    let transform = "translate(" + float_to_string(position2.value[0]) + "px, " + float_to_string(position2.value[1]) + "px)";
    return set_transform(shadow_root, transform);
  });
}
function init4(_) {
  let model = new Model2("", new$8([0, 0]), new Settled, 1);
  let effect = batch(toList([
    set_transform2(model.position),
    after_paint((dispatch2, _2) => {
      return dispatch2(new BrowserPainted);
    })
  ]));
  return [model, effect];
}
function add_window_mousemove_listener2() {
  return from2((dispatch2) => {
    return add_window_mousemove_listener((event4) => {
      let decoder2 = field("clientX", float2, (client_x) => {
        return field("clientY", float2, (client_y) => {
          return success(new UserDraggedNode(client_x, client_y));
        });
      });
      let $ = run(event4, decoder2);
      if ($ instanceof Ok) {
        let msg = $[0];
        return dispatch2(msg);
      } else {
        return;
      }
    }, () => {
      return dispatch2(new UserStoppedDrag);
    });
  });
}
function update5(model, msg) {
  if (msg instanceof BrowserPainted) {
    return [model, emit_mount()];
  } else if (msg instanceof InertiaSimulationTicked) {
    let $ = tick2(model.dragging, new InertiaSimulationTicked);
    let dragging;
    let vx;
    let vy;
    let inertia_effect;
    dragging = $[0];
    vx = $[1];
    vy = $[2];
    inertia_effect = $[3];
    let x = model.position.value[0] + divideFloat(vx, model.scale);
    let y = model.position.value[1] + divideFloat(vy, model.scale);
    let dx = x - model.position.value[0];
    let dy = y - model.position.value[1];
    let position$1 = update4(model.position, [x, y]);
    let model$1 = new Model2(model.id, position$1, dragging, model.scale);
    let effect = batch(toList([
      inertia_effect,
      emit_drag(x, y, dx, dy),
      (() => {
        let $1 = position$1.state;
        if ($1 instanceof Unchanged) {
          return emit_change(dx, dy);
        } else if ($1 instanceof Touched) {
          return emit_change(dx, dy);
        } else {
          return none();
        }
      })(),
      set_transform2(model$1.position)
    ]));
    return [model$1, effect];
  } else if (msg instanceof ParentProvidedScale) {
    let scale = msg.scale;
    let model$1 = new Model2(model.id, model.position, model.dragging, scale);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetId) {
    let id2 = msg.id;
    let model$1 = new Model2(id2, model.position, model.dragging, model.scale);
    let effect = provide3(id2);
    return [model$1, effect];
  } else if (msg instanceof ParentSetInitialPosition) {
    let x = msg.x;
    let y = msg.y;
    let position$1 = uncontrolled(model.position, [x, y]);
    let dx = position$1.value[0] - model.position.value[0];
    let dy = position$1.value[1] - model.position.value[1];
    let model$1 = new Model2(model.id, position$1, model.dragging, model.scale);
    let effect = batch(toList([set_transform2(model$1.position), emit_change(dx, dy)]));
    return [model$1, effect];
  } else if (msg instanceof ParentUpdatedPosition) {
    let x = msg.x;
    let y = msg.y;
    let position$1 = controlled([x, y]);
    let dx = position$1.value[0] - model.position.value[0];
    let dy = position$1.value[1] - model.position.value[1];
    let model$1 = new Model2(model.id, position$1, model.dragging, model.scale);
    let effect = batch(toList([set_transform2(model$1.position), emit_change(dx, dy)]));
    return [model$1, effect];
  } else if (msg instanceof UserDraggedNode) {
    let x = msg.x;
    let y = msg.y;
    let $ = update3(model.dragging, x, y);
    let dragging;
    let dx;
    let dy;
    dragging = $[0];
    dx = $[1];
    dy = $[2];
    let dx$1 = divideFloat(dx, model.scale);
    let dy$1 = divideFloat(dy, model.scale);
    let nx = model.position.value[0] + dx$1;
    let ny = model.position.value[1] + dy$1;
    let position$1 = update4(model.position, [nx, ny]);
    let model$1 = new Model2(model.id, position$1, dragging, model.scale);
    let effect = batch(toList([
      emit_drag(nx, ny, dx$1, dy$1),
      (() => {
        let $1 = position$1.state;
        if ($1 instanceof Unchanged) {
          return emit_change(dx$1, dy$1);
        } else if ($1 instanceof Touched) {
          return emit_change(dx$1, dy$1);
        } else {
          return none();
        }
      })(),
      set_transform2(position$1)
    ]));
    return [model$1, effect];
  } else if (msg instanceof UserSelectedNode) {
    return [model, emit_select()];
  } else if (msg instanceof UserStartedDrag) {
    let x = msg.x;
    let y = msg.y;
    let dragging = start5(x, y);
    let model$1 = new Model2(model.id, model.position, dragging, model.scale);
    let effect = batch(toList([
      emit_select(),
      add_window_mousemove_listener2(),
      set_pseudo_state2("dragging")
    ]));
    return [model$1, effect];
  } else {
    let $ = stop(model.dragging, new InertiaSimulationTicked);
    let dragging;
    let inertia_effect;
    dragging = $[0];
    inertia_effect = $[1];
    let model$1 = new Model2(model.id, model.position, dragging, model.scale);
    let effect = batch(toList([inertia_effect, remove_pseudo_state2("dragging")]));
    return [model$1, effect];
  }
}
function view2(_) {
  let handle_mousedown = field("target", element_decoder(), (target) => {
    return field("clientX", float2, (client_x) => {
      return field("clientY", float2, (client_y) => {
        let drag = success(handler(new UserStartedDrag(client_x, client_y), false, true));
        let select = success(handler(new UserSelectedNode, false, false));
        let $ = attribute3(target, "data-clique-disable");
        if ($ instanceof Ok) {
          let $1 = $[0];
          if ($1 === "") {
            return drag;
          } else {
            let disable = $1;
            let _block;
            let _pipe = disable;
            let _pipe$1 = split2(_pipe, " ");
            let _pipe$2 = map3(_pipe$1, trim);
            _block = contains(_pipe$2, "drag");
            let nodrag$1 = _block;
            if (nodrag$1) {
              return select;
            } else {
              return drag;
            }
          }
        } else {
          return drag;
        }
      });
    });
  });
  return fragment2(toList([
    style2(toList([]), `:host {
        cursor: grab;
        display: block;
        min-width: max-content;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        will-change: transform;
        backface-visibility: hidden;
      }

      :host(:state(dragging)) {
        cursor: grabbing;
        user-select: none;
      }
      `),
    default_slot(toList([advanced("mousedown", handle_mousedown)]), toList([]))
  ]));
}
function register2() {
  return make_component(component(init4, update5, view2, options2()), tag3);
}
function root3(attributes, children2) {
  return element2(tag3, attributes, children2);
}

// build/dev/javascript/clique/clique/position.mjs
class Top extends CustomType {
}
class TopLeft extends CustomType {
}
class TopRight extends CustomType {
}
class Right extends CustomType {
}
class Bottom extends CustomType {
}
class BottomLeft extends CustomType {
}
class BottomRight extends CustomType {
}
class Left extends CustomType {
}

// build/dev/javascript/clique/clique/handle.mjs
class Handle extends CustomType {
  constructor(node, name2) {
    super();
    this.node = node;
    this.name = name2;
  }
}
class Model3 extends CustomType {
  constructor(node, name2, disabled, connection, tolerance) {
    super();
    this.node = node;
    this.name = name2;
    this.disabled = disabled;
    this.connection = connection;
    this.tolerance = tolerance;
  }
}

class NodeProvidedContext extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
}

class ParentSetDisabled extends CustomType {
}

class ParentSetName extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}

class ParentSetTolerance extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}

class ParentToggledDisabled extends CustomType {
}

class UserCompletedConnection extends CustomType {
}

class UserStartedConnection extends CustomType {
}

class ViewportProvidedConnection extends CustomType {
  constructor(connection) {
    super();
    this.connection = connection;
  }
}
var tag4 = "clique-handle";
function decoder2() {
  return field("node", string2, (node) => {
    return field("name", string2, (name2) => {
      return success(new Handle(node, name2));
    });
  });
}
function to_json6(handle2) {
  return object2(toList([
    ["node", string3(handle2.node)],
    ["name", string3(handle2.name)]
  ]));
}
function on_connection_start(handler2) {
  return on("clique:connection-start", field("detail", decoder2(), (handle2) => {
    return success(handler2(handle2));
  }));
}
function emit_connection_start(node, handle2) {
  return emit2("clique:connection-start", object2(toList([["node", string3(node)], ["name", string3(handle2)]])));
}
function on_connection_complete(handler2) {
  return on("clique:connection-complete", subfield(toList(["detail", "from"]), decoder2(), (from3) => {
    return subfield(toList(["detail", "to"]), decoder2(), (to) => {
      return success(handler2(from3, to));
    });
  }));
}
function emit_connection_complete(from3, to) {
  return emit2("clique:connection-complete", object2(toList([
    [
      "from",
      object2(toList([
        ["node", string3(from3[0])],
        ["name", string3(from3[1])]
      ]))
    ],
    [
      "to",
      object2(toList([
        ["node", string3(to[0])],
        ["name", string3(to[1])]
      ]))
    ]
  ])));
}
function init5(_) {
  let model = new Model3("", "", false, new None, 5);
  let effect = batch(toList([
    add_event_listener2("mousedown", success(handler(new UserStartedConnection, false, true))),
    add_event_listener2("mouseup", success(handler(new UserCompletedConnection, false, false))),
    set_pseudo_state2("invalid")
  ]));
  return [model, effect];
}
function options3() {
  return toList([
    adopt_styles(false),
    on_attribute_change("disabled", (value) => {
      let $ = trim(value);
      if ($ === "") {
        return new Ok(new ParentToggledDisabled);
      } else {
        return new Ok(new ParentSetDisabled);
      }
    }),
    on_attribute_change("name", (value) => {
      return new Ok(new ParentSetName(trim(value)));
    }),
    on_attribute_change("tolerance", (value) => {
      let $ = parse_int(value);
      if ($ instanceof Ok) {
        let v = $[0];
        if (v >= 0) {
          return new Ok(new ParentSetTolerance(v));
        } else {
          return new Ok(new ParentSetTolerance(5));
        }
      } else {
        return new Ok(new ParentSetTolerance(5));
      }
    }),
    on_property_change("tolerance", then$(int2, (v) => {
      let $ = v >= 0;
      if ($) {
        return success(new ParentSetTolerance(v));
      } else {
        return success(new ParentSetTolerance(5));
      }
    })),
    on_context_change2((var0) => {
      return new NodeProvidedContext(var0);
    }),
    on_connection_change((var0) => {
      return new ViewportProvidedConnection(var0);
    })
  ]);
}
function update6(model, msg) {
  if (msg instanceof NodeProvidedContext) {
    let id2 = msg.id;
    let model$1 = new Model3(id2, model.name, model.disabled, model.connection, model.tolerance);
    let _block;
    let $ = model$1.node;
    let $1 = model$1.name;
    if ($ === "") {
      _block = set_pseudo_state2("invalid");
    } else if ($1 === "") {
      _block = set_pseudo_state2("invalid");
    } else {
      _block = remove_pseudo_state2("invalid");
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof ParentSetDisabled) {
    let model$1 = new Model3(model.node, model.name, true, model.connection, model.tolerance);
    let effect = set_pseudo_state2("disabled");
    return [model$1, effect];
  } else if (msg instanceof ParentSetName) {
    let value = msg.value;
    let model$1 = new Model3(model.node, value, model.disabled, model.connection, model.tolerance);
    let _block;
    let $ = model$1.node;
    let $1 = model$1.name;
    if ($ === "") {
      _block = set_pseudo_state2("invalid");
    } else if ($1 === "") {
      _block = set_pseudo_state2("invalid");
    } else {
      _block = remove_pseudo_state2("invalid");
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof ParentSetTolerance) {
    let value = msg.value;
    let model$1 = new Model3(model.node, model.name, model.disabled, model.connection, value);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentToggledDisabled) {
    let model$1 = new Model3(model.node, model.name, !model.disabled, model.connection, model.tolerance);
    let _block;
    let $ = model$1.disabled;
    if ($) {
      _block = set_pseudo_state2("disabled");
    } else {
      _block = remove_pseudo_state2("disabled");
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof UserCompletedConnection) {
    let $ = model.disabled;
    let $1 = model.node;
    let $2 = model.name;
    let $3 = model.connection;
    if ($) {
      return [model, none()];
    } else if ($1 === "") {
      return [model, none()];
    } else if ($2 === "") {
      return [model, none()];
    } else if ($3 instanceof Some) {
      let node = $1;
      let name2 = $2;
      let from3 = $3[0];
      return [model, emit_connection_complete(from3, [node, name2])];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof UserStartedConnection) {
    let $ = model.disabled;
    let $1 = model.node;
    let $2 = model.name;
    if ($) {
      return [model, none()];
    } else if ($1 === "") {
      return [model, none()];
    } else if ($2 === "") {
      return [model, none()];
    } else {
      let node = $1;
      let name2 = $2;
      return [model, emit_connection_start(node, name2)];
    }
  } else {
    let connection = msg.connection;
    let model$1 = new Model3(model.node, model.name, model.disabled, connection, model.tolerance);
    let effect = none();
    return [model$1, effect];
  }
}
function view_tolerance_box(value) {
  let tolerance$1 = "calc(100% + " + to_string(value * 2) + "px)";
  let translate = "translate(-" + to_string(value) + "px, -" + to_string(value) + "px)";
  return div(toList([
    style("width", tolerance$1),
    style("height", tolerance$1),
    style("transform", translate)
  ]), toList([]));
}
function view3(model) {
  return fragment2(toList([
    style2(toList([]), `
      :host(:state(disabled)), :host(:state(invalid)) {
        pointer-events: none;
      }

      :host(:hover) {
        cursor: crosshair;
      }

      `),
    default_slot(toList([]), toList([])),
    (() => {
      let $ = model.tolerance;
      if ($ === 0) {
        return none2();
      } else {
        return view_tolerance_box(model.tolerance);
      }
    })()
  ]));
}
function register3() {
  return make_component(component(init5, update6, view3, options3()), tag4);
}
function root4(attributes, children2) {
  return element2(tag4, attributes, children2);
}

// build/dev/javascript/clique/clique/edge.mjs
class Model4 extends CustomType {
  constructor(from3, to, kind) {
    super();
    this.from = from3;
    this.to = to;
    this.kind = kind;
  }
}

class ParentRemovedFrom extends CustomType {
}

class ParentRemovedTo extends CustomType {
}

class ParentSetFrom extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}

class ParentSetTo extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}

class ParentSetType extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
var tag5 = "clique-edge";
function from3(handle2) {
  return attribute2("from", handle2.node + " " + handle2.name);
}
function to(handle2) {
  return attribute2("to", handle2.node + " " + handle2.name);
}
function linear() {
  return attribute2("type", "linear");
}
function on_disconnect(handler2) {
  return on("clique:disconnect", subfield(toList(["detail", "from"]), decoder2(), (from4) => {
    return subfield(toList(["detail", "to"]), decoder2(), (to2) => {
      return success(handler2(from4, to2));
    });
  }));
}
function emit_disconnect(from4, to2) {
  return emit2("clique:disconnect", object2(toList([["from", to_json6(from4)], ["to", to_json6(to2)]])));
}
function on_reconnect(handler2) {
  return on("clique:reconnect", subfield(toList(["detail", "old"]), field("from", decoder2(), (from4) => {
    return field("to", decoder2(), (to2) => {
      return success([from4, to2]);
    });
  }), (old) => {
    return subfield(toList(["detail", "new"]), field("from", decoder2(), (from4) => {
      return field("to", decoder2(), (to2) => {
        return success([from4, to2]);
      });
    }), (new$9) => {
      return subfield(toList(["detail", "type"]), string2, (kind) => {
        return success(handler2(old, new$9, kind));
      });
    });
  }));
}
function emit_reconnect(old, new$9, new_kind) {
  return emit2("clique:reconnect", object2(toList([
    [
      "old",
      object2(toList([
        ["from", to_json6(old[0])],
        ["to", to_json6(old[1])]
      ]))
    ],
    [
      "new",
      object2(toList([
        ["from", to_json6(new$9[0])],
        ["to", to_json6(new$9[1])]
      ]))
    ],
    ["type", string3(new_kind)]
  ])));
}
function on_connect(handler2) {
  return on("clique:connect", subfield(toList(["detail", "from"]), decoder2(), (from4) => {
    return subfield(toList(["detail", "to"]), decoder2(), (to2) => {
      return subfield(toList(["detail", "type"]), string2, (kind) => {
        return success(handler2(from4, to2, kind));
      });
    });
  }));
}
function emit_connect(from4, to2, kind) {
  return emit2("clique:connect", object2(toList([
    ["from", to_json6(from4)],
    ["to", to_json6(to2)],
    ["type", string3(kind)]
  ])));
}
function emit_change2(old_from, old_to, new_from, new_to, kind) {
  let _block;
  if (kind === "") {
    _block = "bezier";
  } else {
    _block = kind;
  }
  let new_kind = _block;
  if (old_from instanceof Some) {
    if (old_to instanceof Some) {
      if (new_from instanceof Some && new_to instanceof Some) {
        let old_from$1 = old_from[0];
        let old_to$1 = old_to[0];
        let new_from$1 = new_from[0];
        let new_to$1 = new_to[0];
        return emit_reconnect([old_from$1, old_to$1], [new_from$1, new_to$1], new_kind);
      } else {
        let old_from$1 = old_from[0];
        let old_to$1 = old_to[0];
        return emit_disconnect(old_from$1, old_to$1);
      }
    } else if (new_from instanceof Some && new_to instanceof Some) {
      let new_from$1 = new_from[0];
      let new_to$1 = new_to[0];
      return emit_connect(new_from$1, new_to$1, new_kind);
    } else {
      return none();
    }
  } else if (new_from instanceof Some && new_to instanceof Some) {
    let new_from$1 = new_from[0];
    let new_to$1 = new_to[0];
    return emit_connect(new_from$1, new_to$1, new_kind);
  } else {
    return none();
  }
}
function init6(_) {
  let model = new Model4(new None, new None, "bezier");
  let effect = none();
  return [model, effect];
}
function options4() {
  return toList([
    adopt_styles(false),
    on_attribute_change("from", (value) => {
      let $ = split2(value, " ");
      if ($ instanceof Empty) {
        return new Ok(new ParentRemovedFrom);
      } else {
        let $1 = $.tail;
        if ($1 instanceof Empty) {
          return new Ok(new ParentRemovedFrom);
        } else {
          let $2 = $1.tail;
          if ($2 instanceof Empty) {
            let node = $.head;
            let name2 = $1.head;
            if (node !== "" && name2 !== "") {
              return new Ok(new ParentSetFrom(new Handle(node, name2)));
            } else {
              return new Ok(new ParentRemovedFrom);
            }
          } else {
            return new Ok(new ParentRemovedFrom);
          }
        }
      }
    }),
    on_attribute_change("to", (value) => {
      let $ = split2(value, " ");
      if ($ instanceof Empty) {
        return new Ok(new ParentRemovedTo);
      } else {
        let $1 = $.tail;
        if ($1 instanceof Empty) {
          return new Ok(new ParentRemovedTo);
        } else {
          let $2 = $1.tail;
          if ($2 instanceof Empty) {
            let node = $.head;
            let name2 = $1.head;
            if (node !== "" && name2 !== "") {
              return new Ok(new ParentSetTo(new Handle(node, name2)));
            } else {
              return new Ok(new ParentRemovedTo);
            }
          } else {
            return new Ok(new ParentRemovedTo);
          }
        }
      }
    }),
    on_attribute_change("type", (value) => {
      if (value === "") {
        return new Ok(new ParentSetType("bezier"));
      } else {
        return new Ok(new ParentSetType(value));
      }
    })
  ]);
}
function update7(prev, msg) {
  if (msg instanceof ParentRemovedFrom) {
    let next = new Model4(new None, prev.to, prev.kind);
    let effect = emit_change2(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else if (msg instanceof ParentRemovedTo) {
    let next = new Model4(prev.from, new None, prev.kind);
    let effect = emit_change2(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else if (msg instanceof ParentSetFrom) {
    let value = msg.value;
    let next = new Model4(new Some(value), prev.to, prev.kind);
    let effect = emit_change2(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else if (msg instanceof ParentSetTo) {
    let value = msg.value;
    let next = new Model4(prev.from, new Some(value), prev.kind);
    let effect = emit_change2(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else {
    let value = msg.value;
    let next = new Model4(prev.from, prev.to, value);
    let effect = emit_change2(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  }
}
function view4(model) {
  return fragment2(toList([
    style2(toList([]), `:host {
        display: contents;
      }

      slot {
        display: inline-block;
        position: absolute;
        transform-origin: center;
        will-change: transform;
        pointer-events: auto;
      }
      `),
    (() => {
      let $ = model.from;
      let $1 = model.to;
      if ($ instanceof Some && $1 instanceof Some) {
        let from$1 = $[0];
        let to$1 = $1[0];
        let var$ = kebab_case("from-" + from$1.node + "-" + from$1.name + "-to-" + to$1.node + "-" + to$1.name);
        let translate_x = "var(--" + var$ + "-cx)";
        let translate_y = "var(--" + var$ + "-cy)";
        let transform = "translate(" + translate_x + ", " + translate_y + ") translate(-50%, -50%)";
        return default_slot(toList([style("transform", transform)]), toList([]));
      } else {
        return none2();
      }
    })()
  ]));
}
function register4() {
  return make_component(component(init6, update7, view4, options4()), tag5);
}
function root5(attributes, children2) {
  return element2(tag5, attributes, children2);
}

// build/dev/javascript/clique/clique/internal/mutable_dict.ffi.mjs
var make2 = () => new Map;
var get3 = (dict4, key) => dict4.get(key);
var has_key2 = (dict4, key) => dict4.has(key);
var to_list = (dict4) => List.fromArray(Array.from(dict4.entries()));
var to_json7 = (dict4, key_to_json, value_to_json) => {
  const json2 = {};
  for (const [key, value] of dict4.entries()) {
    json2[key_to_json(key)] = value_to_json(value);
  }
  return json2;
};
var insert5 = (dict4, key, value) => {
  dict4.set(key, value);
  return dict4;
};
var remove3 = (dict4, key) => {
  dict4.delete(key);
  return dict4;
};

// build/dev/javascript/clique/clique/internal/mutable_dict.mjs
function from_list3(entries) {
  return fold2(entries, make2(), (dict4, _use1) => {
    let key;
    let value;
    key = _use1[0];
    value = _use1[1];
    return insert5(dict4, key, value);
  });
}
function upsert(dict4, key, f) {
  let _block;
  let $ = has_key2(dict4, key);
  if ($) {
    _block = new Some(get3(dict4, key));
  } else {
    _block = new None;
  }
  let current_value = _block;
  let new_value = f(current_value);
  return insert5(dict4, key, new_value);
}
function fold4(dict4, init7, f) {
  return fold2(to_list(dict4), init7, (acc, _use1) => {
    let key;
    let value;
    key = _use1[0];
    value = _use1[1];
    return f(acc, key, value);
  });
}

// build/dev/javascript/clique/clique/internal/node_group.ffi.mjs
var queue_microtask = (callback) => {
  window.queueMicrotask(callback);
};

// build/dev/javascript/clique/clique/internal/node_group.mjs
class Model5 extends CustomType {
  constructor(should_accumulate, changes) {
    super();
    this.should_accumulate = should_accumulate;
    this.changes = changes;
  }
}

class MicrotaskTick extends CustomType {
}

class NodeChanged extends CustomType {
  constructor(id2, dx, dy) {
    super();
    this.id = id2;
    this.dx = dx;
    this.dy = dy;
  }
}

class NodesChanged extends CustomType {
  constructor(changes) {
    super();
    this.changes = changes;
  }
}
var tag6 = "clique-node-group";
function on_changes(handler2) {
  return on("clique:changes", subfield(toList(["detail", "changes"]), dict2(string2, field("dx", float2, (dx) => {
    return field("dy", float2, (dy) => {
      return success([dx, dy]);
    });
  })), (changes) => {
    return success(handler2(changes));
  }));
}
function emit_changes(changes) {
  return emit2("clique:changes", object2(toList([
    [
      "changes",
      to_json7(changes, identity2, (change) => {
        let dx;
        let dy;
        dx = change[0];
        dy = change[1];
        return object2(toList([["dx", float3(dx)], ["dy", float3(dy)]]));
      })
    ]
  ])));
}
function init7(_) {
  let model = new Model5(false, make2());
  let effect = none();
  return [model, effect];
}
function options5() {
  return toList([]);
}
function queue_microtask2() {
  return from2((dispatch2) => {
    return queue_microtask(() => {
      return dispatch2(new MicrotaskTick);
    });
  });
}
function update8(model, msg) {
  if (msg instanceof MicrotaskTick) {
    let next = new Model5(false, make2());
    let effect = emit_changes(model.changes);
    return [next, effect];
  } else if (msg instanceof NodeChanged) {
    if (model.should_accumulate) {
      let id2 = msg.id;
      let dx = msg.dx;
      let dy = msg.dy;
      let changes = insert5(model.changes, id2, [dx, dy]);
      let model$1 = new Model5(model.should_accumulate, changes);
      return [model$1, none()];
    } else {
      let id2 = msg.id;
      let dx = msg.dx;
      let dy = msg.dy;
      let changes = insert5(model.changes, id2, [dx, dy]);
      let model$1 = new Model5(true, changes);
      let effect = queue_microtask2();
      return [model$1, effect];
    }
  } else if (model.should_accumulate) {
    let changes = msg.changes;
    let changes$1 = fold(changes, model.changes, insert5);
    let model$1 = new Model5(model.should_accumulate, changes$1);
    return [model$1, none()];
  } else {
    let changes = msg.changes;
    let changes$1 = fold(changes, model.changes, insert5);
    let model$1 = new Model5(true, changes$1);
    let effect = queue_microtask2();
    return [model$1, effect];
  }
}
function view5(_) {
  return slot(toList([
    on_change((var0, var1, var2) => {
      return new NodeChanged(var0, var1, var2);
    }),
    on_changes((var0) => {
      return new NodesChanged(var0);
    })
  ]), toList([]));
}
function register5() {
  return make_component(component(init7, update8, view5, options5()), tag6);
}
function root6(attributes, children2) {
  return element2(tag6, attributes, children2);
}

// build/dev/javascript/clique/clique/internal/path.ffi.mjs
var sqrt = Math.sqrt;

// build/dev/javascript/clique/clique/internal/path.mjs
function bezier_control_point_offset(distance, curvature) {
  let $ = distance >= 0;
  if ($) {
    return 0.5 * distance;
  } else {
    return curvature * 25 * sqrt(0 - distance);
  }
}
function bezier_control_point(from_x, from_y, from_position, to_x, to_y, curvature) {
  if (from_position instanceof Top) {
    return [
      from_x,
      from_y - bezier_control_point_offset(from_y - to_y, curvature)
    ];
  } else if (from_position instanceof TopLeft) {
    return [
      from_x,
      from_y - bezier_control_point_offset(from_y - to_y, curvature)
    ];
  } else if (from_position instanceof TopRight) {
    return [
      from_x,
      from_y - bezier_control_point_offset(from_y - to_y, curvature)
    ];
  } else if (from_position instanceof Right) {
    return [
      from_x + bezier_control_point_offset(to_x - from_x, curvature),
      from_y
    ];
  } else if (from_position instanceof Bottom) {
    return [
      from_x,
      from_y + bezier_control_point_offset(to_y - from_y, curvature)
    ];
  } else if (from_position instanceof BottomLeft) {
    return [
      from_x,
      from_y + bezier_control_point_offset(to_y - from_y, curvature)
    ];
  } else if (from_position instanceof BottomRight) {
    return [
      from_x,
      from_y + bezier_control_point_offset(to_y - from_y, curvature)
    ];
  } else {
    return [
      from_x - bezier_control_point_offset(from_x - to_x, curvature),
      from_y
    ];
  }
}
function format(value) {
  let _pipe = value;
  let _pipe$1 = to_precision(_pipe, 2);
  return float_to_string(_pipe$1);
}
function straight(from_x, from_y, to_x, to_y) {
  let path2 = "M" + format(from_x) + "," + format(from_y) + " L" + format(to_x) + "," + format(to_y);
  let label_x = to_precision((from_x + to_x) / 2, 2);
  let label_y = to_precision((from_y + to_y) / 2, 2);
  return [path2, label_x, label_y];
}
function bezier(from_x, from_y, from_position, to_x, to_y, to_position) {
  let curvature = 0.25;
  let $ = bezier_control_point(from_x, from_y, from_position, to_x, to_y, curvature);
  let cx1;
  let cy1;
  cx1 = $[0];
  cy1 = $[1];
  let $1 = bezier_control_point(to_x, to_y, to_position, from_x, from_y, curvature);
  let cx2;
  let cy2;
  cx2 = $1[0];
  cy2 = $1[1];
  let path2 = "M" + format(from_x) + "," + format(from_y) + "C" + format(cx1) + "," + format(cy1) + " " + format(cx2) + "," + format(cy2) + " " + format(to_x) + "," + format(to_y);
  let label_x = from_x * 0.125 + cx1 * 0.375 + cx2 * 0.375 + to_x * 0.125;
  let label_y = from_y * 0.125 + cy1 * 0.375 + cy2 * 0.375 + to_y * 0.125;
  return [
    path2,
    to_precision(label_x, 2),
    to_precision(label_y, 2)
  ];
}
function step(from_x, from_y, to_x, to_y) {
  let mid_x = to_precision(from_x + (to_x - from_x) / 2, 2);
  let mid_y = to_precision(from_y + (to_y - from_y) / 2, 2);
  let dx1 = mid_x - from_x;
  let dy1 = 0;
  let dx2 = 0;
  let dy2 = to_y - from_y;
  let dx3 = to_x - mid_x;
  let dy3 = 0;
  let path2 = "M" + format(from_x) + "," + format(from_y) + "l" + format(dx1) + "," + format(dy1) + "l" + format(dx2) + "," + format(dy2) + "l" + format(dx3) + "," + format(dy3);
  let label_x = mid_x;
  let label_y = mid_y;
  return [path2, label_x, label_y];
}
function default$(kind, from4, to2) {
  if (kind === "bezier") {
    return bezier(from4[0], from4[1], new Right, to2[0], to2[1], new Left);
  } else if (kind === "step") {
    return step(from4[0], from4[1], to2[0], to2[1]);
  } else if (kind === "linear") {
    return straight(from4[0], from4[1], to2[0], to2[1]);
  } else {
    return straight(from4[0], from4[1], to2[0], to2[1]);
  }
}

// build/dev/javascript/clique/clique/internal/edge_lookup.mjs
class EdgeLookup extends CustomType {
  constructor(edges, keys3) {
    super();
    this.edges = edges;
    this.keys = keys3;
  }
}
class EdgeData extends CustomType {
  constructor(source, from4, target, to2, kind, path2, cx, cy) {
    super();
    this.source = source;
    this.from = from4;
    this.target = target;
    this.to = to2;
    this.kind = kind;
    this.path = path2;
    this.cx = cx;
    this.cy = cy;
  }
}
function new$9() {
  return new EdgeLookup(make2(), make2());
}
function get4(lookup2, source, target) {
  let key = source.node + ":" + source.name + "->" + target.node + ":" + target.name;
  let $ = has_key2(lookup2.edges, key);
  if ($) {
    return new Ok(get3(lookup2.edges, key));
  } else {
    return new Error(undefined);
  }
}
function insert6(lookup2, source, from4, target, to2, kind) {
  let $ = default$(kind, from4, to2);
  let path2;
  let cx;
  let cy;
  path2 = $[0];
  cx = $[1];
  cy = $[2];
  let data3 = new EdgeData(source, from4, target, to2, kind, path2, cx, cy);
  let key = source.node + ":" + source.name + "->" + target.node + ":" + target.name;
  let edges = insert5(lookup2.edges, key, data3);
  let _block;
  let _pipe = lookup2.keys;
  let _pipe$1 = upsert(_pipe, source.node, (inner) => {
    if (inner instanceof Some) {
      let inner$1 = inner[0];
      return upsert(inner$1, source.name, (keys4) => {
        let _pipe$12 = map(keys4, (_capture) => {
          return insert3(_capture, key);
        });
        return lazy_unwrap(_pipe$12, () => {
          return from_list2(toList([key]));
        });
      });
    } else {
      return from_list3(toList([[source.name, from_list2(toList([key]))]]));
    }
  });
  _block = upsert(_pipe$1, target.node, (inner) => {
    if (inner instanceof Some) {
      let inner$1 = inner[0];
      return upsert(inner$1, target.name, (keys4) => {
        let _pipe$2 = map(keys4, (_capture) => {
          return insert3(_capture, key);
        });
        return lazy_unwrap(_pipe$2, () => {
          return from_list2(toList([key]));
        });
      });
    } else {
      return from_list3(toList([[target.name, from_list2(toList([key]))]]));
    }
  });
  let keys3 = _block;
  return new EdgeLookup(edges, keys3);
}
function insert_edge(lookup2, source, target, edge) {
  let key = source.node + ":" + source.name + "->" + target.node + ":" + target.name;
  let edges = insert5(lookup2.edges, key, edge);
  let _block;
  let _pipe = lookup2.keys;
  let _pipe$1 = upsert(_pipe, source.node, (inner) => {
    if (inner instanceof Some) {
      let inner$1 = inner[0];
      return upsert(inner$1, source.name, (keys4) => {
        let _pipe$12 = map(keys4, (_capture) => {
          return insert3(_capture, key);
        });
        return lazy_unwrap(_pipe$12, () => {
          return from_list2(toList([key]));
        });
      });
    } else {
      return from_list3(toList([[source.name, from_list2(toList([key]))]]));
    }
  });
  _block = upsert(_pipe$1, target.node, (inner) => {
    if (inner instanceof Some) {
      let inner$1 = inner[0];
      return upsert(inner$1, target.name, (keys4) => {
        let _pipe$2 = map(keys4, (_capture) => {
          return insert3(_capture, key);
        });
        return lazy_unwrap(_pipe$2, () => {
          return from_list2(toList([key]));
        });
      });
    } else {
      return from_list3(toList([[target.name, from_list2(toList([key]))]]));
    }
  });
  let keys3 = _block;
  return new EdgeLookup(edges, keys3);
}
function delete$3(lookup2, source, target) {
  let key = source.node + ":" + source.name + "->" + target.node + ":" + target.name;
  let edges = remove3(lookup2.edges, key);
  let _block;
  let $ = has_key2(lookup2.keys, source.node);
  if ($) {
    let inner = get3(lookup2.keys, source.node);
    let $12 = has_key2(inner, source.name);
    if ($12) {
      let source_keys = get3(inner, source.name);
      let $2 = size3(source_keys) === 1;
      if ($2) {
        _block = insert5(lookup2.keys, source.node, remove3(inner, source.name));
      } else {
        _block = insert5(lookup2.keys, source.node, insert5(inner, source.name, delete$2(source_keys, key)));
      }
    } else {
      _block = lookup2.keys;
    }
  } else {
    _block = lookup2.keys;
  }
  let keys3 = _block;
  let _block$1;
  let $1 = has_key2(keys3, target.node);
  if ($1) {
    let inner = get3(keys3, target.node);
    let $2 = has_key2(inner, target.name);
    if ($2) {
      let target_keys = get3(inner, target.name);
      let $3 = size3(target_keys) === 1;
      if ($3) {
        _block$1 = insert5(keys3, source.node, remove3(inner, target.name));
      } else {
        _block$1 = insert5(keys3, source.node, insert5(inner, target.name, delete$2(target_keys, key)));
      }
    } else {
      _block$1 = keys3;
    }
  } else {
    _block$1 = keys3;
  }
  let keys$1 = _block$1;
  return new EdgeLookup(edges, keys$1);
}
function update_node(lookup2, node, offset) {
  let $ = guard(!has_key2(lookup2.keys, node), [lookup2.edges, new$2()], () => {
    let inner = get3(lookup2.keys, node);
    return fold4(inner, [lookup2.edges, new$2()], (_use0, _, keys3) => {
      let edges2;
      let seen;
      edges2 = _use0[0];
      seen = _use0[1];
      return fold3(keys3, [edges2, seen], (_use02, key) => {
        let edges$1;
        let seen$1;
        edges$1 = _use02[0];
        seen$1 = _use02[1];
        return guard(contains2(seen$1, key), [edges$1, seen$1], () => {
          let $1 = has_key2(edges$1, key);
          if ($1) {
            let edge = get3(edges$1, key);
            let _block;
            let $2 = edge.source.node === node;
            if ($2) {
              _block = [
                edge.from[0] + offset[0],
                edge.from[1] + offset[1]
              ];
            } else {
              _block = edge.from;
            }
            let from4 = _block;
            let _block$1;
            let $3 = edge.target.node === node;
            if ($3) {
              _block$1 = [
                edge.to[0] + offset[0],
                edge.to[1] + offset[1]
              ];
            } else {
              _block$1 = edge.to;
            }
            let to2 = _block$1;
            let $4 = default$(edge.kind, from4, to2);
            let path2;
            let cx;
            let cy;
            path2 = $4[0];
            cx = $4[1];
            cy = $4[2];
            let updated_edge = new EdgeData(edge.source, from4, edge.target, to2, edge.kind, path2, cx, cy);
            return [
              insert5(edges$1, key, updated_edge),
              insert3(seen$1, key)
            ];
          } else {
            return [edges$1, insert3(seen$1, key)];
          }
        });
      });
    });
  });
  let edges;
  edges = $[0];
  return new EdgeLookup(edges, lookup2.keys);
}
function update9(lookup2, handle2, position2) {
  let edges = guard(!has_key2(lookup2.keys, handle2.node), lookup2.edges, () => {
    let inner = get3(lookup2.keys, handle2.node);
    return guard(!has_key2(inner, handle2.name), lookup2.edges, () => {
      let keys3 = get3(inner, handle2.name);
      return fold3(keys3, lookup2.edges, (edges2, key) => {
        return guard(!has_key2(edges2, key), edges2, () => {
          let edge = get3(edges2, key);
          let _block;
          let $ = isEqual(edge.source, handle2);
          if ($) {
            _block = position2;
          } else {
            _block = edge.from;
          }
          let from4 = _block;
          let _block$1;
          let $1 = isEqual(edge.target, handle2);
          if ($1) {
            _block$1 = position2;
          } else {
            _block$1 = edge.to;
          }
          let to2 = _block$1;
          let $2 = default$(edge.kind, from4, to2);
          let path2;
          let cx;
          let cy;
          path2 = $2[0];
          cx = $2[1];
          cy = $2[2];
          let updated_edge = new EdgeData(edge.source, from4, edge.target, to2, edge.kind, path2, cx, cy);
          return insert5(edges2, key, updated_edge);
        });
      });
    });
  });
  return new EdgeLookup(edges, lookup2.keys);
}
function fold5(lookup2, init8, f) {
  return fold4(lookup2.edges, init8, f);
}

// build/dev/javascript/clique/clique/internal/viewport.ffi.mjs
var set_transform3 = (shadow_root, value) => {
  const viewport = shadow_root.querySelector("#viewport");
  if (viewport) {
    viewport.style.transform = value;
  }
};
var add_resize_observer = (shadow_root, on_viewport_resize, callback) => {
  const containerRef = new WeakRef(shadow_root.querySelector("#container"));
  let rafId = null;
  let pendingUpdates = new Map;
  let viewportRect;
  const viewportObserver = new ResizeObserver(([entry]) => {
    viewportRect = entry.target.getBoundingClientRect();
    on_viewport_resize([
      viewportRect.x,
      viewportRect.y,
      viewportRect.width,
      viewportRect.height
    ]);
  });
  viewportObserver.observe(containerRef.deref());
  const processUpdates = () => {
    const container = containerRef.deref();
    if (!container || pendingUpdates.size === 0)
      return;
    const scaleX = viewportRect.width / (container.clientWidth || 1);
    const scaleY = viewportRect.height / (container.clientHeight || 1);
    const updates = [];
    for (const [node, handles] of pendingUpdates) {
      for (const handle2 of handles) {
        const name2 = handle2.getAttribute("name");
        if (!name2)
          continue;
        const bounds = handle2.getBoundingClientRect();
        const cx = bounds.left + bounds.width / 2;
        const cy = bounds.top + bounds.height / 2;
        const x = (cx - viewportRect.left) / scaleX;
        const y = (cy - viewportRect.top) / scaleY;
        updates.push([node, name2, x, y]);
      }
    }
    pendingUpdates.clear();
    if (updates.length > 0) {
      callback(List.fromArray(updates));
    }
    rafId = null;
  };
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const node = entry.target.getAttribute("id");
      if (!node)
        continue;
      const handles = entry.target.querySelectorAll("clique-handle");
      if (handles.length === 0)
        continue;
      pendingUpdates.set(node, Array.from(handles));
    }
    if (!rafId) {
      rafId = requestAnimationFrame(processUpdates);
    }
  });
  return observer;
};
var observe_node = (resize_observer, node) => {
  resize_observer.observe(node);
};
var add_window_mousemove_listener3 = (handle_mouseup, callback) => {
  const style3 = document.createElement("style");
  style3.textContent = `
    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
  `;
  document.head.appendChild(style3);
  let rafId = null;
  let data3 = null;
  let throttledCallback = (event4) => {
    data3 = event4;
    if (!rafId) {
      rafId = window.requestAnimationFrame(() => {
        callback(data3);
        rafId = data3 = null;
      });
    }
  };
  window.addEventListener("mousemove", throttledCallback, { passive: true });
  window.addEventListener("mouseup", (event4) => {
    document.head.removeChild(style3);
    rafId = data3 = null;
    window.removeEventListener("mousemove", throttledCallback);
    handle_mouseup(event4);
  }, { once: true });
};

// build/dev/javascript/clique/clique/internal/viewport.mjs
class Model6 extends CustomType {
  constructor(transform, observer, handles, edges, panning, connection, bounds, selected) {
    super();
    this.transform = transform;
    this.observer = observer;
    this.handles = handles;
    this.edges = edges;
    this.panning = panning;
    this.connection = connection;
    this.bounds = bounds;
    this.selected = selected;
  }
}

class Node extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
}

class Edge extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
}

class EdgeDisconnected extends CustomType {
  constructor(from4, to2) {
    super();
    this.from = from4;
    this.to = to2;
  }
}

class EdgeConnected extends CustomType {
  constructor(from4, to2, kind) {
    super();
    this.from = from4;
    this.to = to2;
    this.kind = kind;
  }
}

class EdgeReconnected extends CustomType {
  constructor(prev, next, kind) {
    super();
    this.prev = prev;
    this.next = next;
    this.kind = kind;
  }
}

class EdgesMounted extends CustomType {
  constructor(edges) {
    super();
    this.edges = edges;
  }
}

class InertiaSimulationTicked2 extends CustomType {
}

class NodeMounted extends CustomType {
  constructor(element4, id2) {
    super();
    this.element = element4;
    this.id = id2;
  }
}

class NodesMoved extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}

class NodeResizeObserverStarted extends CustomType {
  constructor(observer) {
    super();
    this.observer = observer;
  }
}

class NodesResized extends CustomType {
  constructor(changes) {
    super();
    this.changes = changes;
  }
}

class ParentSetInitialTransform extends CustomType {
  constructor(transform) {
    super();
    this.transform = transform;
  }
}

class ParentUpdatedTransform extends CustomType {
  constructor(transform) {
    super();
    this.transform = transform;
  }
}

class UserCompletedConnection2 extends CustomType {
}

class UserPannedViewport extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class UserSelectedEdge extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
}

class UserSelectedNode2 extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
}

class UserStartedConnection2 extends CustomType {
  constructor(source) {
    super();
    this.source = source;
  }
}

class UserStartedPanning extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class UserStoppedPanning extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

class UserZoomedViewport extends CustomType {
  constructor(client_x, client_y, delta) {
    super();
    this.client_x = client_x;
    this.client_y = client_y;
    this.delta = delta;
  }
}

class ViewportReszied extends CustomType {
  constructor(bounds) {
    super();
    this.bounds = bounds;
  }
}
var tag7 = "clique-viewport";
function initial_transform(transform) {
  return attribute2("transform", to_string5(transform));
}
function emit_resize(bounds) {
  return emit2("clique:resize", to_json4(bounds));
}
function emit_connection_cancel(from4, x, y) {
  return emit2("clique:connection-cancel", object2(toList([
    [
      "from",
      object2(toList([
        ["node", string3(from4[0])],
        ["name", string3(from4[1])]
      ]))
    ],
    ["x", float3(x)],
    ["y", float3(y)]
  ])));
}
function emit_pan(transform) {
  return emit2("clique:pan", to_json5(transform));
}
function emit_zoom(transform) {
  return emit2("clique:zoom", to_json5(transform));
}
function add_resize_observer2() {
  return before_paint((dispatch2, shadow_root) => {
    let observer = add_resize_observer(shadow_root, (bounds) => {
      return dispatch2(new ViewportReszied(bounds));
    }, (changes) => {
      return dispatch2(new NodesResized(changes));
    });
    return dispatch2(new NodeResizeObserverStarted(observer));
  });
}
function options6() {
  return toList([
    adopt_styles(false),
    on_attribute_change("transform", (value) => {
      let $ = (() => {
        let _pipe = split2(value, " ");
        return map3(_pipe, trim);
      })();
      if ($ instanceof Empty) {
        return new Error(undefined);
      } else {
        let $1 = $.tail;
        if ($1 instanceof Empty) {
          return new Error(undefined);
        } else {
          let $2 = $1.tail;
          if ($2 instanceof Empty) {
            return new Error(undefined);
          } else {
            let $3 = $2.tail;
            if ($3 instanceof Empty) {
              let x = $.head;
              let y = $1.head;
              let zoom = $2.head;
              let $4 = parse2(x);
              let $5 = parse2(y);
              let $6 = parse2(zoom);
              if ($4 instanceof Ok && $5 instanceof Ok && $6 instanceof Ok) {
                let x$1 = $4[0];
                let y$1 = $5[0];
                let zoom$1 = $6[0];
                return new Ok(new ParentSetInitialTransform(new$6(x$1, y$1, zoom$1)));
              } else {
                return new Error(undefined);
              }
            } else {
              return new Error(undefined);
            }
          }
        }
      }
    }),
    on_property_change("transform", (() => {
      let _pipe = decoder();
      return map4(_pipe, (var0) => {
        return new ParentUpdatedTransform(var0);
      });
    })())
  ]);
}
function set_transform4(transform) {
  return before_paint((_, shadow_root) => {
    let matrix = to_css_matrix(transform.value);
    return set_transform3(shadow_root, matrix);
  });
}
function init8(_) {
  let model = new Model6(new$8(init2()), new None, make2(), new$9(), new Settled, new None, init(), new None);
  let effect = batch(toList([
    provide_transform(model.transform.value),
    provide_scale(model.transform.value[2]),
    provide_connection(new None),
    set_transform4(model.transform),
    add_resize_observer2()
  ]));
  return [model, effect];
}
function add_window_mousemove_listener4() {
  return from2((dispatch2) => {
    let decoder4 = (msg) => {
      return field("clientX", float2, (client_x) => {
        return field("clientY", float2, (client_y) => {
          return success(msg(client_x, client_y));
        });
      });
    };
    return add_window_mousemove_listener3((event4) => {
      let $ = run(event4, decoder4((var0, var1) => {
        return new UserStoppedPanning(var0, var1);
      }));
      if ($ instanceof Ok) {
        let msg = $[0];
        return dispatch2(msg);
      } else {
        return;
      }
    }, (event4) => {
      let $ = run(event4, decoder4((var0, var1) => {
        return new UserPannedViewport(var0, var1);
      }));
      if ($ instanceof Ok) {
        let msg = $[0];
        return dispatch2(msg);
      } else {
        return;
      }
    });
  });
}
function observe_node2(observer, element4) {
  return from2((_) => {
    return observe_node(observer, element4);
  });
}
function update10(model, msg) {
  if (msg instanceof EdgeDisconnected) {
    let from4 = msg.from;
    let to2 = msg.to;
    let edges = delete$3(model.edges, from4, to2);
    let model$1 = new Model6(model.transform, model.observer, model.handles, edges, model.panning, model.connection, model.bounds, model.selected);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof EdgeConnected) {
    let source = msg.from;
    let target = msg.to;
    let kind = msg.kind;
    let from_key = source.node + " " + source.name;
    let to_key = target.node + " " + target.name;
    return guard(has_key2(model.handles, from_key), [model, none()], () => {
      return guard(has_key2(model.handles, to_key), [model, none()], () => {
        let from4 = get3(model.handles, from_key);
        let to2 = get3(model.handles, to_key);
        let edges = insert6(model.edges, source, from4, target, to2, kind);
        let model$1 = new Model6(model.transform, model.observer, model.handles, edges, model.panning, model.connection, model.bounds, model.selected);
        let effect = none();
        return [model$1, effect];
      });
    });
  } else if (msg instanceof EdgeReconnected) {
    let prev = msg.prev;
    let next = msg.next;
    let kind = msg.kind;
    let edges = delete$3(model.edges, prev[0], prev[1]);
    let from_key = next[0].node + " " + next[0].name;
    let to_key = next[1].node + " " + next[1].name;
    return guard(has_key2(model.handles, from_key), [
      new Model6(model.transform, model.observer, model.handles, edges, model.panning, model.connection, model.bounds, model.selected),
      none()
    ], () => {
      return guard(has_key2(model.handles, to_key), [
        new Model6(model.transform, model.observer, model.handles, edges, model.panning, model.connection, model.bounds, model.selected),
        none()
      ], () => {
        let from4 = get3(model.handles, from_key);
        let to2 = get3(model.handles, to_key);
        let edges$1 = insert6(edges, next[0], from4, next[1], to2, kind);
        let model$1 = new Model6(model.transform, model.observer, model.handles, edges$1, model.panning, model.connection, model.bounds, model.selected);
        let effect = none();
        return [model$1, effect];
      });
    });
  } else if (msg instanceof EdgesMounted) {
    let edges = msg.edges;
    let edges$1 = fold2(edges, new$9(), (edges2, edge) => {
      let source = edge[0];
      let target = edge[1];
      let $ = get4(model.edges, source, target);
      if ($ instanceof Ok) {
        let existing = $[0];
        return insert_edge(edges2, source, target, existing);
      } else {
        let from_key = edge[0].node + " " + edge[0].name;
        let to_key = edge[1].node + " " + edge[1].name;
        let has_from = has_key2(model.handles, from_key);
        let has_to = has_key2(model.handles, to_key);
        if (has_from) {
          if (has_to) {
            return insert6(edges2, edge[0], get3(model.handles, from_key), edge[1], get3(model.handles, to_key), edge[2]);
          } else {
            return insert6(edges2, edge[0], get3(model.handles, from_key), edge[1], [0, 0], edge[2]);
          }
        } else if (has_to) {
          return insert6(edges2, edge[0], [0, 0], edge[1], get3(model.handles, to_key), edge[2]);
        } else {
          return insert6(edges2, edge[0], [0, 0], edge[1], [0, 0], edge[2]);
        }
      }
    });
    let model$1 = new Model6(model.transform, model.observer, model.handles, edges$1, model.panning, model.connection, model.bounds, model.selected);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof InertiaSimulationTicked2) {
    let $ = tick2(model.panning, new InertiaSimulationTicked2);
    let panning;
    let vx;
    let vy;
    let inertia_effect;
    panning = $[0];
    vx = $[1];
    vy = $[2];
    inertia_effect = $[3];
    let nx = model.transform.value[0] + vx;
    let ny = model.transform.value[1] + vy;
    let new_transform = new$6(nx, ny, model.transform.value[2]);
    let model$1 = new Model6(update4(model.transform, new_transform), model.observer, model.handles, model.edges, panning, model.connection, model.bounds, model.selected);
    let _block;
    let $1 = model$1.transform.state;
    if ($1 instanceof Unchanged) {
      _block = batch(toList([
        inertia_effect,
        set_transform4(model$1.transform),
        provide_transform(model$1.transform.value),
        emit_pan(new_transform)
      ]));
    } else if ($1 instanceof Touched) {
      _block = batch(toList([
        inertia_effect,
        set_transform4(model$1.transform),
        provide_transform(model$1.transform.value),
        emit_pan(new_transform)
      ]));
    } else {
      _block = batch(toList([inertia_effect, emit_pan(new_transform)]));
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof NodeMounted) {
    let element$1 = msg.element;
    let $ = model.observer;
    if ($ instanceof Some) {
      let observer = $[0];
      return [model, observe_node2(observer, element$1)];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof NodesMoved) {
    let changes = msg[0];
    let init$1 = [model.handles, model.edges];
    let $ = fold(changes, init$1, (acc, node, change) => {
      let dx;
      let dy;
      dx = change[0];
      dy = change[1];
      let handles2 = fold4(model.handles, acc[0], (handles3, key, position2) => {
        let $1 = starts_with(key, node + " ");
        if ($1) {
          return insert5(handles3, key, [position2[0] + dx, position2[1] + dy]);
        } else {
          return insert5(handles3, key, position2);
        }
      });
      let edges2 = update_node(acc[1], node, [dx, dy]);
      return [handles2, edges2];
    });
    let handles;
    let edges;
    handles = $[0];
    edges = $[1];
    let model$1 = new Model6(model.transform, model.observer, handles, edges, model.panning, model.connection, model.bounds, model.selected);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof NodeResizeObserverStarted) {
    let observer = msg.observer;
    let model$1 = new Model6(model.transform, new Some(observer), model.handles, model.edges, model.panning, model.connection, model.bounds, model.selected);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof NodesResized) {
    let changes = msg.changes;
    let $ = fold2(changes, [model.handles, model.edges], (acc, change) => {
      let position2 = [
        divideFloat(change[2] - model.transform.value[0], model.transform.value[2]),
        divideFloat(change[3] - model.transform.value[1], model.transform.value[2])
      ];
      let handle2 = new Handle(change[0], change[1]);
      let handles2 = insert5(acc[0], change[0] + " " + change[1], position2);
      let edges2 = update9(acc[1], handle2, position2);
      return [handles2, edges2];
    });
    let handles;
    let edges;
    handles = $[0];
    edges = $[1];
    let model$1 = new Model6(model.transform, model.observer, handles, edges, model.panning, model.connection, model.bounds, model.selected);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetInitialTransform) {
    let new_transform = msg.transform;
    let transform$1 = uncontrolled(model.transform, new_transform);
    let model$1 = new Model6(transform$1, model.observer, model.handles, model.edges, model.panning, model.connection, model.bounds, model.selected);
    let effect = batch(toList([
      set_transform4(model$1.transform),
      provide_transform(model$1.transform.value),
      provide_scale(model$1.transform.value[2])
    ]));
    return [model$1, effect];
  } else if (msg instanceof ParentUpdatedTransform) {
    let new_transform = msg.transform;
    let transform$1 = controlled(new_transform);
    let model$1 = new Model6(transform$1, model.observer, model.handles, model.edges, model.panning, model.connection, model.bounds, model.selected);
    let effect = batch(toList([
      set_transform4(model$1.transform),
      provide_transform(model$1.transform.value),
      provide_scale(model$1.transform.value[2])
    ]));
    return [model$1, effect];
  } else if (msg instanceof UserCompletedConnection2) {
    let $ = model.connection;
    if ($ instanceof Some) {
      return [
        new Model6(model.transform, model.observer, model.handles, model.edges, model.panning, new None, model.bounds, model.selected),
        batch(toList([
          provide_connection(new None),
          remove_pseudo_state2("connecting")
        ]))
      ];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof UserPannedViewport) {
    let x = msg.x;
    let y = msg.y;
    let $ = model.connection;
    if ($ instanceof Some) {
      let connection = $[0][0];
      let world_x = divideFloat(x - model.bounds[0] - model.transform.value[0], model.transform.value[2]);
      let world_y = divideFloat(y - model.bounds[1] - model.transform.value[1], model.transform.value[2]);
      let position2 = [world_x, world_y];
      let model$1 = new Model6(model.transform, model.observer, model.handles, model.edges, model.panning, new Some([connection, position2]), model.bounds, model.selected);
      let effect = none();
      return [model$1, effect];
    } else {
      let $1 = update3(model.panning, x, y);
      let panning;
      let dx;
      let dy;
      panning = $1[0];
      dx = $1[1];
      dy = $1[2];
      return guard(dx === 0 && dy === 0, [
        new Model6(model.transform, model.observer, model.handles, model.edges, panning, model.connection, model.bounds, model.selected),
        none()
      ], () => {
        let nx = model.transform.value[0] + dx;
        let ny = model.transform.value[1] + dy;
        let new_transform = [nx, ny, model.transform.value[2]];
        let model$1 = new Model6(update4(model.transform, new_transform), model.observer, model.handles, model.edges, panning, model.connection, model.bounds, model.selected);
        let _block;
        let $2 = model$1.transform.state;
        if ($2 instanceof Unchanged) {
          _block = batch(toList([
            set_transform4(model$1.transform),
            provide_transform(model$1.transform.value),
            emit_pan(new_transform)
          ]));
        } else if ($2 instanceof Touched) {
          _block = batch(toList([
            set_transform4(model$1.transform),
            provide_transform(model$1.transform.value),
            emit_pan(new_transform)
          ]));
        } else {
          _block = emit_pan(new_transform);
        }
        let effect = _block;
        return [model$1, effect];
      });
    }
  } else if (msg instanceof UserSelectedEdge) {
    let id2 = msg.id;
    let model$1 = new Model6(model.transform, model.observer, model.handles, model.edges, model.panning, model.connection, model.bounds, new Some(new Edge(id2)));
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof UserSelectedNode2) {
    let id2 = msg.id;
    let model$1 = new Model6(model.transform, model.observer, model.handles, model.edges, model.panning, model.connection, model.bounds, new Some(new Node(id2)));
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof UserStartedConnection2) {
    let source = msg.source;
    let key = source.node + " " + source.name;
    let $ = has_key2(model.handles, key);
    if ($) {
      let from4 = get3(model.handles, key);
      let model$1 = new Model6(model.transform, model.observer, model.handles, model.edges, model.panning, new Some([source, from4]), model.bounds, model.selected);
      let effect = batch(toList([
        provide_connection(new Some([source.node, source.name])),
        set_pseudo_state2("connecting"),
        add_window_mousemove_listener4()
      ]));
      return [model$1, effect];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof UserStartedPanning) {
    let x = msg.x;
    let y = msg.y;
    let model$1 = new Model6(model.transform, model.observer, model.handles, model.edges, start5(x, y), model.connection, model.bounds, model.selected);
    let effect = batch(toList([
      add_window_mousemove_listener4(),
      set_pseudo_state2("dragging")
    ]));
    return [model$1, effect];
  } else if (msg instanceof UserStoppedPanning) {
    let x = msg.x;
    let y = msg.y;
    let $ = stop(model.panning, new InertiaSimulationTicked2);
    let panning;
    let effect;
    panning = $[0];
    effect = $[1];
    let world_x = divideFloat(x - model.bounds[0] - model.transform.value[0], model.transform.value[2]);
    let world_y = divideFloat(y - model.bounds[1] - model.transform.value[1], model.transform.value[2]);
    let _block;
    let $1 = model.connection;
    if ($1 instanceof Some) {
      let from4 = $1[0];
      _block = batch(toList([
        emit_connection_cancel([from4[0].node, from4[0].name], world_x, world_y),
        remove_pseudo_state2("connecting"),
        provide_connection(new None)
      ]));
    } else {
      _block = batch(toList([effect, remove_pseudo_state2("dragging")]));
    }
    let effect$1 = _block;
    let model$1 = new Model6(model.transform, model.observer, model.handles, model.edges, panning, new None, model.bounds, model.selected);
    return [model$1, effect$1];
  } else if (msg instanceof UserZoomedViewport) {
    let client_x = msg.client_x;
    let client_y = msg.client_y;
    let delta = msg.delta;
    let x = client_x - model.bounds[0];
    let y = client_y - model.bounds[1];
    let _block;
    let $ = delta > 0;
    if ($) {
      _block = 1 + delta * 0.01;
    } else {
      _block = divideFloat(1, 1 + absolute_value(delta) * 0.01);
    }
    let zoom_factor = _block;
    let min_scale = 0.5;
    let max_scale = 2;
    let new_scale = model.transform.value[2] * zoom_factor;
    let _block$1;
    let s = new_scale;
    if (s < min_scale) {
      _block$1 = min_scale;
    } else {
      let s2 = new_scale;
      if (s2 > max_scale) {
        _block$1 = max_scale;
      } else {
        _block$1 = new_scale;
      }
    }
    let clamped_scale = _block$1;
    return guard(clamped_scale === model.transform.value[2], [model, none()], () => {
      let world_x = divideFloat(x - model.transform.value[0], model.transform.value[2]);
      let world_y = divideFloat(y - model.transform.value[1], model.transform.value[2]);
      let nx = x - world_x * clamped_scale;
      let ny = y - world_y * clamped_scale;
      let new_transform = new$6(nx, ny, clamped_scale);
      let model$1 = new Model6(update4(model.transform, new_transform), model.observer, model.handles, model.edges, model.panning, model.connection, model.bounds, model.selected);
      let _block$2;
      let $1 = model$1.transform.state;
      if ($1 instanceof Unchanged) {
        _block$2 = batch(toList([
          provide_scale(model$1.transform.value[2]),
          set_transform4(model$1.transform),
          provide_transform(model$1.transform.value),
          emit_zoom(new_transform)
        ]));
      } else if ($1 instanceof Touched) {
        _block$2 = batch(toList([
          provide_scale(model$1.transform.value[2]),
          set_transform4(model$1.transform),
          provide_transform(model$1.transform.value),
          emit_zoom(new_transform)
        ]));
      } else {
        _block$2 = emit_zoom(new_transform);
      }
      let effect = _block$2;
      return [model$1, effect];
    });
  } else {
    let bounds = msg.bounds;
    let model$1 = new Model6(model.transform, model.observer, model.handles, model.edges, model.panning, model.connection, bounds, model.selected);
    let effect = emit_resize(bounds);
    return [model$1, effect];
  }
}
function view_container(children2) {
  let handle_mousedown = field("target", element_decoder(), (target) => {
    return field("clientX", float2, (client_x) => {
      return field("clientY", float2, (client_y) => {
        let dispatch2 = new UserStartedPanning(client_x, client_y);
        let success2 = success(handler(dispatch2, false, true));
        let failure2 = failure(handler(dispatch2, false, false), "");
        let _block;
        let _pipe = nearest(target, '[data-clique-disable~="drag"]');
        let _pipe$1 = lazy_or(_pipe, () => {
          return nearest(target, '[slot="overlay"]');
        });
        _block = is_ok(_pipe$1);
        let ignore = _block;
        if (ignore) {
          return failure2;
        } else {
          return success2;
        }
      });
    });
  });
  let handle_wheel = field("clientX", float2, (client_x) => {
    return field("clientY", float2, (client_y) => {
      return field("deltaY", float2, (delta) => {
        return success(new UserZoomedViewport(client_x, client_y, delta));
      });
    });
  });
  return div(toList([
    id("container"),
    advanced("mousedown", handle_mousedown),
    (() => {
      let _pipe = on("wheel", handle_wheel);
      return prevent_default(_pipe);
    })(),
    style("touch-action", "none")
  ]), children2);
}
function view_viewport(children2) {
  return div(toList([id("viewport")]), children2);
}
function view_connection_line(handles, handle2, to2) {
  let key = handle2.node + " " + handle2.name;
  let $ = has_key2(handles, key);
  if ($) {
    let from4 = get3(handles, key);
    let $1 = bezier(from4[0], from4[1], new Right, to2[0], to2[1], new Left);
    let path2;
    path2 = $1[0];
    return svg(toList([id("connection-line")]), toList([
      path(toList([
        attribute2("d", path2),
        attribute2("fill", "none"),
        attribute2("stroke", "#000"),
        attribute2("stroke-width", "2")
      ]))
    ]));
  } else {
    return none2();
  }
}
function view6(model) {
  let handle_slotchange = field("target", element_decoder(), (target) => {
    let assigned_elements2 = assigned_elements(target);
    let edges2 = filter_map(assigned_elements2, (element4) => {
      return try$(attribute3(element4, "from"), (from4) => {
        return try$(attribute3(element4, "to"), (to2) => {
          let _block;
          let _pipe = attribute3(element4, "type");
          _block = unwrap2(_pipe, "bezier");
          let kind = _block;
          let $2 = split2(from4, " ");
          let $1 = split2(to2, " ");
          if ($2 instanceof Empty) {
            return new Error(undefined);
          } else if ($1 instanceof Empty) {
            return new Error(undefined);
          } else {
            let $22 = $2.tail;
            if ($22 instanceof Empty) {
              return new Error(undefined);
            } else {
              let $3 = $1.tail;
              if ($3 instanceof Empty) {
                return new Error(undefined);
              } else {
                let $4 = $22.tail;
                if ($4 instanceof Empty) {
                  let $5 = $3.tail;
                  if ($5 instanceof Empty) {
                    let from_node2 = $2.head;
                    let to_node = $1.head;
                    let from_name = $22.head;
                    let to_name = $3.head;
                    if (from_node2 !== "" && from_name !== "" && to_node !== "" && to_name !== "") {
                      return new Ok([
                        new Handle(from_node2, from_name),
                        new Handle(to_node, to_name),
                        kind
                      ]);
                    } else {
                      return new Error(undefined);
                    }
                  } else {
                    return new Error(undefined);
                  }
                } else {
                  return new Error(undefined);
                }
              }
            }
          }
        });
      });
    });
    return success(new EdgesMounted(edges2));
  });
  let $ = fold5(model.edges, [toList([]), toList([])], (acc, key, edge) => {
    let edges2 = prepend([
      key,
      path(toList([
        attribute2("d", edge.path),
        attribute2("fill", "none"),
        attribute2("stroke-width", "2"),
        attribute2("shape-rendering", "geometricPrecision"),
        attribute2("stroke-linecap", "round"),
        attribute2("stroke-linejoin", "round"),
        attribute2("vector-effect", "non-scaling-stroke"),
        style("stroke", "var(--clique-edge-colour, black)")
      ]))
    ], acc[1]);
    let var$ = kebab_case("from-" + edge.source.node + "-" + edge.source.name + "-to-" + edge.target.node + "-" + edge.target.name);
    let cx = "--" + var$ + "-cx";
    let cy = "--" + var$ + "-cy";
    let positions2 = prepend([
      key,
      text3("::slotted(clique-edge) { " + cx + ": " + float_to_string(edge.cx) + "px; " + cy + ": " + float_to_string(edge.cy) + "px; }")
    ], acc[0]);
    return [positions2, edges2];
  });
  let positions;
  let edges;
  positions = $[0];
  edges = $[1];
  return fragment2(toList([
    style2(toList([]), `
      :host {
          cursor: grab;
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
          contain: layout style paint;
          will-change: scroll-position;
      }

      :host(:state(dragging)), :host(:state(connecting)) {
        cursor: grabbing;
      }

      :host(:state(dragging)) #viewport {
        will-change: transform;
      }

      #container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          contain: layout paint;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
          position: relative;
      }

      #viewport {
          -moz-osx-font-smoothing: grayscale;
          -webkit-font-smoothing: antialiased;
          contain: layout style;
          height: 100%;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          isolation: isolate;
          overflow: visible;
          position: absolute;
          text-rendering: optimizeLegibility;
          transform-origin: 0 0;
          transition: none;
          width: 100%;
      }

      #connection-line {
        width: 100%;
        height: 100%;
        overflow: visible;
        position: absolute;
        top: 0;
        left: 0;
        will-change: transform;
        pointer-events: none;
      }
      `),
    element3("style", toList([]), positions),
    view_container(toList([
      named_slot("background", toList([]), toList([])),
      view_viewport(toList([
        namespaced2(namespace, "svg", toList([
          attribute2("width", "100%"),
          attribute2("height", "100%"),
          attribute2("shape-rendering", "geometricPrecision"),
          styles(toList([
            ["overflow", "visible"],
            ["position", "absolute"],
            ["top", "0"],
            ["left", "0"],
            ["will-change", "transform"],
            ["pointer-events", "none"]
          ]))
        ]), edges),
        named_slot("edges", toList([
          on("slotchange", handle_slotchange),
          on_connect((var0, var1, var2) => {
            return new EdgeConnected(var0, var1, var2);
          }),
          on_disconnect((var0, var1) => {
            return new EdgeDisconnected(var0, var1);
          }),
          on_reconnect((var0, var1, var2) => {
            return new EdgeReconnected(var0, var1, var2);
          })
        ]), toList([])),
        root6(toList([
          on_changes((var0) => {
            return new NodesMoved(var0);
          })
        ]), toList([
          default_slot(toList([
            on_mount((var0, var1) => {
              return new NodeMounted(var0, var1);
            }),
            on_select((var0) => {
              return new UserSelectedNode2(var0);
            }),
            on_connection_start((var0) => {
              return new UserStartedConnection2(var0);
            }),
            on_connection_complete((_, _1) => {
              return new UserCompletedConnection2;
            })
          ]), toList([]))
        ])),
        (() => {
          let $1 = model.connection;
          if ($1 instanceof Some) {
            let handle2 = $1[0][0];
            let end = $1[0][1];
            return view_connection_line(model.handles, handle2, end);
          } else {
            return none2();
          }
        })()
      ])),
      named_slot("overlay", toList([]), toList([]))
    ]))
  ]));
}
function register6() {
  return make_component(component(init8, update10, view6, options6()), tag7);
}
function root7(attributes, children2) {
  return element2(tag7, attributes, children2);
}

// build/dev/javascript/clique/clique.mjs
function root8(attributes, children2) {
  return root7(attributes, children2);
}
function background(attributes) {
  return root2(attributes);
}
function edges(children2) {
  return fragment3(children2);
}
function edge(source, target, attributes, children2) {
  return root5(prepend(slot2("edges"), prepend(from3(source), prepend(to(target), attributes))), children2);
}
function nodes(children2) {
  return fragment3(children2);
}
function node(id2, attributes, children2) {
  return root3(prepend(id(id2), attributes), children2);
}
function handle2(name2, attributes) {
  return root4(prepend(name(name2), attributes), toList([]));
}
function register7() {
  return try$(register(), (_) => {
    return try$(register4(), (_2) => {
      return try$(register3(), (_3) => {
        return try$(register2(), (_4) => {
          return try$(register5(), (_5) => {
            return try$(register6(), (_6) => {
              return new Ok(undefined);
            });
          });
        });
      });
    });
  });
}
function initial_transform2(value) {
  return initial_transform(value);
}

// build/dev/javascript/gleam_stdlib/gleam/uri.mjs
class Uri extends CustomType {
  constructor(scheme, userinfo, host, port, path2, query, fragment4) {
    super();
    this.scheme = scheme;
    this.userinfo = userinfo;
    this.host = host;
    this.port = port;
    this.path = path2;
    this.query = query;
    this.fragment = fragment4;
  }
}
var empty3 = /* @__PURE__ */ new Uri(/* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, "", /* @__PURE__ */ new None, /* @__PURE__ */ new None);
function is_valid_host_within_brackets_char(char) {
  return 48 >= char && char <= 57 || 65 >= char && char <= 90 || 97 >= char && char <= 122 || char === 58 || char === 46;
}
function parse_fragment(rest, pieces) {
  return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, new Some(rest)));
}
function parse_query_with_question_mark_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size5 = loop$size;
    if (uri_string.startsWith("#")) {
      if (size5 === 0) {
        let rest = uri_string.slice(1);
        return parse_fragment(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let query = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, pieces.path, new Some(query), pieces.fragment);
        return parse_fragment(rest, pieces$1);
      }
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, pieces.path, new Some(original), pieces.fragment));
    } else {
      let $ = pop_codeunit(uri_string);
      let rest;
      rest = $[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size5 + 1;
    }
  }
}
function parse_query_with_question_mark(uri_string, pieces) {
  return parse_query_with_question_mark_loop(uri_string, uri_string, pieces, 0);
}
function parse_path_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size5 = loop$size;
    if (uri_string.startsWith("?")) {
      let rest = uri_string.slice(1);
      let path2 = string_codeunit_slice(original, 0, size5);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, path2, pieces.query, pieces.fragment);
      return parse_query_with_question_mark(rest, pieces$1);
    } else if (uri_string.startsWith("#")) {
      let rest = uri_string.slice(1);
      let path2 = string_codeunit_slice(original, 0, size5);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, path2, pieces.query, pieces.fragment);
      return parse_fragment(rest, pieces$1);
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, original, pieces.query, pieces.fragment));
    } else {
      let $ = pop_codeunit(uri_string);
      let rest;
      rest = $[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size5 + 1;
    }
  }
}
function parse_path(uri_string, pieces) {
  return parse_path_loop(uri_string, uri_string, pieces, 0);
}
function parse_port_loop(loop$uri_string, loop$pieces, loop$port) {
  while (true) {
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let port = loop$port;
    if (uri_string.startsWith("0")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10;
    } else if (uri_string.startsWith("1")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 1;
    } else if (uri_string.startsWith("2")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 2;
    } else if (uri_string.startsWith("3")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 3;
    } else if (uri_string.startsWith("4")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 4;
    } else if (uri_string.startsWith("5")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 5;
    } else if (uri_string.startsWith("6")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 6;
    } else if (uri_string.startsWith("7")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 7;
    } else if (uri_string.startsWith("8")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 8;
    } else if (uri_string.startsWith("9")) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 9;
    } else if (uri_string.startsWith("?")) {
      let rest = uri_string.slice(1);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment);
      return parse_query_with_question_mark(rest, pieces$1);
    } else if (uri_string.startsWith("#")) {
      let rest = uri_string.slice(1);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment);
      return parse_fragment(rest, pieces$1);
    } else if (uri_string.startsWith("/")) {
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment);
      return parse_path(uri_string, pieces$1);
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment));
    } else {
      return new Error(undefined);
    }
  }
}
function parse_port(uri_string, pieces) {
  if (uri_string.startsWith(":0")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 0);
  } else if (uri_string.startsWith(":1")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 1);
  } else if (uri_string.startsWith(":2")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 2);
  } else if (uri_string.startsWith(":3")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 3);
  } else if (uri_string.startsWith(":4")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 4);
  } else if (uri_string.startsWith(":5")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 5);
  } else if (uri_string.startsWith(":6")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 6);
  } else if (uri_string.startsWith(":7")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 7);
  } else if (uri_string.startsWith(":8")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 8);
  } else if (uri_string.startsWith(":9")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 9);
  } else if (uri_string === ":") {
    return new Ok(pieces);
  } else if (uri_string === "") {
    return new Ok(pieces);
  } else if (uri_string.startsWith("?")) {
    let rest = uri_string.slice(1);
    return parse_query_with_question_mark(rest, pieces);
  } else if (uri_string.startsWith(":?")) {
    let rest = uri_string.slice(2);
    return parse_query_with_question_mark(rest, pieces);
  } else if (uri_string.startsWith("#")) {
    let rest = uri_string.slice(1);
    return parse_fragment(rest, pieces);
  } else if (uri_string.startsWith(":#")) {
    let rest = uri_string.slice(2);
    return parse_fragment(rest, pieces);
  } else if (uri_string.startsWith("/")) {
    return parse_path(uri_string, pieces);
  } else if (uri_string.startsWith(":")) {
    let rest = uri_string.slice(1);
    if (rest.startsWith("/")) {
      return parse_path(rest, pieces);
    } else {
      return new Error(undefined);
    }
  } else {
    return new Error(undefined);
  }
}
function parse_host_outside_of_brackets_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size5 = loop$size;
    if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(original), pieces.port, pieces.path, pieces.query, pieces.fragment));
    } else if (uri_string.startsWith(":")) {
      let host = string_codeunit_slice(original, 0, size5);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_port(uri_string, pieces$1);
    } else if (uri_string.startsWith("/")) {
      let host = string_codeunit_slice(original, 0, size5);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_path(uri_string, pieces$1);
    } else if (uri_string.startsWith("?")) {
      let rest = uri_string.slice(1);
      let host = string_codeunit_slice(original, 0, size5);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_query_with_question_mark(rest, pieces$1);
    } else if (uri_string.startsWith("#")) {
      let rest = uri_string.slice(1);
      let host = string_codeunit_slice(original, 0, size5);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_fragment(rest, pieces$1);
    } else {
      let $ = pop_codeunit(uri_string);
      let rest;
      rest = $[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size5 + 1;
    }
  }
}
function parse_host_within_brackets_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size5 = loop$size;
    if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(uri_string), pieces.port, pieces.path, pieces.query, pieces.fragment));
    } else if (uri_string.startsWith("]")) {
      if (size5 === 0) {
        let rest = uri_string.slice(1);
        return parse_port(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let host = string_codeunit_slice(original, 0, size5 + 1);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_port(rest, pieces$1);
      }
    } else if (uri_string.startsWith("/")) {
      if (size5 === 0) {
        return parse_path(uri_string, pieces);
      } else {
        let host = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_path(uri_string, pieces$1);
      }
    } else if (uri_string.startsWith("?")) {
      if (size5 === 0) {
        let rest = uri_string.slice(1);
        return parse_query_with_question_mark(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let host = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_query_with_question_mark(rest, pieces$1);
      }
    } else if (uri_string.startsWith("#")) {
      if (size5 === 0) {
        let rest = uri_string.slice(1);
        return parse_fragment(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let host = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_fragment(rest, pieces$1);
      }
    } else {
      let $ = pop_codeunit(uri_string);
      let char;
      let rest;
      char = $[0];
      rest = $[1];
      let $1 = is_valid_host_within_brackets_char(char);
      if ($1) {
        loop$original = original;
        loop$uri_string = rest;
        loop$pieces = pieces;
        loop$size = size5 + 1;
      } else {
        return parse_host_outside_of_brackets_loop(original, original, pieces, 0);
      }
    }
  }
}
function parse_host_within_brackets(uri_string, pieces) {
  return parse_host_within_brackets_loop(uri_string, uri_string, pieces, 0);
}
function parse_host_outside_of_brackets(uri_string, pieces) {
  return parse_host_outside_of_brackets_loop(uri_string, uri_string, pieces, 0);
}
function parse_host(uri_string, pieces) {
  if (uri_string.startsWith("[")) {
    return parse_host_within_brackets(uri_string, pieces);
  } else if (uri_string.startsWith(":")) {
    let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(""), pieces.port, pieces.path, pieces.query, pieces.fragment);
    return parse_port(uri_string, pieces$1);
  } else if (uri_string === "") {
    return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(""), pieces.port, pieces.path, pieces.query, pieces.fragment));
  } else {
    return parse_host_outside_of_brackets(uri_string, pieces);
  }
}
function parse_userinfo_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size5 = loop$size;
    if (uri_string.startsWith("@")) {
      if (size5 === 0) {
        let rest = uri_string.slice(1);
        return parse_host(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let userinfo = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(pieces.scheme, new Some(userinfo), pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_host(rest, pieces$1);
      }
    } else if (uri_string === "") {
      return parse_host(original, pieces);
    } else if (uri_string.startsWith("/")) {
      return parse_host(original, pieces);
    } else if (uri_string.startsWith("?")) {
      return parse_host(original, pieces);
    } else if (uri_string.startsWith("#")) {
      return parse_host(original, pieces);
    } else {
      let $ = pop_codeunit(uri_string);
      let rest;
      rest = $[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size5 + 1;
    }
  }
}
function parse_authority_pieces(string5, pieces) {
  return parse_userinfo_loop(string5, string5, pieces, 0);
}
function parse_authority_with_slashes(uri_string, pieces) {
  if (uri_string === "//") {
    return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(""), pieces.port, pieces.path, pieces.query, pieces.fragment));
  } else if (uri_string.startsWith("//")) {
    let rest = uri_string.slice(2);
    return parse_authority_pieces(rest, pieces);
  } else {
    return parse_path(uri_string, pieces);
  }
}
function parse_scheme_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size5 = loop$size;
    if (uri_string.startsWith("/")) {
      if (size5 === 0) {
        return parse_authority_with_slashes(uri_string, pieces);
      } else {
        let scheme = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_authority_with_slashes(uri_string, pieces$1);
      }
    } else if (uri_string.startsWith("?")) {
      if (size5 === 0) {
        let rest = uri_string.slice(1);
        return parse_query_with_question_mark(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let scheme = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_query_with_question_mark(rest, pieces$1);
      }
    } else if (uri_string.startsWith("#")) {
      if (size5 === 0) {
        let rest = uri_string.slice(1);
        return parse_fragment(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let scheme = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_fragment(rest, pieces$1);
      }
    } else if (uri_string.startsWith(":")) {
      if (size5 === 0) {
        return new Error(undefined);
      } else {
        let rest = uri_string.slice(1);
        let scheme = string_codeunit_slice(original, 0, size5);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_authority_with_slashes(rest, pieces$1);
      }
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, original, pieces.query, pieces.fragment));
    } else {
      let $ = pop_codeunit(uri_string);
      let rest;
      rest = $[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size5 + 1;
    }
  }
}
function remove_dot_segments_loop(loop$input, loop$accumulator) {
  while (true) {
    let input = loop$input;
    let accumulator = loop$accumulator;
    if (input instanceof Empty) {
      return reverse(accumulator);
    } else {
      let segment = input.head;
      let rest = input.tail;
      let _block;
      if (segment === "") {
        _block = accumulator;
      } else if (segment === ".") {
        _block = accumulator;
      } else if (segment === "..") {
        if (accumulator instanceof Empty) {
          _block = accumulator;
        } else {
          let accumulator$12 = accumulator.tail;
          _block = accumulator$12;
        }
      } else {
        let segment$1 = segment;
        let accumulator$12 = accumulator;
        _block = prepend(segment$1, accumulator$12);
      }
      let accumulator$1 = _block;
      loop$input = rest;
      loop$accumulator = accumulator$1;
    }
  }
}
function remove_dot_segments(input) {
  return remove_dot_segments_loop(input, toList([]));
}
function to_string6(uri) {
  let _block;
  let $ = uri.fragment;
  if ($ instanceof Some) {
    let fragment4 = $[0];
    _block = toList(["#", fragment4]);
  } else {
    _block = toList([]);
  }
  let parts = _block;
  let _block$1;
  let $1 = uri.query;
  if ($1 instanceof Some) {
    let query = $1[0];
    _block$1 = prepend("?", prepend(query, parts));
  } else {
    _block$1 = parts;
  }
  let parts$1 = _block$1;
  let parts$2 = prepend(uri.path, parts$1);
  let _block$2;
  let $2 = uri.host;
  let $3 = starts_with(uri.path, "/");
  if ($2 instanceof Some && !$3) {
    let host = $2[0];
    if (host !== "") {
      _block$2 = prepend("/", parts$2);
    } else {
      _block$2 = parts$2;
    }
  } else {
    _block$2 = parts$2;
  }
  let parts$3 = _block$2;
  let _block$3;
  let $4 = uri.host;
  let $5 = uri.port;
  if ($4 instanceof Some && $5 instanceof Some) {
    let port = $5[0];
    _block$3 = prepend(":", prepend(to_string(port), parts$3));
  } else {
    _block$3 = parts$3;
  }
  let parts$4 = _block$3;
  let _block$4;
  let $6 = uri.scheme;
  let $7 = uri.userinfo;
  let $8 = uri.host;
  if ($6 instanceof Some) {
    if ($7 instanceof Some) {
      if ($8 instanceof Some) {
        let s = $6[0];
        let u = $7[0];
        let h = $8[0];
        _block$4 = prepend(s, prepend("://", prepend(u, prepend("@", prepend(h, parts$4)))));
      } else {
        let s = $6[0];
        _block$4 = prepend(s, prepend(":", parts$4));
      }
    } else if ($8 instanceof Some) {
      let s = $6[0];
      let h = $8[0];
      _block$4 = prepend(s, prepend("://", prepend(h, parts$4)));
    } else {
      let s = $6[0];
      _block$4 = prepend(s, prepend(":", parts$4));
    }
  } else if ($7 instanceof None && $8 instanceof Some) {
    let h = $8[0];
    _block$4 = prepend("//", prepend(h, parts$4));
  } else {
    _block$4 = parts$4;
  }
  let parts$5 = _block$4;
  return concat2(parts$5);
}
function drop_last(elements) {
  return take(elements, length2(elements) - 1);
}
function join_segments(segments) {
  return join(prepend("", segments), "/");
}
function merge2(base, relative) {
  let $ = base.scheme;
  if ($ instanceof Some) {
    let $1 = base.host;
    if ($1 instanceof Some) {
      let $2 = relative.host;
      if ($2 instanceof Some) {
        let _block;
        let _pipe = relative.path;
        let _pipe$1 = split2(_pipe, "/");
        let _pipe$2 = remove_dot_segments(_pipe$1);
        _block = join_segments(_pipe$2);
        let path2 = _block;
        let resolved = new Uri(or(relative.scheme, base.scheme), new None, relative.host, or(relative.port, base.port), path2, relative.query, relative.fragment);
        return new Ok(resolved);
      } else {
        let _block;
        let $4 = relative.path;
        if ($4 === "") {
          _block = [base.path, or(relative.query, base.query)];
        } else {
          let _block$1;
          let $5 = starts_with(relative.path, "/");
          if ($5) {
            _block$1 = split2(relative.path, "/");
          } else {
            let _pipe2 = base.path;
            let _pipe$12 = split2(_pipe2, "/");
            let _pipe$2 = drop_last(_pipe$12);
            _block$1 = append2(_pipe$2, split2(relative.path, "/"));
          }
          let path_segments$1 = _block$1;
          let _block$2;
          let _pipe = path_segments$1;
          let _pipe$1 = remove_dot_segments(_pipe);
          _block$2 = join_segments(_pipe$1);
          let path2 = _block$2;
          _block = [path2, relative.query];
        }
        let $3 = _block;
        let new_path;
        let new_query;
        new_path = $3[0];
        new_query = $3[1];
        let resolved = new Uri(base.scheme, new None, base.host, base.port, new_path, new_query, relative.fragment);
        return new Ok(resolved);
      }
    } else {
      return new Error(undefined);
    }
  } else {
    return new Error(undefined);
  }
}
function parse3(uri_string) {
  return parse_scheme_loop(uri_string, uri_string, empty3, 0);
}

// build/dev/javascript/lustre_websocket/ffi.mjs
var init_websocket = (url, on_open, on_text, on_binary, on_close) => {
  let ws;
  if (typeof WebSocket === "function") {
    ws = new WebSocket(url);
  } else {
    ws = {};
  }
  ws.onopen = (_) => on_open(ws);
  ws.onmessage = (event4) => {
    if (typeof event4.data === "string") {
      on_text(event4.data);
    } else {
      on_binary(event4.data);
    }
  };
  ws.onclose = (event4) => on_close(event4.code);
};
var send_over_websocket = (ws, msg) => ws.send(msg);
var get_page_url = () => document.URL;
// build/dev/javascript/lustre_websocket/lustre_websocket.mjs
class Normal2 extends CustomType {
}
class GoingAway extends CustomType {
}
class ProtocolError extends CustomType {
}
class UnexpectedTypeOfData extends CustomType {
}
class NoCodeFromServer extends CustomType {
}
class AbnormalClose extends CustomType {
}
class IncomprehensibleFrame extends CustomType {
}
class PolicyViolated extends CustomType {
}
class MessageTooBig extends CustomType {
}
class FailedExtensionNegotation extends CustomType {
}
class UnexpectedFailure extends CustomType {
}
class FailedTLSHandshake extends CustomType {
}
class OtherCloseReason extends CustomType {
}
class InvalidUrl extends CustomType {
}
class OnOpen extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class OnTextMessage extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class OnBinaryMessage extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class OnClose extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
function code_to_reason(code) {
  if (code === 1000) {
    return new Normal2;
  } else if (code === 1001) {
    return new GoingAway;
  } else if (code === 1002) {
    return new ProtocolError;
  } else if (code === 1003) {
    return new UnexpectedTypeOfData;
  } else if (code === 1005) {
    return new NoCodeFromServer;
  } else if (code === 1006) {
    return new AbnormalClose;
  } else if (code === 1007) {
    return new IncomprehensibleFrame;
  } else if (code === 1008) {
    return new PolicyViolated;
  } else if (code === 1009) {
    return new MessageTooBig;
  } else if (code === 1010) {
    return new FailedExtensionNegotation;
  } else if (code === 1011) {
    return new UnexpectedFailure;
  } else if (code === 1015) {
    return new FailedTLSHandshake;
  } else {
    return new OtherCloseReason;
  }
}
function convert_scheme(scheme) {
  if (scheme === "https") {
    return new Ok("wss");
  } else if (scheme === "http") {
    return new Ok("ws");
  } else if (scheme === "ws") {
    return new Ok(scheme);
  } else if (scheme === "wss") {
    return new Ok(scheme);
  } else {
    return new Error(undefined);
  }
}
function do_get_websocket_path(path2, page_uri) {
  let _block;
  let _pipe = parse3(path2);
  _block = unwrap2(_pipe, new Uri(new None, new None, new None, new None, path2, new None, new None));
  let path_uri = _block;
  return try$(merge2(page_uri, path_uri), (merged) => {
    return try$(to_result(merged.scheme, undefined), (merged_scheme) => {
      return try$(convert_scheme(merged_scheme), (ws_scheme) => {
        let _pipe$1 = new Uri(new Some(ws_scheme), merged.userinfo, merged.host, merged.port, merged.path, merged.query, merged.fragment);
        let _pipe$2 = to_string6(_pipe$1);
        return new Ok(_pipe$2);
      });
    });
  });
}
function send2(ws, msg) {
  return from2((_) => {
    return send_over_websocket(ws, msg);
  });
}
function page_uri() {
  let _pipe = get_page_url();
  return parse3(_pipe);
}
function get_websocket_path(path2) {
  let _pipe = page_uri();
  return try$(_pipe, (_capture) => {
    return do_get_websocket_path(path2, _capture);
  });
}
function init9(path2, wrapper) {
  let _pipe = (dispatch2) => {
    let $ = get_websocket_path(path2);
    if ($ instanceof Ok) {
      let url = $[0];
      return init_websocket(url, (ws) => {
        return dispatch2(wrapper(new OnOpen(ws)));
      }, (text4) => {
        return dispatch2(wrapper(new OnTextMessage(text4)));
      }, (data3) => {
        return dispatch2(wrapper(new OnBinaryMessage(data3)));
      }, (code) => {
        let _pipe2 = code;
        let _pipe$1 = code_to_reason(_pipe2);
        let _pipe$2 = new OnClose(_pipe$1);
        let _pipe$3 = wrapper(_pipe$2);
        return dispatch2(_pipe$3);
      });
    } else {
      let _pipe2 = new InvalidUrl;
      let _pipe$1 = wrapper(_pipe2);
      return dispatch2(_pipe$1);
    }
  };
  return from2(_pipe);
}
// build/dev/javascript/gleam_community_maths/maths.mjs
function sin(float4) {
  return Math.sin(float4);
}
function pi() {
  return Math.PI;
}
function cos(float4) {
  return Math.cos(float4);
}

// build/dev/javascript/gleam_community_maths/gleam_community/maths.mjs
function cos2(x) {
  return cos(x);
}
function sin2(x) {
  return sin(x);
}
function pi2() {
  return pi();
}
// build/dev/javascript/shared/shared/layout.mjs
class GraphLayout extends CustomType {
  constructor(nodes2, edges2) {
    super();
    this.nodes = nodes2;
    this.edges = edges2;
  }
}
class NodeLayout extends CustomType {
  constructor(id2, label, x, y) {
    super();
    this.id = id2;
    this.label = label;
    this.x = x;
    this.y = y;
  }
}
class EdgeLayout extends CustomType {
  constructor(from4, to2, label) {
    super();
    this.from = from4;
    this.to = to2;
    this.label = label;
  }
}
function initial_layout(graph) {
  let nodes2 = graph.nodes;
  let angle_per_node = divideFloat(pi2() * 2, (() => {
    let _pipe = length2(nodes2);
    return identity(_pipe);
  })());
  let new_nodes = index_map(nodes2, (node2, index4) => {
    let next_angle = angle_per_node * identity(index4);
    let x = sin2(next_angle);
    let y = cos2(next_angle);
    return new NodeLayout(node2.id, node2.label, x, y);
  });
  return new GraphLayout(new_nodes, graph.edges);
}
function layout(graph) {
  let _pipe = graph;
  return initial_layout(_pipe);
}
function scale_node(node2, scale) {
  let new_x = node2.x * scale;
  let new_y = node2.y * scale;
  return new NodeLayout(node2.id, node2.label, new_x, new_y);
}

// build/dev/javascript/shared/shared/update/types.mjs
class ServerInitializedGraph extends CustomType {
  constructor(graph) {
    super();
    this.graph = graph;
  }
}
class ClientRequestedFullGraph extends CustomType {
}
class GraphData extends CustomType {
  constructor(nodes2, edges2) {
    super();
    this.nodes = nodes2;
    this.edges = edges2;
  }
}
class NodeData extends CustomType {
  constructor(id2, label) {
    super();
    this.id = id2;
    this.label = label;
  }
}
class EdgeData2 extends CustomType {
  constructor(id2, label, node_id_1, node_id_2) {
    super();
    this.id = id2;
    this.label = label;
    this.node_id_1 = node_id_1;
    this.node_id_2 = node_id_2;
  }
}
function node_data_to_json(node_data) {
  let id2;
  let label;
  id2 = node_data.id;
  label = node_data.label;
  return object2(toList([
    ["id", int3(id2)],
    [
      "label",
      (() => {
        if (label instanceof Some) {
          let value = label[0];
          return string3(value);
        } else {
          return null$();
        }
      })()
    ]
  ]));
}
function node_data_decoder() {
  return field("id", int2, (id2) => {
    return field("label", optional(string2), (label) => {
      return success(new NodeData(id2, label));
    });
  });
}
function edge_data_to_json(edge_data) {
  let id2;
  let label;
  let node_id_1;
  let node_id_2;
  id2 = edge_data.id;
  label = edge_data.label;
  node_id_1 = edge_data.node_id_1;
  node_id_2 = edge_data.node_id_2;
  return object2(toList([
    ["id", int3(id2)],
    [
      "label",
      (() => {
        if (label instanceof Some) {
          let value = label[0];
          return string3(value);
        } else {
          return null$();
        }
      })()
    ],
    ["node_id_1", int3(node_id_1)],
    ["node_id_2", int3(node_id_2)]
  ]));
}
function graph_data_to_json(graph_data) {
  let nodes2;
  let edges2;
  nodes2 = graph_data.nodes;
  edges2 = graph_data.edges;
  return object2(toList([
    ["nodes", array2(nodes2, node_data_to_json)],
    ["edges", array2(edges2, edge_data_to_json)]
  ]));
}
function msg_to_json(msg) {
  if (msg instanceof ServerInitializedGraph) {
    let graph = msg.graph;
    return object2(toList([
      ["type", string3("server_initialized_graph")],
      ["graph", graph_data_to_json(graph)]
    ]));
  } else {
    return object2(toList([["type", string3("client_requested_full_graph")]]));
  }
}
function edge_data_decoder() {
  return field("id", int2, (id2) => {
    return field("label", optional(string2), (label) => {
      return field("node_id_1", int2, (node_id_1) => {
        return field("node_id_2", int2, (node_id_2) => {
          return success(new EdgeData2(id2, label, node_id_1, node_id_2));
        });
      });
    });
  });
}
function graph_data_decoder() {
  return field("nodes", list2(node_data_decoder()), (nodes2) => {
    return field("edges", list2(edge_data_decoder()), (edges2) => {
      return success(new GraphData(nodes2, edges2));
    });
  });
}
function msg_decoder() {
  return field("type", string2, (variant) => {
    if (variant === "server_initialized_graph") {
      return field("graph", graph_data_decoder(), (graph) => {
        return success(new ServerInitializedGraph(graph));
      });
    } else if (variant === "client_requested_full_graph") {
      return success(new ClientRequestedFullGraph);
    } else {
      return failure(new ClientRequestedFullGraph, "Msg");
    }
  });
}

// build/dev/javascript/shared/shared/view.mjs
var scale_from_layout = 1000;
function get_edge_element(edge2) {
  let handle1 = new Handle(edge2.from, "link");
  let handle22 = new Handle(edge2.to, "link");
  return edge(handle1, handle22, toList([linear()]), toList([]));
}
function get_node_element(node2) {
  let attributes = toList([
    position(node2.x, node2.y),
    class$("bg-pink-50 rounded border-2 border-pink-500")
  ]);
  return node(node2.id, attributes, toList([
    div(toList([
      class$("flex relative items-center py-1 px-2 size-16")
    ]), toList([
      handle2("link", toList([
        class$("absolute -left-1 top-1/4 bg-black rounded-full size-2")
      ])),
      (() => {
        let _pipe = map(node2.label, text3);
        return unwrap(_pipe, div(toList([class$("hidden")]), toList([])));
      })()
    ]))
  ]));
}
function view7(model) {
  let transform2 = init2();
  let _block;
  let _pipe = model.nodes;
  let _pipe$1 = map3(_pipe, (node2) => {
    return [
      node2.id,
      (() => {
        let _pipe$12 = scale_node(node2, scale_from_layout);
        return get_node_element(_pipe$12);
      })()
    ];
  });
  _block = nodes(_pipe$1);
  let nodes2 = _block;
  let _block$1;
  let _pipe$2 = model.edges;
  let _pipe$3 = index_map(_pipe$2, (edge2, i) => {
    let edge_element = get_edge_element(edge2);
    return [to_string(i), edge_element];
  });
  _block$1 = edges(_pipe$3);
  let edges2 = _block$1;
  return div(toList([class$("w-screen h-screen font-mono")]), toList([
    root8(toList([
      initial_transform2(transform2),
      class$("w-full h-full bg-white rounded-lg shadow-md")
    ]), toList([
      background(toList([
        lines(),
        class$("text-pink-100 bg-slate-50"),
        gap(50, 50)
      ])),
      background(toList([
        dots(),
        class$("text-pink-200"),
        size4(2),
        gap(50, 50)
      ])),
      nodes2,
      edges2
    ]))
  ]));
}
// build/dev/javascript/client/model.mjs
class Model7 extends CustomType {
  constructor(graph_layout, ws_conn) {
    super();
    this.graph_layout = graph_layout;
    this.ws_conn = ws_conn;
  }
}

// build/dev/javascript/client/update.mjs
var FILEPATH = "src/update.gleam";

class WebSocketMessage extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class AppMessage extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
function data_to_layout(graph_data) {
  let nodes2 = map3(graph_data.nodes, (node2) => {
    let id2 = to_string(node2.id);
    let label = node2.label;
    let x = 0;
    let y = 0;
    return new NodeLayout(id2, label, x, y);
  });
  let edges2 = map3(graph_data.edges, (edge2) => {
    let label = edge2.label;
    let from4 = to_string(edge2.node_id_1);
    let to2 = to_string(edge2.node_id_2);
    return new EdgeLayout(from4, to2, label);
  });
  let _pipe = new GraphLayout(nodes2, edges2);
  return layout(_pipe);
}
function handle_app_msg(model, app_msg) {
  if (app_msg instanceof ServerInitializedGraph) {
    let graph = app_msg.graph;
    return [new Model7(data_to_layout(graph), model.ws_conn), none()];
  } else {
    throw makeError("panic", FILEPATH, "update", 63, "handle_app_msg", "Server sent a ClientRequestedFullGraph message, which should never happen. It's possible your WS connection has been highjacked!", {});
  }
}
function handle_ws_msg(model, ws_message) {
  if (ws_message instanceof InvalidUrl) {
    return [model, none()];
  } else if (ws_message instanceof OnOpen) {
    let ws_conn = ws_message[0];
    return [
      new Model7(model.graph_layout, new Some(ws_conn)),
      send2(ws_conn, (() => {
        let _pipe = msg_to_json(new ClientRequestedFullGraph);
        return to_string2(_pipe);
      })())
    ];
  } else if (ws_message instanceof OnTextMessage) {
    let json2 = ws_message[0];
    let $ = parse(json2, msg_decoder());
    if ($ instanceof Ok) {
      let msg = $[0];
      return handle_app_msg(model, msg);
    } else {
      let reason = $[0];
      throw makeError("panic", FILEPATH, "update", 41, "handle_ws_msg", "Server sent an unknown text frame, which should never happen. It's possible your WS connection has been highjacked! : " + inspect2(reason), {});
    }
  } else if (ws_message instanceof OnBinaryMessage) {
    let bitarray = ws_message[0];
    throw makeError("panic", FILEPATH, "update", 47, "handle_ws_msg", "Server sent an unknown binary frame, which should never happen. It's possible your WS connection has been highjacked! Found binary frame: " + base16_encode(bitarray), {});
  } else {
    return [new Model7(model.graph_layout, new None), none()];
  }
}
function update11(model, message) {
  if (message instanceof WebSocketMessage) {
    let ws_message = message[0];
    return handle_ws_msg(model, ws_message);
  } else {
    let app_msg = message[0];
    return handle_app_msg(model, app_msg);
  }
}

// build/dev/javascript/client/app.mjs
var ws_path = "/ws";
function view8(model) {
  let _pipe = view7(model.graph_layout);
  return map6(_pipe, (var0) => {
    return new AppMessage(var0);
  });
}
function init10(_) {
  return [
    (() => {
      let _pipe = new GraphLayout(toList([]), toList([]));
      return new Model7(_pipe, new None);
    })(),
    init9(ws_path, (var0) => {
      return new WebSocketMessage(var0);
    })
  ];
}
function app() {
  return application(init10, update11, view8);
}

// build/dev/javascript/client/client.mjs
var FILEPATH2 = "src/client.gleam";
function main() {
  let app2 = app();
  let $ = register7();
  if (!($ instanceof Ok)) {
    throw makeError("let_assert", FILEPATH2, "client", 8, "main", "Pattern match failed, no pattern matched the value.", { value: $, start: 103, end: 139, pattern_start: 114, pattern_end: 119 });
  }
  let $1 = start4(app2, "#app", undefined);
  if (!($1 instanceof Ok)) {
    throw makeError("let_assert", FILEPATH2, "client", 9, "main", "Pattern match failed, no pattern matched the value.", { value: $1, start: 142, end: 191, pattern_start: 153, pattern_end: 158 });
  }
  console_log("Hello from Asterism!");
  return;
}

// .lustre/build/client.mjs
main();
