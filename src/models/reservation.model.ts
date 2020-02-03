import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    vehiclePrices: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePrices'
    },
    startLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    endLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    startDate: {
        type: Date,
        required: 'Start date is required'
    },
    startTime: {
        type: String,
        required: 'Start time is required'
    },
    isRoundTrip: {
        type: Boolean,
        default: false
    },
    returnDate: {
        type: Date
    },
    returnTime: {
        type: String
    },
    isSameReturnLocation: {
        type: Boolean,
        default: true
    },
    returnStartLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    returnEndLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    addressDetail: {
        type: String
    },
    flightNumber: {
        type: String
    },
    returnAddressDetail: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    isInvoiceSent: {
        type: Boolean,
        default: false
    },
    reservationCustomers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReservationCustomer'
    }]
}, {
    collection: 'Reservation',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Reservation = mongoose.model<mongoose.Document>('Reservation', ReservationSchema);