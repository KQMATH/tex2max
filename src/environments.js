import * as logger from './logger';

/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */


export const MATRIX_ENVIRONMENTS = [
    'matrix', 'pmatrix', 'bmatrix', 'Bmatrix',
    'vmatrix', 'Vmatrix', 'smallmatrix',
];

export const ENVIRONMENTS = [
    MATRIX_ENVIRONMENTS,
];

export function isEnvironment(functionalWord) {
    const isEnvironment = ENVIRONMENTS.reduce((acc, val) => {
        if (acc !== true && Array.isArray(val)) {
            acc = val.reduce((prev, value) => {
                return prev || value === functionalWord;
            }, false);
        }
        return acc || val === functionalWord;
    }, false);

    logger.debug('Is acknowledged environment?: ' + isEnvironment);
    return isEnvironment;
}

export function isMatrixEnvironment(functionalWord) {
    return MATRIX_ENVIRONMENTS.reduce((acc, val) => {
        return acc || val === functionalWord;
    }, false);
}