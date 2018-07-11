/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

import {TOKEN_TYPES} from "./tokens/tokens";
import * as logger from './logger';


export function scan(input) {
    let lexemeList = [];

    function addLexeme(lexeme) {
        lexemeList.push(lexeme);
    }
    logger.debug("\n------------------ SCANNER -> -------------------");
    let position = 0;
    while (position < input.length) {
        for (let type in TOKEN_TYPES) {
            if(!TOKEN_TYPES.hasOwnProperty(type)) {
                continue;
            }

            if (input[position].match(TOKEN_TYPES[type].regex)) {
                addLexeme(input[position]);
            }
        }
        position++;
    }
    return lexemeList;
}