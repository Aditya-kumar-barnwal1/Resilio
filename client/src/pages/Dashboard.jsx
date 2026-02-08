import React, { useState } from 'react';
import { LayoutDashboard, Map as MapIcon, Shield, Bell, AlertTriangle, User, Settings, LogOut } from 'lucide-react';
import EmergencyMap from '../components/Map/EmergencyMap';
import EmergencyDetail from '../components/Dashboard/EmergencyDetail';

const Dashboard = () => {
  // State for live emergency reports [cite: 53, 127]
  const [emergencies, setEmergencies] = useState([
    { 
      id: 1, 
      lat: 20.2961, 
      lng: 85.8245, 
      type: 'Fire', 
      severity: 'Critical', 
      description: 'Major fire reported at commercial complex. AI detected high smoke density.' 
    },
    { 
      id: 2, 
      lat: 20.3010, 
      lng: 85.8100, 
      type: 'Medical', 
      severity: 'Serious', 
      description: 'Road accident reported near the station. Location verified via geo-tagging.' 
    }
  ]);

  // UI States
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(emergencies.length);

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      
      {/* 1. Sidebar - Authority Control [cite: 94] */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Shield className="text-red-500" fill="currentColor" size={24} />
          <span className="text-xl font-bold tracking-tight">Resilio Ops</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-900/20">
            <LayoutDashboard size={18} /> Live Feed
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-400 transition-all">
            <MapIcon size={18} /> Emergency Map
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-800/50 p-3 rounded-lg text-[10px] text-slate-400 uppercase tracking-widest font-bold">
             System Status: Online
           </div>
        </div>
      </aside>

      {/* Main Content Area  */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. Top Header - Global Actions */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-bold text-slate-800">Live Emergency Feed</h2>
          
          <div className="flex items-center gap-6">
            {/* Notification Button  */}
            <div className="relative cursor-pointer group" onClick={() => setNotifications(0)}>
              <Bell className="text-slate-500 group-hover:text-red-600 transition-colors" size={22} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {notifications}
                </span>
              )}
            </div>

            {/* Profile Dropdown  */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-all"
              >
                <div className="h-9 w-9 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  AD
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-900">Officer Aditya</p>
                  <p className="text-[10px] text-slate-500">Tier-1 Authority</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <User size={16} /> My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings size={16} /> Settings
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. Dashboard Body [cite: 89, 170] */}
        <section className="flex-1 flex p-6 gap-6 overflow-hidden">
          
          {/* Main Map Component  */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <EmergencyMap emergencies={emergencies} />
          </div>
          
          {/* 4. Active Alerts Feed [cite: 128] */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-w-[350px]">
             <div className="p-5 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" /> 
                  Active Alerts
                </h3>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-black uppercase">
                  Live
                </span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {emergencies.map(incident => (
                  <div 
                    key={incident.id} 
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
                      selectedIncident?.id === incident.id 
                      ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500' 
                      : 'border-slate-100 bg-slate-50/30 hover:border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-black text-slate-900">{incident.type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shadow-sm ${
                        incident.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {incident.description}
                    </p>
                    <div className="mt-3 text-[10px] text-slate-400 font-medium">
                      Received: Just now • AI Verified
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </main>

      {/* 5. Detail Review Modal [cite: 132] */}
      {selectedIncident && (
        <EmergencyDetail 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;