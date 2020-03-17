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
 * api no auth
 * @type {ErrorMessage}
 */
export const ERROR_NO_AUTH: ErrorMessage = { code: '9999', message: 'Please get a token before using services' };

/**
 * location error message
 * @type {ErrorMessage}
 */
export const ERROR_LOCATION_SERVICE_GETDIRECTION_1000: ErrorMessage = { code: '1000', message: 'Please provide from and destionation location objects'};

/**
 * route error message
 * @type {ErrorMessage}
 */
export const ERROR_LOCATION_SERVICE_GETROUTE_1001: ErrorMessage = { code: '1001', message: 'Please provide from and destionation latitude and longitude values'};

/**
 * route error message
 * @type {ErrorMessage}
 */
export const ERROR_LOCATION_SERVICE_GETADDRESS_1002: ErrorMessage = { code: '1002', message: 'Please provide latitude and longitude of the address to search'};

/**
 * address error message
 * @type {ErrorMessage}
 */
export const ERROR_LOCATION_SERVICE_ADDRESS_1003: ErrorMessage = { code: '1003', message: 'Please at least provide an address to location search'};

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

/**
 * user login, no username or password
 * @type {ErrorMessage}
 */
export const ERROR_USER_NO_EMAIL_OR_PASSWORD_3000: ErrorMessage = { code: '3000', message: 'Please enter email and password' };

/**
 * user login, cannot find user
 * @type {ErrorMessage}
 */
export const ERROR_USER_NOT_FOUND_3001: ErrorMessage = { code: '3001', message: 'User not found' };

/**
 * user login, password not match
 * @type {ErrorMessage}
 */
export const ERROR_USER_WRONG_PASSWORD_3002: ErrorMessage = { code: '3002', message: 'Wrong password' };

/**
 * user login, no data to update
 * @type {ErrorMessage}
 */
export const ERROR_USER_NO_DATA_UPDATE_3003: ErrorMessage = { code: '3003', message: 'Please send user information and email to update user' };