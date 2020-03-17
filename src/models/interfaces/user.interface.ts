import { Document, Schema } from 'mongoose';

/**
 * Interface for user schema
 * @interface IUserDocument
 * @extends Document
 */
export interface IUserDocument extends Document {
    title: string,
    name: string,
    email: string,
    password: string,
    phone: string,
    passport: string,
    reservations: Array<Schema.Types.ObjectId>;
}