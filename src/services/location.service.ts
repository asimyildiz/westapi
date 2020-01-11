import { Request, Response } from 'express';
import { MongooseDocument, Mongoose } from 'mongoose';
import { City } from '../models/city.model';
import { County } from '../models/county.model';
import { Location } from '../models/location.model';

/**
 * @class LocationService
 * @classdesc location service api methods
 */
export class LocationService {
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
            .populate('counties')
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
                .populate('counties')
                .exec((errorCity: Error, documentCity: any) => {
                    if (errorCity) {
                        response.send(error);
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
     * list all locations from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllLocations(req: Request, res: Response) {
        Location.find({}, (error: Error, document: MongooseDocument) => {
            if (error) {
                res.send(error);
                return;
            }
            res.json(document);
        });
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