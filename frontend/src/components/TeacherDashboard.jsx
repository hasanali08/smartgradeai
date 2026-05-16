import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, Plus, ChevronRight, UploadCloud, FileText, CheckCircle, Trash2, Settings, ArrowRight, Edit, Users, X } from 'lucide-react';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [exams, setExams] = useState([]);
  
  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);

  // Forms & State
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', description: '' });
  
  const [examForm, setExamForm] = useState({ title: '', marks: 10 });
  const [examFile, setExamFile] = useState(null);
  const [rubricFile, setRubricFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [examScores, setExamScores] = useState([]);
  const [selectedExamForScores, setSelectedExamForScores] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const firstName = user?.full_name?.split(' ')[0] || 'Teacher';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/');
      setCourses(res.data);
    } catch (e) {
      if (e.response?.status === 401) navigate('/auth');
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, courseForm);
      } else {
        await api.post('/courses/', courseForm);
      }
      setCourseForm({ name: '', code: '', description: '' });
      setEditingCourse(null);
      setShowCourseModal(false);
      fetchCourses();
    } catch (e) {
      alert("Error saving course");
    }
  };

  const handleDeleteCourse = async (courseId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this course? All exams and student submissions will be permanently deleted.")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      if (selectedCourse?.id === courseId) {
          setSelectedCourse(null);
          setExams([]);
      }
      fetchCourses();
    } catch (err) {
      alert("Error deleting course");
    }
  };

  const openEditCourse = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course);
    setCourseForm({ name: course.name, code: course.code, description: course.description || '' });
    setShowCourseModal(true);
  };

  const openNewCourse = () => {
    setEditingCourse(null);
    setCourseForm({ name: '', code: '', description: '' });
    setShowCourseModal(true);
  };

  const fetchExams = async (courseId) => {
    try {
      const res = await api.get(`/courses/${courseId}/exams/`);
      setExams(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    fetchExams(course.id);
  };

  const handleUploadExam = async (e) => {
    e.preventDefault();
    if (!examFile || !rubricFile) {
        alert("Please upload both Exam and Rubric PDF files.");
        return;
    }
    setLoading(true);
    setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('title', examForm.title);
      formData.append('max_marks', examForm.marks);
      formData.append('exam_file', examFile);
      formData.append('rubric_file', rubricFile);

      await api.post(`/courses/${selectedCourse.id}/exams/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      fetchExams(selectedCourse.id);
      setExamForm({ title: '', marks: 10 });
      setExamFile(null);
      setRubricFile(null);
      setSuccessMsg('Exam uploaded and AI solution generated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setShowExamModal(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error uploading exam documents.');
    }
    setLoading(false);
  };

  const openScoresModal = async (exam) => {
      setSelectedExamForScores(exam);
      try {
          const res = await api.get(`/exams/${exam.id}/answers`);
          setExamScores(res.data);
          setShowScoresModal(true);
      } catch (err) {
          alert("Error fetching scores");
      }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f0f2ff] to-[#fdeffe] font-sans relative overflow-x-hidden text-gray-800">
      
      {/* Top right gradient blob reverting to the landing page style */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-br from-purple-200/60 to-pink-200/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-20">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 sm:mb-14">
          <div>
            <h1 className="text-3xl sm:text-[40px] font-extrabold text-[#323232] tracking-tight leading-tight">
              Mornin' {firstName}! <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_infinite]">👋</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 font-medium mt-1">Manage your courses and evaluate exams.</p>
          </div>
          <button onClick={logout} className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md w-full sm:w-auto justify-center">
            <LogOut size={16} /> Logout
          </button>
        </header>

        {/* Important Actions */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wide uppercase">Quick Actions</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            
            {/* Action 1: Create Course */}
            <button onClick={openNewCourse} className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-5 py-4 rounded-[1.25rem] shadow-sm border border-white hover:shadow-md transition-all group min-w-[280px]">
              <div className="bg-purple-50 text-[#b14bf4] w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plus size={20} strokeWidth={3} />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-gray-900 text-[15px]">Create Course</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Add a new class</div>
              </div>
              <div className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-50 transition-colors">
                <ChevronRight size={16} />
              </div>
            </button>

            {/* Action 2: Upload Exam */}
            <button 
              onClick={() => {
                if(!selectedCourse) alert("Please select a course from the list below first!");
                else setShowExamModal(true);
              }} 
              className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-5 py-4 rounded-[1.25rem] shadow-sm border border-white hover:shadow-md transition-all group min-w-[280px]"
            >
              <div className="bg-pink-50 text-[#f14d8e] w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UploadCloud size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-gray-900 text-[15px]">Upload Exam</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{selectedCourse ? `For ${selectedCourse.code}` : 'Select course first'}</div>
              </div>
              <div className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-50 transition-colors">
                <ChevronRight size={16} />
              </div>
            </button>

          </div>
        </div>

        {/* Main Data Container ("Mailroom" equivalent) */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-white overflow-hidden">
          
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
            <h2 className="text-xl sm:text-[22px] font-bold text-[#323232]">
              {selectedCourse ? `${selectedCourse.code} Exams` : 'Course List'}
            </h2>
            <div className="flex items-center gap-2 sm:gap-4 text-sm overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              <span className="text-gray-400 font-medium whitespace-nowrap">View:</span>
              <button 
                onClick={() => setSelectedCourse(null)} 
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${!selectedCourse ? 'bg-purple-50 text-[#b14bf4]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                All Courses
              </button>
              {selectedCourse && (
                 <button className="px-3 py-1.5 rounded-lg font-bold bg-purple-50 text-[#b14bf4] whitespace-nowrap transition-colors">
                    {selectedCourse.code}
                 </button>
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            {/* Table Header */}
            <div className="min-w-[600px] grid grid-cols-12 gap-4 px-6 sm:px-8 py-4 bg-[#fafbfc]/50 border-b border-gray-50 text-[13px] font-bold text-gray-400 tracking-wide uppercase">
              <div className="col-span-5">{selectedCourse ? 'Exam Title' : 'Course Name'}</div>
              <div className="col-span-4">{selectedCourse ? 'Status' : 'Course Code'}</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="min-w-[600px] divide-y divide-gray-50">
              {!selectedCourse ? (
                // Courses List View
                courses.length > 0 ? courses.map((course) => (
                  <div key={course.id} className="grid grid-cols-12 gap-4 px-6 sm:px-8 py-5 items-center group hover:bg-purple-50/30 transition-colors cursor-pointer" onClick={() => handleSelectCourse(course)}>
                    <div className="col-span-5">
                       <span className="inline-flex items-center bg-purple-50 text-[#b14bf4] font-bold text-[13px] px-3 py-1 rounded-md">
                         {course.name}
                       </span>
                    </div>
                    <div className="col-span-4 font-bold text-gray-600 text-[15px]">
                      {course.code}
                    </div>
                    <div className="col-span-3 flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => openEditCourse(course, e)} className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-sm" title="Edit Course"><Edit size={14} /></button>
                      <button onClick={(e) => handleDeleteCourse(course.id, e)} className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-100 hover:shadow-sm" title="Delete Course"><Trash2 size={14} /></button>
                      <button className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:shadow-sm ml-2"><ArrowRight size={16} /></button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-gray-400 font-medium">No courses found. Use the quick action to create one.</div>
                )
              ) : (
                // Exams List View
                exams.length > 0 ? exams.map((exam) => (
                  <div key={exam.id} className="grid grid-cols-12 gap-4 px-6 sm:px-8 py-5 items-center group hover:bg-pink-50/30 transition-colors">
                    <div className="col-span-5">
                       <span className="inline-flex items-center bg-pink-50 text-[#f14d8e] font-bold text-[13px] px-3 py-1 rounded-md">
                         {exam.title}
                       </span>
                    </div>
                    <div className="col-span-4">
                      {exam.questions[0]?.model_solution ? (
                        <span className="font-bold text-gray-600 text-[14px] flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-green-500"/> AI Processed
                        </span>
                      ) : (
                        <span className="font-bold text-orange-500 text-[14px]">Pending Processing...</span>
                      )}
                    </div>
                    <div className="col-span-3 flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openScoresModal(exam)} className="px-3 h-8 rounded bg-white border border-gray-100 flex items-center justify-center text-[#b14bf4] hover:bg-purple-50 hover:shadow-sm gap-1.5 text-xs font-bold transition-colors">
                          <Users size={14}/> Scores
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-gray-400 font-medium">No exams uploaded yet. Use the quick action to upload one.</div>
                )
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {/* Create/Edit Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowCourseModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 w-full max-w-md border border-white">
              <h2 className="text-2xl font-bold text-[#323232] mb-6">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1.5">Course Name</label>
                    <input required value={courseForm.name} onChange={e=>setCourseForm({...courseForm, name: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#b14bf4] focus:ring-1 focus:ring-[#b14bf4] outline-none transition font-medium" placeholder="Software Project Management" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1.5">Course Code</label>
                    <input required value={courseForm.code} onChange={e=>setCourseForm({...courseForm, code: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#b14bf4] focus:ring-1 focus:ring-[#b14bf4] outline-none transition font-medium" placeholder="CS101" />
                </div>
                <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] shadow-md hover:shadow-lg transition">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Upload Exam Modal */}
        {showExamModal && selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => !loading && setShowExamModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 w-full max-w-xl border border-white max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#323232] mb-1">Upload Exam</h2>
              <p className="text-sm text-gray-500 mb-6 font-medium">Adding to <span className="text-[#b14bf4] font-bold">{selectedCourse.code}</span></p>

              {successMsg && (
                  <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-xl border border-green-100 flex items-center gap-2 font-bold text-sm">
                      <CheckCircle size={16}/> {successMsg}
                  </div>
              )}

              <form onSubmit={handleUploadExam} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1.5">Exam Title</label>
                        <input required value={examForm.title} onChange={e=>setExamForm({...examForm, title: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#b14bf4] outline-none transition font-medium" placeholder="Midterm Exam" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1.5">Total Marks</label>
                        <input required type="number" value={examForm.marks} onChange={e=>setExamForm({...examForm, marks: Number(e.target.value)})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#b14bf4] outline-none transition font-medium" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border-2 border-dashed border-purple-200 rounded-2xl p-6 text-center bg-purple-50/30 hover:bg-purple-50 transition relative group">
                      <input type="file" required accept="application/pdf" onChange={e=>setExamFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <FileText className={`mx-auto mb-2 ${examFile ? 'text-[#b14bf4]' : 'text-purple-300'}`} size={28} />
                      <div className="text-sm font-bold text-gray-800">Exam Question Paper</div>
                      <div className="text-xs text-gray-500 mt-1 truncate px-2">{examFile ? <span className="text-[#b14bf4] font-bold">{examFile.name}</span> : "Select PDF file"}</div>
                  </div>
                  <div className="border-2 border-dashed border-pink-200 rounded-2xl p-6 text-center bg-pink-50/30 hover:bg-pink-50 transition relative group">
                      <input type="file" required accept="application/pdf" onChange={e=>setRubricFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <FileText className={`mx-auto mb-2 ${rubricFile ? 'text-[#f14d8e]' : 'text-pink-300'}`} size={28} />
                      <div className="text-sm font-bold text-gray-800">Grading Rubric</div>
                      <div className="text-xs text-gray-500 mt-1 truncate px-2">{rubricFile ? <span className="text-[#f14d8e] font-bold">{rubricFile.name}</span> : "Select PDF file"}</div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button type="button" onClick={() => setShowExamModal(false)} className="w-full sm:flex-1 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition" disabled={loading}>Cancel</button>
                    <button type="submit" disabled={loading} className="w-full sm:flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] shadow-md hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Upload & Process Documents'}
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Student Scores Modal */}
        {showScoresModal && selectedExamForScores && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowScoresModal(false)} />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative z-10 w-full max-w-3xl border border-white max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#323232]">{selectedExamForScores.title} Scores</h2>
                    <p className="text-sm text-gray-500 font-medium">Submissions from enrolled students</p>
                  </div>
                  <button onClick={() => setShowScoresModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><X size={20}/></button>
                </div>

                <div className="overflow-y-auto pr-2 pb-4 hide-scrollbar">
                  {examScores.length > 0 ? (
                      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                      <th className="p-4 w-1/4">Student</th>
                                      <th className="p-4 w-1/6 text-center">Score</th>
                                      <th className="p-4 w-auto">AI Feedback</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                  {examScores.map(score => (
                                      <tr key={score.id} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="p-4 align-top">
                                              <div className="font-bold text-gray-800 text-[15px]">{score.student?.full_name || "Unknown Student"}</div>
                                          </td>
                                          <td className="p-4 align-top text-center">
                                              <div className="inline-flex items-center justify-center bg-green-50 text-green-700 font-black text-sm px-3 py-1 rounded-lg border border-green-200 shadow-sm whitespace-nowrap">
                                                  {score.score} / {selectedExamForScores.questions[0]?.max_marks}
                                              </div>
                                          </td>
                                          <td className="p-4 align-top">
                                              <div className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-100 p-3 rounded-xl shadow-sm whitespace-pre-wrap">
                                                  {score.feedback}
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="text-center py-16 text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-2xl">
                          No students have submitted solutions for this exam yet.
                      </div>
                  )}
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
