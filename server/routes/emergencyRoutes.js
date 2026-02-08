import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { createEmergency, getEmergencies } from '../controllers/emergencyController.js';

const Emergencyrouter = express.Router();

// POST: Handles form-data with image 'image' field
Emergencyrouter.post('/', upload.single('image'), createEmergency);

// GET: Fetches list for dashboard
Emergencyrouter.get('/', getEmergencies);

export default Emergencyrouter;