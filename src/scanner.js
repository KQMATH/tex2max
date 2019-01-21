/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
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
        let isSupported = false;
        for (let type in TOKEN_TYPES) {
            if (!TOKEN_TYPES.hasOwnProperty(type)) {
                continue;
            }

            if (input[position].match(TOKEN_TYPES[type].regex)) {
                addLexeme(input[position]);
                isSupported = true;
            }
        }

        if (!isSupported) throw new Error('Encountered unsupported character: ' + input[position]);

        position++;
    }
    return lexemeList;
}