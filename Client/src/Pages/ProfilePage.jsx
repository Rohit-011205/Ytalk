// import React from 'react'
// import { useAuthStore } from '../Store/useAuthStore'
// import { Camera, Mail, User } from "lucide-react";
// import { useState } from 'react';
// import react from '../assets/react.svg'

// const ProfilePage = () => {
//   const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()
//   const [selectedImg, setSelectedImg] = useState(null);

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) {
//       return;
//     }

//     const reader = new FileReader();

//     reader.readAsDataURL(file);

//     reader.onload = async () => {
//       const textBase64 = reader.result;
//       setSelectedImg(textBase64);

//       await updateProfile({ profilePic: textBase64 });

//     }
//   }

//   const handleRemovePhoto = async () => {
//     setSelectedImg(null);
//     await updateProfile({ profilePic: "" })
//   }

//   return (
//     <div className='h-screen pt-20 '>
//       <div className="2 max-w-2xl mx-auto p-4 py-8">
//         <div className="3 bg-base-100 rounded-xl p-6 space-y-8 ">
//           <div className="4 text-center">
//             <h1 className="text-2xl font-semibold ">Profile</h1>
//             <p className="mt-2">Your profile information</p>
//           </div>

//           <div className="flex flex-col items-center gap-4">
//             <div className="relative">
//               <img
//                 src={selectedImg || authUser?.profilePic || react}
//                 alt="Profile"
//                 className="size-32 rounded-full object-cover border-4 "
//               />
//               <label
//                 htmlFor="avatar-upload"
//                 className={`
//                   absolute bottom-0 right-0 
//                   bg-base-content hover:scale-105
//                   p-2 rounded-full cursor-pointer 
//                   transition-all duration-200
//                   ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
//                  `}>
//                 <Camera className="w-5 h-5 text-base-200" />
//                 <input
//                   type="file"
//                   id="avatar-upload"
//                   className="hidden"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   disabled={isUpdatingProfile}
//                 />
//               </label>

//               <button
//                 onClick={handleRemovePhoto}
//                 disabled={isUpdatingProfile}
//                 className="text-sm text-red-500 hover:underline disabled:opacity-50"
//               >
//                 Remove photo
//               </button>

//             </div>
//             <p className="text-sm text-zinc-400">
//               {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
//             </p>
//           </div>
//           <div className="space-y-6">
//             <div className="space-y-1.5">
//               <div className="text-sm text-zinc-400 flex items-center gap-2">
//                 <User className="w-4 h-4" />
//                 Full Name
//               </div>
//               <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.Fullname}</p>
//             </div>

//             <div className="space-y-1.5">
//               <div className="text-sm text-zinc-400 flex items-center gap-2">
//                 <Mail className="w-4 h-4" />
//                 Email Address
//               </div>
//               <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
//             </div>
//           </div>

//           <div className="mt-6 bg-base-300 rounded-xl p-6">
//             <h2 className="text-lg font-medium  mb-4">Account Information</h2>
//             <div className="space-y-3 text-sm">
//               <div className="flex items-center justify-between py-2 border-b border-zinc-700">
//                 <span>Member Since</span>
//                 <span>{authUser?.createdAt?.split("T")[0]}</span>
//               </div>
//               <div className="flex items-center justify-between py-2">
//                 <span>Account Status</span>
//                 <span className="text-green-500">Active</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfilePage


import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../Store/useAuthStore';
import { Camera, Mail, User, Shield, Calendar, Check, Edit3, X, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import react from '../assets/react.svg';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Sync internal state with Auth data
  useEffect(() => {
    if (authUser?.Fullname) {
      setNewName(authUser.Fullname);
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const textBase64 = reader.result;
      setSelectedImg(textBase64);
      await updateProfile({ profilePic: textBase64 });
    };
  };

  const handleUpdateName = async () => {
    if (newName.trim() === "" || newName === authUser?.Fullname) {
      setIsEditingName(false);
      return;
    }
    await updateProfile({ Fullname: newName });
    setIsEditingName(false);
  };

  // Prevent "Anonymous" flash by waiting for Auth check
  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-[#0d0d0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0e] pt-10 pb-10 font-serif text-[#e5e5e5]">
      <div className="max-w-2xl mx-auto p-4">
        
        {/* MINIMALIST BACK BUTTON */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 mb-6 text-[#dbd8d8] hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4 border border-[#33353f] rounded-full p-1 group-hover:border-white" />
          <span className="text-[10px] uppercase tracking-widest font-sans">Return</span>
        </button>

        <div className="bg-[#16171b] border border-[#33353f] shadow-2xl rounded-sm overflow-hidden">
          
          <div className="bg-[#1c1d22] border-b border-[#33353f] px-8 py-4 flex justify-between items-center">
            <h1 className="text-xs tracking-[0.4em] uppercase text-[#a1a1a1] font-sans">Identity Dossier</h1>
            <div className="text-[10px] uppercase text-[#c3c0c0]">Secure Access</div>
          </div>

          <div className="p-8 md:p-12">
            
            {/* PORTRAIT */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative group">
                <div className="p-1 border-2 border-[#444] bg-[#0d0d0e]">
                  <img
                    src={selectedImg || authUser?.profilePic || react}
                    alt="Portrait"
                    className="size-40 object-cover"
                  />
                </div>
                <label htmlFor="avatar-upload" className="absolute -bottom-3 -right-3 bg-white text-black p-2 cursor-pointer hover:bg-[#ccc] shadow-xl transition-all">
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {/* DATA FIELDS */}
            <div className="grid gap-8">
              
              {/* FULL NAME - EDITABLE */}
              <div className={`border-l-2 pl-6 py-1 transition-all ${isEditingName ? "border-white" : "border-[#33353f]"}`}>
                <label className="text-[9px] uppercase tracking-widest text-[#666] block mb-1 font-sans">Subject Name</label>
                
                <div className="flex items-center justify-between">
                  {isEditingName ? (
                    <div className="w-full">
                      <input 
                        autoFocus
                        className="bg-transparent text-xl text-white border-b border-white/20 focus:border-white outline-none w-full pb-1 mb-3"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdateName} className="bg-white text-black text-[9px] px-3 py-1 font-bold uppercase tracking-tighter">Save Changes</button>
                        <button onClick={() => setIsEditingName(false)} className="text-[#666] text-[9px] px-3 py-1 uppercase tracking-tighter border border-[#33353f]">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl text-white">{authUser?.Fullname || "System User"}</p>
                      <button onClick={() => setIsEditingName(true)} className="text-[#444] hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* EMAIL */}
              <div className="border-l-2 border-[#1c1d22] pl-6 py-1">
                <label className="text-[9px] uppercase tracking-widest text-[#666] block mb-1 font-sans">Email Registry</label>
                <p className="text-lg text-[#888] italic">{authUser?.email}</p>
              </div>
            </div>

            {/* ACCOUNT INFO */}
            <div className="mt-12 pt-6 border-t border-[#33353f]">
              <div className="flex justify-between items-center py-2 text-xs">
                <span className="text-[#666] uppercase tracking-tighter">Established</span>
                <span className="text-[#ccc] font-mono">
                  {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "Pending..."}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 text-xs">
                <span className="text-[#666] uppercase tracking-tighter">Authority</span>
                <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Active</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;