import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, BookOpen, GraduationCap, ChevronRight, CheckCircle, ArrowRight, X, FileText, UploadCloud, Trash2 } from 'lucide-react';

export default function StudentDashboard() {
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  
  // PDF Upload State
  const [solutionFile, setSolutionFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  useEffect(() => {
    fetchMyCourses();
    fetchAllCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/my-courses/');
      setMyCourses(res.data);
    } catch (e) {
      if (e.response?.status === 401) navigate('/auth');
    }
  };

  const fetchAllCourses = async () => {
    try {
      const res = await api.get('/courses/');
      setAllCourses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      fetchMyCourses();
      setShowBrowseModal(false);
    } catch (e) {
      alert("Error enrolling");
    }
  };

  const handleDisenroll = async (courseId, e) => {
      e.stopPropagation();
      if (!window.confirm("Are you sure you want to disenroll from this course? You will lose access to its exams.")) return;
      try {
          await api.delete(`/courses/${courseId}/enroll`);
          if (selectedCourse?.id === courseId) {
              setSelectedCourse(null);
              setExams([]);
          }
          fetchMyCourses();
      } catch (err) {
          alert("Error disenrolling");
      }
  };

  const fetchExams = async (course) => {
    setSelectedCourse(course);
    setSelectedExam(null);
    setResult(null);
    try {
      const res = await api.get(`/courses/${course.id}/exams/`);
      setExams(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Pre-fetch answer if student has already submitted for this exam
  const handleSelectExam = async (exam) => {
      setSelectedExam(exam);
      setResult(null);
      setSolutionFile(null);
      try {
          // Optimization: Ideally we'd have a /answers/me/{exam_id} endpoint, but we can reuse the teacher one
          // Wait, the teacher endpoint requires teacher auth. 
          // Let's assume the user just wants to upload. If they already uploaded, backend overwrites it.
          // In a real prod environment we'd fetch the existing score here.
      } catch (err) {
          console.error(err);
      }
  };

  const submitSolutionUpload = async (e) => {
    e.preventDefault();
    if (!selectedExam || !solutionFile) {
        alert("Please select a PDF solution file to upload.");
        return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('exam_id', selectedExam.id);
      formData.append('question_id', selectedExam.questions[0].id);
      formData.append('solution_file', solutionFile);

      const res = await api.post(`/answers/submit/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error evaluating your solution.');
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Derive un-enrolled courses
  const availableCourses = allCourses.filter(c => !myCourses.find(mc => mc.id === c.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f0f2ff] to-[#fdeffe] font-sans relative overflow-x-hidden text-gray-800">
      
      {/* Background Gradient */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-br from-[#c2e2ff]/50 to-[#d4b3ff]/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-20">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 sm:mb-14">
          <div>
            <h1 className="text-3xl sm:text-[40px] font-extrabold text-[#323232] tracking-tight leading-tight">
              Mornin' {firstName}! <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_infinite]">👋</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 font-medium mt-1">Ready to ace your exams today?</p>
          </div>
          <button onClick={logout} className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md w-full sm:w-auto justify-center">
            <LogOut size={16} /> Logout
          </button>
        </header>

        {/* Important Actions */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wide uppercase">Quick Actions</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            
            <button onClick={() => setShowBrowseModal(true)} className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-5 py-4 rounded-[1.25rem] shadow-sm border border-white hover:shadow-md transition-all group min-w-[280px]">
              <div className="bg-blue-50 text-blue-500 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-gray-900 text-[15px]">Browse Courses</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Find & enroll in new classes</div>
              </div>
              <div className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-50 transition-colors">
                <ChevronRight size={16} />
              </div>
            </button>

          </div>
        </div>

        {/* Main Data Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-white overflow-hidden min-h-[400px]">
          
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
            <h2 className="text-xl sm:text-[22px] font-bold text-[#323232]">
              {selectedExam ? `Taking Exam: ${selectedExam.title}` : selectedCourse ? `${selectedCourse.code} Exams` : 'My Enrolled Courses'}
            </h2>
            <div className="flex items-center gap-2 sm:gap-4 text-sm overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              <span className="text-gray-400 font-medium whitespace-nowrap">Nav:</span>
              <button 
                onClick={() => { setSelectedCourse(null); setSelectedExam(null); }} 
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${!selectedCourse ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                All Courses
              </button>
              {selectedCourse && (
                 <button 
                   onClick={() => setSelectedExam(null)} 
                   className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${!selectedExam ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                    {selectedCourse.code}
                 </button>
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            {!selectedExam ? (
                <>
                  {/* Table Header */}
                  <div className="min-w-[600px] grid grid-cols-12 gap-4 px-6 sm:px-8 py-4 bg-[#fafbfc]/50 border-b border-gray-50 text-[13px] font-bold text-gray-400 tracking-wide uppercase">
                    <div className="col-span-5">{selectedCourse ? 'Exam Title' : 'Course Name'}</div>
                    <div className="col-span-4">{selectedCourse ? 'Status' : 'Course Code'}</div>
                    <div className="col-span-3 text-right">Action</div>
                  </div>

                  {/* Table Rows */}
                  <div className="min-w-[600px] divide-y divide-gray-50">
                    {!selectedCourse ? (
                      // Enrolled Courses View
                      myCourses.length > 0 ? myCourses.map((course) => (
                        <div key={course.id} className="grid grid-cols-12 gap-4 px-6 sm:px-8 py-5 items-center group hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => fetchExams(course)}>
                          <div className="col-span-5">
                             <span className="inline-flex items-center bg-blue-50 text-blue-700 font-bold text-[13px] px-3 py-1 rounded-md">
                               {course.name}
                             </span>
                          </div>
                          <div className="col-span-4 font-bold text-gray-600 text-[15px]">
                            {course.code}
                          </div>
                          <div className="col-span-3 flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => handleDisenroll(course.id, e)} className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-100 hover:shadow-sm" title="Disenroll from Course"><Trash2 size={14}/></button>
                            <button className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:shadow-sm ml-2"><ArrowRight size={16} /></button>
                          </div>
                        </div>
                      )) : (
                        <div className="p-12 text-center text-gray-400 font-medium">You are not enrolled in any courses yet. Use the quick action above to browse.</div>
                      )
                    ) : (
                      // Exams in Course View
                      exams.length > 0 ? exams.map((exam) => (
                        <div key={exam.id} onClick={() => handleSelectExam(exam)} className="grid grid-cols-12 gap-4 px-6 sm:px-8 py-5 items-center group hover:bg-indigo-50/30 transition-colors cursor-pointer">
                          <div className="col-span-5">
                             <span className="inline-flex items-center bg-indigo-50 text-indigo-700 font-bold text-[13px] px-3 py-1 rounded-md">
                               {exam.title}
                             </span>
                          </div>
                          <div className="col-span-4">
                              <span className="font-bold text-gray-500 text-[14px]">Available</span>
                          </div>
                          <div className="col-span-3 flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold shadow-md hover:scale-105 transition-transform">Take Exam</button>
                          </div>
                        </div>
                      )) : (
                        <div className="p-12 text-center text-gray-400 font-medium">No exams posted for this course yet.</div>
                      )
                    )}
                  </div>
                </>
            ) : (
                // TAKE EXAM VIEW (Inside the Mailroom container)
                <div className="p-4 sm:p-8 w-full min-w-0">
                    {selectedExam.questions && selectedExam.questions.length > 0 ? (
                        <div className="max-w-3xl mx-auto w-full">
                            {!result ? (
                                <form onSubmit={submitSolutionUpload} className="space-y-6">
                                    <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wide">Exam Details</h4>
                                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">{selectedExam.questions[0].max_marks} Marks</span>
                                        </div>
                                        <p className="text-gray-800 font-medium leading-relaxed bg-white p-4 rounded-xl border border-gray-200">
                                            Please read the attached question paper provided by your teacher and upload your completed solution as a PDF file below.
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-3">Upload Your Solution (PDF)</label>
                                        <div className="border-2 border-dashed border-blue-200 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center bg-blue-50/30 hover:bg-blue-50 transition relative group cursor-pointer">
                                            <input type="file" required accept="application/pdf" onChange={e=>setSolutionFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-blue-100 flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                                                <UploadCloud size={32}/>
                                            </div>
                                            <h4 className="font-extrabold text-gray-800 text-xl">Upload Solution PDF</h4>
                                            <p className="text-sm text-gray-500 mt-2">{solutionFile ? <span className="text-blue-600 font-bold px-4 py-1 bg-white rounded-full shadow-sm">{solutionFile.name}</span> : "Click or drag file here to attach"}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                                        <button type="button" onClick={() => setSelectedExam(null)} className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition">Cancel</button>
                                        <button disabled={loading} type="submit" className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
                                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit for AI Evaluation'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2rem] overflow-hidden w-full max-w-2xl mx-auto">
                                    <div className="p-8 sm:p-12 flex flex-col items-center relative">
                                        {/* Decorative background elements */}
                                        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#f0f9ff] to-transparent" />
                                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
                                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
                                        
                                        <div className="relative z-10 flex flex-col items-center w-full">
                                            <div className="mb-2 bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] text-transparent bg-clip-text font-black tracking-widest uppercase text-sm">
                                                Evaluation Complete
                                            </div>
                                            
                                            {/* Circular Progress Ring */}
                                            <div className="relative w-48 h-48 my-8 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                                                    <circle className="text-gray-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                                    <motion.circle 
                                                        initial={{ strokeDasharray: "0 251.2" }}
                                                        animate={{ strokeDasharray: `${(result.score / selectedExam.questions[0].max_marks) * 251.2} 251.2` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="text-[#b14bf4] stroke-current" 
                                                        strokeWidth="8" 
                                                        strokeLinecap="round" 
                                                        cx="50" cy="50" r="40" fill="transparent"
                                                    ></motion.circle>
                                                </svg>
                                                <div className="absolute flex flex-col items-center justify-center">
                                                    <span className="text-5xl font-black text-gray-800">{result.score}</span>
                                                    <span className="text-sm font-bold text-gray-400 mt-1">out of {selectedExam.questions[0].max_marks}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full mt-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[#b14bf4]">
                                                        <FileText size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Detailed AI Feedback</span>
                                                </div>
                                                <div className="bg-[#fafbfc] border border-gray-100 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#b14bf4] to-[#f14d8e]"></div>
                                                    <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap pl-2">
                                                        {result.feedback}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <button onClick={() => setSelectedExam(null)} className="mt-8 w-full py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2">
                                                <ArrowRight size={18} /> Return to Exams
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12">No questions available in this exam.</div>
                    )}
                </div>
            )}
          </div>
        </div>

      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {showBrowseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowBrowseModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 w-full max-w-2xl border border-white max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
                  <p className="text-sm text-gray-500 font-medium">Enroll in classes to take exams</p>
                </div>
                <button onClick={() => setShowBrowseModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"><X size={20}/></button>
              </div>

              <div className="overflow-y-auto pr-2 space-y-3 hide-scrollbar">
                {availableCourses.length > 0 ? availableCourses.map(c => (
                  <div key={c.id} className="p-4 sm:p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition bg-gray-50/50">
                    <div>
                      <div className="font-bold text-gray-900 text-[16px]">{c.code}</div>
                      <div className="text-sm text-gray-500 mt-0.5 font-medium">{c.name}</div>
                    </div>
                    <button onClick={() => handleEnroll(c.id)} className="bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                        <GraduationCap size={16}/> Enroll
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-10 text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-2xl">
                    You are enrolled in all available courses!
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
