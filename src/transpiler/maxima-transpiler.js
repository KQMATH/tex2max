/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

import {environmentLength} from './handlers/environment';
import {assertNotUndefined, getExpressionLength} from './handlers/common';
import {isMacro, MACROS} from '../macros';
import {handleMatrix} from './handlers/matrix';
import {buildMaximaFunctionString, stripAllParenthesis, stripParenthesis, wrapForTranspilation} from '../helpers/helpers';
import {findIntegralEnd, handleUpperAndLowerArgs} from './handlers/integration';
import {handleLowerSumArguments, handleUpperAndLowerArgsSum} from './handlers/sum';
import {handleLimitArguments} from './handlers/limit';
import {getOptions} from '../options';
import * as logger from '../logger';
import {getName, getSymbol, isGreekLetter} from '../tokens/greek-letters';
import {getInverseTrigonometricFunction, isTrigonometricFunction} from '../functions';
import {isMatrixEnvironment} from '../environments';

/**
 * Will transpile a mathematical expression representation, derived from LaTeX,
 * to the corresponding language form required by Maxima.
 * Eg. 2*(3*4+4**2)/(sqrt(5))-8
 *
 * @param  {object} parsedLatex An object parsed by "./parser.js"
 * @return string The string representation of a mathematical expression in Maxima format, derived from LaTeX
 */
export function transpiler(parsedLatex) {
    logger.debug('\n------------------ TRANSPILING -> -------------------');
    const options = getOptions();

    let transpiledString = '';
    let index = 0;

    transpiledString += '(';

    for (index; index < parsedLatex.length; index++) {
        const item = parsedLatex[index];

        switch (item.type) {

            case 'operator':
                doOperator();
                break;
            case 'number':
                doNumber();
                break;
            case 'float':
                doFloat();
                break;
            case 'variable':
                doVariable();
                break;
            case 'group':
                doGroup();
                break;
            case 'token':
                doToken();
                break;
            case 'function':
                doFunction();
                break;
            case 'environment':
                doEnvironment();
                break;
        }

        function getCurrentTranspiledString() {
            return transpiledString.substring(1);
        }

        /**
         * Add times ("*") sign to transpiledString. If supplied with obj parameters with
         * types ex {type: 'function'}, {type: 'operator'}, times sign will not be added.
         * @param index
         * @param obj
         */
        function addTimesSign(index, ...obj) {
            let previousToken = parsedLatex[index - 1];
            let isPass = true;
            if (index > 0) {
                obj.forEach(e => {
                    let allKeysMatch = true;
                    for (let key in e) {
                        if (!e.hasOwnProperty(key)) {
                            continue;
                        }
                        if ((previousToken[key] !== e[key])) {
                            allKeysMatch = false;
                        }
                    }

                    if (allKeysMatch === true) {
                        isPass = false;
                    }
                });

                if (options.addTimesSign && isPass) {
                    logger.debug(
                        'Adding * before ' + item.type + ': ' + item.value + ', previous item: ' + parsedLatex[index - 1].type);
                    transpiledString += '*';
                }
            }
        }

        // TODO possible move operator checking to post-parser, since this is a parser job.
        function doOperator() {
            const previousToken = parsedLatex[index - 1];

            if (index === 0 && (item.value === '+')) {
                logger.debug('Structure starts with +, ignoring');
            } else if (index === 0 && item.operatorType !== 'prefix' && item.value !== '-') {// TODO add "-" as valid prefix
                throw new Error('Operator ' + item.value + ' is not an prefix operator');

            } else {
                if (item.value === '+' || item.value === '-') {
                    transpiledString += item.value;

                } else if (item.operatorType === 'postfix') {
                    if (previousToken.type !== 'operator') {
                        transpiledString += item.value;
                    } else {
                        throw new Error('Operator ' + item.value + ' has to be an postfix operator');
                    }

                } else if (item.operatorType === 'prefix') {
                    // transpiledString += item.value;

                } else if (item.operatorType === 'infix') {

                    if (previousToken.type !== 'operator' && previousToken.type !== 'operator') {
                        transpiledString += item.value;
                    } else {
                        throw new Error('Operator ' + item.value + ' has to be an infix operator');
                    }
                }
            }

            if ((item.operatorType === 'infix' || item.operatorType === 'prefix') && index === (parsedLatex.length - 1)) {
                throw new Error('Operator ' + item.value + ' is an invalid end character.');
            }
        }

        function doNumber() {
            addTimesSign(index, {type: 'number'}, {type: 'float'}, {type: 'operator', operatorType: 'infix'});
            transpiledString += item.value;
        }

        function doFloat() {
            addTimesSign(index, {type: 'number'}, {type: 'float'}, {type: 'operator', operatorType: 'infix'});
            let float = item.value.replace(",", ".");
            transpiledString += float;
        }

        function doVariable() {
            let variableString = '';
            addTimesSign(index, {type: 'operator', operatorType: 'infix'});

            if (getName(item.value) !== null) {
                let letter = getName(item.value);
                if (options.onlyGreekSymbol) {
                    letter = getSymbol(letter);
                }
                logger.debug('greek letter ' + letter);
                variableString += letter;
            } else {
                variableString += item.value;
            }

            transpiledString += variableString;
        }

        function doGroup() {
            let groupString = '';

            addTimesSign(index, {type: 'function'}, {type: 'operator'});

            groupString += transpiler(item.value);

            if (item.symbol === 'vertical_bar') {
                groupString = stripParenthesis(groupString);
            }

            transpiledString += groupString;

        }

        function doToken() {

            logger.debug('Handling token: ' + item.value);

            let tokenString = '';
            let startIndex = index;

            if (getSymbol(item.value) !== null) {
                // Token is greek letter name
                let letter = item.value;
                if (options.onlyGreekSymbol) {
                    letter = getSymbol(letter);
                }
                logger.debug('greek letter ' + letter);
                tokenString += letter;
            }

            if (getName(item.value) !== null) {
                // Token is greek letter symbol
                let letter = item.value;
                if (options.onlyGreekName) {
                    letter = getName(letter);
                }
                logger.debug('greek letter ' + letter);
                tokenString += letter;
            }

            if (isMacro(item.value)) {
                let macro = MACROS.get(item.value);
                if (macro === null) {
                    logger.debug('Skipping macro ' + item.value);
                } else if (macro !== undefined) {
                    logger.debug('Adding macro ' + macro);
                    tokenString += macro;
                }
            }

            // Handle fraction
            if (item.value === 'frac') {
                if (parsedLatex[index + 1].type === 'group' && parsedLatex[index + 2].type === 'group') {
                    logger.debug('Found fraction');
                    tokenString += '(';
                    tokenString += transpiler(parsedLatex[index + 1].value) + '/' + transpiler(parsedLatex[index + 2].value);
                    tokenString += ')';
                    index += 2;
                } else {
                    throw new Error('Fraction must have 2 following parameters');
                }
            }

            if (startIndex > 0 && tokenString !== '' && (isMacro(item.value) || isGreekLetter(item.value))) {
                addTimesSign(startIndex, {type: 'operator'});
            }

            transpiledString += tokenString;
        }

        function doFunction() {

            addTimesSign(index, {type: 'operator'});

            const nextItem = parsedLatex[index + 1];

            if (item.value === 'sqrt') {
                if (parsedLatex[index + 1].type === 'group') {
                    let sqrtString = '';
                    if (parsedLatex[index + 1].symbol === 'square' && parsedLatex[index + 2].type === 'group') {
                        logger.debug('Found function nth-square root');
                        let nthArgString = transpiler(parsedLatex[index + 1].value);

                        sqrtString += transpiler(parsedLatex[index + 2].value);
                        sqrtString += '^(1/' + nthArgString + ')';
                        index++;

                    } else {
                        transpiledString += item.value;
                        logger.debug('Found function square root');
                        sqrtString += transpiler(parsedLatex[index + 1].value);

                    }

                    transpiledString += sqrtString;
                    index++;
                } else {
                    throw new Error('Square root must be followed by [] or {}');
                }
            } else if (item.value === 'lim') {
                logger.debug('Found function "limit"');
                handleLimit();

            } else if (item.value === 'binom') {
                logger.debug('Found function "binomial"');
                handleBinomial();

            } else if (item.value === 'sum') {
                logger.debug('Found function "sum"');
                handleSum();

            } else if (item.value === 'integral') {
                logger.debug('Found function "integral"');
                handleIntegral();

            } else if (item.value === 'abs') {
                logger.debug('Found function "abs"');
                handleAbs();

            } else if (isTrigonometricFunction(item.value)) {
                logger.debug('Found trigonometric function "' + item.value + '"');
                handleTrig();

            } else {
                logger.debug('Found normal "function"');
                handleNormalFunction();

            }

            function handleNormalFunction() {
                let expression = '';
                let func = item.value;

                assertNotUndefined(parsedLatex[index + 1], 'Missing argument in function: ' + func);
                expression += func;
                index++;

                if (parsedLatex[index].type === 'group') {
                    expression += transpiler(parsedLatex[index].value);
                    index++;

                } else if (parsedLatex[index].type === 'function') {
                    let {expressionLength} = getExpressionLength(parsedLatex.slice((index + 1)), ['function'], ['+', '-', '+-']);
                    expressionLength += 1;

                    expression += transpiler(wrapForTranspilation(parsedLatex.slice(index, (index + expressionLength))));
                    index += expressionLength - 1;

                } else {
                    let latexSlice = parsedLatex.slice(index);

                    let i;
                    for (i = 0; i < latexSlice.length; i++) {
                        if (latexSlice[i].type !== 'variable' && (latexSlice[i].type !== 'number' ||  latexSlice[i].type !== 'float')) {
                            break;
                        }
                    }

                    let expressionLength = i;
                    expression += transpiler(wrapForTranspilation(parsedLatex.slice(index, (index + expressionLength))));
                    index += expressionLength - 1;
                }

                transpiledString += expression;
            }

            function handleTrig() {
                let expression = '';
                let exponentiate = false;
                let exponent;

                let func = item.value;

                assertNotUndefined(parsedLatex[index + 1], 'Missing argument in function: ' + func);

                if (parsedLatex[index + 1].value === '^') {
                    exponentiate = true;
                    assertNotUndefined(parsedLatex[index + 2], 'Missing argument in function: ' + func + '^');

                    exponent = transpiler(wrapForTranspilation(parsedLatex[index + 2]));
                    exponent = stripParenthesis(exponent);

                    if (stripAllParenthesis(exponent) === '-1') {
                        logger.debug('Function is inverse');
                        exponentiate = false;

                        let inverseFunc = getInverseTrigonometricFunction(func);
                        if (inverseFunc !== null) {
                            func = inverseFunc;
                        } else {
                            throw new Error('No inverse trigonometric function found for ' + func);
                        }
                    }
                    index += 2;
                }

                expression += func;

                if (exponentiate) {
                    assertNotUndefined(parsedLatex[index + 1],
                        'Missing argument in function: ' + func + '^' + transpiler(wrapForTranspilation(parsedLatex[index])));
                } else {
                    assertNotUndefined(parsedLatex[index + 1], 'Missing argument in function: ' + func);
                }

                if (parsedLatex[index + 1].type === 'group') {
                    expression += transpiler(parsedLatex[index + 1].value);

                } else if (parsedLatex[index + 1].type === 'function') {
                    let {expressionLength} = getExpressionLength(parsedLatex.slice((index + 2)), ['function'], ['+', '-', '+-']);
                    expressionLength += 1;

                    expression += transpiler(
                        wrapForTranspilation(parsedLatex.slice((index + 1), ((index + 1) + expressionLength))));
                    index += expressionLength - 1;

                } else {
                    let {expressionLength} = getExpressionLength(parsedLatex.slice((index + 1)), ['function'], ['+', '-', '+-']);
                    expression += transpiler(
                        wrapForTranspilation(parsedLatex.slice((index + 1), ((index + 1) + expressionLength))));
                    index += expressionLength - 1;
                }

                if (exponentiate) {
                    expression = '(' + expression + ')' + '^' + exponent;
                }

                index++;

                transpiledString += expression;
            }

            function handleAbs() {
                let expression = '';
                let func = item.value;
                expression += func;
                expression += transpiler(wrapForTranspilation(parsedLatex[index + 1]));

                index++;

                transpiledString += expression;

            }

            function handleBinomial() {
                // TODO doesn't handle \binom234 as 2 and 3 needs to be parsed as single digits... this is a parser problem...
                let binomialString = '';
                let expression1 = '';
                let expression2 = '';

                let expr1 = parsedLatex[index + 1].type;
                let expr2 = parsedLatex[index + 2].type;

                if (expr1 === 'group' && expr2 === 'group') {
                    expression1 += transpiler(parsedLatex[index + 1].value);
                    expression2 += transpiler(parsedLatex[index + 2].value);
                } else {
                    throw new Error('Binomial must have 2 following groups');
                }

                binomialString += buildMaximaFunctionString(
                    'binomial', expression1, expression2,
                );

                transpiledString += binomialString;
                index += 2;
            }

            function handleLimit() {
                // TODO: review: first arg in limit isn't recognized if it is a multi char variable and onlySingleVariables option
                // is true

                let limitString = '';
                let expression = '';

                if (parsedLatex[index + 1].value === '_' && parsedLatex[index + 2].type === 'group') {
                    let limitArgs = parsedLatex[index + 2].value;
                    limitArgs = handleLimitArguments(limitArgs);

                    if (typeof parsedLatex[index + 3] !== 'undefined') {
                        let {expressionLength: limitLength} = getExpressionLength(parsedLatex.slice((index + 3)), [],
                            ['+', '-', '+-']);

                        expression += transpiler(parsedLatex.slice((index + 3), ((index + 3) + limitLength)));
                        index += (limitLength - 1);

                    } else {
                        throw new Error('Missing argument in limit');
                    }

                    limitString = buildMaximaFunctionString(
                        'limit', expression, limitArgs.variable, limitArgs.value, limitArgs.direction,
                    );

                    index += 3;

                } else {
                    throw new Error('Limit must have a "from" and "to" value');
                }
                transpiledString += limitString;
            }

            function handleSum() {
                let sumString = '';
                let expression = '';
                let lowerArgAssignment, upperArg;
                let indexVariable = '';

                if (parsedLatex[index + 1].value !== '_' && parsedLatex[index + 1].value !== '^') {
                    throw new Error('Sum does not contain the correct number of arguments');

                } else {
                    let integrationLimits = handleUpperAndLowerArgsSum(parsedLatex.slice((index + 1)));
                    let lowerArg = integrationLimits.lowerLimit.value;
                    upperArg = integrationLimits.upperLimit;
                    index += 4;

                    lowerArg = handleLowerSumArguments(lowerArg);
                    indexVariable = lowerArg.variable;
                    lowerArgAssignment = lowerArg.value;

                    logger.debug('Sum: arguments are form ' + lowerArgAssignment + ' to ' + upperArg);
                }

                if (typeof parsedLatex[index + 1] !== 'undefined') {
                    let {expressionLength: sumLength} = getExpressionLength(parsedLatex.slice((index + 1)), [], ['+', '-', '+-']);

                    expression += transpiler(parsedLatex.slice((index + 1), ((index + 1) + sumLength)));
                    index += (sumLength);

                } else {
                    throw new Error('Missing argument in sum');
                }

                sumString += buildMaximaFunctionString(
                    'sum', expression, indexVariable, lowerArgAssignment, upperArg,
                );

                transpiledString += sumString;
            }

            function handleIntegral() {
                let integralString = '';
                let expression = '';
                let lowerLimit, upperLimit;
                let integrationVariable = '';
                let integralLength;
                let isSymbolic = false;

                assertNotUndefined(parsedLatex[index + 1], 'Missing argument in integral');

                if (parsedLatex[index + 1].value !== '_' && parsedLatex[index + 1].value !== '^') {
                    // Symbolic integral
                    logger.debug('Integral is symbolic');
                    isSymbolic = true;

                    index++;

                } else {
                    // Finite integral
                    let integralArgs = parsedLatex.slice(index + 1, index + 5);
                    let integrationLimits = handleUpperAndLowerArgs(integralArgs);
                    lowerLimit = integrationLimits.lowerLimit;
                    upperLimit = integrationLimits.upperLimit;
                    logger.debug('Integration limits are from ' + lowerLimit + ' to ' + upperLimit);

                    index += 5;
                }

                let integralEnd = findIntegralEnd(parsedLatex.slice(index));

                integrationVariable += integralEnd.variable;
                integralLength = integralEnd.length;

                let unTranspiledIntegralLatex = parsedLatex.slice((index), ((index) + integralLength));
                assertNotUndefined(unTranspiledIntegralLatex[unTranspiledIntegralLatex.length - 1], 'Missing argument in integral');

                if (unTranspiledIntegralLatex[unTranspiledIntegralLatex.length - 1].value === '*') {
                    unTranspiledIntegralLatex.splice(-1, 1);
                }

                expression += transpiler(unTranspiledIntegralLatex);

                index += (integralLength);

                if (isSymbolic) {
                    integralString += buildMaximaFunctionString(
                        'integrate', expression, integrationVariable,
                    );

                } else {
                    integralString += buildMaximaFunctionString(
                        'integrate', expression, integrationVariable, lowerLimit, upperLimit,
                    );

                }

                transpiledString += integralString;
            }

        }

        function doEnvironment() {
            if (item.state === 'begin') {

                addTimesSign(index, {type: 'operator'});

                let expression = '';
                let envLength = environmentLength(parsedLatex.slice((index)));

                if (isMatrixEnvironment(item.value)) {
                    logger.debug('Found matrix environment');
                    expression += handleMatrix(parsedLatex.slice((index + 1), (index + 1) + envLength));
                }

                index += (envLength + 1);
                transpiledString += expression;

            } else if (item.state === 'end') {
                index++;
            }
        }
    }

    transpiledString += ')';

    if (/(\([ ]*\))/.test(transpiledString)) {
        throw new Error('Syntax error');
    }

    if (transpiledString === '') {
        throw new Error('EMPTY');
    } //TODO FIX, possibly remove

    return transpiledString;
}
