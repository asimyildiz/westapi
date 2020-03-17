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
    }
}, {
    collection: 'Customer',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

// this is to ensure that there is only one active passport for a user
// if we try to set multiple passport for same user, mongoose will fire an exception
CustomerSchema.index({
    user: 1,
    passport: 1
}, {
    unique: true
});

export const Customer = mongoose.model<mongoose.Document>('Customer', CustomerSchema);