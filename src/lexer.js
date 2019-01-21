/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

import {TOKEN_TYPES} from "./tokens/tokens";
import {Token} from "./Token";
import * as logger from './logger';

/**
 * Represents a lexer used for providing lexical analysis on a
 * array of strings, based on a set of tokens..
 */
export function lex(lexemes) {

    let index = 0;
    let tokenList = [];

    let addToken = (token) => tokenList.push(token);

    let getTokenList = () => tokenList;

    function consume() {
        logger.debug("Consuming position: " + index + ", char: " + lexemes[index]);
        return lexemes[index++];
    }

    function peek() {
        return lexemes[index + 1] !== null ? lexemes[index + 1] : null;
    }


    function findMatchingTokenTypeByString(lexeme) {
        let tokenType = null;

        if (lexeme === undefined) {
            return null;
        }

        for (let token in TOKEN_TYPES) {
            if (!TOKEN_TYPES.hasOwnProperty(token)) {
                continue;
            }
            let tokenType = TOKEN_TYPES[token];
            let regex = tokenType.regex;

            if (lexeme.match(regex)) {
                return tokenType;
            }
        }
        return tokenType;
    }


    function startLexing() {
        logger.debug("\n------------------ LEXICAL ANALYSIS -> -------------------");

        while (index < lexemes.length) {
            let token;
            let tokenValue = "";

            let tokenType = findMatchingTokenTypeByString(lexemes[index]);
            tokenValue = consume();
            token = new Token(tokenType, tokenValue);

            if (token !== undefined) {
                addToken(token);
            }
        }

        return getTokenList();
    }

    return startLexing();
}

