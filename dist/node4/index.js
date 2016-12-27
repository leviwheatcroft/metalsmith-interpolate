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
function interpolate(format, src, files) {
  for (var _len = arguments.length, additional = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    additional[_key - 3] = arguments[_key];
  }

  let meta = _lodash.assign.apply(undefined, [{}].concat(additional));
  if ((0, _lodash.isString)(src)) (0, _lodash.assign)(meta, files[src], { path: src });else (0, _lodash.assign)(meta, src, files);

  // match tokens like {foo}
  return format.replace(/\{([^}]+)\}/g, (match, token) => {
    let slugify = false;
    let result;
    let resolved;

    // check for slugify tag
    if (/^[-_]/.test(token)) {
      slugify = token.slice(0, 1);
      token = token.slice(1);
    }

    resolved = (0, _lodash.some)(resolvers, r => {
      result = r(token, meta);
      // an 0 length string should return true
      return (0, _lodash.isString)(result) || result;
    });
    if (!resolved) throw new Error(`bad token: ${ token }`);
    if (slugify) result = (0, _slug2.default)(result, slugify);
    return result;
  });
}

/**
 * ## resolvers array
 * this array is exported as a poor man's plugin interface. `interpolate`
 * iterates over all functions in the `resolvers` array. therefore you can use
 * `resolvers.push()` or `resolvers.shift()` to add functions which resolver
 * tokens
 *
 * ```javascript
 * import { interpolate, resolvers } from 'metalsmith-interpolate'
 * resolvers.unshift(
 *   (token, meta) => if (token == 'firstTag') return meta.tags[0]
 * )
 * ```
 */
let resolvers = [
// check `path.parse()`` results for token
(token, meta) => _path2.default.parse(meta.path)[token],
// check meta properties for token
(token, meta) => meta[token],
// check token against moment formats
(token, meta) => {
  // ugly negated regex will pass if only listed chars are present
  if (!/[^MDY\-_./]/.exec(token)) {
    let date;
    // I personally use `modifiedDate` and `publishedDate`, maybe it's only me
    // this is probably quite brittle, will see what issues arises
    date = (0, _moment2.default)(meta.modifiedDate || meta.publishedDate || meta.date || meta.stats.ctime);
    if (!date.isValid()) throw new Error(`no date: ${ meta.path }`);
    return date.format(token);
  }
}];

exports.default = interpolate;
exports.interpolate = interpolate;
exports.resolvers = resolvers;