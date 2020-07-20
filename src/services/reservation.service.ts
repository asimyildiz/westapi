import { Request, Response, NextFunction, response } from 'express';
import { Reservation } from '../models/reservation.model';
import { Customer } from '../models/customer.model';
import { MongooseDocument, Mongoose } from 'mongoose';
import * as ErrorMessages from '../constants/errors.constants';

/**
 * @class ReservationServices
 * @classdesc reservation service api methods
 */
export class ReservationServices {
    /**
     * add a new customer into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addCustomer(request: Request, response: Response) {
        const newCustomer = new Customer(request.body);
        newCustomer.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            response.json(document);
        });
    }

    /**
     * add multiple customers
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addCustomers(request: Request, response: Response) {
        Customer.insertMany(request.body.customers, { ordered: false }, (error: Error, document: MongooseDocument) => {  
            Customer.find({ user: request.body.userId })
                .exec(function (error: Error, customer: Document) {
                    if (error) {
                        response.send(error);
                        return;
                    }

                    response.json(customer);
                });
        });            
    }

    /**
     * get all customers of a user
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getCustomersOfUser(request: Request, response: Response) {
        const userId = request.params.userId;
        if (userId) {
            Customer.findOne({ user: userId })
            .exec(function (error: Error, customer: Document) {
                if (error) {
                    response.send(error);
                    return;
                }

                response.json(customer);
            });
        }else {
            response.json([]);
        }
    }

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

            if (request.body.customers) {
                Reservation.findOneAndUpdate({ _id: document._id }, { $addToSet: { customers: request.params.customers }})
                    .populate('vehicle')
                    .populate('vehiclePrices')
                    .populate('vehiclePricesDiscounts')
                    .populate('user')
                    .populate('customers')
                    .exec((errorReservation: Error, documentReservation: any) => {
                        if (errorReservation) {
                            response.send(errorReservation);
                            return;
                        }

                        response.json(documentReservation);  
                    });
            }else {            
                response.json(document);
            }
        });
    }

    /**
     * get all reservations of a user
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllReservations(request: Request, response: Response) {
        const userId = request.params.userId;
        if (userId) {
            Reservation.find({ user: userId })
                .sort({ _id: -1 })
                .populate('vehicle')
                .populate('vehiclePrices')
                .populate('vehiclePricesDiscounts')
                .populate('user')
                .populate('customers')
                .exec((errorReservation: Error, documentReservation: any) => {
                    if (errorReservation) {
                        response.send(errorReservation);
                        return;
                    }

                    response.json(documentReservation);  
                });
        }else {
            response.json([]);
        }        
    }

    /**
     * get all reservations
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllReservationsList(request: Request, response: Response) {
        Reservation.find()
            .sort({ _id: -1 })
            .populate('vehicle')
            .populate('vehiclePrices')
            .populate('vehiclePricesDiscounts')
            .populate('user')
            .populate('customers')
            .exec((errorReservation: Error, documentReservation: any) => {
                if (errorReservation) {
                    response.send(errorReservation);
                    return;
                }

                response.json(documentReservation);  
            });
    }

    /**
     * cancel a reservation 
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public cancelReservation(request: Request, response: Response) {
        const reservationId = request.params.reservationId;
        if (reservationId) {
            Reservation.findOneAndUpdate({ _id: reservationId }, { $set: 
                { 
                    isCanceled : true
                }
            }, { new:true, upsert: false })
            .exec((errorReservation: Error, documentReservation: any) => {
                if (errorReservation) {
                    response.send(errorReservation);
                    return;
                }

                response.json(documentReservation);    
            });
        }else {
            response.send(ErrorMessages.ERROR_RESERVATION_CANCEL_6003);
        }
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