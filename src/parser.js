/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

import {isIgnoredMacro, isMacro, MACROS_OVERRIDE} from "./macros";
import {getFunctionName, isFunction} from "./functions";
import {isEnvironment} from "./environments";
import {TOKEN_TYPES} from "./tokens/tokens";
import {RESERVED_WORDS} from "./reservedWords";
import {getOptions} from "./options";
import * as logger from './logger';
import {isGreekLetter} from "./tokens/greek-letters";
import {isDelimiter} from './delimiters';


export function parseLatex(tokens) {
    const options = getOptions();
    logger.debug("\n------------------ PARSING -> -------------------");

    let index = 0;
    let structure = [];

    function addNode(obj) {
        if (checkArray(obj)) {
            structure.push(...obj);
        } else {
            structure.push(obj);

        }
    }

    function checkArray(value) {
        return value && typeof value === 'object' && value.constructor === Array;
    }

    function consume() {
        logger.debug("Consuming position: " + index);
        return tokens[index++].value;
    }

    function skipToken() {
        logger.debug("Skip token at position: " + index);
        return tokens[index++].value;
    }

    function getCurrentChar() {
        return tokens[index] ? tokens[index].value : undefined;
    }

    function getCurrentType() {
        return tokens[index].type.name;
    }

    function getCurrentTypeSymbol() {
        return tokens[index].type.symbol;
    }

    function peek() {
        return tokens[index + 1];
    }

    function peekType() {
        return tokens[index + 1] ? tokens[index + 1].type.name : null;
    }

    function peekValue() {
        return tokens[index + 1].value;
    }

    function lookBackValue() {
        let previousToken = tokens[index - 1];
        return previousToken ? previousToken.value : null;
    }

    function lookBack(position) {
        let previousToken = structure[structure.length - position];
        return previousToken ? previousToken.type : null;
    }

    function getRemainingTokens() {
        return tokens.slice(index + 1);
    }

    function parseString() {
        return consume();
    }

    function parseDigit() {
        logger.debug("- Single number");
        return {
            type: 'number',
            value: consume()
        };
    }

    function parseNumber() {
        logger.debug('Parsing number: ' + tokens[index].value);

        let nextToken = peekType();
        let previousTokenValue = lookBackValue();
        let previousStructureType = lookBack(1); // Check if previously added structure is a function
        if (previousTokenValue !== '^' && previousTokenValue !== '_' && previousStructureType !== 'function') {
            if ((nextToken !== null && nextToken === TOKEN_TYPES.NUMBER_LITERAL.name)) {

                logger.debug("- Found another number \"" + tokens[index + 1].value + "\", continuing parsing");
                let currentNumber = parseDigit().value + parseExpression().value;
                return {
                    type: 'number',
                    value: currentNumber,
                };
            } else {
                return parseDigit();
            }
        } else {
            return parseDigit();
        }
    }

    function parseComma() {
        logger.debug('Parsing comma: ' + getCurrentChar());

        if (options.disallowDecimalCommas) {
            throw new Error('The current options doesn\'t allow decimal commas ","');
        }
        return {
            type: 'comma',
            value: consume(),
        };
    }

    function parsePoint() {
        logger.debug('Parsing point: ' + getCurrentChar());
        let previousStructureType = lookBack(1);

        if (options.disallowDecimalPoints) {
            throw new Error('The current options doesn\'t allow decimal points "."');
        }

        if (previousStructureType !== 'number') {
            // TODO review if this should be allowed ".2" instead of "0.2".
            throw new Error('Leading decimal separators are not allowed');
        }

        return {
            type: 'point',
            value: consume(),
        };
    }

    function parseWord() {
        logger.debug('- Found letter \"' + getCurrentChar() + '\"');

        let sequence = "";

        if (peekType() === TOKEN_TYPES.STRING_LITERAL.name) {
            logger.debug(', Continuing parsing');
            sequence = consume() + parseWord(TOKEN_TYPES.STRING_LITERAL.name);
            logger.debug('Current word: ' + sequence)
        } else {
            sequence = consume();
        }
        logger.debug('Current sequence: ' + sequence);
        return sequence;
    }

    function isReservedWord(word) {
        let isReserved = false;
        logger.debug('Checking ' + word + ' for reserved word');
        for (let key in RESERVED_WORDS) {
            if (!RESERVED_WORDS.hasOwnProperty(key)) {
                continue;
            }
            let regex = RESERVED_WORDS[key].regex;
            if (regex.test(word)) {
                isReserved = true;
            }
        }
        return isReserved;
    }

    function handleReservedWord(word) {
        let reservedWordType = "";
        let reservedWord = "";

        for (let key in RESERVED_WORDS) {
            if (!RESERVED_WORDS.hasOwnProperty(key)) {
                continue;
            } else {
                let regex = RESERVED_WORDS[key].regex;
                if (word.match(regex) !== null) {
                    reservedWordType = RESERVED_WORDS[key].type;
                    reservedWord = regex.exec(word);
                    break;
                }
            }
        }

        return {
            type: reservedWordType,
            value: reservedWord
        }
    }

    function parseVariable() {

        logger.debug('Parsing variable: ' + tokens[index].value);
        let word = "";
        let backtrack = index;

        word = parseWord();

        logger.debug('Current word: ' + word);


        // Check for reserved variable words
        if (isReservedWord(word)) {
            logger.debug('Variable contains reserved words');

            let reservedWordLength;

            let reservedWordResult = handleReservedWord(word);
            let reservedWord = reservedWordResult.value;
            reservedWordLength = reservedWord[0].length;

            logger.debug('reserved word: ' + reservedWord[0] + ", length: " + reservedWordLength + ", index " + reservedWord.index);

            if (reservedWord.index > 0) {
                index = backtrack + reservedWord.index;
                word = word.substr(0, (reservedWord.index));

                if (options.onlySingleVariables === true && options.addTimesSign === false) {
                    // Assert only single variables if onlySingleVariables- and addTimesSign options are sat to true and false.
                    if (word.length > 1) {
                        throw new Error('The current options only allow for single variables');
                    }
                } else if (options.onlySingleVariables) { // Only produce single-char variables
                    index = backtrack;
                    word = consume();
                }

            } else {
                index = backtrack + reservedWordLength;
                word = reservedWord[0];
            }

        } else if (options.onlySingleVariables === true && options.addTimesSign === false) {
            // Assert only single variables if onlySingleVariables- and addTimesSign options are sat to true and false.
            if (word.length > 1) {
                throw new Error('The current options only allow for single variables');
            }

        } else if (options.onlySingleVariables) { // Only produce single-char variables
            index = backtrack;
            word = consume();
        }

        return {
            type: 'variable',
            value: word
        };
    }

    function parseVerticalBar() {
        let node = null;
        let previousStructureType = lookBack(1);
        if (previousStructureType !== 'delimiter') {
            throw new Error('Pipe symbols may only be used with "left" / "right" delimiters.');
        }

        node = {
            type: 'vertical_bar',
            value: consume()
        };

        return node;
    }

    function parseDelimiter(delimiter) {
        let node = null;
        node = {
            type: 'delimiter',
            value: delimiter
        };

        return node;
    }

    function parseBracket() {
        let node = null;
        let bracketName = getBracketName(getCurrentTypeSymbol());
        let bracketType = getBracketType(getCurrentTypeSymbol());
        node = {
            type: bracketType,
            symbol: bracketName,
            value: consume()
        };

        return node;
    }

    /*function parseGroup(delimiter = null) {
        let groupName = getBracketName(getCurrentTypeSymbol());
        let length = 0;

        if (delimiter) {
            length = matchingGroupLength(tokens.slice(index), delimiter, groupName);
        } else {
            length = matchingBracketLength(tokens.slice(index), groupName);
        }

        if (length instanceof Error) return length;

        const newLatex = tokens.slice(index + 1, index + (length));
        logger.debug('New group created');

        index += length + 1;

        return {
            type: 'group',
            symbol: groupName,
            value: parseLatex(newLatex, options)
        };
    }*/

    function parseMacro(macroName) {
        let macro = null;
        let isMacroMatch = isMacro(macroName);
        let isGreek = isGreekLetter(macroName);

        if (isMacroMatch) {
            // Check for overrides
            macro = MACROS_OVERRIDE.get(macroName);

            if (macro === undefined) {
                macro = {
                    type: 'token',
                    value: macroName
                };
            }
        } else if (isGreek) {
            macro = {
                type: 'token',
                value: macroName
            }
        } else if (isIgnoredMacro(macroName)) {
            macro = null;
        } else {
            throw new Error('Encountered an unsupported macro: ' + macroName);
        }

        return macro;
    }

    function parseEnvironment(state) {
        if (getCurrentChar() !== TOKEN_TYPES.OPENING_BRACE.symbol) {
            throw new Error('No argument for environments are present.')
        }
        skipToken(); // Skip brace
        let environmentType = parseWord();
        skipToken(); // Skip brace

        if (isEnvironment(environmentType)) {
            if (state === 'begin' || state === 'end') {
                return {
                    type: 'environment',
                    state: state,
                    value: environmentType
                }

            } else {
                throw new Error('environment state ' + state + ' is not valid')
            }

        } else {
            throw new Error('Environment type ' + environmentType + ' is not supported');
        }

    }

    function isSpecialChar(functionalWord) {
        let specials = [' ', '{', '}', '\\'];
        let isSpecialChar = false;

        specials.forEach(s => {
            if (functionalWord === s) {
                isSpecialChar = true;
                logger.debug(functionalWord + ' is special char');
            }
        });

        return isSpecialChar;
    }

    function handleSpecialChar(functionalWord) {
        let result = null;
        switch (functionalWord) {
            case ' ':
                result = null;
                break;

            case '{':
                result = parseBracket();
                break;

            case '}':
                result = parseBracket();
                break;

            case '\\':
                result = {
                    type: 'DOUBLE_BACKSLASH',
                    value: consume() + consume()
                };
                break;
            default:
                return false;
        }

        return result;
    }

    function parseOperatorname() {
        let node = null;
        skipToken(); // Skip bracket
        let functionalWord = parseWord();
        node = parseFunction(functionalWord);
        skipToken(); // Skip bracket
        return node;
    }

    function handleBackslash() {
        logger.debug('Found backslash');
        let node = null;

        // TODO move into handleSpecialChar
        if (peekType() === TOKEN_TYPES.BACKSLASH.name) {
            return {
                type: 'DOUBLE_BACKSLASH',
                value: consume() + consume()
            }
        }
        index++; // Skip backslash

        if (getCurrentChar() === undefined) return null;

        if (isSpecialChar(getCurrentChar())) {
            node = handleSpecialChar(getCurrentChar());
            return node;
        }


        let functionalWord = parseWord();

        if (functionalWord === 'begin') {
            node = parseEnvironment('begin');
        } else if (functionalWord === 'end') {
            node = parseEnvironment('end');
        } else if (functionalWord === 'operatorname') {
            node = parseOperatorname()
        } else if (isFunction(functionalWord)) {
            node = parseFunction(functionalWord);
        } else if (isDelimiter(functionalWord)) {
            node = parseDelimiter(functionalWord);
        } else {
            node = parseMacro(functionalWord);
        }

        return node;
    }


    function parseFunction(functionName) {
        let node = {};
        let func = getFunctionName(functionName);
        node = {
            type: 'function',
            value: func
        };

        return node;
    }


    function parseOperator() {
        logger.debug("Found operator");

        const token = tokens[index];

        const infix = /^[+\-*/=^_]$/i;
        const prefix = /^[]$/i;
        const postfix = /^[!]$/i;

        if (infix.test(token.value)) { // Is infix operator

            return {
                type: 'operator',
                operatorType: 'infix',
                value: consume()
            };
        } else if (prefix.test(token.value)) {
            return {
                type: 'operator',
                operatorType: 'prefix',
                value: consume()
            };
        } else if (postfix.test(token.value)) {
            return {
                type: 'operator',
                operatorType: 'postfix',
                value: consume()
            };
        }
    }


    function parseExpression() {

        let parsedResult = null;

        const token = tokens[index];
        switch (token.type) {

            case TOKEN_TYPES.NUMBER_LITERAL:
                logger.debug('Found NUMBER_LITERAL \"' + getCurrentChar() + '\"');
                parsedResult = parseNumber();
                break;
            case TOKEN_TYPES.PERIOD:
                logger.debug('Found PERIOD \"' + getCurrentChar() + '\"');
                parsedResult = parsePoint();
                break;
            case TOKEN_TYPES.COMMA:
                logger.debug('Found COMMA \"' + getCurrentChar() + '\"');
                parsedResult = parseComma();
                break;
            case TOKEN_TYPES.BACKSLASH:
                logger.debug('Found BACKSLASH \"' + getCurrentChar() + '\"');
                parsedResult = handleBackslash();
                break;
            case TOKEN_TYPES.OPERATOR:
                logger.debug('Found OPERATOR \"' + getCurrentChar() + '\"');
                parsedResult = parseOperator();
                break;
            case TOKEN_TYPES.STRING_LITERAL:
                logger.debug('Found STRING_LITERAL \"' + getCurrentChar() + '\"');
                parsedResult = parseVariable();
                break;
            case TOKEN_TYPES.OPENING_BRACE:
            case TOKEN_TYPES.CLOSING_BRACE:
                logger.debug('Found BRACKET \"' + getCurrentChar() + '\"');
                parsedResult = parseBracket();
                break;
            case TOKEN_TYPES.OPENING_PARENTHESES:
            case TOKEN_TYPES.CLOSING_PARENTHESES:
                logger.debug('Found BRACKET \"' + getCurrentChar() + '\"');
                parsedResult = parseBracket();
                break;
            case TOKEN_TYPES.OPENING_BRACKET:
            case TOKEN_TYPES.CLOSING_BRACKET:
                logger.debug('Found BRACKET \"' + getCurrentChar() + '\"');
                parsedResult = parseBracket();
                break;
            case TOKEN_TYPES.VERTICAL_BAR:
                logger.debug('Found VERTICAL_BAR \"' + getCurrentChar() + '\"');
                parsedResult = parseVerticalBar();
                break;

            default:
                index++;
                break;
        }

        return parsedResult;
    }


    function startParse() {

        let count = 0;
        while (index < tokens.length) {
            logger.debug("--------- Parsing next token. While loop run: " + count + ' ---------')

            let node = parseExpression();
            if (node === null) {
                continue;
            }

            if (node === undefined) {
                index = tokens.length;

                throw new Error('node is undefined');
            }

            addNode(node);
            logger.debug('Parsed result type: ' + node.type);

            count++;

            if (count > 1000) throw new Error('Max count reached, infinite loop encountered.'); // TODO REMOVE
        }
        logger.debug("--------- End of while loop. Tokens position: " + (index - 1) + " of " + (tokens.length - 1) + ' ---------');
        return structure;
    }

    return startParse();
}


function isBracket(char) {
    let bracket = false;
    switch (char) {
        case TOKEN_TYPES.OPENING_BRACE.symbol:
            bracket = true;
            break;
        case TOKEN_TYPES.OPENING_PARENTHESES.symbol:
            bracket = true;
            break;
        case TOKEN_TYPES.OPENING_BRACKET.symbol:
            bracket = true;
            break;
    }
    return bracket;
}


function getBracketName(bracket) {
    let name = "";

    switch (bracket) {
        case TOKEN_TYPES.OPENING_BRACE.symbol:
            name = 'curly';
            break;
        case TOKEN_TYPES.CLOSING_BRACE.symbol:
            name = 'curly';
            break;
        case TOKEN_TYPES.OPENING_PARENTHESES.symbol:
            name = 'normal';
            break;
        case TOKEN_TYPES.CLOSING_PARENTHESES.symbol:
            name = 'normal';
            break;
        case TOKEN_TYPES.OPENING_BRACKET.symbol:
            name = 'square';
            break;
        case TOKEN_TYPES.CLOSING_BRACKET.symbol:
            name = 'square';
            break;
    }
    return name;
}

function getBracketType(bracket) {
    let type = "";

    switch (bracket) {
        case TOKEN_TYPES.OPENING_BRACE.symbol:
        case TOKEN_TYPES.OPENING_PARENTHESES.symbol:
        case TOKEN_TYPES.OPENING_BRACKET.symbol:
            type = 'opening_bracket';
            break;
        case TOKEN_TYPES.CLOSING_BRACE.symbol:
        case TOKEN_TYPES.CLOSING_PARENTHESES.symbol:
        case TOKEN_TYPES.CLOSING_BRACKET.symbol:
            type = 'closing_bracket';
            break;
    }
    return type;
}

/**
 * Will find the length to the matching bracket, in provided tokens array
 * @param  {string} tokens       An array of tokens, starting from where the search should begin
 * @param  {string} bracketType The type of bracket to search for.
 *                                  Can be one of the following ['normal', 'curly', 'square']
 * @return {number}             The length from start of provided tokens array,
 *                                  to the location of the matching bracket
 */
function matchingBracketLength(tokens, bracketType) {
    logger.debug('Finding matching bracket');

    let startBracket = '';
    let endBracket = '';

    switch (bracketType) {
        case 'normal':
            startBracket = '(';
            endBracket = ')';
            break;
        case 'curly':
            startBracket = '{';
            endBracket = '}';
            break;
        case 'square':
            startBracket = '[';
            endBracket = ']';
            break;
    }

    let bracketDepth = 0;

    for (let i = 0; i < tokens.length; i++) {
        const char = tokens[i].value;
        logger.debug('-- Char:' + char);

        if (char === startBracket) {
            bracketDepth++;
            logger.debug('-- Found starting bracket, depth ' + bracketDepth)
        } else if (char === endBracket) {
            if (bracketDepth === 1) {
                logger.debug('-- Found original closing bracket at position ' + i);
                return i;
            }

            bracketDepth--;
            logger.debug('-- Found closing bracket, depth ' + bracketDepth)
        }
    }

    throw new Error('Brackets do not match up');
}