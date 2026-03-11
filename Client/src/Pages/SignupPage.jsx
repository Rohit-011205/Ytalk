// import React from "react";
// import { useState } from "react";
// import { useAuthStore } from "../Store/useAuthStore";
// import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
// import { Link } from "react-router-dom";

// // import AuthImagePattern from "../components/AuthImagePattern";
// import toast from "react-hot-toast";

// const SignUpPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     Fullname: "",
//     email: "",
//     password: "",
//   });

//   const { signup, isSigningUp } = useAuthStore();

//   const validateForm = () => {
//     if (!formData.Fullname.trim()) return toast.error("Full name is required");
//     if (!formData.email.trim()) return toast.error("Email is required");
//     if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
//     if (!formData.password) return toast.error("Password is required");
//     if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");

//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const success = validateForm();

//     if (success === true) signup(formData);
//   };

//   return (
//     <div className="min-h-screen grid lg:grid-cols-2">
//       {/* left side */}
//       <div className="flex flex-col justify-center items-center p-6 sm:p-12">
//         <div className="w-full max-w-md space-y-8">
//           {/* LOGO */}
//           <div className="text-center mb-8">
//             <div className="flex flex-col items-center gap-2 group">
//               <div
//                 className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
//               group-hover:bg-primary/20 transition-colors"
//               >
//                 <MessageSquare className="size-6 text-primary" />
//               </div>
//               <h1 className="text-2xl font-bold mt-2">Create Account</h1>
//               <p className="text-base-content/60">Get started with your free account</p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Full Name</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="size-5 text-base-content/40" />
//                 </div>
//                 <input
//                   type="text"
//                   className={`input input-bordered w-full pl-10`}
//                   placeholder="John Doe"
//                   value={formData.Fullname}
//                   onChange={(e) => setFormData({ ...formData, Fullname: e.target.value })}
//                 />
//               </div>
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Email</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="size-5 text-base-content/40" />
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
//                   <Lock className="size-5 text-base-content/40" />
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
//                     <EyeOff className="size-5 text-base-content/40" />
//                   ) : (
//                     <Eye className="size-5 text-base-content/40" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
//               {isSigningUp ? (
//                 <>
//                   <Loader2 className="size-5 animate-spin" />
//                   Loading...
//                 </>
//               ) : (
//                 "Create Account"
//               )}
//             </button>
//           </form>

//           <div className="text-center">
//             <p className="text-base-content/60">
//               Already have an account?{" "}
//               <Link to="/login" className="link link-primary">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* right side */}

//       {/* <AuthImagePattern
//         title="Join our community"
//         subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
//       /> */}
//     </div>
//   );
// };
// export default SignUpPage;


import React, { useState } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { axiosInstance } from "../../API.js";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ Fullname: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  const handleGoogleLogin = async () => {
    const URL = import.meta.env.VITE_BACKEND_URL;
    window.location.href = URL + "/api/auth/google";
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020202] p-6 relative">

      {/* BACKGROUND: Deep smoke and charcoal */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#020202_100%)]" />

      <div className="relative z-10 w-full max-w-[320px]">

        {/* THE ARTIFACT LOGO: Rugged & Sharp */}
        <div className="text-center mb-16 select-none">
          <div className="flex items-center justify-center mb-2">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="px-4">
              <h1 className="text-5xl font-black tracking-[-0.1em] text-white flex items-center">
                <span className="text-white border-r-2 border-white/30 pr-1">Y</span>
                <span className="pl-1 tracking-widest font-light text-zinc-400 text-3xl">TALK</span>
              </h1>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />
          </div>
          <p className="text-[8px] uppercase tracking-[0.8em] text-zinc-600 font-bold">
            Forged in Code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">Identity</label>
            <input
              type="text"
              className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-white/40 transition-all font-mono text-xs"
              placeholder="NAME"
              value={formData.Fullname}
              onChange={(e) => setFormData({ ...formData, Fullname: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">Frequency</label>
            <input
              type="email"
              className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-white/40 transition-all font-mono text-xs"
              placeholder="EMAIL@CHANNEL.COM"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">Keycode</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-white/40 transition-all font-mono text-xs"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-white text-black py-4 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isSigningUp ? <Loader2 className="animate-spin size-4" /> : "Initiate Connection"}
          </button>
        </form>

         <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-zinc-400 hover:border-white/40 hover:text-white transition-all font-mono text-[10px] uppercase tracking-widest"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            Already Registered? <span className="text-white border-b border-white/20 ml-1">Login</span>
          </Link>
        </div>
      </div>

      {/* RUGGED DECORATION */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="absolute top-6 left-6 opacity-20"><Zap size={16} className="text-white" /></div>
    </div>
  );
};

export default SignUpPage;