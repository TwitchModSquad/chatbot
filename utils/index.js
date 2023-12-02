const Schemas = require("./schemas/");
const Twitch = require("./twitch/");

class Utils {

    Schemas = Schemas;
    Twitch = Twitch;

    /**
     * Generates a random string of (length) length.
     * @param {number} length 
     * @returns {string} Generated String
     */
    stringGenerator(length = 32) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;
    }

    /**
     * Converts a number into a string with commas
     * Example: 130456 -> 130,456
     * @param {number} num 
     * @returns {string}
     */
    comma(num) {
        if (!num) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

}

module.exports = new Utils();
