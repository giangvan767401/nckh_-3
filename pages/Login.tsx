
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { UserRole } from '../types';
import { Shield, User, Mail, Lock, Eye, EyeOff, Heart, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const Logo = () => (
  <div className="flex items-center gap-1.5 select-none justify-center mb-6">
    <div className="flex items-baseline">
      <span className="text-3xl font-black tracking-tighter text-slate-900">NCKH</span>
      <div className="relative flex items-center justify-center ml-1">
        <Heart className="w-6 h-6 text-indigo-600 fill-indigo-600 animate-pulse" />
      </div>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, access_token, refresh_token } = res.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      
      toast.success(`Access Granted: Welcome back, ${user.name}`);
      navigate(user.role === 'INSTRUCTOR' ? '/admin' : '/dashboard');
    } catch (err: any) {
      // Interceptor handles the toast, we just stop the loader
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-indigo-100 border border-slate-200 overflow-hidden animate-slide-up">
        <div className="p-8 sm:p-12">
          <Logo />
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Console Authentication</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize Security Credentials</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="user@system.nckh"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sync Credentials <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>

            <div className="text-center pt-4">
              <p className="text-xs text-slate-500 font-medium">
                No system ID yet? <Link to="/signup" className="font-black text-indigo-600 hover:underline">Register Module</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
