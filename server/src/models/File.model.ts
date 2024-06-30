import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  size: Number,
  url: String,
});

export default mongoose.model("File", fileSchema);
