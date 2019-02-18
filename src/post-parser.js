/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2019 NTNU
 */

import {getFunctionName} from "./functions";
import {getOptions} from "./options";
import * as logger from './logger';

export function postParse(parsedLatex) {
    logger.debug("\n------------------ POST PARSING -> -------------------");
    const options = getOptions();

    let index = 0;
    let structure = [];

    for (index; index < parsedLatex.length; index++) {
        const item = parsedLatex[index];

        logger.debug("--------- Parsing next token' ---------");

        let node = parseExpression();
        if (node === null) {
            continue;
        }

        if (node === undefined) {
            index = parsedLatex.length;

            throw new Error('node is undefined');
        }

        addNode(node);

        let types = "";
        if (checkArray(node)) {
            node.forEach(e => {
                types += e.type + " + ";
            });
            types = types.substr(0, types.length - 3)
        } else {
            types = node.type;
        }

        logger.debug('Parsed result type(s): ' + types + ".");
    }


    function parseExpression() {
        let node = null;
        const item = getCurrentItem();
        const value = getCurrentValue();
        const type = getCurrentType();
        switch (type) {
            case 'vertical_bar':
                logger.debug('Found vertical_bar \"' + value + '\"');
                node = parseVerticalBar();
                break;

            case 'group':
                logger.debug('Found group \"' + value + '\"');
                node = parseGroup();
                break;

            default:
                node = item;
                break;
        }

        return node;
    }


    function addNode(obj) {
        if (checkArray(obj)) {
            structure.push(...obj);
        } else {
            structure.push(obj);

        }
    }

    function checkArray(value) {
        return value && typeof value === 'object' && value.constructor === Array;
    }

    function getCurrentItem() {
        return parsedLatex[index] ? parsedLatex[index] : undefined;
    }

    function getCurrentValue() {
        return parsedLatex[index] ? parsedLatex[index].value : undefined;
    }

    function getCurrentType() {
        return parsedLatex[index].type;
    }

    function peekType(position) {
        return parsedLatex[index + position] ? parsedLatex[index + 1].type.name : null;
    }

    function peekValue(position) {
        return parsedLatex[index + position] ? parsedLatex[index + position].value : null;
    }

    function lookBack(position) {
        return parsedLatex[index - position];
    }

    function lookBackValue() {
        let previousToken = parsedLatex[index - 1];
        return previousToken ? previousToken.value : null;
    }

    function lookBackType(position) {
        let previousToken = parsedLatex[index - position];
        return previousToken ? previousToken.type : null;
    }

    function parseGroup() {
        let node = getCurrentItem();
        node.value = postParse(getCurrentValue());
        return node;
    }

    function parseVerticalBar() {
        let nodes = null;
        let functionName = 'abs';
        let func = getFunctionName(functionName);
        let funcNode, groupNode;

        funcNode = {
            type: 'function',
            value: func
        };

        groupNode = createGroup();

        nodes = [funcNode, groupNode];
        return nodes;
    }

    function createGroup() {
        const value = getCurrentValue();
        const type = getCurrentType();

        let length = matchingSymbolLength(parsedLatex.slice(index), value);

        if (length instanceof Error) return length;

        const newItems = parsedLatex.slice(index + 1, index + (length));
        logger.debug('New group created');

        index += length;


        return {
            type: 'group',
            symbol: type,
            value: postParse(newItems)
        };
    }


    /**
     * Will find the length to the matching symbol in provided items array
     * @param  {Token} tokens       An array of tokens, starting from where the search should begin
     * @param  {string} symbol      The symbol to search for.
     * @return {number}             The length from start of provided tokens array,
     *                              to the location of the matching bracket
     */
    function matchingSymbolLength(items, symbol) {
        logger.debug('Finding matching symbols');

        let symbolCount = 0;
        let depth = 0;
        let prevItemType = lookBackType(1);
        let nextItemType = peekType(1);
        let nextItemValue = peekValue(1);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            logger.debug('-- Item:' + item.value);

            let numVBarsBefore = numVerticalBars(items.slice(0, i + 1));
            let numVBarsAfter = numVerticalBars(items.slice(i + 1, items.length));

            prevItemType = items[i - 1] ? items[i - 1].type : '';
            nextItemType = items[i + 1] ? items[i + 1].type : '';
            nextItemValue = items[i + 1] ? items[i + 1].value : '';


            // TODO |2|+||1|| results in a error.
            // TODO |||1||| results in a error.
            if (item.value === symbol) {
                symbolCount++;

                if (i === 0) {
                    depth++;

                } else if (prevItemType === 'operator') {
                    depth++;

                } else if (prevItemType === 'vertical_bar') {
                    if (numVBarsAfter < numVBarsBefore) {
                        depth--;
                    } else {
                        depth++;
                    }

                } else {
                    if (numDoubbleVerticalBars(items.slice(i+1,items.length)) > 0) {
                        depth++;

                    } else {
                        depth--;
                    }
                }
                logger.debug('-- Found "' + symbol + '" symbol. Depth: ' + depth);

            }

            if (depth === 0 && symbolCount % 2 === 0) {
                logger.debug('-- Found end of symbol group at position ' + i);
                return i;
            }

            logger.debug('Depth: ' + depth);
        }
        throw new Error('"' + symbol + '"' + ' symbols does not match up');
    }


    function numVerticalBars(items) {
        let count = 0;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type === 'vertical_bar') count++;
        }
        return count;
    }


    function numDoubbleVerticalBars(items) {
        let count = 0;
        for (let i = 0; i < items.length -1; i++) {
            if (items[i].type === 'vertical_bar' && items[i + 1].type === 'vertical_bar') {
                count++;
            }
        }
        return count;
    }


    function isEven(number) {
        return number % 2 === 0;
    }


    return structure;
}