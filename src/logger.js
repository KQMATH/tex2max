/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

const debugging = true;

export const debug = (msg) => {

    if (debugging) {
        console.debug(msg)
    }
};

export function warn(msg) {
    if (debugging) {
        console.warn(msg);
    }
}