/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

export function assertNotUndefined(item, message) {
    if (typeof item === 'undefined') {
        throw new Error(message);
    }
}

export function getExpressionLength(parsedLatex, types = [], values = []) {
    // Locate the next operator + or -, function etc...

    let expressionLength = 0;

    if (parsedLatex[0].type === 'group' && parsedLatex.length === 1) {
        expressionLength = 1;
    } else {
        let i = 0;
        let foundExpressionLength = false;
        while (i < parsedLatex.length && !foundExpressionLength) {
            let pl = parsedLatex[i];

            if (types != null) {
                types.forEach(type => {
                    if (parsedLatex[i].type === type) {
                        expressionLength = (i);
                        foundExpressionLength = true;
                    }
                });
            }

            if (values != null && !foundExpressionLength) {
                values.forEach(value => {
                    if (parsedLatex[i].value === value) {
                        expressionLength = (i);
                        foundExpressionLength = true;
                    }
                });
            }

            i++;
        }

        if (!foundExpressionLength) {
            expressionLength = parsedLatex.length;
        }
    }

    return expressionLength;
}
