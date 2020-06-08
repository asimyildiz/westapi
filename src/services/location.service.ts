import { Request, Response } from 'express';
import { GoogleMapsClientWithPromise, Language, TravelMode, DirectionsRoute } from '@google/maps';
import { MongooseDocument, Mongoose } from 'mongoose';
import * as ErrorMessages from '../constants/errors.constants';
import { Poi } from '../models/poi.model';
import { TokenHelper } from '../utils/token.helper';
import { RouteHelper } from '../utils/route.helper';
import { 
    DEFAULT_RADIUS_FOR_SEARCH,
    APPLICATION_LANGUAGES
} from '../constants/westapi.contants';

/**
 * @class LocationServices
 * @classdesc location service api methods
 */
export class LocationServices {
    /**
     * constructor
     * @param _language {string} application language - constructor assignment
     * @param _country {string} application country - constructor assignment
     * @param _googleMapApi {GoogleMapsClientWithPromise} google map api object - constructor assignment
     */
    constructor(private _language: string, private _country: string, private _googleMapApi: GoogleMapsClientWithPromise) { }

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
        const directionAddress = request.body.directionAddress;
        if (fromLatitude && fromLongitude && toLatitude && toLongitude && directionAddress) {
            let query = <any>{
                origin: `${fromLatitude},${fromLongitude}`,
                destination: `${toLatitude},${toLongitude}`,
                mode: 'driving',
                language: this._language as Language,
                units: 'metric',
                departure_time: 'now' //MAYBE PASS DATE AND TIME OF REQUEST
            };
            
            const matches = directionAddress.toLocaleLowerCase().match(/istanbul/ig);
            if (matches && matches.length != 2) {
                query.avoid = ['tolls', 'ferries'];
            }
            
            this._googleMapApi.directions(query)
            .asPromise()
            .then((mapResponse) => {
                const jsonResponse = mapResponse.json;
                if (jsonResponse.status == 'OK' && jsonResponse.routes.length) {                       
                    return Promise.resolve(jsonResponse.routes[0]);
                }else {
                    response.send(ErrorMessages.ERROR_LOCATION_SERVICE_GETROUTE_1001);
                }
            }).then((route) => {
                if (route) {
                    Poi.find()            
                        .exec((error: Error, document: MongooseDocument) => {
                            if (error) {
                                response.send(error);
                                return;
                            }

                            const decodedRoute = RouteHelper.decode([{polyline: route.overview_polyline}], document);
                            response.json({
                                distance: route.legs.reduce((carry, curr) => {
                                    return carry + curr.distance.value;
                                }, 0) / 1000,
                                duration: route.legs.reduce((carry, curr) => {
                                    return carry + (curr.duration_in_traffic ? curr.duration_in_traffic.value : curr.duration.value);
                                }, 0) / 60,
                                coordinates: decodedRoute.points,
                                extras: decodedRoute.extras,
                                fare: route.fare
                            });
                        });
                }else {
                    response.send(ErrorMessages.ERROR_LOCATION_SERVICE_GETROUTE_1001);
                }
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
     * find a location detail using placeId
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getLocationDetail(request: Request, response: Response) {
        const placeId = request.body.placeId;
        if (placeId) {
            this._googleMapApi.place({
                placeid: placeId,
                language: this._language as Language
            })
            .asPromise()
            .then((mapResponse) => {
                response.json(mapResponse.json);
            }).catch(error => response.send(error));    
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