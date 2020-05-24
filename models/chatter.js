const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatterSchema = new Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Room",
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    pointer: {
      type: Number,
      required: true,
      default: -1,
    },
  },
  { timestamps: true }
);

const Chatter = mongoose.model("Chatter", chatterSchema);
module.exports = Chatter;
