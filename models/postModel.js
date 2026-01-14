const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    // -------- BASIC WORK INFO --------
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5
    },

    image: {
    url: String,
    filename: String,
    },

    description: {
      type: String,
      required: true,
      minlength: 20
    },

    workType: {
      type: String,
      required: true,
      enum: ["Masonry", "Plumbing", "Electrical", "Painting", "Carpentry", "Other"]
    },

    buildingType: {
      type: String,
      required: true,
      enum: ["Independent House", "Apartment", "Commercial"]
    },

    floors: {
      type: Number,
      required: true,
      min: 1
    },

    areaSqFt: {
      type: Number,
      required: true,
      min: 100
    },

    city: {
      type: String,
      required: true,
      index: true
    },

    area: {
      type: String,
      required: true
    },

    landmark: {
      type: String
    },

    workersRequired: {
      type: Number,
      required: true,
      min: 1
    },

    skillLevel: {
      type: String,
      required: true,
      enum: ["Helper", "Skilled", "Supervisor"]
    },

    // -------- PAYMENT --------
    wagePerDay: {
      type: Number,
      required: true,
      min: 100
    },

    paymentType: {
      type: String,
      required: true,
      enum: ["Daily", "Weekly", "Contract"]
    },

    foodProvided: {
      type: Boolean,
      default: false
    },

    // -------- TIMELINE --------
    startDate: {
      type: Date,
      required: true
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1
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
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

// -------- COMPOUND INDEX (IMPORTANT) --------
jobPostSchema.index({ city: 1, workType: 1, isActive: 1 });

module.exports = mongoose.model("JobPost", jobPostSchema);
