import { uuid } from 'uuidv4';

/**
 * @class TokenHelper
 * @classdesc token helper utility methods
 */
export class TokenHelper {
    
    /**
     * token for google map api calls
     * @type {string}
     * @static
     */
    static token: string = '';

    /**
     * generate a new token if not exists
     * return current token else
     * @returns {string}
     * @static
     */
    static generateToken() {
        if (!TokenHelper.token) {
            const newToken = uuid();
            TokenHelper.token = newToken;
            return newToken;
        }
        return TokenHelper.token;
    }

    /**
     * clear current token
     * @static
     */
    static clearToken() {
        TokenHelper.token = '';
    }
}