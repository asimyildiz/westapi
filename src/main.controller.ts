import { Application } from 'express';
import { ApplicationServices } from './services/application.service';
import { LocationServices } from './services/location.service';
import { VehicleServices } from './services/vehicle.service';
import { ReservationServices } from './services/reservation.service';
import { UserServices } from './services/user.service';
import { PoiServices } from './services/poi.service';
import { PaymentServices } from './services/payment.service';
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
     * user service object
     * @type {UserServices}
     * @private 
     */
    private _userServices!: UserServices;

    /**
     * poi service object
     * @type {PoiServices}
     * @private
     */
    private _poiServices!: PoiServices;

    /**
     * payment service object
     * @type {PaymentServices}
     * @private
     */
    private _paymentServices!: PaymentServices;

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
        this._initUserService();
        this._initPoiService();        
        this._initPaymentService();
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
     * init user services
     * @private
     */
    private _initUserService() {
        this._userServices = new UserServices();
    }

    /**
     * init poi services
     * @private
     */
    private _initPoiService() {
        this._poiServices = new PoiServices();
    }

    /**
     * init payment services
     * @private
     */
    private _initPaymentService() {
        this._paymentServices = new PaymentServices();
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
        this._addUserServiceRoutes();
        this._addPoiServiceRoutes();
        this._addPaymentServiceRoutes();
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
        this._application.route('/getClosestPlaces').post(AuthHelper.authenticate, this._locationServices.getClosestPlaces.bind(this._locationServices));
        this._application.route('/getLocationAddress').post(AuthHelper.authenticate, this._locationServices.getLocationAddress.bind(this._locationServices));
        this._application.route('/getLocationDetail').post(AuthHelper.authenticate, this._locationServices.getLocationDetail.bind(this._locationServices));
        this._application.route('/getRoute').post(AuthHelper.authenticate, this._locationServices.getRoute.bind(this._locationServices));
    }

    /**
     * add routes for vehicle related services
     * @private
     */
    private _addVehicleServiceRoutes() {        
        this._application.route('/getAllServices').get(AuthHelper.authenticate, this._vehicleServices.getAllServices);
        this._application.route('/getAllVehicles').post(AuthHelper.authenticate, this._vehicleServices.getAllVehicles.bind(this._vehicleServices));
        this._application.route('/getAllVehiclePrices').get(AuthHelper.authenticate, this._vehicleServices.getAllVehiclePrices);
        this._application.route('/getAllVehiclePricesDiscounts').get(AuthHelper.authenticate, this._vehicleServices.getAllVehiclePricesDiscounts);

        // THESE METHODS WILL REQUIRE AN ADMIN LOGIN
        this._application.route('/getAllVehicleList').get(AuthHelper.authenticate, this._vehicleServices.getAllVehicleList);
        this._application.route('/addVehicle').post(AuthHelper.authenticate, this._vehicleServices.addVehicle.bind(this._vehicleServices));
        this._application.route('/addVehiclePrice/:id').post(AuthHelper.authenticate, this._vehicleServices.addVehiclePrice);
        this._application.route('/addVehiclePricesDiscount/:id').post(AuthHelper.authenticate, this._vehicleServices.addVehiclePricesDiscount);        
        this._application.route('/addService').post(AuthHelper.authenticate, this._vehicleServices.addService.bind(this._vehicleServices));        
        this._application.route('/addServiceForVehicle/:vehicleId/:serviceId').post(AuthHelper.authenticate, this._vehicleServices.addServiceForVehicle.bind(this._vehicleServices));        
    }

    /**
     * add routes for reservation related services
     * @private
     */
    private _addReservationServiceRoutes() {
        this._application.route('/addCustomer').post(AuthHelper.authenticate, this._reservationServices.addCustomer);
        this._application.route('/getCustomersOfUser/:userId').post(AuthHelper.authenticate, this._reservationServices.getCustomersOfUser);
        this._application.route('/addReservation').post(AuthHelper.authenticate, this._reservationServices.addReservation);
    }

    /**
     * add routes for user related services
     * @private
     */
    private _addUserServiceRoutes() {
        this._application.route('/addUser').post(AuthHelper.authenticate, this._userServices.addUser);
        this._application.route('/login').post(AuthHelper.authenticate, this._userServices.login);

        // THESE METHODS WILL REQUIRE AN ADMIN LOGIN
        this._application.route('/getAllUsers').post(AuthHelper.authenticate, this._userServices.getAllUsers);
        this._application.route('/updateUser/:id').post(AuthHelper.authenticate, this._userServices.updateUser);
        this._application.route('/deleteUser/:id').delete(AuthHelper.authenticate, this._userServices.deleteUser);
    }

    /**
     * add routes for poi related services
     * @private
     */
    private _addPoiServiceRoutes() {
        this._application.route('/getAllPoi').get(AuthHelper.authenticate, this._poiServices.getAllPoi);
        
        // THESE METHODS WILL REQUIRE AN ADMIN LOGIN
        this._application.route('/addPoi').post(AuthHelper.authenticate, this._poiServices.addPoi);        
        this._application.route('/updatePoi/:id').post(AuthHelper.authenticate, this._poiServices.updatePoi);
        this._application.route('/deletePoi/:id').delete(AuthHelper.authenticate, this._poiServices.deletePoi);
    }

    /**
     * add routes for payment related services
     * @private
     */
    private _addPaymentServiceRoutes() {
        this._application.route('/pay').post(this._paymentServices.enroll.bind(this._paymentServices));        
    }
}