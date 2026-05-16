import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'teacher' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      if (isLogin) {
        const res = await api.post('/login', { email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(res.data.user.role === 'teacher' ? '/teacher' : '/student');
      } else {
        await api.post('/signup', formData);
        setSuccessMsg("Account created successfully! You can now sign in.");
        setTimeout(() => {
            setIsLogin(true);
            setSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f0f2ff] to-[#fdeffe] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl transition-all border border-gray-100 shadow-sm hover:shadow-md">
          <ArrowLeft size={18} /> <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white w-full max-w-md relative z-10"
      >
        <h2 className="text-3xl font-extrabold text-[#323232] text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4 text-center border border-red-100">{error}</motion.div>}
        {successMsg && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 text-green-600 text-sm p-3 rounded-xl mb-4 text-center border border-green-100">{successMsg}</motion.div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input required value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#b14bf4] outline-none transition" />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#b14bf4] outline-none transition" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={formData.password} 
                onChange={e=>setFormData({...formData, password: e.target.value})} 
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#b14bf4] outline-none transition pr-10" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
              <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#b14bf4] outline-none transition">
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full mt-4 bg-gradient-to-r from-[#b14bf4] to-[#f14d8e] text-white p-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#b14bf4] font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </motion.div>
      
      {/* Soft background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-purple-200/50 to-pink-200/50 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
