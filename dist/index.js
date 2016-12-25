'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = exports.interpolate = undefined;

var _lodash = require('lodash');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ## interpolate
 *
 * @param {String} format - a format string with tokens delimited by curly
 *  braces.
 * @param {String} src - the key for this file in metadata
 * @param {Object} files - the metadata / files structure as passed to
 *  metalsmith plugins
 * @param {Object} additional - any additional key value pairs for interpolation
 */
function interpolate(format, src, files, ...additional) {
  let meta = (0, _lodash.assign)({}, ...additional);
  if ((0, _lodash.isString)(src)) (0, _lodash.assign)(meta, files[src], { path: src });else (0, _lodash.assign)(meta, src, files);

  // match tokens like {foo}
  return format.replace(/\{([^}]+)\}/g, (match, token) => {
    let slugify = false;
    let result;
    // check for slugify marker
    if (/^[-_]/.test(token)) {
      slugify = token.slice(0, 1);
      token = token.slice(1);
    }

    (0, _lodash.some)(resolvers, r => {
      result = r(token, meta);
      return result;
    });
    if (!result) throw new Error(`bad token: ${ token }`);
    if (slugify) result = (0, _slug2.default)(result, slugify);
    return result;
  });
}

let resolvers = [(token, meta) => _path2.default.parse(meta.path)[token], (token, meta) => meta[token], (token, meta) => {
  if (!/[^MDY\-_./]/.exec(token)) {
    let date;
    date = (0, _moment2.default)(meta.modifiedDate || meta.publishedDate || meta.date || meta.stats.ctime);
    if (!date.isValid()) throw new Error(`no date: ${ meta.path }`);
    return date.format(token);
  }
}];
exports.default = interpolate;
exports.interpolate = interpolate;
exports.resolvers = resolvers;