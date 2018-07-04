/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define([], function () {

    let options = {};

    const DEFAULTS = {
        onlySingleVariables: false,
        handleEquation: false,
        addTimesSign: true,
    };

    function setOptions(userOptions) {
        options = {};
        options = Object.assign(DEFAULTS, userOptions)
    }

    function readOptions() {
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            setOptions();
        }

        let optionsCopy = Object.assign({}, options);

        return optionsCopy;
    }

    return {
        DEFAULTS: DEFAULTS,
        setOptions: setOptions,
        getOptions: readOptions,
    }
});