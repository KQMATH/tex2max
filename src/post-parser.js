/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2019 NTNU
 */

import {getFunctionName} from './functions';
import {getOptions} from './options';
import * as logger from './logger';
import {DELIMITERS} from './delimiters';

export function postParse(parsedLatex) {
    logger.debug('\n------------------ POST PARSING -> -------------------');
    const options = getOptions();

    let index = 0;
    let structure = [];

    for (index; index < parsedLatex.length; index++) {
        const item = parsedLatex[index];

        logger.debug('--------- Parsing next token\' ---------');

        let node = parseExpression();
        if (node === null) {
            continue;
        }

        if (node === undefined) {
            index = parsedLatex.length;

            throw new Error('node is undefined');
        }

        addNode(node);

        let types = '';
        if (checkArray(node)) {
            node.forEach(e => {
                types += e.type + ' + ';
            });
            types = types.substr(0, types.length - 3);
        }
        else {
            types = node.type;
        }

        logger.debug('Parsed result type(s): ' + types + '.');
    }

    function parseExpression() {
        let node = null;
        const item = getCurrentItem();
        const value = getCurrentValue();
        const type = getCurrentType();
        switch (type) {

            case 'delimiter':
                logger.debug('Found delimiter \"' + value + '\"');
                node = parseDelimiter();
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
        }
        else {
            structure.push(obj);

        }
    }

    function checkArray(value) {
        return value && typeof value === 'object' && value.constructor ===
            Array;
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
        return parsedLatex[index + position]
            ? parsedLatex[index + 1].type
            : null;
    }

    function peekValue(position) {
        return parsedLatex[index + position] ? parsedLatex[index +
        position].value : null;
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

    function parseDelimiter() {
        let nodes = null;
        let node, groupNode;

        const item = getCurrentItem();
        const value = getCurrentValue();

        const type = peekType(1);
        switch (type) {
            case 'vertical_bar':
                logger.debug('Found vertical_bar \"' + value + '\"');
                node = parseVerticalBar();
                break;
            default:
                break;
        }

        groupNode = createGroup();

        nodes = [node, groupNode];
        nodes = nodes.filter(function(el) {
            return el != null;
        });
        return nodes;
    }

    function parseVerticalBar() {
        let node = null;
        let functionName = 'abs';
        let func = getFunctionName(functionName);

        node = {
            type: 'function',
            value: func,
        };

        return node;
    }

    function createGroup() {
        const delimiter = getCurrentValue();
        const type = peekType(1);
        const value = peekValue(1);
        let length = findGroupLength(parsedLatex.slice(index), delimiter,
            value);

        if (length instanceof Error) {
            return length;
        }

        const newItems = parsedLatex.slice(index + 2, index + (length));
        logger.debug('New group created');

        index += length;

        return {
            type: 'group',
            symbol: type,
            value: postParse(newItems),
        };
    }

    /**
     * Will find the length to the matching delimeter and symbol in provided
     * items array
     * @param  {Object} items An array of parsed latex, starting
     *     from where the search should begin
     * @param  {string} symbol The symbol to search for.
     * @return {number} The length from start of provided items
     *     array, to the location of the matched symbol bracket
     */
    function findGroupLength(items, delimiter, symbol) {
        logger.debug('Finding matching symbols');

        let depth = 0;
        const startDelimiter = delimiter;
        const endDelimiter = DELIMITERS.get(delimiter);
        let nextItemType = peekType(1);
        let nextItemValue = peekValue(1);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            nextItemType = items[i + 1] ? items[i + 1].type : '';
            nextItemValue = items[i + 1] ? items[i + 1].value : '';

            logger.debug('-- Delimiter: ' + delimiter + ', Item:' + item.value);

            if (item.type === 'delimiter' && item.value === startDelimiter &&
                nextItemValue === symbol) {
                depth++;
                logger.debug('-- Found starting point, depth ' + depth);
            }
            else if (item.type === 'delimiter' && item.value === endDelimiter &&
                nextItemValue === symbol) {
                if (depth === 1) {
                    logger.debug(
                        '-- Found end of symbol group at position ' + i);
                    return i;
                }
                depth--;
                logger.debug('-- Found closing point, depth ' + depth);
            }

        }
        throw new Error(
            '"' + delimiter + symbol + '"' + ' symbols does not match up');
    }

    return structure;
}