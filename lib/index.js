import {
  some,
  assign,
  isString
} from 'lodash'
import path from 'path'
import moment from 'moment'
import slug from 'slug'

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
function interpolate (format, src, files, ...additional) {
  let meta = assign({}, ...additional)
  if (isString(src)) assign(meta, files[src], { path: src })
  else assign(meta, src, files)

  // match tokens like {foo}
  return format.replace(/\{([^}]+)\}/g, (match, token) => {
    let slugify = false
    let result
    let resolved

    // check for slugify tag
    if (/^[-_]/.test(token)) {
      slugify = token.slice(0, 1)
      token = token.slice(1)
    }

    resolved = some(resolvers, (r) => {
      result = r(token, meta)
      // an 0 length string should return true
      return isString(result) || result
    })
    if (!resolved) throw new Error(`bad token: ${token}`)
    if (slugify) result = slug(result, slugify)
    return result
  })
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
  (token, meta) => path.parse(meta.path)[token],
  // check meta properties for token
  (token, meta) => meta[token],
  // check token against moment formats
  (token, meta) => {
    // ugly negated regex will pass if only listed chars are present
    if (!/[^MDY\-_./]/.exec(token)) {
      let date
      // I personally use `modifiedDate` and `publishedDate`, maybe it's only me
      // this is probably quite brittle, will see what issues arise
      date = moment(
        meta.modifiedDate ||
        meta.publishedDate ||
        meta.date ||
        meta.stats.ctime
      )
      if (!date.isValid()) throw new Error(`no date: ${meta.path}`)
      return date.format(token)
    }
  }
]

export default interpolate
export { interpolate, resolvers }
