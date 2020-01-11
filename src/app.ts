import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import GoogleMapAPI from '@google/maps';
import { Controller } from './main.controller';

import {
    DATABASE_CONNECTION,
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
        this._setDatabaseConfig();
        this._setGoogleMapAPIConfig();
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

    /**
     * set database config
     * for now we are using mongoDB and mongoose to manage database
     * @private
     */
    private _setDatabaseConfig() {
        mongoose.Promise = global.Promise;
        mongoose.connect(DATABASE_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
            // drop database if needed
            // mongoose.connection.db.dropDatabase();
        });
    }

    /**
     * set google map api config
     * @private
     */
    private _setGoogleMapAPIConfig() {         
        const googleMapApi = GoogleMapAPI.createClient({
            key: 'AIzaSyCdzYtHIF_8y5wvAe9ad30VuaYB0USZdhY',
            Promise: global.Promise 
        });
        this.application.set('googleMapApi', googleMapApi);
    }
}

export default new App().application;