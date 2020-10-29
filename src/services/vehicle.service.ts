import { Request, Response, NextFunction, response } from 'express';
import multer from 'multer';
import { FileHelper, FileUploadRequest } from '../utils/file.helper';
import { PriceHelper } from '../utils/price.helper';
import { MongooseDocument, Mongoose } from 'mongoose';
import { Vehicle } from '../models/vehicle.model';
import { ICON_FOLDER } from '../constants/westapi.contants';
import { ERROR_FILE_UPLOAD_NO_UPLOAD_2001 } from '../constants/errors.constants';
import { VehiclePrices } from '../models/vehicleprices.model';
import { VehiclePricesDiscount } from '../models/vehiclepricesdiscount.model';
import { Service } from '../models/service.model';

/**
 * @class VehicleServices
 * @classdesc vehicle service api methods
 */
export class VehicleServices {

    /**
     * constructor
     * @param _fileStorage {multer.StorageEngine} file storage - constructor assignment
     * @param _iconFileStorage {multer.StorageEngine} file icon storage - constructor assignment
     */
    constructor(private _fileStorage: multer.StorageEngine, private _iconFileStorage: multer.StorageEngine) { }

    /**
     * list all vehicles from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllVehicles(request: Request, response: Response) {
        const origin = request.body.origin;
        const destination = request.body.destination;
        const distance = request.body.distance;
        const extras = request.body.extras;
        const goDate = request.body.goDate;
        const returnDate = request.body.returnDate;

        let query = this.__getQueryDate(goDate, returnDate);
        Vehicle.find({ isActive: true })
            .populate({
                path: 'vehiclePrices',
                match: { isActive: true },
                populate: {
                    path: 'vehiclePricesDiscounts',
                    model: 'VehiclePricesDiscount',                    
                    match: query,
                }
            })
            .populate({
                path: 'services',                
                match: { isActive: true }
            })
            .lean()
            .exec((error: Error, document: MongooseDocument) => {
                if (error) {
                    response.send(error);
                    return;
                }

                PriceHelper.calculate(document, origin, destination, distance, extras);
                response.json(document);
            });
    }

    /**
     * get query date for go and return
     * @param goDate {string}
     * @param returnDate {string}
     * @private
     */
    private __getQueryDate(goDate: string, returnDate: string) {
        let query = <any>{ isActive: true };
        if (goDate && typeof goDate == 'string') {
            query.startDate = {
                "$lte": new Date(goDate)
            };

            if (returnDate && typeof returnDate == 'string') {
                query.endDate = {
                    "$gte": new Date(returnDate)
                };
            }else {
                query.endDate = {
                    "$gte": new Date(goDate)
                };
            }
        }
        return query;
    }

    /**
     * list all vehicles from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllVehicleList(request: Request, response: Response) {
        Vehicle.find({ isActive: true })
            .populate({
                path: 'vehiclePrices',
                match: { isActive: true },
                populate: {
                    path: 'vehiclePricesDiscounts',
                    model: 'VehiclePricesDiscount'
                }
            })
            .populate({
                path: 'services',                
                match: { isActive: true }
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
     * add a new vehicle into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addVehicle(request: Request, response: Response) {
        const fileUploadRequest = request as FileUploadRequest;
        let upload = multer({ storage: this._fileStorage, fileFilter: FileHelper.filterImage }).array('images', 10);
        upload(fileUploadRequest, response, (error: any) => {
            if (fileUploadRequest.fileValidationError) {
                response.send(fileUploadRequest.fileValidationError);
                return;
            } else if (!request.file && !request.files) {
                response.send(ERROR_FILE_UPLOAD_NO_UPLOAD_2001);
                return;
            } else if (error) {
                response.send(error);
                return;
            }

            this._saveVehicleToDatabase(fileUploadRequest, response);            
        });
    }

    /**
     * add vehicle to database after file upload
     * @param fileUploadRequest {FileUploadRequest}
     * @param response {Response}
     */
    private _saveVehicleToDatabase(fileUploadRequest: FileUploadRequest, response: Response) {
        const imageList =  fileUploadRequest.files as Array<Express.Multer.File>;
        const uploadResponse = imageList.map((image) => {
            return image.filename;
        });
        
        fileUploadRequest.body.images = uploadResponse;
        const newVehicle = new Vehicle(fileUploadRequest.body);
        newVehicle.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            response.json(document);
        });
    }

    /**
     * list all vehicle prices from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllVehiclePrices(request: Request, response: Response) {
        VehiclePrices.find({ isActive: true })
            .populate({
                path: 'vehiclePricesDiscounts',
                match: { isActive: true },
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
     * add a new price for a vehicle into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addVehiclePrice(request: Request, response: Response) {
        const newVehiclePrices = new VehiclePrices(request.body);
        newVehiclePrices.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            Vehicle.findOneAndUpdate({ _id: request.params.id }, { $set: { vehiclePrices: document._id }}, { new: true })
                .populate({
                    path: 'vehiclePrices',                    
                    match: { isActive: true },
                    populate: {
                        path: 'vehiclePricesDiscounts',
                        model: 'VehiclePricesDiscount',
                        match: { isActive: true }
                    }
                })
                .exec((errorVehicle: Error, documentVehicle: any) => {
                    if (errorVehicle) {
                        response.send(errorVehicle);
                        return;
                    }

                    response.json(documentVehicle);    
                });
        });
    }

    /**
     * delete a vehicle price (get it to false)
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public deleteVehiclePrice(request: Request, response: Response) {
        const vehiclePriceId = request.params.id;
        if (vehiclePriceId) {
            VehiclePrices.findOneAndUpdate(
                { _id: vehiclePriceId }, 
                { $set: 
                    { 
                        isActive: false
                    }
                },
                { new: true })
            .exec((errorVehiclePrice: Error, documentVehiclePrice: any) => {
                if (errorVehiclePrice) {
                    response.send(errorVehiclePrice);
                    return;
                }
    
                response.json(documentVehiclePrice);    
            });
        }        
    }

    /**
     * list all vehicle price discounts from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllVehiclePricesDiscounts(request: Request, response: Response) {
        VehiclePricesDiscount.find({ isActive: true })            
            .exec((error: Error, document: MongooseDocument) => {
                if (error) {
                    response.send(error);
                    return;
                }
                response.json(document);
            });
    }

    /**
     * add a new price discount for a vehicle price into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addVehiclePricesDiscount(request: Request, response: Response) {
        const newVehiclePricesDiscount = new VehiclePricesDiscount(request.body);
        newVehiclePricesDiscount.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            VehiclePrices.findOneAndUpdate({ _id: request.params.id }, { $push: { vehiclePricesDiscounts: document._id }}, { new: true })
                .populate({ 
                    path: 'vehiclePricesDiscounts',                    
                    match: { isActive: true }
                })
                .exec((errorVehiclePrices: Error, documentVehiclePrices: any) => {
                    if (errorVehiclePrices) {
                        response.send(errorVehiclePrices);
                        return;
                    }

                    response.json(documentVehiclePrices);    
                });
        });
    }

    /**
     * delete a vehicle price discount (get it to false)
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public deleteVehiclePriceDiscount(request: Request, response: Response) {
        const vehiclePriceDiscountId = request.params.id;
        if (vehiclePriceDiscountId) {
            VehiclePricesDiscount.findOneAndUpdate({ _id: vehiclePriceDiscountId }, 
                { $set: 
                    { 
                        isActive: false
                    }
                },
                { new: true })
            .exec((errorVehiclePriceDiscount: Error, documentVehiclePriceDiscount: any) => {
                if (errorVehiclePriceDiscount) {
                    response.send(errorVehiclePriceDiscount);
                    return;
                }
    
                response.json(documentVehiclePriceDiscount);    
            });
        }        
    }

    /**
     * list all services from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllServices(request: Request, response: Response) {
        Service.find({ isActive: true })
            .exec((error: Error, document: MongooseDocument) => {
                if (error) {
                    response.send(error);
                    return;
                }
                response.json(document);
            });
    }

    /**
     * add a service into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addService(request: Request, response: Response) {
        const fileUploadRequest = request as FileUploadRequest;
        let upload = multer({ storage: this._iconFileStorage, fileFilter: FileHelper.filterImage }).single('icon');
        upload(fileUploadRequest, response, (error: any) => {
            if (fileUploadRequest.fileValidationError) {
                response.send(fileUploadRequest.fileValidationError);
                return;
            } else if (!request.file && !request.files) {
                response.send(ERROR_FILE_UPLOAD_NO_UPLOAD_2001);
                return;
            } else if (error) {
                response.send(error);
                return;
            }

            this._saveServiceToDatabase(fileUploadRequest, response);            
        });
    }
    
    /**
     * delete a service (get it to false)
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public deleteService(request: Request, response: Response) {
        const serviceId = request.params.id;
        if (serviceId) {
            Service.findOneAndUpdate({ _id: serviceId }, 
                { $set: 
                    { 
                        isActive: false
                    }
                },
                { new: true })
            .exec((errorService: Error, documentService: any) => {
                if (errorService) {
                    response.send(errorService);
                    return;
                }
    
                response.json(documentService);    
            });
        }        
    }

    /**
     * add service to database after file upload
     * @param fileUploadRequest {FileUploadRequest}
     * @param response {Response}
     */
    private _saveServiceToDatabase(fileUploadRequest: FileUploadRequest, response: Response) {
        const image =  fileUploadRequest.file as Express.Multer.File;
        const uploadResponse = `${ICON_FOLDER}/${image.filename}`;
        
        fileUploadRequest.body.icon = uploadResponse;
        const newService = new Service(fileUploadRequest.body);
        newService.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            response.json(document);
        });
    }

    /**
     * add a service for a vehicle into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addServiceForVehicle(request: Request, response: Response) {
        Vehicle.findOneAndUpdate({ _id: request.params.vehicleId }, { $addToSet: { services: request.params.serviceId }})        
            .populate({
                path: 'vehiclePrices',                
                match: { isActive: true },
                populate: {
                    path: 'vehiclePricesDiscounts',
                    model: 'VehiclePricesDiscount',
                    match: { isActive: true }
                }
            })
            .populate({
                path: 'services',                
                match: { isActive: true }
            })
            .exec((errorVehicle: Error, documentVehicle: any) => {
                if (errorVehicle) {
                    response.send(errorVehicle);
                    return;
                }

                response.json(documentVehicle);  
            });
    }

    /**
     * fake hello method to test if service works correctly
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public hello(request: Request, response: Response) {
        return response.status(200).send("Welcome to WestApi.VehicleServices");
    }
}