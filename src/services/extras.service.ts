import { Request, Response, NextFunction, response } from 'express';
import { MongooseDocument, Mongoose } from 'mongoose';
import { Extras } from '../models/extras.model';

/**
 * @class ExtrasServices
 * @classdesc extras service api methods
 */
export class ExtrasServices {
    /**
     * list all extras from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllExtras(request: Request, response: Response) {
        Extras.find()            
            .exec((error: Error, document: MongooseDocument) => {
                if (error) {
                    response.send(error);
                    return;
                }
                response.json(document);
            });
    }
}