/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define(['../../logger'], function (logger) {
    function environmentLength(parsedLatex) {
        let environmentDepth = 0;


        for (let i = 0; i < parsedLatex.length; i++) {

            if (parsedLatex[i].type === 'environment' && parsedLatex[i].state === 'begin') {
                environmentDepth++;
                logger.debug('-- Found new \"begin\" environment, depth ' + environmentDepth)
            } else if (parsedLatex[i].type === 'environment' && parsedLatex[i].state === 'end') {
                if (environmentDepth === 1) {
                    logger.debug('-- Found original environment end at position ' + i);
                    return i - 1;
                }

                environmentDepth--;
                logger.debug('-- Found environment \"end\", depth ' + environmentDepth)
            }
        }
        throw new Error('Environments \"begin\" and \"end\" doesn\'t match up');
    }

    return {
        environmentLength: environmentLength
    };
});