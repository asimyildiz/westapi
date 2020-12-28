import { Request, Response } from 'express';
import * as HttpRequest from 'request';
import * as Xml2JS from 'xml2js';
import path from 'path';
import { TokenHelper } from '../utils/token.helper';
import * as ErrorMessages from '../constants/errors.constants';
import { 
    PAYMENT_MERCHANT_ID,
    PAYMENT_MERCHANT_PASSWORD,
    PAYMENT_MERCHANT_TERMINAL,
    SUCCESS_FAIL_URL,
    ENROLLMENT_API_URL,
    VPOS_API_URL,
    RESULT_URL
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
     * token for google map api calls
     * @type {string}
     * @static
     */
    private static session: any = {};

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
        const locale = request.body.locale;
        const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        const paymentId = TokenHelper.generateNewToken();
        const successUrl = `${SUCCESS_FAIL_URL}/provision`;
        const failureUrl = `${RESULT_URL}/index-failed.html?id=1&lang=${locale}`;
        if (creditCardNumber && expiryDate && cardType && amount && currency) {
            let paymentData = <any> {
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
                url: ENROLLMENT_API_URL,
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
                                // update payment data                                
                                paymentData.Name = name;
                                paymentData.CVC = cvc;
                                paymentData.ClientIp = clientIp;
                                paymentData.Locale = locale;
                                if (status == this.MPI_SUCCESS) {
                                    PaymentServices.session[paymentId] = paymentData;
                                    const paymentResponse = {
                                        veres: result.IPaySecure.Message[0].VERes[0],
                                        paymentId: paymentId
                                    }
                                    response.json(paymentResponse);
                                }else if (status == this.MPI_NO3D) {
                                    this.payWithPos(paymentData, null, response);
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
     * provision card for 3d secure
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public provision(request: Request, response: Response) {     
        const status = request.body.Status;
        const paymentId = request.body.VerifyEnrollmentRequestId;
        const paymentData = PaymentServices.session[paymentId];
        if ((status == 'Y' || status == 'A') && paymentData != null) {
            const optional = {
                ECI: request.body.Eci,
                CAVV: request.body.Cavv,
                PAYMENT_ID: paymentId
            };
            this.payWithPos(paymentData, optional, response);
        }else {
            const failedUrl = `${RESULT_URL}/index-failed.html?id=1&lang=${(paymentData && paymentData.Locale) || 'tr_TR'}`;
            response.redirect(307, failedUrl);
        }
    }

    /**
     * no 3d secure payment
     * @param paymentData {any}
     * @param optional {any}
     * @param clientIp {any}
     * @param response {Response}
     */
    private payWithPos(paymentData: any, optional: any, response: Response) {
        const xmlRequest = `prmstr=<?xml version="1.0" encoding="utf-8" ?>
            <VposRequest>
            <MerchantId>${paymentData.MerchantId}</MerchantId>
            <Password>${paymentData.MerchantPassword}</Password>
            <TerminalNo>${PAYMENT_MERCHANT_TERMINAL}</TerminalNo>
            <TransactionType>${this.TRANSACTION_TYPE}</TransactionType>
            <TransactionId>${paymentData.VerifyEnrollmentRequestId}</TransactionId>
            <CurrencyAmount>${paymentData.PurchaseAmount}</CurrencyAmount>
            <CurrencyCode>${paymentData.Currency}</CurrencyCode>        
            <BrandName>${paymentData.BrandName}</BrandName>    
            <Pan>${paymentData.Pan}</Pan>
            <Expiry>20${paymentData.ExpiryDate}</Expiry>
            <Cvv>${paymentData.CVC}</Cvv>            
            <TransactionDeviceSource>0</TransactionDeviceSource>
            ${optional ? '<ECI>' + optional.ECI + '</ECI>' : ''}
            ${optional ? '<CAVV>' + optional.CAVV + '</CAVV>' : ''}
            ${optional ? '<MpiTransactionId>' + optional.PAYMENT_ID + '</MpiTransactionId>' : ''}
            <ClientIp>${paymentData.ClientIp}</ClientIp>
            </VposRequest>`;

        HttpRequest.post({
            url: VPOS_API_URL,            
            method: "POST",
            body: xmlRequest,
            headers: {                
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, (error: any, httpResponse: any, body: any) => {            
            if (!error) {
                const mpiResponse = httpResponse.toJSON();
                const parser = new Xml2JS.Parser();
                parser.parseString(mpiResponse.body, (err: any, result: any) => {
                    let status = '';
                    let paymentId = '';                    
                    if (result && result.VposResponse && 
                        result.VposResponse.TransactionId && result.VposResponse.TransactionId.length > 0 &&
                        result.VposResponse.ResultCode && result.VposResponse.ResultCode.length > 0) {
                            status = result.VposResponse.ResultCode[0];
                            paymentId = result.VposResponse.TransactionId[0];                                                        
                    }
                    this.handleResponse(status, paymentData, optional, response);
                });
            }else {
                this.handleResponse(null, null, null, response);          
            }
        });
    }

    /**
     * handle response of vpos request
     * @param status {any}
     * @param paymentData {any} 
     * @param optional {any}
     * @param response {Response}
     */
    private handleResponse(status: any, paymentData: any, optional: any, response: Response) {
        const paymentId = paymentData && paymentData.VerifyEnrollmentRequestId;
        const locale = paymentData && paymentData.Locale;        
        if (optional == null) {
            this.handleResponseForNonSecurePayment(status, paymentId, response);
        }else {
            this.handleResponseForSecurePayment(status, paymentId, locale, response);
        }        
    }

    /**
     * handle response for non-secure payment
     * @param status {any}
     * @param paymentId {any}
     * @param response {Response}
     */
    private handleResponseForNonSecurePayment(status: any, paymentId: any, response: Response) {
        if (status == '0000') {
            response.json({ success: true, paymentId: paymentId });
        }else {
            response.send(ERROR_PAYMENT_FAILURE_5000);
        }
    }

    /**
     * handle response for secure payment
     * @param status {any}
     * @param paymentId {any}
     * @param locale {any}
     * @param response {Response}
     */
    private handleResponseForSecurePayment(status: any, paymentId: any, locale: any, response: Response) {
        let url = `${RESULT_URL}/index-failed.html?id=1&lang=${locale || 'tr_TR'}`; 
        if (status == '0000') {
            url = `${RESULT_URL}/index-success.html?id=1&lang=${locale || 'tr_TR'}`;
        }
        // set current session to null because it is finished 
        if (PaymentServices.session[paymentId]) {
            PaymentServices.session[paymentId] = null;
        }        

        response.redirect(307, url);
    }
}