/**
 * service port number
 * @type {Number}
 */
export const PORT = 9001;

/**
 * database connection string
 * @type {string}
 */
export const DATABASE_CONNECTION = 'mongodb://localhost:27017/WestApi';

/**
 * google map api key
 * @type {string}
 */
export const GOOGLEMAP_API_KEY = 'AIzaSyCdzYtHIF_8y5wvAe9ad30VuaYB0USZdhY';

/**
 * allowed file types to be uploaded to server
 * @type {RegExp}
 */
export const ALLOWED_FILE_TYPES = /\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/;

/**
 * folder name to upload images
 * @type {string}
 */
export const UPLOAD_FOLDER_NAME = './uploads/';

/**
 * received json data limit
 * @type {string}
 */
export const JSON_DATA_LIMIT = '50mb';

/**
 * received x-www-form-urlencoded data limit
 * @type {string}
 */
export const FORM_DATA_LIMIT = '50mb';