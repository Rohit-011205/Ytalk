import React from "react";
import { useVideoCallStore } from "../Store/useVideoCall.js";
import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingCallScreen() {
  const { incomingCall, acceptCall, declineCall } = useVideoCallStore();

  if (!incomingCall) return null;

  const { caller, callType, groupName } = incomingCall;
  const isGroup    = callType === "group";
  const displayName = isGroup ? groupName : caller?.Fullname;
  const avatar      = caller?.profilePic;

  return (
    // Full screen overlay — sits on top of everything
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      
      {/* Card */}
      <div className="bg-gray-900 rounded-3xl p-8 flex flex-col items-center gap-6 w-80 shadow-2xl border border-white/10
                      animate-[fadeInScale_0.3s_ease]">
        
        {/* Pulse ring around avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping scale-125" />
          <img
            src={avatar || "/avatar.png"}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-green-500 relative z-10"
          />
        </div>

        {/* Name + status */}
        <div className="text-center">
          <p className="text-white text-xl font-semibold">{displayName}</p>
          <p className="text-gray-400 text-sm mt-1 animate-pulse">
            {isGroup ? "Incoming group video call..." : "Incoming video call..."}
          </p>
        </div>

        {/* Accept / Decline buttons */}
        <div className="flex gap-8 mt-2">
          
          {/* Decline */}
          <button
            onClick={declineCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center
                            transition-all duration-200 shadow-lg shadow-red-500/30 group-hover:scale-110">
              <PhoneOff className="text-white w-6 h-6" />
            </div>
            <span className="text-gray-400 text-xs">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center
                            transition-all duration-200 shadow-lg shadow-green-500/30 group-hover:scale-110">
              <Video className="text-white w-6 h-6" />
            </div>
            <span className="text-gray-400 text-xs">Accept</span>
          </button>

        </div>
      </div>
    </div>
  );
}