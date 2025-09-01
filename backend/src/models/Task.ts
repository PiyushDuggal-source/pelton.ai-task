import { Schema, model, Types, InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    projectId: {
      type: Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assigneeId: { type: String, ref: "User", index: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: Types.ObjectId;
};

export const TaskModel = model("Task", taskSchema);
