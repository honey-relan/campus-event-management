const express = require("express");
const Event = require("../models/Event");

const {
  body,
  validationResult
} = require("express-validator");

const router = express.Router();

// ==========================================
// CREATE EVENT
// ==========================================

router.post(
  "/",

  [
    body("name")
      .notEmpty()
      .withMessage("Event name is required"),

    body("category")
      .notEmpty()
      .withMessage("Category is required"),

    body("date")
      .notEmpty()
      .withMessage("Date is required"),

    body("venue")
      .notEmpty()
      .withMessage("Venue is required"),

    body("organizer")
      .notEmpty()
      .withMessage("Organizer is required"),

    body("description")
      .notEmpty()
      .withMessage("Description is required")
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

      const event = await Event.create(
        req.body
      );

      // REAL-TIME EVENT
      const io = req.app.get("io");

      if (io) {
        io.emit(
          "eventCreated",
          event
        );
      }

      res.status(201).json({
        message:
          "Event created successfully",

        event
      });

    } catch (error) {

      console.error(
        "Create event error:",
        error.message
      );

      res.status(500).json({
        message:
          "Error creating event",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// GET ALL EVENTS
// ==========================================

router.get("/", async (req, res) => {

  try {

    const events =
      await Event.find().sort({
        createdAt: -1
      });

    res.status(200).json(events);

  } catch (error) {

    console.error(
      "Fetch events error:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching events",

      error:
        error.message
    });
  }
});

// ==========================================
// GET EVENT BY ID
// ==========================================

router.get("/:id", async (req, res) => {

  try {

    const event =
      await Event.findById(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        message:
          "Event not found"
      });
    }

    res.status(200).json(event);

  } catch (error) {

    res.status(400).json({
      message:
        "Invalid event ID"
    });
  }
});

// ==========================================
// UPDATE EVENT
// ==========================================

router.put("/:id", async (req, res) => {

  try {

    const event =
      await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!event) {
      return res.status(404).json({
        message:
          "Event not found"
      });
    }

    // REAL-TIME UPDATE
    const io = req.app.get("io");

    if (io) {
      io.emit(
        "eventUpdated",
        event
      );
    }

    res.status(200).json({
      message:
        "Event updated successfully",

      event
    });

  } catch (error) {

    console.error(
      "Update event error:",
      error.message
    );

    res.status(400).json({
      message:
        "Error updating event",

      error:
        error.message
    });
  }
});

// ==========================================
// DELETE EVENT
// ==========================================

router.delete("/:id", async (req, res) => {

  try {

    const event =
      await Event.findByIdAndDelete(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        message:
          "Event not found"
      });
    }

    // REAL-TIME DELETE
    const io = req.app.get("io");

    if (io) {
      io.emit(
        "eventDeleted",
        {
          id:
            event._id.toString()
        }
      );
    }

    res.status(200).json({
      message:
        "Event deleted successfully"
    });

  } catch (error) {

    console.error(
      "Delete event error:",
      error.message
    );

    res.status(400).json({
      message:
        "Error deleting event",

      error:
        error.message
    });
  }
});

module.exports = router;