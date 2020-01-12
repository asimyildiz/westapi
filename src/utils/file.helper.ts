import { Request } from 'express';
import { ALLOWED_FILE_TYPES } from '../constants/westapi.contants';
import { ERROR_FILE_UPLOAD_IMAGE_2000 } from '../constants/errors.constants';

/**
 * @interface FileUploadRequest
 */
export interface FileUploadRequest extends Request {
    /**
     * file validation error
     * @type {string}
     */
    fileValidationError: string;
}

/**
 * @class FileHelper
 * @classdesc file helper utility methods
 */
export class FileHelper {
    /**
     * filter uploaded files and check if they are image
     * @param request {any} express request object
     * @param file {any} express file object
     * @param callback {any} callback method
     * @static
     */
    static filterImage(request: FileUploadRequest, file: any, callback: any) {        
        if (!file.originalname.match(ALLOWED_FILE_TYPES)) {
            request.fileValidationError = ERROR_FILE_UPLOAD_IMAGE_2000.message;
            return callback(new Error(ERROR_FILE_UPLOAD_IMAGE_2000.message), false);
        }
        callback(null, true);
    }

    /**
     * create a filename from a string
     * @param fileName {string}
     * @returns {string}
     */
    static createFileName(fileName: string) {
        return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
}