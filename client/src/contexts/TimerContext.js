import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [timerType, setTimerType] = useState('pomodoro');
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionCount, setSessionCount] = useState(1);
  const intervalRef = useRef(null);

  // Timer types and their default durations
  const timerTypes = {
    pomodoro: { name: 'Pomodoro', duration: 25 * 60 },
    shortBreak: { name: 'Short Break', duration: 5 * 60 },
    longBreak: { name: 'Long Break', duration: 15 * 60 }
  };

  // Start timer
  const startTimer = async () => {
    if (isRunning) return;

    try {
      let response;
      if (currentSession) {
        // Resume existing session
        response = await axios.post('/api/timer/resume');
      } else {
        // Start new session
        response = await axios.post('/api/timer/start', {
          type: timerType,
          duration: Math.floor(timeLeft / 60), // Convert to minutes
          project: 'No Project' // You can make this dynamic
        });
      }

      setCurrentSession(response.data);
      setIsRunning(true);
      toast.success(`${timerTypes[timerType].name} started!`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start timer';
      toast.error(message);
    }
  };

  // Pause timer
  const pauseTimer = async () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    try {
      await axios.post('/api/timer/pause');
      toast.success('Timer paused');
    } catch (error) {
      console.error('Failed to pause timer:', error);
    }
  };

  // Stop timer
  const stopTimer = async () => {
    setIsRunning(false);
    setTimeLeft(timerTypes[timerType].duration);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (currentSession) {
      try {
        await axios.post(`/api/timer/complete/${currentSession._id}`);
        setCurrentSession(null);
        toast.success('Session completed!');
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerTypes[timerType].duration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Switch timer type
  const switchTimerType = (type) => {
    if (isRunning) {
      toast.error('Please stop the current timer first');
      return;
    }

    setTimerType(type);
    setTimeLeft(timerTypes[type].duration);
  };

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(intervalRef.current);
            setIsRunning(false);

            // Play notification sound
            if (Notification.permission === 'granted') {
              new Notification('Pomofocus', {
                body: `${timerTypes[timerType].name} completed!`,
                icon: '/favicon.ico'
              });
            }

            // Auto-complete session
            if (currentSession) {
              axios.post(`/api/timer/complete/${currentSession._id}`)
                .then(() => {
                  setCurrentSession(null);
                  toast.success(`${timerTypes[timerType].name} completed!`);
                })
                .catch(console.error);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, timerType, currentSession]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer message
  const getTimerMessage = () => {
    if (timerType === 'pomodoro') {
      return `#${sessionCount} Time to focus!`;
    } else if (timerType === 'shortBreak') {
      return `#${sessionCount} Time for a break!`;
    } else {
      return `#${sessionCount} Time for a long break!`;
    }
  };

  // Check for active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await axios.get('/api/timer/active');
        if (response.data) {
          const session = response.data;
          setCurrentSession(session);
          setTimerType(session.type);

          if (session.isRunning) {
            const startTime = new Date(session.startTime);
            const currentTime = new Date();
            const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            const durationSeconds = session.duration * 60;
            const remainingSeconds = durationSeconds - elapsedSeconds;

            if (remainingSeconds > 0) {
              setTimeLeft(remainingSeconds);
              setIsRunning(true);
            } else {
              setTimeLeft(0);
              setIsRunning(false);
            }
          } else {
            // Paused session
            if (session.timeLeft !== undefined && session.timeLeft !== null) {
              setTimeLeft(session.timeLeft);
            } else {
              setTimeLeft(session.duration * 60);
            }
            setIsRunning(false);
          }
        }
      } catch (error) {
        console.error('Failed to check active session:', error);
      }
    };

    checkActiveSession();
  }, []);

  const value = {
    isRunning,
    timeLeft,
    timerType,
    timerTypes,
    currentSession,
    sessionCount,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    switchTimerType,
    formatTime,
    getTimerMessage,
    setSessionCount
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}; 