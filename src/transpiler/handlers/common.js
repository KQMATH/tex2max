/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

export function assertNotUndefined(item, message) {
    if (typeof item === 'undefined') {
        throw new Error(message);
    }
}

export function getExpressionLength(parsedLatex) {
    // Locate the next operator + or -.

    let expressionLength = 0;

    if (parsedLatex[0].type === 'group' && parsedLatex.length === 1) {
        expressionLength = 1;
    } else {
        let i = 0;
        let foundExpressionLength = false;
        while (i < parsedLatex.length && !foundExpressionLength) {

            if (parsedLatex[i].value === '+' || parsedLatex[i].value === '-' || parsedLatex[i].value === '+-') {
                expressionLength = (i);
                foundExpressionLength = true;
            }
            i++;
        }

        if (!foundExpressionLength) {
            expressionLength = parsedLatex.length;
        }
    }

    return expressionLength;
}

