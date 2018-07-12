/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

import {isGreekLetter} from './tokens/greek-letters';

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
    ['mathrm', null],
    ['infty', 'inf'],

]);

// override macro type by setting an
export const MACROS_OVERRIDE = new Map([
    ['cdot', {type: 'operator', operatorType: 'infix', value: '*'}],
    ['times', {type: 'operator', operatorType: 'infix', value: '*'}],
    ['ast', {type: 'operator', operatorType: 'infix', value: '*'}],

    ['div', {type: 'operator', operatorType: 'infix', value: '/'}],
    ['mod', {type: 'operator', operatorType: 'infix', value: '%'}],
    ['pm', {type: 'operator', operatorType: 'infix', value: '+-'}], // The sign ± dosn't work with Maxima.

    // ['infty', {type: 'token', value: 'inf'}],
]);

export function isMacro(macroName) {
    let isMatch = false;
    let macro = MACROS.get(macroName);
    if(macro !== undefined) {
        isMatch = true;
    }

    /*if (isGreekLetter(macroName)) {
        isMatch = true;
    }*/


    return isMatch;
}