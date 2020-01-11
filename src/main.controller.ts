import { Application } from 'express';
import { LocationService } from './services/location.service';

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
     * @param _application {Application} application object - constructor assignment
     */
    constructor(private _application: Application) {
        const googleMapApi = this._application.get('googleMapApi');
        this._locationService = new LocationService(googleMapApi);
        this.routes();
    }

    /**
     * set routes for service apis
     */
    public routes() {
        this._application.route('/').get(this._locationService.hello);
        this._application.route('/addCity').post(this._locationService.addCity);
        this._application.route('/getAllCities').get(this._locationService.getAllCities);

        this._application.route('/addCounty/:id').post(this._locationService.addCounty);
        this._application.route('/getAllCounties').get(this._locationService.getAllCounties);

        this._application.route('/addLocation/:id').post(this._locationService.addLocation);
        this._application.route('/getAllLocations').get(this._locationService.getAllLocations);

        this._application.route('/getDirection').post(this._locationService.getDirection.bind(this._locationService));
    }
}