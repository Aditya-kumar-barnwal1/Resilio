import Emergency from '../model/Emergency.js'; // Note the .js extension!

// @desc    Create new emergency report & Notify Authorities
// @route   POST /api/v1/emergencies
// @access  Public
export const createEmergency = async (req, res) => {
  try {
    const { type, description, lat, lng } = req.body;
    
    // ---------------------------------------------------------
    // 1. EXTRACT CLOUDINARY URLS (Image & Audio)
    // ---------------------------------------------------------
    // We use req.files['fieldname'] because we are using upload.fields() now
    
    // Check if image exists
    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const imageUrl = imageFile ? imageFile.path : null;

    // Check if audio exists
    const audioFile = req.files && req.files['audio'] ? req.files['audio'][0] : null;
    const audioUrl = audioFile ? audioFile.path : null;

    // ---------------------------------------------------------
    // 2. AI SEVERITY LOGIC
    // ---------------------------------------------------------
    let severity = 'Minor';
    const criticalKeywords = ['fire', 'blast', 'accident', 'bleeding', 'trapped', 'unconscious'];
    
    if (description && criticalKeywords.some(word => description.toLowerCase().includes(word))) {
      severity = 'Critical';
    } else if (type === 'Medical' || type === 'Disaster') {
      severity = 'Serious';
    }

    // ---------------------------------------------------------
    // 3. CREATE & SAVE TO DB
    // ---------------------------------------------------------
    const newEmergency = new Emergency({
      type,
      severity,
      description,
      location: { lat, lng },
      imageUrl,  // Save Image URL
      audioUrl,  // ✅ Save Audio URL
      status: 'Pending'
    });

    const savedEmergency = await newEmergency.save();

    // ---------------------------------------------------------
    // 4. TRIGGER SOCKET.IO (Real-time Alert)
    // ---------------------------------------------------------
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

// @desc    Update emergency status (e.g. Pending -> Resolved)
// @route   PUT /api/v1/emergencies/:id/resolve
export const resolveEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ success: false, error: 'Emergency not found' });
    }

    // Update status
    emergency.status = 'Resolved';
    await emergency.save();

    // Notify dashboard to turn it green
    if (req.io) {
      req.io.emit('emergency-resolved', emergency._id);
    }

    res.json({ success: true, data: emergency });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update emergency details (Severity, Department, Status)
// @route   PUT /api/v1/emergencies/:id
export const updateEmergency = async (req, res) => {
  try {
    const { severity, department, status } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ error: 'Not found' });

    // Update fields if provided
    if (severity) emergency.severity = severity;
    if (department) emergency.department = department; // Make sure to add this to your Model if needed!
    if (status) emergency.status = status;

    await emergency.save();

    // Notify Dashboard
    if (req.io) {
      req.io.emit('emergency-updated', emergency);
    }

    res.json({ success: true, data: emergency });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete emergency (Remove from DB completely)
// @route   DELETE /api/v1/emergencies/:id
export const deleteEmergency = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete from MongoDB
    const deletedEmergency = await Emergency.findByIdAndDelete(id);

    if (!deletedEmergency) {
      return res.status(404).json({ success: false, error: 'Emergency not found' });
    }

    // 2. Notify ALL Dashboards to remove this pin instantly
    if (req.io) {
      req.io.emit('emergency-deleted', id);
    }

    res.json({ success: true, message: 'Case Closed & Removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};