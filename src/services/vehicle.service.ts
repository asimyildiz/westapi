import { Request, Response, NextFunction, response } from 'express';
import multer from 'multer';
import { FileHelper, FileUploadRequest } from '../utils/file.helper';
import { MongooseDocument, Mongoose } from 'mongoose';
import { Vehicle } from '../models/vehicle.model';
import { UPLOAD_FOLDER_NAME, UPLOAD_ICON_FOLDER_NAME } from '../constants/westapi.contants';
import { ERROR_FILE_UPLOAD_NO_UPLOAD_2001 } from '../constants/errors.constants';
import { VehiclePrices } from '../models/vehicleprices.model';
import { VehiclePricesDiscount } from '../models/vehiclepricesdiscount.model';
import { Service } from '../models/service.model';
import { VehicleService } from '../models/vehicleservice.model';

/**
 * @class VehicleServices
 * @classdesc vehicle service api methods
 */
export class VehicleServices {

    /**
     * vehicle service update count
     * to check if all updates completed
     * @type {number}
     * @private
     */
    private _vehicleServiceUpdateCount: number;

    /**
     * number of updates neeed for service to return response
     * @type {number}
     * @private
     * @readonly
     */
    private readonly NUMBER_OF_UPDATES_FOR_VEHICLE_SERVICE = 2;

    /**
     * constructor
     * @param _fileStorage {multer.StorageEngine} file storage - constructor assignment
     * @param _iconFileStorage {multer.StorageEngine} file icon storage - constructor assignment
     */
    constructor(private _fileStorage: multer.StorageEngine, private _iconFileStorage: multer.StorageEngine) { 
        this._vehicleServiceUpdateCount = 0;
    }

    /**
     * list all vehicles from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllVehicles(request: Request, response: Response) {
        Vehicle.find({})
            .populate({
                path: 'vehiclePrices',
                populate: {
                    path: 'vehiclePricesDiscounts',
                    model: 'VehiclePricesDiscount'
                }
            })
            .populate({
                path: 'vehicleServices',
                populate: {
                    path: 'service',
                    model: 'Service'
                }
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
        upload(fileUploadRequest, response, (error) => {
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
        VehiclePrices.find({})
            .populate('reservations')
            .populate('vehiclePricesDiscounts')            
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

            Vehicle.findOneAndUpdate({ _id: request.params.id }, { $push: { vehiclePrices: document._id }}, { new: true })
                .populate({
                    path: 'vehiclePrices',
                    populate: {
                        path: 'vehiclePricesDiscounts',
                        model: 'VehiclePricesDiscount'
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
     * list all vehicle price discounts from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllVehiclePricesDiscounts(request: Request, response: Response) {
        VehiclePricesDiscount.find({})            
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
                .populate('vehiclePricesDiscounts')
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
     * list all services from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllServices(request: Request, response: Response) {
        Service.find({})
            .populate({
                path: 'vehicleServices',
                populate: {
                    path: 'vehicle',
                    model: 'Vehicle'
                }
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
     * add a service into database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public addService(request: Request, response: Response) {
        const fileUploadRequest = request as FileUploadRequest;
        let upload = multer({ storage: this._iconFileStorage, fileFilter: FileHelper.filterImage }).single('icon');
        upload(fileUploadRequest, response, (error) => {
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
     * add service to database after file upload
     * @param fileUploadRequest {FileUploadRequest}
     * @param response {Response}
     */
    private _saveServiceToDatabase(fileUploadRequest: FileUploadRequest, response: Response) {
        const image =  fileUploadRequest.file as Express.Multer.File;
        const uploadResponse = `${UPLOAD_ICON_FOLDER_NAME}${image.filename}`;
        
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
     * list all services for all vehicles from database
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public getAllServicesForAllVehicles(request: Request, response: Response) {
        VehicleService.find({}, (error: Error, document: MongooseDocument) => {
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
        const newVehicleService = new VehicleService();
        newVehicleService.save((error: Error, document: MongooseDocument) => {
            if (error) {
                response.send(error);
                return;
            }

            this._vehicleServiceUpdateCount = 0;
            Vehicle.findOneAndUpdate({ _id: request.params.vehicleId }, { $push: { vehicleServices: document._id }}, { new: true })
                .exec((errorVehicle: Error, documentVehicle: any) => {
                    if (errorVehicle) {
                        response.send(errorVehicle);
                        return;
                    }
                    this._vehicleServiceUpdateCount++;
                    this._checkIfUpdateCompleteForVehicleService(document._id, response);
                });

            Service.findOneAndUpdate({ _id: request.params.serviceId }, { $push: { vehicleServices: document._id }}, { new: true })
                .exec((errorService: Error, documentService: any) => {
                    if (errorService) {
                        response.send(errorService);
                        return;
                    }

                    this._vehicleServiceUpdateCount++;
                    this._checkIfUpdateCompleteForVehicleService(document._id, response);
                });
        });
    }

    /**
     * check if all table updates are completed after insert
     * and then return result
     * @param vehicleServiceId {number} vehicleServiceId inserted
     * @param response {Response} service response object
     */
    private _checkIfUpdateCompleteForVehicleService(vehicleServiceId: number, response: Response) {
        if (this._vehicleServiceUpdateCount == this.NUMBER_OF_UPDATES_FOR_VEHICLE_SERVICE) {
            VehicleService
                .find( { _id: vehicleServiceId }, (error: Error, document: MongooseDocument) => {
                    if (error) {
                        response.send(error);
                        return;
                    }
                    response.json(document);
                });        
        }
    }

    /**
     * fake hello method to test if service works correctly
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public hello(request: Request, response: Response) {
        return response.status(200).send("Welcome to WestApi.VehicleService");
    }
}