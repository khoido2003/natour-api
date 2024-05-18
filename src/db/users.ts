import mongoose, { Document, Model, Query } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  photo: string;
  role: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;
  active: boolean;

  changePasswordAfter: (JwtTimestamps: number) => boolean;
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;
  createPasswordResetToken: () => string;
}

export interface IUserModel extends Model<IUser> {}

export interface IUserMiddleware extends Query<any, IUser, any> {}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please tell us your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email!"],
  },
  photo: { type: String, default: "default.jpg" },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      validator: function (val: string) {
        return val === this.password;
      },
      message: "Passwords are not the same!",
    },
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Midleware
userSchema.pre("save", async function (next) {
  console.log("running");
  // Only run this function if password actuually modified
  if (!this.isModified("password")) return next();

  // Hash the password with the code 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre<IUserMiddleware>(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

// Methods instance
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JwtTimestamps: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );

    return JwtTimestamps < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);

///////////////////////////////////////////
