import { Request, Response } from 'express';
import * as HttpRequest from 'request';
import * as Xml2JS from 'xml2js';
import { TokenHelper } from '../utils/token.helper';
import * as ErrorMessages from '../constants/errors.constants';
import { 
    PAYMENT_MERCHANT_ID,
    PAYMENT_MERCHANT_PASSWORD,
    PAYMENT_MERCHANT_TERMINAL,
    WEST_API_URL
} from '../constants/westapi.contants';
import {
    ERROR_PAYMENT_FAILURE_5000
} from '../constants/errors.constants';
import { rhumbDistance } from '@turf/turf';

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
     * mpi status no 3d
     * @type {string}
     * @private
     * @readonly
     */
    private readonly MPI_NO3D: string = 'N';

    /**
     * mpi status failure
     * @type {string}
     * @private
     * @readonly
     */
    private readonly MPI_FAILURE: Array<string> = ['E', 'U'];

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
    private readonly ENROLLMENT_API_URL = 'https://3dsecure.vakifbank.com.tr:4443/MPIAPI/MPI_Enrollment.aspx ';

    /**
     * vpos api gateway url
     * TEST : https://onlineodemetest.vakifbank.com.tr:4443/VposService/v3/Vposreq.aspx
     * PROD : https://onlineodeme.vakifbank.com.tr:4443/VposService/v3/Vposreq.aspx
     * @type {String}
     * @private
     * @readonly
     */
    private readonly VPOS_API_URL = 'https://onlineodeme.vakifbank.com.tr:4443/VposService/v3/Vposreq.aspx';

    /**
     * transaction type
     * @type {String}
     * @private 
     * @readonly
     */
    private readonly TRANSACTION_TYPE = 'Sale';

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
        const cvc = request.body.cvc;
        const name = request.body.name;
        const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        const paymentId = TokenHelper.generateNewToken();
        const successUrl = `${WEST_API_URL}/paymentSuccess`;
        const failureUrl = `${WEST_API_URL}/paymentFailure`;
        if (creditCardNumber && expiryDate && cardType && amount && currency) {
            const paymentData = {
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
            };

            HttpRequest.post({
                url: this.ENROLLMENT_API_URL,
                form: paymentData
            }, (error: any, httpResponse: any, body: any) => {
                if (!error) {
                    const mpiResponse = httpResponse.toJSON();
                    const parser = new Xml2JS.Parser();
                    parser.parseString(mpiResponse.body, (err: any, result: any) => {
                        if (result && result.IPaySecure && 
                            result.IPaySecure.Message && result.IPaySecure.Message.length > 0 &&
                            result.IPaySecure.Message[0].VERes && result.IPaySecure.Message[0].VERes.length > 0 &&
                            result.IPaySecure.Message[0].VERes[0].Status && result.IPaySecure.Message[0].VERes[0].Status.length > 0) {
                                const status = result.IPaySecure.Message[0].VERes[0].Status[0];
                                if (status == this.MPI_SUCCESS) {                                
                                    const paymentResponse = {
                                        veres: result.IPaySecure.Message[0].VERes[0],
                                        paymentId: paymentId
                                    }
                                    response.json(paymentResponse);
                                }else if (status == this.MPI_NO3D) {
                                    this.payWithPos(paymentData, name, cvc, clientIp, response);
                                }else if (this.MPI_FAILURE.indexOf(status) > -1) {                                    
                                    response.send(ERROR_PAYMENT_FAILURE_5000);
                                }
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

    /**
     * no 3d secure payment
     * @param paymentData {any}
     * @param name {any}
     * @param cvc {any}
     * @param clientIp {any}
     * @param response {Response}
     */
    private payWithPos(paymentData: any, name: any, cvc: any, clientIp: any, response: Response) {
        const xmlRequest = `prmstr=<VposRequest>
            <MerchantId>${paymentData.MerchantId}</MerchantId>
            <Password>${paymentData.MerchantPassword}</Password>
            <TerminalNo>${PAYMENT_MERCHANT_TERMINAL}</TerminalNo>
            <TransactionType>${this.TRANSACTION_TYPE}</TransactionType>
            <TransactionId>${paymentData.VerifyEnrollmentRequestId}</TransactionId>
            <CurrencyAmount>${paymentData.PurchaseAmount}</CurrencyAmount>
            <CurrencyCode>${paymentData.Currency}</CurrencyCode>
            <CardHoldersName>${name}</CardHoldersName>
            <Pan>${paymentData.Pan}</Pan>
            <Expiry>${paymentData.ExpiryDate}</Expiry>
            <Cvv>${cvc}</Cvv>
            <TransactionDeviceSource>0</TransactionDeviceSource>
            <ClientIp>${clientIp}</ClientIp>
            </VposRequest>`;

        HttpRequest.post({
            url: this.VPOS_API_URL,
            body: xmlRequest
        }, (error: any, httpResponse: any, body: any) => {
            if (error) {
                response.send(ERROR_PAYMENT_FAILURE_5000);
            }else {
                response.json({ success: true });
            }
        });
    }

    /**
     * 3d pos service success response
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public success(request: Request, response: Response) {
        response.set('Content-Type', 'text/html');
        response.send(new Buffer('window.postMessage("success")'));
    }

    /**
     * 3d pos service fail response
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public failure(request: Request, response: Response) {
        response.set('Content-Type', 'text/html');
        response.send(new Buffer('window.postMessage("failure")'));
    }
}