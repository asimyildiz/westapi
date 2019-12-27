import {
    Application
} from 'express';
import {
    LocationService
} from './services/location.service';

/**
 * @class Controller
 * @classdesc controller for WestApi service which manages routes
 */
export class Controller {
    /**
     * location service object
     * @type {LocationService}
     */
    private _locationService: LocationService;

    /**
     * constructor
     * init location service
     * set routes
     */
    constructor(private application: Application) {
        this._locationService = new LocationService();
        this.routes();
    }

    /**
     * set routes for service apis
     */
    public routes() {
        this.application.route('/').get(this._locationService.hello);
    }
}