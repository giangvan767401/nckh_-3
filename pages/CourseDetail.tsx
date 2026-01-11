import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuthStore, useCartStore } from '../store';
import { toast } from 'react-toastify';
import {
  Play,
  FileText,
  Clock,
  Globe,
  Star,
  Check,
  ChevronDown,
  Lock,
  Award,
  ArrowLeft
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('syllabus');
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const isInstructor = user?.role === 'INSTRUCTOR';

  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        // Load course details
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data);

        // Check if already enrolled
        if (isAuthenticated) {
          try {
            const myCoursesRes = await api.get('/courses/my');
            const myCourses = myCoursesRes.data || [];
            const hasJoined = myCourses.some((c: any) => c.id === id);
            setIsEnrolled(hasJoined);
          } catch (ignore) {
            // Ignore auth errors or failed check
          }
        }
      } catch (err) {
        toast.error("Failed to load course details");
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, navigate, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to enroll");
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${id}`);
      return;
    }

    // Attempt enrollment
    try {
      await api.post(`/courses/enroll/${id}`);
      toast.success("Enrolled successfully!");
      setIsEnrolled(true);
      navigate(`/learn/${id}`);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        // Fallback if client-side check missed it
        toast.info("You are already enrolled. Taking you to the course...");
        setIsEnrolled(true);
        navigate(`/learn/${id}`);
      } else {
        toast.error(err.response?.data?.message || "Enrollment failed");
      }
    }
  };

  const handleAddToCart = () => {
    if (course) {
      addItem({
        id: course.id,
        title: course.title,
        price: course.price,
        instructor: course.instructor?.name || 'Instructor',
        thumbnail: course.thumbnail
      });
      toast.success("Added to cart");
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!course) return <div className="p-12 text-center">Course not found</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* Course Hero */}
      <section className="bg-slate-900 text-white py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold mb-8 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-6">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">{course.category}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">{course.level}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{course.title}</h1>
              <p className="text-xl text-slate-300">{course.description}</p>

              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Star className="w-5 h-5 fill-current" /> 4.9 (120 Ratings)
                </div>
                <div className="text-slate-400">Created by <span className="text-blue-400 font-bold underline cursor-pointer">{course.instructor?.name || 'Instructor'}</span></div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-4 h-4" /> English
                </div>
              </div>
            </div>

            {/* Purchase Card (Floating) */}
            <div className="w-full md:w-[380px] shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-slate-900 sticky top-24">
                <div className="aspect-video bg-slate-100 rounded-xl mb-6 relative group overflow-hidden cursor-pointer">
                  <img src={course.thumbnail || `https://picsum.photos/seed/${course.id}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <Play className="w-8 h-8 text-blue-600 fill-current ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold">Preview this course</div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-black">${course.price}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <button onClick={handleEnroll} className="block w-full text-center py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    {isEnrolled ? "Start Learning" : "Enroll Now"}
                  </button>
                  <button onClick={handleAddToCart} className="w-full py-4 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all">
                    Add to Cart
                  </button>
                </div>

                <div className="text-xs text-center text-slate-500 mb-6">30-Day Money-Back Guarantee</div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm">This course includes:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-slate-600"><Play className="w-4 h-4 text-blue-600" /> {course.lessons?.length || 0} lessons</li>
                    <li className="flex items-center gap-3 text-sm text-slate-600"><Award className="w-4 h-4 text-blue-600" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {['About', 'Syllabus'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-8 py-4 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.toLowerCase() ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-2xl font-bold mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed">
                  {course.description || "No description available."}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'syllabus' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-2xl font-bold mb-6">Course Content</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
                  <span className="font-bold">Lessons</span>
                  <span className="text-sm text-slate-500">{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="p-4 space-y-3">
                  {course.lessons?.map((lesson: any, idx: number) => (
                    <div key={lesson.id} className="flex items-center justify-between px-2 py-2 hover:bg-slate-50 rounded-lg group">
                      <div className="flex items-center gap-4">
                        <Play className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                        <span className="text-sm text-slate-600">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 font-mono">{lesson.duration || "10:00"}</span>
                        <Lock className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  ))}
                  {(!course.lessons || course.lessons.length === 0) && (
                    <div className="text-center text-slate-400 italic">No lessons available yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
