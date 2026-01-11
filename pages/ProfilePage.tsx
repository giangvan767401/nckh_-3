
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  ArrowLeft, 
  Camera, 
  Mail, 
  Globe, 
  Lock, 
  LogOut,
  ChevronRight,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Trash2,
  Briefcase,
  Verified,
  Building,
  Key,
  AlertCircle,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../store';
import { UserRole } from '../types';

/**
 * ADMINISTRATOR (INSTRUCTOR) VIEW
 * Focused on management, security, and professional credentials.
 */
const InstructorProfileView = ({ user, logout }: { user: any, logout: () => void }) => {
  const [activeTab, setActiveTab] = useState('admin-profile');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row gap-16 animate-in fade-in duration-500">
      <aside className="w-full lg:w-80 shrink-0 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Console</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Admin ID: {user.id.padStart(4, '0')}</p>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'admin-profile', label: 'Admin Profile', icon: <UserIcon className="w-4 h-4" /> },
            { id: 'security', label: 'Access Control', icon: <Shield className="w-4 h-4" /> },
            { id: 'logs', label: 'System Logs', icon: <Bell className="w-4 h-4" /> },
            { id: 'billing', label: 'Payouts', icon: <CreditCard className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50">
        {activeTab === 'admin-profile' ? (
          <div className="space-y-10">
            <div className="flex items-center gap-8 pb-10 border-b border-slate-100">
              <div className="relative">
                <div className="w-32 h-32 rounded-[32px] bg-slate-900 flex items-center justify-center text-white text-5xl font-black">{user.name.charAt(0)}</div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white border-4 border-white"><Verified className="w-4 h-4" /></div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900">{user.name}</h2>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-lg border border-blue-100">Senior Administrator</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-lg">Verified Instructor</span>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Department</label>
                <input type="text" defaultValue="Computer Science & Engineering" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Employee ID</label>
                <input type="text" defaultValue="LUM-0992-SEC" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-300">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">Administrative Module Encrypted</p>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * USER (STUDENT) VIEW
 * Focused on learning progress, personal goals, and account customization.
 */
const StudentProfileView = ({ user, logout }: { user: any, logout: () => void }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in duration-500">
      <aside className="w-full lg:w-72 shrink-0">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
          <div className="w-24 h-24 rounded-full bg-blue-600 mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-100">
            {user.name.charAt(0)}
          </div>
          <h2 className="font-bold text-xl">{user.name}</h2>
          <p className="text-slate-500 text-sm mb-6">{user.email}</p>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BookOpen className="w-4 h-4" /> Learning Path
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Settings className="w-4 h-4" /> Preferences
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 space-y-8">
        {activeTab === 'overview' ? (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Award className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Certificates</p>
                    <p className="text-2xl font-black">4</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Zap className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Current Streak</p>
                    <p className="text-2xl font-black">12 Days</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Courses Finished</p>
                    <p className="text-2xl font-black">8</p>
                  </div>
                </div>
              </div>
            </div>

            <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="font-black text-xl mb-6">Active Learning Path</h3>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i}/100/100`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Course Module {i + 3}: Advanced UI Patterns</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">In Progress • 65% Complete</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-2xl font-black">Profile Settings</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Display Name</label>
                <input type="text" defaultValue={user.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Email Address</label>
                <input type="email" defaultValue={user.email} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">Save Changes</button>
          </div>
        )}
      </main>
    </div>
  );
};

const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black mb-4">Authentication Required</h2>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Log In</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] group transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> System Back
        </button>
      </div>

      {user.role === UserRole.ADMIN ? (
        <InstructorProfileView user={user} logout={logout} />
      ) : (
        <StudentProfileView user={user} logout={logout} />
      )}
    </div>
  );
};

export default ProfilePage;
