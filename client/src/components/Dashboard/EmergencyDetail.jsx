import React, { useState } from 'react';
import axios from 'axios';
import { X, MapPin, ShieldCheck, Send, PlayCircle, Navigation, CheckCircle, Truck, AlertTriangle, Trash2 } from 'lucide-react';

// --- 🔔 CUSTOM TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => (
  <div className="fixed top-6 right-6 z-[2000] animate-in slide-in-from-top-2 fade-in duration-300">
    <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex flex-col gap-1 min-w-[300px] border border-slate-700">
      <div className="flex items-center gap-2 font-bold text-lg">
        {type === 'success' ? <CheckCircle className="text-green-500" size={20} /> : <AlertTriangle className="text-red-500" size={20} />}
        {type === 'success' ? 'Success' : 'Error'}
      </div>
      <p className="text-slate-300 text-sm whitespace-pre-line">{message}</p>
      <button onClick={onClose} className="absolute top-2 right-2 text-slate-500 hover:text-white p-1"><X size={14}/></button>
    </div>
  </div>
);

// --- ⚠️ CUSTOM CONFIRM MODAL ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-700 transform scale-100 transition-all">
        <div className="flex items-center gap-3 mb-3 text-amber-500">
          <AlertTriangle size={24} />
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const EmergencyDetail = ({ incident, onClose }) => {
  // Local state for editing and workflow
  const [status, setStatus] = useState(incident?.status || 'Pending');
  const [severity, setSeverity] = useState(incident?.severity || 'Minor');
  const [department, setDepartment] = useState(incident?.department || 'Medical (Ambulance)');
  
  // UI States for animations
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false); 
  
  // Custom UI States
  const [toast, setToast] = useState(null); // { message, type }
  const [showConfirm, setShowConfirm] = useState(false);

  if (!incident) return null;

  const BACKEND_URL = window.location.hostname === "localhost" 
    ? "http://localhost:8000" 
    : "https://resilio-tbts.onrender.com";

  // Helper to show toast that disappears after 4s
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Handle Dispatch (The "Assign Nearest Unit" Logic)
  const handleDispatch = async () => {
    setDispatching(true);
    
    // 🎭 FAKE "AI SEARCHING" DELAY
    setTimeout(async () => {
      try {
        await axios.put(`${BACKEND_URL}/api/v1/emergencies/${incident._id}`, {
          status: 'Assigned',
          severity,
          department
        });
        
        setStatus('Assigned');
        setDispatching(false);
        // ✅ Custom Success Toast
        showToast(`Unit Dispatched Successfully!\nID: #UNIT-${Math.floor(Math.random()*900)+100}\nETA: 8 mins`, 'success');
      } catch (err) {
        console.error(err);
        setDispatching(false);
        showToast("Failed to dispatch unit.", 'error');
      }
    }, 2000); 
  };

  // 2. Handle Delete Logic (Triggered by Modal)
  const confirmDelete = async () => {
    setShowConfirm(false); // Close modal
    setLoading(true);
    try {
      // 🗑️ DELETE REQUEST
      await axios.delete(`${BACKEND_URL}/api/v1/emergencies/${incident._id}`);
      
      showToast("Case Closed & Removed from System.", 'success');
      setTimeout(() => onClose(), 1500); // Close detail view after success
    } catch (err) {
      console.error(err);
      showToast("Error deleting case.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* RENDER CUSTOM POPUPS */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmModal 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Permanently Delete Case?"
        message="This will remove the emergency record from the database entirely. This action cannot be undone. Are you sure the job is complete?"
      />

      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[650px] md:h-[600px]">
          
          {/* --- LEFT SIDE: Visual Evidence --- */}
          <div className="md:w-1/2 bg-slate-200 relative group">
            <img 
              src={incident.imageUrl || "https://via.placeholder.com/600x800?text=No+Image"} 
              alt="Evidence"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/600x800?text=Image+Load+Failed" }}
            />
            
            {/* Status Overlay */}
            {status === 'Assigned' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-pulse flex items-center gap-2 z-20 whitespace-nowrap">
                <Truck size={24} /> UNIT DISPATCHED
              </div>
            )}

            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
              <MapPin size={12} /> Geo-Verified
            </div>
          </div>

          {/* --- RIGHT SIDE: Analysis & Dispatch Center --- */}
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
              
              {/* Priority Verification */}
              <div className={`p-4 rounded-xl border ${severity === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <ShieldCheck size={18} className="text-slate-500" /> 
                    Verification & Priority
                  </div>
                </div>
                
                <select 
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  disabled={status !== 'Pending'}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Critical">🔴 CRITICAL (Immediate Action)</option>
                  <option value="Serious">🟠 SERIOUS (Dispatch Required)</option>
                  <option value="Minor">🔵 MINOR (Low Priority)</option>
                  <option value="Fake">⚪ HOAX / FALSE ALARM</option>
                </select>
              </div>

              {/* Audio Player */}
              {incident.audioUrl && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                     <PlayCircle size={14} /> Voice Evidence
                  </h3>
                  <audio controls className="w-full h-8 accent-red-600">
                    <source src={incident.audioUrl} />
                  </audio>
                </div>
              )}
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-600 leading-relaxed">
                 {incident.description || "No description provided."}
              </div>

              {/* Response Config (Only visible when Pending) */}
              {status === 'Pending' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button 
                    onClick={() => window.open(`http://googleusercontent.com/maps.google.com/4{incident.location.lat},${incident.location.lng}`, '_blank')}
                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-200 text-sm"
                  >
                    <Navigation size={16} /> GPS Check
                  </button>
                  
                  <div className="relative">
                    <select 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-slate-300 appearance-none text-center"
                    >
                      <option>🚑 Medical Team</option>
                      <option>🚒 Fire Dept</option>
                      <option>🚓 Police Force</option>
                      <option>🌪 Disaster Relief</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* MAIN ACTION BUTTONS */}
            <div className="mt-4">
              {status === 'Pending' ? (
                <button 
                  onClick={handleDispatch}
                  disabled={dispatching}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all ${
                    dispatching ? 'bg-slate-800 cursor-wait' : 'bg-slate-900 hover:bg-black active:scale-[0.98]'
                  }`}
                >
                  {dispatching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Locating Nearest Unit...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> CONFIRM & DISPATCH
                    </>
                  )}
                </button>
              ) : (
                // This triggers the CUSTOM MODAL
                <button 
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  {loading ? "Removing..." : (
                    <>
                      <CheckCircle size={20} /> MARK JOB COMPLETE (REMOVE)
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencyDetail;