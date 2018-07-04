/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define([], function () {

    const debugging = false;

    const debug = (msg) => {

        if (debugging) {
            console.debug(msg)
        }
    };

    function warn(msg) {
        if (debugging) {
            console.warn(msg);
        }
    }


    return {
        debug: debug,
        warn: warn
    };
});