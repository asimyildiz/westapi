import { Application } from 'express';
import { ApplicationServices } from './services/application.service';
import { LocationServices } from './services/location.service';
import { VehicleServices } from './services/vehicle.service';
import { ReservationServices } from './services/reservation.service';
import { AuthHelper } from './utils/auth.helper';

/**
 * @class Controller
 * @classdesc controller for WestApi service which manages routes
 */
export class Controller {
    /**
     * application service object
     * @type {ApplicationServices}
     * @private
     */
    private _applicationServices!: ApplicationServices;

    /**
     * location service object
     * @type {LocationServices}
     * @private
     */
    private _locationServices!: LocationServices;

    /**
     * vehicle service object
     * @type {VehicleServices}
     * @private 
     */
    private _vehicleServices!: VehicleServices;
    
    /**
     * reservation service object
     * @type {ReservationServices}
     * @private
     */
    private _reservationServices!: ReservationServices;

    /**
     * constructor
     * init location service
     * set routes
     * @param _application {Application} application object - constructor assignment
     */
    constructor(private _application: Application) {
        this._initApplicationService();
        this._initLocationService();
        this._initVehicleService();
        this._initReservationService();
        this.routes();
    }

    /**
     * init application service with current application object
     * @private
     */
    private _initApplicationService() {
        this._applicationServices = new ApplicationServices(this._application);
    }

    /**
     * init location service with googleMapApi
     * @private
     */
    private _initLocationService() {
        const googleMapApi = this._application.get('googleMapApi');
        const language = this._application.get('language');
        const country = this._application.get('country');
        this._locationServices = new LocationServices(language, country, googleMapApi);
    }

    /**
     * init vehicle service with fileStorage (to upload images)
     * @private
     */
    private _initVehicleService() {
        const storage = this._application.get('fileStorage');
        const iconFileStorage = this._application.get('iconFileStorage');
        this._vehicleServices = new VehicleServices(storage, iconFileStorage);
    }

    /**
     * init reservation service
     * @private
     */
    private _initReservationService() {
        this._reservationServices = new ReservationServices();
    }

    /**
     * set routes for service apis
     */
    public routes() {
        this._application.route('/').get(this._locationServices.hello);
        this._addApplicationServiceRoutes();
        this._addLocationServiceRoutes();
        this._addVehicleServiceRoutes();
        this._addReservationServiceRoutes();
    }

    /**
     * add routes for application related services
     * @private
     */
    private _addApplicationServiceRoutes() {
        this._application.route('/init').post(this._applicationServices.init.bind(this._applicationServices));
        this._application.route('/getApplicationLanguages').get(this._applicationServices.getApplicationLanguages);
        this._application.route('/getApplicationCountries').get(this._applicationServices.getApplicationCountries);
    }

    /**
     * add routes for location related services
     * @private
     */
    private _addLocationServiceRoutes() {
        this._application.route('/addCity').post(AuthHelper.authenticate, this._locationServices.addCity);
        this._application.route('/getAllCities').get(AuthHelper.authenticate, this._locationServices.getAllCities);

        this._application.route('/addCounty/:id').post(AuthHelper.authenticate, this._locationServices.addCounty);
        this._application.route('/getAllCounties').get(AuthHelper.authenticate, this._locationServices.getAllCounties);

        this._application.route('/addLocation/:id').post(AuthHelper.authenticate, this._locationServices.addLocation);
        this._application.route('/getAllLocations').get(AuthHelper.authenticate, this._locationServices.getAllLocations);

        this._application.route('/getDirection').post(AuthHelper.authenticate, this._locationServices.getDirection.bind(this._locationServices));
        this._application.route('/getClosestPlaces').post(AuthHelper.authenticate, this._locationServices.getClosestPlaces.bind(this._locationServices));
        this._application.route('/getLocationAddress').post(AuthHelper.authenticate, this._locationServices.getLocationAddress.bind(this._locationServices));
        this._application.route('/getRoute').post(AuthHelper.authenticate, this._locationServices.getRoute.bind(this._locationServices));
    }

    /**
     * add routes for vehicle related services
     * @private
     */
    private _addVehicleServiceRoutes() {
        this._application.route('/addVehicle').post(AuthHelper.authenticate, this._vehicleServices.addVehicle.bind(this._vehicleServices));
        this._application.route('/addVehiclePrice/:id').post(AuthHelper.authenticate, this._vehicleServices.addVehiclePrice);
        this._application.route('/addVehiclePricesDiscount/:id').post(AuthHelper.authenticate, this._vehicleServices.addVehiclePricesDiscount);
        this._application.route('/getAllVehicles').get(AuthHelper.authenticate, this._vehicleServices.getAllVehicles);
        this._application.route('/getAllVehiclePrices').get(AuthHelper.authenticate, this._vehicleServices.getAllVehiclePrices);
        this._application.route('/getAllVehiclePricesDiscounts').get(AuthHelper.authenticate, this._vehicleServices.getAllVehiclePricesDiscounts);

        this._application.route('/addService').post(AuthHelper.authenticate, this._vehicleServices.addService.bind(this._vehicleServices));
        this._application.route('/getAllServices').get(AuthHelper.authenticate, this._vehicleServices.getAllServices);

        this._application.route('/addServiceForVehicle/:vehicleId/:serviceId').post(AuthHelper.authenticate, this._vehicleServices.addServiceForVehicle.bind(this._vehicleServices));
        this._application.route('/getAllServicesForAllVehicles').get(AuthHelper.authenticate, this._vehicleServices.getAllServicesForAllVehicles);
    }

    /**
     * add routes for reservation related services
     * @private
     */
    private _addReservationServiceRoutes() {
        this._application.route('/addReservation').post(AuthHelper.authenticate, this._reservationServices.addReservation);
    }
}