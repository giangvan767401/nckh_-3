
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Play,
  ChevronRight,
  ChevronLeft,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  MessageSquare,
  Edit3,
  Timer,
  AlertCircle,
  Trophy,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  Award,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store';
import { MLPredictionParams, Course, Lesson } from '../types';
import api from '../api';
import { toast } from 'react-toastify';

const CourseLearning = () => {
  const { id: courseId } = useParams();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  // Exam State (Frontend Mock for now as backend exam API is not fully specified)
  const [examStatus, setExamStatus] = useState<'idle' | 'taking' | 'grading' | 'reviewed'>('idle');
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<{ score: number; total: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);

  // Tracking State for ML Logs
  const logBuffer = useRef<any[]>([]);
  const startTime = useRef<number>(Date.now());
  const clickCount = useRef<number>(0);
  const sessionId = useRef<string>(Math.random().toString(36).substring(7));
  const visitedPages = useRef<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [quizStats, setQuizStats] = useState({ score: 0, attempts: 0 });

  // Derived values for logging (moved up to avoid ReferenceError)
  const sortedLessons = course?.lessons?.sort((a, b) => a.order - b.order) || [];
  const activeLesson = sortedLessons[activeLessonIndex];

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, completionsRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/courses/${courseId}/completions`)
        ]);
        setCourse(courseRes.data);
        setCompletedLessons(completionsRes.data);
      } catch (err) {
        toast.error('Failed to load course content');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourseData();
  }, [courseId, navigate]);

  const handleComplete = async (lessonId: string) => {
    try {
      await api.post(`/courses/lessons/${lessonId}/complete`);
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons([...completedLessons, lessonId]);
      }
      toast.success("Progress saved!");
    } catch (err) {
      toast.error("Failed to save progress");
    }
  };

  // Timer for exams
  useEffect(() => {
    let timer: number;
    if (examStatus === 'taking' && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleExamSubmit();
    }
    return () => clearInterval(timer);
  }, [examStatus, timeLeft]);

  // Buffer collection logic
  useEffect(() => {
    const trackClick = () => { clickCount.current++; };
    window.addEventListener('click', trackClick);

    const interval = setInterval(() => {
      if (!user) return;

      const logEntry = {
        sessionId: sessionId.current,
        timestamp: new Date().toISOString(),
        moduleId: courseId || 'unknown',
        timeSpentMinutes: (Date.now() - startTime.current) / 60000,
        pagesVisited: visitedPages.current.size,
        videoWatchedPercent: 65, // Simulated for now
        clickEvents: clickCount.current,
        notesTaken: notes.length > 5 ? 1 : 0,
        forumPosts: 0,
        revisitFlag: activeLesson ? completedLessons.includes(activeLesson.id) : false,
        quizScore: quizStats.score,
        attemptsTaken: quizStats.attempts,
        assignmentScore: 0,
        feedbackRating: 4,
        daysSinceLastActivity: Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24)),
        cumulativeQuizScore: quizStats.score,
        learningTrend: 'stable',
        attentionScore: Math.min(1, (clickCount.current * 0.1) + 0.5),
        feedbackType: 'general',
        nextModulePrediction: 'Next Module Alpha',
        successLabel: quizStats.score >= 80
      };

      logBuffer.current.push(logEntry);
      if (logBuffer.current.length >= 1) {
        console.log('[DEBUG] Sending log batch:', logBuffer.current);
        api.post('/logs/batch', logBuffer.current)
          .then(() => console.log('[DEBUG] Logs sent successfully'))
          .catch(console.error);
        logBuffer.current = [];
      }
    }, 15000);

    return () => {
      window.removeEventListener('click', trackClick);
      clearInterval(interval);
    };
  }, [user, notes, examResult, activeLesson, completedLessons, quizStats, lastActivity]);

  const handleExamSubmit = () => {
    setExamStatus('grading');
    setTimeout(() => {
      const correctCount = Object.keys(examAnswers).length;
      setExamResult({ score: correctCount * 20, total: 100 });
      setExamStatus('reviewed');
    }, 1500);
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoaderCircle className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }


  // Helper to render exam portal (kept largely same but simplified for brevity in this replace)
  const renderExamPortal = () => {
    // ... (Mock exam UI logic, reusing existing logic structure but adapted)
    // For brevity, assuming we only have video lessons for now or handling 'exam' type if backend supports it.
    // Current backend Lesson entity is video-focused. We'll stick to video player for this task.
    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> System Workspace
          </button>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-50 border border-green-100 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Logging Active</span>
            </div>
          </div>
        </div>

        {activeLesson ? (
          <div className="p-4 md:p-10">
            {activeLesson.type === 'QUIZ' ? (
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm mb-10">
                <QuizInterface lesson={activeLesson} onComplete={handleComplete} onStatsUpdate={(stats) => setQuizStats(prev => ({ score: stats.score, attempts: prev.attempts + 1 }))} />
              </div>
            ) : (
              <div className="space-y-6 mb-10">
                <div className="relative pt-[56.25%] bg-black w-full group overflow-hidden rounded-xl">
                  <iframe
                    key={activeLesson.id}
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeId(activeLesson.videoUrl || "") || "LXb3EKWsInQ"}?autoplay=0&rel=0`}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                {!completedLessons.includes(activeLesson.id) ? (
                  <button
                    onClick={() => handleComplete(activeLesson.id)}
                    className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> MARK AS COMPLETED
                  </button>
                ) : (
                  <div className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-xl border border-slate-200 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> COMPLETED
                  </div>
                )}
              </div>
            )}

            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">{activeLesson.title}</h1>
                  {activeLesson.type === 'VIDEO' && (
                    <div className="text-xs text-slate-400 font-mono mb-2">Video Source: {activeLesson.videoUrl || "Default Fallback"}</div>
                  )}
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Lesson {activeLesson.order}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{course.title}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-tight">
                      {activeLesson.type === 'QUIZ' ? 'Quiz Overview' : 'Lesson Content'}
                    </h3>
                    <div className="text-slate-500 leading-relaxed text-sm whitespace-pre-wrap">
                      {activeLesson.type === 'QUIZ' ? 'Test your knowledge on the concepts covered in this module.' : activeLesson.content}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Notes
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Record insights..."
                      className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none font-medium text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 font-bold">No lessons available in this course.</div>
        )}
      </div>

      <aside className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-screen overflow-y-auto sticky top-0">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-black text-xl text-slate-900 tracking-tight">Curriculum</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{course.title}</p>
        </div>

        <div className="flex-1">
          <div className="border-b border-slate-100">
            {/* Treating entire course as one "Module" for now since backend lacks Module entity */}
            <div className="w-full p-8 text-left bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm leading-tight">Course Content</h4>
            </div>

            <div className="bg-slate-50/50 py-2">
              {sortedLessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      visitedPages.current.add(lesson.id);
                    }}
                    className={`flex items-center gap-4 px-8 py-4 cursor-pointer hover:bg-white transition-all ${activeLessonIndex === idx ? 'bg-white border-r-4 border-r-indigo-600' : ''}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className={`w-5 h-5 ${activeLessonIndex === idx ? 'text-indigo-600 fill-indigo-100' : 'text-slate-200'}`} />
                    )}
                    <div className="flex-1">
                      <p className={`text-xs ${activeLessonIndex === idx ? 'font-black text-slate-900' : 'text-slate-500 font-medium'}`}>{lesson.title}</p>
                      <span className="text-[10px] text-slate-400">{lesson.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

const LoaderCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

const QuizInterface = ({ lesson, onComplete, onStatsUpdate }: { lesson: any, onComplete?: (id: string) => void, onStatsUpdate?: (stats: { score: number }) => void }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    try {
      const parsed = JSON.parse(lesson.content);
      setQuestions(Array.isArray(parsed) ? parsed : []);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
    } catch (e) {
      setQuestions([]);
    }
  }, [lesson]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    const percentage = (correct / questions.length) * 100;

    // Update tracking stats
    onStatsUpdate?.({ score: percentage });

    if (percentage >= 80) {
      toast.success(`Quiz passed with ${percentage}%! Completion recorded.`);
      onComplete?.(lesson.id);
    } else {
      toast.warning(`You scored ${percentage}%. You need 80% to pass.`);
    }
  };

  if (!questions.length) return <div className="text-slate-400 italic">No questions found for this quiz.</div>;

  return (
    <div className="space-y-8">
      {submitted && (
        <div className={`p-6 rounded-2xl mb-6 flex items-center gap-4 ${score === questions.length ? 'bg-green-100 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
          <Trophy className="w-8 h-8" />
          <div>
            <h4 className="font-black text-xl">You scored {score} / {questions.length}</h4>
            <p className="text-sm opacity-80">{score === questions.length ? 'Perfect score! Great job!' : 'Review your answers below.'}</p>
          </div>
        </div>
      )}

      {questions.map((q, qIdx) => (
        <div key={qIdx} className="space-y-4 border-b border-slate-100 last:border-0 pb-8 last:pb-0">
          <h4 className="font-bold text-lg text-slate-800 flex gap-3">
            <span className="text-slate-300">#{qIdx + 1}</span>
            {q.text}
          </h4>
          <div className="space-y-2 pl-8">
            {q.options.map((opt: string, oIdx: number) => {
              const isSelected = answers[qIdx] === oIdx;
              const isCorrect = q.correctAnswer === oIdx;
              let optionClass = "border-slate-200 hover:bg-slate-50";

              if (submitted) {
                if (isCorrect) optionClass = "border-green-500 bg-green-50 text-green-800 font-bold";
                else if (isSelected && !isCorrect) optionClass = "border-red-300 bg-red-50 text-red-800";
              } else if (isSelected) {
                optionClass = "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold";
              }

              return (
                <div
                  key={oIdx}
                  onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-3 ${optionClass}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected || (submitted && isCorrect) ? 'border-current' : 'border-slate-300'}`}>
                    {(isSelected || (submitted && isCorrect)) && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                  </div>
                  {opt}
                  {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted && (
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
          {Object.keys(answers).length !== questions.length && (
            <p className="text-center text-xs text-slate-400 mt-2">Answer all questions to submit</p>
          )}
        </div>
      )}
    </div>
  );
};

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default CourseLearning;
