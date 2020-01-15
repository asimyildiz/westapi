import mongoose from "mongoose";

const ReservationCustomerSchema = new mongoose.Schema({
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const ReservationCustomer = mongoose.model<mongoose.Document>('ReservationCustomer', ReservationCustomerSchema);