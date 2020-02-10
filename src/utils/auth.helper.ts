import { Request, Response, NextFunction } from 'express';
import dateFormat from 'dateformat';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
    APPLICATION_API_KEY,    
    APPLICATION_IDS,
    SECRET_KEY
} from '../constants/westapi.contants';
import {
    ERROR_NO_AUTH
} from '../constants/errors.constants';

/**
 * @class AuthHelper
 * @classdesc auth helper utility methods
 */
export class AuthHelper {    
    /**
     * check if the application using an encrypted api key is a valid application
     * if it is a valid application returns a jwt token
     * else return empty token
     * @param apiKey {string} encrypted apiKey of the client
     * @param uuid {string} unique id of the device
     * @returns {string}
     */
    static register(apiKey: string, uuid: string) {
        const currentDate = new Date();
        const validApplication = AuthHelper.findApiKey(apiKey, currentDate);
        // if request is stalled at least a minute on client, we need to check for previous minute at least if key not found
        if (validApplication || AuthHelper.findApiKey(apiKey, AuthHelper.getPreviousMinuteOf(currentDate))) {
            // token not expires
            const token = jwt.sign({
                apiKey: apiKey,
                uuid: uuid
            }, SECRET_KEY);
            return token;
        }
        return '';
    }

    /**
     * returns previous minute of date object passed to the method
     * @param currentDate {Date} date object to get previous minute value 
     * @returns {Date}
     */
    static getPreviousMinuteOf(currentDate: Date) {
        return new Date(currentDate.setMinutes(currentDate.getMinutes() - 1));
    }

    /**
     * find a valid api, inside all api list
     * by generating the md5 hashing and checking against the apiKey passed from client
     * return applicationId matched or undefined
     * @param apiKey {string} encrypted apiKey of the client
     * @param currentDate {Date} current date value
     * @returns {string} 
     */
    static findApiKey(apiKey: string, currentDate: Date) {
        return APPLICATION_IDS.find(AuthHelper.checkApiKey.bind(null, apiKey, dateFormat(currentDate, "UTC:yyyy-mm-dd h:MM")));
    }

    /**
     * generate an app id using the algorithm (applicationId + APP_KEY + (yyyy-mm-dd h:MM))
     * hash it using md5 hashing and check it against the encrypted api key passed to the service from client
     * @param apiKey {string} encrypted apiKey of the client
     * @param currentDate {string} current formatted date value (yyyy-mm-dd h:MM)
     * @param applicationId {string} application id
     * @returns {boolean}
     */
    static checkApiKey(apiKey: string, currentDate: string, applicationId: string) {        
        // client needs to calculate date value using server time zone, such as GMT+3
        const notEncryptedApiKey = applicationId + APPLICATION_API_KEY + currentDate;
        const encryptedApiKey = crypto.createHash('md5').update(notEncryptedApiKey).digest("hex");        
        return (encryptedApiKey == apiKey);        
    }

    /**
     * authenticate application first
     * @param request {Request} express request object
     * @param response {Response} express response object
     * @param next {NextFunction} next api method
     * @static
     */
    static authenticate(request: Request, response: Response, next: NextFunction) {        
        try {
            if (request.headers && request.headers.authorization) {
                const authorizationItems = request.headers.authorization.split(' ');
                if (authorizationItems.length > 1 && authorizationItems[0] == 'Bearer') {
                    const token = authorizationItems[1];
                    const decodedToken = jwt.verify(token, SECRET_KEY);
                    request.userData = decodedToken;
                    next();
                }else {
                    response.send(ERROR_NO_AUTH);
                }                
            }else {
                response.send(ERROR_NO_AUTH);
            }         
        }catch(error) {
            response.send(ERROR_NO_AUTH);
        }
    }
}