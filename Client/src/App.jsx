import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuthStore } from './Store/useAuthStore';
import { Loader } from 'lucide-react';
import SignupPage from './Pages/SignupPage';
import { Toaster } from 'react-hot-toast';
import HomePage from './Pages/HomePage';
import Setting from './Pages/Setting';
import ProfilePage from './Pages/ProfilePage';
import LoginP from './Pages/LoginP';
// import { useEffect } from 'react';
import { useThemeStore } from './Store/useThemeStore';

export default function App() {
  const { authUser, checkAuth, isCheckingAuth, } = useAuthStore()
  const { theme} = useThemeStore();

  useEffect(() => {
    checkAuth()

  }, [checkAuth])

  console.log(authUser)

  if (isCheckingAuth && !authUser) {
    <div className="hi flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  }
  return (
    <>
      <div data-theme={theme}>


        <Routes>
          <Route path='/HomePage' element={<HomePage />} />
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginP /> : <Navigate to="/" />} />
          <Route path="/settings" element={<Setting />} />
           <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>

        <Toaster
          position="top-center"
          reverseOrder={false}
        />
      </div>


    </>
  );
}
