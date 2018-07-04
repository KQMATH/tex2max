/**
 * @author     André Storhaug <andr3.storhaug+code@gmail.com>
 * @copyright  2018 NTNU
 */

define(function () {
    /**
     * Simple token class.
     */
    class Token {
        constructor(type, value,) {
            this.value = value;
            this.type = type;
        }
    }

    return Token;
});