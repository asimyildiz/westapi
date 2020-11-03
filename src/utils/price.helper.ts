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
            let discount = 0;
            let currentPrice = 0;
            let currentCurrency = 'try';
            const vehicle = vehicles[i];
            if (vehicle && vehicle.vehiclePrices) {                
                const vehiclePrice = vehicle.vehiclePrices;
                if (vehiclePrice.minDistance > distance) {
                    currentPrice = vehiclePrice.minPrice;
                }else {
                    currentPrice = distance * vehiclePrice.price;
                }

                discount = PriceHelper.calculateDiscount(currentPrice, vehiclePrice, distance);
                currentCurrency = vehiclePrice.currency;
            }
            vehicle.price = currentPrice;
            vehicle.discountedPrice = currentPrice - discount;
            vehicle.currency = currentCurrency;
        }        
    }

    /**
     * calculate discount for current vehicle price
     * @param currentPrice 
     * @param vehiclePrice 
     * @param distance
     */
    static calculateDiscount(currentPrice?: any, vehiclePrice?: any, distance?: any) {        
        if (vehiclePrice && vehiclePrice.vehiclePricesDiscounts) {            
            for (let i = 0; i < vehiclePrice.vehiclePricesDiscounts.length; i++) {
                const vehiclePriceDiscount = vehiclePrice.vehiclePricesDiscounts[i];
                if (vehiclePriceDiscount && vehiclePriceDiscount.distanceToApply <= distance) {
                    if (vehiclePriceDiscount.discount != 0) {
                        let discountedPrice = currentPrice - vehiclePriceDiscount.discount;
                        return discountedPrice > 0 ? vehiclePriceDiscount.discount : 0;
                    }else if (vehiclePriceDiscount.discountPercentage != 0) {
                        let discount = (currentPrice * vehiclePriceDiscount.discountPercentage) / 100;
                        let discountedPrice = currentPrice - discount;
                        return discountedPrice > 0 ? discount : 0;
                    }                    
                }
            }
        }
        return 0;
    }
}