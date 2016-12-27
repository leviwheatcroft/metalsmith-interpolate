# metalsmith-interpolate

![nodei.co](https://nodei.co/npm/metalsmith-interpolate.png?downloads=true&downloadRank=true&stars=true)

![npm](https://img.shields.io/npm/v/metalsmith-interpolate.svg)

![github-issues](https://img.shields.io/github/issues/leviwheatcroft/metalsmith-interpolate.svg)

![stars](https://img.shields.io/github/stars/leviwheatcroft/metalsmith-interpolate.svg)

![forks](https://img.shields.io/github/forks/leviwheatcroft/metalsmith-interpolate.svg)

[metalsmith](metalsmith.io) helper to interpolate strings

[fancy annotated code](https://leviwheatcroft.github.io/metalsmith-interpolate/lib/index.js.html)

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [metalsmith-interpolate](#pkgname)
	- [install](#install)
	- [usage](#usage)
	- [tokens](#tokens)
		- [from path](#from-path)
		- [from meta](#from-meta)
		- [from moment](#from-moment)
	- [custom tokens](#custom-tokens)
		- [simple value tokens](#simple-value-tokens)
		- [calculated values](#calculated-values)
	- [slugify on the fly](#slugify-on-the-fly)
	- [node 4 LTS](#node-4-lts)
	- [Author](#author)
	- [Contributing](#contributing)
	- [License](#license)

<!-- /TOC -->


## install

`npm i --save metalsmith-interpolate`

## usage

metalsmith-interpolate is not a plugin, it's a module designed to be used within
plugins to provide a consistent interpolation API.

Suppose you made a plugin to generate a `coverImage` property for each article

```javascript
import {
  each,
  keys
} from 'lodash'
import metalsmith from 'metalsmith'
import interpolate from 'metalsmith-interpolate'

metalsmith()
...
.use((files, metalsmith, done) => {
  each(multimatch(keys(files), 'articles/**.*'), (src) => {
    files[src].coverImage = interpolate('images/{name}.jpg', src, files)
  })
})
.build()

```

## tokens
-----

### from path

properties returned by `path.parse`:

```
┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
"  /    home/user/dir / file  .txt "
└──────┴──────────────┴──────┴─────┘
```


 - *{base}* name & ext
 - *{name}*
 - *{ext}* includes the `.` in `.txt`
 - *{dir}* path from src directory

### from meta

any properties from the metalsmith `files` structure can be used as tokens

### from moment

basically any format tokens
[from moment](http://momentjs.com/docs/#/displaying/) including only characters
defined by `/[MDY\-_\.\/]/`. So `{YYYY/MMMM}` returns `2016/October` or
whatever.

If a `date` field is set in a file's frontmatter, then that value will be used,
otherwise `ctime` (file created time) is used instead. Note that moment can
only parse dates formatted in limited ways.

## custom tokens
-----

### simple value tokens

You can add multiple objects to the interpolate arguments to make those
properties available as tokens.

```javascript
metalsmith()
...
.use((files, metalsmith, done) => {
  each(multimatch(keys(files), 'articles/**.*'), (src) => {
    let dimensions = {
      width: 200,
      height: 300
    }
    files[src].coverImage = interpolate(
      'images/{name}_{width}_{height}.jpg',
      src,
      files,
      dimensions
    )
  })
})
.build()
```

### calculated values

You can also add custom a custom resolver function

```javascript
import { interpolate, resolvers } from 'metalsmith-interpolate'

resolvers.unshift((token, meta) => if (token == 'firstTag') return meta.tags[0])

metalsmith()
...
.use((files, metalsmith, done) => {
  each(multimatch(keys(files), 'articles/**.*'), (src) => {
    files[src].title = interpolate('{title} ({firstTag})', src, files)
  })
})
.build()
```

The `meta` argument passed to resolvers contains meta from metalsmith files
structure, plus `path` property, plus any additional properties you passed in.

The first resolver in the array which returns either a truthy value *or* an 0
length string will be substituted for a given token.

## slugify on the fly

prefix a token with `-` or `_` like `{-title}` to slugify the token's value.

## node 4 LTS

`var mimeType = require('metalsmith-interpolate/dist/node4')`

## Author

Levi Wheatcroft <levi@wht.cr>

## Contributing

Contributions welcome; Please submit all pull requests against the master
branch.

## License

[MIT](http://opensource.org/licenses/MIT)
