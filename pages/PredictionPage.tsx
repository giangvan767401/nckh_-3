
import React, { useState } from 'react';
import {
  BrainCircuit,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  ArrowLeft,
  AlertTriangle,
  BarChart2,
  Clock,
  MousePointer,
  Eye,
  FileText,
  BookOpen,
  Star,
  Calendar,
  Zap,
  Info,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../api';
import { toast } from 'react-toastify';

// ─── Kiểu dữ liệu kết quả ────────────────────────────────────────────────────
interface PredictionRaw {
  avgTimeSpent: number;
  avgPagesVisited: number;
  avgVideoWatched: number;
  totalInteractionEvents: number;
  avgNotesTaken: number;
  avgForumPosts: number;
  avgQuizScore: number;
  avgAttempts: number;
  avgAssignmentScore: number;
  avgFeedbackRating: number;
  avgDaysInactive: number;
  avgCumulativeQuiz: number;
  avgAttentionScore: number;
  totalLogsAnalyzed: number;
  threshold: number;
  inferenceSource: string;
  modelPath: string;
  verdict: string;
}

interface PredictionResult {
  failureRisk: number;
  confidence: number;
  verdict: string;
  rawOutput: PredictionRaw;
  studentInfo?: {
    id: string;
    name: string;
    email: string;
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const MetricCard = ({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: 'good' | 'bad' | 'neutral';
}) => {
  const colors = {
    good:    'text-green-600',
    bad:     'text-red-600',
    neutral: 'text-indigo-600',
  };
  return (
    <div className="bg-white/80 backdrop-blur p-5 rounded-3xl border border-white shadow-sm flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        <span className="w-4 h-4">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-xl font-black ${highlight ? colors[highlight] : 'text-slate-800'}`}>
        {value}
      </span>
      {sub && <span className="text-[9px] text-slate-400 font-medium">{sub}</span>}
    </div>
  );
};

// ─── Component chính ──────────────────────────────────────────────────────────
const PredictionPage = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/teaching');
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0].id);
    } catch {
      toast.error('Không thể tải danh sách khóa học');
    }
  };

  const handlePredict = async () => {
    if (!selectedCourse) {
      toast.error('Vui lòng chọn khóa học');
      return;
    }

    setIsPredicting(true);
    setPredictions(null);

    try {
      const res = await api.post(`/predictions/run-batch/${selectedCourse}`);
      setPredictions(res.data);
      if (res.data.length > 0) {
        toast.success(`✅ Hoàn tất phân tích cho ${res.data.length} sinh viên!`);
      } else {
        const courseName = courses.find(c => c.id === selectedCourse)?.title || '';
        toast.warn(`Chưa có sinh viên nào bắt đầu học hoặc có logs trong khóa "${courseName}"`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi chạy dự đoán';
      toast.error(`❌ ${msg}`);
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Tính thống kê
  const passCount = predictions?.filter(p => (p.verdict || (p.failureRisk >= (p.rawOutput?.threshold || 0.5) ? 'FAIL' : 'PASS')) === 'PASS').length || 0;
  const failCount = (predictions?.length || 0) - passCount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 flex justify-between items-center">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Admin Console
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            XGBoost Inference Live
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* ── Panel cấu hình ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <Activity className="w-6 h-6 text-indigo-600" /> Dự Đoán Sinh Viên
            </h2>
            <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">
              Nhập thông tin để chạy model XGBoost dự đoán sinh viên có nguy cơ rớt môn hay không.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Khóa Học
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                >
                  <option value="">Chọn khóa học...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <button
                onClick={handlePredict}
                disabled={isPredicting || !selectedCourse}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-xl shadow-indigo-100"
              >
                {isPredicting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</>
                  : <><BrainCircuit className="w-4 h-4" /> Chạy Dự Đoán Toàn Khóa</>
                }
              </button>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Về Model
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Model <strong className="text-white">XGBoost</strong> được train trên dữ liệu học tập với <strong className="text-white">13 features</strong>:
              thời gian học, điểm quiz, điểm bài tập, tương tác, chú ý, và nhiều hơn.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 font-medium">
                Sử dụng StandardScaler + custom threshold để tối ưu precision/recall.
              </p>
            </div>
          </div>
        </div>

        {/* ── Kết quả ── */}
        <div className="lg:col-span-8">
          {predictions ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-6">

              {/* ── Summary Banner ── */}
              <div className="p-8 rounded-[40px] border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                     <Users className="w-7 h-7 text-indigo-600" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Tổng quan: {predictions.length} Sinh Viên</h3>
                     <p className="text-sm text-slate-500 font-medium">Kết quả phân tích từ dữ liệu logs khóa học</p>
                   </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-6 py-4 bg-green-50 rounded-3xl border border-green-100">
                     <div className="text-2xl font-black text-green-600">{passCount}</div>
                     <div className="text-[10px] uppercase tracking-widest font-black text-green-700 mt-1">ĐẠT (PASS)</div>
                  </div>
                  <div className="text-center px-6 py-4 bg-red-50 rounded-3xl border border-red-100">
                     <div className="text-2xl font-black text-red-600">{failCount}</div>
                     <div className="text-[10px] uppercase tracking-widest font-black text-red-700 mt-1">NGUY CƠ (FAIL)</div>
                  </div>
                </div>
              </div>

              {/* ── Bảng Danh Sách ── */}
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" /> Bảng Xếp Hạng & Đánh Giá
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinh Viên</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nguy Cơ</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Độ Tin Cậy</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {predictions.map((p, idx) => {
                        const isPass = (p.verdict || (p.failureRisk >= (p.rawOutput?.threshold || 0.5) ? 'FAIL' : 'PASS')) === 'PASS';
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="font-bold text-slate-900 text-sm">{p.studentInfo?.name || 'Ẩn danh'}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{p.studentInfo?.email}</div>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <div className={`text-lg font-black ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                                {(p.failureRisk * 100).toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100/50 rounded-full text-[10px] font-black text-slate-500">
                                <Zap className="w-3 h-3" /> {(p.confidence * 100).toFixed(0)}%
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              {isError ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">LỖI HỆ THỐNG</span>
                                  <span className="text-[9px] text-slate-400 max-w-[120px] truncate">{p.details?.inferenceSource || 'Unknown error'}</span>
                                </div>
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                  isPass 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {isPass ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                  {isPass ? 'ĐẠT' : 'NGUY CƠ RỚT'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* ── Empty State ── */
            <div className="h-full min-h-[500px] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-slate-300 gap-4">
              <BrainCircuit className="w-20 h-20 opacity-20" />
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2">Chờ Kết Quả</p>
                <p className="text-[10px] font-medium text-slate-400 max-w-xs text-center leading-relaxed">
                  Chọn khóa học, sau đó nhấn <strong>Chạy Dự Đoán Toàn Khóa</strong> để phân tích toàn bộ sinh viên.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
