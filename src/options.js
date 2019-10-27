/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

// Options
let options = {};

// Default TeX2Max options
export const DEFAULTS = {
    onlySingleVariables: false,
    handleEquation: false,
    addTimesSign: true,
    disallowDecimalPoints: false,
    disallowDecimalCommas: false,
    onlyGreekName: false,
    onlyGreekSymbol: false,
    debugging: false
};

/**
 * Defines rules to be enforced on the TeX2Max options.
 */
function enforceRules() {
    checkOnlyOneTrue(['disallowDecimalPoints', 'disallowDecimalCommas']);
    checkOnlyOneTrue(['onlyGreekName', 'onlyGreekSymbol']);
}

/**
 * Checks if the configured TeX2Max options, matching the option names passed as param,
 * contains multiple true values. If so, throw an exception.
 * @param option
 * @throws Error
 */
function checkOnlyOneTrue(option) {

    let numTrue = 0;
    for (let i = 0; i < option.length; i++) {
        if (DEFAULTS[option[i]] === true) numTrue++;
        if (numTrue > 1) {
            throw new Error('Only one of the options: \"' + option.join('\", \"') + '\" can be set to \"true\"');
        }
    }
}

/**
 * Sets the TeX2Max options. If one or more settings passed as parameter are missing,
 * defaults defined in {@link DEFAULTS} will be used
 * @param userOptions
 */
export function setOptions(userOptions) {
    options = {};
    options = Object.assign(DEFAULTS, userOptions);
    enforceRules();
}

/**
 * Get the TeX2Max options.
 * @returns {object} the TeX2Max options
 */
export function getOptions() {
    if (Object.keys(options).length === 0 && options.constructor === Object) {
        setOptions();
    }

    let optionsCopy = Object.assign({}, options);

    return optionsCopy;
}