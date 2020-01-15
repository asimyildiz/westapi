import { Request, Response, NextFunction, response } from 'express';
import { Reservation } from '../models/reservation.model';
import { MongooseDocument, Mongoose } from 'mongoose';

/**
 * @class ReservationServices
 * @classdesc reservation service api methods
 */
export class ReservationServices {

    /**
     * add a new reservation into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addReservation(request: Request, response: Response) {
        const newReservation = new Reservation(request.body);
        newReservation.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }
            
            response.json(document);
        });
    }

    /**
     * fake hello method to test if service works correctly
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public hello(request: Request, response: Response) {
        return response.status(200).send("Welcome to WestApi.ReservationService");
    }
}