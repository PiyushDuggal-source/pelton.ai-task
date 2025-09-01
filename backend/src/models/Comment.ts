import { Schema, model, Types, InferSchemaType } from "mongoose";

const commentSchema = new Schema(
  {
    taskId: { type: Types.ObjectId, ref: "Task", required: true, index: true },
    authorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type CommentDocument = InferSchemaType<typeof commentSchema> & {
  _id: string;
};

export const CommentModel = model("Comment", commentSchema);
