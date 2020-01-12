import { Application } from 'express';
import { LocationService } from './services/location.service';
import { VehicleService } from './services/vehicle.service';

/**
 * @class Controller
 * @classdesc controller for WestApi service which manages routes
 */
export class Controller {
    /**
     * location service object
     * @type {LocationService}
     * @private
     */
    private _locationService!: LocationService;

    /**
     * vehicle service object
     * @type {VehicleService}
     * @private 
     */
    private _vehicleService!: VehicleService;

    /**
     * constructor
     * init location service
     * set routes
     * @param _application {Application} application object - constructor assignment
     */
    constructor(private _application: Application) {
        this._initLocationService();
        this._initVehicleService();
        this.routes();
    }

    /**
     * init location service with googleMapApi
     * @private
     */
    private _initLocationService() {
        const googleMapApi = this._application.get('googleMapApi');
        this._locationService = new LocationService(googleMapApi);
    }

    /**
     * init vehicle service with fileStorage (to upload images)
     * @private
     */
    private _initVehicleService() {
        const storage = this._application.get('fileStorage');
        this._vehicleService = new VehicleService(storage);
    }

    /**
     * set routes for service apis
     */
    public routes() {
        this._application.route('/').get(this._locationService.hello);
        this._addLocationServiceRoutes();
        this._addVehicleServiceRoutes();
    }

    /**
     * add routes for location related services
     * @private
     */
    private _addLocationServiceRoutes() {
        this._application.route('/addCity').post(this._locationService.addCity);
        this._application.route('/getAllCities').get(this._locationService.getAllCities);

        this._application.route('/addCounty/:id').post(this._locationService.addCounty);
        this._application.route('/getAllCounties').get(this._locationService.getAllCounties);

        this._application.route('/addLocation/:id').post(this._locationService.addLocation);
        this._application.route('/getAllLocations').get(this._locationService.getAllLocations);

        this._application.route('/getDirection').post(this._locationService.getDirection.bind(this._locationService));
    }

    /**
     * add routes for vehicle related services
     * @private
     */
    private _addVehicleServiceRoutes() {
        this._application.route('/addVehicle').post(this._vehicleService.addVehicle.bind(this._vehicleService));
    }
}