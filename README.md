# TeX2Max
TeX2Max is a JavaScript library for converting LaTeX math to Maxima code.

## Environments in which to use TeX2Max
TeX2Max supports AMD and CommonJS, in addition to normal browser support.

## Usage
Download the [latest standalone JavaScript file (ES5)](https://github.com/KQMATH/tex2max/releases/latest)

#### AMD
```js
define(['./path/to/TeX2Max'], function(TeX2Max_Module) {
    const converter = new TeX2max_Module.TeX2Max();
});
```

#### Window
```js
const config = {};
const converter = new tex2max.TeX2Max();
```

The TeX2Max class also support multiple optional configurations. These should be passed as an object to the TeX2Max class object.
#### Default options
```js
const config = {
        onlySingleVariables: false,
        handleEquation: false,
        addTimesSign: true,
    };
```

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
**Project lead:** Hans Georg Schaathun: <hasc@ntnu.no>

**Developer:** André Storhaug: <andr3.storhaug+code@gmail.com>

## License
Stack is Licensed under the [GNU General Public, License Version 3](https://github.com/KQMATH/tex2max/blob/master/LICENSE).