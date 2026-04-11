import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  verified: boolean;
  verifyOtp?: string;
  verifyOtpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    verifyOtp: { type: String },
    verifyOtpExpiry: { type: Date },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
