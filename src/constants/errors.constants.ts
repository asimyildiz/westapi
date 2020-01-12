/**
 * @interface ErrorMessage
 */
interface ErrorMessage {
    /**
     * error code
     * @type {string}
     */
    code: string;

    /**
     * error message
     * @type {string}
     */
    message: string;
}

/**
 * location error message
 * @type {ErrorMessage}
 */
export const ERROR_LOCATION_SERVICE_GETDIRECTION_1000: ErrorMessage = { code: '1000', message: 'Please provide from and destionation location objects'};

/**
 * file upload, no image is uploaded error message
 * @type {ErrorMessage}
 */
export const ERROR_FILE_UPLOAD_IMAGE_2000: ErrorMessage = { code: '2000', message: 'Please only upload an image file'};

/**
 * file upload, no file uploaded error message
 * @type {ErrorMessage}
 */
export const ERROR_FILE_UPLOAD_NO_UPLOAD_2001: ErrorMessage = { code: '2001', message: 'Please select an image to upload'};

