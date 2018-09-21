/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */
import {transpiler} from "../maxima-transpiler";
import {checkForVariable, wrapForTranspilation} from "../../helpers/helpers";
import {assertNotUndefined} from "./common";

export function handleUpperAndLowerArgsSum(parsedLatex) {
    let lowerLimit, upperLimit;
    let index = 0;

    for (let j = 0; j < 2; j++) {
        if (parsedLatex[index + j].value === '_') {
            index++;
            lowerLimit = parsedLatex[index + j];

        } else if (parsedLatex[index + j].value === '^') {
            index++;
            upperLimit = transpiler(wrapForTranspilation(parsedLatex[index + j]));

        } else {
            throw new Error('Finite integral must have both upper and lover limits');
        }
    }

    return {
        lowerLimit: lowerLimit,
        upperLimit: upperLimit
    }
}


export function handleLowerSumArguments(parsedLatex) {

    assertNotUndefined(parsedLatex[0], 'Missing index');
    const indexVariable = parsedLatex[0];

    assertNotUndefined(parsedLatex[1], 'Index must be assigned. Missing equal sign');
    const equalSign = parsedLatex[1].value;

    if (!checkForVariable(indexVariable)) {
        throw new Error('Index must be a variable');
    } else if (equalSign !== '=') {
        throw new Error('Index must be assigned. Missing equal sign');
    }

    let upperLim = parsedLatex.slice(2);
    let value = "";

    value += transpiler(wrapForTranspilation(upperLim));

    return {
        variable: indexVariable.value,
        value: value,
    };

}