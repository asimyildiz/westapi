import { MongooseDocument } from "mongoose";

/**
 * @class PriceHelper
 * @classdesc price helper utility methods
 */
export class PriceHelper {
    /**
     * calculate price
     * @param vehicles
     * @param origin
     * @param destination
     * @param distance
     * @param extras
     */
    static calculate(vehicles?: any, origin?: any, destination?: any, distance?: any, extras?: any) {
        for (let i = 0; i < vehicles.length; i++) {
            let currentPrice = 0;
            let currentCurrency = 'try';
            const vehicle = vehicles[i];
            if (vehicle && vehicle.vehiclePrices) {
                for (let j = 0; j < vehicle.vehiclePrices.length; j++) {
                    const vehiclePrice = vehicle.vehiclePrices[j];
                    if (vehiclePrice.minDistance > distance) {
                        currentPrice = vehiclePrice.minPrice;
                    }else {
                        currentPrice = distance * vehiclePrice.price;
                    }

                    const discount = PriceHelper.calculateDiscount(currentPrice, vehiclePrice);
                    currentPrice -= discount;
                    currentCurrency = vehiclePrice.currency;
                }   
            }
            vehicle.price = currentPrice;
            vehicle.currency = currentCurrency;
        }        
    }

    /**
     * calculate discount for current vehicle price
     * @param currentPrice 
     * @param vehiclePrice 
     */
    static calculateDiscount(currentPrice?: any, vehiclePrice?: any) {
        if (vehiclePrice && vehiclePrice.vehiclePricesDiscounts) {
            for (let i = 0; i < vehiclePrice.vehiclePricesDiscounts.length; i++) {
                const vehiclePriceDiscount = vehiclePrice.vehiclePricesDiscounts[i];
                if (vehiclePriceDiscount && vehiclePriceDiscount.minPriceToApply > currentPrice) {
                    return vehiclePriceDiscount.discount;
                }
            }
        }
        return 0;
    }
}