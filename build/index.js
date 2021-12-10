define("potree", ["three"], (__WEBPACK_EXTERNAL_MODULE_three__) => { return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/binary-heap.js":
/*!**********************************!*\
  !*** ./src/utils/binary-heap.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.BinaryHeap = BinaryHeap;

/**
 * from: http://eloquentjavascript.net/1st_edition/appendix2.html
 *
 */
function BinaryHeap(scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function push(element) {
    // Add the new element to the end of the array.
    this.content.push(element); // Allow it to bubble up.

    this.bubbleUp(this.content.length - 1);
  },
  pop: function pop() {
    // Store the first element so we can return it later.
    var result = this.content[0]; // Get the element at the end of the array.

    var end = this.content.pop(); // If there are any elements left, put the end element at the
    // start, and let it sink down.

    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }

    return result;
  },
  remove: function remove(node) {
    var length = this.content.length; // To remove a value, we must search through the array to find
    // it.

    for (var i = 0; i < length; i++) {
      if (this.content[i] != node) continue; // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.

      var end = this.content.pop(); // If the element we popped was the one we needed to remove,
      // we're done.

      if (i == length - 1) break; // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.

      this.content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  },
  size: function size() {
    return this.content.length;
  },
  bubbleUp: function bubbleUp(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n],
        score = this.scoreFunction(element); // When at 0, an element can not go up any further.

    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
          parent = this.content[parentN]; // If the parent has a lesser score, things are in order and we
      // are done.

      if (score >= this.scoreFunction(parent)) break; // Otherwise, swap the parent with the current element and
      // continue.

      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },
  sinkDown: function sinkDown(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2,
          child1N = child2N - 1; // This is used to store the new position of the element,
      // if any.

      var swap = null; // If the first child exists (is inside the array)...

      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1); // If the score is less than our element's, we need to swap.

        if (child1Score < elemScore) swap = child1N;
      } // Do the same checks for the other child.


      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score)) swap = child2N;
      } // No need to swap further, we are done.


      if (swap == null) break; // Otherwise, swap and continue.

      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  }
};

/***/ }),

/***/ "./node_modules/json5/dist/index.js":
/*!******************************************!*\
  !*** ./node_modules/json5/dist/index.js ***!
  \******************************************/
/***/ (function(module) {

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') { __g = global; } // eslint-disable-line no-undef
	});

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.5' };
	if (typeof __e == 'number') { __e = core; } // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) { throw TypeError(it + ' is not an object!'); }
	  return it;
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document) && _isObject(document.createElement);
	var _domCreate = function (it) {
	  return is ? document.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) { return it; }
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) { return val; }
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) { return val; }
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) { return val; }
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) { try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ } }
	  if ('get' in Attributes || 'set' in Attributes) { throw TypeError('Accessors not supported!'); }
	  if ('value' in Attributes) { O[P] = Attributes.value; }
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var _library = false;

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode: _library ? 'pure' : 'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var _functionToString = _shared('native-function-to-string', Function.toString);

	var _redefine = createCommonjsModule(function (module) {
	var SRC = _uid('src');

	var TO_STRING = 'toString';
	var TPL = ('' + _functionToString).split(TO_STRING);

	_core.inspectSource = function (it) {
	  return _functionToString.call(it);
	};

	(module.exports = function (O, key, val, safe) {
	  var isFunction = typeof val == 'function';
	  if (isFunction) { _has(val, 'name') || _hide(val, 'name', key); }
	  if (O[key] === val) { return; }
	  if (isFunction) { _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key))); }
	  if (O === _global) {
	    O[key] = val;
	  } else if (!safe) {
	    delete O[key];
	    _hide(O, key, val);
	  } else if (O[key]) {
	    O[key] = val;
	  } else {
	    _hide(O, key, val);
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString() {
	  return typeof this == 'function' && this[SRC] || _functionToString.call(this);
	});
	});

	var _aFunction = function (it) {
	  if (typeof it != 'function') { throw TypeError(it + ' is not a function!'); }
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) { return fn; }
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
	  var key, own, out, exp;
	  if (IS_GLOBAL) { source = name; }
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // extend global
	    if (target) { _redefine(target, key, out, type & $export.U); }
	    // export
	    if (exports[key] != out) { _hide(exports, key, exp); }
	    if (IS_PROTO && expProto[key] != out) { expProto[key] = out; }
	  }
	};
	_global.core = _core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) { throw TypeError("Can't call method on  " + it); }
	  return it;
	};

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(_defined(that));
	    var i = _toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) { return TO_STRING ? '' : undefined; }
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var $at = _stringAt(false);
	_export(_export.P, 'String', {
	  // 21.1.3.3 String.prototype.codePointAt(pos)
	  codePointAt: function codePointAt(pos) {
	    return $at(this, pos);
	  }
	});

	var codePointAt = _core.String.codePointAt;

	var max = Math.max;
	var min = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

	var fromCharCode = String.fromCharCode;
	var $fromCodePoint = String.fromCodePoint;

	// length should be 1, old FF problem
	_export(_export.S + _export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
	  // 21.1.2.2 String.fromCodePoint(...codePoints)
	  fromCodePoint: function fromCodePoint(x) {
	    var arguments$1 = arguments;
	 // eslint-disable-line no-unused-vars
	    var res = [];
	    var aLen = arguments.length;
	    var i = 0;
	    var code;
	    while (aLen > i) {
	      code = +arguments$1[i++];
	      if (_toAbsoluteIndex(code, 0x10ffff) !== code) { throw RangeError(code + ' is not a valid code point'); }
	      res.push(code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
	      );
	    } return res.join('');
	  }
	});

	var fromCodePoint = _core.String.fromCodePoint;

	// This is a generated file. Do not edit.
	var Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
	var ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
	var ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;

	var unicode = {
		Space_Separator: Space_Separator,
		ID_Start: ID_Start,
		ID_Continue: ID_Continue
	};

	var util = {
	    isSpaceSeparator: function isSpaceSeparator (c) {
	        return typeof c === 'string' && unicode.Space_Separator.test(c)
	    },

	    isIdStartChar: function isIdStartChar (c) {
	        return typeof c === 'string' && (
	            (c >= 'a' && c <= 'z') ||
	        (c >= 'A' && c <= 'Z') ||
	        (c === '$') || (c === '_') ||
	        unicode.ID_Start.test(c)
	        )
	    },

	    isIdContinueChar: function isIdContinueChar (c) {
	        return typeof c === 'string' && (
	            (c >= 'a' && c <= 'z') ||
	        (c >= 'A' && c <= 'Z') ||
	        (c >= '0' && c <= '9') ||
	        (c === '$') || (c === '_') ||
	        (c === '\u200C') || (c === '\u200D') ||
	        unicode.ID_Continue.test(c)
	        )
	    },

	    isDigit: function isDigit (c) {
	        return typeof c === 'string' && /[0-9]/.test(c)
	    },

	    isHexDigit: function isHexDigit (c) {
	        return typeof c === 'string' && /[0-9A-Fa-f]/.test(c)
	    },
	};

	var source;
	var parseState;
	var stack;
	var pos;
	var line;
	var column;
	var token;
	var key;
	var root;

	var parse = function parse (text, reviver) {
	    source = String(text);
	    parseState = 'start';
	    stack = [];
	    pos = 0;
	    line = 1;
	    column = 0;
	    token = undefined;
	    key = undefined;
	    root = undefined;

	    do {
	        token = lex();

	        // This code is unreachable.
	        // if (!parseStates[parseState]) {
	        //     throw invalidParseState()
	        // }

	        parseStates[parseState]();
	    } while (token.type !== 'eof')

	    if (typeof reviver === 'function') {
	        return internalize({'': root}, '', reviver)
	    }

	    return root
	};

	function internalize (holder, name, reviver) {
	    var value = holder[name];
	    if (value != null && typeof value === 'object') {
	        for (var key in value) {
	            var replacement = internalize(value, key, reviver);
	            if (replacement === undefined) {
	                delete value[key];
	            } else {
	                value[key] = replacement;
	            }
	        }
	    }

	    return reviver.call(holder, name, value)
	}

	var lexState;
	var buffer;
	var doubleQuote;
	var sign;
	var c;

	function lex () {
	    lexState = 'default';
	    buffer = '';
	    doubleQuote = false;
	    sign = 1;

	    for (;;) {
	        c = peek();

	        // This code is unreachable.
	        // if (!lexStates[lexState]) {
	        //     throw invalidLexState(lexState)
	        // }

	        var token = lexStates[lexState]();
	        if (token) {
	            return token
	        }
	    }
	}

	function peek () {
	    if (source[pos]) {
	        return String.fromCodePoint(source.codePointAt(pos))
	    }
	}

	function read () {
	    var c = peek();

	    if (c === '\n') {
	        line++;
	        column = 0;
	    } else if (c) {
	        column += c.length;
	    } else {
	        column++;
	    }

	    if (c) {
	        pos += c.length;
	    }

	    return c
	}

	var lexStates = {
	    default: function default$1 () {
	        switch (c) {
	        case '\t':
	        case '\v':
	        case '\f':
	        case ' ':
	        case '\u00A0':
	        case '\uFEFF':
	        case '\n':
	        case '\r':
	        case '\u2028':
	        case '\u2029':
	            read();
	            return

	        case '/':
	            read();
	            lexState = 'comment';
	            return

	        case undefined:
	            read();
	            return newToken('eof')
	        }

	        if (util.isSpaceSeparator(c)) {
	            read();
	            return
	        }

	        // This code is unreachable.
	        // if (!lexStates[parseState]) {
	        //     throw invalidLexState(parseState)
	        // }

	        return lexStates[parseState]()
	    },

	    comment: function comment () {
	        switch (c) {
	        case '*':
	            read();
	            lexState = 'multiLineComment';
	            return

	        case '/':
	            read();
	            lexState = 'singleLineComment';
	            return
	        }

	        throw invalidChar(read())
	    },

	    multiLineComment: function multiLineComment () {
	        switch (c) {
	        case '*':
	            read();
	            lexState = 'multiLineCommentAsterisk';
	            return

	        case undefined:
	            throw invalidChar(read())
	        }

	        read();
	    },

	    multiLineCommentAsterisk: function multiLineCommentAsterisk () {
	        switch (c) {
	        case '*':
	            read();
	            return

	        case '/':
	            read();
	            lexState = 'default';
	            return

	        case undefined:
	            throw invalidChar(read())
	        }

	        read();
	        lexState = 'multiLineComment';
	    },

	    singleLineComment: function singleLineComment () {
	        switch (c) {
	        case '\n':
	        case '\r':
	        case '\u2028':
	        case '\u2029':
	            read();
	            lexState = 'default';
	            return

	        case undefined:
	            read();
	            return newToken('eof')
	        }

	        read();
	    },

	    value: function value () {
	        switch (c) {
	        case '{':
	        case '[':
	            return newToken('punctuator', read())

	        case 'n':
	            read();
	            literal('ull');
	            return newToken('null', null)

	        case 't':
	            read();
	            literal('rue');
	            return newToken('boolean', true)

	        case 'f':
	            read();
	            literal('alse');
	            return newToken('boolean', false)

	        case '-':
	        case '+':
	            if (read() === '-') {
	                sign = -1;
	            }

	            lexState = 'sign';
	            return

	        case '.':
	            buffer = read();
	            lexState = 'decimalPointLeading';
	            return

	        case '0':
	            buffer = read();
	            lexState = 'zero';
	            return

	        case '1':
	        case '2':
	        case '3':
	        case '4':
	        case '5':
	        case '6':
	        case '7':
	        case '8':
	        case '9':
	            buffer = read();
	            lexState = 'decimalInteger';
	            return

	        case 'I':
	            read();
	            literal('nfinity');
	            return newToken('numeric', Infinity)

	        case 'N':
	            read();
	            literal('aN');
	            return newToken('numeric', NaN)

	        case '"':
	        case "'":
	            doubleQuote = (read() === '"');
	            buffer = '';
	            lexState = 'string';
	            return
	        }

	        throw invalidChar(read())
	    },

	    identifierNameStartEscape: function identifierNameStartEscape () {
	        if (c !== 'u') {
	            throw invalidChar(read())
	        }

	        read();
	        var u = unicodeEscape();
	        switch (u) {
	        case '$':
	        case '_':
	            break

	        default:
	            if (!util.isIdStartChar(u)) {
	                throw invalidIdentifier()
	            }

	            break
	        }

	        buffer += u;
	        lexState = 'identifierName';
	    },

	    identifierName: function identifierName () {
	        switch (c) {
	        case '$':
	        case '_':
	        case '\u200C':
	        case '\u200D':
	            buffer += read();
	            return

	        case '\\':
	            read();
	            lexState = 'identifierNameEscape';
	            return
	        }

	        if (util.isIdContinueChar(c)) {
	            buffer += read();
	            return
	        }

	        return newToken('identifier', buffer)
	    },

	    identifierNameEscape: function identifierNameEscape () {
	        if (c !== 'u') {
	            throw invalidChar(read())
	        }

	        read();
	        var u = unicodeEscape();
	        switch (u) {
	        case '$':
	        case '_':
	        case '\u200C':
	        case '\u200D':
	            break

	        default:
	            if (!util.isIdContinueChar(u)) {
	                throw invalidIdentifier()
	            }

	            break
	        }

	        buffer += u;
	        lexState = 'identifierName';
	    },

	    sign: function sign$1 () {
	        switch (c) {
	        case '.':
	            buffer = read();
	            lexState = 'decimalPointLeading';
	            return

	        case '0':
	            buffer = read();
	            lexState = 'zero';
	            return

	        case '1':
	        case '2':
	        case '3':
	        case '4':
	        case '5':
	        case '6':
	        case '7':
	        case '8':
	        case '9':
	            buffer = read();
	            lexState = 'decimalInteger';
	            return

	        case 'I':
	            read();
	            literal('nfinity');
	            return newToken('numeric', sign * Infinity)

	        case 'N':
	            read();
	            literal('aN');
	            return newToken('numeric', NaN)
	        }

	        throw invalidChar(read())
	    },

	    zero: function zero () {
	        switch (c) {
	        case '.':
	            buffer += read();
	            lexState = 'decimalPoint';
	            return

	        case 'e':
	        case 'E':
	            buffer += read();
	            lexState = 'decimalExponent';
	            return

	        case 'x':
	        case 'X':
	            buffer += read();
	            lexState = 'hexadecimal';
	            return
	        }

	        return newToken('numeric', sign * 0)
	    },

	    decimalInteger: function decimalInteger () {
	        switch (c) {
	        case '.':
	            buffer += read();
	            lexState = 'decimalPoint';
	            return

	        case 'e':
	        case 'E':
	            buffer += read();
	            lexState = 'decimalExponent';
	            return
	        }

	        if (util.isDigit(c)) {
	            buffer += read();
	            return
	        }

	        return newToken('numeric', sign * Number(buffer))
	    },

	    decimalPointLeading: function decimalPointLeading () {
	        if (util.isDigit(c)) {
	            buffer += read();
	            lexState = 'decimalFraction';
	            return
	        }

	        throw invalidChar(read())
	    },

	    decimalPoint: function decimalPoint () {
	        switch (c) {
	        case 'e':
	        case 'E':
	            buffer += read();
	            lexState = 'decimalExponent';
	            return
	        }

	        if (util.isDigit(c)) {
	            buffer += read();
	            lexState = 'decimalFraction';
	            return
	        }

	        return newToken('numeric', sign * Number(buffer))
	    },

	    decimalFraction: function decimalFraction () {
	        switch (c) {
	        case 'e':
	        case 'E':
	            buffer += read();
	            lexState = 'decimalExponent';
	            return
	        }

	        if (util.isDigit(c)) {
	            buffer += read();
	            return
	        }

	        return newToken('numeric', sign * Number(buffer))
	    },

	    decimalExponent: function decimalExponent () {
	        switch (c) {
	        case '+':
	        case '-':
	            buffer += read();
	            lexState = 'decimalExponentSign';
	            return
	        }

	        if (util.isDigit(c)) {
	            buffer += read();
	            lexState = 'decimalExponentInteger';
	            return
	        }

	        throw invalidChar(read())
	    },

	    decimalExponentSign: function decimalExponentSign () {
	        if (util.isDigit(c)) {
	            buffer += read();
	            lexState = 'decimalExponentInteger';
	            return
	        }

	        throw invalidChar(read())
	    },

	    decimalExponentInteger: function decimalExponentInteger () {
	        if (util.isDigit(c)) {
	            buffer += read();
	            return
	        }

	        return newToken('numeric', sign * Number(buffer))
	    },

	    hexadecimal: function hexadecimal () {
	        if (util.isHexDigit(c)) {
	            buffer += read();
	            lexState = 'hexadecimalInteger';
	            return
	        }

	        throw invalidChar(read())
	    },

	    hexadecimalInteger: function hexadecimalInteger () {
	        if (util.isHexDigit(c)) {
	            buffer += read();
	            return
	        }

	        return newToken('numeric', sign * Number(buffer))
	    },

	    string: function string () {
	        switch (c) {
	        case '\\':
	            read();
	            buffer += escape();
	            return

	        case '"':
	            if (doubleQuote) {
	                read();
	                return newToken('string', buffer)
	            }

	            buffer += read();
	            return

	        case "'":
	            if (!doubleQuote) {
	                read();
	                return newToken('string', buffer)
	            }

	            buffer += read();
	            return

	        case '\n':
	        case '\r':
	            throw invalidChar(read())

	        case '\u2028':
	        case '\u2029':
	            separatorChar(c);
	            break

	        case undefined:
	            throw invalidChar(read())
	        }

	        buffer += read();
	    },

	    start: function start () {
	        switch (c) {
	        case '{':
	        case '[':
	            return newToken('punctuator', read())

	        // This code is unreachable since the default lexState handles eof.
	        // case undefined:
	        //     return newToken('eof')
	        }

	        lexState = 'value';
	    },

	    beforePropertyName: function beforePropertyName () {
	        switch (c) {
	        case '$':
	        case '_':
	            buffer = read();
	            lexState = 'identifierName';
	            return

	        case '\\':
	            read();
	            lexState = 'identifierNameStartEscape';
	            return

	        case '}':
	            return newToken('punctuator', read())

	        case '"':
	        case "'":
	            doubleQuote = (read() === '"');
	            lexState = 'string';
	            return
	        }

	        if (util.isIdStartChar(c)) {
	            buffer += read();
	            lexState = 'identifierName';
	            return
	        }

	        throw invalidChar(read())
	    },

	    afterPropertyName: function afterPropertyName () {
	        if (c === ':') {
	            return newToken('punctuator', read())
	        }

	        throw invalidChar(read())
	    },

	    beforePropertyValue: function beforePropertyValue () {
	        lexState = 'value';
	    },

	    afterPropertyValue: function afterPropertyValue () {
	        switch (c) {
	        case ',':
	        case '}':
	            return newToken('punctuator', read())
	        }

	        throw invalidChar(read())
	    },

	    beforeArrayValue: function beforeArrayValue () {
	        if (c === ']') {
	            return newToken('punctuator', read())
	        }

	        lexState = 'value';
	    },

	    afterArrayValue: function afterArrayValue () {
	        switch (c) {
	        case ',':
	        case ']':
	            return newToken('punctuator', read())
	        }

	        throw invalidChar(read())
	    },

	    end: function end () {
	        // This code is unreachable since it's handled by the default lexState.
	        // if (c === undefined) {
	        //     read()
	        //     return newToken('eof')
	        // }

	        throw invalidChar(read())
	    },
	};

	function newToken (type, value) {
	    return {
	        type: type,
	        value: value,
	        line: line,
	        column: column,
	    }
	}

	function literal (s) {
	    for (var i = 0, list = s; i < list.length; i += 1) {
	        var c = list[i];

	        var p = peek();

	        if (p !== c) {
	            throw invalidChar(read())
	        }

	        read();
	    }
	}

	function escape () {
	    var c = peek();
	    switch (c) {
	    case 'b':
	        read();
	        return '\b'

	    case 'f':
	        read();
	        return '\f'

	    case 'n':
	        read();
	        return '\n'

	    case 'r':
	        read();
	        return '\r'

	    case 't':
	        read();
	        return '\t'

	    case 'v':
	        read();
	        return '\v'

	    case '0':
	        read();
	        if (util.isDigit(peek())) {
	            throw invalidChar(read())
	        }

	        return '\0'

	    case 'x':
	        read();
	        return hexEscape()

	    case 'u':
	        read();
	        return unicodeEscape()

	    case '\n':
	    case '\u2028':
	    case '\u2029':
	        read();
	        return ''

	    case '\r':
	        read();
	        if (peek() === '\n') {
	            read();
	        }

	        return ''

	    case '1':
	    case '2':
	    case '3':
	    case '4':
	    case '5':
	    case '6':
	    case '7':
	    case '8':
	    case '9':
	        throw invalidChar(read())

	    case undefined:
	        throw invalidChar(read())
	    }

	    return read()
	}

	function hexEscape () {
	    var buffer = '';
	    var c = peek();

	    if (!util.isHexDigit(c)) {
	        throw invalidChar(read())
	    }

	    buffer += read();

	    c = peek();
	    if (!util.isHexDigit(c)) {
	        throw invalidChar(read())
	    }

	    buffer += read();

	    return String.fromCodePoint(parseInt(buffer, 16))
	}

	function unicodeEscape () {
	    var buffer = '';
	    var count = 4;

	    while (count-- > 0) {
	        var c = peek();
	        if (!util.isHexDigit(c)) {
	            throw invalidChar(read())
	        }

	        buffer += read();
	    }

	    return String.fromCodePoint(parseInt(buffer, 16))
	}

	var parseStates = {
	    start: function start () {
	        if (token.type === 'eof') {
	            throw invalidEOF()
	        }

	        push();
	    },

	    beforePropertyName: function beforePropertyName () {
	        switch (token.type) {
	        case 'identifier':
	        case 'string':
	            key = token.value;
	            parseState = 'afterPropertyName';
	            return

	        case 'punctuator':
	            // This code is unreachable since it's handled by the lexState.
	            // if (token.value !== '}') {
	            //     throw invalidToken()
	            // }

	            pop();
	            return

	        case 'eof':
	            throw invalidEOF()
	        }

	        // This code is unreachable since it's handled by the lexState.
	        // throw invalidToken()
	    },

	    afterPropertyName: function afterPropertyName () {
	        // This code is unreachable since it's handled by the lexState.
	        // if (token.type !== 'punctuator' || token.value !== ':') {
	        //     throw invalidToken()
	        // }

	        if (token.type === 'eof') {
	            throw invalidEOF()
	        }

	        parseState = 'beforePropertyValue';
	    },

	    beforePropertyValue: function beforePropertyValue () {
	        if (token.type === 'eof') {
	            throw invalidEOF()
	        }

	        push();
	    },

	    beforeArrayValue: function beforeArrayValue () {
	        if (token.type === 'eof') {
	            throw invalidEOF()
	        }

	        if (token.type === 'punctuator' && token.value === ']') {
	            pop();
	            return
	        }

	        push();
	    },

	    afterPropertyValue: function afterPropertyValue () {
	        // This code is unreachable since it's handled by the lexState.
	        // if (token.type !== 'punctuator') {
	        //     throw invalidToken()
	        // }

	        if (token.type === 'eof') {
	            throw invalidEOF()
	        }

	        switch (token.value) {
	        case ',':
	            parseState = 'beforePropertyName';
	            return

	        case '}':
	            pop();
	        }

	        // This code is unreachable since it's handled by the lexState.
	        // throw invalidToken()
	    },

	    afterArrayValue: function afterArrayValue () {
	        // This code is unreachable since it's handled by the lexState.
	        // if (token.type !== 'punctuator') {
	        //     throw invalidToken()
	        // }

	        if (token.type === 'eof') {
	            throw invalidEOF()
	        }

	        switch (token.value) {
	        case ',':
	            parseState = 'beforeArrayValue';
	            return

	        case ']':
	            pop();
	        }

	        // This code is unreachable since it's handled by the lexState.
	        // throw invalidToken()
	    },

	    end: function end () {
	        // This code is unreachable since it's handled by the lexState.
	        // if (token.type !== 'eof') {
	        //     throw invalidToken()
	        // }
	    },
	};

	function push () {
	    var value;

	    switch (token.type) {
	    case 'punctuator':
	        switch (token.value) {
	        case '{':
	            value = {};
	            break

	        case '[':
	            value = [];
	            break
	        }

	        break

	    case 'null':
	    case 'boolean':
	    case 'numeric':
	    case 'string':
	        value = token.value;
	        break

	    // This code is unreachable.
	    // default:
	    //     throw invalidToken()
	    }

	    if (root === undefined) {
	        root = value;
	    } else {
	        var parent = stack[stack.length - 1];
	        if (Array.isArray(parent)) {
	            parent.push(value);
	        } else {
	            parent[key] = value;
	        }
	    }

	    if (value !== null && typeof value === 'object') {
	        stack.push(value);

	        if (Array.isArray(value)) {
	            parseState = 'beforeArrayValue';
	        } else {
	            parseState = 'beforePropertyName';
	        }
	    } else {
	        var current = stack[stack.length - 1];
	        if (current == null) {
	            parseState = 'end';
	        } else if (Array.isArray(current)) {
	            parseState = 'afterArrayValue';
	        } else {
	            parseState = 'afterPropertyValue';
	        }
	    }
	}

	function pop () {
	    stack.pop();

	    var current = stack[stack.length - 1];
	    if (current == null) {
	        parseState = 'end';
	    } else if (Array.isArray(current)) {
	        parseState = 'afterArrayValue';
	    } else {
	        parseState = 'afterPropertyValue';
	    }
	}

	// This code is unreachable.
	// function invalidParseState () {
	//     return new Error(`JSON5: invalid parse state '${parseState}'`)
	// }

	// This code is unreachable.
	// function invalidLexState (state) {
	//     return new Error(`JSON5: invalid lex state '${state}'`)
	// }

	function invalidChar (c) {
	    if (c === undefined) {
	        return syntaxError(("JSON5: invalid end of input at " + line + ":" + column))
	    }

	    return syntaxError(("JSON5: invalid character '" + (formatChar(c)) + "' at " + line + ":" + column))
	}

	function invalidEOF () {
	    return syntaxError(("JSON5: invalid end of input at " + line + ":" + column))
	}

	// This code is unreachable.
	// function invalidToken () {
	//     if (token.type === 'eof') {
	//         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
	//     }

	//     const c = String.fromCodePoint(token.value.codePointAt(0))
	//     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
	// }

	function invalidIdentifier () {
	    column -= 5;
	    return syntaxError(("JSON5: invalid identifier character at " + line + ":" + column))
	}

	function separatorChar (c) {
	    console.warn(("JSON5: '" + (formatChar(c)) + "' in strings is not valid ECMAScript; consider escaping"));
	}

	function formatChar (c) {
	    var replacements = {
	        "'": "\\'",
	        '"': '\\"',
	        '\\': '\\\\',
	        '\b': '\\b',
	        '\f': '\\f',
	        '\n': '\\n',
	        '\r': '\\r',
	        '\t': '\\t',
	        '\v': '\\v',
	        '\0': '\\0',
	        '\u2028': '\\u2028',
	        '\u2029': '\\u2029',
	    };

	    if (replacements[c]) {
	        return replacements[c]
	    }

	    if (c < ' ') {
	        var hexString = c.charCodeAt(0).toString(16);
	        return '\\x' + ('00' + hexString).substring(hexString.length)
	    }

	    return c
	}

	function syntaxError (message) {
	    var err = new SyntaxError(message);
	    err.lineNumber = line;
	    err.columnNumber = column;
	    return err
	}

	var stringify = function stringify (value, replacer, space) {
	    var stack = [];
	    var indent = '';
	    var propertyList;
	    var replacerFunc;
	    var gap = '';
	    var quote;

	    if (
	        replacer != null &&
	        typeof replacer === 'object' &&
	        !Array.isArray(replacer)
	    ) {
	        space = replacer.space;
	        quote = replacer.quote;
	        replacer = replacer.replacer;
	    }

	    if (typeof replacer === 'function') {
	        replacerFunc = replacer;
	    } else if (Array.isArray(replacer)) {
	        propertyList = [];
	        for (var i = 0, list = replacer; i < list.length; i += 1) {
	            var v = list[i];

	            var item = (void 0);

	            if (typeof v === 'string') {
	                item = v;
	            } else if (
	                typeof v === 'number' ||
	                v instanceof String ||
	                v instanceof Number
	            ) {
	                item = String(v);
	            }

	            if (item !== undefined && propertyList.indexOf(item) < 0) {
	                propertyList.push(item);
	            }
	        }
	    }

	    if (space instanceof Number) {
	        space = Number(space);
	    } else if (space instanceof String) {
	        space = String(space);
	    }

	    if (typeof space === 'number') {
	        if (space > 0) {
	            space = Math.min(10, Math.floor(space));
	            gap = '          '.substr(0, space);
	        }
	    } else if (typeof space === 'string') {
	        gap = space.substr(0, 10);
	    }

	    return serializeProperty('', {'': value})

	    function serializeProperty (key, holder) {
	        var value = holder[key];
	        if (value != null) {
	            if (typeof value.toJSON5 === 'function') {
	                value = value.toJSON5(key);
	            } else if (typeof value.toJSON === 'function') {
	                value = value.toJSON(key);
	            }
	        }

	        if (replacerFunc) {
	            value = replacerFunc.call(holder, key, value);
	        }

	        if (value instanceof Number) {
	            value = Number(value);
	        } else if (value instanceof String) {
	            value = String(value);
	        } else if (value instanceof Boolean) {
	            value = value.valueOf();
	        }

	        switch (value) {
	        case null: return 'null'
	        case true: return 'true'
	        case false: return 'false'
	        }

	        if (typeof value === 'string') {
	            return quoteString(value, false)
	        }

	        if (typeof value === 'number') {
	            return String(value)
	        }

	        if (typeof value === 'object') {
	            return Array.isArray(value) ? serializeArray(value) : serializeObject(value)
	        }

	        return undefined
	    }

	    function quoteString (value) {
	        var quotes = {
	            "'": 0.1,
	            '"': 0.2,
	        };

	        var replacements = {
	            "'": "\\'",
	            '"': '\\"',
	            '\\': '\\\\',
	            '\b': '\\b',
	            '\f': '\\f',
	            '\n': '\\n',
	            '\r': '\\r',
	            '\t': '\\t',
	            '\v': '\\v',
	            '\0': '\\0',
	            '\u2028': '\\u2028',
	            '\u2029': '\\u2029',
	        };

	        var product = '';

	        for (var i = 0; i < value.length; i++) {
	            var c = value[i];
	            switch (c) {
	            case "'":
	            case '"':
	                quotes[c]++;
	                product += c;
	                continue

	            case '\0':
	                if (util.isDigit(value[i + 1])) {
	                    product += '\\x00';
	                    continue
	                }
	            }

	            if (replacements[c]) {
	                product += replacements[c];
	                continue
	            }

	            if (c < ' ') {
	                var hexString = c.charCodeAt(0).toString(16);
	                product += '\\x' + ('00' + hexString).substring(hexString.length);
	                continue
	            }

	            product += c;
	        }

	        var quoteChar = quote || Object.keys(quotes).reduce(function (a, b) { return (quotes[a] < quotes[b]) ? a : b; });

	        product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar]);

	        return quoteChar + product + quoteChar
	    }

	    function serializeObject (value) {
	        if (stack.indexOf(value) >= 0) {
	            throw TypeError('Converting circular structure to JSON5')
	        }

	        stack.push(value);

	        var stepback = indent;
	        indent = indent + gap;

	        var keys = propertyList || Object.keys(value);
	        var partial = [];
	        for (var i = 0, list = keys; i < list.length; i += 1) {
	            var key = list[i];

	            var propertyString = serializeProperty(key, value);
	            if (propertyString !== undefined) {
	                var member = serializeKey(key) + ':';
	                if (gap !== '') {
	                    member += ' ';
	                }
	                member += propertyString;
	                partial.push(member);
	            }
	        }

	        var final;
	        if (partial.length === 0) {
	            final = '{}';
	        } else {
	            var properties;
	            if (gap === '') {
	                properties = partial.join(',');
	                final = '{' + properties + '}';
	            } else {
	                var separator = ',\n' + indent;
	                properties = partial.join(separator);
	                final = '{\n' + indent + properties + ',\n' + stepback + '}';
	            }
	        }

	        stack.pop();
	        indent = stepback;
	        return final
	    }

	    function serializeKey (key) {
	        if (key.length === 0) {
	            return quoteString(key, true)
	        }

	        var firstChar = String.fromCodePoint(key.codePointAt(0));
	        if (!util.isIdStartChar(firstChar)) {
	            return quoteString(key, true)
	        }

	        for (var i = firstChar.length; i < key.length; i++) {
	            if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
	                return quoteString(key, true)
	            }
	        }

	        return key
	    }

	    function serializeArray (value) {
	        if (stack.indexOf(value) >= 0) {
	            throw TypeError('Converting circular structure to JSON5')
	        }

	        stack.push(value);

	        var stepback = indent;
	        indent = indent + gap;

	        var partial = [];
	        for (var i = 0; i < value.length; i++) {
	            var propertyString = serializeProperty(String(i), value);
	            partial.push((propertyString !== undefined) ? propertyString : 'null');
	        }

	        var final;
	        if (partial.length === 0) {
	            final = '[]';
	        } else {
	            if (gap === '') {
	                var properties = partial.join(',');
	                final = '[' + properties + ']';
	            } else {
	                var separator = ',\n' + indent;
	                var properties$1 = partial.join(separator);
	                final = '[\n' + indent + properties$1 + ',\n' + stepback + ']';
	            }
	        }

	        stack.pop();
	        indent = stepback;
	        return final
	    }
	};

	var JSON5 = {
	    parse: parse,
	    stringify: stringify,
	};

	var lib = JSON5;

	var es5 = lib;

	return es5;

})));


/***/ }),

/***/ "./src/materials/shaders/blur.frag":
/*!*****************************************!*\
  !*** ./src/materials/shaders/blur.frag ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("precision highp float;\nprecision highp int;\n\nuniform mat4 projectionMatrix;\n\nuniform float screenWidth;\nuniform float screenHeight;\n\nuniform sampler2D map;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tfloat dx = 1.0 / screenWidth;\n\tfloat dy = 1.0 / screenHeight;\n\n\tvec3 color = vec3(0.0, 0.0, 0.0);\n\tcolor += texture2D(map, vUv + vec2(-dx, -dy)).rgb;\n\tcolor += texture2D(map, vUv + vec2(  0, -dy)).rgb;\n\tcolor += texture2D(map, vUv + vec2(+dx, -dy)).rgb;\n\tcolor += texture2D(map, vUv + vec2(-dx,   0)).rgb;\n\tcolor += texture2D(map, vUv + vec2(  0,   0)).rgb;\n\tcolor += texture2D(map, vUv + vec2(+dx,   0)).rgb;\n\tcolor += texture2D(map, vUv + vec2(-dx,  dy)).rgb;\n\tcolor += texture2D(map, vUv + vec2(  0,  dy)).rgb;\n\tcolor += texture2D(map, vUv + vec2(+dx,  dy)).rgb;\n    \n\tcolor = color / 9.0;\n\t\n\tgl_FragColor = vec4(color, 1.0);\n\t\n\t\n}");

/***/ }),

/***/ "./src/materials/shaders/blur.vert":
/*!*****************************************!*\
  !*** ./src/materials/shaders/blur.vert ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("precision highp float;\nprecision highp int;\n\nattribute vec3 position;\nattribute vec2 uv;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nvarying vec2 vUv;\n\nvoid main() {\n    vUv = uv;\n\n    gl_Position =   projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}");

/***/ }),

/***/ "./src/materials/shaders/pointcloud.frag":
/*!***********************************************!*\
  !*** ./src/materials/shaders/pointcloud.frag ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("// #if defined paraboloid_point_shape\n// \t#extension GL_EXT_frag_depth : enable\n// #endif\n\nprecision highp float;\nprecision highp int;\n\n\nuniform mat4 viewMatrix;\nuniform vec3 cameraPosition;\n\nuniform mat4 projectionMatrix;\nuniform float opacity;\n\nuniform float blendHardness;\nuniform float blendDepthSupplement;\nuniform float fov;\nuniform float spacing;\nuniform float pcIndex;\nuniform float screenWidth;\nuniform float screenHeight;\n\nuniform sampler2D depthMap;\n\n#ifdef highlight_point\n\tuniform vec4 highlightedPointColor;\n#endif\n\nin vec3 vColor;\n\n#if !defined(color_type_point_index)\n\tin float vOpacity;\n#endif\n\n#if defined(weighted_splats)\n\tin float vLinearDepth;\n#endif\n\n#if !defined(paraboloid_point_shape) && defined(use_edl)\n\tin float vLogDepth;\n#endif\n\n#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0) || defined(paraboloid_point_shape)\n\tin vec3 vViewPosition;\n#endif\n\n#if defined(weighted_splats) || defined(paraboloid_point_shape)\n\tin float vRadius;\n#endif\n\n#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0)\n\tin vec3 vNormal;\n#endif\n\n#ifdef highlight_point\n\tin float vHighlight;\n#endif\n\nlayout(location=0) out vec4 out_FragColor;\n\n\nfloat specularStrength = 1.0;\n\nvoid main() {\n\tvec3 color = vColor;\n\tfloat depth = gl_FragCoord.z;\n\n\t#if defined(circle_point_shape) || defined(paraboloid_point_shape) || defined (weighted_splats)\n\t\tfloat u = 2.0 * gl_PointCoord.x - 1.0;\n\t\tfloat v = 2.0 * gl_PointCoord.y - 1.0;\n\t#endif\n\n\t#if defined(circle_point_shape) || defined (weighted_splats)\n\t\tfloat cc = u*u + v*v;\n\t\tif(cc > 1.0){\n\t\t\tdiscard;\n\t\t}\n\t#endif\n\n\t#if defined weighted_splats\n\t\tvec2 uv = gl_FragCoord.xy / vec2(screenWidth, screenHeight);\n\t\tfloat sDepth = texture(depthMap, uv).r;\n\t\tif(vLinearDepth > sDepth + vRadius + blendDepthSupplement){\n\t\t\tdiscard;\n\t\t}\n\t#endif\n\n\t#if defined color_type_point_index\n\t\tout_FragColor = vec4(color, pcIndex / 255.0);\n\t#else\n\t\tout_FragColor = vec4(color, vOpacity);\n\t#endif\n\n\t#if defined(color_type_phong)\n\t\t#if MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0\n\t\t\tvec3 normal = normalize( vNormal );\n\t\t\tnormal.z = abs(normal.z);\n\n\t\t\tvec3 viewPosition = normalize( vViewPosition );\n\t\t#endif\n\n\t\t// code taken from three.js phong light fragment shader\n\n\t\t#if MAX_POINT_LIGHTS > 0\n\n\t\t\tvec3 pointDiffuse = vec3( 0.0 );\n\t\t\tvec3 pointSpecular = vec3( 0.0 );\n\n\t\t\tfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n\t\t\t\tvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\n\t\t\t\tvec3 lVector = lPosition.xyz + vViewPosition.xyz;\n\n\t\t\t\tfloat lDistance = 1.0;\n\t\t\t\tif ( pointLightDistance[ i ] > 0.0 )\n\t\t\t\t\tlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\n\n\t\t\t\tlVector = normalize( lVector );\n\n\t\t\t\t\t\t// diffuse\n\n\t\t\t\tfloat dotProduct = dot( normal, lVector );\n\n\t\t\t\t#ifdef WRAP_AROUND\n\n\t\t\t\t\tfloat pointDiffuseWeightFull = max( dotProduct, 0.0 );\n\t\t\t\t\tfloat pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n\t\t\t\t\tvec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n\n\t\t\t\t#else\n\n\t\t\t\t\tfloat pointDiffuseWeight = max( dotProduct, 0.0 );\n\n\t\t\t\t#endif\n\n\t\t\t\tpointDiffuse += diffuse * pointLightColor[ i ] * pointDiffuseWeight * lDistance;\n\n\t\t\t\t// specular\n\n\t\t\t\tvec3 pointHalfVector = normalize( lVector + viewPosition );\n\t\t\t\tfloat pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\n\t\t\t\tfloat pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );\n\n\t\t\t\tfloat specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n\t\t\t\tvec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );\n\t\t\t\tpointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;\n\t\t\t\tpointSpecular = vec3(0.0, 0.0, 0.0);\n\t\t\t}\n\n\t\t#endif\n\n\t\t#if MAX_DIR_LIGHTS > 0\n\n\t\t\tvec3 dirDiffuse = vec3( 0.0 );\n\t\t\tvec3 dirSpecular = vec3( 0.0 );\n\n\t\t\tfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n\t\t\t\tvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\n\t\t\t\tvec3 dirVector = normalize( lDirection.xyz );\n\n\t\t\t\t\t\t// diffuse\n\n\t\t\t\tfloat dotProduct = dot( normal, dirVector );\n\n\t\t\t\t#ifdef WRAP_AROUND\n\n\t\t\t\t\tfloat dirDiffuseWeightFull = max( dotProduct, 0.0 );\n\t\t\t\t\tfloat dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n\t\t\t\t\tvec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );\n\n\t\t\t\t#else\n\n\t\t\t\t\tfloat dirDiffuseWeight = max( dotProduct, 0.0 );\n\n\t\t\t\t#endif\n\n\t\t\t\tdirDiffuse += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;\n\n\t\t\t\t// specular\n\n\t\t\t\tvec3 dirHalfVector = normalize( dirVector + viewPosition );\n\t\t\t\tfloat dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\n\t\t\t\tfloat dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );\n\n\t\t\t\tfloat specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n\t\t\t\tvec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );\n\t\t\t\tdirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;\n\t\t\t}\n\n\t\t#endif\n\n\t\tvec3 totalDiffuse = vec3( 0.0 );\n\t\tvec3 totalSpecular = vec3( 0.0 );\n\n\t\t#if MAX_POINT_LIGHTS > 0\n\n\t\t\ttotalDiffuse += pointDiffuse;\n\t\t\ttotalSpecular += pointSpecular;\n\n\t\t#endif\n\n\t\t#if MAX_DIR_LIGHTS > 0\n\n\t\t\ttotalDiffuse += dirDiffuse;\n\t\t\ttotalSpecular += dirSpecular;\n\n\t\t#endif\n\n\t\tout_FragColor.xyz = out_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular;\n\n\t#endif\n\n\t#if defined weighted_splats\n\t    //float w = pow(1.0 - (u*u + v*v), blendHardness);\n\n\t\tfloat wx = 2.0 * length(2.0 * gl_PointCoord - 1.0);\n\t\tfloat w = exp(-wx * wx * 0.5);\n\n\t\t//float distance = length(2.0 * gl_PointCoord - 1.0);\n\t\t//float w = exp( -(distance * distance) / blendHardness);\n\n\t\tout_FragColor.rgb = out_FragColor.rgb * w;\n\t\tout_FragColor.a = w;\n\t#endif\n\n\t#if defined paraboloid_point_shape\n\t\tfloat wi = 0.0 - ( u*u + v*v);\n\t\tvec4 pos = vec4(vViewPosition, 1.0);\n\t\tpos.z += wi * vRadius;\n\t\tfloat linearDepth = -pos.z;\n\t\tpos = projectionMatrix * pos;\n\t\tpos = pos / pos.w;\n\t\tfloat expDepth = pos.z;\n\t\tdepth = (pos.z + 1.0) / 2.0;\n\t\tgl_FragDepth = depth;\n\n\t\t#if defined(color_type_depth)\n\t\t\tout_FragColor.r = linearDepth;\n\t\t\tout_FragColor.g = expDepth;\n\t\t#endif\n\n\t\t#if defined(use_edl)\n\t\t\tout_FragColor.a = log2(linearDepth);\n\t\t#endif\n\n\t#else\n\t\t#if defined(use_edl)\n\t\t\tout_FragColor.a = vLogDepth;\n\t\t#endif\n\t#endif\n\n\t#ifdef highlight_point\n\t\tif (vHighlight > 0.0) {\n\t\t\tout_FragColor = highlightedPointColor;\n\t\t}\n\t#endif\n}\n");

/***/ }),

/***/ "./src/materials/shaders/pointcloud.vert":
/*!***********************************************!*\
  !*** ./src/materials/shaders/pointcloud.vert ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("precision highp float;\nprecision highp int;\n\n#define max_clip_boxes 30\n\nin vec3 position;\nin vec3 color;\nin vec3 normal;\nin float intensity;\nin float classification;\nin float returnNumber;\nin float numberOfReturns;\nin float pointSourceID;\nin vec4 indices;\n\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\n\nuniform float pcIndex;\n\nuniform float screenWidth;\nuniform float screenHeight;\nuniform float fov;\nuniform float spacing;\n\n#if defined use_clip_box\n\tuniform mat4 clipBoxes[max_clip_boxes];\n#endif\n\n#if NUM_CLIP_PLANES > 0\n\tuniform vec4 clippingPlanes[NUM_CLIP_PLANES];\n#endif\n\nuniform float heightMin;\nuniform float heightMax;\nuniform float size; // pixel size factor\nuniform float minSize; // minimum pixel size\nuniform float maxSize; // maximum pixel size\nuniform float octreeSize;\nuniform vec3 bbSize;\nuniform vec3 uColor;\nuniform float opacity;\nuniform float clipBoxCount;\nuniform float level;\nuniform float vnStart;\nuniform bool isLeafNode;\n\nuniform float filterByNormalThreshold;\nuniform vec2 intensityRange;\nuniform float opacityAttenuation;\nuniform float intensityGamma;\nuniform float intensityContrast;\nuniform float intensityBrightness;\nuniform float rgbGamma;\nuniform float rgbContrast;\nuniform float rgbBrightness;\nuniform float transition;\nuniform float wRGB;\nuniform float wIntensity;\nuniform float wElevation;\nuniform float wClassification;\nuniform float wReturnNumber;\nuniform float wSourceID;\n\nuniform sampler2D visibleNodes;\nuniform sampler2D gradient;\nuniform sampler2D classificationLUT;\nuniform sampler2D depthMap;\n\n#ifdef highlight_point\n\tuniform vec3 highlightedPointCoordinate;\n\tuniform bool enablePointHighlighting;\n\tuniform float highlightedPointScale;\n#endif\n\nout vec3 vColor;\n\n#if !defined(color_type_point_index)\n\tout float vOpacity;\n#endif\n\n#if defined(weighted_splats)\n\tout float vLinearDepth;\n#endif\n\n#if !defined(paraboloid_point_shape) && defined(use_edl)\n\tout float vLogDepth;\n#endif\n\n#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0) || defined(paraboloid_point_shape)\n\tout vec3 vViewPosition;\n#endif\n\n#if defined(weighted_splats) || defined(paraboloid_point_shape)\n\tout float vRadius;\n#endif\n\n#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0)\n\tout vec3 vNormal;\n#endif\n\n#ifdef highlight_point\n\tout float vHighlight;\n#endif\n\n// ---------------------\n// OCTREE\n// ---------------------\n\n#if (defined(adaptive_point_size) || defined(color_type_lod)) && defined(tree_type_octree)\n\n/**\n * Rounds the specified number to the closest integer.\n */\nfloat round(float number){\n\treturn floor(number + 0.5);\n}\n\n/**\n * Gets the number of 1-bits up to inclusive index position.\n *\n * number is treated as if it were an integer in the range 0-255\n */\nint numberOfOnes(int number, int index) {\n\tint numOnes = 0;\n\tint tmp = 128;\n\tfor (int i = 7; i >= 0; i--) {\n\n\t\tif (number >= tmp) {\n\t\t\tnumber = number - tmp;\n\n\t\t\tif (i <= index) {\n\t\t\t\tnumOnes++;\n\t\t\t}\n\t\t}\n\n\t\ttmp = tmp / 2;\n\t}\n\n\treturn numOnes;\n}\n\n/**\n * Checks whether the bit at index is 1.0\n *\n * number is treated as if it were an integer in the range 0-255\n */\nbool isBitSet(int number, int index){\n\n\t// weird multi else if due to lack of proper array, int and bitwise support in WebGL 1.0\n\tint powi = 1;\n\tif (index == 0) {\n\t\tpowi = 1;\n\t} else if (index == 1) {\n\t\tpowi = 2;\n\t} else if (index == 2) {\n\t\tpowi = 4;\n\t} else if (index == 3) {\n\t\tpowi = 8;\n\t} else if (index == 4) {\n\t\tpowi = 16;\n\t} else if (index == 5) {\n\t\tpowi = 32;\n\t} else if (index == 6) {\n\t\tpowi = 64;\n\t} else if (index == 7) {\n\t\tpowi = 128;\n\t}\n\n\tint ndp = number / powi;\n\n\treturn mod(float(ndp), 2.0) != 0.0;\n}\n\n/**\n * Gets the the LOD at the point position.\n */\nfloat getLOD() {\n\tvec3 offset = vec3(0.0, 0.0, 0.0);\n\tint iOffset = int(vnStart);\n\tfloat depth = level;\n\n\tfor (float i = 0.0; i <= 30.0; i++) {\n\t\tfloat nodeSizeAtLevel = octreeSize  / pow(2.0, i + level + 0.0);\n\n\t\tvec3 index3d = (position-offset) / nodeSizeAtLevel;\n\t\tindex3d = floor(index3d + 0.5);\n\t\tint index = int(round(4.0 * index3d.x + 2.0 * index3d.y + index3d.z));\n\n\t\tvec4 value = texture(visibleNodes, vec2(float(iOffset) / 2048.0, 0.0));\n\t\tint mask = int(round(value.r * 255.0));\n\n\t\tif (isBitSet(mask, index)) {\n\t\t\t// there are more visible child nodes at this position\n\t\t\tint advanceG = int(round(value.g * 255.0)) * 256;\n\t\t\tint advanceB = int(round(value.b * 255.0));\n\t\t\tint advanceChild = numberOfOnes(mask, index - 1);\n\t\t\tint advance = advanceG + advanceB + advanceChild;\n\n\t\t\tiOffset = iOffset + advance;\n\n\t\t\tdepth++;\n\t\t} else {\n\t\t\treturn value.a * 255.0; // no more visible child nodes at this position\n\t\t}\n\n\t\toffset = offset + (vec3(1.0, 1.0, 1.0) * nodeSizeAtLevel * 0.5) * index3d;\n\t}\n\n\treturn depth;\n}\n\nfloat getPointSizeAttenuation() {\n\treturn 0.5 * pow(2.0, getLOD());\n}\n\n#endif\n\n// ---------------------\n// KD-TREE\n// ---------------------\n\n#if (defined(adaptive_point_size) || defined(color_type_lod)) && defined(tree_type_kdtree)\n\nfloat getLOD() {\n\tvec3 offset = vec3(0.0, 0.0, 0.0);\n\tfloat intOffset = 0.0;\n\tfloat depth = 0.0;\n\n\tvec3 size = bbSize;\n\tvec3 pos = position;\n\n\tfor (float i = 0.0; i <= 1000.0; i++) {\n\n\t\tvec4 value = texture(visibleNodes, vec2(intOffset / 2048.0, 0.0));\n\n\t\tint children = int(value.r * 255.0);\n\t\tfloat next = value.g * 255.0;\n\t\tint split = int(value.b * 255.0);\n\n\t\tif (next == 0.0) {\n\t\t \treturn depth;\n\t\t}\n\n\t\tvec3 splitv = vec3(0.0, 0.0, 0.0);\n\t\tif (split == 1) {\n\t\t\tsplitv.x = 1.0;\n\t\t} else if (split == 2) {\n\t\t \tsplitv.y = 1.0;\n\t\t} else if (split == 4) {\n\t\t \tsplitv.z = 1.0;\n\t\t}\n\n\t\tintOffset = intOffset + next;\n\n\t\tfloat factor = length(pos * splitv / size);\n\t\tif (factor < 0.5) {\n\t\t \t// left\n\t\t\tif (children == 0 || children == 2) {\n\t\t\t\treturn depth;\n\t\t\t}\n\t\t} else {\n\t\t\t// right\n\t\t\tpos = pos - size * splitv * 0.5;\n\t\t\tif (children == 0 || children == 1) {\n\t\t\t\treturn depth;\n\t\t\t}\n\t\t\tif (children == 3) {\n\t\t\t\tintOffset = intOffset + 1.0;\n\t\t\t}\n\t\t}\n\t\tsize = size * ((1.0 - (splitv + 1.0) / 2.0) + 0.5);\n\n\t\tdepth++;\n\t}\n\n\n\treturn depth;\n}\n\nfloat getPointSizeAttenuation() {\n\treturn 0.5 * pow(1.3, getLOD());\n}\n\n#endif\n\n// formula adapted from: http://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/\nfloat getContrastFactor(float contrast) {\n\treturn (1.0158730158730156 * (contrast + 1.0)) / (1.0158730158730156 - contrast);\n}\n\nvec3 getRGB() {\n\t#if defined(use_rgb_gamma_contrast_brightness)\n\t  vec3 rgb = color;\n\t\trgb = pow(rgb, vec3(rgbGamma));\n\t\trgb = rgb + rgbBrightness;\n\t\trgb = (rgb - 0.5) * getContrastFactor(rgbContrast) + 0.5;\n\t\trgb = clamp(rgb, 0.0, 1.0);\n\t\treturn rgb;\n\t#else\n\t\treturn color;\n\t#endif\n}\n\nfloat getIntensity() {\n\tfloat w = (intensity - intensityRange.x) / (intensityRange.y - intensityRange.x);\n\tw = pow(w, intensityGamma);\n\tw = w + intensityBrightness;\n\tw = (w - 0.5) * getContrastFactor(intensityContrast) + 0.5;\n\tw = clamp(w, 0.0, 1.0);\n\n\treturn w;\n}\n\nvec3 getElevation() {\n\tvec4 world = modelMatrix * vec4( position, 1.0 );\n\tfloat w = (world.z - heightMin) / (heightMax-heightMin);\n\tvec3 cElevation = texture(gradient, vec2(w,1.0-w)).rgb;\n\n\treturn cElevation;\n}\n\nvec4 getClassification() {\n\tvec2 uv = vec2(classification / 255.0, 0.5);\n\tvec4 classColor = texture(classificationLUT, uv);\n\n\treturn classColor;\n}\n\nvec3 getReturnNumber() {\n\tif (numberOfReturns == 1.0) {\n\t\treturn vec3(1.0, 1.0, 0.0);\n\t} else {\n\t\tif (returnNumber == 1.0) {\n\t\t\treturn vec3(1.0, 0.0, 0.0);\n\t\t} else if (returnNumber == numberOfReturns) {\n\t\t\treturn vec3(0.0, 0.0, 1.0);\n\t\t} else {\n\t\t\treturn vec3(0.0, 1.0, 0.0);\n\t\t}\n\t}\n}\n\nvec3 getSourceID() {\n\tfloat w = mod(pointSourceID, 10.0) / 10.0;\n\treturn texture(gradient, vec2(w, 1.0 - w)).rgb;\n}\n\nvec3 getCompositeColor() {\n\tvec3 c;\n\tfloat w;\n\n\tc += wRGB * getRGB();\n\tw += wRGB;\n\n\tc += wIntensity * getIntensity() * vec3(1.0, 1.0, 1.0);\n\tw += wIntensity;\n\n\tc += wElevation * getElevation();\n\tw += wElevation;\n\n\tc += wReturnNumber * getReturnNumber();\n\tw += wReturnNumber;\n\n\tc += wSourceID * getSourceID();\n\tw += wSourceID;\n\n\tvec4 cl = wClassification * getClassification();\n\tc += cl.a * cl.rgb;\n\tw += wClassification * cl.a;\n\n\tc = c / w;\n\n\t// if (w == 0.0) {\n\t// \tgl_Position = vec4(100.0, 100.0, 100.0, 0.0);\n\t// }\n\n\treturn c;\n}\n\nvoid main() {\n\tvec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n\tvec4 mPosition = modelMatrix * vec4(position, 1.0);\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n\t#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0) || defined(paraboloid_point_shape)\n\t\tvViewPosition = mvPosition.xyz;\n\t#endif\n\n\t#if defined weighted_splats\n\t\tvLinearDepth = gl_Position.w;\n\t#endif\n\n\t#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0)\n\t\tvNormal = normalize(normalMatrix * normal);\n\t#endif\n\n\t#if !defined(paraboloid_point_shape) && defined(use_edl)\n\t\tvLogDepth = log2(-mvPosition.z);\n\t#endif\n\n\t// ---------------------\n\t// POINT SIZE\n\t// ---------------------\n\n\tfloat pointSize = 1.0;\n\tfloat slope = tan(fov / 2.0);\n\tfloat projFactor =  -0.5 * screenHeight / (slope * mvPosition.z);\n\n\t#if defined fixed_point_size\n\t\tpointSize = size;\n\t#elif defined attenuated_point_size\n\t\tpointSize = size * spacing * projFactor;\n\t#elif defined adaptive_point_size\n\t\tfloat worldSpaceSize = 2.0 * size * spacing / getPointSizeAttenuation();\n\t\tpointSize = worldSpaceSize * projFactor;\n\t#endif\n\n\tpointSize = max(minSize, pointSize);\n\tpointSize = min(maxSize, pointSize);\n\n\t#if defined(weighted_splats) || defined(paraboloid_point_shape)\n\t\tvRadius = pointSize / projFactor;\n\t#endif\n\n\tgl_PointSize = pointSize;\n\n\t// ---------------------\n\t// HIGHLIGHTING\n\t// ---------------------\n\n\t#ifdef highlight_point\n\t\tif (enablePointHighlighting && abs(mPosition.x - highlightedPointCoordinate.x) < 0.0001 &&\n\t\t\tabs(mPosition.y - highlightedPointCoordinate.y) < 0.0001 &&\n\t\t\tabs(mPosition.z - highlightedPointCoordinate.z) < 0.0001) {\n\t\t\tvHighlight = 1.0;\n\t\t\tgl_PointSize = pointSize * highlightedPointScale;\n\t\t} else {\n\t\t\tvHighlight = 0.0;\n\t\t}\n\t#endif\n\n\t// ---------------------\n\t// OPACITY\n\t// ---------------------\n\n\t#ifndef color_type_point_index\n\t\t#ifdef attenuated_opacity\n\t\t\tvOpacity = opacity * exp(-length(-mvPosition.xyz) / opacityAttenuation);\n\t\t#else\n\t\t\tvOpacity = opacity;\n\t\t#endif\n\t#endif\n\n\t// ---------------------\n\t// FILTERING\n\t// ---------------------\n\n\t#ifdef use_filter_by_normal\n\t\tif(abs((modelViewMatrix * vec4(normal, 0.0)).z) > filterByNormalThreshold) {\n\t\t\t// Move point outside clip space space to discard it.\n\t\t\tgl_Position = vec4(0.0, 0.0, 2.0, 1.0);\n\t\t}\n\t#endif\n\n\t// ---------------------\n\t// POINT COLOR\n\t// ---------------------\n\n\t#ifdef color_type_rgb\n\t\tvColor = getRGB();\n\t#elif defined color_type_height\n\t\tvColor = getElevation();\n\t#elif defined color_type_rgb_height\n\t\tvec3 cHeight = getElevation();\n\t\tvColor = (1.0 - transition) * getRGB() + transition * cHeight;\n\t#elif defined color_type_depth\n\t\tfloat linearDepth = -mvPosition.z ;\n\t\tfloat expDepth = (gl_Position.z / gl_Position.w) * 0.5 + 0.5;\n\t\tvColor = vec3(linearDepth, expDepth, 0.0);\n\t#elif defined color_type_intensity\n\t\tfloat w = getIntensity();\n\t\tvColor = vec3(w, w, w);\n\t#elif defined color_type_intensity_gradient\n\t\tfloat w = getIntensity();\n\t\tvColor = texture(gradient, vec2(w, 1.0 - w)).rgb;\n\t#elif defined color_type_color\n\t\tvColor = uColor;\n\t#elif defined color_type_lod\n\tfloat w = getLOD() / 10.0;\n\tvColor = texture(gradient, vec2(w, 1.0 - w)).rgb;\n\t#elif defined color_type_point_index\n\t\tvColor = indices.rgb;\n\t#elif defined color_type_classification\n\t  vec4 cl = getClassification();\n\t\tvColor = cl.rgb;\n\t#elif defined color_type_return_number\n\t\tvColor = getReturnNumber();\n\t#elif defined color_type_source\n\t\tvColor = getSourceID();\n\t#elif defined color_type_normal\n\t\tvColor = (modelMatrix * vec4(normal, 0.0)).xyz;\n\t#elif defined color_type_phong\n\t\tvColor = color;\n\t#elif defined color_type_composite\n\t\tvColor = getCompositeColor();\n\t#endif\n\n\t// #if !defined color_type_composite && defined color_type_classification\n\t// \tif (cl.a == 0.0) {\n\t// \t\tgl_Position = vec4(100.0, 100.0, 100.0, 0.0);\n\t// \t\treturn;\n\t// \t}\n\t// #endif\n\n\t// ---------------------\n\t// CLIPPING\n\t// ---------------------\n\n\t// #if defined use_clip_box\n\t// \tbool insideAny = false;\n\t// \tfor (int i = 0; i < max_clip_boxes; i++) {\n\t// \t\tif (i == int(clipBoxCount)) {\n\t// \t\t\tbreak;\n\t// \t\t}\n\n\t// \t\tvec4 clipPosition = clipBoxes[i] * modelMatrix * vec4(position, 1.0);\n\t// \t\tbool inside = -0.5 <= clipPosition.x && clipPosition.x <= 0.5;\n\t// \t\tinside = inside && -0.5 <= clipPosition.y && clipPosition.y <= 0.5;\n\t// \t\tinside = inside && -0.5 <= clipPosition.z && clipPosition.z <= 0.5;\n\t// \t\tinsideAny = insideAny || inside;\n\t// \t}\n\n\t// \tif (!insideAny) {\n\t// \t\t#if defined clip_outside\n\t// \t\t\tgl_Position = vec4(1000.0, 1000.0, 1000.0, 1.0);\n\t// \t\t#elif defined clip_highlight_inside && !defined(color_type_depth)\n\t// \t\t\tfloat c = (vColor.r + vColor.g + vColor.b) / 6.0;\n\t// \t\t#endif\n\t// \t} else {\n\t// \t\t#if defined clip_highlight_inside\n\t// \t\t\tvColor.r += 0.5;\n\t// \t\t#endif\n\t// \t}\n\t// #endif\n\n\t// #if NUM_CLIP_PLANES > 0\n\t// \tvec4 plane;\n\t// \tvec3 vClipPosition = -(modelMatrix * vec4(position, 1.0)).xyz;\n\t// \tfor (int i = 0; i < NUM_CLIP_PLANES; i++) {\n\t// \t\tplane = clippingPlanes[i];\n\t// \t\tif (dot(vClipPosition, plane.xyz) > plane.w) {\n\t// \t\t\tgl_Position = vec4(1000.0, 1000.0, 1000.0, 1.0);\n\t// \t\t};\n\t// \t}\n\t// #endif\n}\n");

/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_RGB_BRIGHTNESS": () => (/* binding */ DEFAULT_RGB_BRIGHTNESS),
/* harmony export */   "DEFAULT_RGB_CONTRAST": () => (/* binding */ DEFAULT_RGB_CONTRAST),
/* harmony export */   "DEFAULT_RGB_GAMMA": () => (/* binding */ DEFAULT_RGB_GAMMA),
/* harmony export */   "DEFAULT_MAX_POINT_SIZE": () => (/* binding */ DEFAULT_MAX_POINT_SIZE),
/* harmony export */   "DEFAULT_MIN_NODE_PIXEL_SIZE": () => (/* binding */ DEFAULT_MIN_NODE_PIXEL_SIZE),
/* harmony export */   "DEFAULT_MIN_POINT_SIZE": () => (/* binding */ DEFAULT_MIN_POINT_SIZE),
/* harmony export */   "DEFAULT_PICK_WINDOW_SIZE": () => (/* binding */ DEFAULT_PICK_WINDOW_SIZE),
/* harmony export */   "DEFAULT_POINT_BUDGET": () => (/* binding */ DEFAULT_POINT_BUDGET),
/* harmony export */   "MAX_LOADS_TO_GPU": () => (/* binding */ MAX_LOADS_TO_GPU),
/* harmony export */   "MAX_NUM_NODES_LOADING": () => (/* binding */ MAX_NUM_NODES_LOADING),
/* harmony export */   "PERSPECTIVE_CAMERA": () => (/* binding */ PERSPECTIVE_CAMERA),
/* harmony export */   "COLOR_BLACK": () => (/* binding */ COLOR_BLACK),
/* harmony export */   "DEFAULT_HIGHLIGHT_COLOR": () => (/* binding */ DEFAULT_HIGHLIGHT_COLOR)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const DEFAULT_RGB_BRIGHTNESS = 0;
const DEFAULT_RGB_CONTRAST = 0;
const DEFAULT_RGB_GAMMA = 1;
const DEFAULT_MAX_POINT_SIZE = 50;
const DEFAULT_MIN_NODE_PIXEL_SIZE = 50;
const DEFAULT_MIN_POINT_SIZE = 2;
const DEFAULT_PICK_WINDOW_SIZE = 15;
const DEFAULT_POINT_BUDGET = 1000000;
const MAX_LOADS_TO_GPU = 2;
const MAX_NUM_NODES_LOADING = 4;
const PERSPECTIVE_CAMERA = 'PerspectiveCamera';
const COLOR_BLACK = new three__WEBPACK_IMPORTED_MODULE_0__.Color(0, 0, 0);
const DEFAULT_HIGHLIGHT_COLOR = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(1, 0, 0, 1);


/***/ }),

/***/ "./src/features.ts":
/*!*************************!*\
  !*** ./src/features.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FEATURES": () => (/* binding */ FEATURES)
/* harmony export */ });
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
const FEATURES = {
    SHADER_INTERPOLATION: hasExtension('EXT_frag_depth') && hasMinVaryingVectors(8),
    SHADER_SPLATS: hasExtension('EXT_frag_depth') && hasExtension('OES_texture_float') && hasMinVaryingVectors(8),
    SHADER_EDL: hasExtension('OES_texture_float') && hasMinVaryingVectors(8),
    precision: getPrecision(),
};
function hasExtension(ext) {
    return gl !== null && Boolean(gl.getExtension(ext));
}
function hasMinVaryingVectors(value) {
    return gl !== null && gl.getParameter(gl.MAX_VARYING_VECTORS) >= value;
}
function getPrecision() {
    if (gl === null) {
        return '';
    }
    const vsHighpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
    const vsMediumpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);
    const fsHighpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const fsMediumpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
    const highpAvailable = vsHighpFloat && fsHighpFloat && vsHighpFloat.precision > 0 && fsHighpFloat.precision > 0;
    const mediumpAvailable = vsMediumpFloat &&
        fsMediumpFloat &&
        vsMediumpFloat.precision > 0 &&
        fsMediumpFloat.precision > 0;
    return highpAvailable ? 'highp' : mediumpAvailable ? 'mediump' : 'lowp';
}


/***/ }),

/***/ "./src/loading/binary-loader.ts":
/*!**************************************!*\
  !*** ./src/loading/binary-loader.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BinaryLoader": () => (/* binding */ BinaryLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _point_attributes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../point-attributes */ "./src/point-attributes.ts");
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../version */ "./src/version.ts");
/* harmony import */ var _workers_binary_decoder_worker_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../workers/binary-decoder.worker.js */ "./src/workers/binary-decoder.worker.js");
// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------



// @ts-ignore

class BinaryLoader {
    constructor({ getUrl = s => Promise.resolve(s), version, boundingBox, scale, xhrRequest, }) {
        this.disposed = false;
        this.workers = [];
        if (typeof version === 'string') {
            this.version = new _version__WEBPACK_IMPORTED_MODULE_2__.Version(version);
        }
        else {
            this.version = version;
        }
        this.xhrRequest = xhrRequest;
        this.getUrl = getUrl;
        this.boundingBox = boundingBox;
        this.scale = scale;
        this.callbacks = [];
    }
    dispose() {
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.disposed = true;
    }
    load(node) {
        if (node.loaded || this.disposed) {
            return Promise.resolve();
        }
        return Promise.resolve(this.getUrl(this.getNodeUrl(node), 0))
            .then(url => this.xhrRequest(url, { mode: 'cors' }))
            .then(res => res.arrayBuffer())
            .then(buffer => {
            return new Promise(resolve => this.parse(node, buffer, resolve));
        });
    }
    getNodeUrl(node) {
        let url = node.getUrl();
        if (this.version.equalOrHigher('1.4')) {
            url += '.bin';
        }
        return url;
    }
    parse(node, buffer, resolve) {
        if (this.disposed) {
            resolve();
            return;
        }
        const worker = this.getWorker();
        const pointAttributes = node.pcoGeometry.pointAttributes;
        const numPoints = buffer.byteLength / pointAttributes.byteSize;
        if (this.version.upTo('1.5')) {
            node.numPoints = numPoints;
        }
        worker.onmessage = (e) => {
            if (this.disposed) {
                resolve();
                return;
            }
            const data = e.data;
            const geometry = (node.geometry = node.geometry || new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry());
            geometry.boundingBox = node.boundingBox;
            this.addBufferAttributes(geometry, data.attributeBuffers);
            this.addIndices(geometry, data.indices);
            this.addNormalAttribute(geometry, numPoints);
            node.mean = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromArray(data.mean);
            node.tightBoundingBox = this.getTightBoundingBox(data.tightBoundingBox);
            node.loaded = true;
            node.loading = false;
            node.failed = false;
            node.pcoGeometry.numNodesLoading--;
            node.pcoGeometry.needsUpdate = true;
            this.releaseWorker(worker);
            this.callbacks.forEach(callback => callback(node));
            resolve();
        };
        const message = {
            buffer,
            pointAttributes,
            version: this.version.version,
            min: node.boundingBox.min.toArray(),
            offset: node.pcoGeometry.offset.toArray(),
            scale: this.scale,
            spacing: node.spacing,
            hasChildren: node.hasChildren,
        };
        worker.postMessage(message, [message.buffer]);
    }
    getWorker() {
        const worker = this.workers.pop();
        if (worker) {
            return worker;
        }
        return new _workers_binary_decoder_worker_js__WEBPACK_IMPORTED_MODULE_3__["default"]();
    }
    releaseWorker(worker) {
        this.workers.push(worker);
    }
    getTightBoundingBox({ min, max }) {
        const box = new three__WEBPACK_IMPORTED_MODULE_0__.Box3(new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromArray(min), new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromArray(max));
        box.max.sub(box.min);
        box.min.set(0, 0, 0);
        return box;
    }
    addBufferAttributes(geometry, buffers) {
        Object.keys(buffers).forEach(property => {
            const buffer = buffers[property].buffer;
            if (this.isAttribute(property, _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName.POSITION_CARTESIAN)) {
                geometry.setAttribute('position', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(buffer), 3));
            }
            else if (this.isAttribute(property, _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName.COLOR_PACKED)) {
                geometry.setAttribute('color', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Uint8Array(buffer), 3, true));
            }
            else if (this.isAttribute(property, _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName.INTENSITY)) {
                geometry.setAttribute('intensity', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(buffer), 1));
            }
            else if (this.isAttribute(property, _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName.CLASSIFICATION)) {
                geometry.setAttribute('classification', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Uint8Array(buffer), 1));
            }
            else if (this.isAttribute(property, _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName.NORMAL_SPHEREMAPPED)) {
                geometry.setAttribute('normal', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(buffer), 3));
            }
            else if (this.isAttribute(property, _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName.NORMAL_OCT16)) {
                geometry.setAttribute('normal', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(buffer), 3));
            }
            else if (this.isAttribute(property, _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName.NORMAL)) {
                geometry.setAttribute('normal', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(buffer), 3));
            }
        });
    }
    addIndices(geometry, indices) {
        const indicesAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.Uint8BufferAttribute(indices, 4);
        indicesAttribute.normalized = true;
        geometry.setAttribute('indices', indicesAttribute);
    }
    addNormalAttribute(geometry, numPoints) {
        if (!geometry.getAttribute('normal')) {
            const buffer = new Float32Array(numPoints * 3);
            geometry.setAttribute('normal', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(buffer), 3));
        }
    }
    isAttribute(property, name) {
        return parseInt(property, 10) === name;
    }
}


/***/ }),

/***/ "./src/loading/index.ts":
/*!******************************!*\
  !*** ./src/loading/index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BinaryLoader": () => (/* reexport safe */ _binary_loader__WEBPACK_IMPORTED_MODULE_0__.BinaryLoader),
/* harmony export */   "YBFLoader": () => (/* reexport safe */ _ybf_loader__WEBPACK_IMPORTED_MODULE_1__.YBFLoader),
/* harmony export */   "loadResonaiPOC": () => (/* reexport safe */ _load_poc__WEBPACK_IMPORTED_MODULE_2__.loadResonaiPOC),
/* harmony export */   "loadSingle": () => (/* reexport safe */ _load_poc__WEBPACK_IMPORTED_MODULE_2__.loadSingle)
/* harmony export */ });
/* harmony import */ var _binary_loader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./binary-loader */ "./src/loading/binary-loader.ts");
/* harmony import */ var _ybf_loader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ybf-loader */ "./src/loading/ybf-loader.ts");
/* harmony import */ var _load_poc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./load-poc */ "./src/loading/load-poc.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./types */ "./src/loading/types.ts");






/***/ }),

/***/ "./src/loading/load-poc.ts":
/*!*********************************!*\
  !*** ./src/loading/load-poc.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadSingle": () => (/* binding */ loadSingle),
/* harmony export */   "loadResonaiPOC": () => (/* binding */ loadResonaiPOC)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _point_cloud_octree_geometry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../point-cloud-octree-geometry */ "./src/point-cloud-octree-geometry.ts");
/* harmony import */ var _point_cloud_octree_geometry_node__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../point-cloud-octree-geometry-node */ "./src/point-cloud-octree-geometry-node.ts");
/* harmony import */ var _ybf_loader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ybf-loader */ "./src/loading/ybf-loader.ts");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./src/utils/utils.ts");
// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------




//import { createChildAABB } from '../utils/bounds';
//import { getIndexFromName } from '../utils/utils';

// interface BoundingBoxData {
//   lx: number;
//   ly: number;
//   lz: number;
//   ux: number;
//   uy: number;
//   uz: number;
// }
// interface POCJson {
//   version: string;
//   octreeDir: string;
//   projection: string;
//   points: number;
//   boundingBox: BoundingBoxData;
//   tightBoundingBox?: BoundingBoxData;
//   pointAttributes: PointAttributeStringName[];
//   spacing: number;
//   scale: number;
//   hierarchyStepSize: number;
//   hierarchy: [string, number][]; // [name, numPoints][]
// }
// interface MinBoundingBoxData {
//   lx: number;
//   ly: number;
//   lz: number;
// }
// interface POCResonaiJson {
//   minBoundingBox: MinBoundingBoxData;
//   //pointAttributes: PointAttributeStringName[];
//   scale: number;
//   nodes: [number][]; // [name, numPoints][]
// }
/**
 *
 * @param url
 *    The url of the point cloud file (usually cloud.js).
 * @param getUrl
 *    Function which receives the relative URL of a point cloud chunk file which is to be loaded
 *    and should return a new url (e.g. signed) in the form of a string or a promise.
 * @param xhrRequest An arrow function for a fetch request
 * @returns
 *    An observable which emits once when the first LOD of the point cloud is loaded.
 */
// export function loadPOC(
//   potreeName: string, // "cloud.js"
//   getUrl: GetUrlFn,
//   xhrRequest: XhrRequest,
// ): Promise<PointCloudOctreeGeometry> {
//   console.log('loadPOC', potreeName)
//   return Promise.resolve(getUrl(potreeName)).then(transformedUrl => {
//     return xhrRequest(transformedUrl, { mode: 'cors' })
//       .then(res => res.json())
//       .then(parse(transformedUrl, getUrl, xhrRequest));
//   });
// }
function loadSingle(url, xhrRequest) {
    return parseSingle(url, xhrRequest)();
}
function loadResonaiPOC(url, // gs://bla/bla/r.json
getUrl, xhrRequest) {
    return xhrRequest((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.gsToPath)(url), { mode: 'cors' })
        .then(res => res.json())
        .then(parseResonai((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.gsToPath)(url), getUrl, xhrRequest));
}
// export function loadResonaiPOC(
//   url: string,
//   getUrl: GetUrlFn,
//   xhrRequest: XhrRequest,
// ): Promise<PointCloudOctreeGeometry> {
//   console.log('loadResonaiPOC', url)
//   return xhrRequest(gsToPath(url), { mode: 'cors' })
//     .then(res => res.json())
//     .then(parseResonai(gsToPath(url), getUrl, xhrRequest));
// }
// function parse(
//   url: string, // gs://myfiles/cloud.js
//   getUrl: GetUrlFn,
//   xhrRequest: XhrRequest) {
//   return (data: POCJson): Promise<PointCloudOctreeGeometry> => {
//     const { offset, boundingBox, tightBoundingBox } = getBoundingBoxes(data);
//     const loader = new BinaryLoader({
//       getUrl,
//       version: data.version,
//       boundingBox,
//       scale: data.scale,
//       xhrRequest,
//     });
//     const pco = new PointCloudOctreeGeometry(
//       loader,
//       boundingBox,
//       tightBoundingBox,
//       offset,
//       xhrRequest,
//     );
//     pco.url = url;
//     pco.octreeDir = data.octreeDir;
//     pco.needsUpdate = true;
//     pco.spacing = data.spacing;
//     pco.hierarchyStepSize = data.hierarchyStepSize;
//     pco.projection = data.projection;
//     pco.offset = offset;
//     pco.pointAttributes = new PointAttributes(data.pointAttributes);
//     const nodes: Record<string, PointCloudOctreeGeometryNode> = {};
//     const version = new Version(data.version);
//     return loadRoot(pco, data, nodes, version).then(() => {
//       if (version.upTo('1.4')) {
//         loadRemainingHierarchy(pco, data, nodes);
//       }
//       pco.nodes = nodes;
//       return pco;
//     });
//   };
// }
function parseSingle(url, xhrRequest) {
    return () => {
        const loader = new _ybf_loader__WEBPACK_IMPORTED_MODULE_3__.YBFLoader({
            url
        });
        const pco = new _point_cloud_octree_geometry__WEBPACK_IMPORTED_MODULE_1__.PointCloudOctreeGeometry(loader, new three__WEBPACK_IMPORTED_MODULE_0__.Box3(), new three__WEBPACK_IMPORTED_MODULE_0__.Box3(), new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(), xhrRequest);
        pco.url = url;
        pco.needsUpdate = true;
        // pco.offset = offset;
        // pco.pointAttributes = new PointAttributes(data.pointAttributes);
        const nodes = {};
        return loadRoot(pco, nodes).then(() => {
            pco.nodes = nodes;
            return pco;
        });
    };
}
/*
{
  "version": "1.7",
  "octreeDir": "data",
  "boundingBox": {
    "lx": -0.748212993144989,
    "ly": -2.78040599822998,
    "lz": 2.54782128334045,
    "ux": 3.89967638254166,
    "uy": 1.86748337745667,
    "uz": 7.1957106590271
  },
  "tightBoundingBox": {
    "lx": -0.748212993144989,
    "ly": -2.78040599822998,
    "lz": 2.55100011825562,
    "ux": 2.4497377872467,
    "uy": 1.48934376239777,
    "uz": 7.1957106590271
  },
  "pointAttributes": [
    "POSITION_CARTESIAN",
    "COLOR_PACKED",
    "NORMAL_SPHEREMAPPED"
  ],
  "spacing": 0.0750000029802322,
  "scale": 0.001,
  "hierarchyStepSize": 6
}
*/
// function parseResonai(url: string, getUrl: GetUrlFn, xhrRequest: XhrRequest) {
//   return (data: POCJson): Promise<PointCloudOctreeGeometry> => {
//     console.log('parseResonai', data);
//     const { offset, boundingBox, tightBoundingBox } = getResonaiBoundingBoxes(data);
//     const fakeVersion = '1.8' // TODO(Shai) what to do with this?
//     const loader = new BinaryLoader({ // should be YBFLoader
//       getUrl,
//       version: fakeVersion,
//       boundingBox,
//       scale: 1,
//       xhrRequest,
//     });
//     const pco = new PointCloudOctreeGeometry(
//       loader,
//       boundingBox,
//       tightBoundingBox,
//       offset,
//       xhrRequest,
//     );
//     pco.url = url;
//     pco.octreeDir = data.octreeDir;
//     pco.needsUpdate = true;
//     pco.spacing = data.spacing * 2;
//     pco.hierarchyStepSize = data.hierarchyStepSize;
//     pco.projection = data.projection;
//     pco.offset = offset;
//     pco.pointAttributes = new PointAttributes(data.pointAttributes);
//     const nodes: Record<string, PointCloudOctreeGeometryNode> = {};
//     const version = new Version(fakeVersion);
//     return loadRoot(pco, data, nodes, version).then(() => {
//       if (version.upTo('1.4')) {
//         loadRemainingHierarchy(pco, data, nodes);
//       }
//       pco.nodes = nodes;
//       return pco;
//     });
//   };
// }
// function getBoundingBoxes(
//   data: POCJson,
// ): { offset: Vector3; boundingBox: Box3; tightBoundingBox: Box3 } {
//   const min = new Vector3(data.boundingBox.lx, data.boundingBox.ly, data.boundingBox.lz);
//   const max = new Vector3(data.boundingBox.ux, data.boundingBox.uy, data.boundingBox.uz);
//   const boundingBox = new Box3(min, max);
//   const tightBoundingBox = boundingBox.clone();
//   const offset = min.clone();
//   if (data.tightBoundingBox) {
//     const { lx, ly, lz, ux, uy, uz } = data.tightBoundingBox;
//     tightBoundingBox.min.set(lx, ly, lz);
//     tightBoundingBox.max.set(ux, uy, uz);
//   }
//   boundingBox.min.sub(offset);
//   boundingBox.max.sub(offset);
//   tightBoundingBox.min.sub(offset);
//   tightBoundingBox.max.sub(offset);
//   return { offset, boundingBox, tightBoundingBox };
// }
// function getResonaiBoundingBoxes(
//   data: any, // TODO(Shai) implement interface?
// ): { offset: Vector3; boundingBox: Box3; tightBoundingBox: Box3 } {
//   const min = new Vector3(...data.min_bounding_box)
//   const max = min.clone().addScalar(data.scale);
//   const boundingBox = new Box3(min, max);
//   const tightBoundingBox = boundingBox.clone();
//   const offset = min.clone();
//   boundingBox.min.sub(offset);
//   boundingBox.max.sub(offset);
//   tightBoundingBox.min.sub(offset);
//   tightBoundingBox.max.sub(offset);
//   return { offset, boundingBox, tightBoundingBox };
// }
function parseResonai(url, getUrl, xhrRequest) {
    return (data) => {
        const boundingBox = getResonaiBoundingBoxes(data);
        const loader = new _ybf_loader__WEBPACK_IMPORTED_MODULE_3__.YBFLoader({
            url, getUrl
        });
        const pco = new _point_cloud_octree_geometry__WEBPACK_IMPORTED_MODULE_1__.PointCloudOctreeGeometry(loader, boundingBox, boundingBox, new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(), xhrRequest);
        pco.url = url;
        pco.needsUpdate = true;
        // pco.offset = offset;
        // pco.pointAttributes = new PointAttributes(data.pointAttributes);
        const nodes = {};
        return loadResonaiRoot(url, pco, data, nodes).then(() => {
            //loadRemainingHierarchy(pco, data, nodes);
            pco.nodes = nodes;
            return pco;
        });
    };
}
// function getBoundingBoxes(
//   data: POCJson,
// ): { offset: Vector3; boundingBox: Box3; tightBoundingBox: Box3 } {
//   const min = new Vector3(data.boundingBox.lx, data.boundingBox.ly, data.boundingBox.lz);
//   const max = new Vector3(data.boundingBox.ux, data.boundingBox.uy, data.boundingBox.uz);
//   const boundingBox = new Box3(min, max);
//   const tightBoundingBox = boundingBox.clone();
//   const offset = min.clone();
//   if (data.tightBoundingBox) {
//     const { lx, ly, lz, ux, uy, uz } = data.tightBoundingBox;
//     tightBoundingBox.min.set(lx, ly, lz);
//     tightBoundingBox.max.set(ux, uy, uz);
//   }
//   boundingBox.min.sub(offset);
//   boundingBox.max.sub(offset);
//   tightBoundingBox.min.sub(offset);
//   tightBoundingBox.max.sub(offset);
//   return { offset, boundingBox, tightBoundingBox };
// }
function getResonaiBoundingBoxes(data) {
    const min = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(...data.min_bounding_box);
    const max = min.clone().addScalar(data.scale);
    const boundingBox = new three__WEBPACK_IMPORTED_MODULE_0__.Box3(min, max);
    // // const tightBoundingBox = boundingBox.clone();
    // const offset = min.clone();
    // boundingBox.min.sub(offset);
    // boundingBox.max.sub(offset);
    // tightBoundingBox.min.sub(offset);
    // tightBoundingBox.max.sub(offset);
    //return { offset, boundingBox, tightBoundingBox };
    return boundingBox;
}
function loadRoot(pco, nodes) {
    const name = 'r';
    const root = new _point_cloud_octree_geometry_node__WEBPACK_IMPORTED_MODULE_2__.PointCloudOctreeGeometryNode(name, pco, pco.boundingBox, 0);
    root.hasChildren = true;
    root.spacing = pco.spacing || 0.1;
    root.numPoints = 50000;
    pco.root = root;
    nodes[name] = root;
    return pco.root.load();
}
// function loadRemainingHierarchy(
//   pco: PointCloudOctreeGeometry,
//   data: POCJson,
//   nodes: Record<string, PointCloudOctreeGeometryNode>,
// ): void {
//   for (let i = 1; i < data.hierarchy.length; i++) {
//     const [name, numPoints] = data.hierarchy[i];
//     const { index, parentName, level } = parseName(name);
//     const parentNode = nodes[parentName];
//     const boundingBox = createChildAABB(parentNode.boundingBox, index);
//     const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
//     node.level = level;
//     node.numPoints = numPoints;
//     node.spacing = pco.spacing / Math.pow(2, node.level);
//     nodes[name] = node;
//     parentNode.addChild(node);
//   }
// }
// function parseName(name: string): { index: number; parentName: string; level: number } {
//   return {
//     index: getIndexFromName(name),
//     parentName: name.substring(0, name.length - 1),
//     level: name.length - 1,
//   };
// }
function loadResonaiRoot(url, pco, data, nodes) {
    const name = 'r';
    const root = new _point_cloud_octree_geometry_node__WEBPACK_IMPORTED_MODULE_2__.PointCloudOctreeGeometryNode(name, pco, pco.boundingBox, 0);
    root.hasChildren = true;
    // root.spacing = pco.spacing;
    const mask = (1 << 24) - 1;
    root.numPoints = data.nodes[0] & mask;
    root.numPoints = 0;
    root.hierarchyUrl = url;
    pco.root = root;
    nodes[name] = root;
    return pco.root.loadResonai();
}
// function loadRemainingHierarchy(
//   pco: PointCloudOctreeGeometry,
//   data: any,
//   nodes: Record<number, PointCloudOctreeGeometryNode>,
// ): void {
//   for (let i = 1; i < data.nodes.length; i++) {
//     const code = data.nodes[i];
//     const { index, parentName, level } = parseName(name);
//     const parentNode = nodes[parentName];
//     const boundingBox = createChildAABB(parentNode.boundingBox, index);
//     const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
//     node.level = level;
//     node.numPoints = numPoints;
//     node.spacing = pco.spacing / Math.pow(2, node.level);
//     nodes[name] = node;
//     parentNode.addChild(node);
//   }
// }
// function parseName(name: string): { index: number; parentName: string; level: number } {
//   return {
//     index: getIndexFromName(name),
//     parentName: name.substring(0, name.length - 2),
//     level: (name.length + 1) / 2,
//   };
// }


/***/ }),

/***/ "./src/loading/types.ts":
/*!******************************!*\
  !*** ./src/loading/types.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/loading/ybf-loader.ts":
/*!***********************************!*\
  !*** ./src/loading/ybf-loader.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "YBFLoader": () => (/* binding */ YBFLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _workers_ybf_loader_worker_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../workers/ybf-loader.worker.js */ "./src/workers/ybf-loader.worker.js");
// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------

// @ts-ignore

class YBFLoader {
    constructor({ url, getUrl = s => Promise.resolve(s), }) {
        this.disposed = false;
        //xhrRequest: XhrRequest;
        this.workers = [];
        this.getUrl = getUrl;
        console.log('ybf-loader constructor:', url);
        this.url = url;
        this.callbacks = [];
    }
    dispose() {
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.disposed = true;
    }
    load(node) {
        if (node.loaded || this.disposed) {
            return Promise.resolve();
        }
        return Promise.resolve(this.getUrl(node.name, node.indexInList))
            .then(url => {
            // console.log('fetching:', url);
            return fetch(url, { mode: 'cors' });
        })
            .then(res => res.arrayBuffer())
            .then(buffer => {
            return new Promise(resolve => this.parse(node, buffer, resolve));
        });
    }
    parse(node, buffer, resolve) {
        if (this.disposed) {
            resolve();
            return;
        }
        const worker = this.getWorker();
        const pointAttributes = node.pcoGeometry.pointAttributes;
        // const numPoints = buffer.byteLength / pointAttributes.byteSize;
        worker.onmessage = (e) => {
            if (this.disposed) {
                resolve();
                return;
            }
            const data = e.data;
            if (data.failed) {
                node.failed = true;
                this.releaseWorker(worker);
                this.callbacks.forEach(callback => callback(node));
                resolve();
                return;
            }
            const geometry = (node.geometry = node.geometry || new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry());
            geometry.boundingBox = node.boundingBox;
            this.addBufferAttributes(geometry, data.attributeBuffers);
            this.addIndices(geometry, data.indices);
            // this.addNormalAttribute(geometry, numPoints);
            node.mean = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromArray([0, 0, 0]);
            geometry.computeBoundingBox();
            // console.log(geometry.boundingBox);
            node.tightBoundingBox = geometry.boundingBox;
            node.loaded = true;
            node.loading = false;
            node.failed = false;
            node.pcoGeometry.numNodesLoading--;
            node.pcoGeometry.needsUpdate = true;
            this.releaseWorker(worker);
            this.callbacks.forEach(callback => callback(node));
            resolve();
        };
        const message = {
            buffer,
            pointAttributes,
            min: node.boundingBox.min.toArray(),
            offset: node.pcoGeometry.offset.toArray(),
            spacing: node.spacing,
            hasChildren: node.hasChildren,
        };
        worker.postMessage(message, [message.buffer]);
    }
    getWorker() {
        const worker = this.workers.pop();
        if (worker) {
            return worker;
        }
        return new _workers_ybf_loader_worker_js__WEBPACK_IMPORTED_MODULE_1__["default"]();
    }
    releaseWorker(worker) {
        this.workers.push(worker);
    }
    addBufferAttributes(geometry, buffers) {
        Object.keys(buffers).forEach(property => {
            const buffer = buffers[property].buffer;
            if (property === 'position') {
                geometry.setAttribute('position', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(buffer), 3));
            }
            else if (property === 'color') {
                geometry.setAttribute('color', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Uint8Array(buffer), 3, true));
            }
        });
    }
    addIndices(geometry, indices) {
        const indicesAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.Uint8BufferAttribute(indices, 4);
        indicesAttribute.normalized = true;
        geometry.setAttribute('indices', indicesAttribute);
    }
}


/***/ }),

/***/ "./src/materials/blur-material.ts":
/*!****************************************!*\
  !*** ./src/materials/blur-material.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BlurMaterial": () => (/* binding */ BlurMaterial)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

class BlurMaterial extends three__WEBPACK_IMPORTED_MODULE_0__.ShaderMaterial {
    constructor() {
        super(...arguments);
        this.vertexShader = __webpack_require__(/*! ./shaders/blur.vert */ "./src/materials/shaders/blur.vert");
        this.fragmentShader = __webpack_require__(/*! ./shaders/blur.frag */ "./src/materials/shaders/blur.frag");
        this.uniforms = {
            screenWidth: { type: 'f', value: 0 },
            screenHeight: { type: 'f', value: 0 },
            map: { type: 't', value: null },
        };
    }
}


/***/ }),

/***/ "./src/materials/classification.ts":
/*!*****************************************!*\
  !*** ./src/materials/classification.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_CLASSIFICATION": () => (/* binding */ DEFAULT_CLASSIFICATION)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const DEFAULT_CLASSIFICATION = {
    0: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.5, 0.5, 0.5, 1.0),
    1: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.5, 0.5, 0.5, 1.0),
    2: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.63, 0.32, 0.18, 1.0),
    3: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.0, 1.0, 0.0, 1.0),
    4: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.0, 0.8, 0.0, 1.0),
    5: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.0, 0.6, 0.0, 1.0),
    6: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(1.0, 0.66, 0.0, 1.0),
    7: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(1.0, 0, 1.0, 1.0),
    8: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(1.0, 0, 0.0, 1.0),
    9: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.0, 0.0, 1.0, 1.0),
    12: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(1.0, 1.0, 0.0, 1.0),
    DEFAULT: new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(0.3, 0.6, 0.6, 0.5),
};


/***/ }),

/***/ "./src/materials/clipping.ts":
/*!***********************************!*\
  !*** ./src/materials/clipping.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClipMode": () => (/* binding */ ClipMode)
/* harmony export */ });
var ClipMode;
(function (ClipMode) {
    ClipMode[ClipMode["DISABLED"] = 0] = "DISABLED";
    ClipMode[ClipMode["CLIP_OUTSIDE"] = 1] = "CLIP_OUTSIDE";
    ClipMode[ClipMode["HIGHLIGHT_INSIDE"] = 2] = "HIGHLIGHT_INSIDE";
})(ClipMode || (ClipMode = {}));


/***/ }),

/***/ "./src/materials/enums.ts":
/*!********************************!*\
  !*** ./src/materials/enums.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointSizeType": () => (/* binding */ PointSizeType),
/* harmony export */   "PointShape": () => (/* binding */ PointShape),
/* harmony export */   "TreeType": () => (/* binding */ TreeType),
/* harmony export */   "PointOpacityType": () => (/* binding */ PointOpacityType),
/* harmony export */   "PointColorType": () => (/* binding */ PointColorType)
/* harmony export */ });
var PointSizeType;
(function (PointSizeType) {
    PointSizeType[PointSizeType["FIXED"] = 0] = "FIXED";
    PointSizeType[PointSizeType["ATTENUATED"] = 1] = "ATTENUATED";
    PointSizeType[PointSizeType["ADAPTIVE"] = 2] = "ADAPTIVE";
})(PointSizeType || (PointSizeType = {}));
var PointShape;
(function (PointShape) {
    PointShape[PointShape["SQUARE"] = 0] = "SQUARE";
    PointShape[PointShape["CIRCLE"] = 1] = "CIRCLE";
    PointShape[PointShape["PARABOLOID"] = 2] = "PARABOLOID";
})(PointShape || (PointShape = {}));
var TreeType;
(function (TreeType) {
    TreeType[TreeType["OCTREE"] = 0] = "OCTREE";
    TreeType[TreeType["KDTREE"] = 1] = "KDTREE";
})(TreeType || (TreeType = {}));
var PointOpacityType;
(function (PointOpacityType) {
    PointOpacityType[PointOpacityType["FIXED"] = 0] = "FIXED";
    PointOpacityType[PointOpacityType["ATTENUATED"] = 1] = "ATTENUATED";
})(PointOpacityType || (PointOpacityType = {}));
var PointColorType;
(function (PointColorType) {
    PointColorType[PointColorType["RGB"] = 0] = "RGB";
    PointColorType[PointColorType["COLOR"] = 1] = "COLOR";
    PointColorType[PointColorType["DEPTH"] = 2] = "DEPTH";
    PointColorType[PointColorType["HEIGHT"] = 3] = "HEIGHT";
    PointColorType[PointColorType["ELEVATION"] = 3] = "ELEVATION";
    PointColorType[PointColorType["INTENSITY"] = 4] = "INTENSITY";
    PointColorType[PointColorType["INTENSITY_GRADIENT"] = 5] = "INTENSITY_GRADIENT";
    PointColorType[PointColorType["LOD"] = 6] = "LOD";
    PointColorType[PointColorType["LEVEL_OF_DETAIL"] = 6] = "LEVEL_OF_DETAIL";
    PointColorType[PointColorType["POINT_INDEX"] = 7] = "POINT_INDEX";
    PointColorType[PointColorType["CLASSIFICATION"] = 8] = "CLASSIFICATION";
    PointColorType[PointColorType["RETURN_NUMBER"] = 9] = "RETURN_NUMBER";
    PointColorType[PointColorType["SOURCE"] = 10] = "SOURCE";
    PointColorType[PointColorType["NORMAL"] = 11] = "NORMAL";
    PointColorType[PointColorType["PHONG"] = 12] = "PHONG";
    PointColorType[PointColorType["RGB_HEIGHT"] = 13] = "RGB_HEIGHT";
    PointColorType[PointColorType["COMPOSITE"] = 50] = "COMPOSITE";
})(PointColorType || (PointColorType = {}));


/***/ }),

/***/ "./src/materials/gradients/grayscale.ts":
/*!**********************************************!*\
  !*** ./src/materials/gradients/grayscale.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GRAYSCALE": () => (/* binding */ GRAYSCALE)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const GRAYSCALE = [
    [0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0, 0, 0)],
    [1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(1, 1, 1)],
];


/***/ }),

/***/ "./src/materials/gradients/index.ts":
/*!******************************************!*\
  !*** ./src/materials/gradients/index.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GRAYSCALE": () => (/* reexport safe */ _grayscale__WEBPACK_IMPORTED_MODULE_0__.GRAYSCALE),
/* harmony export */   "INFERNO": () => (/* reexport safe */ _inferno__WEBPACK_IMPORTED_MODULE_1__.INFERNO),
/* harmony export */   "PLASMA": () => (/* reexport safe */ _plasma__WEBPACK_IMPORTED_MODULE_2__.PLASMA),
/* harmony export */   "RAINBOW": () => (/* reexport safe */ _rainbow__WEBPACK_IMPORTED_MODULE_3__.RAINBOW),
/* harmony export */   "SPECTRAL": () => (/* reexport safe */ _spectral__WEBPACK_IMPORTED_MODULE_4__.SPECTRAL),
/* harmony export */   "VIRIDIS": () => (/* reexport safe */ _vidris__WEBPACK_IMPORTED_MODULE_5__.VIRIDIS),
/* harmony export */   "YELLOW_GREEN": () => (/* reexport safe */ _yellow_green__WEBPACK_IMPORTED_MODULE_6__.YELLOW_GREEN)
/* harmony export */ });
/* harmony import */ var _grayscale__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./grayscale */ "./src/materials/gradients/grayscale.ts");
/* harmony import */ var _inferno__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./inferno */ "./src/materials/gradients/inferno.ts");
/* harmony import */ var _plasma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./plasma */ "./src/materials/gradients/plasma.ts");
/* harmony import */ var _rainbow__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./rainbow */ "./src/materials/gradients/rainbow.ts");
/* harmony import */ var _spectral__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./spectral */ "./src/materials/gradients/spectral.ts");
/* harmony import */ var _vidris__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vidris */ "./src/materials/gradients/vidris.ts");
/* harmony import */ var _yellow_green__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./yellow-green */ "./src/materials/gradients/yellow-green.ts");









/***/ }),

/***/ "./src/materials/gradients/inferno.ts":
/*!********************************************!*\
  !*** ./src/materials/gradients/inferno.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "INFERNO": () => (/* binding */ INFERNO)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const INFERNO = [
    [0.0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.077, 0.042, 0.206)],
    [0.1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.225, 0.036, 0.388)],
    [0.2, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.373, 0.074, 0.432)],
    [0.3, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.522, 0.128, 0.42)],
    [0.4, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.665, 0.182, 0.37)],
    [0.5, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.797, 0.255, 0.287)],
    [0.6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.902, 0.364, 0.184)],
    [0.7, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.969, 0.516, 0.063)],
    [0.8, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.988, 0.683, 0.072)],
    [0.9, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.961, 0.859, 0.298)],
    [1.0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.988, 0.998, 0.645)],
];


/***/ }),

/***/ "./src/materials/gradients/plasma.ts":
/*!*******************************************!*\
  !*** ./src/materials/gradients/plasma.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PLASMA": () => (/* binding */ PLASMA)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const PLASMA = [
    [0.0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.241, 0.015, 0.61)],
    [0.1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.387, 0.001, 0.654)],
    [0.2, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.524, 0.025, 0.653)],
    [0.3, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.651, 0.125, 0.596)],
    [0.4, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.752, 0.227, 0.513)],
    [0.5, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.837, 0.329, 0.431)],
    [0.6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.907, 0.435, 0.353)],
    [0.7, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.963, 0.554, 0.272)],
    [0.8, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.992, 0.681, 0.195)],
    [0.9, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.987, 0.822, 0.144)],
    [1.0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.94, 0.975, 0.131)],
];


/***/ }),

/***/ "./src/materials/gradients/rainbow.ts":
/*!********************************************!*\
  !*** ./src/materials/gradients/rainbow.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RAINBOW": () => (/* binding */ RAINBOW)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const RAINBOW = [
    [0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.278, 0, 0.714)],
    [1 / 6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0, 0, 1)],
    [2 / 6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0, 1, 1)],
    [3 / 6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0, 1, 0)],
    [4 / 6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(1, 1, 0)],
    [5 / 6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(1, 0.64, 0)],
    [1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(1, 0, 0)],
];


/***/ }),

/***/ "./src/materials/gradients/spectral.ts":
/*!*********************************************!*\
  !*** ./src/materials/gradients/spectral.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SPECTRAL": () => (/* binding */ SPECTRAL)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

// From chroma spectral http://gka.github.io/chroma.js/
const SPECTRAL = [
    [0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.3686, 0.3098, 0.6353)],
    [0.1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.1961, 0.5333, 0.7412)],
    [0.2, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.4, 0.7608, 0.6471)],
    [0.3, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.6706, 0.8667, 0.6431)],
    [0.4, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.902, 0.9608, 0.5961)],
    [0.5, new three__WEBPACK_IMPORTED_MODULE_0__.Color(1.0, 1.0, 0.749)],
    [0.6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.9961, 0.8784, 0.5451)],
    [0.7, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.9922, 0.6824, 0.3804)],
    [0.8, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.9569, 0.4275, 0.2627)],
    [0.9, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.8353, 0.2431, 0.3098)],
    [1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.6196, 0.0039, 0.2588)],
];


/***/ }),

/***/ "./src/materials/gradients/vidris.ts":
/*!*******************************************!*\
  !*** ./src/materials/gradients/vidris.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VIRIDIS": () => (/* binding */ VIRIDIS)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const VIRIDIS = [
    [0.0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.267, 0.005, 0.329)],
    [0.1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.283, 0.141, 0.458)],
    [0.2, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.254, 0.265, 0.53)],
    [0.3, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.207, 0.372, 0.553)],
    [0.4, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.164, 0.471, 0.558)],
    [0.5, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.128, 0.567, 0.551)],
    [0.6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.135, 0.659, 0.518)],
    [0.7, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.267, 0.749, 0.441)],
    [0.8, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.478, 0.821, 0.318)],
    [0.9, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.741, 0.873, 0.15)],
    [1.0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.993, 0.906, 0.144)],
];


/***/ }),

/***/ "./src/materials/gradients/yellow-green.ts":
/*!*************************************************!*\
  !*** ./src/materials/gradients/yellow-green.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "YELLOW_GREEN": () => (/* binding */ YELLOW_GREEN)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

const YELLOW_GREEN = [
    [0, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.1647, 0.2824, 0.3451)],
    [0.1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.1338, 0.3555, 0.4227)],
    [0.2, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.061, 0.4319, 0.4864)],
    [0.3, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.0, 0.5099, 0.5319)],
    [0.4, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.0, 0.5881, 0.5569)],
    [0.5, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.137, 0.665, 0.5614)],
    [0.6, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.2906, 0.7395, 0.5477)],
    [0.7, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.4453, 0.8099, 0.5201)],
    [0.8, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.6102, 0.8748, 0.485)],
    [0.9, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.7883, 0.9323, 0.4514)],
    [1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0.9804, 0.9804, 0.4314)],
];


/***/ }),

/***/ "./src/materials/index.ts":
/*!********************************!*\
  !*** ./src/materials/index.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BlurMaterial": () => (/* reexport safe */ _blur_material__WEBPACK_IMPORTED_MODULE_0__.BlurMaterial),
/* harmony export */   "ClipMode": () => (/* reexport safe */ _clipping__WEBPACK_IMPORTED_MODULE_1__.ClipMode),
/* harmony export */   "PointColorType": () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_2__.PointColorType),
/* harmony export */   "PointOpacityType": () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_2__.PointOpacityType),
/* harmony export */   "PointShape": () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_2__.PointShape),
/* harmony export */   "PointSizeType": () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_2__.PointSizeType),
/* harmony export */   "TreeType": () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_2__.TreeType),
/* harmony export */   "PointCloudMaterial": () => (/* reexport safe */ _point_cloud_material__WEBPACK_IMPORTED_MODULE_3__.PointCloudMaterial),
/* harmony export */   "generateClassificationTexture": () => (/* reexport safe */ _texture_generation__WEBPACK_IMPORTED_MODULE_4__.generateClassificationTexture),
/* harmony export */   "generateDataTexture": () => (/* reexport safe */ _texture_generation__WEBPACK_IMPORTED_MODULE_4__.generateDataTexture),
/* harmony export */   "generateGradientTexture": () => (/* reexport safe */ _texture_generation__WEBPACK_IMPORTED_MODULE_4__.generateGradientTexture),
/* harmony export */   "GRAYSCALE": () => (/* reexport safe */ _gradients__WEBPACK_IMPORTED_MODULE_6__.GRAYSCALE),
/* harmony export */   "INFERNO": () => (/* reexport safe */ _gradients__WEBPACK_IMPORTED_MODULE_6__.INFERNO),
/* harmony export */   "PLASMA": () => (/* reexport safe */ _gradients__WEBPACK_IMPORTED_MODULE_6__.PLASMA),
/* harmony export */   "RAINBOW": () => (/* reexport safe */ _gradients__WEBPACK_IMPORTED_MODULE_6__.RAINBOW),
/* harmony export */   "SPECTRAL": () => (/* reexport safe */ _gradients__WEBPACK_IMPORTED_MODULE_6__.SPECTRAL),
/* harmony export */   "VIRIDIS": () => (/* reexport safe */ _gradients__WEBPACK_IMPORTED_MODULE_6__.VIRIDIS),
/* harmony export */   "YELLOW_GREEN": () => (/* reexport safe */ _gradients__WEBPACK_IMPORTED_MODULE_6__.YELLOW_GREEN)
/* harmony export */ });
/* harmony import */ var _blur_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./blur-material */ "./src/materials/blur-material.ts");
/* harmony import */ var _clipping__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./clipping */ "./src/materials/clipping.ts");
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./enums */ "./src/materials/enums.ts");
/* harmony import */ var _point_cloud_material__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./point-cloud-material */ "./src/materials/point-cloud-material.ts");
/* harmony import */ var _texture_generation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./texture-generation */ "./src/materials/texture-generation.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./types */ "./src/materials/types.ts");
/* harmony import */ var _gradients__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gradients */ "./src/materials/gradients/index.ts");









/***/ }),

/***/ "./src/materials/point-cloud-material.ts":
/*!***********************************************!*\
  !*** ./src/materials/point-cloud-material.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointCloudMaterial": () => (/* binding */ PointCloudMaterial)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils */ "./src/utils/utils.ts");
/* harmony import */ var _classification__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./classification */ "./src/materials/classification.ts");
/* harmony import */ var _clipping__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./clipping */ "./src/materials/clipping.ts");
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./enums */ "./src/materials/enums.ts");
/* harmony import */ var _gradients__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gradients */ "./src/materials/gradients/index.ts");
/* harmony import */ var _texture_generation__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./texture-generation */ "./src/materials/texture-generation.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};








const TREE_TYPE_DEFS = {
    [_enums__WEBPACK_IMPORTED_MODULE_5__.TreeType.OCTREE]: 'tree_type_octree',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.TreeType.KDTREE]: 'tree_type_kdtree',
};
const SIZE_TYPE_DEFS = {
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointSizeType.FIXED]: 'fixed_point_size',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointSizeType.ATTENUATED]: 'attenuated_point_size',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointSizeType.ADAPTIVE]: 'adaptive_point_size',
};
const OPACITY_DEFS = {
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointOpacityType.ATTENUATED]: 'attenuated_opacity',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointOpacityType.FIXED]: 'fixed_opacity',
};
const SHAPE_DEFS = {
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointShape.SQUARE]: 'square_point_shape',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointShape.CIRCLE]: 'circle_point_shape',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointShape.PARABOLOID]: 'paraboloid_point_shape',
};
const COLOR_DEFS = {
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.RGB]: 'color_type_rgb',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.COLOR]: 'color_type_color',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.DEPTH]: 'color_type_depth',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.HEIGHT]: 'color_type_height',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.INTENSITY]: 'color_type_intensity',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.INTENSITY_GRADIENT]: 'color_type_intensity_gradient',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.LOD]: 'color_type_lod',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.POINT_INDEX]: 'color_type_point_index',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.CLASSIFICATION]: 'color_type_classification',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.RETURN_NUMBER]: 'color_type_return_number',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.SOURCE]: 'color_type_source',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.NORMAL]: 'color_type_normal',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.PHONG]: 'color_type_phong',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.RGB_HEIGHT]: 'color_type_rgb_height',
    [_enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.COMPOSITE]: 'color_type_composite',
};
const CLIP_MODE_DEFS = {
    [_clipping__WEBPACK_IMPORTED_MODULE_4__.ClipMode.DISABLED]: 'clip_disabled',
    [_clipping__WEBPACK_IMPORTED_MODULE_4__.ClipMode.CLIP_OUTSIDE]: 'clip_outside',
    [_clipping__WEBPACK_IMPORTED_MODULE_4__.ClipMode.HIGHLIGHT_INSIDE]: 'clip_highlight_inside',
};
class PointCloudMaterial extends three__WEBPACK_IMPORTED_MODULE_0__.RawShaderMaterial {
    constructor(parameters = {}) {
        super();
        this.lights = false;
        this.fog = false;
        this.numClipBoxes = 0;
        this.clipBoxes = [];
        this.visibleNodeTextureOffsets = new Map();
        this._gradient = _gradients__WEBPACK_IMPORTED_MODULE_6__.SPECTRAL;
        this.gradientTexture = (0,_texture_generation__WEBPACK_IMPORTED_MODULE_7__.generateGradientTexture)(this._gradient);
        this._classification = _classification__WEBPACK_IMPORTED_MODULE_3__.DEFAULT_CLASSIFICATION;
        this.classificationTexture = (0,_texture_generation__WEBPACK_IMPORTED_MODULE_7__.generateClassificationTexture)(this._classification);
        this.defines = {
            NUM_CLIP_PLANES: 0
        };
        this.uniforms = {
            bbSize: makeUniform('fv', [0, 0, 0]),
            blendDepthSupplement: makeUniform('f', 0.0),
            blendHardness: makeUniform('f', 2.0),
            classificationLUT: makeUniform('t', this.classificationTexture || new three__WEBPACK_IMPORTED_MODULE_0__.Texture()),
            clipBoxCount: makeUniform('f', 0),
            clipBoxes: makeUniform('Matrix4fv', []),
            clipping: makeUniform('b', true),
            numClippingPlanes: makeUniform('f', 0),
            clippingPlanes: makeUniform('fv', []),
            depthMap: makeUniform('t', null),
            diffuse: makeUniform('fv', [1, 1, 1]),
            fov: makeUniform('f', 1.0),
            gradient: makeUniform('t', this.gradientTexture || new three__WEBPACK_IMPORTED_MODULE_0__.Texture()),
            heightMax: makeUniform('f', 1.0),
            heightMin: makeUniform('f', 0.0),
            intensityBrightness: makeUniform('f', 0),
            intensityContrast: makeUniform('f', 0),
            intensityGamma: makeUniform('f', 1),
            intensityRange: makeUniform('fv', [0, 65000]),
            isLeafNode: makeUniform('b', 0),
            level: makeUniform('f', 0.0),
            maxSize: makeUniform('f', _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_MAX_POINT_SIZE),
            minSize: makeUniform('f', _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_MIN_POINT_SIZE),
            octreeSize: makeUniform('f', 0),
            opacity: makeUniform('f', 1.0),
            pcIndex: makeUniform('f', 0),
            rgbBrightness: makeUniform('f', _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_RGB_BRIGHTNESS),
            rgbContrast: makeUniform('f', _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_RGB_CONTRAST),
            rgbGamma: makeUniform('f', _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_RGB_GAMMA),
            screenHeight: makeUniform('f', 1.0),
            screenWidth: makeUniform('f', 1.0),
            size: makeUniform('f', 1),
            spacing: makeUniform('f', 1.0),
            toModel: makeUniform('Matrix4f', []),
            transition: makeUniform('f', 0.5),
            uColor: makeUniform('c', new three__WEBPACK_IMPORTED_MODULE_0__.Color(0xffffff)),
            // @ts-ignore
            visibleNodes: makeUniform('t', this.visibleNodesTexture || new three__WEBPACK_IMPORTED_MODULE_0__.Texture()),
            vnStart: makeUniform('f', 0.0),
            wClassification: makeUniform('f', 0),
            wElevation: makeUniform('f', 0),
            wIntensity: makeUniform('f', 0),
            wReturnNumber: makeUniform('f', 0),
            wRGB: makeUniform('f', 1),
            wSourceID: makeUniform('f', 0),
            opacityAttenuation: makeUniform('f', 1),
            filterByNormalThreshold: makeUniform('f', 0),
            highlightedPointCoordinate: makeUniform('fv', new three__WEBPACK_IMPORTED_MODULE_0__.Vector3()),
            highlightedPointColor: makeUniform('fv', _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_HIGHLIGHT_COLOR.clone()),
            enablePointHighlighting: makeUniform('b', true),
            highlightedPointScale: makeUniform('f', 2.0),
        };
        this.useClipBox = false;
        this.weighted = false;
        this.pointColorType = _enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.RGB;
        this.pointSizeType = _enums__WEBPACK_IMPORTED_MODULE_5__.PointSizeType.ADAPTIVE;
        this.clipMode = _clipping__WEBPACK_IMPORTED_MODULE_4__.ClipMode.DISABLED;
        this.useEDL = false;
        this.shape = _enums__WEBPACK_IMPORTED_MODULE_5__.PointShape.SQUARE;
        this.treeType = _enums__WEBPACK_IMPORTED_MODULE_5__.TreeType.OCTREE;
        this.pointOpacityType = _enums__WEBPACK_IMPORTED_MODULE_5__.PointOpacityType.FIXED;
        this.useFilterByNormal = false;
        this.highlightPoint = false;
        this.attributes = {
            position: { type: 'fv', value: [] },
            color: { type: 'fv', value: [] },
            normal: { type: 'fv', value: [] },
            intensity: { type: 'f', value: [] },
            classification: { type: 'f', value: [] },
            returnNumber: { type: 'f', value: [] },
            numberOfReturns: { type: 'f', value: [] },
            pointSourceID: { type: 'f', value: [] },
            indices: { type: 'fv', value: [] },
        };
        this.setValues({
            defines: this.defines,
            glslVersion: three__WEBPACK_IMPORTED_MODULE_0__.GLSL3
        });
        const tex = (this.visibleNodesTexture = (0,_texture_generation__WEBPACK_IMPORTED_MODULE_7__.generateDataTexture)(2048, 1, new three__WEBPACK_IMPORTED_MODULE_0__.Color(0xffffff)));
        tex.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.NearestFilter;
        tex.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.NearestFilter;
        this.setUniform('visibleNodes', tex);
        this.treeType = getValid(parameters.treeType, _enums__WEBPACK_IMPORTED_MODULE_5__.TreeType.OCTREE);
        this.size = getValid(parameters.size, 1.0);
        this.minSize = getValid(parameters.minSize, 2.0);
        this.maxSize = getValid(parameters.maxSize, 50.0);
        this.classification = _classification__WEBPACK_IMPORTED_MODULE_3__.DEFAULT_CLASSIFICATION;
        this.defaultAttributeValues.normal = [0, 0, 0];
        this.defaultAttributeValues.classification = [0, 0, 0];
        this.defaultAttributeValues.indices = [0, 0, 0, 0];
        this.vertexColors = true;
        this.updateShaderSource();
    }
    dispose() {
        super.dispose();
        if (this.gradientTexture) {
            this.gradientTexture.dispose();
            this.gradientTexture = undefined;
        }
        if (this.visibleNodesTexture) {
            this.visibleNodesTexture.dispose();
            this.visibleNodesTexture = undefined;
        }
        this.clearVisibleNodeTextureOffsets();
        if (this.classificationTexture) {
            this.classificationTexture.dispose();
            this.classificationTexture = undefined;
        }
        if (this.depthMap) {
            this.depthMap.dispose();
            this.depthMap = undefined;
        }
    }
    clearVisibleNodeTextureOffsets() {
        this.visibleNodeTextureOffsets.clear();
    }
    updateShaderSource() {
        this.vertexShader = this.applyDefines((__webpack_require__(/*! ./shaders/pointcloud.vert */ "./src/materials/shaders/pointcloud.vert")["default"]));
        this.fragmentShader = this.applyDefines((__webpack_require__(/*! ./shaders/pointcloud.frag */ "./src/materials/shaders/pointcloud.frag")["default"]));
        if (this.opacity === 1.0) {
            this.blending = three__WEBPACK_IMPORTED_MODULE_0__.NoBlending;
            this.transparent = false;
            this.depthTest = true;
            this.depthWrite = true;
            this.depthFunc = three__WEBPACK_IMPORTED_MODULE_0__.LessEqualDepth;
        }
        else if (this.opacity < 1.0 && !this.useEDL) {
            this.blending = three__WEBPACK_IMPORTED_MODULE_0__.AdditiveBlending;
            this.transparent = true;
            this.depthTest = false;
            this.depthWrite = true;
        }
        if (this.weighted) {
            this.blending = three__WEBPACK_IMPORTED_MODULE_0__.AdditiveBlending;
            this.transparent = true;
            this.depthTest = true;
            this.depthWrite = false;
            this.depthFunc = three__WEBPACK_IMPORTED_MODULE_0__.LessEqualDepth;
        }
        this.needsUpdate = true;
    }
    applyDefines(shaderSrc) {
        const parts = [];
        function define(value) {
            if (value) {
                parts.push(`#define ${value}`);
            }
        }
        define(TREE_TYPE_DEFS[this.treeType]);
        define(SIZE_TYPE_DEFS[this.pointSizeType]);
        define(SHAPE_DEFS[this.shape]);
        define(COLOR_DEFS[this.pointColorType]);
        define(CLIP_MODE_DEFS[this.clipMode]);
        define(OPACITY_DEFS[this.pointOpacityType]);
        // We only perform gamma and brightness/contrast calculations per point if values are specified.
        if (this.rgbGamma !== _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_RGB_GAMMA ||
            this.rgbBrightness !== _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_RGB_BRIGHTNESS ||
            this.rgbContrast !== _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_RGB_CONTRAST) {
            define('use_rgb_gamma_contrast_brightness');
        }
        if (this.useFilterByNormal) {
            define('use_filter_by_normal');
        }
        if (this.useEDL) {
            define('use_edl');
        }
        if (this.weighted) {
            define('weighted_splats');
        }
        if (this.numClipBoxes > 0) {
            define('use_clip_box');
        }
        if (this.highlightPoint) {
            define('highlight_point');
        }
        define('MAX_POINT_LIGHTS 0');
        define('MAX_DIR_LIGHTS 0');
        parts.push(shaderSrc);
        return parts.join('\n');
    }
    setClipBoxes(clipBoxes) {
        if (!clipBoxes) {
            return;
        }
        this.clipBoxes = clipBoxes;
        const doUpdate = this.numClipBoxes !== clipBoxes.length && (clipBoxes.length === 0 || this.numClipBoxes === 0);
        this.numClipBoxes = clipBoxes.length;
        this.setUniform('clipBoxCount', this.numClipBoxes);
        if (doUpdate) {
            this.updateShaderSource();
        }
        const clipBoxesLength = this.numClipBoxes * 16;
        const clipBoxesArray = new Float32Array(clipBoxesLength);
        for (let i = 0; i < this.numClipBoxes; i++) {
            clipBoxesArray.set(clipBoxes[i].inverse.elements, 16 * i);
        }
        for (let i = 0; i < clipBoxesLength; i++) {
            if (isNaN(clipBoxesArray[i])) {
                clipBoxesArray[i] = Infinity;
            }
        }
        this.setUniform('clipBoxes', clipBoxesArray);
    }
    get gradient() {
        return this._gradient;
    }
    set gradient(value) {
        if (this._gradient !== value) {
            this._gradient = value;
            this.gradientTexture = (0,_texture_generation__WEBPACK_IMPORTED_MODULE_7__.generateGradientTexture)(this._gradient);
            this.setUniform('gradient', this.gradientTexture);
        }
    }
    get classification() {
        return this._classification;
    }
    set classification(value) {
        const copy = {};
        for (const key of Object.keys(value)) {
            copy[key] = value[key].clone();
        }
        let isEqual = false;
        if (this._classification === undefined) {
            isEqual = false;
        }
        else {
            isEqual = Object.keys(copy).length === Object.keys(this._classification).length;
            for (const key of Object.keys(copy)) {
                isEqual = isEqual && this._classification[key] !== undefined;
                isEqual = isEqual && copy[key].equals(this._classification[key]);
            }
        }
        if (!isEqual) {
            this._classification = copy;
            this.recomputeClassification();
        }
    }
    recomputeClassification() {
        this.classificationTexture = (0,_texture_generation__WEBPACK_IMPORTED_MODULE_7__.generateClassificationTexture)(this._classification);
        this.setUniform('classificationLUT', this.classificationTexture);
    }
    get elevationRange() {
        return [this.heightMin, this.heightMax];
    }
    set elevationRange(value) {
        this.heightMin = value[0];
        this.heightMax = value[1];
    }
    getUniform(name) {
        return this.uniforms === undefined ? undefined : this.uniforms[name].value;
    }
    setUniform(name, value) {
        if (this.uniforms === undefined) {
            return;
        }
        const uObj = this.uniforms[name];
        if (uObj.type === 'c') {
            uObj.value.copy(value);
        }
        else if (value !== uObj.value) {
            uObj.value = value;
        }
    }
    updateMaterial(octree, visibleNodes, camera, renderer) {
        const pixelRatio = renderer.getPixelRatio();
        if (camera.type === _constants__WEBPACK_IMPORTED_MODULE_1__.PERSPECTIVE_CAMERA) {
            this.fov = camera.fov * (Math.PI / 180);
        }
        else {
            this.fov = Math.PI / 2; // will result in slope = 1 in the shader
        }
        const renderTarget = renderer.getRenderTarget();
        if (renderTarget !== null && renderTarget instanceof three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderTarget) {
            this.screenWidth = renderTarget.width;
            this.screenHeight = renderTarget.height;
        }
        else {
            this.screenWidth = renderer.domElement.clientWidth * pixelRatio;
            this.screenHeight = renderer.domElement.clientHeight * pixelRatio;
        }
        const maxScale = Math.max(octree.scale.x, octree.scale.y, octree.scale.z);
        this.spacing = octree.pcoGeometry.spacing * maxScale;
        this.octreeSize = octree.pcoGeometry.boundingBox.getSize(PointCloudMaterial.helperVec3).x;
        if (this.pointSizeType === _enums__WEBPACK_IMPORTED_MODULE_5__.PointSizeType.ADAPTIVE ||
            this.pointColorType === _enums__WEBPACK_IMPORTED_MODULE_5__.PointColorType.LOD) {
            this.updateVisibilityTextureData(visibleNodes);
        }
    }
    updateVisibilityTextureData(nodes) {
        nodes.sort(_utils_utils__WEBPACK_IMPORTED_MODULE_2__.byLevelAndIndex);
        const data = new Uint8Array(nodes.length * 4);
        const offsetsToChild = new Array(nodes.length).fill(Infinity);
        this.visibleNodeTextureOffsets.clear();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            this.visibleNodeTextureOffsets.set(node.name, i);
            if (i > 0) {
                const parentName = node.name.slice(0, -1);
                const parentOffset = this.visibleNodeTextureOffsets.get(parentName);
                const parentOffsetToChild = i - parentOffset;
                offsetsToChild[parentOffset] = Math.min(offsetsToChild[parentOffset], parentOffsetToChild);
                // tslint:disable:no-bitwise
                const offset = parentOffset * 4;
                data[offset] = data[offset] | (1 << node.index);
                data[offset + 1] = offsetsToChild[parentOffset] >> 8;
                data[offset + 2] = offsetsToChild[parentOffset] % 256;
                // tslint:enable:no-bitwise
            }
            data[i * 4 + 3] = node.name.length;
        }
        const texture = this.visibleNodesTexture;
        if (texture) {
            texture.image.data.set(data);
            texture.needsUpdate = true;
        }
    }
    static makeOnBeforeRender(octree, node, pcIndex) {
        return (_renderer, _scene, _camera, _geometry, material) => {
            const pointCloudMaterial = material;
            const materialUniforms = pointCloudMaterial.uniforms;
            // Clip planes
            if (material.clippingPlanes && material.clippingPlanes.length > 0) {
                const planes = material.clippingPlanes;
                const flattenedPlanes = new Array(4 * material.clippingPlanes.length);
                for (let i = 0; i < planes.length; i++) {
                    flattenedPlanes[4 * i + 0] = planes[i].normal.x;
                    flattenedPlanes[4 * i + 1] = planes[i].normal.y;
                    flattenedPlanes[4 * i + 2] = planes[i].normal.z;
                    flattenedPlanes[4 * i + 3] = planes[i].constant;
                }
                materialUniforms.clippingPlanes.value = flattenedPlanes;
            }
            pointCloudMaterial.defines.NUM_CLIP_PLANES = material.clippingPlanes.length;
            materialUniforms.level.value = node.level;
            materialUniforms.isLeafNode.value = node.isLeafNode;
            const vnStart = pointCloudMaterial.visibleNodeTextureOffsets.get(node.name);
            if (vnStart !== undefined) {
                materialUniforms.vnStart.value = vnStart;
            }
            materialUniforms.pcIndex.value =
                pcIndex !== undefined ? pcIndex : octree.visibleNodes.indexOf(node);
            // Note: when changing uniforms in onBeforeRender, the flag uniformsNeedUpdate has to be
            // set to true to instruct ThreeJS to upload them. See also
            // https://github.com/mrdoob/three.js/issues/9870#issuecomment-368750182.
            // Remove the cast to any after updating to Three.JS >= r113
            material /*ShaderMaterial*/.uniformsNeedUpdate = true;
        };
    }
}
PointCloudMaterial.helperVec3 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
__decorate([
    uniform('bbSize')
], PointCloudMaterial.prototype, "bbSize", void 0);
__decorate([
    uniform('depthMap')
], PointCloudMaterial.prototype, "depthMap", void 0);
__decorate([
    uniform('fov')
], PointCloudMaterial.prototype, "fov", void 0);
__decorate([
    uniform('heightMax')
], PointCloudMaterial.prototype, "heightMax", void 0);
__decorate([
    uniform('heightMin')
], PointCloudMaterial.prototype, "heightMin", void 0);
__decorate([
    uniform('intensityBrightness')
], PointCloudMaterial.prototype, "intensityBrightness", void 0);
__decorate([
    uniform('intensityContrast')
], PointCloudMaterial.prototype, "intensityContrast", void 0);
__decorate([
    uniform('intensityGamma')
], PointCloudMaterial.prototype, "intensityGamma", void 0);
__decorate([
    uniform('intensityRange')
], PointCloudMaterial.prototype, "intensityRange", void 0);
__decorate([
    uniform('maxSize')
], PointCloudMaterial.prototype, "maxSize", void 0);
__decorate([
    uniform('minSize')
], PointCloudMaterial.prototype, "minSize", void 0);
__decorate([
    uniform('octreeSize')
], PointCloudMaterial.prototype, "octreeSize", void 0);
__decorate([
    uniform('opacity', true)
], PointCloudMaterial.prototype, "opacity", void 0);
__decorate([
    uniform('rgbBrightness', true)
], PointCloudMaterial.prototype, "rgbBrightness", void 0);
__decorate([
    uniform('rgbContrast', true)
], PointCloudMaterial.prototype, "rgbContrast", void 0);
__decorate([
    uniform('rgbGamma', true)
], PointCloudMaterial.prototype, "rgbGamma", void 0);
__decorate([
    uniform('screenHeight')
], PointCloudMaterial.prototype, "screenHeight", void 0);
__decorate([
    uniform('screenWidth')
], PointCloudMaterial.prototype, "screenWidth", void 0);
__decorate([
    uniform('size')
], PointCloudMaterial.prototype, "size", void 0);
__decorate([
    uniform('spacing')
], PointCloudMaterial.prototype, "spacing", void 0);
__decorate([
    uniform('transition')
], PointCloudMaterial.prototype, "transition", void 0);
__decorate([
    uniform('uColor')
], PointCloudMaterial.prototype, "color", void 0);
__decorate([
    uniform('wClassification')
], PointCloudMaterial.prototype, "weightClassification", void 0);
__decorate([
    uniform('wElevation')
], PointCloudMaterial.prototype, "weightElevation", void 0);
__decorate([
    uniform('wIntensity')
], PointCloudMaterial.prototype, "weightIntensity", void 0);
__decorate([
    uniform('wReturnNumber')
], PointCloudMaterial.prototype, "weightReturnNumber", void 0);
__decorate([
    uniform('wRGB')
], PointCloudMaterial.prototype, "weightRGB", void 0);
__decorate([
    uniform('wSourceID')
], PointCloudMaterial.prototype, "weightSourceID", void 0);
__decorate([
    uniform('opacityAttenuation')
], PointCloudMaterial.prototype, "opacityAttenuation", void 0);
__decorate([
    uniform('filterByNormalThreshold')
], PointCloudMaterial.prototype, "filterByNormalThreshold", void 0);
__decorate([
    uniform('highlightedPointCoordinate')
], PointCloudMaterial.prototype, "highlightedPointCoordinate", void 0);
__decorate([
    uniform('highlightedPointColor')
], PointCloudMaterial.prototype, "highlightedPointColor", void 0);
__decorate([
    uniform('enablePointHighlighting')
], PointCloudMaterial.prototype, "enablePointHighlighting", void 0);
__decorate([
    uniform('highlightedPointScale')
], PointCloudMaterial.prototype, "highlightedPointScale", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "useClipBox", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "weighted", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "pointColorType", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "pointSizeType", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "clipMode", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "useEDL", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "shape", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "treeType", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "pointOpacityType", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "useFilterByNormal", void 0);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "highlightPoint", void 0);
function makeUniform(type, value) {
    return { type, value };
}
function getValid(a, b) {
    return a === undefined ? b : a;
}
// tslint:disable:no-invalid-this
function uniform(uniformName, requireSrcUpdate = false) {
    return (target, propertyKey) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                return this.getUniform(uniformName);
            },
            set(value) {
                if (value !== this.getUniform(uniformName)) {
                    this.setUniform(uniformName, value);
                    if (requireSrcUpdate) {
                        this.updateShaderSource();
                    }
                }
            },
        });
    };
}
function requiresShaderUpdate() {
    return (target, propertyKey) => {
        const fieldName = `_${propertyKey.toString()}`;
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[fieldName];
            },
            set(value) {
                if (value !== this[fieldName]) {
                    this[fieldName] = value;
                    this.updateShaderSource();
                }
            },
        });
    };
}


/***/ }),

/***/ "./src/materials/texture-generation.ts":
/*!*********************************************!*\
  !*** ./src/materials/texture-generation.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "generateDataTexture": () => (/* binding */ generateDataTexture),
/* harmony export */   "generateGradientTexture": () => (/* binding */ generateGradientTexture),
/* harmony export */   "generateClassificationTexture": () => (/* binding */ generateClassificationTexture)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

function generateDataTexture(width, height, color) {
    const size = width * height;
    const data = new Uint8Array(4 * size);
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    for (let i = 0; i < size; i++) {
        data[i * 3] = r;
        data[i * 3 + 1] = g;
        data[i * 3 + 2] = b;
    }
    const texture = new three__WEBPACK_IMPORTED_MODULE_0__.DataTexture(data, width, height, three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat);
    texture.needsUpdate = true;
    texture.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.NearestFilter;
    return texture;
}
function generateGradientTexture(gradient) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    context.rect(0, 0, size, size);
    const ctxGradient = context.createLinearGradient(0, 0, size, size);
    for (let i = 0; i < gradient.length; i++) {
        const step = gradient[i];
        ctxGradient.addColorStop(step[0], `#${step[1].getHexString()}`);
    }
    context.fillStyle = ctxGradient;
    context.fill();
    const texture = new three__WEBPACK_IMPORTED_MODULE_0__.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter;
    // textureImage = texture.image;
    return texture;
}
function generateClassificationTexture(classification) {
    const width = 256;
    const height = 256;
    const size = width * height;
    const data = new Uint8Array(4 * size);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const i = x + width * y;
            let color;
            if (classification[x]) {
                color = classification[x];
            }
            else if (classification[x % 32]) {
                color = classification[x % 32];
            }
            else {
                color = classification.DEFAULT;
            }
            data[4 * i + 0] = 255 * color.x;
            data[4 * i + 1] = 255 * color.y;
            data[4 * i + 2] = 255 * color.z;
            data[4 * i + 3] = 255 * color.w;
        }
    }
    const texture = new three__WEBPACK_IMPORTED_MODULE_0__.DataTexture(data, width, height, three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat);
    texture.magFilter = three__WEBPACK_IMPORTED_MODULE_0__.NearestFilter;
    texture.needsUpdate = true;
    return texture;
}


/***/ }),

/***/ "./src/materials/types.ts":
/*!********************************!*\
  !*** ./src/materials/types.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/point-attributes.ts":
/*!*********************************!*\
  !*** ./src/point-attributes.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointAttributeName": () => (/* binding */ PointAttributeName),
/* harmony export */   "POINT_ATTRIBUTE_TYPES": () => (/* binding */ POINT_ATTRIBUTE_TYPES),
/* harmony export */   "POINT_ATTRIBUTES": () => (/* binding */ POINT_ATTRIBUTES),
/* harmony export */   "PointAttributes": () => (/* binding */ PointAttributes)
/* harmony export */ });
// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------
var PointAttributeName;
(function (PointAttributeName) {
    PointAttributeName[PointAttributeName["POSITION_CARTESIAN"] = 0] = "POSITION_CARTESIAN";
    PointAttributeName[PointAttributeName["COLOR_PACKED"] = 1] = "COLOR_PACKED";
    PointAttributeName[PointAttributeName["COLOR_FLOATS_1"] = 2] = "COLOR_FLOATS_1";
    PointAttributeName[PointAttributeName["COLOR_FLOATS_255"] = 3] = "COLOR_FLOATS_255";
    PointAttributeName[PointAttributeName["NORMAL_FLOATS"] = 4] = "NORMAL_FLOATS";
    PointAttributeName[PointAttributeName["FILLER"] = 5] = "FILLER";
    PointAttributeName[PointAttributeName["INTENSITY"] = 6] = "INTENSITY";
    PointAttributeName[PointAttributeName["CLASSIFICATION"] = 7] = "CLASSIFICATION";
    PointAttributeName[PointAttributeName["NORMAL_SPHEREMAPPED"] = 8] = "NORMAL_SPHEREMAPPED";
    PointAttributeName[PointAttributeName["NORMAL_OCT16"] = 9] = "NORMAL_OCT16";
    PointAttributeName[PointAttributeName["NORMAL"] = 10] = "NORMAL";
})(PointAttributeName || (PointAttributeName = {}));
const POINT_ATTRIBUTE_TYPES = {
    DATA_TYPE_DOUBLE: { ordinal: 0, size: 8 },
    DATA_TYPE_FLOAT: { ordinal: 1, size: 4 },
    DATA_TYPE_INT8: { ordinal: 2, size: 1 },
    DATA_TYPE_UINT8: { ordinal: 3, size: 1 },
    DATA_TYPE_INT16: { ordinal: 4, size: 2 },
    DATA_TYPE_UINT16: { ordinal: 5, size: 2 },
    DATA_TYPE_INT32: { ordinal: 6, size: 4 },
    DATA_TYPE_UINT32: { ordinal: 7, size: 4 },
    DATA_TYPE_INT64: { ordinal: 8, size: 8 },
    DATA_TYPE_UINT64: { ordinal: 9, size: 8 },
};
function makePointAttribute(name, type, numElements) {
    return {
        name,
        type,
        numElements,
        byteSize: numElements * type.size,
    };
}
const RGBA_PACKED = makePointAttribute(PointAttributeName.COLOR_PACKED, POINT_ATTRIBUTE_TYPES.DATA_TYPE_INT8, 4);
const POINT_ATTRIBUTES = {
    POSITION_CARTESIAN: makePointAttribute(PointAttributeName.POSITION_CARTESIAN, POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT, 3),
    RGBA_PACKED,
    COLOR_PACKED: RGBA_PACKED,
    RGB_PACKED: makePointAttribute(PointAttributeName.COLOR_PACKED, POINT_ATTRIBUTE_TYPES.DATA_TYPE_INT8, 3),
    NORMAL_FLOATS: makePointAttribute(PointAttributeName.NORMAL_FLOATS, POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT, 3),
    FILLER_1B: makePointAttribute(PointAttributeName.FILLER, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 1),
    INTENSITY: makePointAttribute(PointAttributeName.INTENSITY, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT16, 1),
    CLASSIFICATION: makePointAttribute(PointAttributeName.CLASSIFICATION, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 1),
    NORMAL_SPHEREMAPPED: makePointAttribute(PointAttributeName.NORMAL_SPHEREMAPPED, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 2),
    NORMAL_OCT16: makePointAttribute(PointAttributeName.NORMAL_OCT16, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 2),
    NORMAL: makePointAttribute(PointAttributeName.NORMAL, POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT, 3),
};
class PointAttributes {
    constructor(pointAttributeNames = []) {
        this.attributes = [];
        this.byteSize = 0;
        this.size = 0;
        for (let i = 0; i < pointAttributeNames.length; i++) {
            const pointAttributeName = pointAttributeNames[i];
            const pointAttribute = POINT_ATTRIBUTES[pointAttributeName];
            this.attributes.push(pointAttribute);
            this.byteSize += pointAttribute.byteSize;
            this.size++;
        }
    }
    add(pointAttribute) {
        this.attributes.push(pointAttribute);
        this.byteSize += pointAttribute.byteSize;
        this.size++;
    }
    hasColors() {
        return this.attributes.find(isColorAttribute) !== undefined;
    }
    hasNormals() {
        return this.attributes.find(isNormalAttribute) !== undefined;
    }
}
function isColorAttribute({ name }) {
    return name === PointAttributeName.COLOR_PACKED;
}
function isNormalAttribute({ name }) {
    return (name === PointAttributeName.NORMAL_SPHEREMAPPED ||
        name === PointAttributeName.NORMAL_FLOATS ||
        name === PointAttributeName.NORMAL ||
        name === PointAttributeName.NORMAL_OCT16);
}


/***/ }),

/***/ "./src/point-cloud-octree-geometry-node.ts":
/*!*************************************************!*\
  !*** ./src/point-cloud-octree-geometry-node.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointCloudOctreeGeometryNode": () => (/* binding */ PointCloudOctreeGeometryNode)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_bounds__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/bounds */ "./src/utils/bounds.ts");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/utils */ "./src/utils/utils.ts");
/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */



const JSON5 = __webpack_require__(/*! json5 */ "./node_modules/json5/dist/index.js");
// const NODE_STRIDE = 5;
class PointCloudOctreeGeometryNode extends three__WEBPACK_IMPORTED_MODULE_0__.EventDispatcher {
    constructor(name, pcoGeometry, boundingBox, index) {
        super();
        this.id = PointCloudOctreeGeometryNode.idCount++;
        this.level = 0;
        this.spacing = 0.2;
        this.hasChildren = false;
        this.children = [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ];
        this.hierarchyUrl = '';
        this.mean = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
        this.numPoints = 50000;
        this.loaded = false;
        this.loading = false;
        this.failed = false;
        this.indexInList = 0;
        this.parent = null;
        this.oneTimeDisposeHandlers = [];
        this.isLeafNode = true;
        this.isTreeNode = false;
        this.isGeometryNode = true;
        this.name = name;
        this.index = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.getIndexFromName)(name);
        this.indexInList = index;
        this.pcoGeometry = pcoGeometry;
        this.boundingBox = boundingBox;
        this.tightBoundingBox = boundingBox.clone();
        this.boundingSphere = boundingBox.getBoundingSphere(new three__WEBPACK_IMPORTED_MODULE_0__.Sphere());
    }
    dispose() {
        if (!this.geometry || !this.parent) {
            return;
        }
        this.geometry.dispose();
        this.geometry = undefined;
        this.loaded = false;
        this.oneTimeDisposeHandlers.forEach(handler => handler());
        this.oneTimeDisposeHandlers = [];
    }
    /**
     * Gets the url of the binary file for this node.
     */
    getUrl() {
        const geometry = this.pcoGeometry;
        const pathParts = [geometry.octreeDir];
        return pathParts.join('/');
    }
    /**
     * Gets the url of the hierarchy file for this node.
     */
    // getHierarchyUrl(): string {
    //   return `${this.pcoGeometry.octreeDir}/${this.getHierarchyBaseUrl()}/${this.name}.hrc`;
    // }
    /**
     * Adds the specified node as a child of the current node.
     *
     * @param child
     *    The node which is to be added as a child.
     */
    addChild(child) {
        this.children[child.index] = child;
        this.isLeafNode = false;
        child.parent = this;
    }
    /**
     * Calls the specified callback for the current node (if includeSelf is set to true) and all its
     * children.
     *
     * @param cb
     *    The function which is to be called for each node.
     */
    traverse(cb, includeSelf = true) {
        const stack = includeSelf ? [this] : [];
        let current;
        while ((current = stack.pop()) !== undefined) {
            cb(current);
            for (const child of current.children) {
                if (child !== null) {
                    stack.push(child);
                }
            }
        }
    }
    load() {
        if (!this.canLoad()) {
            return Promise.resolve();
        }
        this.loading = true;
        this.pcoGeometry.numNodesLoading++;
        this.pcoGeometry.needsUpdate = true;
        let promise;
        // if (
        //   this.level % this.pcoGeometry.hierarchyStepSize === 0 &&
        //   this.hasChildren
        // ) {
        //   promise = this.loadHierachyThenPoints();
        // } else {
        // }
        promise = this.loadPoints();
        return promise.catch(reason => {
            this.loading = false;
            this.failed = true;
            this.pcoGeometry.numNodesLoading--;
            throw reason;
        });
    }
    loadResonai() {
        if (!this.canLoad()) {
            return Promise.resolve();
        }
        this.loading = true;
        this.pcoGeometry.numNodesLoading++;
        this.pcoGeometry.needsUpdate = true;
        let promise;
        if (this.level % this.pcoGeometry.hierarchyStepSize === 0 &&
            this.hasChildren) {
            promise = this.loadResonaiHierachyThenPoints();
        }
        else {
            promise = this.loadResonaiPoints();
        }
        return promise.catch(reason => {
            this.loading = false;
            this.failed = true;
            this.pcoGeometry.numNodesLoading--;
            throw reason;
        });
    }
    canLoad() {
        // return true
        return (!this.loading &&
            !this.loaded &&
            !this.pcoGeometry.disposed &&
            !this.pcoGeometry.loader.disposed
        // this.pcoGeometry.numNodesLoading < this.pcoGeometry.maxNumNodesLoading
        );
    }
    loadPoints() {
        this.pcoGeometry.needsUpdate = true;
        return this.pcoGeometry.loader.load(this);
    }
    // private loadHierachyThenPoints(): Promise<any> {
    //   if (this.level % this.pcoGeometry.hierarchyStepSize !== 0) {
    //     return Promise.resolve();
    //   }
    loadResonaiPoints() {
        this.pcoGeometry.needsUpdate = true;
        // ybf loader
        return this.pcoGeometry.loader.load(this);
    }
    // private loadHierachyThenPoints(): Promise<any> {
    //   if (this.level % this.pcoGeometry.hierarchyStepSize !== 0) {
    //     return Promise.resolve();
    //   }
    // }
    //   return this.pcoGeometry.xhrRequest(this.pcoGeometry.url || '', { mode: 'cors' })
    //     .then(res => res.arrayBuffer())
    //     .then(data => {
    //       this.loadHierarchy(this, data)
    //     });
    // }
    loadResonaiHierachyThenPoints() {
        if (this.level % this.pcoGeometry.hierarchyStepSize !== 0) {
            return Promise.resolve();
        }
        return Promise.resolve(fetch(this.hierarchyUrl).then(res => {
            res.text().then(text => {
                this.loadResonaiHierarchy(this, JSON5.parse(text));
            });
        }));
    }
    /**
     * Gets the url of the folder where the hierarchy is, relative to the octreeDir.
     */
    // private getHierarchyBaseUrl(): string {
    //   const hierarchyStepSize = this.pcoGeometry.hierarchyStepSize;
    //   const indices = this.name.substr(1);
    //   const numParts = Math.floor(indices.length / hierarchyStepSize);
    //   let path = 'r/';
    //   for (let i = 0; i < numParts; i++) {
    //     path += `${indices.substr(i * hierarchyStepSize, hierarchyStepSize)}/`;
    //   }
    //   return path.slice(0, -1);
    // }
    // tslint:disable:no-bitwise
    // private loadHierarchy(node: PointCloudOctreeGeometryNode, buffer: ArrayBuffer) {
    //   const view = new DataView(buffer);
    //   const firstNodeData = this.getNodeData(node.name, 0, view);
    //   node.numPoints = firstNodeData.numPoints;
    //   // Nodes which need be visited.
    //   const stack: NodeData[] = [firstNodeData];
    //   // Nodes which have already been decoded. We will take nodes from the stack and place them here.
    //   const decoded: NodeData[] = [];
    //   let offset = NODE_STRIDE;
    //   while (stack.length > 0) {
    //     const stackNodeData = stack.shift()!;
    //     // From the last bit, all the way to the 8th one from the right.
    //     let mask = 1;
    //     for (let i = 0; i < 8 && offset + 1 < buffer.byteLength; i++) {
    //       // N & 2^^i !== 0
    //       if ((stackNodeData.children & mask) !== 0) {
    //         const nodeData = this.getNodeData(stackNodeData.name + i, offset, view);
    //         decoded.push(nodeData); // Node is decoded.
    //         stack.push(nodeData); // Need to check its children.
    //         offset += NODE_STRIDE; // Move over to the next node in the buffer.
    //       }
    //       mask = mask * 2;
    //     }
    //   }
    //   node.pcoGeometry.needsUpdate = true;
    //   // Map containing all the nodes.
    //   const nodes = new Map<string, PointCloudOctreeGeometryNode>();
    //   nodes.set(node.name, node);
    //   decoded.forEach(nodeData => this.addNode(nodeData, node.pcoGeometry, nodes));
    //   node.loadPoints();
    // }
    loadResonaiHierarchy(node, hierarchyData) {
        const firstNodeData = this.getResonaiNodeData(node.name, 0, hierarchyData);
        node.numPoints = firstNodeData.numPoints;
        // Nodes which need be visited.
        const stack = [firstNodeData];
        // Nodes which have already been decoded. We will take nodes from the stack and place them here.
        const decoded = [];
        // hierarchyData.nodes.forEach((number: any) => {
        //   const binary: string = Number(number).toString(2).padStart(32, '0')
        // })
        let idx = 1;
        // TODO(Shai) something in the hierarchy parsing is wrong so we never actually load all the existing nodes
        while (stack.length > 0) {
            // for (let j = 0; j < 800; j++) {
            const stackNodeData = stack.shift();
            // From the last bit, all the way to the 8th one from the right.
            let mask = 1 << 7;
            for (let i = 0; i < 8; i++) {
                // N & 2^^i !== 0
                // TODO(Shai) something in the hierarchy parsing is wrong so we never actually load all the existing nodes
                if ((stackNodeData.children & mask) !== 0) {
                    // const nodeData = this.getResonaiNodeData(stackNodeData.name + '_' + (7 - i), idx, hierarchyData);
                    const nodeData = this.getResonaiNodeData(stackNodeData.name + '_' + i, idx, hierarchyData);
                    idx += 1;
                    decoded.push(nodeData); // Node is decoded.
                    stack.push(nodeData); // Need to check its children.
                }
                mask = mask >> 1;
            }
        }
        node.pcoGeometry.needsUpdate = true;
        // Map containing all the nodes.
        const nodes = new Map();
        nodes.set(node.name, node);
        decoded.forEach(nodeData => this.addNode(nodeData, node.pcoGeometry, nodes));
        node.loadResonaiPoints();
    }
    // tslint:enable:no-bitwise
    // private getNodeData(name: string, offset: number, view: DataView): NodeData {
    //   const children = view.getUint8(offset);
    //   const numPoints = view.getUint32(offset + 1, true);
    //   return { children: children, numPoints: numPoints, name };
    // }
    getResonaiNodeData(name, offset, hierarchyData) {
        const code = hierarchyData.nodes[offset];
        // https://stackoverflow.com/questions/22335853/hack-to-convert-javascript-number-to-uint32
        // Force the number to be a UInt32 and not overflow
        const children = code >>> 24;
        const mask = (1 << 24) - 1;
        const numPoints = code & mask;
        const indexInList = offset;
        return { children, numPoints, name, indexInList };
    }
    addNode({ name, numPoints, children, indexInList }, pco, nodes) {
        const index = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.getIndexFromName)(name);
        const parentName = name.substring(0, name.length - 2);
        const parentNode = nodes.get(parentName);
        const level = (name.length + 1) / 2;
        const boundingBox = (0,_utils_bounds__WEBPACK_IMPORTED_MODULE_1__.createChildAABB)(parentNode.boundingBox, index);
        const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox, indexInList);
        node.level = level;
        node.numPoints = numPoints;
        node.hasChildren = children > 0;
        node.spacing = pco.spacing / Math.pow(2, level);
        node.indexInList = indexInList;
        parentNode.addChild(node);
        nodes.set(name, node);
    }
}
PointCloudOctreeGeometryNode.idCount = 0;


/***/ }),

/***/ "./src/point-cloud-octree-geometry.ts":
/*!********************************************!*\
  !*** ./src/point-cloud-octree-geometry.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointCloudOctreeGeometry": () => (/* binding */ PointCloudOctreeGeometry)
/* harmony export */ });
/* harmony import */ var _point_attributes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point-attributes */ "./src/point-attributes.ts");

class PointCloudOctreeGeometry {
    constructor(loader, boundingBox, tightBoundingBox, offset, xhrRequest) {
        this.loader = loader;
        this.boundingBox = boundingBox;
        this.tightBoundingBox = tightBoundingBox;
        this.offset = offset;
        this.xhrRequest = xhrRequest;
        this.disposed = false;
        this.needsUpdate = true;
        this.octreeDir = '';
        this.hierarchyStepSize = -1;
        this.nodes = {};
        this.numNodesLoading = 0;
        this.maxNumNodesLoading = 3;
        this.spacing = 0.01;
        this.pointAttributes = new _point_attributes__WEBPACK_IMPORTED_MODULE_0__.PointAttributes([]);
        this.projection = null;
        this.url = null;
    }
    dispose() {
        this.loader.dispose();
        this.root.traverse(node => node.dispose());
        this.disposed = true;
    }
    addNodeLoadedCallback(callback) {
        this.loader.callbacks.push(callback);
    }
    clearNodeLoadedCallbacks() {
        this.loader.callbacks = [];
    }
}


/***/ }),

/***/ "./src/point-cloud-octree-node.ts":
/*!****************************************!*\
  !*** ./src/point-cloud-octree-node.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointCloudOctreeNode": () => (/* binding */ PointCloudOctreeNode)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

class PointCloudOctreeNode extends three__WEBPACK_IMPORTED_MODULE_0__.EventDispatcher {
    constructor(geometryNode, sceneNode) {
        super();
        this.pcIndex = undefined;
        this.boundingBoxNode = null;
        this.loaded = true;
        this.isTreeNode = true;
        this.isGeometryNode = false;
        this.geometryNode = geometryNode;
        this.sceneNode = sceneNode;
        this.children = geometryNode.children.slice();
    }
    dispose() {
        this.geometryNode.dispose();
    }
    disposeSceneNode() {
        const node = this.sceneNode;
        if (node.geometry instanceof three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry) {
            const attributes = node.geometry.attributes;
            // tslint:disable-next-line:forin
            for (const key in attributes) {
                if (key === 'position') {
                    delete attributes[key].array;
                }
                delete attributes[key];
            }
            node.geometry.dispose();
            node.geometry = undefined;
        }
    }
    traverse(cb, includeSelf) {
        this.geometryNode.traverse(cb, includeSelf);
    }
    get id() {
        return this.geometryNode.id;
    }
    get name() {
        return this.geometryNode.name;
    }
    get level() {
        return this.geometryNode.level;
    }
    get isLeafNode() {
        return this.geometryNode.isLeafNode;
    }
    get numPoints() {
        return this.geometryNode.numPoints;
    }
    get index() {
        return this.geometryNode.index;
    }
    get boundingSphere() {
        return this.geometryNode.boundingSphere;
    }
    get boundingBox() {
        return this.geometryNode.boundingBox;
    }
    get spacing() {
        return this.geometryNode.spacing;
    }
}


/***/ }),

/***/ "./src/point-cloud-octree-picker.ts":
/*!******************************************!*\
  !*** ./src/point-cloud-octree-picker.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointCloudOctreePicker": () => (/* binding */ PointCloudOctreePicker)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _materials__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./materials */ "./src/materials/index.ts");
/* harmony import */ var _utils_math__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/math */ "./src/utils/math.ts");




class PointCloudOctreePicker {
    dispose() {
        if (this.pickState) {
            this.pickState.material.dispose();
            this.pickState.renderTarget.dispose();
        }
    }
    pick(renderer, camera, ray, octrees, params = {}) {
        if (octrees.length === 0) {
            return null;
        }
        const pickState = this.pickState
            ? this.pickState
            : (this.pickState = PointCloudOctreePicker.getPickState());
        const pickMaterial = pickState.material;
        const pixelRatio = renderer.getPixelRatio();
        const width = Math.ceil(renderer.domElement.clientWidth * pixelRatio);
        const height = Math.ceil(renderer.domElement.clientHeight * pixelRatio);
        PointCloudOctreePicker.updatePickRenderTarget(this.pickState, width, height);
        const pixelPosition = PointCloudOctreePicker.helperVec3; // Use helper vector to prevent extra allocations.
        if (params.pixelPosition) {
            pixelPosition.copy(params.pixelPosition);
        }
        else {
            pixelPosition.addVectors(camera.position, ray.direction).project(camera);
            pixelPosition.x = (pixelPosition.x + 1) * width * 0.5;
            pixelPosition.y = (pixelPosition.y + 1) * height * 0.5;
        }
        const pickWndSize = Math.floor((params.pickWindowSize || _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_PICK_WINDOW_SIZE) * pixelRatio);
        const halfPickWndSize = (pickWndSize - 1) / 2;
        const x = Math.floor((0,_utils_math__WEBPACK_IMPORTED_MODULE_3__.clamp)(pixelPosition.x - halfPickWndSize, 0, width));
        const y = Math.floor((0,_utils_math__WEBPACK_IMPORTED_MODULE_3__.clamp)(pixelPosition.y - halfPickWndSize, 0, height));
        PointCloudOctreePicker.prepareRender(renderer, x, y, pickWndSize, pickMaterial, pickState);
        const renderedNodes = PointCloudOctreePicker.render(renderer, camera, pickMaterial, octrees, ray, pickState, params);
        // Cleanup
        pickMaterial.clearVisibleNodeTextureOffsets();
        // Read back image and decode hit point
        const pixels = PointCloudOctreePicker.readPixels(renderer, x, y, pickWndSize);
        const hit = PointCloudOctreePicker.findHit(pixels, pickWndSize);
        return PointCloudOctreePicker.getPickPoint(hit, renderedNodes);
    }
    static prepareRender(renderer, x, y, pickWndSize, pickMaterial, pickState) {
        // Render the intersected nodes onto the pick render target, clipping to a small pick window.
        renderer.setScissor(x, y, pickWndSize, pickWndSize);
        renderer.setScissorTest(true);
        renderer.state.buffers.depth.setTest(pickMaterial.depthTest);
        renderer.state.buffers.depth.setMask(pickMaterial.depthWrite);
        renderer.state.setBlending(three__WEBPACK_IMPORTED_MODULE_0__.NoBlending);
        renderer.setRenderTarget(pickState.renderTarget);
        // Save the current clear color and clear the renderer with black color and alpha 0.
        renderer.getClearColor(this.clearColor);
        const oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(_constants__WEBPACK_IMPORTED_MODULE_1__.COLOR_BLACK, 0);
        renderer.clear(true, true, true);
        renderer.setClearColor(this.clearColor, oldClearAlpha);
    }
    static render(renderer, camera, pickMaterial, octrees, ray, pickState, params) {
        const renderedNodes = [];
        for (const octree of octrees) {
            // Get all the octree nodes which intersect the picking ray. We only need to render those.
            const nodes = PointCloudOctreePicker.nodesOnRay(octree, ray);
            if (!nodes.length) {
                continue;
            }
            PointCloudOctreePicker.updatePickMaterial(pickMaterial, octree.material, params);
            pickMaterial.updateMaterial(octree, nodes, camera, renderer);
            if (params.onBeforePickRender) {
                params.onBeforePickRender(pickMaterial, pickState.renderTarget);
            }
            // Create copies of the nodes so we can render them differently than in the normal point cloud.
            pickState.scene.children = PointCloudOctreePicker.createTempNodes(octree, nodes, pickMaterial, renderedNodes.length);
            renderer.render(pickState.scene, camera);
            nodes.forEach(node => renderedNodes.push({ node, octree }));
        }
        return renderedNodes;
    }
    static nodesOnRay(octree, ray) {
        const nodesOnRay = [];
        const rayClone = ray.clone();
        for (const node of octree.visibleNodes) {
            const sphere = PointCloudOctreePicker.helperSphere
                .copy(node.boundingSphere)
                .applyMatrix4(octree.matrixWorld);
            if (rayClone.intersectsSphere(sphere)) {
                nodesOnRay.push(node);
            }
        }
        return nodesOnRay;
    }
    static readPixels(renderer, x, y, pickWndSize) {
        // Read the pixel from the pick render target.
        const pixels = new Uint8Array(4 * pickWndSize * pickWndSize);
        renderer.readRenderTargetPixels(renderer.getRenderTarget(), x, y, pickWndSize, pickWndSize, pixels);
        renderer.setScissorTest(false);
        renderer.setRenderTarget(null);
        return pixels;
    }
    static createTempNodes(octree, nodes, pickMaterial, nodeIndexOffset) {
        const tempNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const sceneNode = node.sceneNode;
            const tempNode = new three__WEBPACK_IMPORTED_MODULE_0__.Points(sceneNode.geometry, pickMaterial);
            tempNode.matrix = sceneNode.matrix;
            tempNode.matrixWorld = sceneNode.matrixWorld;
            tempNode.matrixAutoUpdate = false;
            tempNode.frustumCulled = false;
            const nodeIndex = nodeIndexOffset + i + 1;
            if (nodeIndex > 255) {
                console.error('More than 255 nodes for pick are not supported.');
            }
            tempNode.onBeforeRender = _materials__WEBPACK_IMPORTED_MODULE_2__.PointCloudMaterial.makeOnBeforeRender(octree, node, nodeIndex);
            tempNodes.push(tempNode);
        }
        return tempNodes;
    }
    static updatePickMaterial(pickMaterial, nodeMaterial, params) {
        pickMaterial.pointSizeType = nodeMaterial.pointSizeType;
        pickMaterial.shape = nodeMaterial.shape;
        pickMaterial.size = nodeMaterial.size;
        pickMaterial.minSize = nodeMaterial.minSize;
        pickMaterial.maxSize = nodeMaterial.maxSize;
        pickMaterial.classification = nodeMaterial.classification;
        pickMaterial.useFilterByNormal = nodeMaterial.useFilterByNormal;
        pickMaterial.filterByNormalThreshold = nodeMaterial.filterByNormalThreshold;
        if (params.pickOutsideClipRegion) {
            pickMaterial.clipMode = _materials__WEBPACK_IMPORTED_MODULE_2__.ClipMode.DISABLED;
        }
        else {
            pickMaterial.clipMode = nodeMaterial.clipMode;
            pickMaterial.setClipBoxes(nodeMaterial.clipMode === _materials__WEBPACK_IMPORTED_MODULE_2__.ClipMode.CLIP_OUTSIDE ? nodeMaterial.clipBoxes : []);
        }
    }
    static updatePickRenderTarget(pickState, width, height) {
        if (pickState.renderTarget.width === width && pickState.renderTarget.height === height) {
            return;
        }
        pickState.renderTarget.dispose();
        pickState.renderTarget = PointCloudOctreePicker.makePickRenderTarget();
        pickState.renderTarget.setSize(width, height);
    }
    static makePickRenderTarget() {
        return new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderTarget(1, 1, {
            minFilter: three__WEBPACK_IMPORTED_MODULE_0__.LinearFilter,
            magFilter: three__WEBPACK_IMPORTED_MODULE_0__.NearestFilter,
            format: three__WEBPACK_IMPORTED_MODULE_0__.RGBAFormat,
        });
    }
    static findHit(pixels, pickWndSize) {
        const ibuffer = new Uint32Array(pixels.buffer);
        // Find closest hit inside pixelWindow boundaries
        let min = Number.MAX_VALUE;
        let hit = null;
        for (let u = 0; u < pickWndSize; u++) {
            for (let v = 0; v < pickWndSize; v++) {
                const offset = u + v * pickWndSize;
                const distance = Math.pow(u - (pickWndSize - 1) / 2, 2) + Math.pow(v - (pickWndSize - 1) / 2, 2);
                const pcIndex = pixels[4 * offset + 3];
                pixels[4 * offset + 3] = 0;
                const pIndex = ibuffer[offset];
                if (pcIndex > 0 && distance < min) {
                    hit = {
                        pIndex: pIndex,
                        pcIndex: pcIndex - 1,
                    };
                    min = distance;
                }
            }
        }
        return hit;
    }
    static getPickPoint(hit, nodes) {
        if (!hit) {
            return null;
        }
        const point = {};
        const points = nodes[hit.pcIndex] && nodes[hit.pcIndex].node.sceneNode;
        if (!points) {
            return null;
        }
        point.pointCloud = nodes[hit.pcIndex].octree;
        const attributes = points.geometry.attributes;
        for (const property in attributes) {
            if (!attributes.hasOwnProperty(property)) {
                continue;
            }
            const values = attributes[property];
            // tslint:disable-next-line:prefer-switch
            if (property === 'position') {
                PointCloudOctreePicker.addPositionToPickPoint(point, hit, values, points);
            }
            else if (property === 'normal') {
                PointCloudOctreePicker.addNormalToPickPoint(point, hit, values, points);
            }
            else if (property === 'indices') {
                // TODO
            }
            else {
                if (values.itemSize === 1) {
                    point[property] = values.array[hit.pIndex];
                }
                else {
                    const value = [];
                    for (let j = 0; j < values.itemSize; j++) {
                        value.push(values.array[values.itemSize * hit.pIndex + j]);
                    }
                    point[property] = value;
                }
            }
        }
        return point;
    }
    static addPositionToPickPoint(point, hit, values, points) {
        point.position = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3()
            .fromBufferAttribute(values, hit.pIndex)
            .applyMatrix4(points.matrixWorld);
    }
    static addNormalToPickPoint(point, hit, values, points) {
        const normal = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromBufferAttribute(values, hit.pIndex);
        const normal4 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4(normal.x, normal.y, normal.z, 0).applyMatrix4(points.matrixWorld);
        normal.set(normal4.x, normal4.y, normal4.z);
        point.normal = normal;
    }
    static getPickState() {
        const scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();
        scene.autoUpdate = false;
        const material = new _materials__WEBPACK_IMPORTED_MODULE_2__.PointCloudMaterial();
        material.pointColorType = _materials__WEBPACK_IMPORTED_MODULE_2__.PointColorType.POINT_INDEX;
        return {
            renderTarget: PointCloudOctreePicker.makePickRenderTarget(),
            material: material,
            scene: scene,
        };
    }
}
PointCloudOctreePicker.helperVec3 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
PointCloudOctreePicker.helperSphere = new three__WEBPACK_IMPORTED_MODULE_0__.Sphere();
PointCloudOctreePicker.clearColor = new three__WEBPACK_IMPORTED_MODULE_0__.Color();


/***/ }),

/***/ "./src/point-cloud-octree.ts":
/*!***********************************!*\
  !*** ./src/point-cloud-octree.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointCloudOctree": () => (/* binding */ PointCloudOctree)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _materials__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./materials */ "./src/materials/index.ts");
/* harmony import */ var _point_cloud_octree_node__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./point-cloud-octree-node */ "./src/point-cloud-octree-node.ts");
/* harmony import */ var _point_cloud_octree_picker__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./point-cloud-octree-picker */ "./src/point-cloud-octree-picker.ts");
/* harmony import */ var _point_cloud_tree__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./point-cloud-tree */ "./src/point-cloud-tree.ts");
/* harmony import */ var _utils_bounds__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/bounds */ "./src/utils/bounds.ts");







class PointCloudOctree extends _point_cloud_tree__WEBPACK_IMPORTED_MODULE_5__.PointCloudTree {
    constructor(potree, pcoGeometry, material) {
        super();
        this.disposed = false;
        this.level = 0;
        this.maxLevel = Infinity;
        /**
         * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
         */
        this.minNodePixelSize = _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_MIN_NODE_PIXEL_SIZE;
        this.root = null;
        this.boundingBoxNodes = [];
        this.visibleNodes = [];
        this.visibleGeometry = [];
        this.numVisiblePoints = 0;
        this.showBoundingBox = false;
        this.visibleBounds = new three__WEBPACK_IMPORTED_MODULE_0__.Box3();
        this.name = '';
        this.potree = potree;
        this.root = pcoGeometry.root;
        this.pcoGeometry = pcoGeometry;
        this.boundingBox = pcoGeometry.boundingBox;
        this.boundingSphere = this.boundingBox.getBoundingSphere(new three__WEBPACK_IMPORTED_MODULE_0__.Sphere());
        this.position.copy(pcoGeometry.offset);
        this.updateMatrix();
        this.material = material || new _materials__WEBPACK_IMPORTED_MODULE_2__.PointCloudMaterial();
        this.initMaterial(this.material);
    }
    initMaterial(material) {
        this.updateMatrixWorld(true);
        const { min, max } = (0,_utils_bounds__WEBPACK_IMPORTED_MODULE_6__.computeTransformedBoundingBox)(this.pcoGeometry.tightBoundingBox || this.getBoundingBoxWorld(), this.matrixWorld);
        const bWidth = max.z - min.z;
        material.heightMin = min.z - 0.2 * bWidth;
        material.heightMax = max.z + 0.2 * bWidth;
    }
    dispose() {
        if (this.root) {
            this.root.dispose();
        }
        this.pcoGeometry.root.traverse(n => this.potree.lru.remove(n));
        this.pcoGeometry.dispose();
        this.material.dispose();
        this.visibleNodes = [];
        this.visibleGeometry = [];
        if (this.picker) {
            this.picker.dispose();
            this.picker = undefined;
        }
        this.disposed = true;
    }
    get pointSizeType() {
        return this.material.pointSizeType;
    }
    set pointSizeType(value) {
        this.material.pointSizeType = value;
    }
    toTreeNode(geometryNode, parent) {
        const points = new three__WEBPACK_IMPORTED_MODULE_0__.Points(geometryNode.geometry, this.material);
        const node = new _point_cloud_octree_node__WEBPACK_IMPORTED_MODULE_3__.PointCloudOctreeNode(geometryNode, points);
        points.name = geometryNode.name;
        points.frustumCulled = false;
        points.onBeforeRender = _materials__WEBPACK_IMPORTED_MODULE_2__.PointCloudMaterial.makeOnBeforeRender(this, node);
        if (parent) {
            parent.sceneNode.add(points);
            parent.children[geometryNode.index] = node;
            geometryNode.oneTimeDisposeHandlers.push(() => {
                node.disposeSceneNode();
                parent.sceneNode.remove(node.sceneNode);
                // Replace the tree node (rendered and in the GPU) with the geometry node.
                parent.children[geometryNode.index] = geometryNode;
            });
        }
        else {
            this.root = node;
            this.add(points);
        }
        return node;
    }
    updateVisibleBounds() {
        const bounds = this.visibleBounds;
        bounds.min.set(Infinity, Infinity, Infinity);
        bounds.max.set(-Infinity, -Infinity, -Infinity);
        for (const node of this.visibleNodes) {
            if (node.isLeafNode) {
                bounds.expandByPoint(node.boundingBox.min);
                bounds.expandByPoint(node.boundingBox.max);
            }
        }
    }
    updateBoundingBoxes() {
        if (!this.showBoundingBox || !this.parent) {
            return;
        }
        let bbRoot = this.parent.getObjectByName('bbroot');
        if (!bbRoot) {
            bbRoot = new three__WEBPACK_IMPORTED_MODULE_0__.Object3D();
            bbRoot.name = 'bbroot';
            this.parent.add(bbRoot);
        }
        const visibleBoxes = [];
        for (const node of this.visibleNodes) {
            if (node.boundingBoxNode !== undefined && node.isLeafNode) {
                visibleBoxes.push(node.boundingBoxNode);
            }
        }
        bbRoot.children = visibleBoxes;
    }
    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate === true) {
            this.updateMatrix();
        }
        if (this.matrixWorldNeedsUpdate === true || force === true) {
            if (!this.parent) {
                this.matrixWorld.copy(this.matrix);
            }
            else {
                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            }
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }
    }
    hideDescendants(object) {
        const toHide = [];
        addVisibleChildren(object);
        while (toHide.length > 0) {
            const objToHide = toHide.shift();
            objToHide.visible = false;
            addVisibleChildren(objToHide);
        }
        function addVisibleChildren(obj) {
            for (const child of obj.children) {
                if (child.visible) {
                    toHide.push(child);
                }
            }
        }
    }
    moveToOrigin() {
        this.position.set(0, 0, 0); // Reset, then the matrix will be updated in getBoundingBoxWorld()
        this.position.set(0, 0, 0).sub(this.getBoundingBoxWorld().getCenter(new three__WEBPACK_IMPORTED_MODULE_0__.Vector3()));
    }
    moveToGroundPlane() {
        this.position.y += -this.getBoundingBoxWorld().min.y;
    }
    getBoundingBoxWorld() {
        this.updateMatrixWorld(true);
        return (0,_utils_bounds__WEBPACK_IMPORTED_MODULE_6__.computeTransformedBoundingBox)(this.boundingBox, this.matrixWorld);
    }
    getVisibleExtent() {
        return this.visibleBounds.applyMatrix4(this.matrixWorld);
    }
    pick(renderer, camera, ray, params = {}) {
        this.picker = this.picker || new _point_cloud_octree_picker__WEBPACK_IMPORTED_MODULE_4__.PointCloudOctreePicker();
        return this.picker.pick(renderer, camera, ray, [this], params);
    }
    get progress() {
        return this.visibleGeometry.length === 0
            ? 0
            : this.visibleNodes.length / this.visibleGeometry.length;
    }
}


/***/ }),

/***/ "./src/point-cloud-tree.ts":
/*!*********************************!*\
  !*** ./src/point-cloud-tree.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PointCloudTree": () => (/* binding */ PointCloudTree)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

class PointCloudTree extends three__WEBPACK_IMPORTED_MODULE_0__.Object3D {
    constructor() {
        super(...arguments);
        this.root = null;
    }
    initialized() {
        return this.root !== null;
    }
}


/***/ }),

/***/ "./src/potree.ts":
/*!***********************!*\
  !*** ./src/potree.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "QueueItem": () => (/* binding */ QueueItem),
/* harmony export */   "Potree": () => (/* binding */ Potree)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./features */ "./src/features.ts");
/* harmony import */ var _loading__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./loading */ "./src/loading/index.ts");
/* harmony import */ var _materials__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./materials */ "./src/materials/index.ts");
/* harmony import */ var _point_cloud_octree__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./point-cloud-octree */ "./src/point-cloud-octree.ts");
/* harmony import */ var _point_cloud_octree_picker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./point-cloud-octree-picker */ "./src/point-cloud-octree-picker.ts");
/* harmony import */ var _type_predicates__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./type-predicates */ "./src/type-predicates.ts");
/* harmony import */ var _utils_binary_heap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils/binary-heap */ "./src/utils/binary-heap.js");
/* harmony import */ var _utils_box3_helper__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utils/box3-helper */ "./src/utils/box3-helper.ts");
/* harmony import */ var _utils_lru__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils/lru */ "./src/utils/lru.ts");












class QueueItem {
    constructor(pointCloudIndex, weight, node, parent) {
        this.pointCloudIndex = pointCloudIndex;
        this.weight = weight;
        this.node = node;
        this.parent = parent;
    }
}
class Potree {
    constructor() {
        this._pointBudget = _constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_POINT_BUDGET;
        this._rendererSize = new three__WEBPACK_IMPORTED_MODULE_0__.Vector2();
        this.maxNumNodesLoading = _constants__WEBPACK_IMPORTED_MODULE_1__.MAX_NUM_NODES_LOADING;
        this.features = _features__WEBPACK_IMPORTED_MODULE_2__.FEATURES;
        this.lru = new _utils_lru__WEBPACK_IMPORTED_MODULE_10__.LRU(this._pointBudget);
        this.updateVisibilityStructures = (() => {
            const frustumMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
            const inverseWorldMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
            const cameraMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
            return (pointClouds, camera) => {
                const frustums = [];
                const cameraPositions = [];
                const priorityQueue = new _utils_binary_heap__WEBPACK_IMPORTED_MODULE_8__.BinaryHeap(x => 1 / x.weight);
                for (let i = 0; i < pointClouds.length; i++) {
                    const pointCloud = pointClouds[i];
                    if (!pointCloud.initialized()) {
                        continue;
                    }
                    pointCloud.numVisiblePoints = 0;
                    pointCloud.visibleNodes = [];
                    pointCloud.visibleGeometry = [];
                    camera.updateMatrixWorld(false);
                    // Furstum in object space.
                    const inverseViewMatrix = camera.matrixWorldInverse;
                    const worldMatrix = pointCloud.matrixWorld;
                    frustumMatrix
                        .identity()
                        .multiply(camera.projectionMatrix)
                        .multiply(inverseViewMatrix)
                        .multiply(worldMatrix);
                    frustums.push(new three__WEBPACK_IMPORTED_MODULE_0__.Frustum().setFromProjectionMatrix(frustumMatrix));
                    // Camera position in object space
                    inverseWorldMatrix.copy(worldMatrix).invert();
                    cameraMatrix
                        .identity()
                        .multiply(inverseWorldMatrix)
                        .multiply(camera.matrixWorld);
                    cameraPositions.push(new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().setFromMatrixPosition(cameraMatrix));
                    if (pointCloud.visible && pointCloud.root !== null) {
                        const weight = Number.MAX_VALUE;
                        priorityQueue.push(new QueueItem(i, weight, pointCloud.root));
                    }
                    // Hide any previously visible nodes. We will later show only the needed ones.
                    if ((0,_type_predicates__WEBPACK_IMPORTED_MODULE_7__.isTreeNode)(pointCloud.root)) {
                        pointCloud.hideDescendants(pointCloud.root.sceneNode);
                    }
                    for (const boundingBoxNode of pointCloud.boundingBoxNodes) {
                        boundingBoxNode.visible = false;
                    }
                }
                return { frustums, cameraPositions, priorityQueue };
            };
        })();
    }
    // loadPointCloud(
    //   potreeName: string, // "cloud.js"
    //   getUrl: GetUrlFn,
    //   xhrRequest = (input: RequestInfo, init?: RequestInit) => fetch(input, init),
    // ): Promise<PointCloudOctree> {
    //   return loadPOC(potreeName, getUrl, xhrRequest).then(geometry => new PointCloudOctree(this, geometry));
    // }
    loadSingle(url, xhrRequest = (input, init) => fetch(input, init)) {
        return (0,_loading__WEBPACK_IMPORTED_MODULE_3__.loadSingle)(url, xhrRequest).then(geometry => new _point_cloud_octree__WEBPACK_IMPORTED_MODULE_5__.PointCloudOctree(this, geometry));
    }
    loadResonaiPointCloud(potreeName, // gs://bla/bla/r.json
    getUrl, xhrRequest = (input, init) => fetch(input, init)) {
        return (0,_loading__WEBPACK_IMPORTED_MODULE_3__.loadResonaiPOC)(potreeName, getUrl, xhrRequest).then(geometry => new _point_cloud_octree__WEBPACK_IMPORTED_MODULE_5__.PointCloudOctree(this, geometry));
    }
    updatePointClouds(pointClouds, camera, renderer) {
        const result = this.updateVisibility(pointClouds, camera, renderer);
        for (let i = 0; i < pointClouds.length; i++) {
            const pointCloud = pointClouds[i];
            if (pointCloud.disposed) {
                continue;
            }
            pointCloud.material.updateMaterial(pointCloud, pointCloud.visibleNodes, camera, renderer);
            pointCloud.updateVisibleBounds();
            pointCloud.updateBoundingBoxes();
        }
        this.lru.freeMemory();
        return result;
    }
    static pick(pointClouds, renderer, camera, ray, params = {}) {
        Potree.picker = Potree.picker || new _point_cloud_octree_picker__WEBPACK_IMPORTED_MODULE_6__.PointCloudOctreePicker();
        return Potree.picker.pick(renderer, camera, ray, pointClouds, params);
    }
    get pointBudget() {
        return this._pointBudget;
    }
    set pointBudget(value) {
        if (value !== this._pointBudget) {
            this._pointBudget = value;
            this.lru.pointBudget = value;
            this.lru.freeMemory();
        }
    }
    updateVisibility(pointClouds, camera, renderer) {
        let numVisiblePoints = 0;
        const visibleNodes = [];
        const unloadedGeometry = [];
        // calculate object space frustum and cam pos and setup priority queue
        const { frustums, cameraPositions, priorityQueue } = this.updateVisibilityStructures(pointClouds, camera);
        let loadedToGPUThisFrame = 0;
        let exceededMaxLoadsToGPU = false;
        let nodeLoadFailed = false;
        let queueItem;
        while ((queueItem = priorityQueue.pop()) !== undefined) {
            let node = queueItem.node;
            // If we will end up with too many points, we stop right away.
            if (numVisiblePoints + node.numPoints > this.pointBudget) {
                break;
            }
            const pointCloudIndex = queueItem.pointCloudIndex;
            const pointCloud = pointClouds[pointCloudIndex];
            const maxLevel = pointCloud.maxLevel !== undefined ? pointCloud.maxLevel : Infinity;
            if (node.level > maxLevel ||
                !frustums[pointCloudIndex].intersectsBox(node.boundingBox) ||
                this.shouldClip(pointCloud, node.boundingBox)) {
                continue;
            }
            numVisiblePoints += node.numPoints;
            pointCloud.numVisiblePoints += node.numPoints;
            const parentNode = queueItem.parent;
            if ((0,_type_predicates__WEBPACK_IMPORTED_MODULE_7__.isGeometryNode)(node) && (!parentNode || (0,_type_predicates__WEBPACK_IMPORTED_MODULE_7__.isTreeNode)(parentNode))) {
                if (node.loaded && loadedToGPUThisFrame < _constants__WEBPACK_IMPORTED_MODULE_1__.MAX_LOADS_TO_GPU) {
                    node = pointCloud.toTreeNode(node, parentNode);
                    loadedToGPUThisFrame++;
                }
                else if (!node.failed) {
                    if (node.loaded && loadedToGPUThisFrame >= _constants__WEBPACK_IMPORTED_MODULE_1__.MAX_LOADS_TO_GPU) {
                        exceededMaxLoadsToGPU = true;
                    }
                    unloadedGeometry.push(node);
                    pointCloud.visibleGeometry.push(node);
                }
                else {
                    nodeLoadFailed = true;
                    continue;
                }
            }
            if ((0,_type_predicates__WEBPACK_IMPORTED_MODULE_7__.isTreeNode)(node)) {
                this.updateTreeNodeVisibility(pointCloud, node, visibleNodes);
                pointCloud.visibleGeometry.push(node.geometryNode);
            }
            const halfHeight = 0.5 * renderer.getSize(this._rendererSize).height * renderer.getPixelRatio();
            this.updateChildVisibility(queueItem, priorityQueue, pointCloud, node, cameraPositions[pointCloudIndex], camera, halfHeight);
        } // end priority queue loop
        const numNodesToLoad = Math.min(this.maxNumNodesLoading, unloadedGeometry.length);
        const nodeLoadPromises = [];
        for (let i = 0; i < numNodesToLoad; i++) {
            nodeLoadPromises.push(unloadedGeometry[i].load());
        }
        return {
            visibleNodes: visibleNodes,
            numVisiblePoints: numVisiblePoints,
            exceededMaxLoadsToGPU: exceededMaxLoadsToGPU,
            nodeLoadFailed: nodeLoadFailed,
            nodeLoadPromises: nodeLoadPromises,
        };
    }
    updateTreeNodeVisibility(pointCloud, node, visibleNodes) {
        this.lru.touch(node.geometryNode);
        const sceneNode = node.sceneNode;
        sceneNode.visible = true;
        sceneNode.material = pointCloud.material;
        sceneNode.updateMatrix();
        sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, sceneNode.matrix);
        visibleNodes.push(node);
        pointCloud.visibleNodes.push(node);
        this.updateBoundingBoxVisibility(pointCloud, node);
    }
    updateChildVisibility(queueItem, priorityQueue, pointCloud, node, cameraPosition, camera, halfHeight) {
        const children = node.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child === null) {
                continue;
            }
            const sphere = child.boundingSphere;
            const distance = sphere.center.distanceTo(cameraPosition);
            const radius = sphere.radius;
            let projectionFactor = 0.0;
            if (camera.type === _constants__WEBPACK_IMPORTED_MODULE_1__.PERSPECTIVE_CAMERA) {
                const perspective = camera;
                const fov = (perspective.fov * Math.PI) / 180.0;
                const slope = Math.tan(fov / 2.0);
                projectionFactor = halfHeight / (slope * distance);
            }
            else {
                const orthographic = camera;
                projectionFactor = (2 * halfHeight) / (orthographic.top - orthographic.bottom);
            }
            const screenPixelRadius = radius * projectionFactor;
            // Don't add the node if it'll be too small on the screen.
            if (screenPixelRadius < pointCloud.minNodePixelSize) {
                continue;
            }
            // Nodes which are larger will have priority in loading/displaying.
            const weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius + 1 / distance;
            priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
        }
    }
    updateBoundingBoxVisibility(pointCloud, node) {
        if (pointCloud.showBoundingBox && !node.boundingBoxNode) {
            const boxHelper = new _utils_box3_helper__WEBPACK_IMPORTED_MODULE_9__.Box3Helper(node.boundingBox);
            boxHelper.matrixAutoUpdate = false;
            pointCloud.boundingBoxNodes.push(boxHelper);
            node.boundingBoxNode = boxHelper;
            node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
        }
        else if (pointCloud.showBoundingBox && node.boundingBoxNode) {
            node.boundingBoxNode.visible = true;
            node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
        }
        else if (!pointCloud.showBoundingBox && node.boundingBoxNode) {
            node.boundingBoxNode.visible = false;
        }
    }
    shouldClip(pointCloud, boundingBox) {
        const material = pointCloud.material;
        if (material.numClipBoxes === 0 || material.clipMode !== _materials__WEBPACK_IMPORTED_MODULE_4__.ClipMode.CLIP_OUTSIDE) {
            return false;
        }
        const box2 = boundingBox.clone();
        pointCloud.updateMatrixWorld(true);
        box2.applyMatrix4(pointCloud.matrixWorld);
        const clipBoxes = material.clipBoxes;
        for (let i = 0; i < clipBoxes.length; i++) {
            const clipMatrixWorld = clipBoxes[i].matrix;
            const clipBoxWorld = new three__WEBPACK_IMPORTED_MODULE_0__.Box3(new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(-0.5, -0.5, -0.5), new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0.5, 0.5, 0.5)).applyMatrix4(clipMatrixWorld);
            if (box2.intersectsBox(clipBoxWorld)) {
                return false;
            }
        }
        return true;
    }
}


/***/ }),

/***/ "./src/type-predicates.ts":
/*!********************************!*\
  !*** ./src/type-predicates.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isGeometryNode": () => (/* binding */ isGeometryNode),
/* harmony export */   "isTreeNode": () => (/* binding */ isTreeNode)
/* harmony export */ });
function isGeometryNode(node) {
    return node !== undefined && node !== null && node.isGeometryNode;
}
function isTreeNode(node) {
    return node !== undefined && node !== null && node.isTreeNode;
}


/***/ }),

/***/ "./src/types.ts":
/*!**********************!*\
  !*** ./src/types.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/utils/bounds.ts":
/*!*****************************!*\
  !*** ./src/utils/bounds.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computeTransformedBoundingBox": () => (/* binding */ computeTransformedBoundingBox),
/* harmony export */   "createChildAABB": () => (/* binding */ createChildAABB)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

/**
 * adapted from mhluska at https://github.com/mrdoob/three.js/issues/1561
 */
function computeTransformedBoundingBox(box, transform) {
    return new three__WEBPACK_IMPORTED_MODULE_0__.Box3().setFromPoints([
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.max.x, box.min.y, box.min.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.min.x, box.max.y, box.min.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.min.x, box.min.y, box.max.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.min.x, box.max.y, box.max.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.max.x, box.max.y, box.min.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.max.x, box.min.y, box.max.z).applyMatrix4(transform),
        new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(box.max.x, box.max.y, box.max.z).applyMatrix4(transform),
    ]);
}
function createChildAABB(aabb, index) {
    const min = aabb.min.clone();
    const max = aabb.max.clone();
    const size = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().subVectors(max, min);
    // tslint:disable-next-line:no-bitwise
    if ((index & 0b0001) > 0) {
        min.z += size.z / 2;
    }
    else {
        max.z -= size.z / 2;
    }
    // tslint:disable-next-line:no-bitwise
    if ((index & 0b0010) > 0) {
        min.y += size.y / 2;
    }
    else {
        max.y -= size.y / 2;
    }
    // tslint:disable-next-line:no-bitwise
    if ((index & 0b0100) > 0) {
        min.x += size.x / 2;
    }
    else {
        max.x -= size.x / 2;
    }
    return new three__WEBPACK_IMPORTED_MODULE_0__.Box3(min, max);
}


/***/ }),

/***/ "./src/utils/box3-helper.ts":
/*!**********************************!*\
  !*** ./src/utils/box3-helper.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Box3Helper": () => (/* binding */ Box3Helper)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

/**
 *
 * code adapted from three.js BoxHelper.js
 * https://github.com/mrdoob/three.js/blob/dev/src/helpers/BoxHelper.js
 *
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / http://github.com/Mugen87
 * @author mschuetz / http://potree.org
 */
class Box3Helper extends three__WEBPACK_IMPORTED_MODULE_0__.LineSegments {
    constructor(box, color = new three__WEBPACK_IMPORTED_MODULE_0__.Color(0xffff00)) {
        // prettier-ignore
        const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
        // prettier-ignore
        const positions = new Float32Array([
            box.min.x, box.min.y, box.min.z,
            box.max.x, box.min.y, box.min.z,
            box.max.x, box.min.y, box.max.z,
            box.min.x, box.min.y, box.max.z,
            box.min.x, box.max.y, box.min.z,
            box.max.x, box.max.y, box.min.z,
            box.max.x, box.max.y, box.max.z,
            box.min.x, box.max.y, box.max.z
        ]);
        const geometry = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();
        geometry.setIndex(new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(indices, 1));
        geometry.setAttribute('position', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(positions, 3));
        const material = new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial({ color: color });
        super(geometry, material);
    }
}


/***/ }),

/***/ "./src/utils/lru.ts":
/*!**************************!*\
  !*** ./src/utils/lru.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LRUItem": () => (/* binding */ LRUItem),
/* harmony export */   "LRU": () => (/* binding */ LRU)
/* harmony export */ });
class LRUItem {
    constructor(node) {
        this.node = node;
        this.next = null;
        this.previous = null;
    }
}
/**
 * A doubly-linked-list of the least recently used elements.
 */
class LRU {
    constructor(pointBudget = 1000000) {
        this.pointBudget = pointBudget;
        // the least recently used item
        this.first = null;
        // the most recently used item
        this.last = null;
        this.numPoints = 0;
        this.items = new Map();
    }
    get size() {
        return this.items.size;
    }
    has(node) {
        return this.items.has(node.id);
    }
    /**
     * Makes the specified the most recently used item. if the list does not contain node, it will
     * be added.
     */
    touch(node) {
        if (!node.loaded) {
            return;
        }
        const item = this.items.get(node.id);
        if (item) {
            this.touchExisting(item);
        }
        else {
            this.addNew(node);
        }
    }
    addNew(node) {
        const item = new LRUItem(node);
        item.previous = this.last;
        this.last = item;
        if (item.previous) {
            item.previous.next = item;
        }
        if (!this.first) {
            this.first = item;
        }
        this.items.set(node.id, item);
        this.numPoints += node.numPoints;
    }
    touchExisting(item) {
        if (!item.previous) {
            // handle touch on first element
            if (item.next) {
                this.first = item.next;
                this.first.previous = null;
                item.previous = this.last;
                item.next = null;
                this.last = item;
                if (item.previous) {
                    item.previous.next = item;
                }
            }
        }
        else if (!item.next) {
            // handle touch on last element
        }
        else {
            // handle touch on any other element
            item.previous.next = item.next;
            item.next.previous = item.previous;
            item.previous = this.last;
            item.next = null;
            this.last = item;
            if (item.previous) {
                item.previous.next = item;
            }
        }
    }
    remove(node) {
        const item = this.items.get(node.id);
        if (!item) {
            return;
        }
        if (this.items.size === 1) {
            this.first = null;
            this.last = null;
        }
        else {
            if (!item.previous) {
                this.first = item.next;
                this.first.previous = null;
            }
            if (!item.next) {
                this.last = item.previous;
                this.last.next = null;
            }
            if (item.previous && item.next) {
                item.previous.next = item.next;
                item.next.previous = item.previous;
            }
        }
        this.items.delete(node.id);
        this.numPoints -= node.numPoints;
    }
    getLRUItem() {
        return this.first ? this.first.node : undefined;
    }
    freeMemory() {
        if (this.items.size <= 1) {
            return;
        }
        while (this.numPoints > this.pointBudget * 2) {
            const node = this.getLRUItem();
            if (node) {
                this.disposeSubtree(node);
            }
        }
    }
    disposeSubtree(node) {
        // Collect all the nodes which are to be disposed and removed.
        const nodesToDispose = [node];
        node.traverse(n => {
            if (n.loaded) {
                nodesToDispose.push(n);
            }
        });
        // Dispose of all the nodes in one go.
        for (const n of nodesToDispose) {
            n.dispose();
            this.remove(n);
        }
    }
}


/***/ }),

/***/ "./src/utils/math.ts":
/*!***************************!*\
  !*** ./src/utils/math.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clamp": () => (/* binding */ clamp)
/* harmony export */ });
function clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
}


/***/ }),

/***/ "./src/utils/utils.ts":
/*!****************************!*\
  !*** ./src/utils/utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getIndexFromName": () => (/* binding */ getIndexFromName),
/* harmony export */   "byLevelAndIndex": () => (/* binding */ byLevelAndIndex),
/* harmony export */   "gsToPath": () => (/* binding */ gsToPath)
/* harmony export */ });
function getIndexFromName(name) {
    return parseInt(name.charAt(name.length - 1), 10) || 0;
}
/**
 * When passed to `[].sort`, sorts the array by level and index: r, r0, r3, r4, r01, r07, r30, ...
 */
function byLevelAndIndex(a, b) {
    const na = a.name;
    const nb = b.name;
    if (na.length !== nb.length) {
        return na.length - nb.length;
    }
    else if (na < nb) {
        return -1;
    }
    else if (na > nb) {
        return 1;
    }
    else {
        return 0;
    }
}
function gsToPath(gs) {
    return gs.replace('gs://', 'https://storage.googleapis.com/');
}


/***/ }),

/***/ "./src/version.ts":
/*!************************!*\
  !*** ./src/version.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Version": () => (/* binding */ Version)
/* harmony export */ });
class Version {
    constructor(version) {
        this.versionMinor = 0;
        this.version = version;
        const vmLength = version.indexOf('.') === -1 ? version.length : version.indexOf('.');
        this.versionMajor = parseInt(version.substr(0, vmLength), 10);
        this.versionMinor = parseInt(version.substr(vmLength + 1), 10);
        if (isNaN(this.versionMinor)) {
            this.versionMinor = 0;
        }
    }
    newerThan(version) {
        const v = new Version(version);
        if (this.versionMajor > v.versionMajor) {
            return true;
        }
        else if (this.versionMajor === v.versionMajor && this.versionMinor > v.versionMinor) {
            return true;
        }
        else {
            return false;
        }
    }
    equalOrHigher(version) {
        const v = new Version(version);
        if (this.versionMajor > v.versionMajor) {
            return true;
        }
        else if (this.versionMajor === v.versionMajor && this.versionMinor >= v.versionMinor) {
            return true;
        }
        else {
            return false;
        }
    }
    upTo(version) {
        return !this.newerThan(version);
    }
}


/***/ }),

/***/ "./src/workers/binary-decoder.worker.js":
/*!**********************************************!*\
  !*** ./src/workers/binary-decoder.worker.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Worker_fn)
/* harmony export */ });
function Worker_fn() {
  return new Worker(__webpack_require__.p + "index.worker.js");
}


/***/ }),

/***/ "./src/workers/ybf-loader.worker.js":
/*!******************************************!*\
  !*** ./src/workers/ybf-loader.worker.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Worker_fn)
/* harmony export */ });
function Worker_fn() {
  return new Worker(__webpack_require__.p + "index.worker.js");
}


/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "three" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_three__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BlurMaterial": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.BlurMaterial),
/* harmony export */   "ClipMode": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.ClipMode),
/* harmony export */   "GRAYSCALE": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.GRAYSCALE),
/* harmony export */   "INFERNO": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.INFERNO),
/* harmony export */   "PLASMA": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.PLASMA),
/* harmony export */   "PointCloudMaterial": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.PointCloudMaterial),
/* harmony export */   "PointColorType": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.PointColorType),
/* harmony export */   "PointOpacityType": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.PointOpacityType),
/* harmony export */   "PointShape": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.PointShape),
/* harmony export */   "PointSizeType": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.PointSizeType),
/* harmony export */   "RAINBOW": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.RAINBOW),
/* harmony export */   "SPECTRAL": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.SPECTRAL),
/* harmony export */   "TreeType": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.TreeType),
/* harmony export */   "VIRIDIS": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.VIRIDIS),
/* harmony export */   "YELLOW_GREEN": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.YELLOW_GREEN),
/* harmony export */   "generateClassificationTexture": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.generateClassificationTexture),
/* harmony export */   "generateDataTexture": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.generateDataTexture),
/* harmony export */   "generateGradientTexture": () => (/* reexport safe */ _materials__WEBPACK_IMPORTED_MODULE_0__.generateGradientTexture),
/* harmony export */   "POINT_ATTRIBUTES": () => (/* reexport safe */ _point_attributes__WEBPACK_IMPORTED_MODULE_1__.POINT_ATTRIBUTES),
/* harmony export */   "POINT_ATTRIBUTE_TYPES": () => (/* reexport safe */ _point_attributes__WEBPACK_IMPORTED_MODULE_1__.POINT_ATTRIBUTE_TYPES),
/* harmony export */   "PointAttributeName": () => (/* reexport safe */ _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributeName),
/* harmony export */   "PointAttributes": () => (/* reexport safe */ _point_attributes__WEBPACK_IMPORTED_MODULE_1__.PointAttributes),
/* harmony export */   "PointCloudOctreeGeometryNode": () => (/* reexport safe */ _point_cloud_octree_geometry_node__WEBPACK_IMPORTED_MODULE_2__.PointCloudOctreeGeometryNode),
/* harmony export */   "PointCloudOctreeGeometry": () => (/* reexport safe */ _point_cloud_octree_geometry__WEBPACK_IMPORTED_MODULE_3__.PointCloudOctreeGeometry),
/* harmony export */   "PointCloudOctreeNode": () => (/* reexport safe */ _point_cloud_octree_node__WEBPACK_IMPORTED_MODULE_4__.PointCloudOctreeNode),
/* harmony export */   "PointCloudOctreePicker": () => (/* reexport safe */ _point_cloud_octree_picker__WEBPACK_IMPORTED_MODULE_5__.PointCloudOctreePicker),
/* harmony export */   "PointCloudOctree": () => (/* reexport safe */ _point_cloud_octree__WEBPACK_IMPORTED_MODULE_6__.PointCloudOctree),
/* harmony export */   "PointCloudTree": () => (/* reexport safe */ _point_cloud_tree__WEBPACK_IMPORTED_MODULE_7__.PointCloudTree),
/* harmony export */   "Potree": () => (/* reexport safe */ _potree__WEBPACK_IMPORTED_MODULE_8__.Potree),
/* harmony export */   "QueueItem": () => (/* reexport safe */ _potree__WEBPACK_IMPORTED_MODULE_8__.QueueItem),
/* harmony export */   "Version": () => (/* reexport safe */ _version__WEBPACK_IMPORTED_MODULE_10__.Version)
/* harmony export */ });
/* harmony import */ var _materials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./materials */ "./src/materials/index.ts");
/* harmony import */ var _point_attributes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./point-attributes */ "./src/point-attributes.ts");
/* harmony import */ var _point_cloud_octree_geometry_node__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./point-cloud-octree-geometry-node */ "./src/point-cloud-octree-geometry-node.ts");
/* harmony import */ var _point_cloud_octree_geometry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./point-cloud-octree-geometry */ "./src/point-cloud-octree-geometry.ts");
/* harmony import */ var _point_cloud_octree_node__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./point-cloud-octree-node */ "./src/point-cloud-octree-node.ts");
/* harmony import */ var _point_cloud_octree_picker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./point-cloud-octree-picker */ "./src/point-cloud-octree-picker.ts");
/* harmony import */ var _point_cloud_octree__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./point-cloud-octree */ "./src/point-cloud-octree.ts");
/* harmony import */ var _point_cloud_tree__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./point-cloud-tree */ "./src/point-cloud-tree.ts");
/* harmony import */ var _potree__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./potree */ "./src/potree.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./types */ "./src/types.ts");
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./version */ "./src/version.ts");












})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});;
//# sourceMappingURL=index.js.map