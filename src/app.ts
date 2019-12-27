import express, {
    Application
} from 'express';
import { Controller } from './main.controller';
import bodyParser from 'body-parser';
import cors from 'cors';

import {
    JSON_DATA_LIMIT,
    FORM_DATA_LIMIT
} from './constants/westapi.contants';

/**
 * @class App
 * @classdesc Basic Application class contains express configuration
 */
class App {
    /**
     * application object
     * manages 'express' application
     * @type {Application}
     */
    public application: Application;

    /**
     * controller object
     * manages application routes
     * @type {Controller}
     */
    public controller: Controller;

    /**
     * constructor
     * init express
     * create config
     */
    constructor() {
        this.application = express();
        this._setConfig();
        this.controller = new Controller(this.application);
    }

    /**
     * set application config
     * application can receive data in json format (limited to 50mb)
     * application can receive data in x-www-form-urlencoded format (limited to 50mb)
     * enable cors
     * @private
     */
    private _setConfig() {
        this.application.use(bodyParser.json({
            limit: JSON_DATA_LIMIT
        }));

        this.application.use(bodyParser.urlencoded({
            limit: FORM_DATA_LIMIT,
            extended: true
        }));

        this.application.use(cors());
    }
}

export default new App().application;