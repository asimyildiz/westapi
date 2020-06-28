import * as dotenv from "dotenv";
dotenv.config();

let path;
switch (process.env.NODE_ENV) {
  case "production":
    path = `${__dirname}/../../.env.production`;
    break;
  default:
    path = `${__dirname}/../../.env.development`;
}
dotenv.config({ path: path });

/**
 * service port number
 * @type {Number}
 */
export const PORT = process.env.PORT || 8080;

/**
 * service api gateway url
 * @type {String}
 */
export const WEST_API_URL = `http://westapi.westeurope.cloudapp.azure.com:${PORT}`;

/**
 * service success and fail url
 * @type {String}
 */
export const SUCCESS_FAIL_URL = `http://www.asimyildiz.com/animated-car`;

/**
 * database connection string
 * @type {string}
 */
export const DATABASE_CONNECTION = 'mongodb://db:27017/WestApi';

/**
 * google map api key
 * @type {string}
 */
export const GOOGLEMAP_API_KEY = process.env.GOOGLEMAP_API_KEY || '';

/**
 * api key for client devices
 * @type {string}
 */
export const APPLICATION_API_KEY = process.env.APPLICATION_API_KEY || '';

/**
 * payment api merchant id
 * TODO read from env
 * @type {string}
 */
export const PAYMENT_MERCHANT_ID = process.env.PAYMENT_MERCHANT_ID || '';

/**
 * payment api merchant password
 * TODO read from env
 * @type {string}
 */
export const PAYMENT_MERCHANT_PASSWORD = process.env.PAYMENT_MERCHANT_PASSWORD || '';

/**
 * terminal information
 * @type {String}
 * @private 
 * @readonly
 */
export const PAYMENT_MERCHANT_TERMINAL = process.env.PAYMENT_MERCHANT_TERMINAL || '';

/**
 * application ids
 * @type {Array<string>}
 */
export const APPLICATION_IDS = ['westmobile'];

/**
 * secret key for JWT
 * @type {string}
 */
export const SECRET_KEY = process.env.SECRET_KEY || '';

/**
 * enrollment api url for 3dpos operations
 * @type {string}
 */
export const ENROLLMENT_API_URL = process.env.ENROLLMENT_API_URL || '';

/**
 * vpos api url for 3dpos operations
 * @type {string}
 */
export const VPOS_API_URL = process.env.VPOS_API_URL || '';

/**
 * allowed file types to be uploaded to server
 * @type {RegExp}
 */
export const ALLOWED_FILE_TYPES = /\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/;

/**
 * upload folder name
 * @type {string}
 */
export const UPLOAD_FOLDER = 'uploads';

/**
 * upload icon folder name
 * @type {string}
 */
export const ICON_FOLDER = 'icons';

/**
 * folder name to upload images
 * @type {string}
 */
export const UPLOAD_FOLDER_NAME = `./${UPLOAD_FOLDER}/`;

/**
 * folder name to upload icons
 * @type {string}
 */
export const UPLOAD_ICON_FOLDER_NAME = `${UPLOAD_FOLDER_NAME}${ICON_FOLDER}/`;

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

/**
 * application languages
 * @type {Array<string>}
 */
export const APPLICATION_LANGUAGES = ['tr'];

/**
 * application countries
 * @type {Array<string>}
 */
export const APPLICATION_COUNTRIES = ['tr'];

/**
 * default application language
 * @type {string}
 */
export const DEFAULT_APPLICATION_LANGUAGE = 'tr';

/**
 * default application country
 * @type {string}
 */
export const DEFAULT_APPLICATION_COUNTRY = 'tr';

/**
 * default radius for address search
 * @type {Number}
 */
export const DEFAULT_RADIUS_FOR_SEARCH = 5000;

/**
 * driving mode for directions api
 * @type {string}
 */
export const DEFAULT_DIRECTIONS_MODE = 'DRIVING';