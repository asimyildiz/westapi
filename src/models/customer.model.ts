import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    title: {
        type: String,
        enum: ['Mr', 'Mrs']
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
    reservationCustomers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReservationCustomer'
    }]
}, {
    timestamps: true
});

export const Customer = mongoose.model<mongoose.Document>('Customer', CustomerSchema);