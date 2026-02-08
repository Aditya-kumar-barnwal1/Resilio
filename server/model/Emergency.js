import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: [true, 'Emergency type is required'] // e.g., Fire, Medical
  },
  severity: { 
    type: String, 
    enum: ['Critical', 'Serious', 'Minor', 'Pending'],
    default: 'Pending' 
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  imageUrl: {
    type: String // Stores the path to the uploaded image (e.g., /uploads/emergency-123.jpg)
  },
  audioUrl: { type: String },
  voiceTranscript: {
    type: String // Optional: For the Whisper AI text
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'Resolved'], 
    default: 'Pending' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Export using ES Module syntax
export default mongoose.model('Emergency', emergencySchema);