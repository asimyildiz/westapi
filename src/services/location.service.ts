import {
    Request,
    Response
} from "express";

/**
 * @class LocationService
 * @classdesc location service api methods
 */
export class LocationService {
    /**
     * fake hello method to test if service works correctly
     * @param request {Request} service request object
     * @param response {Response} service response object
     */
    public hello(request: Request, response: Response) {
        return response.status(200).send("Welcome to WestApi.LocationService");
    }
}