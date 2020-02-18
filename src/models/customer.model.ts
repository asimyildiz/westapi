import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Mr'
    },
    name: {
        type: String
    },
    email: {
        type: String,
        required: 'Customer email field is required'
    },
    phone: {
        type: String
    },
    passport: {
        type: String
    },
    password: {
        type: String
    },
    reservationCustomers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReservationCustomer'
    }]
}, {
    collection: 'Customer',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Customer = mongoose.model<mongoose.Document>('Customer', CustomerSchema);