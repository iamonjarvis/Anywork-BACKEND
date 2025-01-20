import express from "express";
import User from "../models/User.js"; // Import the User model
import auth from "../middleware/auth.js";

const router = express.Router();

// Get user details by ID
router.get("/:id", auth, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
