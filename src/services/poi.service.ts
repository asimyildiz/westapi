import { Request, Response, NextFunction, response } from 'express';
import { MongooseDocument, Mongoose } from 'mongoose';
import { Poi } from '../models/poi.model';
import { ERROR_POI_NO_DATA_UPDATE_4000 } from '../constants/errors.constants';

/**
 * @class PoiServices
 * @classdesc poi service api methods
 */
export class PoiServices {
    /**
     * list all poi from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllPoi(request: Request, response: Response) {
        Poi.find()            
            .exec((error: Error, document: MongooseDocument) => {
                if (error) {
                    response.send(error);
                    return;
                }
                response.json(document);
            });
    }

    /**
     * add a new poi into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addPoi(request: Request, response: Response) {
        const newPoi = new Poi(request.body);
        newPoi.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }
            
            response.json(document);
        });
    }

    /**
     * delete a poi
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public deletePoi(request: Request, response: Response) {
        const poiId = request.params.id;
        if (poiId) {
            Poi.findOneAndRemove({ _id: poiId })
            .exec((errorPoi: Error, documentPoi: any) => {
                if (errorPoi) {
                    response.send(errorPoi);
                    return;
                }
    
                response.json(documentPoi);    
            });
        }        
    }

    /**
     * update poi in database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public updatePoi(request: Request, response: Response) {
        const poiData = request.body;
        const poiId = request.params.id;
        if (poiData && poiId) {
            Poi.findOneAndUpdate({ _id: poiId }, { $set: 
                { 
                    name : poiData.name,
                    lat : poiData.lat,
                    lon : poiData.lon,
                    target : poiData.target
                }
            }, { upsert: true })
            .exec((errorPoi: Error, documentPoi: any) => {
                if (errorPoi) {
                    response.send(errorPoi);
                    return;
                }

                response.json(documentPoi);    
            });
        }else {
            response.send(ERROR_POI_NO_DATA_UPDATE_4000);
        }
    }
}