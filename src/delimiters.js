/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2019 NTNU
 */


export const DELIMITERS = new Map([
    ['left', 'right'],
    ['right', 'left'],
]);

export function isDelimiter(delimiterName) {
    let isMatch = false;
    let delimiter = DELIMITERS.get(delimiterName);
    if (delimiter !== undefined) {
        isMatch = true;
    }
    return isMatch;
}
