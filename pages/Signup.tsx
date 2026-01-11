
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store';
import { UserRole } from '../types';
import { Shield, User, Mail, Lock, Eye, EyeOff, ArrowRight, Heart } from 'lucide-react';
import api from '../api';

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

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call backend API
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role
      });

      const { user, access_token, refresh_token } = res.data;

      // Save tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Update auth store
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      // Navigate
      navigate(user.role === UserRole.ADMIN ? '/admin' : '/dashboard');
    } catch (err: any) {
      console.error('Registration failed:', err);
      const message = err.response?.data?.message;
      if (Array.isArray(message)) {
        message.forEach(msg => toast.error(msg));
      } else {
        toast.error(message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full grid md:grid-cols-5 bg-white rounded-[40px] shadow-2xl shadow-indigo-100 border border-slate-200 overflow-hidden">

        {/* Left Side Branding */}
        <div className="hidden md:flex md:col-span-2 bg-indigo-600 p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black leading-tight mb-4">Start your research journey.</h2>
            <p className="text-indigo-100 text-sm leading-relaxed">Join the world's most advanced learning system powered by NCKH.</p>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Secure Access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Personalized</span>
            </div>
          </div>
          <div className="absolute top-[-10%] right-[-20%] w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-3 p-8 sm:p-12 flex flex-col justify-center">
          <Logo />
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900">Create Account</h2>
            <p className="text-slate-400 text-sm mt-1">Select your role to get started</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Role Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole(UserRole.STUDENT)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.STUDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.ADMIN)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.ADMIN ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Shield className="w-4 h-4" /> Instructor
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="name@email.com"
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
                    className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="Min 8 chars"
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

            <div className="flex items-start gap-3 px-1">
              <input type="checkbox" className="mt-1 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500" required />
              <span className="text-[11px] text-slate-500 leading-relaxed font-medium">
                I agree to the <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Privacy Policy</span>.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group"
            >
              Initialize Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-4">
              <p className="text-xs text-slate-500 font-medium">
                Already have a system profile? <Link to="/login" className="font-black text-indigo-600 hover:underline">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
