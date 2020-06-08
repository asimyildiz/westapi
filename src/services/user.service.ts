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
     * delete a user (get it to false)
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public deleteUser(request: Request, response: Response) {
        const userId = request.params.id;
        if (userId) {
            User.findOneAndUpdate(
                { _id: userId }, 
                { $set: 
                    { 
                        isActive: false
                    }
                },
                { new: true })
            .exec((errorUser: Error, documentUser: any) => {
                if (errorUser) {
                    response.send(errorUser);
                    return;
                }
    
                response.json(documentUser);    
            });
        }        
    }

    /**
     * update user information in database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public updateUser(request: Request, response: Response) {
        const userData = request.body;
        const userId = request.params.id;
        if (userData && userId) {
            User.findOneAndUpdate({ _id: userId }, { $set: 
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
            User.findOne({ email: userData.email, isActive: true })
                .exec((error: Error, user: IUserModel) => {
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
     */
    public getAllUsers(request: Request, response: Response) {
        User.find({ isActive: true })
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