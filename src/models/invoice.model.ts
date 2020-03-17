import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    },
    name: {
        type: String,
        required: 'Name field is required'
    },
    address: {
        type: String,
        required: 'Address field is required'
    },
    isCorporate: {
        type: Boolean,
        default: false
    },
    corporateName: {
        type: String
    },
    taxOffice: {
        type: String
    },
    taxId: {
        type: String
    }
}, {
    collection: 'Invoice',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Invoice = mongoose.model<mongoose.Document>('Invoice', InvoiceSchema);