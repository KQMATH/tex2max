/**
 * @author     André Storhaug <andr3.storhaug@gmail.com>
 * @copyright  2018 NTNU
 */

export const TOKEN_TYPES = {
    WHITESPACE: {
        name: "WHITESPACE",
        symbol: " ",
        regex: /^\s+/
    },
    BACKSLASH: {
        name: "BACKSLASH",
        symbol: "\\",
        regex: /^[\\\\]$/
    },
    AMPERSAND: {
        name: "AMPERSAND",
        symbol: "&",
        regex: /^[&]$/
    },
    OPENING_BRACE: {
        name: "OPENING_BRACE",
        symbol: null,
        regex: /^[\{]$/
    },
    CLOSING_BRACE: {
        name: "CLOSING_BRACE",
        symbol: null,
        regex: /^[\}]$/
    },
    OPENING_PARENTHESES: {
        name: "OPENING_PARENTHESES",
        symbol: null,
        regex: /^[\(]$/
    },
    CLOSING_PARENTHESES: {
        name: "CLOSING_PARENTHESES",
        symbol: null,
        regex: /^[\)]$/
    },
    OPENING_BRACKET: {
        name: "BRACKET",
        symbol: null,
        regex: /^[\[]$/
    },
    CLOSING_BRACKET: {
        name: "BRACKET",
        symbol: null,
        regex: /^[\]]$/
    },
    NUMBER_LITERAL: {
        name: "NUMBER_LITERAL",
        symbol: null,
        regex: /^[0-9]+$/i
    },
    STRING_LITERAL: {
        name: "STRING_LITERAL",
        symbol: null,
        regex: /^[a-zA-Zα-ωΑ-Ω]+$/i
    },
    OPERATOR: {
        name: 'OPERATOR',
        symbol: null,
        regex: /^[+\-*/=^_!]$/i
    },
};
