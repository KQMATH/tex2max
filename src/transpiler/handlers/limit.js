/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */


import {checkForVariable, searchForOccurrence, wrapForTranspilation} from "../../helpers/helpers";
import {transpiler} from "../maxima-transpiler";
import * as logger from "../../logger";

export function handleLimitArguments(limitArgs) {

    if (!checkForVariable(limitArgs[0])) {// Control for several expression before 'to'
        throw new Error('Limit: "From" argument must be a symbol');
    } else if (!searchForOccurrence(limitArgs[1], 'value', 'to', false).isPresent) {
        throw new Error('Limit: no "to" token provided')
    } else if (limitArgs[2] === undefined) {
        throw new Error('Limit: "To" argument missing')
    }

    let variable = limitArgs[0].value;
    let upperLim = limitArgs.slice(2);
    let value = "";

    value += transpiler(wrapForTranspilation(upperLim));

    let direction = isOneSidedLimit(limitArgs.slice(2));

    return {
        variable: variable,
        value: value,
        direction: direction
    };
}


export function isOneSidedLimit(expression) {
    logger.debug('Checking if limit is one sided');

    let isOneSided = false;
    let sideSymbol = '';
    let side = '';

    for (let i = 0; i < expression.length; i++) {
        if (expression[i].type === 'group') {
            let isOneSidedGroup = isOneSidedLimit(expression[i].value);

            if (isOneSidedGroup !== false) {
                isOneSided = true;
                side = isOneSidedGroup;
            }
        }
        if ((expression[i].value === '+' || expression[i].value === '-') && (i + 1) >= expression.length) {
            isOneSided = true;
            sideSymbol = expression[i].value;

        }
    }

    if (isOneSided) {
        side = sideSymbol === '+' ? 'plus' : 'minus';
        logger.debug('- Limit is one-sided from the ' + side + ' side');
    } else {
        logger.debug('- Limit is not one-sided');
    }

    return isOneSided ? side : false;
}
