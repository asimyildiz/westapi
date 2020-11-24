import mongoose from "mongoose";

// TODO add multiple validation for both User&&passport
const CustomerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: 'Customer name field is required'
    },
    passport: {
        type: String,
        required: 'Customer passport field is required'
    },
    nationality: {
        type: String
    },
    gender: {
        type: String,
        required: 'Customer gender field is required'
    },
}, {
    collection: 'Customer',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Customer = mongoose.model<mongoose.Document>('Customer', CustomerSchema);