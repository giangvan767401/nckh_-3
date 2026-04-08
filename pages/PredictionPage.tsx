
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
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
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
    } catch {
      toast.error('Không thể tải danh sách khóa học');
    }
  };

  const handlePredict = async () => {
    if (!selectedCourse || !studentId.trim()) {
      toast.error('Vui lòng chọn khóa học và nhập ID hoặc email sinh viên');
      return;
    }

    setIsPredicting(true);
    setPrediction(null);

    try {
      const res = await api.post(
        `/predictions/run/${selectedCourse}/${encodeURIComponent(studentId.trim())}`
      );
      setPrediction(res.data);
      const verdict = res.data?.verdict ?? (res.data?.failureRisk >= 0.5 ? 'FAIL' : 'PASS');
      if (verdict === 'FAIL') {
        toast.warn('⚠️ Phân tích hoàn tất — Sinh viên có nguy cơ rớt môn!');
      } else {
        toast.success('✅ Phân tích hoàn tất — Sinh viên có khả năng đậu!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi chạy dự đoán';
      toast.error(`❌ ${msg}`);
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Tính verdict từ dữ liệu trả về (đảm bảo tương thích)
  const verdict = prediction?.verdict ??
    (prediction && prediction.failureRisk >= (prediction.rawOutput?.threshold ?? 0.5) ? 'FAIL' : 'PASS');

  const isPass = verdict === 'PASS';
  const raw = prediction?.rawOutput;

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

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Sinh Viên (Email hoặc UUID)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                  placeholder="vd: sinhvien@email.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300 transition"
                />
              </div>

              <button
                onClick={handlePredict}
                disabled={isPredicting || !selectedCourse || !studentId.trim()}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-xl shadow-indigo-100"
              >
                {isPredicting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</>
                  : <><BrainCircuit className="w-4 h-4" /> Chạy Dự Đoán</>
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
          {prediction ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-6">

              {/* ── Verdict Banner ── */}
              <div className={`p-10 rounded-[48px] border-2 ${
                isPass
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50/50 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-rose-50/50 border-red-200'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${
                      isPass ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'
                    }`}>
                      {isPass
                        ? <CheckCircle2 className="w-9 h-9 text-white" />
                        : <XCircle className="w-9 h-9 text-white" />
                      }
                    </div>
                    <div>
                      <div className={`text-3xl font-black tracking-tight ${isPass ? 'text-green-700' : 'text-red-700'}`}>
                        {isPass ? '✅ ĐẠT (PASS)' : '❌ RỚT (FAIL)'}
                      </div>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        {isPass
                          ? 'Sinh viên có khả năng hoàn thành khóa học thành công'
                          : 'Sinh viên có nguy cơ cao không hoàn thành khóa học'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-black ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                      {(prediction.failureRisk * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      Xác suất Rớt
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Đậu (0%)</span>
                    <span>Ngưỡng: {((raw?.threshold ?? 0.5) * 100).toFixed(0)}%</span>
                    <span>Rớt (100%)</span>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    {/* Threshold line */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-slate-400 z-10"
                      style={{ left: `${(raw?.threshold ?? 0.5) * 100}%` }}
                    />
                    {/* Risk fill */}
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isPass ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ width: `${prediction.failureRisk * 100}%` }}
                    />
                  </div>
                </div>

                {/* Confidence + Source */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full border border-white">
                    <Zap className="w-3 h-3 text-indigo-600" />
                    <span className="text-[10px] font-black text-slate-600">
                      Độ tin cậy: {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full border border-white">
                    <Database className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500">
                      {raw?.inferenceSource || 'xgboost'}
                    </span>
                  </div>
                  {raw?.totalLogsAnalyzed && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full border border-white">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500">
                        {raw.totalLogsAnalyzed} logs
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Metrics Grid ── */}
              {raw && (
                <div className={`p-8 rounded-[40px] border ${isPass ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Chi Tiết Features Phân Tích
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <MetricCard
                      icon={<Clock className="w-4 h-4" />}
                      label="TB Thời Gian Học"
                      value={`${raw.avgTimeSpent?.toFixed(1)} phút`}
                      highlight={raw.avgTimeSpent > 20 ? 'good' : raw.avgTimeSpent < 5 ? 'bad' : 'neutral'}
                    />
                    <MetricCard
                      icon={<BarChart2 className="w-4 h-4" />}
                      label="TB Điểm Quiz"
                      value={`${raw.avgQuizScore?.toFixed(1)}%`}
                      highlight={raw.avgQuizScore >= 50 ? 'good' : 'bad'}
                    />
                    <MetricCard
                      icon={<BookOpen className="w-4 h-4" />}
                      label="TB Điểm Bài Tập"
                      value={`${raw.avgAssignmentScore?.toFixed(1)}%`}
                      highlight={raw.avgAssignmentScore >= 50 ? 'good' : 'bad'}
                    />
                    <MetricCard
                      icon={<MousePointer className="w-4 h-4" />}
                      label="Tổng Tương Tác"
                      value={raw.totalInteractionEvents?.toString() ?? '0'}
                      highlight={raw.totalInteractionEvents > 50 ? 'good' : 'neutral'}
                    />
                    <MetricCard
                      icon={<Eye className="w-4 h-4" />}
                      label="TB Video Xem"
                      value={`${raw.avgVideoWatched?.toFixed(1)}%`}
                      highlight={raw.avgVideoWatched >= 70 ? 'good' : raw.avgVideoWatched < 30 ? 'bad' : 'neutral'}
                    />
                    <MetricCard
                      icon={<Zap className="w-4 h-4" />}
                      label="Chú Ý TB"
                      value={`${((raw.avgAttentionScore ?? 0) * 100).toFixed(1)}%`}
                      highlight={raw.avgAttentionScore >= 0.6 ? 'good' : raw.avgAttentionScore < 0.4 ? 'bad' : 'neutral'}
                    />
                    <MetricCard
                      icon={<FileText className="w-4 h-4" />}
                      label="TB Ghi Chú"
                      value={raw.avgNotesTaken?.toFixed(1) ?? '0'}
                      highlight='neutral'
                    />
                    <MetricCard
                      icon={<Star className="w-4 h-4" />}
                      label="Điểm Quiz Tích Lũy"
                      value={`${raw.avgCumulativeQuiz?.toFixed(1)}%`}
                      highlight={raw.avgCumulativeQuiz >= 50 ? 'good' : 'bad'}
                    />
                    <MetricCard
                      icon={<Calendar className="w-4 h-4" />}
                      label="Ngày Vắng TB"
                      value={`${raw.avgDaysInactive?.toFixed(0)} ngày`}
                      highlight={raw.avgDaysInactive <= 3 ? 'good' : raw.avgDaysInactive > 7 ? 'bad' : 'neutral'}
                    />
                  </div>
                </div>
              )}

              {/* ── Khuyến nghị ── */}
              {!isPass && (
                <div className="p-8 bg-amber-50 border border-amber-100 rounded-[32px]">
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Khuyến Nghị Can Thiệp
                  </h4>
                  <ul className="space-y-2 text-xs text-amber-800 font-medium leading-relaxed">
                    {(raw?.avgQuizScore ?? 0) < 50 && (
                      <li>• <strong>Điểm quiz thấp ({raw?.avgQuizScore?.toFixed(1)}%)</strong> — Cần hỗ trợ thêm về nội dung bài học và ôn luyện.</li>
                    )}
                    {(raw?.avgTimeSpent ?? 0) < 10 && (
                      <li>• <strong>Thời gian học ít ({raw?.avgTimeSpent?.toFixed(1)} phút/phiên)</strong> — Khuyến khích sinh viên tăng thời gian học.</li>
                    )}
                    {(raw?.avgAttentionScore ?? 1) < 0.5 && (
                      <li>• <strong>Điểm chú ý thấp ({((raw?.avgAttentionScore ?? 0) * 100).toFixed(0)}%)</strong> — Cần kiểm tra phương pháp học.</li>
                    )}
                    {(raw?.avgDaysInactive ?? 0) > 7 && (
                      <li>• <strong>Vắng học lâu ({raw?.avgDaysInactive?.toFixed(0)} ngày)</strong> — Cần liên hệ và động viên sinh viên.</li>
                    )}
                    {(raw?.avgAssignmentScore ?? 0) < 50 && (
                      <li>• <strong>Điểm bài tập thấp ({raw?.avgAssignmentScore?.toFixed(1)}%)</strong> — Cần hỗ trợ thêm về bài tập về nhà.</li>
                    )}
                    <li>• Cân nhắc tổ chức buổi phụ đạo hoặc tư vấn 1-1 với sinh viên này.</li>
                  </ul>
                </div>
              )}

            </div>
          ) : (
            /* ── Empty State ── */
            <div className="h-full min-h-[500px] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-slate-300 gap-4">
              <BrainCircuit className="w-20 h-20 opacity-20" />
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2">Chờ Kết Quả</p>
                <p className="text-[10px] font-medium text-slate-400 max-w-xs text-center leading-relaxed">
                  Chọn khóa học & nhập thông tin sinh viên, sau đó nhấn <strong>Chạy Dự Đoán</strong>
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
