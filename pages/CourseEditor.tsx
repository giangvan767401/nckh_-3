
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Layout,
  Video,
  HelpCircle,
  GripVertical,
  ChevronDown,
  Image as ImageIcon,
  CheckCircle,
  Eye
} from 'lucide-react';

import api from '../api';
import { toast } from 'react-toastify';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [courseData, setCourseData] = useState({
    title: isEditing ? 'Advanced React Architecture' : '',
    category: 'Web Development',
    level: 'Intermediate',
    price: 19.99,
    description: 'Master the advanced patterns of React.',
    thumbnail: null as File | null
  });

  const [curriculum, setCurriculum] = useState([
    {
      id: 'm1',
      title: 'Introduction to Patterns',
      lessons: [
        { id: 'l1', title: 'Welcome to the Course', type: 'VIDEO', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', questions: [] },
        {
          id: 'l2', title: 'Initial Assessment', type: 'QUIZ', videoUrl: '', questions: [
            { id: 'q1', text: 'What is React?', options: ['Library', 'Framework', 'Language', 'Database'], correctAnswer: 0 }
          ]
        }
      ]
    }
  ]);

  const addModule = () => {
    setCurriculum([...curriculum, {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Module',
      lessons: []
    }]);
  };

  const addLesson = (moduleId: string) => {
    setCurriculum(curriculum.map(m => m.id === moduleId ? {
      ...m,
      lessons: [...m.lessons, {
        id: Math.random().toString(36).substr(2, 9),
        title: 'New Lesson',
        type: 'VIDEO',
        videoUrl: '',
        questions: []
      }]
    } : m));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setCurriculum(curriculum.map(m => m.id === moduleId ? {
      ...m,
      lessons: m.lessons.filter(l => l.id !== lessonId)
    } : m));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
    setCurriculum(curriculum.map(m => m.id === moduleId ? {
      ...m,
      lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
    } : m));
  };

  React.useEffect(() => {
    if (isEditing) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourseData({
        title: data.title,
        category: data.category,
        level: data.level,
        price: data.price,
        description: data.description,
        thumbnail: null
      });

      // Transform backend lessons back to curriculum structure
      // For simplicity, we'll put everything in one module if no module structure exists in backend
      // In a real app, we'd need a Module entity
      const lessons = data.lessons.map((l: any) => ({
        id: l.id,
        title: l.title.includes(': ') ? l.title.split(': ')[1] : l.title,
        type: l.type,
        videoUrl: l.videoUrl,
        questions: l.type === 'QUIZ' ? JSON.parse(l.content) : []
      }));

      setCurriculum([{
        id: 'm1',
        title: data.lessons[0] ? (data.lessons[0].title.split(': ')[0] || 'Module 1') : 'Module 1',
        lessons: lessons
      }]);

    } catch (err) {
      toast.error("Failed to load course");
      navigate('/admin');
    }
  };

  const handleSave = async () => {
    try {
      // Flatten curriculum to lessons
      let lessonOrder = 1;
      const flatLessons = [];

      for (const module of curriculum) {
        for (const lesson of module.lessons) {
          flatLessons.push({
            id: lesson.id.length > 20 ? lesson.id : undefined, // Only send valid UUIDs
            title: `${module.title}: ${lesson.title}`, // Prefix module title
            type: lesson.type,
            videoUrl: lesson.type === 'VIDEO' ? (lesson.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') : null,
            content: lesson.type === 'QUIZ' ? JSON.stringify(lesson.questions) : 'Lesson content placeholder',
            duration: '10:00',
            order: lessonOrder++
          });
        }
      }

      const payload = {
        title: courseData.title || "Untitled Course",
        description: courseData.description,
        price: Number(courseData.price),
        thumbnail: `https://picsum.photos/seed/${Math.random()}/600/400`, // Mock valid URL
        category: courseData.category,
        level: courseData.level, // Send exact casing matching backend enum
        lessons: flatLessons
      };

      if (isEditing) {
        await api.put(`/courses/${id}`, payload);
        toast.success("Course updated successfully!");
        navigate('/admin');
      } else {
        await api.post('/courses', payload);
        toast.success("Course published successfully!");
        navigate('/admin');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save course");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-slate-500" />
          </button>
          <div>
            <h1 className="text-3xl font-black">{isEditing ? 'Edit Course' : 'Create New Course'}</h1>
            <p className="text-slate-500 text-sm">Configure your course details and curriculum structure</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={handleSave}
            className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Course
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Course Info Form */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-600" /> Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="e.g. Master Next.js 15"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option>Web Dev</option>
                    <option>Design</option>
                    <option>Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Upload 16:9 cover image</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Curriculum Builder */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" /> Curriculum Builder
              </h3>
              <button
                onClick={addModule}
                className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add Module
              </button>
            </div>

            <div className="space-y-6">
              {curriculum.map((module, mIdx) => (
                <div key={module.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => {
                          const newCur = [...curriculum];
                          newCur[mIdx].title = e.target.value;
                          setCurriculum(newCur);
                        }}
                        className="bg-transparent font-bold text-slate-800 border-none outline-none focus:ring-1 focus:ring-blue-200 rounded px-2"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => addLesson(module.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {lesson.type === 'VIDEO' ? <Video className="w-4 h-4 text-slate-400" /> : <HelpCircle className="w-4 h-4 text-indigo-400" />}
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                              className="font-bold text-slate-700 outline-none flex-1"
                              placeholder="Lesson Title"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <select
                              value={lesson.type}
                              onChange={(e) => updateLesson(module.id, lesson.id, 'type', e.target.value)}
                              className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 rounded-lg outline-none"
                            >
                              <option value="VIDEO">Video</option>
                              <option value="QUIZ">Quiz</option>
                            </select>
                            <button
                              onClick={() => removeLesson(module.id, lesson.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Lesson Details based on Type */}
                        <div className="pl-8 border-l-2 border-slate-100 space-y-3">
                          {lesson.type === 'VIDEO' && (
                            <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">YouTube URL</label>
                              <input
                                type="text"
                                value={lesson.videoUrl || ''}
                                onChange={(e) => updateLesson(module.id, lesson.id, 'videoUrl', e.target.value)}
                                placeholder="https://youtube.com/..."
                                className="w-full text-sm p-2 bg-slate-50 rounded border border-slate-200 outline-none"
                              />
                            </div>
                          )}

                          {lesson.type === 'QUIZ' && (
                            <div className="space-y-3">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Questions</label>
                              {lesson.questions?.map((q: any, qIdx: number) => (
                                <div key={q.id || qIdx} className="bg-slate-50 p-3 rounded-lg space-y-2">
                                  <input
                                    type="text"
                                    value={q.text}
                                    onChange={(e) => {
                                      const newQuestions = [...lesson.questions];
                                      newQuestions[qIdx].text = e.target.value;
                                      updateLesson(module.id, lesson.id, 'questions', newQuestions);
                                    }}
                                    placeholder="Question Text"
                                    className="w-full text-sm font-bold bg-transparent outline-none border-b border-slate-200 pb-1"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    {q.options?.map((opt: string, oIdx: number) => (
                                      <div key={oIdx} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correct-${lesson.id}-${qIdx}`}
                                          checked={q.correctAnswer === oIdx}
                                          onChange={() => {
                                            const newQuestions = [...lesson.questions];
                                            newQuestions[qIdx].correctAnswer = oIdx;
                                            updateLesson(module.id, lesson.id, 'questions', newQuestions);
                                          }}
                                        />
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => {
                                            const newQuestions = [...lesson.questions];
                                            newQuestions[qIdx].options[oIdx] = e.target.value;
                                            updateLesson(module.id, lesson.id, 'questions', newQuestions);
                                          }}
                                          className={`text-xs w-full bg-white p-1 rounded border ${q.correctAnswer === oIdx ? 'border-green-500 text-green-700' : 'border-slate-200'}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newQuestions = [...(lesson.questions || []), {
                                    id: Math.random(),
                                    text: 'New Question',
                                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                    correctAnswer: 0
                                  }];
                                  updateLesson(module.id, lesson.id, 'questions', newQuestions);
                                }}
                                className="text-xs font-bold text-blue-600 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Add Question
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {module.lessons.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400 italic">No lessons yet. Add some to get started.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-xl font-bold mb-1 flex items-center gap-2 justify-center md:justify-start">
                  <CheckCircle className="w-6 h-6" /> Ready to Launch?
                </h4>
                <p className="opacity-80 text-sm">Once published, your course will be available to 15k+ students.</p>
              </div>
              <button
                onClick={handleSave}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-black hover:bg-slate-50 transition-all shadow-xl"
              >
                PUBLISH COURSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
