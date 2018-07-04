/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define(['./options', './scanner', './lexer', './parser', './transpiler/maxima-transpiler', './helpers/helpers', './logger'],
    function (globalOptions, scanner, lexer, parseLatex, transpiler, helpers, logger) {


        /********************************************************
         * The publicly exposed tex2max API.
         ********************************************************/


        /**
         * Globally exported API class.
         * Represents a Tex2Max class for handeling translation/transpilation of LaTeX to Maxima code.
         * @param  {Object} userOptions Optional options
         */
        return class Tex2Max {

            constructor(userOptions) {
                globalOptions.setOptions(userOptions);
                this.options = globalOptions.getOptions();

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
                globalOptions.setOptions(this.options);
                let maximaExpression;

                this.lastInput = latex;


                let scannerResult = scanner(latex);
                logger.debug(scannerResult);

                let lexerResult = lexer(scannerResult);
                logger.debug(lexerResult);

                this.structure = parseLatex(lexerResult);
                logger.debug(this.structure);

                let transpiledExpression = transpiler(this.structure);
                maximaExpression = helpers.stripParenthesis(transpiledExpression);

                // Handle equation
                if (this.options.handleEquation && helpers.isEquation(this.structure)) {
                    maximaExpression = 'solve(' + maximaExpression + ')';
                }

                this.lastResult = maximaExpression;
                
                return maximaExpression;
            }
        };
    });