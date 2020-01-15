import { Application } from 'express';
import { LocationServices } from './services/location.service';
import { VehicleServices } from './services/vehicle.service';
import { ReservationServices } from './services/reservation.service';

/**
 * @class Controller
 * @classdesc controller for WestApi service which manages routes
 */
export class Controller {
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
        this._initLocationService();
        this._initVehicleService();
        this._initReservationService();
        this.routes();
    }

    /**
     * init location service with googleMapApi
     * @private
     */
    private _initLocationService() {
        const googleMapApi = this._application.get('googleMapApi');
        this._locationServices = new LocationServices(googleMapApi);
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
        this._addLocationServiceRoutes();
        this._addVehicleServiceRoutes();
        this._addReservationServiceRoutes();
    }

    /**
     * add routes for location related services
     * @private
     */
    private _addLocationServiceRoutes() {
        this._application.route('/addCity').post(this._locationServices.addCity);
        this._application.route('/getAllCities').get(this._locationServices.getAllCities);

        this._application.route('/addCounty/:id').post(this._locationServices.addCounty);
        this._application.route('/getAllCounties').get(this._locationServices.getAllCounties);

        this._application.route('/addLocation/:id').post(this._locationServices.addLocation);
        this._application.route('/getAllLocations').get(this._locationServices.getAllLocations);

        this._application.route('/getDirection').post(this._locationServices.getDirection.bind(this._locationServices));
    }

    /**
     * add routes for vehicle related services
     * @private
     */
    private _addVehicleServiceRoutes() {
        this._application.route('/addVehicle').post(this._vehicleServices.addVehicle.bind(this._vehicleServices));
        this._application.route('/addVehiclePrice/:id').post(this._vehicleServices.addVehiclePrice);
        this._application.route('/addVehiclePricesDiscount/:id').post(this._vehicleServices.addVehiclePricesDiscount);
        this._application.route('/getAllVehicles').get(this._vehicleServices.getAllVehicles);
        this._application.route('/getAllVehiclePrices').get(this._vehicleServices.getAllVehiclePrices);
        this._application.route('/getAllVehiclePricesDiscounts').get(this._vehicleServices.getAllVehiclePricesDiscounts);

        this._application.route('/addService').post(this._vehicleServices.addService.bind(this._vehicleServices));
        this._application.route('/getAllServices').get(this._vehicleServices.getAllServices);

        this._application.route('/addServiceForVehicle/:vehicleId/:serviceId').post(this._vehicleServices.addServiceForVehicle.bind(this._vehicleServices));
        this._application.route('/getAllServicesForAllVehicles').get(this._vehicleServices.getAllServicesForAllVehicles);
    }

    /**
     * add routes for reservation related services
     * @private
     */
    private _addReservationServiceRoutes() {
        this._application.route('/addReservation').post(this._reservationServices.addReservation);
    }
}