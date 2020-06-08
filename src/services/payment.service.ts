import { Request, Response } from 'express';
import * as HttpRequest from 'request';
import * as Xml2JS from 'xml2js';
import { TokenHelper } from '../utils/token.helper';
import * as ErrorMessages from '../constants/errors.constants';
import { 
    PAYMENT_MERCHANT_ID,
    PAYMENT_MERCHANT_PASSWORD,
    WEST_API_URL
} from '../constants/westapi.contants';
import {
    ERROR_PAYMENT_FAILURE_5000
} from '../constants/errors.constants';

/**
 * @class PaymentServices
 * @classdesc payment service api methods
 */
export class PaymentServices {

    /**
     * mpi status success
     * @type {string}
     * @private
     * @readonly
     */
    private readonly MPI_SUCCESS: string = 'Y';

    /**
     * mpi status failure
     * @type {string}
     * @private
     * @readonly
     */
    private readonly MPI_FAILURE: string = 'E';

    /**
     * currency type values
     * @type {Object}
     * @private
     * @readonly
     */
    private readonly CURRENCY_TYPES: any = {
        'try': 949,
        'usd': 840,
        'eur': 978,
        'gbp': 826
    }

    /**
     * card type values
     * @type {Object}
     * @private
     * @readonly
     */
    private readonly BRAND_NAMES: any = {
        'visa': 100,
        'mastercard': 200,
        'troy': 300
    }

    private enrollmentQueue = [];

    /**
     * enrollment api gateway url
     * TEST : https://3dsecuretest.vakifbank.com.tr:4443/MPIAPI/MPI_Enrollment.aspx
     * PROD : https://3dsecure.vakifbank.com.tr:4443/MPIAPI/MPI_Enrollment.aspx
     * @type {String}
     * @private
     * @readonly
     */
    private readonly ENROLLMENT_API_URL = 'https://3dsecuretest.vakifbank.com.tr:4443/MPIAPI/MPI_Enrollment.aspx';

    /**
     * enroll card
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public enroll(request: Request, response: Response) {
        const creditCardNumber = request.body.creditCardNumber;
        const expiryDate = request.body.expiryDate;
        const cardType = request.body.cardType;
        const amount = request.body.amount;
        const currency = request.body.currency;
        const paymentId = TokenHelper.generateNewToken();
        const successUrl = `${WEST_API_URL}/paymentSuccess`;
        const failureUrl = `${WEST_API_URL}/paymentFailure`;
        if (creditCardNumber && expiryDate && cardType && amount && currency) {
            HttpRequest.post({
                url: this.ENROLLMENT_API_URL,
                form: {
                    Pan: creditCardNumber.replace(/\s/g,''),
                    ExpiryDate: expiryDate.split('/').reverse().join(''),
                    PurchaseAmount: parseFloat(amount).toFixed(2),
                    Currency: this.CURRENCY_TYPES[currency.toLowerCase()],
                    BrandName: this.BRAND_NAMES[cardType.toLowerCase()],
                    VerifyEnrollmentRequestId: paymentId,
                    MerchantId: PAYMENT_MERCHANT_ID,
                    MerchantPassword: PAYMENT_MERCHANT_PASSWORD,
                    SuccessUrl: successUrl,
                    FailureUrl: failureUrl
                }
            }, (error: any, httpResponse: any, body: any) => {
                if (!error) {
                    const mpiResponse = httpResponse.toJSON();
                    const parser = new Xml2JS.Parser();                    
                    console.info(mpiResponse);
                    parser.parseString(mpiResponse.body, (err: any, result: any) => {
                        if (result && result.IPaySecure && 
                            result.IPaySecure.Message && result.IPaySecure.Message.length > 0 &&
                            result.IPaySecure.Message[0].VERes && result.IPaySecure.Message[0].VERes.length > 0 &&
                            result.IPaySecure.Message[0].VERes[0].Status && result.IPaySecure.Message[0].VERes[0].Status.length > 0 &&
                            result.IPaySecure.Message[0].VERes[0].Status[0] == this.MPI_SUCCESS) {
                                response.json(result);
                        }else {
                            response.send(ERROR_PAYMENT_FAILURE_5000);
                        }
                    });
                }else {
                    response.send(ERROR_PAYMENT_FAILURE_5000);
                }
            });
        }
    }

    private payWith3d(request: Request, response: Response) {

    }

    private payWithPos(request: Request, response: Response) {
        
    }

    /**
     * 3d pos service success response
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public success(request: Request, response: Response) {
        console.info(request);
    }

    /**
     * 3d pos service fail response
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public failure(request: Request, response: Response) {
        console.info(request);
    }
}