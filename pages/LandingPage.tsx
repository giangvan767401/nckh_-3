
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, Palette, BarChart, ShieldCheck, Zap, Star, 
  Users, Award, ArrowRight, BookOpen, Heart, Activity
} from 'lucide-react';
import api from '../api';

const CATEGORIES = [
  { name: 'Web Dev', icon: <Code />, color: 'bg-blue-100 text-blue-600' },
  { name: 'Design', icon: <Palette />, color: 'bg-pink-100 text-pink-600' },
  { name: 'Business', icon: <BarChart />, color: 'bg-green-100 text-green-600' },
  { name: 'Security', icon: <ShieldCheck />, color: 'bg-purple-100 text-purple-600' },
];

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        const res = await api.get('/courses?limit=3');
        setCourses(res.data.items);
      } catch (err) {
        console.error("Failed to fetch featured courses");
      } finally {
        setLoading(false);
      }
    };
    fetchTopCourses();
  }, []);

  return (
    <div className="space-y-20 pb-20 animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-400/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-8 animate-bounce">
            <Activity className="w-3 h-3" />
            <span>Real-time Predictive Success Engine</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-slate-900">
            Learn with <br />
            <span className="text-indigo-600 relative">
              Absolute Precision
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-indigo-100 -z-10 rotate-1"></div>
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            The first NCKH-certified learning platform that uses deep learning to monitor your progress and ensure mastery through telemetry.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/courses" className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 group">
              Explore Modules <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/signup" className="px-10 py-5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              Create System ID
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Active High-Performance Modules</h2>
            <p className="text-slate-500 font-medium">Verified courses with active ML weighting models.</p>
          </div>
          <Link to="/courses" className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Full Catalog</Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="aspect-video bg-slate-100 rounded-[32px] animate-pulse"></div>)
          ) : (
            courses.map(course => (
              <Link to={`/course/${course.id}`} key={course.id} className="group bg-white rounded-[40px] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={course.thumbnail || `https://picsum.photos/seed/${course.id}/800/500`} alt={course.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900">{course.level}</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-1.5 text-yellow-500 mb-3">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-black text-slate-900">4.9</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{course.instructor?.name || 'Lead Instructor'}</p>
                  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                    <span className="text-2xl font-black text-slate-900">${course.price}</span>
                    <div className="flex items-center gap-1 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                      Inquire <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-slate-900 py-16 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <h3 className="text-3xl font-black mb-4 tracking-tight">Industrial Grade Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">All student telemetry is processed in an isolated environment ensuring 100% data privacy and compliance with international NCKH standards.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale invert">
            <div className="text-2xl font-black">NCKH</div>
            <div className="text-2xl font-black">REACT</div>
            <div className="text-2xl font-black">NESTJS</div>
            <div className="text-2xl font-black">PYTORCH</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
