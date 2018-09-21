/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */


import {transpiler} from "../maxima-transpiler";
import {wrapForTranspilation} from "../../helpers/helpers";
import {assertNotUndefined} from "./common";

export function handleMatrix(parsedLatex) {
    let matrixString = "";

    matrixString += 'matrix(';

    let matrixArray = [];
    let rowArray = [];

    for (let i = 0; i < parsedLatex.length; i++) {
        assertNotUndefined(parsedLatex[i], 'Missing argument in matrix');
        const type = parsedLatex[i].type;

        if (type === 'DOUBLE_BACKSLASH') { // New row
            matrixArray.push(rowArray);
            rowArray = []; // Reset array
        } else {
            rowArray.push(transpiler(wrapForTranspilation(parsedLatex[i])));
        }
    }
    matrixArray.push(rowArray); // Push last row

    let matrixRowSize = matrixArray[0].length;

    for (let row = 0; row < matrixArray.length; row++) {
        if (matrixArray[row].length !== matrixRowSize) {
            throw new Error('All rows in matrix must be the same length');
        }

        if (row !== 0) {
            matrixString += ',';
        }
        matrixString += '[' + matrixArray[row].toString() + ']'
    }
    matrixString += ')';

    return matrixString;
}