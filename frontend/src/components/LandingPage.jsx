import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Search, Plus, Calendar, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f0f2ff] to-[#fdeffe] font-sans overflow-hidden flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 py-6 max-w-7xl mx-auto z-10">
        <div className="font-bold text-xl tracking-tight text-gray-900">SmartGradeAI.</div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-gray-900 transition">Home</a>
          <a href="#" className="hover:text-gray-900 transition">Features</a>
          <a href="#" className="hover:text-gray-900 transition">About</a>
        </div>
        <Link 
          to="/auth" 
          className="bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Sign In
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-10 w-full flex flex-col lg:flex-row items-center justify-between z-10 relative">
        
        {/* Left Column - Text content */}
        <div className="lg:w-1/2 space-y-6 mt-10 lg:mt-0 z-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[4rem] leading-[1.1] font-extrabold text-[#323232] tracking-tight"
          >
            Autonomous <br/> AI Grading
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b14bf4] to-[#f14d8e]"
          >
            Fair, Fast & Consistent
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-md text-lg"
          >
            Our intelligent system evaluates descriptive answers using advanced RAG and LLMs, saving teachers time and ensuring accurate results for students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              to="/auth" 
              className="inline-block mt-4 bg-white text-[#323232] px-8 py-3 rounded-full font-bold shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all border border-gray-100"
            >
              Join Us Now
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Floating UI Cards */}
        <div className="lg:w-1/2 relative h-[600px] w-full mt-16 lg:mt-0 perspective-1000">
          
          {/* Card 1: Course Selector */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-20 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-64 border border-white z-20 transform -rotate-6"
          >
            <h3 className="text-sm font-bold text-gray-800 mb-4">Choose Your Course</h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] text-white text-xs py-2 px-4 rounded-full font-medium shadow-md">
                Computer Science 301
              </div>
              <div className="text-xs text-gray-500 py-1 px-4 hover:bg-gray-50 rounded-full transition cursor-pointer">Data Structures</div>
              <div className="text-xs text-gray-500 py-1 px-4 hover:bg-gray-50 rounded-full transition cursor-pointer">Software Project Mgmt</div>
              <div className="text-xs text-gray-500 py-1 px-4 hover:bg-gray-50 rounded-full transition cursor-pointer">Artificial Intelligence</div>
            </div>
          </motion.div>

          {/* Card 2: Action Items */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-40 left-10 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-56 border border-white z-30"
          >
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
               <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                 <Plus size={16} />
               </div>
               <span className="text-sm font-bold text-gray-800">Create New Exam</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                 <Plus size={16} />
               </div>
               <span className="text-sm font-bold text-gray-800">Grade Submissions</span>
            </div>
          </motion.div>

          {/* Card 3: Mini Player / Evaluator icon */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-32 right-0 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white z-10 transform rotate-3 flex flex-col items-center justify-center w-48 h-56"
          >
             <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                <Play className="text-[#f14d8e] ml-2 w-8 h-8 fill-current" />
             </div>
             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-gradient-to-r from-[#b14bf4] to-[#f14d8e]"></div>
             </div>
          </motion.div>

          {/* Card 4: Schedule / Grades */}
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-10 left-32 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white z-40 w-64 transform -rotate-2"
          >
             <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Results</h3>
             <div className="flex gap-4 items-center mb-3">
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-900">A+</div>
                  <div className="text-[10px] text-gray-400">Score</div>
                </div>
                <div className="flex-1 bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] text-white text-[10px] py-1.5 px-3 rounded-full font-medium">
                   Assignment 1 Graded
                </div>
             </div>
             <div className="flex gap-4 items-center">
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-900">B</div>
                  <div className="text-[10px] text-gray-400">Score</div>
                </div>
                <div className="flex-1 bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] opacity-80 text-white text-[10px] py-1.5 px-3 rounded-full font-medium">
                   Midterm Processed
                </div>
             </div>
          </motion.div>

        </div>
      </main>

      {/* Background soft blobs mimicking the UI kit */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-purple-200/40 to-pink-200/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-gradient-to-br from-blue-200/40 to-indigo-200/40 blur-[80px] rounded-full pointer-events-none" />
    </div>
  );
}
