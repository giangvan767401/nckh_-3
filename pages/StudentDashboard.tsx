import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Course } from '../types';
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Download,
  Share2,
  Filter,
  Search,
  ExternalLink,
  Medal
} from 'lucide-react';

type DashboardTab = 'overview' | 'courses' | 'certificates';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [courseFilter, setCourseFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]); // Added state for certificates
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses/my');
        // Map backend courses to dashboard format
        const mapped = res.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          instructor: c.instructor?.name || 'Instructor',
          progress: 0,
          color: 'bg-blue-600',
          lastAccessed: 'Recently',
          status: 'active',
          thumbnail: c.thumbnail || `https://picsum.photos/seed/${c.id}/200/200`
        }));
        setEnrolledCourses(mapped);

        // Mock certificates
        setCertificates([
          {
            id: 'CERT001',
            title: 'Foundations of Web Development',
            date: '2023-01-15',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop'
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const myCourses = enrolledCourses;
  const latestCourse = myCourses.length > 0 ? myCourses[0] : null; // Handle empty array
  const filteredCourses = myCourses.filter(c => courseFilter === 'all' || c.status === courseFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-inner">
              <span className="text-3xl font-bold text-blue-600">JS</span>
            </div>
            <h3 className="text-center font-bold text-lg">Student</h3>
            <p className="text-center text-sm text-slate-500 mb-4">Learner</p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="font-bold">{myCourses.length}</div>
                <div className="text-[10px] text-slate-400 uppercase">Courses</div>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BookOpen className="w-5 h-5" /> My Courses
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'certificates' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Award className="w-5 h-5" /> Certificates
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                  <p className="opacity-90 max-w-md">Continue where you left off.</p>
                  <div className="mt-6 flex items-center gap-4">
                    {latestCourse ? (
                      <Link to={`/learn/${latestCourse.id}`} className="px-6 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-50 transition-all">Resume Learning</Link>
                    ) : (
                      <Link to="/courses" className="px-6 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-50 transition-all">Browse Courses</Link>
                    )}
                  </div>
                </div>
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-100 flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  <span className="text-sm font-bold">{certificates.length} Total Earned</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="aspect-[4/3] bg-slate-100 border-b border-slate-100 p-6 flex flex-col items-center justify-center text-center relative group">
                      <img src={cert.image} className="w-full h-full object-cover rounded shadow-lg" alt="" />
                      <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg">
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{cert.title}</h3>
                          <p className="text-xs text-slate-400">Issued on {cert.date}</p>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">ID: {cert.id}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                          <ExternalLink className="w-4 h-4" /> Public Profile
                        </button>
                        <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <Download className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Milestone Suggestion Card */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">Next Milestone: Expert Dev</h4>
                  <p className="text-xs text-slate-500 max-w-[200px] mb-6">Complete the 'Advanced React Patterns' course to earn your next professional badge.</p>
                  <button onClick={() => setActiveTab('courses')} className="text-sm text-blue-600 font-black hover:underline">CONTINUE COURSE</button>
                </div>
              </div>
            </div>
          )
          }
        </main >
      </div >
    </div >
  );
};

// Helper for consistency
const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
  </svg>
);

export default StudentDashboard;
