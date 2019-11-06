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
        symbol: "{",
        regex: /^[\{]$/
    },
    CLOSING_BRACE: {
        name: "CLOSING_BRACE",
        symbol: "}",
        regex: /^[\}]$/
    },
    OPENING_PARENTHESES: {
        name: "OPENING_PARENTHESES",
        symbol: "(",
        regex: /^[\(]$/
    },
    CLOSING_PARENTHESES: {
        name: "CLOSING_PARENTHESES",
        symbol: ")",
        regex: /^[\)]$/
    },
    OPENING_BRACKET: {
        name: "BRACKET",
        symbol: "[",
        regex: /^[\[]$/
    },
    CLOSING_BRACKET: {
        name: "BRACKET",
        symbol: "]",
        regex: /^[\]]$/
    },
    VERTICAL_BAR: {
        name: "VERTICAL_BAR",
        symbol: "|",
        regex: /^[|]$/
    },
    NUMBER_LITERAL: {
        name: "NUMBER_LITERAL",
        symbol: null,
        regex: /^[0-9]+$/i
    },
    PERIOD: {
        name: "PERIOD",
        symbol: ".",
        regex: /^[.]$/
    },
    COMMA: {
        name: "COMMA",
        symbol: ",",
        regex: /^[,]$/
    },
    STRING_LITERAL: {
        name: "STRING_LITERAL",
        symbol: null,
        regex: /^[a-zA-Zα-ωΑ-Ω]+$/iu
    },
    OPERATOR: {
        name: 'OPERATOR',
        symbol: null,
        regex: /^[+\-*/=^_!]$/i
    },
};
