import { Request, Response } from 'express';
import { GoogleMapsClientWithPromise, Language, TravelMode, DirectionsRoute } from '@google/maps';
import { MongooseDocument, Mongoose } from 'mongoose';
import * as ErrorMessages from '../constants/errors.constants';
import { Poi } from '../models/poi.model';
import { Extras } from '../models/extras.model';
import { Cities } from '../models/cities.model';
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
        const fromAddress = request.body.fromAddress;
        const toAddress = request.body.toAddress;
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

            Cities.find()
                .exec()
                .catch(err => [])
                .then((cities: any) => {
                    let extraTime = -1;
                    for (let i = 0; i < cities.length; i++) {
                        if (fromAddress.toLocaleLowerCase('tr-TR').indexOf(cities[i].name) > -1) {
                            extraTime = cities[i].time;
                            break;
                        }
                    }
                    
                    if (extraTime == -1) {
                        response.send(ErrorMessages.ERROR_LOCATION_SERVICE_NO_ADDRESS_1004);
                        return;
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
                        }).then(this.getPoiAndExtras)
                        .then(([route, poi, extras]) => {
                            if (route) {
                                const decodedRoute = RouteHelper.decode([{polyline: route.overview_polyline}], poi, extras);
                                response.json({
                                    distance: route.legs.reduce((carry: any, curr: any) => {
                                        return carry + curr.distance.value;
                                    }, 0) / 1000,
                                    duration: route.legs.reduce((carry: any, curr: any) => {
                                        return carry + (curr.duration_in_traffic ? curr.duration_in_traffic.value : curr.duration.value);
                                    }, 0) / 60,
                                    coordinates: decodedRoute.points,
                                    extras: decodedRoute.extras,
                                    fare: route.fare,
                                    extraTime: extraTime
                                });
                            }else {
                                response.send(ErrorMessages.ERROR_LOCATION_SERVICE_GETROUTE_1001);
                            }
                        }).catch(error => response.send(error));
                });
        }else {
            response.send(ErrorMessages.ERROR_LOCATION_SERVICE_GETROUTE_1001);
        }
    }

    /**
     * return poi and extras with route object
     * @param route 
     * @returns {Promise}
     */
    private getPoiAndExtras(route?: any) {
        return Promise.all([
            Poi.find(),
            Extras.find()
        ]).then( ([ poi, extras ]) => {
            return Promise.resolve([route, poi, extras])   
        });
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