import React, { useState, useEffect,useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { MapPin, Navigation, Truck, CheckCircle, AlertOctagon, Clock, Shield, Phone, X } from 'lucide-react';

// 🗺️ Import the Map Component we created earlier
import LiveRouteMap from '../components/Map/LiveRouteMap'; 

const RescuerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [reportText, setReportText] = useState("");
  const [myLocation, setMyLocation] = useState(null); // 📍 Store GPS Data

  // Force Live Backend for Real-World Testing
  const BACKEND_URL = useMemo(() => 
  window.location.hostname === "localhost" 
    ? "http://localhost:8000" 
    : "https://resilio-tbts.onrender.com", 
[]);

  // 1. 🛰️ GPS TRACKER (The "Delivery Guy" Logic)
  useEffect(() => {
    if ("geolocation" in navigator) {
      console.log("🛰️ Starting GPS Tracking...");
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("❌ GPS Error:", error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      alert("GPS not supported on this device");
    }
  }, []);

  // 2. Fetch Tasks & Socket Connection
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/v1/emergencies`);
        // Filter for tasks that are relevant to Rescuers
        const myTasks = data.filter(e => ['Assigned', 'En Route', 'On Scene'].includes(e.status));
        setTasks(myTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();

    const socket = io(BACKEND_URL);
    socket.on('emergency-updated', (updated) => {
      if (['Assigned', 'En Route', 'On Scene'].includes(updated.status)) {
        setTasks(prev => {
          const exists = prev.find(p => p._id === updated._id);
          if (exists) return prev.map(p => p._id === updated._id ? updated : p);
          return [updated, ...prev];
        });
        
        // Live Update the Active View
        if (activeMission && activeMission._id === updated._id) {
            setActiveMission(updated);
        }
      } else {
        // If resolved/removed
        setTasks(prev => prev.filter(p => p._id !== updated._id));
        if (activeMission && activeMission._id === updated._id) {
            setActiveMission(null);
        }
      }
    });

    return () => socket.disconnect();
  }, [BACKEND_URL, activeMission]);

  // 3. Status Update Logic (Robust Version)
  const updateStatus = async (status) => {
    if (!activeMission) return;
    
    // Store previous status in case we need to roll back
    const prevStatus = activeMission.status;

    // Optimistic update (Update UI immediately)
    setActiveMission(prev => ({ ...prev, status }));

    try {
      await axios.put(`${BACKEND_URL}/api/v1/emergencies/${activeMission._id}`, { status });
    } catch (err) {
      console.error("Update Failed:", err);

      // 🚨 ERROR HANDLING
      if (err.response && err.response.status === 404) {
         // Case: Mission was deleted or reassigned by Admin
         alert("🚫 Task no longer exists. Returning to list.");
         setActiveMission(null); // Kick user back to dashboard
         
         // Optional: Remove it from the list entirely
         setTasks(prev => prev.filter(t => t._id !== activeMission._id));
      } else {
         // Case: Server error or internet issue
         alert("⚠️ Connection Error: Could not update status.");
         // Rollback UI to previous state
         setActiveMission(prev => ({ ...prev, status: prevStatus }));
      }
    }
  };

  // 4. Submit Final Report
  const submitResolution = async () => {
    try {
      await axios.put(`${BACKEND_URL}/api/v1/emergencies/${activeMission._id}`, { 
        status: 'Resolved',
        resolutionDetails: {
            report: reportText,
            resolvedAt: new Date(),
            resolvedBy: "Officer Aditya (Rescue Unit)"
        }
      });
      setActiveMission(null);
      setReportText("");
      alert("Mission Accomplished! Good work.");
    } catch (err) {
      console.log(err)
      alert("Failed to submit report");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans relative overflow-hidden">
      
      {/* =========================================================
          VIEW 1: TASK LIST (When No Mission Selected)
         ========================================================= */}
      {!activeMission && (
        <div className="p-4 pb-20">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="text-red-500" /> Rescue Ops
              </h1>
              <p className="text-slate-400 text-xs">Unit: Alpha-1 • {myLocation ? "GPS Locked ✅" : "Searching GPS..."}</p>
            </div>
            <div 
              onClick={() => setIsOnline(!isOnline)}
              className={`px-4 py-2 rounded-full font-bold text-sm cursor-pointer transition-all ${
                isOnline ? 'bg-green-500/20 text-green-400 border border-green-500' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {isOnline ? '● ONLINE' : '○ OFFLINE'}
            </div>
          </header>

          <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">
            Incoming Tasks ({tasks.length})
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <Truck size={48} className="mx-auto mb-4" />
              <p>No active emergencies assigned.</p>
              <p className="text-xs">Stand by for dispatch.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task._id} 
                onClick={() => setActiveMission(task)}
                className="bg-slate-800 p-4 rounded-xl border border-slate-700 active:scale-[0.98] transition-transform cursor-pointer mb-3 shadow-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    task.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {task.severity}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(task.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{task.type}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{task.description}</p>
                
                {/* Distance Badge (Fake for demo, real calculation requires math) */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                        <MapPin size={16} /> 
                        <span>Tap to Navigate</span>
                    </div>
                    {myLocation && (
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                             📍 {(Math.abs(task.location.lat - myLocation.lat) * 111).toFixed(1)} km away
                        </span>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 2: SWIGGY STYLE LIVE MODE (When Mission Active)
         ========================================================= */}
      {activeMission && (
        <div className="absolute inset-0 z-50 flex flex-col bg-slate-900">
          
          {/* 🗺️ 1. TOP HALF: LIVE MAP */}
          <div className="flex-1 relative bg-slate-800">
            {/* Back Button Overlay */}
            <button 
                onClick={() => setActiveMission(null)}
                className="absolute top-4 left-4 z-[9999] bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20"
            >
                <X size={24}/>
            </button>

            {myLocation ? (
                <LiveRouteMap 
                    rescuerLocation={myLocation} 
                    emergencyLocation={activeMission.location} 
                />
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Navigation className="animate-spin mb-4" size={48} />
                    <p>Acquiring Satellite Lock...</p>
                </div>
            )}
          </div>

          {/* 📄 2. BOTTOM HALF: CONTROL SHEET */}
          <div className="bg-slate-900 border-t border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
             
             {/* Handle Bar */}
             <div className="w-full flex justify-center pt-3 pb-1">
                 <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
             </div>

             <div className="p-5">
                {/* Mission Title */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">{activeMission.type}</h2>
                        <p className="text-sm text-slate-400 line-clamp-1">{activeMission.description}</p>
                    </div>
                    <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        {activeMission.severity}
                    </div>
                </div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <a 
                        href={`tel:${100}`} 
                        className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700"
                    >
                        <Phone size={18} /> Call Control
                    </a>
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activeMission.location.lat},${activeMission.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Navigation size={18} /> Google Maps
                    </a>
                </div>

                {/* 🚦 STATUS SLIDER BUTTONS */}
                <div className="space-y-3">
                    
                    {activeMission.status === 'Assigned' && (
                        <button 
                            onClick={() => updateStatus('En Route')}
                            className="w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 border-l-4 border-yellow-500 animate-pulse"
                        >
                            <Truck /> START NAVIGATION (En Route)
                        </button>
                    )}

                    {(activeMission.status === 'En Route') && (
                        <button 
                            onClick={() => updateStatus('On Scene')}
                            className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-900/20"
                        >
                            <AlertOctagon /> I HAVE ARRIVED
                        </button>
                    )}

                    {activeMission.status === 'On Scene' && (
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
                            <label className="text-xs font-bold text-slate-400 mb-2 block">INCIDENT REPORT</label>
                            <textarea 
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                placeholder="Situation report..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm h-20 mb-3 focus:ring-2 focus:ring-green-500 outline-none text-white"
                            />
                            <button 
                                onClick={submitResolution}
                                disabled={!reportText}
                                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
                            >
                                <CheckCircle /> COMPLETE MISSION
                            </button>
                        </div>
                    )}
                </div>
             </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default RescuerDashboard;