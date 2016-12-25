'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = undefined;
exports.default = interpolate;

var _lodash = require('lodash');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import debug from 'debug'

// let dbg = debug('metalsmith-interpolate')

function interpolate(format, src, files) {
  return format.replace(/\{([^}]+)\}/g, (match, token) => {
    let slugify = false;
    let result;
    if (/^$/.test(token)) {
      slugify = true;
      token = token.slice(1);
    }
    (0, _lodash.some)(resolvers, r => {
      result = r(format, src, files, token);
      return result;
    });
    if (!result) throw new Error(`bad token: ${ token }`);
    if (slugify) result = (0, _slug2.default)(result);
    return result;
  });
}

let resolvers = exports.resolvers = [(format, src, files, token) => {
  let parsed = _path2.default.parse(src);
  if (parsed.hasOwnProperty(token)) return parsed[token];
}, (format, src, files, token) => {
  if (files[src].hasOwnProperty(token)) return files[src][token];
}, (format, src, files, token) => {
  if (!/[^MDY\-_./]/.exec(token)) {
    let date;
    date = (0, _moment2.default)(files[src].modifiedDate || files[src].publishedDate || files[src].date || files[src].stats.ctime);
    if (!date.isValid()) throw new Error('bad date');
    return date.format(token);
  }
}];