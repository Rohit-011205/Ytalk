import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../Store/useAuthStore';
import { Camera, Loader2, ArrowLeft, Check, X, Edit2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (authUser?.Fullname) setNewName(authUser.Fullname);
  }, [authUser]);

  const handleUpdateName = async () => {
    if (newName.trim() === "" || newName === authUser?.Fullname) {
      setIsEditingName(false);
      return;
    }
    await updateProfile({ Fullname: newName });
    setIsEditingName(false);
  };

  if (isCheckingAuth) return <div className="h-screen bg-black flex items-center justify-center text-white font-mono text-[10px] tracking-[0.5em]">SYSTEM_LOADING...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-white">
      <div className="max-w-4xl mx-auto px-10 pt-16">
        
        {/* TOP NAVIGATION */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 mb-24 opacity-50 hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} strokeWidth={3} />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Back</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
          
          {/* AVATAR SECTION */}
          <div className="md:col-span-4 space-y-6">
            <div className="aspect-square bg-zinc-900 relative group border border-white/5">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt=""
                className="w-full h-full object-cover grayscale brightness-85 group-hover:brightness-100 transition-all duration-500"
              />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white text-black p-4 cursor-pointer hover:bg-violet-500 hover:text-white transition-colors">
                {isUpdatingProfile ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                <input type="file" id="avatar-upload" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    setSelectedImg(reader.result);
                    updateProfile({ profilePic: reader.result });
                  };
                }} />
              </label>
            </div>
          </div>

          {/* IDENTITY SECTION */}
          <div className="md:col-span-8 space-y-16">
            
            {/* NAME EDIT LOGIC */}
            <div className="space-y-4 text-zinc-100">
              <div className="flex items-center justify-between opacity-50 text-white">
                <span className="text-[9px] text-zinc-100 font-black tracking-[0.5em] uppercase">User Identity</span>
                {!isEditingName && <span className="text-[9px] font-bold text-white uppercase tracking-widest">Click to Edit</span>}
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-6 border-b-2 border-white pb-2">
                  <input 
                    autoFocus
                    className="bg-transparent text-5xl font-black uppercase tracking-tighter outline-none w-full"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                  />
                  <div className="flex gap-4">
                    <button onClick={handleUpdateName} className="text-emerald-500 hover:scale-110 transition-transform"><Check size={28} /></button>
                    <button onClick={() => setIsEditingName(false)} className="text-red-500 hover:scale-110 transition-transform"><X size={28} /></button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)} 
                  className="group cursor-pointer flex items-baseline justify-between"
                >
                  <h1 className="text-7xl font-black uppercase tracking-[-0.05em] leading-[0.85] group-hover:text-violet-500 transition-colors">
                    {authUser?.Fullname || "User"}
                  </h1>
                  <Edit2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-100" />
                </div>
              )}
            </div>

            {/* TECHNICAL SPECS */}
            <div className="grid grid-cols-1 gap-10 pt-10 border-t border-white/10">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Mail_Address</span>
                <span className="text-sm font-bold tracking-tight">{authUser?.email}</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Registry_Date</span>
                <span className="text-sm font-bold tracking-tight">
                    {authUser?.createdAt?.split('T')[0].replace(/-/g, ' . ')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Access_Status</span>
                <div className="flex items-center gap-2 px-3 py-1 border border-emerald-500/50">
                   <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-emerald-500 uppercase">Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SWISS MARGINS FOOTER */}
        <div className="mt-40 mb-10 flex justify-between items-center text-[9px] font-black tracking-[0.6em] uppercase opacity-10">
          <span>Ytalk International</span>
          <span>CH / 2026</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;