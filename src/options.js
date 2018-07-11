/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

let options = {};

export const DEFAULTS = {
    onlySingleVariables: false,
    handleEquation: false,
    addTimesSign: true,
    onlyGreekLettersAsName: true, // TODO Implement onlyGreekLettersAsName option
    onlyGreekLettersAsSymbol: false, // TODO Implement onlyGreekLettersAsSymbol option
};

export function setOptions(userOptions) {
    options = {};
    options = Object.assign(DEFAULTS, userOptions)
}

export function getOptions() {
    if (Object.keys(options).length === 0 && options.constructor === Object) {
        setOptions();
    }

    let optionsCopy = Object.assign({}, options);

    return optionsCopy;
}