import { Request, Response } from 'express';
import { GoogleMapsClientWithPromise } from '@google/maps';
import { MongooseDocument, Mongoose } from 'mongoose';
import { City } from '../models/city.model';
import { County } from '../models/county.model';
import { Location, getLocation } from '../models/location.model';
import * as ErrorMessages from '../constants/errors.constants';
import { TokenHelper } from '../utils/token.helper';
import { 
    DEFAULT_RADIUS_FOR_SEARCH
} from '../constants/westapi.contants';

/**
 * @class LocationServices
 * @classdesc location service api methods
 */
export class LocationServices {

    /**
     * session token
     * @type {string}
     * @private
     */
    private _sessionToken: string;

    /**
     * constructor
     * @param _language {string} application language - constructor assignment
     * @param _country {string} application country - constructor assignment
     * @param _googleMapApi {GoogleMapsClientWithPromise} google map api object - constructor assignment
     */
    constructor(private _language: string, private _country: string, private _googleMapApi: GoogleMapsClientWithPromise) { 
        this._sessionToken = '';
    }

    /**
     * add a new city into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addCity(request: Request, response: Response) {
        const newCity = new City(request.body);
        newCity.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }
            response.json(document);
        });
    }

    /**
     * list all cities from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllCities(request: Request, response: Response) {
        City.find({})
            .populate({
                path: 'counties',
                populate: {
                    path: 'locations',
                    model: 'Location'
                }
            })
            .exec((error: Error, document: MongooseDocument) => {
                if (error) {
                    response.send(error);
                    return;
                }
                response.json(document);
            });
    }

    /**
     * add a new county into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addCounty(request: Request, response: Response) {
        const newCounty = new County(request.body);
        newCounty.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            City.findOneAndUpdate({ _id: request.params.id }, { $push: { counties: document._id }}, { new: true })
                .populate({
                    path: 'counties',
                    populate: {
                        path: 'locations',
                        model: 'Location'
                    }
                })
                .exec((errorCity: Error, documentCity: any) => {
                    if (errorCity) {
                        response.send(errorCity);
                        return;
                    }

                    response.json(documentCity);    
                });
        });
    }

    /**
     * list all counties from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllCounties(request: Request, response: Response) {
        County.find({})
            .populate('locations')
            .exec((error: Error, document: MongooseDocument) => {
                if (error) {
                    response.send(error);
                    return;
                }
                response.json(document);
            });
    }

    /**
     * add a new location into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addLocation(request: Request, response: Response) {
        const newLocation = new Location(request.body);
        newLocation.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            County.findOneAndUpdate({ _id: request.params.id }, { $push: { locations: document._id }}, { new: true })
                .populate('locations')
                .exec((errorCounty: Error, documentCounty: any) => {
                    if (errorCounty) {
                        response.send(errorCounty);
                        return;
                    }

                    response.json(documentCounty);    
                });
        });
    }

    /**
     * list all locations from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllLocations(request: Request, response: Response) {
        Location.find({}, (error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }
            response.json(document);
        });
    }

    /**
     * find location between two points
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getDirection(request: Request, response: Response) {
        const locationData = request.body.data;
        if (Array.isArray(locationData) && locationData.length == 2) {
            const fromLocation = getLocation(new Location(locationData[0]));
            const toLocation = getLocation(new Location(locationData[1]));
            this._googleMapApi.directions({
                origin: fromLocation,
                destination: toLocation,
            })
            .asPromise()
            .then((mapResponse) => {                
                response.json(mapResponse.json);
            }).catch(error => response.send(error));
        }else {
            response.send(ErrorMessages.ERROR_LOCATION_SERVICE_GETDIRECTION_1000);
        }
    }

    /**
     * find location between two points using latitude and longitude
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getRoute(request: Request, response: Response) {
        const fromLatitude = request.body.fromLatitude;
        const fromLongitude = request.body.fromLongitude;
        const toLatitude = request.body.toLatitude;
        const toLongitude = request.body.toLongitude;
        if (fromLatitude && fromLongitude && toLatitude && toLongitude) {
            this._googleMapApi.directions({
                origin: `${fromLatitude},${fromLongitude}`,
                destination: `${toLatitude},${toLongitude}`,
            })
            .asPromise()
            .then((mapResponse) => {                
                response.json(mapResponse.json);
            }).catch(error => response.send(error));
        }else {
            response.send(ErrorMessages.ERROR_LOCATION_SERVICE_GETROUTE_1001);
        }
    }

    /**
     * find closest location to a latitude and longitude with an input address
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getClosestPlaces(request: Request, response: Response) {
        const address = request.body.input;
        if (address) {
            let autoCompleteOptions: any = {
                input: address,
                language: this._language,
                components: {
                    country: [this._country]
                },
                sessiontoken: TokenHelper.generateToken()
            };
                
            const latitude = request.body.latitude;
            const longitude = request.body.longitude;
            if (latitude && longitude) {
                autoCompleteOptions.location = [latitude, longitude],
                autoCompleteOptions.radius = DEFAULT_RADIUS_FOR_SEARCH;
            }

            this._googleMapApi.placesAutoComplete(autoCompleteOptions)
            .asPromise()
            .then((mapResponse) => {
                response.json(mapResponse.json.predictions);
            }).catch(error => response.send(error));
        }else {
            response.send(ErrorMessages.ERROR_LOCATION_SERVICE_ADDRESS_1003);
        }
    }

    /**
     * find address from latitude and longitude
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getLocationAddress(request: Request, response: Response) {
        const latitude = request.body.latitude;
        const longitude = request.body.longitude;
        if (latitude && longitude) {
            this._googleMapApi.reverseGeocode({
                latlng: `${latitude},${longitude}`
            })
            .asPromise()
            .then((mapResponse) => {
                response.json(mapResponse.json.results);
            }).catch(error => response.send(error));
        }else {
            response.send(ErrorMessages.ERROR_LOCATION_SERVICE_GETADDRESS_1002);
        }
    }

    /**
     * fake hello method to test if service works correctly
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public hello(request: Request, response: Response) {
        return response.status(200).send("Welcome to WestApi.LocationService");
    }
}