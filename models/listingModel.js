const mongoose=require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    wagePerDay: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      enum: ["ELECTRICIAN", "PLUMBER", "CARPENTER", "PAINTER", "OTHER"],
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date
    },

    workersRequired: {
      type: Number,
      default: 1
    },

    images: [
      {
        type: String,
        required: true
      }
    ],

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN"
    }
  },
  { timestamps: true }
);

module.exports=mongoose.model("Listing",listingSchema);