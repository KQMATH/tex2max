/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

import {isMacro, MACROS_OVERRIDE} from "./macros";
import {getFunctionName, isFunction} from "./functions";
import {environments} from "./environments";
import {TOKEN_TYPES} from "./tokens/tokens";
import {RESERVED_WORDS} from "./reservedWords";
import {getOptions} from "./options";
import * as logger from './logger';
import {isGreekLetter} from "./tokens/greek-letters";

const BRACKET_CURLY_OPEN = '{';
const BRACKET_NORMAL_OPEN = '(';
const BRACKET_SQUARE_OPEN = '[';


export function parseLatex(tokens) {
    const options = getOptions();
    logger.debug("\n------------------ PARSING -> -------------------");

    let index = 0;
    let structure = [];


    function addNode(obj) {
        structure.push(obj);
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


    function parseWord() {
        logger.debug('- Found letter \"' + getCurrentChar() + '\"');

        let sequence = "";

        if (peekType() === TOKEN_TYPES.STRING_LITERAL.name) {
            logger.debug(', continuing parsing')
            sequence = consume() + parseWord(TOKEN_TYPES.STRING_LITERAL.name);
            logger.debug('current word: ' + sequence)
        } else {
            sequence = consume();
        }
        logger.debug('current sequence: ' + sequence);
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

        logger.debug('current word: ' + word);


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

                if (options.onlySingleVariables) { // Only produce single-char variables
                    index = backtrack;
                    word = consume();
                }

            } else {
                index = backtrack + reservedWordLength;
                word = reservedWord[0];
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


    function parseGroup() {
        let bracket = "";
        switch (getCurrentChar()) {
            case BRACKET_CURLY_OPEN:
                bracket = 'curly';
                break;

            case BRACKET_NORMAL_OPEN:
                bracket = 'normal';
                break;
            case BRACKET_SQUARE_OPEN:
                bracket = 'square'
        }

        const length = matchingBracketLength(tokens.slice(index), bracket);

        if (length instanceof Error) return length;

        const newLatex = tokens.slice(index + 1, index + (length));
        logger.debug('New group created');

        index += length + 1;

        return {
            type: 'group',
            symbol: bracket,
            value: parseLatex(newLatex, options)
        };
    }

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
        } else {
            logger.warn('Encountered an unsupported macro \"' + macroName + '\", ignoring..')
        }

        return macro;
    }


    function isEnvironment(functionalWord) {
        const isEnvironment = environments.reduce((acc, val) => {
            return acc || val === functionalWord;
        }, false);

        logger.debug("Is acknowledged environment?: " + isEnvironment);
        return isEnvironment; // TODO review function
    }


    function parseEnvironment(state) {
        if (getCurrentChar() !== BRACKET_CURLY_OPEN) {
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
                result = parseGroup();
                break;

            case '}':
                result = null;
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


        if (peekType() === TOKEN_TYPES.BACKSLASH.regex) {

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
                logger.debug('Found BRACKET \"' + getCurrentChar() + '\"');
                parsedResult = parseGroup();
                break;
            case TOKEN_TYPES.OPENING_PARENTHESES:
                logger.debug('Found BRACKET \"' + getCurrentChar() + '\"');
                parsedResult = parseGroup();
                break;
            case TOKEN_TYPES.OPENING_BRACKET:
                logger.debug('Found BRACKET \"' + getCurrentChar() + '\"');
                parsedResult = parseGroup();
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
