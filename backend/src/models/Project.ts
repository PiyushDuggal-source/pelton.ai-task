import { Schema, model, Types, InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    deadline: { type: Date },
    ownerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    memberIds: [{ type: Types.ObjectId, ref: "User", index: true }],
    inviteCode: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export type ProjectDocument = InferSchemaType<typeof projectSchema> & {
  _id: string;
};

export const ProjectModel = model("Project", projectSchema);
