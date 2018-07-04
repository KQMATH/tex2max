/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define(['require', '../maxima-transpiler', '../../helpers/helpers'], function (require, t, helpers) {

    function handleUpperAndLowerArgsSum(parsedLatex) {
        let transpiler = require("../maxima-transpiler");

        let lowerLimit, upperLimit;
        let index = 0;

        for (let j = 0; j < 2; j++) {
            if (parsedLatex[index + j].value === '_') {
                index++;
                lowerLimit = parsedLatex[index + j];

            } else if (parsedLatex[index + j].value === '^') {
                index++;

                if (parsedLatex[index + j].type === 'group') {
                    upperLimit = transpiler(parsedLatex[index + j].value);
                } else {
                    upperLimit = parsedLatex[index + j].value;

                }
            } else {
                throw new Error('Finite integral must have both upper and lover limits');
            }
        }

        return {
            lowerLimit: lowerLimit,
            upperLimit: upperLimit
        }
    }


    function handleLowerSumArguments(parsedLatex) {

        let transpiler = require("../maxima-transpiler");


        const indexVariable = parsedLatex[0];
        const equalSign = parsedLatex[1].value;

        if (!helpers.checkForVariable(indexVariable)) {
            throw new Error('Index must be a variable');
        } else if (equalSign !== '=') {
            throw new Error('Index must be assigned. Missing equal sign');
        }

        let upperLim = parsedLatex[2];
        let value = "";

        if (upperLim.type === 'group') {
            value = transpiler(upperLim.value);
        } else {
            value = upperLim.value;
        }


        return {
            variable: indexVariable.value,
            value: value,
        };

    }


    return {
        handleUpperAndLowerArgsSum: handleUpperAndLowerArgsSum,
        handleLowerSumArguments: handleLowerSumArguments
    }
});