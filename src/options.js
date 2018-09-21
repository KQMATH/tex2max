/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

let options = {};

export const DEFAULTS = {
    onlySingleVariables: false,
    handleEquation: false,
    addTimesSign: true,
    onlyGreekName: false, // TODO Implement onlyGreekName option
    onlyGreekSymbol: false, // TODO Implement onlyGreekSymbol option
};

function onlyOneTrue() {

    // TODO add restrictions so that of two options, only one can be sat to true.

}

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