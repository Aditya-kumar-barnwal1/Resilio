import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // For now, we'll just navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl border-t-8 border-red-600 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Resilio</h1>
          <p className="text-slate-500 mt-2 font-medium">Authority Command Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Official Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input 
                type="email" 
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="officer@agency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-red-200 transition-all transform active:scale-95"
          >
            Authorize Access
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 uppercase tracking-widest">
          Secured by Resilio AI Systems [cite: 52]
        </p>
      </div>
      
      <div className="mt-6 text-slate-400 text-sm">
        Authorized Personnel Only • Audit Logging Enabled 
      </div>
    </div>
  );
};

export default Login;