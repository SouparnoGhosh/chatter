/* Channel.model.ts */
import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  name: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], /* Reference messages instead of embedding */
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  administrators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Channel", channelSchema);