# TeX2Max
[![npm version](http://img.shields.io/npm/v/tex2max.svg?style=flat)](https://npmjs.org/package/tex2max "View this project on npm")
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/KQMATH/tex2max.svg?)](https://lgtm.com/projects/g/KQMATH/tex2max/context:javascript)

TeX2Max is a JavaScript library for converting LaTeX math to Maxima code.

## Environments in which to use TeX2Max
TeX2Max supports Node and AMD, in addition to normal browser support.

## Main
```text
lib/
├── tex2max.amd.js        (AMD)
├── tex2max.js            (UMD)
└── tex2max.common.js     (CommonJS, default)
```

## Getting started

### Installation

```shell
npm install tex2max
```

In browser:

```html
<script src="/path/to/tex2max.js"></script>
```

The [unpkg](https://unpkg.com) provides CDN support for tex2max.js's JavaScript. You can find the links [here](https://unpkg.com/tex2max).

Alternativeley, you can download the [latest standalone JavaScript files (ES5)](https://github.com/KQMATH/tex2max/releases/latest)

### Usage
#### Syntax
```
new tex2max(options)
```
* options (optional)
  * Type: Object
  * The options for the converter. Check out the available [options](#options).

#### Examples
##### Node
```js
const TeX2Max = require('tex2max');
const converter = new TeX2Max(options);
```

##### AMD
```js
define(['./path/to/tex2max.amd'], function(TeX2Max) {
    const converter = new TeX2Max(options);
});
```

##### Window
```js
const TeX2Max = window.tex2max;
const converter = new TeX2Max(options);
```
[⬆ back to top](#tex2max)

## Options
The TeX2Max class also support multiple optional configurations. These should be passed as an object to the TeX2Max class object. If no manual configurations are set, default options are used.

### onlySingleVariables
- Type: `Boolean`
- Default: `false`

Enable to only allow single variable names.

### handleEquation
- Type: `Boolean`
- Default: `false`

Enable to let Maxima [solve](http://maxima.sourceforge.net/docs/manual/maxima_20.html#solve) an algebraic equation.

### addTimesSign
- Type: `Boolean`
- Default: `true`

Add multiplication sign where multiplication is implied.

### disallowDecimalPoints
- Type: `Boolean`
- Default: `false`

Enable to disallow decimal point separators `.` in numbers.

### disallowllowDecimalCommas
- Type: `Boolean`
- Default: `false`

Enable to disallow decimal comma separators `,` in numbers.

### onlyGreekName
- Type: `Boolean`
- Default: `false`

Enable to convert all greek letters to names.

### onlyGreekSymbol
- Type: `Boolean`
- Default: `false`

Enable to convert all greek letters to symbols.

### debugging
- Type: `Boolean`
- Default: `false`

Enable to produce debugging info.

## Methods

### toMaxima(latex)
- **latex**:
  - Type: `String`
  - LaTeX math string.

- (return value):
  - Type: `String`
  - Maxima code string.

Convert LaTeX math into Maxima code.

### updateOptions(options)
- **options** (optional):
  - Type: Object
  - Default: See the defaults for all the [options](#options).
  - The options for the converter. Check out the available [options](#options).

Update the converter options.

**Note:** This resets all settings. If one or more settings passed as parameter are missing, defaults will be used.

### getLastInput()

Get the latest latex input.

### getLastResult()

Get the latest conversion result.

## Build instructions

Clone a copy of the main TeX2Max git repo by running:

```bash
git clone git://github.com/KQMATH/tex2max.git
```

Enter the TeX2Max directory and run the build script:
```bash
npm run build
```

## Feedback:
**Project lead:** Hans Georg Schaathun <hasc@ntnu.no>

**Developer:** [André Storhaug](https://github.com/andstor) <andr3.storhaug@gmail.com>

## License
TeX2Max is Licensed under the [GNU General Public, License Version 3](https://github.com/KQMATH/tex2max/blob/master/LICENSE).

[⬆ back to top](#tex2max)
