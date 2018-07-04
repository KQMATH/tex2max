/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define(['./tokens/greek-letters'], function (greekLetters) {

    const MACROS = [
        'begin', 'end', 'to', 'cdot', 'times', 'ast', 'div', 'mod', 'pm', 'frac', 'mathrm'
    ];

    // override macro type by setting an
    const MACROS_OVERRIDE = new Map([
        ['cdot', {type: 'operator', operatorType: 'infix', value: '*'}],
        ['times', {type: 'operator', operatorType: 'infix', value: '*'}],
        ['ast', {type: 'operator', operatorType: 'infix', value: '*'}],

        ['div', {type: 'operator', operatorType: 'infix', value: '/'}],
        ['mod', {type: 'operator', operatorType: 'infix', value: '%'}],
        ['pm', {type: 'operator', operatorType: 'infix', value: '+-'}], // The sign ± dosn't work with Maxima.
    ]);

    function isMacro(macroName) {
        let i = 0;
        let isMatch = false;
        while (i < MACROS.length && !isMatch) {
            if (MACROS[i] === macroName) {
                isMatch = true;
            }
            i++;
        }

        if (greekLetters.isGreekLetter(macroName)) {
            isMatch = true;
        }


        return isMatch;
    }

    return {
        isMacro: isMacro,
        MACROS: MACROS,
        MACROS_OVERRIDE: MACROS_OVERRIDE
    };
});