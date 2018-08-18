/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

import {environmentLength} from "./handlers/environment";
import {getLimitLength} from "./handlers/common";
import {assertNotUndefined, getExpressionLength} from "./handlers/common";
import {isMacro, MACROS} from '../macros';
import {handleMatrix} from "./handlers/matrix";
import {buildMaximaFunctionString} from "../helpers/helpers";
import {findIntegralEnd, handleUpperAndLowerArgs} from "./handlers/integration";
import {handleLowerSumArguments, handleUpperAndLowerArgsSum} from "./handlers/sum";
import {handleLimitArguments} from "./handlers/limit";
import {getOptions} from "../options";
import * as logger from "../logger";
import {convertSymbols, getName, getSymbol, isGreekLetter} from "../tokens/greek-letters";


/**
 * Will transpile a mathematical expression representation, derived from LaTeX,
 * to the corresponding language form required by Maxima.
 * Eg. 2*(3*4+4**2)/(sqrt(5))-8
 *
 * @param  {object} parsedLatex An object parsed by "./parser.js"
 * @return string The string representation of a mathematical expression in Maxima format, derived from LaTeX
 */
export function transpiler(parsedLatex) {
    logger.debug("\n------------------ TRANSPILING -> -------------------");
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

                    if (allKeysMatch === true) isPass = false;
                });

                if (options.addTimesSign && isPass) {
                    logger.debug('Adding * before ' + item.type + ': ' + item.value + ', previous item: ' + parsedLatex[index - 1].type);
                    transpiledString += '*';
                }
            }
        }


        function doOperator() {
            const previousToken = parsedLatex[index - 1];


            if (index === 0 && (item.value === '+' || item.value === '*')) {
                logger.debug('Structure starts with * or +, ignoring');
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
                throw new Error('Operator ' + item.value + ' is an invalid end character in ' + getCurrentTranspiledString());
            }
        }


        function doNumber() {
            addTimesSign(index, {type: 'number'}, {type: 'operator', operatorType: 'infix'});
            transpiledString += item.value;
        }

        function doVariable() {
            let variableString = "";
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

            addTimesSign(index, {type: 'function'}, {type: 'operator'});

            transpiledString += transpiler(item.value);
        }

        function doToken() {

            logger.debug('Handling token: ' + item.value);

            let tokenString = "";
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
                    logger.debug("Skipping macro " + item.value)
                } else if (macro !== undefined) {
                    logger.debug("Adding macro " + macro);
                    tokenString += macro;
                }
            }


            // Handle fraction
            if (item.value === 'frac') {
                // TODO 1+\frac{1}{2} causes a problem, results in 1+*(1)/(2)

                if (parsedLatex[index + 1].type === 'group' && parsedLatex[index + 2].type === 'group') {
                    logger.debug('Found fraction');
                    tokenString += transpiler(parsedLatex[index + 1].value) + '/' + transpiler(parsedLatex[index + 2].value);
                    index += 2;
                } else {
                    throw new Error('Fraction must have 2 following parameters');
                }
            }


            if (startIndex > 0 && tokenString !== "" && (isMacro(item.value) || isGreekLetter(item.value))) {
                addTimesSign(startIndex, {type: 'operator'});
            }


            transpiledString += tokenString;
        }

        function doFunction() {

            addTimesSign(index, {type: 'operator'});


            const nextItem = parsedLatex[index + 1];

            if (item.value === 'sqrt') {
                // TODO review nthroot -> \sqrt[3]{2x+3} = (2x+3)^(1/3)
                if (parsedLatex[index + 1].type === 'group') {
                    let sqrtString = "";
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

            } else if (nextItem.type === 'number' || nextItem.type === 'variable') {
                logger.debug('Found literal "function"');

                transpiledString += item.value;
                transpiledString += '(';
                transpiledString += nextItem.value;
                transpiledString += ')';
                index++;
            } else {
                transpiledString += item.value;

            }


            function handleBinomial() {
                // TODO doesn't handle \binom234 as 2 and 3 needs to be parsed as single digits... this is a parser problem...
                let binomialString = "";
                let expression1 = "";
                let expression2 = "";

                let expr1 = parsedLatex[index + 1].type;
                let expr2 = parsedLatex[index + 2].type;

                if (expr1 === 'group' && expr2 === 'group') {
                    expression1 += transpiler(parsedLatex[index + 1].value);
                    expression2 += transpiler(parsedLatex[index + 2].value);
                } else {
                    throw new Error('Binomial must have 2 following groups');
                }

                binomialString += buildMaximaFunctionString(
                    'binomial', expression1, expression2
                );

                transpiledString += binomialString;
                index += 2;
            }

            function handleLimit() {
                // TODO: review: first arg in limit isn't recognized if it is a multi char variable and onlySingleVariables option is true

                let limitString = '';
                let expression = '';


                if (parsedLatex[index + 1].value === '_' && parsedLatex[index + 2].type === 'group') {
                    let limitArgs = parsedLatex[index + 2].value;
                    limitArgs = handleLimitArguments(limitArgs);

                    if (typeof parsedLatex[index + 3] !== 'undefined') {
                        let limitLength = getExpressionLength(parsedLatex.slice((index + 3)));

                        expression += transpiler(parsedLatex.slice((index + 3), ((index + 3) + limitLength)));
                        index += (limitLength - 1);

                    } else {
                        throw new Error('Missing argument in limit')
                    }

                    limitString = buildMaximaFunctionString(
                        'limit', expression, limitArgs.variable, limitArgs.value, limitArgs.direction
                    );

                    index += 3;

                } else {
                    throw new Error('Limit must have a "from" and "to" value');
                }
                transpiledString += limitString;
            }

            function handleSum() {
                let sumString = '';
                let expression = "";
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
                    let sumLength = getExpressionLength(parsedLatex.slice((index + 1)));

                    expression += transpiler(parsedLatex.slice((index + 1), ((index + 1) + sumLength)));
                    index += (sumLength);

                } else {
                    throw new Error('Missing argument in sum')
                }

                sumString += buildMaximaFunctionString(
                    'sum', expression, indexVariable, lowerArgAssignment, upperArg
                );

                transpiledString += sumString;
            }

            function handleIntegral() {
                let integralString = '';
                let expression = "";
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
                        'integrate', expression, integrationVariable
                    );

                } else {
                    integralString += buildMaximaFunctionString(
                        'integrate', expression, integrationVariable, lowerLimit, upperLimit
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


                if (item.value === 'matrix') {
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

    if (transpiledString === '') throw new Error('EMPTY'); //TODO FIX, possibly remove

    return transpiledString;
}