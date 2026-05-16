import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

// Simple PrivateRoute wrapper
function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/auth" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (user.role !== role) {
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/teacher/*" 
          element={
            <PrivateRoute role="teacher">
              <TeacherDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/student/*" 
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
