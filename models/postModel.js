const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    place: { type: String, required: true },
    area: { type: String, required: true },
    bedroom: { type: Number, required: true },
    bathroom: { type: Number, required: true },
    nearby: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);
const postModel = mongoose.model("Post", postSchema);
module.exports = postModel;
