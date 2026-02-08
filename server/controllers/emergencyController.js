import Emergency from '../model/Emergency.js'; // Note the .js extension!

// @desc    Create new emergency report & Notify Authorities
// @route   POST /api/v1/emergencies
// @access  Public
export const createEmergency = async (req, res) => {
  try {
    const { type, description, lat, lng } = req.body;
    
    // 1. Process the Image URL
    // If a file was uploaded, create the URL path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Analyzing description for critical keywords
    let severity = 'Minor';
    const criticalKeywords = ['fire', 'blast', 'accident', 'bleeding', 'trapped', 'unconscious'];
    
    if (criticalKeywords.some(word => description?.toLowerCase().includes(word))) {
      severity = 'Critical';
    } else if (type === 'Medical' || type === 'Disaster') {
      severity = 'Serious';
    }
    const newEmergency = new Emergency({
      type,
      severity,
      description,
      location: { lat, lng },
      imageUrl,
      status: 'Pending'
    });

    const savedEmergency = await newEmergency.save();

    // The 'io' instance is attached to req in server.js
    if (req.io) {
      req.io.emit('new-emergency', savedEmergency);
      console.log(`📡 Socket Event Emitted: new-emergency (ID: ${savedEmergency._id})`);
    }

    res.status(201).json({
      success: true,
      data: savedEmergency,
      message: "Emergency reported successfully."
    });

  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all active emergencies
// @route   GET /api/v1/emergencies
export const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ timestamp: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};