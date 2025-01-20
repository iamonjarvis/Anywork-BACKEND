import express from 'express';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Send a message
router.post('/send', auth, async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    const message = new Message({ senderId, receiverId, content });
    await message.save();

    // Emit message to the socket for real-time updates
    io.emit("receiveMessage", message); 

    res.status(200).json({ success: true, message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message', error });
  }
});

// Fetch messages between two users
router.get('/:senderId/:receiverId', auth, async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 }); // Ensure messages are sorted by timestamp

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error });
  }
});

// Get messages for a job (job-based messages)
router.get('/job/:jobId', auth, async (req, res) => {
  const { jobId } = req.params;

  try {
    const messages = await Message.find({ jobId }).sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching job messages', error });
  }
});

export default router;
