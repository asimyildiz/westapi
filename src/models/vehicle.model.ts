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
    images: [{
        type: String
    }],
    vehiclePrices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePrices'
    }],
    vehicleServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleService'
    }],
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Vehicle = mongoose.model<mongoose.Document>('Vehicle', VehicleSchema);