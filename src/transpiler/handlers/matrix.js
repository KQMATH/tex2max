/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define(['require', '../maxima-transpiler'], function (require) {

    function handleMatrix(parsedLatex) {
        let transpiler = require("../maxima-transpiler");
        let matrixString = "";

        matrixString += 'matrix(';

        let matrixArray = [];
        let rowArray = [];

        for (let i = 0; i < parsedLatex.length; i++) {
            const char = parsedLatex[i].value;
            const type = parsedLatex[i].type;
            if (type === 'number') {
                rowArray.push(char)

            } else if (type === 'group') {
                rowArray.push(transpiler(char))

            } else if (type === 'DOUBLE_BACKSLASH') { // New row
                matrixArray.push(rowArray);
                rowArray = []; // Reset array
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

    return {
        handleMatrix: handleMatrix
    };
});