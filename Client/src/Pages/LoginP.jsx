// import React, { useState } from 'react'
// import { useAuthStore } from '../Store/useAuthStore.js';
// import { Link } from "react-router-dom";
// import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react"; 

// const LoginP = () => {
//     const [showPassword, setShowPassword] = useState(false);
//     const [formData, setFormData] = useState({
//         email: '',
//         password: ''
//     });
//     const {login, isLoggingIn} = useAuthStore();

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         login(formData);
//     }

//     return (
//     <div className="h-screen grid lg:grid-cols-2">
//       {/* Left Side - Form */}
//       <div className="flex flex-col justify-center items-center p-6 sm:p-12">
//         <div className="w-full max-w-md space-y-8">
//           {/* Logo */}
//           <div className="text-center mb-8">
//             <div className="flex flex-col items-center gap-2 group">
//               <div
//                 className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
//               transition-colors"
//               >
//                 <MessageSquare className="w-6 h-6 text-primary" />
//               </div>
//               <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
//               <p className="text-base-content/60">Sign in to your account</p>
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Email</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-base-content/40" />
//                 </div>
//                 <input
//                   type="email"
//                   className={`input input-bordered w-full pl-10`}
//                   placeholder="you@example.com"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 />
//               </div>
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Password</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-base-content/40" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className={`input input-bordered w-full pl-10`}
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-base-content/40" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-base-content/40" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
//               {isLoggingIn ? (
//                 <>
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                   Loading...
//                 </>
//               ) : (
//                 "Sign in"
//               )}
//             </button>
//           </form>

//           <div className="text-center">
//             <p className="text-base-content/60">
//               Don&apos;t have an account?{" "}
//               <Link to="/signup" className="link link-primary">
//                 Create account
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>

//             {/* Right Side - Image/Pattern
//       <AuthImagePattern
//         title={"Welcome back!"}
//         subtitle={"Sign in to continue your conversations and catch up with your messages."}
//       /> */}
//         </div>
//     )
// }

// export default LoginP

import React, { useState } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const LoginP = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#b0642a] p-6 relative overflow-hidden selection:bg-[#FF9933]/30">
      
      {/* ANCIENT RADIANCE: Saffron & Gold Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#2a1b0a_0%,_#110d0a_100%)] pointer-events-none" />

      {/* MANDALA DRAWING: Faint background geometry */}
      <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
        <svg width="600" height="600" viewBox="0 0 100 100" className="animate-[spin_120s_linear_infinite]">
          <circle cx="50" cy="50" r="45" stroke="#FF9933" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="35" stroke="#FF9933" strokeWidth="0.5" fill="none" />
          <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" stroke="#FF9933" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* COMPACT INTERFACE */}
      <div className="relative z-10 w-full max-w-[280px]">
        
        {/* LOGO: Ytalk with Ancient Cues */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-serif font-extralight text-[#f3f4f6] tracking-tighter">
            Y<span className="italic text-[#FF9933] drop-shadow-[0_0_10px_rgba(255,153,51,0.4)]">talk</span>
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-[0.5px] w-6 bg-[#FF9933]/20" />
            <p className="text-[9px] uppercase tracking-[0.6em] text-[#9a3412] font-sans font-bold">
              Amrit Ledger
            </p>
            <div className="h-[0.5px] w-6 bg-[#FF9933]/20" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* ADDRESS FIELD */}
          <div className="group relative">
            <label className="text-[9px] uppercase tracking-[0.4em] text-[#FF9933] font-sans font-bold mb-1.5 block opacity-70 group-focus-within:opacity-100 transition-opacity">
              Vayu Address
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full bg-transparent border-b border-white/5 py-1 text-zinc-300 outline-none focus:border-[#FF9933]/50 transition-all placeholder:text-zinc-900 font-serif italic text-[12px]"
                placeholder="identity@ytalk.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* CIPHER FIELD */}
          <div className="group relative">
            <label className="text-[9px] uppercase tracking-[0.4em] text-[#FF9933] font-sans font-bold mb-1.5 block opacity-70 group-focus-within:opacity-100 transition-opacity">
              Mantra Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent border-b border-white/5 py-1 text-zinc-300 outline-none focus:border-[#FF9933]/50 transition-all placeholder:text-zinc-900 text-[12px] tracking-[0.3em]"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-[#FF9933] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
            </div>
          </div>

          {/* SUBMIT: The Sacred Gate */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#d97706] hover:from-[#fbbf24] hover:to-[#FF9933] text-[#110d0a] py-3.5 rounded-none transition-all duration-700 text-[10px] uppercase tracking-[0.5em] font-sans font-black mt-6 active:scale-95 shadow-[0_0_25px_rgba(255,153,51,0.2)]"
          >
            {isLoggingIn ? (
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin size-3.5" />
                    <span>Establishing...</span>
                </div>
            ) : (
              "Invoke Entry"
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-14 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#a79b92] font-sans">
            Not Recognized?{" "}
            <Link to="/signup" className="text-[#FF9933] hover:text-white transition-colors ml-1 border-b border-[#FF9933]/20">
              Seek Creation
            </Link>
          </p>
        </div>
      </div>

      {/* ANCIENT BORDER ACCENTS */}
      <div className="absolute top-8 left-8 size-16 border-t-[0.5px] border-l-[0.5px] border-[#FF9933]/20 pointer-events-none" />
      <div className="absolute bottom-8 right-8 size-16 border-b-[0.5px] border-r-[0.5px] border-[#FF9933]/20 pointer-events-none" />
    </div>
  );
};

export default LoginP;