import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LayoutDashboard, Map as MapIcon, Shield, Bell, AlertTriangle, LogOut, Menu } from 'lucide-react';

// Import your custom components
import EmergencyMap from '../components/Map/EmergencyMap';
import EmergencyDetail from '../components/Dashboard/EmergencyDetail';

const Dashboard = () => {
  // 1. Determine Backend URL (Auto-switches for Live/Local)
  const BACKEND_URL = useMemo(() => 
    window.location.hostname === "localhost" 
      ? "http://localhost:8000" 
      : "https://resilio-tbts.onrender.com", 
  []);

  // 2. State Management
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // 3. Fetch Data & Real-time Listeners
  useEffect(() => {
    // A. Fetch Initial Data
    const fetchEmergencies = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/v1/emergencies`);
        // Sort by newest first
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setEmergencies(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchEmergencies();

    // B. Setup Real-Time Socket Connection
    const socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("✅ Connected to Live Server:", socket.id);
    });

    socket.on("new-emergency", (newReport) => {
      console.log("🚨 New Alert Received:", newReport);

      // Play Alert Sound (Ensure 'alert.mp3' is in your public folder)
      try {
        const audio = new Audio('/alert.mp3'); 
        audio.play().catch(e => console.warn("Audio blocked by browser policy"));
      } catch (e) {
        console.warn("Sound file not found");
      }

      // Add new report to the TOP of the list immediately
      setEmergencies((prev) => [newReport, ...prev]);
      setNotifications((prev) => prev + 1);
    });

    // Cleanup: Disconnect socket when leaving the page
    return () => {
      socket.disconnect();
    };
  }, [BACKEND_URL]);

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
             <Shield className="text-white" fill="currentColor" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">Resilio Ops</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-900/20">
            <LayoutDashboard size={18} /> Live Feed
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-400 transition-all">
            <MapIcon size={18} /> Global Map
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg text-[10px] text-green-400 uppercase tracking-widest font-bold border border-slate-700">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             System Online
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Menu className="text-slate-500 md:hidden" />
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              Live Emergency Feed
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer group" onClick={() => setNotifications(0)}>
              <Bell className="text-slate-500 group-hover:text-red-600 transition-colors" size={22} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse shadow-sm">
                  {notifications}
                </span>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-all border border-transparent hover:border-slate-200"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-slate-900">Officer Aditya</p>
                  <p className="text-[10px] text-slate-500 font-medium">Tier-1 Command</p>
                </div>
                <div className="h-9 w-9 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-slate-100">
                  AD
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <section className="flex-1 flex p-4 md:p-6 gap-6 overflow-hidden relative">
          
          {/* LEFT: Map Component */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <EmergencyMap emergencies={emergencies} />
          </div>
          
          {/* RIGHT: Active Alerts List */}
          <div className="hidden md:flex flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex-col overflow-hidden min-w-[320px] max-w-[400px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between backdrop-blur-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} className="text-red-600" /> 
                  Incoming Reports
                </h3>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-black uppercase tracking-wider">
                  {emergencies.length} Active
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs">Syncing Satellite Data...</p>
                  </div>
                ) : emergencies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Shield size={40} className="text-slate-200 mb-2" />
                    <p className="text-sm font-medium">All Systems Nominal</p>
                    <p className="text-xs">No active threats detected.</p>
                  </div>
                ) : (
                  emergencies.map(incident => (
                    <div 
                      key={incident._id} 
                      onClick={() => setSelectedIncident(incident)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md active:scale-[0.98] group ${
                        selectedIncident?._id === incident._id 
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500' 
                        : 'border-slate-100 bg-white hover:border-red-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                          {incident.type}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shadow-sm ${
                          incident.severity === 'Critical' ? 'bg-red-600 text-white' : 
                          incident.severity === 'Serious' ? 'bg-orange-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {incident.description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                         {/* Audio Indicator */}
                         {incident.audioUrl ? (
                           <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                             🎤 Voice Note
                           </span>
                         ) : (
                           <span className="text-[10px] text-slate-400">Text Report</span>
                         )}
                         <span className="text-[10px] text-slate-400 font-mono">
                           {new Date(incident.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </div>
        </section>

        {/* Detail Review Modal */}
        {selectedIncident && (
          <EmergencyDetail 
            incident={selectedIncident} 
            onClose={() => setSelectedIncident(null)} 
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;