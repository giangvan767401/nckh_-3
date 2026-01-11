
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  Bell,
  MessageCircle,
  MoreHorizontal,
  Check,
  Heart
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore, useCartStore, useNotificationStore } from './store';
import { UserRole } from './types';

// Page Components
import LandingPage from './pages/LandingPage';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PredictionPage from './pages/PredictionPage';
import CourseLearning from './pages/CourseLearning';
import CartPage from './pages/CartPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import CourseEditor from './pages/CourseEditor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-1.5 select-none ${className}`}>
    <div className="flex items-baseline">
      <span className="text-2xl font-black tracking-tighter text-slate-900">NCKH</span>
      <div className="relative flex items-center justify-center ml-0.5 group">
        <Heart className="w-5 h-5 text-indigo-600 fill-indigo-600 animate-pulse transition-transform group-hover:scale-125" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { notifications, markAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isInstructor = user?.role === UserRole.ADMIN;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="group flex items-center gap-3">
              <Logo />
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Platform</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/courses" className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors">Explore</Link>
              {isAuthenticated && !isInstructor && (
                <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors">Workspace</Link>
              )}
              {isAuthenticated && isInstructor && (
                <Link to="/admin" className="text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">Admin Console</Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Find courses, logs, or IDs..."
                className="pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-xs focus:ring-2 focus:ring-indigo-500/20 focus:bg-white w-48 transition-all focus:w-64 outline-none font-medium"
              />
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-2">
                {!isInstructor && (
                  <Link to="/cart" className="relative p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                    <ShoppingCart className="w-5 h-5" />
                    {items.length > 0 && (
                      <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white">
                        {items.length}
                      </span>
                    )}
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className={`p-2.5 rounded-xl transition-all ${showNotifs ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex flex-col">
                          <span className="font-black text-xs uppercase tracking-widest text-slate-900">Activity Logs</span>
                          <span className="text-[10px] text-slate-400 font-medium">{unreadCount} Pending Tasks</span>
                        </div>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                          <MoreHorizontal className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                      <div className="max-h-[480px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`px-6 py-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-4 ${!n.read ? 'bg-indigo-50/20' : ''}`}
                              onClick={() => markAsRead(n.id)}
                            >
                              <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${n.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-black text-slate-900 truncate pr-2">{n.title}</span>
                                  <span className="text-[9px] text-slate-400 font-mono shrink-0">{n.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2">{n.message}</p>
                                {!n.read && (
                                  <button className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Check className="w-3 h-3" /> Mark Resolved
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-full mx-auto flex items-center justify-center">
                              <Bell className="w-6 h-6 text-slate-200" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No logs found</p>
                          </div>
                        )}
                      </div>
                      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                        <button className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors">
                          View All System Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/messages" className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </div>
            )}

            <div className="h-8 w-px bg-slate-200 mx-2" />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-3 pl-2 group">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-black ring-4 ring-slate-100 transition-all group-hover:scale-105">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-black text-slate-900 leading-none mb-1">{user?.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-6 py-2.5 text-slate-600 font-black text-[10px] uppercase tracking-widest">Sign In</Link>
                <Link to="/signup" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Get Started</Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            {isAuthenticated && !isInstructor && (
              <Link to="/cart" className="p-2 text-slate-600">
                <ShoppingCart className="w-5 h-5" />
              </Link>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <Link to="/courses" className="block px-4 py-2 text-slate-600 font-black text-xs uppercase tracking-widest">Explore Courses</Link>
          <hr className="border-slate-100" />
          {isAuthenticated ? (
            <>
              {isInstructor ? (
                <Link to="/admin" className="block px-4 py-2 text-indigo-600 font-black text-xs uppercase tracking-widest">Admin Console</Link>
              ) : (
                <Link to="/dashboard" className="block px-4 py-2 text-slate-600 font-black text-xs uppercase tracking-widest">Workspace</Link>
              )}
              <Link to="/profile" className="block px-4 py-2 text-slate-600 font-black text-xs uppercase tracking-widest">Profile Settings</Link>
              <Link to="/messages" className="block px-4 py-2 text-slate-600 font-black text-xs uppercase tracking-widest">System Inbox</Link>
              {!isInstructor && <Link to="/cart" className="block px-4 py-2 text-slate-600 font-black text-xs uppercase tracking-widest">Shopping Cart</Link>}
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 font-black text-xs uppercase tracking-widest">Terminate Session</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-4 py-2 text-slate-600 font-black text-xs uppercase tracking-widest">Sign In</Link>
              <Link to="/signup" className="block w-full text-center py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Fix: Pass component as child to ProtectedRoute */}
            <Route path="/learn/:id" element={<ProtectedRoute children={<CourseLearning />} />} />
            <Route path="/dashboard" element={<ProtectedRoute children={<StudentDashboard />} />} />
            <Route path="/admin" element={<ProtectedRoute children={<AdminDashboard />} />} />
            <Route path="/admin/course/new" element={<ProtectedRoute children={<CourseEditor />} />} />
            <Route path="/admin/course/edit/:id" element={<ProtectedRoute children={<CourseEditor />} />} />
            <Route path="/admin/predict" element={<ProtectedRoute children={<PredictionPage />} />} />
            <Route path="/cart" element={<ProtectedRoute children={<CartPage />} />} />
            <Route path="/messages" element={<ProtectedRoute children={<MessagesPage />} />} />
            <Route path="/profile" element={<ProtectedRoute children={<ProfilePage />} />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-16 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <div className="mb-6">
                <Logo />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Enterprise-grade education tracking and administrative management through custom predictive modeling.</p>
            </div>
            <div>
              <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-6">Workspace</h4>
              <ul className="space-y-3 text-xs text-slate-500 font-medium">
                <li className="hover:text-indigo-600 transition-colors cursor-pointer">Support Portal</li>
                <li className="hover:text-indigo-600 transition-colors cursor-pointer">API Documentation</li>
                <li className="hover:text-indigo-600 transition-colors cursor-pointer">Security Protocols</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-6">Administrative</h4>
              <ul className="space-y-3 text-xs text-slate-500 font-medium">
                <li><Link to="/admin" className="hover:text-indigo-600">Instructor Console</Link></li>
                <li><Link to="/admin/predict" className="hover:text-indigo-600">Model Deployment</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-6">Compliance</h4>
              <ul className="space-y-3 text-xs text-slate-500 font-medium">
                <li className="hover:text-indigo-600">Privacy Standards</li>
                <li className="hover:text-indigo-600">Usage Terms</li>
                <li className="hover:text-indigo-600">GDPR Compliance</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">© 2024 NCKH LEARNING SYSTEMS. ALL SYSTEMS OPERATIONAL.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
