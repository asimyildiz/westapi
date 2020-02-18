import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Location name field is required'
    },
    detail: {
        type: String,
        required: 'Location detail field is required'
    },
    type: {
        type: String,
        required: 'Location type field is required' 
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    priority: {
        type: Number,
        default: 0
    },
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }]
}, {
    collection: 'Location',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

/**
 * get location information using latitude and longitude if exists
 * if not get location using location, county, city name 
 * @param location {mongoose.Document}
 * @returns {string}
 */
export const getLocation = (location: mongoose.Document): string => {
    let direction = '';
    const latitude = location.get('latitude');
    const longitude = location.get('longitude');
    if (latitude && longitude) {
        direction = `${latitude}, ${longitude}`;
    }else {
        direction = `${location.get('name')}, ${location.get('detail')}, ${location.get('county').get('name')}, ${location.get('county').get('city').get('name')}`;
    }

    return direction;
}

export const Location = mongoose.model<mongoose.Document>('Location', LocationSchema);