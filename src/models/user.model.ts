import { model, ObjectId, Schema } from "mongoose";

export interface UserDoc {
  _id: ObjectId;
  email: string;
  role: "user" | "author";
  name?: string;
}

const userSchema = new Schema<UserDoc>({
  name: {
    type: String,
    trim: true,
  },
  email: {
    required: true,
    type: String,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "author"],
    default: "user",
  },
});

const userModel = model("user", userSchema);

export default userModel;
