/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

import * as logger from "../logger";

/**
 * Whether or not the object is an equation or an expression
 * @return {boolean} true if expression
 */
export function isEquation(parsedLatex) {
    let numEqualSigns = 0;

    parsedLatex.forEach(e => {
        if (e.type === 'operator' && e.value === '=') {
            numEqualSigns++;
        }
    });

    if (numEqualSigns === 1) {
        return true;
    } else if (numEqualSigns > 1) {
        throw new Error('Expression contains more than one equal signs');
    } else {
        return false;
    }
}


/**
 * Check if an mathematical expression passed as an array of tokens
 * contains any variables.
 *
 * @param {(string|Array)} parsedLatex Mathematical expression composed of an array of tokens
 * @return {boolean} Returns true if parsedLatex parameter contains any variables.
 */
export function checkForVariable(parsedLatex) {
    logger.debug('Checking expression ' + JSON.stringify(parsedLatex) + ' for variable');
    let containsVariable = false;


    if (Array.isArray(parsedLatex)) {
        for (let i = 0; i < parsedLatex.length; i++) {
            if (parsedLatex[i].type === 'group') {
                let containsGroupVariable = checkForVariable(parsedLatex[i].value);
                if (containsGroupVariable) {
                    containsVariable = true;
                }
            } else {
                if (parsedLatex[i].type === 'variable') {
                    containsVariable = true;
                }
            }
        }
    } else {
        if (parsedLatex.type === 'variable') {
            containsVariable = true;
        } else {
            containsVariable = false;
        }
    }
    return containsVariable;
}


export function buildMaximaFunctionString(functionName, expression, ...arg) {

    let maximaFunctionString = "";
    maximaFunctionString += functionName + '(' + expression;
    arg.forEach(e => {
        if (e !== false && e !== null && e !== undefined) {
            maximaFunctionString += ',' + e;
        }
    });
    maximaFunctionString += ')';

    return maximaFunctionString;
}


/**
 * Search for an object key value's first occurrence in an array passed as parameter,
 * matching the type and string passed as parameters.
 *
 * @param {(Object|Array)} parsedLatex Mathematical expression composed of an array of tokens
 * @param {string} tokenType The type to search for. Either 'type' or 'value'
 * @param {string} query The string to search for
 * @param {boolean} deepSearch Whether or not to search in all array dimensions
 * @return {Object<string, Array<number|...Array<number>>>} Returns true if search criteria matches, false otherwise
 */
export function searchForOccurrence(parsedLatex, tokenType, query, deepSearch) {

    let isPresent = false;
    let isPresentInGroup = false;
    let position = [];

    if (Array.isArray(parsedLatex)) {

        for (let i = 0; i < parsedLatex.length; i++) {
            if (parsedLatex[i].type === 'group' && deepSearch) {
                let group;
                if (tokenType === 'type') {
                    group = searchForOccurrence(parsedLatex[i].type, 'type', query, true);
                    isPresentInGroup = group.isPresent;
                } else if (tokenType === 'value') {
                    group = searchForOccurrence(parsedLatex[i].value, 'value', query, true);
                    isPresentInGroup = group.isPresent;

                }
                if (isPresentInGroup) {
                    position.push(group.position);
                    isPresent = true;
                }

            } else {
                if (tokenType === 'type') {
                    if (parsedLatex[i].type === query) {
                        isPresent = true;
                        position.push(i);
                    }
                } else if (tokenType === 'value') {
                    if (parsedLatex[i].value === query) {
                        isPresent = true;
                        position.push(i);

                    }
                }
            }
        }
    } else {

        if (tokenType === 'type') {
            if (parsedLatex.type === query) {
                isPresent = true;
                position = 0;
            }

        } else if (tokenType === 'value') {
            if (parsedLatex.value === query) {
                isPresent = true;
                position = null;
            }

        } else {
            isPresent = false;
        }
    }

    let isPresentObj = {
        isPresent: isPresent,
        position: position
    };
    return isPresentObj;
}

export function wrapForTranspilation(item) {
    if (Array.isArray(item)) {
        return item;
    } else if (typeof item === "object" && typeof item !== "string") {
        return [item];
    }
}

export function stripParenthesis(mathString) {
    let openingParenthesis = mathString.charAt(0);
    let closingParenthesis = mathString.charAt(-1);
    if (openingParenthesis.match(/[({\[]/) || closingParenthesis.match(/[)}\]]/)) {
        return mathString.substr(1, mathString.length - 2);
    } else {
        return mathString;
    }
}

export function stripAllParenthesis(mathString) {
    return mathString.replace(/[()]/g, '');
}
