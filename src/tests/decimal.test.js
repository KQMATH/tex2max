/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2019 NTNU
 */

import test from 'ava';
import TeX2Max from '../index';

test.beforeEach(t => {
    t.context.TeX2Max = new TeX2Max();
});

function transpilation(t, input, expected) {
    let maximaCode = t.context.TeX2Max.toMaxima(input);
    t.is(maximaCode, expected);
}
transpilation.title = (
    providedTitle = '', input, expected) => `${providedTitle} ${input}`.trim();

function singleVars(t, input, expected) {
    t.context.TeX2Max.updateOptions({
        onlySingleVariables: true,
        addTimesSign: true,
    });
    transpilation(t, input, expected);
}
singleVars.title = (
    providedTitle = '', input,
    expected) => `SingleVars: ${providedTitle} ${input}`.trim();

function transpilationError(t, input) {
    t.throws(() => {
        let maximaCode = t.context.TeX2Max.toMaxima(input);
    }, Error);
}
transpilationError.title = (
    providedTitle = '', input) => `${providedTitle} ${input}`.trim();


// Point type "." decimal numbers
test('Short point type decimal number with leading zero',
    [transpilation, singleVars],
    '0.2', '0.2');

test('Long point type decimal number with leading zero',
    [transpilation, singleVars],
    '1234.1234', '1234.1234');

test('Short point type decimal number with leading zero in simple function',
    [transpilation, singleVars],
    '\\sin(0.2)', 'sin(0.2)');

test('Long point type decimal number with leading zero in simple function',
    [transpilation, singleVars],
    '\\sin(1234.1234)', 'sin(1234.1234)');

test('point type decimal number with leading decimal separator that should throw an error',
    [transpilationError],
    '.2');

test('Point type decimal number with trailing decimal separator that should throw an error',
    [transpilationError],
    '.2');

test('Point type decimal number with more than one decimal separator that should throw an error',
    [transpilationError],
    '1.2.3');

test('Point type decimal number with trailing decimal separator in simple function that should throw an error',
    [transpilationError],
    '\\sin(.2)');

// Comma type "," decimal numbers
test('Short comma type decimal number with leading zero',
    [transpilation, singleVars],
    '0,2', '0.2');

test('Long comma type decimal number with leading zero',
    [transpilation, singleVars],
    '1234,1234', '1234.1234');

test('Short comma type decimal number with leading zero in simple function',
    [transpilation, singleVars],
    '\\sin(0,2)', 'sin(0.2)');

test('Long comma type decimal number with leading zero in simple function',
    [transpilation, singleVars],
    '\\sin(1234,1234)', 'sin(1234.1234)');

test('comma type decimal number with leading decimal separator that should throw an error',
    [transpilationError],
    ',2');

test('Comma type decimal number with trailing decimal separator that should throw an error',
    [transpilationError],
    ',2');

test('Comma type decimal number with more than one decimal separator that should throw an error',
    [transpilationError],
    '1,2,3');

test('Comma type decimal number with trailing decimal separator in simple function that should throw an error',
    [transpilationError],
    '\\sin(,2)');