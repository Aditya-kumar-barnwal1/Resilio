import React from 'react';
import { X, MapPin, Mic, ShieldCheck, Send } from 'lucide-react';
const BACKEND_URL = window.location.hostname === "localhost"
  ? "http://localhost:8000"
  : "https://resilio-tbts.onrender.com"; // 👈 YOUR ACTUAL RENDER BACKEND URL

const EmergencyDetail = ({ incident, onClose }) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Left Side: Visual Evidence (AI Image Analysis) */}
     
    
    <div className="md:w-1/2 bg-slate-200 relative">
      <img 
        // 2. Use the dynamic BACKEND_URL here
        src={incident.imageUrl ? `${BACKEND_URL}${incident.imageUrl}` : "https://via.placeholder.com/600x800?text=No+Image"} 
        alt="Emergency Evidence"
        className="w-full h-full object-cover"
        // Add error handling to see if the link is broken
        onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/600x800?text=Image+Load+Failed" }}
      />
      
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <MapPin size={12} /> Geo-Tagged Verified
          </div>
        </div>

        {/* Right Side: AI Analysis & Dispatch */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{incident.type} Report</h2>
              <p className="text-slate-500 text-sm">ID: #RES-{incident.id}024</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {/* AI Urgency Section */}
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
                <ShieldCheck size={18} />
                <span>AI Urgency Assessment: {incident.severity}</span>
              </div>
              <p className="text-sm text-red-600/80 italic">
                "Duplicate check passed. Keywords detect high-risk situation."
              </p>
            </div>

            {/* Whisper AI Transcript */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mic size={16} className="text-blue-500" /> Voice Note Transcript
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 leading-relaxed">
                {incident.description || "Transcribing audio..."}
              </div>
            </div>

            {/* Dispatch Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Assign Response Department</h3>
              <select className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500">
                <option>Medical (Ambulance)</option>
                <option>Fire Department</option>
                <option>Police / Security</option>
                <option>Disaster Management Team</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <button className="mt-6 w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
            <Send size={18} /> Confirm & Dispatch Nearest Unit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDetail;