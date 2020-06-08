import { Document, Schema, Model, model } from 'mongoose';
import { IUserDocument } from './interfaces/user.interface';
import * as bcrypt from "bcrypt";

/**
 * @type {Number}
 * @constant
 */
const SALT_FACTOR_PASSWORD = 10;

/**
 * @interface IUser
 * @extends IUserDocument
 */
export interface IUser extends IUserDocument {
    hashPassword(): void; 
}

/**
 * @interface IUserModel
 * @extends Model<IUser>
 */
export interface IUserModel extends Model<IUser> {
    comparePassword(password: string): Promise<boolean>;
}

/**
 * @type {Schema}
 * @constant
 */
const UserSchema: Schema = new Schema({
    title: {
        type: String,
        default: 'Mr'
    },
    name: {
        type: String
    },
    email: {
        type: String,
        required: 'Customer email field is required',
        unique: true
    },
    password: {
        type: String,
        required: 'Customer password field is required'
    },
    phone: {
        type: String
    },
    passport: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    reservations: [{
        type: Schema.Types.ObjectId,
        ref: 'Reservation'
    }]
}, {
    collection: 'User',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

/**
 * compares password with current
 * @param password {string}
 * @returns {boolean}
 */
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    const match = await bcrypt.compare(password, this.password);
    return match;
};

/**
 * hash password provided to the method
 * @param password {string}
 * @returns {string}
 * @static
 */
UserSchema.methods.hashPassword = function (): void {
    this.password = bcrypt.hashSync(this.password, SALT_FACTOR_PASSWORD);
};

/**
 * add a presave method which hashes the password before saving it
 */
UserSchema.pre<IUser>('save', function(next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    this.hashPassword();
    next();
});

export const User: IUserModel = model<IUser, IUserModel>('User', UserSchema);