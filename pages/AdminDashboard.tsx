
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Plus,
  Activity,
  Edit,
  Database,
  BrainCircuit,
  Upload,
  CheckCircle,
  FileCode,
  Loader2,
  Trash2,
  Cpu,
  BarChart3,
  TrendingDown,
  BookOpen,
} from 'lucide-react';

import api from '../api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchCourses();
    fetchLogs();
  }, []);

  React.useEffect(() => {
    if (selectedCourse) {
      fetchModels(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchModels = async (courseId: string) => {
    try {
      const { data } = await api.get(`/models/course/${courseId}`);
      setModels(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/logs');
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/teaching');
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách khóa học');
    }
  };

  const handleDelete = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    setDeleteLoading(courseId);
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Đã xóa khóa học');
      fetchCourses();
    } catch (err) {
      toast.error('Xóa khóa học thất bại');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const validExts = ['.pkl', '.pth', '.h5', '.joblib'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error(`File không hợp lệ. Chỉ chấp nhận: ${validExts.join(', ')}`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('model', file);
    formData.append('courseId', selectedCourse);

    try {
      await api.post('/models/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`✅ Model "${file.name}" đã được upload thành công!`);
      fetchModels(selectedCourse);
    } catch (err) {
      toast.error('Upload model thất bại');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleActivate = async (modelId: string) => {
    try {
      await api.post(`/models/${modelId}/activate`);
      toast.success('🚀 Model đã được kích hoạt thành công!');
      fetchModels(selectedCourse);
    } catch (err) {
      toast.error('Kích hoạt model thất bại');
      console.error(err);
    }
  };

  // Tính thống kê từ logs
  const highRiskCount = logs.filter(l => l.quizScore < 50 || l.attentionScore < 0.4).length;
  const avgQuizScore = logs.length > 0
    ? (logs.reduce((s, l) => s + (l.quizScore || 0), 0) / logs.length).toFixed(1)
    : '—';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Instructor Console</h1>
          <p className="text-slate-500 mt-2 font-medium">Quản lý khóa học, deploy model ML & phân tích học tập sinh viên.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link
            to="/admin/predict"
            className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
          >
            <BrainCircuit className="w-4 h-4" /> Dự Đoán Sinh Viên
          </Link>
          <button
            onClick={() => navigate('/admin/course/new')}
            className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Plus className="w-4 h-4" /> Tạo Khóa Học
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: <BookOpen className="w-5 h-5" />, value: courses.length, label: 'Khóa Học', color: 'indigo' },
          { icon: <Users className="w-5 h-5" />, value: [...new Set(logs.map(l => l.studentId))].length, label: 'Sinh Viên', color: 'blue' },
          { icon: <TrendingDown className="w-5 h-5" />, value: highRiskCount, label: 'Nguy Cơ Cao', color: 'red' },
          { icon: <BarChart3 className="w-5 h-5" />, value: `${avgQuizScore}%`, label: 'TB Quiz', color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-${stat.color}-50 text-${stat.color}-600`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">

          {/* ── Model Deployment ── */}
          <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Database className="w-6 h-6 text-indigo-600" /> Registry Model ML
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none"
                >
                  <option value="">Chọn Khóa Học</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <button
                  disabled={uploading || !selectedCourse}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                >
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  Upload Model
                </button>
                {/* Chấp nhận .pkl, .pth, .h5, .joblib */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pkl,.pth,.h5,.joblib"
                  onChange={handleUpload}
                />
              </div>
            </div>

            {/* Info box */}
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <p className="text-[10px] font-bold text-indigo-700 leading-relaxed">
                💡 <strong>Hệ thống sử dụng model XGBoost mặc định</strong> (<code>model_xgb.pkl</code>) nếu chưa có model nào được deploy cho khóa học.
                Upload model .pkl của bạn để ghi đè. Scaler và threshold mặc định luôn được áp dụng.
              </p>
            </div>

            <div className="space-y-4">
              {models.length > 0 ? (
                models.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${model.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{model.fileName}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Upload {new Date(model.uploadedAt).toLocaleDateString('vi-VN')}
                          </p>
                          {model.fileName.endsWith('.pkl') && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full text-[9px] font-black uppercase">
                              XGBoost / Sklearn
                            </span>
                          )}
                          {model.fileName.endsWith('.pth') && (
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-[9px] font-black uppercase">
                              PyTorch
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {model.active ? (
                        <span className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> Đang Dùng
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(model.id)}
                          className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          Kích Hoạt
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Chưa có model nào được upload cho khóa học này.</p>
                  <p className="text-slate-400 text-[10px] mt-1">Hệ thống đang dùng model XGBoost mặc định.</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Course Inventory ── */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden mb-10">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Danh Sách Khóa Học</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khóa Học</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bài Học</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng Thái</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {courses.map((course, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">{course.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-700">{course.lessons?.length || 0}</td>
                      <td className="px-8 py-6">
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                          Hoạt Động
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/course/edit/${course.id}`); }}
                            className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(course.id, e)}
                            disabled={deleteLoading === course.id}
                            className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                          >
                            {deleteLoading === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-6 text-center text-slate-400 text-sm italic">
                        Chưa có khóa học. Hãy tạo khóa học đầu tiên!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Learning Analytics ── */}
          <section id="analytics" className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Phân Tích Học Tập Sinh Viên</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Dữ liệu hành vi & kết quả học tập thời gian thực</p>
              </div>
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all"
              >
                Làm Mới
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sinh Viên</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời Gian</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hoạt Động</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Đánh Giá</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nguy Cơ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, i) => {
                    // Tính nguy cơ rớt sơ bộ từ log
                    const riskScore = ((100 - (log.quizScore || 0)) * 0.6 + (1 - (log.attentionScore || 0.5)) * 100 * 0.4) / 100;
                    const isHighRisk = riskScore > 0.5;
                    return (
                      <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-900 text-xs">{log.student?.name || 'Ẩn danh'}</div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">{log.studentId?.split('-')[0]}...</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-[10px] font-bold text-indigo-600">{log.student?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-[10px] font-black text-slate-700">{log.timeSpentMinutes?.toFixed(1)}m</div>
                          <div className="text-[9px] text-slate-400 font-bold">{log.pagesVisited} trang</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600">Video: {log.videoWatchedPercent}%</span>
                            <span className="text-[10px] font-bold text-slate-600">Click: {log.clickEvents}</span>
                            <span className="text-[10px] font-bold text-slate-600">Ghi chú: {log.notesTaken > 0 ? 'Có' : 'Không'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className={`text-[10px] font-black uppercase ${(log.quizScore || 0) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                              Quiz: {log.quizScore}% ({log.attemptsTaken} lần)
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">BT: {log.assignmentScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            isHighRisk
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-green-50 text-green-600 border-green-100'
                          }`}>
                            {isHighRisk ? '⚠ Cao' : '✓ Thấp'}
                          </span>
                          <div className="text-[9px] text-slate-400 mt-1">Attention: {((log.attentionScore || 0) * 100).toFixed(0)}%</div>
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-10 text-center text-slate-400 text-xs italic">
                        Chưa có dữ liệu học tập. Hệ thống đang chờ logs từ sinh viên.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">Cảnh Báo Nguy Cơ Rớt</h3>
              <p className="text-xs text-indigo-100 mb-4 leading-relaxed font-medium">
                {highRiskCount > 0
                  ? `${highRiskCount} sinh viên đang có nguy cơ cao trong dữ liệu hiện tại.`
                  : 'Chưa phát hiện nguy cơ rõ ràng. Chạy dự đoán để phân tích chi tiết.'}
              </p>
              {highRiskCount > 0 && (
                <div className="mb-6 px-4 py-2 bg-white/20 rounded-2xl">
                  <span className="text-3xl font-black">{highRiskCount}</span>
                  <span className="text-sm text-indigo-200 ml-2">sinh viên nguy cơ cao</span>
                </div>
              )}
              <Link
                to="/admin/predict"
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/20"
              >
                Mở Công Cụ Dự Đoán <Activity className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Thống Kê Hệ Thống</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-black">{[...new Set(logs.map(l => l.studentId))].length}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sinh Viên Hoạt Động</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-black">{logs.length}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tổng Learning Logs</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-black">{avgQuizScore}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TB Điểm Quiz</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
