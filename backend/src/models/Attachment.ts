import { Schema, model, Types, InferSchemaType } from "mongoose";

const attachmentSchema = new Schema(
  {
    taskId: { type: Types.ObjectId, ref: "Task", required: true, index: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AttachmentDocument = InferSchemaType<typeof attachmentSchema> & {
  _id: string;
};

export const AttachmentModel = model("Attachment", attachmentSchema);
