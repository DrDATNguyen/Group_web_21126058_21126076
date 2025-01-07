const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RatingSchema = new Schema(
  {
    _id: { type: String },  // Set _id field to be a String instead of ObjectId
    emailUser: { type: String },  // No need to use Schema.Types.String, just use String directly
    rating: { type: Schema.Types.Number },
    content: { type: String, maxLength: 255 },
  },
  { collection: "rating" }
);

module.exports = mongoose.model("Rating", RatingSchema);
