import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Vehicle name field is required'
    },
    maxPerson: {
        type: Number,
        required: 'Vehicle max person field is required'
    },
    maxBaggage: {
        type: Number,
        required: 'Vehicle max baggage field is required'
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    images: [{
        type: String
    }],
    vehiclePrices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePrices'
    }],
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }]
}, {
    collection: 'Vehicle',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Vehicle = mongoose.model<mongoose.Document>('Vehicle', VehicleSchema);