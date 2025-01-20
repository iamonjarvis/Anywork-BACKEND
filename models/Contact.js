import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contacts: [
    {
      contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      addedOn: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model('Contact', contactSchema);
