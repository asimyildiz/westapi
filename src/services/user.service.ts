import { Request, Response, NextFunction, response } from 'express';
import { User, IUserModel } from '../models/user.model';
import { MongooseDocument, Mongoose } from 'mongoose';
import * as ErrorMessages from '../constants/errors.constants';

/**
 * @class UserServices
 * @classdesc user service api methods
 */
export class UserServices {
    /**
     * add a new user into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addUser(request: Request, response: Response) {
        const newUser = new User(request.body);
        newUser.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }
            
            response.json(document);
        });
    }

    /**
     * update user information in database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public updateUser(request: Request, response: Response) {
        const userData = request.body;
        if (userData && request.params.id) {
            User.findOneAndUpdate({ _id: request.params.id }, { $set: 
                { 
                    title : userData.title,
                    name : userData.name,
                    email : userData.email,
                    password : userData.password,
                    phone : userData.email,
                    passport : userData.passport
                }
            }, { upsert: true })
            .exec((errorUser: Error, documentUser: any) => {
                if (errorUser) {
                    response.send(errorUser);
                    return;
                }

                response.json(documentUser);    
            });
        }else {
            response.send(ErrorMessages.ERROR_USER_NO_DATA_UPDATE_3003);
        }
    }

    /**
     * login user
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public login(request: Request, response: Response) {
        const userData = request.body;
        if (userData && userData.email && userData.password) {
            User.findOne({ email: userData.email })
                .exec((error: Error, user:IUserModel) => {
                    if (error) {
                        response.send(error);
                        return;
                    }

                    if (!user) {
                        response.json(ErrorMessages.ERROR_USER_NOT_FOUND_3001);
                        return;
                    }

                    user.comparePassword(userData.password)
                        .then((result: boolean) => {
                            if (result) {
                                response.json(user);
                            }else {
                                response.json(ErrorMessages.ERROR_USER_WRONG_PASSWORD_3002);
                            }
                        });
                });
        }else {        
            response.send(ErrorMessages.ERROR_USER_NO_EMAIL_OR_PASSWORD_3000);
        }
    }

    /**
     * list all users from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     * !TODO NO ACCESS FOR THIS METHOD EXCEPT ADMIN
     */
    public getAllUsers(request: Request, response: Response) {
        User.find({})
            .populate('reservations')
            .exec((error: Error, document: MongooseDocument) => {
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