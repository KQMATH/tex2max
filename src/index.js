/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */


import * as logger from './logger';
import {getOptions, setOptions} from "./options";
import {scan} from "./scanner";
import {lex} from "./lexer";
import {parseLatex} from "./parser";
import {transpiler} from "./transpiler/maxima-transpiler";
import {isEquation, stripParenthesis} from "./helpers/helpers";
import {postParse} from "./post-parser";


/********************************************************
 * The publicly exposed tex2max API.
 ********************************************************/


/**
 * Globally exported API class.
 * Represents a TeX2Max class for handling translation/transpilation of LaTeX to Maxima code.
 * @param  {Object} userOptions Optional options
 */
 class TeX2Max {

    constructor(userOptions) {
        setOptions(userOptions);
        this.options = getOptions();

        this.lastInput = "";
        this.lastResult = "";
    }

    /**
     * Gets the last latex input.
     * @returns {string}
     */
    getLastInput() {
        return this.lastInput()
    }

    /**
     * Gets the last conversion result.
     * @returns {string} the last conversion result (Maxima code)
     */
    getLastResult() {
        return this.lastResult;
    }

    /**
     * Updates the TeX2Max options. If one or more settings passed as parameter are missing,
     * defaults defined in {@link DEFAULTS} will be used
     * @param userOptions
     */
    updateOptions(userOptions) {
        setOptions(userOptions);
        this.options = getOptions();
    }

    /**
     * Converts a latex input string to Maxima code.
     * @param  {String} latex The latex to parse
     * @returns {*}
     */
    toMaxima(latex) {
        setOptions(this.options);
        let maximaExpression;

        this.lastInput = latex;

        let scannerResult = scan(latex);
        logger.debug(scannerResult);

        let lexerResult = lex(scannerResult);
        logger.debug(lexerResult);

        let parsedLatex = parseLatex(lexerResult);
        logger.debug(parsedLatex);

        this.structure = postParse(parsedLatex);
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

export default TeX2Max;