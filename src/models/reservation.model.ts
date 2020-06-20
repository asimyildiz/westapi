import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    vehiclePrices: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePrices'
    },
    vehiclePricesDiscount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePricesDiscount'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startLocation: {
        type: String,
        required: 'Start location is required'
    },
    endLocation: {
        type: String,
        required: 'End location is required'
    },
    paymentId: {
        type: String
    },
    startLatLon: {
        type: String
    },
    endLatLon: {
        type: String
    },
    startDate: {
        type: Date,
        required: 'Start date is required'
    },
    isRoundTrip: {
        type: Boolean,
        default: false
    },
    returnDate: {
        type: Date
    },
    price: {
        type: Number
    },
    addressDetail: {
        type: String
    },
    flightNumber: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    customers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    invoices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }]
}, {
    collection: 'Reservation',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Reservation = mongoose.model<mongoose.Document>('Reservation', ReservationSchema);