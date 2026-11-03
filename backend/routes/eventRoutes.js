
const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const {
  body,
  validationResult
} = require("express-validator");

const router = express.Router();

// Send email notifications to all registered users
const notifyAllUsers = async (event, action) => {
  try {
    console.log("Starting email notifications...");
    console.log("EMAIL_USER configured:", !!process.env.EMAIL_USER);
    console.log("EMAIL_PASS configured:", !!process.env.EMAIL_PASS);

    const users = await User.find({}, "email");

    console.log("Registered users found:", users.length);

    const subject = `Campus Events - ${action}: ${event.name || event.title}`;

    const message = `
Hello,

${action}

Event: ${event.name || event.title}
Category: ${event.category}
Date: ${event.date}
Time: ${event.time || "Not specified"}
Venue: ${event.venue}
Organizer: ${event.organizer}
Description: ${event.description}

Visit Campus Event Management to see more details.

Regards,
Campus Event Management Team
`;

    const recipients = users.filter(user => user.email);

    const results = await Promise.allSettled(
      recipients.map(user =>
        sendEmail(user.email, subject, message)
      )
    );

    const successful = results.filter(
      result => result.status === "fulfilled"
    ).length;

    const failed = results.filter(
      result => result.status === "rejected"
    );

    console.log("Emails sent successfully:", successful);
    console.log("Emails failed:", failed.length);

    failed.forEach((result, index) => {
      console.error(
        `Email failure ${index + 1}:`,
        result.reason?.message || result.reason
      );
    });

  } catch (error) {
    console.error("Email notification error:", error.message);
  }
};

// CREATE EVENT
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Event name is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("venue").notEmpty().withMessage("Venue is required"),
    body("organizer").notEmpty().withMessage("Organizer is required"),
    body("description").notEmpty().withMessage("Description is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    try {
      const event = await Event.create(req.body);

      const io = req.app.get("io");

      if (io) {
        io.emit("eventCreated", event);
      }

      notifyAllUsers(event, "New Event Added");

      res.status(201).json({
        message: "Event created successfully",
        event
      });

    } catch (error) {
      console.error("Create event error:", error.message);

      res.status(500).json({
        message: "Error creating event",
        error: error.message
      });
    }
  }
);

// GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1
    });

    res.status(200).json(events);

  } catch (error) {
    console.error("Fetch events error:", error.message);

    res.status(500).json({
      message: "Error fetching events",
      error: error.message
    });
  }
});

// GET EVENT BY ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.status(200).json(event);

  } catch (error) {
    res.status(400).json({
      message: "Invalid event ID"
    });
  }
});

// UPDATE EVENT
router.put("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("eventUpdated", event);
    }

    notifyAllUsers(event, "Event Updated");

    res.status(200).json({
      message: "Event updated successfully",
      event
    });

  } catch (error) {
    console.error("Update event error:", error.message);

    res.status(400).json({
      message: "Error updating event",
      error: error.message
    });
  }
});

// DELETE EVENT
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("eventDeleted", {
        id: event._id.toString()
      });
    }

    notifyAllUsers(event, "Event Cancelled");

    res.status(200).json({
      message: "Event deleted successfully"
    });

  } catch (error) {
    console.error("Delete event error:", error.message);

    res.status(400).json({
      message: "Error deleting event",
      error: error.message
    });
  }
});

// IMPORTANT: Export Express Router directly
module.exports = router;
