// src/pages/OnboardingPage.jsx
import React from "react";
import { useState, useRef } from "react";
import { useAuthStore } from "../Store/useAuthStore.js";
import { Camera, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import react from "../assets/react.svg"

const STEPS = ["Identity", "Keycode", "Signal"];

const OnboardingPage = () => {
  const { authUser, completeOnboarding } = useAuthStore();
  const fileRef = useRef(null);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    Fullname: authUser?.Fullname || "",
    password: "",
    confirmPassword: "",
    profilePic: authUser?.profilePic || "",
    profilePicPreview: authUser?.profilePic || "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm(f => ({ ...f, profilePic: reader.result, profilePicPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    setError("");
    if (step === 0 && form.Fullname.trim().length < 2) {
      setError("Name must be at least 2 characters"); return false;
    }
    if (step === 1) {
      if (form.password.length < 8) { setError("Password must be at least 8 characters"); return false; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    await completeOnboarding({
      Fullname: form.Fullname,
      password: form.password,
      profilePic: authUser?.profilePic || "",        // ✅ Google photo by default
      profilePicPreview: authUser?.profilePic || "",
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020202] p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#020202_100%)]" />

      <div className="relative z-10 w-full max-w-[320px]">

        {/* Logo */}
        <div className="text-center mb-10 select-none">
          <div className="flex items-center justify-center mb-2">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="px-4">
              <h1 className="text-5xl font-black tracking-[-0.1em] text-white flex items-center">
                <span className="border-r-2 border-white/30 pr-1">Y</span>
                <span className="pl-1 tracking-widest font-light text-zinc-400 text-3xl">TALK</span>
              </h1>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />
          </div>
          <p className="text-[8px] uppercase tracking-[0.8em] text-zinc-600 font-bold mt-1">
            Initialize Profile
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 flex items-center justify-center text-xs font-black border transition-all
                  ${i < step ? "bg-white text-black border-white"
                    : i === step ? "bg-transparent text-white border-white"
                      : "bg-transparent text-zinc-600 border-zinc-800"}`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-[8px] uppercase tracking-widest font-bold
                  ${i === step ? "text-white" : "text-zinc-600"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-[1px] w-14 mx-2 mb-4 transition-all ${i < step ? "bg-white" : "bg-zinc-800"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Username ── */}
        {step === 0 && (
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold block">
              Your Identity
            </label>
            <input
              type="text"
              className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-white/40 transition-all font-mono text-xs"
              placeholder="DISPLAY NAME"
              value={form.Fullname}
              onChange={e => setForm(f => ({ ...f, Fullname: e.target.value }))}
            />
            {/* Restore Google name chip */}
            {authUser?.Fullname && form.Fullname !== authUser.Fullname && (
              <button
                className="text-[9px] uppercase tracking-widest text-zinc-500 border border-zinc-800 px-3 py-1.5 hover:border-white/30 hover:text-zinc-300 transition-all font-mono w-full text-left"
                onClick={() => setForm(f => ({ ...f, Fullname: authUser.Fullname }))}>
                ↩ Restore "{authUser.Fullname}" from Google
              </button>
            )}
          </div>
        )}

        {/* ── Step 1: Password ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold block">
                Set Keycode
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-white/40 transition-all font-mono text-xs"
                  placeholder="MIN 8 CHARACTERS"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-400"
                  onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold block">
                Confirm Keycode
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-white/40 transition-all font-mono text-xs"
                  placeholder="REPEAT KEYCODE"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-400"
                  onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Profile Pic ── */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold block">
              Profile Signal
            </label>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {/* Profile pic display in Step 2 */}
                <img
                  src={form.profilePicPreview || "react"}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => e.target.src = "react"} // ✅ fallback if Google URL blocked
                  className="w-24 h-24 object-cover border border-zinc-800"
                />
                <button onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 bg-white text-black p-1.5 hover:bg-zinc-200 transition-all">
                  <Camera size={12} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <div className="flex gap-2 w-full">
                {authUser?.profilePic && (
                  <button
                    className="flex-1 text-[9px] uppercase tracking-widest text-zinc-500 border border-zinc-800 py-2 hover:border-white/30 hover:text-zinc-300 transition-all font-mono"
                    onClick={() => setForm(f => ({ ...f, profilePic: authUser.profilePic, profilePicPreview: authUser.profilePic }))}>
                    Keep Google
                  </button>
                )}
                <button
                  className="flex-1 text-[9px] uppercase tracking-widest text-zinc-600 border border-zinc-800 py-2 hover:border-white/30 hover:text-zinc-400 transition-all font-mono"
                  onClick={() => setForm(f => ({ ...f, profilePic: "", profilePicPreview: "" }))}>
                  No Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-[10px] uppercase tracking-widest font-mono mt-4 border border-red-500/20 px-3 py-2">
            ⚠ {error}
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 0
            ? <button
              className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-mono"
              onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
            : <div />}

          {step < STEPS.length - 1
            ? <button
              className="bg-white text-black px-6 py-2.5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-95"
              onClick={() => validateStep() && setStep(s => s + 1)}>
              Next →
            </button>
            : <button
              className="bg-white text-black px-6 py-2.5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2"
              onClick={handleSubmit}
              disabled={loading}>
              {loading ? <Loader2 className="animate-spin size-3" /> : "Launch →"}
            </button>}
        </div>

      </div>
    </div>
  );
};

export default OnboardingPage;