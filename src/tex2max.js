/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */


import * as logger from './logger';
import {getOptions, setOptions} from "./options";
import {scan} from "./scanner";
import {lex} from "./lexer";
import {parseLatex} from "./parser";
import {transpiler} from "./transpiler/maxima-transpiler";
import {isEquation, stripParenthesis} from "./helpers/helpers";


/********************************************************
 * The publicly exposed tex2max API.
 ********************************************************/


/**
 * Globally exported API class.
 * Represents a TeX2Max class for handeling translation/transpilation of LaTeX to Maxima code.
 * @param  {Object} userOptions Optional options
 */
export class TeX2Max {

    constructor(userOptions) {
        setOptions(userOptions);
        this.options = getOptions();

        this.lastInput = "";
        this.lastResult = "";
    }

    getLastInput() {
        return this.lastInput()
    }

    getLastResult() {
        return this.lastResult;
    }

    /**
     * @param  {String} latex The latex to parse
     */
    toMaxima(latex) {
        setOptions(this.options);
        let maximaExpression;

        this.lastInput = latex;


        let scannerResult = scan(latex);
        logger.debug(scannerResult);

        let lexerResult = lex(scannerResult);
        logger.debug(lexerResult);

        this.structure = parseLatex(lexerResult);
        logger.debug(this.structure);

        let transpiledExpression = transpiler(this.structure);
        maximaExpression = stripParenthesis(transpiledExpression);

        // Handle equation
        if (this.options.handleEquation && isEquation(this.structure)) {
            maximaExpression = 'solve(' + maximaExpression + ')';
        }

        this.lastResult = maximaExpression;

        return maximaExpression;
    }
}