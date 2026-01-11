
import React, { useState, useRef } from 'react';
import {
  BrainCircuit,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Upload,
  FileCode,
  Database,
  ArrowLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../api';
import { toast } from 'react-toastify';

const PredictionPage = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<{ failureRisk: number; confidence: number; rawOutput: any } | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentId, setStudentId] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/teaching');
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0].id);
    } catch (err) {
      toast.error('Failed to load courses');
    }
  };

  const handlePredict = async () => {
    if (!selectedCourse || !studentId) {
      toast.error('Please select a course and enter a student ID');
      return;
    }

    setIsPredicting(true);
    setPrediction(null);

    try {
      // Use encodeURIComponent for identifiers like emails that contain special characters
      const res = await api.post(`/predictions/run/${selectedCourse}/${encodeURIComponent(studentId)}`);
      setPrediction(res.data);
      toast.success('Inference completed successfully');
    } catch (err: any) {
      // The backend returns a detailed message in err.response.data.message
      const msg = err.response?.data?.message || "Failed to run inference";
      toast.error(`Error: ${msg}`);
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 flex justify-between items-center">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Admin Console
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Inference Hub Live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Activity className="w-6 h-6 text-indigo-600" /> Predict Success
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Course Context</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Student Target (Email or ID)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="name@example.com or uuid"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <button
                onClick={handlePredict}
                disabled={isPredicting || !selectedCourse || !studentId}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100"
              >
                {isPredicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                Execute Inference
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-10 text-white">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Secure Compute
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Inference is processed via a PyTorch bridge in a dedicated environment. Telemetry data is encrypted in transit.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          {prediction ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className={`p-12 rounded-[48px] border-2 ${prediction.failureRisk < 0.4 ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Risk Report</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Status: Analysis Complete</p>
                  </div>
                  <div className={`text-6xl font-black ${prediction.failureRisk < 0.4 ? 'text-green-600' : 'text-red-600'}`}>
                    {((1 - prediction.failureRisk) * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-white flex flex-col gap-2 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</span>
                    <span className="text-xl font-black text-indigo-600">{(prediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-white flex flex-col gap-2 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Quiz Score</span>
                    <span className="text-xl font-black text-slate-800">{prediction.rawOutput.avgScore.toFixed(1)}%</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-white flex flex-col gap-2 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Time Spent</span>
                    <span className="text-xl font-black text-slate-800">{prediction.rawOutput.avgTimeSpent.toFixed(1)}m</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-white flex flex-col gap-2 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactions</span>
                    <span className="text-xl font-black text-slate-800">{prediction.rawOutput.totalInteractionEvents}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-slate-300">
              <BrainCircuit className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Trigger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
