import React, { useState } from 'react';
import axios from 'axios';
import { X, MapPin, Mic, ShieldCheck, Send, PlayCircle, Navigation, CheckCircle } from 'lucide-react';

const EmergencyDetail = ({ incident, onClose }) => {
  // Local state to manage status updates immediately without refetching
  const [status, setStatus] = useState(incident?.status || 'Pending');
  const [loading, setLoading] = useState(false);

  if (!incident) return null;

  // 1. Function to Open Google Maps
  const openGoogleMaps = () => {
    const { lat, lng } = incident.location;
    // Opens Google Maps with direction to the coordinates
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // 2. Function to Mark as Resolved
  const handleResolve = async () => {
    if(!window.confirm("Are you sure this emergency is handled?")) return;
    
    setLoading(true);
    try {
      // Dynamic Backend URL
      const BACKEND_URL = window.location.hostname === "localhost" 
        ? "http://localhost:5000" 
        : "https://resilio-tbts.onrender.com";

      // Call the API we just made
      await axios.put(`${BACKEND_URL}/api/v1/emergencies/${incident._id}/resolve`);
      
      setStatus("Resolved");
      alert("✅ Case Closed! Great work.");
      // Optional: Close modal automatically
      // onClose(); 
    } catch (err) {
      console.error(err);
      alert("Error updating status. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[650px] md:h-[600px]">
        
        {/* --- LEFT SIDE: Visual Evidence --- */}
        <div className="md:w-1/2 bg-slate-200 relative group">
          <img 
            src={incident.imageUrl || "https://via.placeholder.com/600x800?text=No+Image"} 
            alt="Emergency Evidence"
            // Grayscale effect if resolved
            className={`w-full h-full object-cover transition-all duration-500 ${status === 'Resolved' ? 'grayscale opacity-50' : ''}`}
            onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/600x800?text=Image+Load+Failed" }}
          />
          
          {/* RESOLVED STAMP (Shows only if resolved) */}
          {status === 'Resolved' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
              <div className="border-4 border-green-600 text-green-600 font-black text-4xl px-8 py-2 rounded-xl -rotate-12 uppercase tracking-widest shadow-2xl backdrop-blur-md bg-white/30">
                RESOLVED
              </div>
            </div>
          )}
          
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
            <MapPin size={12} /> Geo-Verified
          </div>
        </div>

        {/* --- RIGHT SIDE: Analysis & Actions --- */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{incident.type} Report</h2>
              <p className="text-slate-500 text-sm">ID: #RES-{incident._id ? incident._id.slice(-6) : '000'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* AI Urgency Section */}
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1 text-red-700 font-bold">
                <ShieldCheck size={18} />
                <span>AI Urgency Assessment: {incident.severity}</span>
              </div>
              <p className="text-xs text-red-600/80 italic">
                "Duplicate check passed. Keywords detect high-risk situation."
              </p>
            </div>

            {/* Audio Player Section */}
            {incident.audioUrl && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                   <PlayCircle size={16} className="text-red-600" /> Audio Evidence
                </h3>
                <audio controls className="w-full h-8 accent-red-600">
                  <source src={incident.audioUrl} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mic size={16} className="text-blue-500" /> Description / Transcript
              </h3>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-600 leading-relaxed">
                {incident.description || "No additional text provided."}
              </div>
            </div>

            {/* NEW: Action Grid (Navigate & Dispatch) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={openGoogleMaps}
                className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-200 text-sm"
              >
                <Navigation size={16} /> GPS Route
              </button>
              
              <div className="relative">
                <select className="w-full h-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-slate-300 appearance-none text-center">
                  <option>🚑 Medical</option>
                  <option>🚒 Fire Dept</option>
                  <option>🚓 Police</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ShieldCheck size={14} className="text-slate-400"/>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN ACTION BUTTON (Dynamic based on Status) */}
          {status === 'Resolved' ? (
             <div className="mt-4 w-full bg-green-100 text-green-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-200">
               <CheckCircle size={20} /> Case Closed
             </div>
          ) : (
            <button 
              onClick={handleResolve}
              disabled={loading}
              className="mt-4 w-full bg-slate-900 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg group disabled:bg-slate-400"
            >
              {loading ? (
                "Processing..." 
              ) : (
                <>
                  <CheckCircle size={18} className="group-hover:scale-110 transition" /> 
                  Mark as Resolved & Close
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmergencyDetail;