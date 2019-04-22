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

test('Simple finite integral with numerical arguments',
    [transpilation, singleVars],
    '\\int_0^1xdx', 'integrate((x),x,(0),(1))');

test.failing('Simple finite integral with variable arguments',
    transpilation,
    '\\int_a^bxdx', 'integrate((x),x,(a),(b))');

test('Simple finite integral with variable arguments',
    singleVars,
    '\\int_a^bxdx', 'integrate((x),x,(a),(b))');

test('Simple finite integral with brackets around argument',
    [transpilation, singleVars],
    '\\int_0^1\\left(x\\right)dx', 'integrate(((x)),x,(0),(1))');
