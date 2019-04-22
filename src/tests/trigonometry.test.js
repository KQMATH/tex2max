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

// Trigonometric functions
test('Sine',
    [transpilation, singleVars],
    '\\sin x', 'sin(x)');

test('Cosine',
    [transpilation, singleVars],
    '\\cos x', 'cos(x)');

test('Tangent',
    [transpilation, singleVars],
    '\\tan x', 'tan(x)');

test('Secant',
    [transpilation, singleVars],
    '\\sec x', 'sec(x)');

test('Cosecant',
    [transpilation, singleVars],
    '\\csc x', 'csc(x)');

test('Cotangent',
    [transpilation, singleVars],
    '\\cot x', 'cot(x)');

// Inverse trigonometric functions
test('Inverse sine',
    [transpilation, singleVars],
    '\\sin^{-1}x', 'asin(x)');

test('Inverse cosine',
    [transpilation, singleVars],
    '\\cos^{-1}x', 'acos(x)');

test('Inverse tangent',
    [transpilation, singleVars],
    '\\tan^{-1}x', 'atan(x)');

test('Inverse secant',
    [transpilation, singleVars],
    '\\sec^{-1}x', 'asec(x)');

test('Inverse cosecant',
    [transpilation, singleVars],
    '\\csc^{-1}x', 'acsc(x)');

test('Inverse cotangent',
    [transpilation, singleVars],
    '\\cot^{-1}x', 'acot(x)');

// Inverse trigonometric functions with squared argument
test('Inverse sine with squared argument',
    [transpilation, singleVars],
    '\\sin^{-1}x^2', 'asin(x^2)');

test('Inverse cosine with squared argument',
    [transpilation, singleVars],
    '\\cos^{-1}x^2', 'acos(x^2)');

test('Inverse tangent with squared argument',
    [transpilation, singleVars],
    '\\tan^{-1}x^2', 'atan(x^2)');

// Inverse trigonometric functions with squared argument
test('Inverse secant with squared argument',
    [transpilation, singleVars],
    '\\sec^{-1}x^2', 'asec(x^2)');

test('Inverse cosecant with squared argument',
    [transpilation, singleVars],
    '\\csc^{-1}x^2', 'acsc(x^2)');

test('Inverse cotangent with squared argument',
    [transpilation, singleVars],
    '\\cot^{-1}x^2', 'acot(x^2)');

// Inverse of a trigonometric expression
test('Inverse of sine expression',
    [transpilation, singleVars],
    '\\sin^{-2}x', '(sin(x))^(-2)');

test('Inverse of cosine expression',
    [transpilation, singleVars],
    '\\cos^{-2}x', '(cos(x))^(-2)');

test('Inverse of tangent expression',
    [transpilation, singleVars],
    '\\tan^{-2}x', '(tan(x))^(-2)');

test('Inverse of secant expression',
    [transpilation, singleVars],
    '\\sec^{-2}x', '(sec(x))^(-2)');

test('Inverse of cosecant expression',
    [transpilation, singleVars],
    '\\csc^{-2}x', '(csc(x))^(-2)');

test('Inverse of cotangent expression',
    [transpilation, singleVars],
    '\\cot^{-2}x', '(cot(x))^(-2)');

// Hyperbolic trigonometric functions
test('Hyperbolic sine',
    [transpilation, singleVars],
    '\\sinh x', 'sinh(x)');

test('Hyperbolic cosine',
    [transpilation, singleVars],
    '\\cosh x', 'cosh(x)');

test('Hyperbolic tangent',
    [transpilation, singleVars],
    '\\tanh x', 'tanh(x)');

test('Hyperbolic secant',
    [transpilation, singleVars],
    '\\sech x', 'sech(x)');

test('Hyperbolic cosecant',
    [transpilation, singleVars],
    '\\csch x', 'csch(x)');

test('Hyperbolic cotangent',
    [transpilation, singleVars],
    '\\coth x', 'coth(x)');

// Inverse trigonometric functions
test('Inverse hyperbolic sine',
    [transpilation, singleVars],
    '\\sinh^{-1}x', 'asinh(x)');

test('Inverse hyperbolic cosine',
    [transpilation, singleVars],
    '\\cosh^{-1}x', 'acosh(x)');

test('Inverse hyperbolic tangent',
    [transpilation, singleVars],
    '\\tanh^{-1}x', 'atanh(x)');

test('Inverse hyperbolic secant',
    [transpilation, singleVars],
    '\\sech^{-1}x', 'asech(x)');

test('Inverse hyperbolic cosecant',
    [transpilation, singleVars],
    '\\csch^{-1}x', 'acsch(x)');

test('Inverse hyperbolic cotangent',
    [transpilation, singleVars],
    '\\coth^{-1}x', 'acoth(x)');

// Inverse trigonometric functions with squared argument
test('Inverse hyperbolic sine with squared argument',
    [transpilation, singleVars],
    '\\sinh^{-1}x^2', 'asinh(x^2)');

test('Inverse hyperbolic cosine with squared argument',
    [transpilation, singleVars],
    '\\cosh^{-1}x^2', 'acosh(x^2)');

test('Inverse hyperbolic tangent with squared argument',
    [transpilation, singleVars],
    '\\tanh^{-1}x^2', 'atanh(x^2)');

test('Inverse hyperbolic secant with squared argument',
    [transpilation, singleVars],
    '\\sech^{-1}x^2', 'asech(x^2)');

test('Inverse hyperbolic cosecant with squared argument',
    [transpilation, singleVars],
    '\\csch^{-1}x^2', 'acsch(x^2)');

test('Inverse hyperbolic cotangent with squared argument',
    [transpilation, singleVars],
    '\\coth^{-1}x^2', 'acoth(x^2)');

// Inverse of a trigonometric expression
test('Inverse of hyperbolic sine expression',
    [transpilation, singleVars],
    '\\sinh^{-2}x', '(sinh(x))^(-2)');

test('Inverse of hyperbolic cosine expression',
    [transpilation, singleVars],
    '\\cosh^{-2}x', '(cosh(x))^(-2)');

test('Inverse of hyperbolic tangent expression',
    [transpilation, singleVars],
    '\\tanh^{-2}x', '(tanh(x))^(-2)');

test('Inverse of hyperbolic secant expression',
    [transpilation, singleVars],
    '\\sech^{-2}x', '(sech(x))^(-2)');

test('Inverse of hyperbolic cosecant expression',
    [transpilation, singleVars],
    '\\csch^{-2}x', '(csch(x))^(-2)');

test('Inverse of hyperbolic cotangent expression',
    [transpilation, singleVars],
    '\\coth^{-2}x', '(coth(x))^(-2)');

// Inverse  trigonometric functions "arc" variation
test('"arc" type inverse cosine ',
    [transpilation, singleVars],
    '\\arccos x', 'acos(x)');

test('"arc" type inverse hyperbolic cosine ',
    [transpilation, singleVars],
    '\\arccosh x', 'acosh(x)');

test('"arc" type inverse cotangent ',
    [transpilation, singleVars],
    '\\arccot x', 'acot(x)');

test('"arc" type inverse hyperbolic cotangent ',
    [transpilation, singleVars],
    '\\arccoth x', 'acoth(x)');

test('"arc" type inverse cosecant ',
    [transpilation, singleVars],
    '\\arccsc x', 'acsc(x)');

test('"arc" type inverse hyperbolic cosecant ',
    [transpilation, singleVars],
    '\\arccsch x', 'acsch(x)');

test('"arc" type inverse secant ',
    [transpilation, singleVars],
    '\\arcsec x', 'asec(x)');

test('"arc" type inverse hyperbolic secant ',
    [transpilation, singleVars],
    '\\arcsech x', 'asech(x)');

test('"arc" type inverse sine ',
    [transpilation, singleVars],
    '\\arcsin x', 'asin(x)');

test('"arc" type inverse hyperbolic sine ',
    [transpilation, singleVars],
    '\\arcsinh x', 'asinh(x)');

test('"arc" type inverse tangent ',
    [transpilation, singleVars],
    '\\arctan x', 'atan(x)');

test('"arc" type inverse hyperbolic tangent ',
    [transpilation, singleVars],
    '\\arctanh x', 'atanh(x)');
