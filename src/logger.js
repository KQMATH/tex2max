/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

const debugging = false;
const warning = false;

export const debug = (msg) => {

    if (debugging) {
        console.debug(msg)
    }
};

export function warn(msg) {
    if (warning) {
        console.warn(msg);
    }
}