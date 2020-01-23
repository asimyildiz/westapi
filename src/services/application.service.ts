import { Request, Response, Application } from 'express';
import { AuthHelper } from '../utils/auth.helper';
import { Device } from '../models/device.model';
import { 
    APPLICATION_LANGUAGES,
    APPLICATION_COUNTRIES
} from '../constants/westapi.contants';
import {
    ERROR_NO_AUTH
} from '../constants/errors.constants';

/**
 * @class ApplicationServices
 * @classdesc application service api methods
 */
export class ApplicationServices {
    /**
     * constructor
     * @param _application {Application} application object - constructor assignment
     */
    constructor(private _application: Application) { }

    /**
     * init application
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public init(request: Request, response: Response) { 
        const token = AuthHelper.register(request.body.apiKey, request.body.uuid);
        if (token) {
            this._registerDevice(request.body.uid);
            this._setApplicationLanguage(request.body.language);
            this._setApplicationCountry(request.body.country);
            response.json(token);
        }else {
            response.send(ERROR_NO_AUTH);
        }
    }

    /**
     * register device into database if not exists
     * and update lastAccessDate
     * @param uuid {string}
     */
    private _registerDevice(uuid: string) {
        Device.findOneAndUpdate({ uuid: uuid }, { $set : { 'lastAccessDate' : Date.now() } }, { upsert: true }).exec();
    }

    /**
     * set application language
     * @param language {string} application language to set
     * @private
     */
    private _setApplicationLanguage(language: string) {
        if (language && APPLICATION_LANGUAGES.indexOf(language) > -1) {
            this._application.set('language', language);
        }
    }

    /**
     * set application country
     * @param country {string} application country to set
     * @private
     */
    private _setApplicationCountry(country: string) {
        if (country && APPLICATION_COUNTRIES.indexOf(country) > -1) {
            this._application.set('country', country);
        }
    }

    /**
     * get application languages
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getApplicationLanguages(request: Request, response: Response) {        
        response.json(APPLICATION_LANGUAGES);
    }

    /**
     * get application countries
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getApplicationCountries(request: Request, response: Response) {
        response.json(APPLICATION_COUNTRIES);
    }

    /**
     * fake hello method to test if service works correctly
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public hello(request: Request, response: Response) {
        return response.status(200).send("Welcome to WestApi.ApplicationService");
    }
}