import { lineString, nearestPointOnLine, point } from '@turf/turf';

/**
 * @class RouteHelper
 * @classdesc route helper utility methods
 */
export class RouteHelper {
    /**
     * decode route data returned from directions service of google maps api
     * and return calculated coordinates to display on mapview polyline
     * @param t 
     * @param poi {Object}
     * @param extras {Object}
     * @returns {Object}
     */
    static decode(t: any, poi: any, extras: any=[]) {
        let [polylinePoints, points] = RouteHelper.findRoute(t);
        RouteHelper.findExtras(polylinePoints, poi, extras);
        return {
            points: points,
            extras: extras
        };
    }

    /**
     * find route
     * @param t 
     */
    static findRoute(t: any) {
        let points = [];
        let polylinePoints = [];
        for (let step of t) {
            let encoded = step.polyline.points;
            let index = 0, len = encoded.length;
            let lat = 0, lng = 0;
            while (index < len) {
                let b, shift = 0, result = 0;
                do {
                    b = encoded.charAt(index++).charCodeAt(0) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);

                let dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                lat += dlat;
                shift = 0;
                result = 0;
                do {
                    b = encoded.charAt(index++).charCodeAt(0) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                let dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
                lng += dlng;

                polylinePoints.push([(lat / 1E5), (lng / 1E5)]);
                points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) })
            }
        }

        return [polylinePoints, points];
    }
    
    /**
     * populate extras
     * @param polylinePoints 
     * @param poi 
     * @param extras 
     */
    static findExtras(polylinePoints: any, poi: any, extras: any) {
        if (poi) {
            let linestring = null;
            try {
                linestring = lineString(polylinePoints);
            }catch (error) {}
            
            if (linestring) {
                for (let i = 0; i < poi.length; i++) {                
                    const snapped = nearestPointOnLine(linestring, point([parseFloat(poi[i].lat), parseFloat(poi[i].lon)]));
                    if (snapped && snapped.properties) {
                        let isInLine = snapped.properties.dist ? (snapped.properties.dist <= 0.1) : false;
                        if (isInLine) {
                            extras.push(...poi[i].target);
                            break;
                        }
                    }
                }
            }            
        }
    }
}