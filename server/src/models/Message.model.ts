/* Message.model.ts */
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  file: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
  deleted: { type: Boolean, default: false },
  isNotification: { type: Boolean, default: false },
});

messageSchema.pre("validate", function (next) {
  if (!this.content && !this.file) {
    next(new Error("Message must have either content or a file"));
  } else if (this.isNotification && this.file) {
    next(new Error("Notification message cannot have a file"));
  } else {
    next();
  }
});

export default mongoose.model("Message", messageSchema);
