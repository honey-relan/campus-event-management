const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true
    },
    time: {
      type: String,
      default: "10:00 AM",
      trim: true
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    seats: {
      type: Number,
      default: 100
    }
  },
  {
    timestamps: true
  }
);

// Synchronize name and title synchronously before saving
eventSchema.pre("save", function () {
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (!this.title && this.name) {
    this.title = this.name;
  }
});

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);