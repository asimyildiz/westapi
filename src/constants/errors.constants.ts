interface ErrorMessage {
    code?: string;
    message?: string;
}

/**
 * location error message
 * @type {ErrorMessage}
 */
export const ERROR_LOCATION_SERVICE_GETDIRECTION_1000: ErrorMessage = { code: '1000', message: 'Please provide from and destionation location objects'};