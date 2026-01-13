import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TimerProvider } from './contexts/TimerContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/Header';
import Timer from './components/Timer';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TimerProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                  },
                }}
              />
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={
                    <PrivateRoute>
                      <div className="space-y-8">
                        <Timer />
                        <Tasks />
                      </div>
                    </PrivateRoute>
                  } />
                  <Route path="/settings" element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  } />
                  <Route path="/reports" element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </TimerProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App; 