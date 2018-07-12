/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */


export function getLimitLength(parsedLatex) {
    // Locate the next operator + or -.

    let limitLength = 0;

    if (parsedLatex[0].type === 'group' && parsedLatex.length === 1) {
        limitLength = 1;
    } else {
        let i = 0;
        let foundLimitLength = false;
        while (i < parsedLatex.length && !foundLimitLength) {

            if (parsedLatex[i].value === '+' || parsedLatex[i].value === '-') {
                limitLength = (i);
                foundLimitLength = true;
            }
            i++;
        }

        if (!foundLimitLength) {
            limitLength = parsedLatex.length;
        }
    }

    return limitLength;
}