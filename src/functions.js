/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

import * as logger from "./logger";


export const FUNCTIONS = new Map([
    ['lg', null],
    ['log', null],
    ['ln', null],
    ['sqrt', null],
    ['max', null],
    ['min', null],
    ['sum', null],
    ['lim', null],
    ['int', 'integral'],
    ['binom', null],
    ['abs', null],

    ['arccos', 'acos'],
    ['arccosh', 'acosh'],
    ['arccot', 'acot'],
    ['arccoth', 'acoth'],
    ['arccsc', 'acsc'],
    ['arccsch', 'acsch'],
    ['arcsec', 'asec'],
    ['arcsech', 'asech'],
    ['arcsin', 'asin'],
    ['arcsinh', 'asinh'],
    ['arctan', 'atan'],
    ['arctanh', 'atanh']
]);

export const TRIGONOMETRIC_FUNCTIONS = [
    {
        name: 'cos',
        inverse: 'acos'
    },
    {
        name: 'cosh',
        inverse: 'acosh'
    },
    {
        name: 'cot',
        inverse: 'acot'
    },
    {
        name: 'coth',
        inverse: 'acoth'
    },
    {
        name: 'csc',
        inverse: 'acsc'
    },
    {
        name: 'csch',
        inverse: 'acsch'
    },
    {
        name: 'sec',
        inverse: 'asec'
    },
    {
        name: 'sech',
        inverse: 'asech'
    },
    {
        name: 'sin',
        inverse: 'asin'
    },
    {
        name: 'sinh',
        inverse: 'asinh'
    },
    {
        name: 'tan',
        inverse: 'atan'
    },
    {
        name: 'tanh',
        inverse: 'atanh'
    }
];

export function isFunction(functionName) {
    let isMatch = false;

    if (isTrigonometricFunction(functionName)) {
        isMatch = true;
    } else {
        let func = FUNCTIONS.get(functionName);

        if (func !== undefined) {
            isMatch = true;
        }
    }
    return isMatch;
}

export function getFunctionName(functionName) {
    let func;

    if (isTrigonometricFunction(functionName)) {
        func = functionName;
    } else {
        func = FUNCTIONS.get(functionName);

        if (func === null) {
            func = functionName;

        } else if (func === undefined) {
            throw new Error('Not recognised function: ' + func);
        }
    }

    return func;
}


export function isTrigonometricFunction(func) {
    let name = TRIGONOMETRIC_FUNCTIONS.find((e) => e.name === func);
    let inverse = TRIGONOMETRIC_FUNCTIONS.find((e) => e.inverse === func);

    return name !== undefined || inverse !== undefined;
}


export function getInverseTrigonometricFunction(func) {
    logger.debug('Getting the inverse of the function "' + func + '"');

    let inverseTrig;
    let foundInverseTrig = false;

    let i = 0;

    for (let key in TRIGONOMETRIC_FUNCTIONS) {

        if (TRIGONOMETRIC_FUNCTIONS[key].name === func) {
            foundInverseTrig = true;
            inverseTrig = TRIGONOMETRIC_FUNCTIONS[key].inverse;

        } else if (TRIGONOMETRIC_FUNCTIONS[key].inverse === func) {
            foundInverseTrig = true;
            inverseTrig = TRIGONOMETRIC_FUNCTIONS[key].name

        }
        i++;
    }

    if (inverseTrig === undefined) return null;

    logger.debug('- Found the inverse: ' + inverseTrig);
    return inverseTrig;
}
