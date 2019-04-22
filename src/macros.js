/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */


export const MACROS = new Map([
    ['begin', null],
    ['end', null],
    ['to', null],
    ['cdot', null],
    ['times', null],
    ['ast', null],
    ['div', null],
    ['mod', null],
    ['pm', null],
    ['frac', null],
    ['infty', 'inf'],
    ['operatorname', null],

    // ['mathrm', null],
]);


export const IGNORED_MACROS = [];


// Override macro nodes
export const MACROS_OVERRIDE = new Map([
    ['cdot', {type: 'operator', operatorType: 'infix', value: '*'}],
    ['times', {type: 'operator', operatorType: 'infix', value: '*'}],
    ['ast', {type: 'operator', operatorType: 'infix', value: '*'}],

    ['div', {type: 'operator', operatorType: 'infix', value: '/'}],
    ['mod', {type: 'operator', operatorType: 'infix', value: '%'}],
    ['pm', {type: 'operator', operatorType: 'infix', value: '+-'}], // The sign ± dosn't work with Maxima.


]);

export function isMacro(macroName) {
    let isMatch = false;
    let macro = MACROS.get(macroName);
    if(macro !== undefined) {
        isMatch = true;
    }

    return isMatch;
}

export function isIgnoredMacro(macroName) {
    let isMatch = false;

    let i = 0;
    while (!isMatch && i < IGNORED_MACROS.length) {
        if (macroName === IGNORED_MACROS[i]) {
            isMatch = true;
        }
        i++;
    }

    return isMatch;
}