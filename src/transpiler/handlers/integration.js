/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

import {transpiler} from "../maxima-transpiler";
import {wrapForTranspilation} from "../../helpers/helpers";
import * as logger from "../../logger";

/**
 * Will find the length to the end of the integral in the provided tokens array
 * @param  {string} tokens       An array of tokens, starting from where the search should begin
 * @return {Object}             The length from start of provided string,
 *                              to the location of the matching bracket
 */
export function findIntegralEnd(tokens) {

    logger.debug('Finding end of integral');
    let integralDepth = 1;
    let integrationVariable = "";

    for (let i = 0; i < tokens.length; i++) {

        const char = tokens[i].value;
        logger.debug('-- Char:' + char);

        if (tokens[i].type === 'function' && tokens[i].value === 'integral') {
            integralDepth++;
            logger.debug('-- Found starting integral, depth ' + integralDepth)
        } else if (tokens[i].type === 'variable' && char[0] === "d") {


            let regex = /(d)[A-z]/g; // Match integration ends like dx and dy in dxdy
            let match = char.match(regex);

            if (match !== null && match.length >= 1) {

                if (integralDepth === 1) {
                    integrationVariable = char.substring(1);
                    logger.debug('-- Found end of original integral at position ' + i);
                    return {
                        length: i,
                        variable: integrationVariable
                    };
                }

                integralDepth--;
                logger.debug('-- Found integral end, depth ' + integralDepth)
            }
        }
    }

    throw new Error('No end of integral located');
}


export function handleUpperAndLowerArgs(parsedLatex) {


    let lowerLimit, upperLimit;
    let index = 0;

    for (let j = 0; j < 2; j++) {
        if (parsedLatex[index + j].value === '_') {
            index++;

            lowerLimit = transpiler(wrapForTranspilation(parsedLatex[index + j]));

        } else if (parsedLatex[index + j].value === '^') {

            index++;

            upperLimit = transpiler(wrapForTranspilation(parsedLatex[index + j]));

        } else {
            throw new Error('Finite integral must have both upper and lower limits');
        }
    }


    return {
        lowerLimit: lowerLimit,
        upperLimit: upperLimit
    }
}


// Check which variable that comes after the "d" in f.eks dx. This is the variable to put as integrate arguments. Eg. integrate(2*x, x, 1,2)