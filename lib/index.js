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
    // check for slugify marker
    if (/^[-_]/.test(token)) {
      slugify = token.slice(0, 1)
      token = token.slice(1)
    }

    some(resolvers, (r) => {
      result = r(token, meta)
      return result
    })
    if (!result) throw new Error(`bad token: ${token}`)
    if (slugify) result = slug(result, slugify)
    return result
  })
}

let resolvers = [
  (token, meta) => path.parse(meta.path)[token],
  (token, meta) => meta[token],
  (token, meta) => {
    if (!/[^MDY\-_./]/.exec(token)) {
      let date
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
