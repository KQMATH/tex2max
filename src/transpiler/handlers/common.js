import {wrapForTranspilation} from '../../helpers/helpers';

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
    let condition = null;
    let conditionValue = null;

    if (parsedLatex[0].type === 'group' && parsedLatex.length === 1) {
        expressionLength = 1;
    } else {
        let i = 0;
        let foundExpressionLength = false;
        while (i < parsedLatex.length && !foundExpressionLength) {

            if (types != null) {
                types.forEach(type => {
                    if (parsedLatex[i].type === type) {
                        expressionLength = (i);
                        foundExpressionLength = true;
                        condition = 'type';
                        conditionValue = type;

                    }
                });
            }

            if (values != null && !foundExpressionLength) {
                values.forEach(value => {
                    if (parsedLatex[i].value === value) {
                        expressionLength = (i);
                        foundExpressionLength = true;
                        condition = 'value';
                        conditionValue = value;
                    }
                });
            }

            i++;
        }

        if (!foundExpressionLength) {
            expressionLength = parsedLatex.length;
        }
    }

    return {expressionLength: expressionLength, condition: condition, conditionValue: conditionValue};
}
