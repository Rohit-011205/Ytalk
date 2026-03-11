import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuthStore } from './Store/useAuthStore.js';
import { useVideoCallStore } from './Store/useVideoCall.js';
import { useThemeStore } from './Store/useThemeStore.js';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './Pages/HomePage';
import SignupPage from './Pages/SignupPage';
import LoginP from './Pages/LoginP';
import Setting from './Pages/Setting';
import ProfilePage from './Pages/ProfilePage';
import OnboardingPage from "./Pages/onBoardingPage.jsx";

// Call UI — always mounted when logged in
import IncomingCallScreen from './Components/IncomingCallScreen.jsx';
import OutgoingCallScreen from './Components/OutgoingCallScreen.jsx';
import VideoCallRoom from './Components/VideoCallRoom.jsx';

export default function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribeToCallEvents, unsubscribeFromCallEvents } = useVideoCallStore();

  // Check login status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Subscribe to call socket events when logged in
  useEffect(() => {
    if (!authUser) return;

    const timer = setTimeout(() => {
      subscribeToCallEvents();
    }, 500);

    return () => {
      clearTimeout(timer);
      unsubscribeFromCallEvents();
    };
  }, [authUser]);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>

      {/* Routes */}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginP /> : <Navigate to="/" />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route
          path="/onboarding"
          element={
            authUser
              ? !authUser.isOnboarded
                ? <OnboardingPage />
                : <Navigate to="/" />
              : <Navigate to="/login" />
          }
        />
      </Routes>

      {/*
        Call screens mounted GLOBALLY — outside routes.
        They only render when there is an active/incoming/outgoing call.
        This means calls work from ANY page.
      */}
      {authUser && (
        <>
          <IncomingCallScreen />
          <OutgoingCallScreen />
          <VideoCallRoom />
        </>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}