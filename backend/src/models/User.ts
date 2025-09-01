import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };

export const UserModel = model("User", userSchema);
