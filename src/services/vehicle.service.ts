import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { FileHelper, FileUploadRequest } from '../utils/file.helper';
import { MongooseDocument, Mongoose } from 'mongoose';
import { Vehicle } from '../models/vehicle.model';
import { UPLOAD_FOLDER_NAME } from '../constants/westapi.contants';
import { ERROR_FILE_UPLOAD_NO_UPLOAD_2001 } from '../constants/errors.constants';

/**
 * @class VehicleService
 * @classdesc vehicle service api methods
 */
export class VehicleService {
    /**
     * constructor
     * @param _fileStorage {multer.StorageEngine} file storage - constructor assignment
     */
    constructor(private _fileStorage: multer.StorageEngine) { }

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
            return `${UPLOAD_FOLDER_NAME}${image.filename}`;
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
     * fake hello method to test if service works correctly
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public hello(request: Request, response: Response) {
        return response.status(200).send("Welcome to WestApi.VehicleService");
    }
}