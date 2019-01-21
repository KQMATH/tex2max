import {getOptions} from "./options";

/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */


export const debug = (msg) => {
    let options = getOptions();
    let debugging = options.debugging;

    if (debugging) {
        console.debug(msg)
    }
};

export function warn(msg) {
    const warning = true;

    if (warning) {
        console.warn(msg);
    }
}