import express from "express";
import Contact from "../models/Contact.js";
import User from "../models/User.js"; // Import User model
import auth from "../middleware/auth.js";

const router = express.Router();

// Add contact
router.post("/add", auth, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id; // Logged-in user's ID

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required" });
  }

  try {
    // Check if the contact list exists for the logged-in user
    let contact = await Contact.findOne({ userId: senderId });

    if (!contact) {
      // Create a new contact list if none exists
      contact = new Contact({
        userId: senderId,
        contacts: [{ contactId: receiverId }],
      });
    } else {
      // Check if the contact already exists
      const contactExists = contact.contacts.some(
        (c) => c.contactId.toString() === receiverId
      );

      if (contactExists) {
        return res.status(200).json({ message: "Contact already exists" });
      }

      // Add the new contact
      contact.contacts.push({ contactId: receiverId });
    }

    await contact.save();
    res.status(200).json({ message: "Contact added successfully", contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all contacts of the logged-in user
router.get("/", auth, async (req, res) => {
  const userId = req.user.id; // Logged-in user's ID

  try {
    // Fetch the contact list and populate the 'name' field from the User model
    const contact = await Contact.findOne({ userId }).populate(
      "contacts.contactId",
      "name email" // Specify fields to populate (e.g., name, email)
    );

    if (!contact || contact.contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }

    // Format the response to include user details
    const formattedContacts = contact.contacts.map((c) => ({
      contactId: c.contactId._id, // The user's ID
      name: c.contactId.name, // The user's name
      email: c.contactId.email, // The user's email (optional)
    }));

    res.status(200).json({ contacts: formattedContacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Toggle contact (Add or Remove)
router.post("/toggle", auth, async (req, res) => {
  const { receiverId, action } = req.body; // Action can be "add" or "remove"
  const senderId = req.user.id;

  if (!receiverId || !action) {
    return res.status(400).json({ message: "Receiver ID and action are required" });
  }

  try {
    let contact = await Contact.findOne({ userId: senderId });

    if (!contact) {
      if (action === "remove") {
        return res.status(404).json({ message: "Contact list not found" });
      }

      // Create a new contact list if none exists
      contact = new Contact({ userId: senderId, contacts: [] });
    }

    const contactIndex = contact.contacts.findIndex(
      (c) => c.contactId.toString() === receiverId
    );

    if (action === "add" && contactIndex === -1) {
      contact.contacts.push({ contactId: receiverId });
    } else if (action === "remove" && contactIndex !== -1) {
      contact.contacts.splice(contactIndex, 1);
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action or contact not found" });
    }

    await contact.save();
    res.status(200).json({ message: `Contact ${action}ed successfully`, contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
