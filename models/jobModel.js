const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      url: String,
      filename: String,
    },

    workType: {
      type: String,
      required: true,
      enum: ["Masonry", "Plumbing", "Electrical", "Painting", "Carpentry", "Other"],
      index: true
    },

    location: {
      city: { type: String, index: true },
      area: { type: String }
    },

    wagePerDay: {
      type: Number,
      required: true,
      min: 100,
      index: true
    },

    paymentType: {
      type: String,
      enum: ["Daily", "Weekly", "Contract"],
      required: true
    },

    workersRequired: {
      type: Number,
      default: 1
    },

    startDate: {
      type: Date
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    customFields: [
      {
        label: String,
        value: String
      }
    ],

    applications: [
      {
        applicant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        status: {
          type: String,
          enum: ["Applied", "Accepted", "Rejected", "Completed"],
          default: "Applied"
        }
      }
    ]
  },
  { timestamps: true }
);

jobSchema.index({ "location.city": 1, workType: 1, isActive: 1 });

module.exports = mongoose.model("Job", jobSchema);