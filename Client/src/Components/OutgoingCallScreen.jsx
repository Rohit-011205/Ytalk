import React from "react";
import { useVideoCallStore } from "../Store/useVideoCall.js";
import { PhoneOff } from "lucide-react";

export default function OutgoingCallScreen() {
  const { outgoingCall, cancelCall } = useVideoCallStore();

  if (!outgoingCall) return null;

  const { receiver, callType } = outgoingCall;
  const isGroup     = callType === "group";
  const displayName = isGroup ? outgoingCall.groupName : receiver?.Fullname;
  const avatar      = receiver?.profilePic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      
      <div className="bg-gray-900 rounded-3xl p-8 flex flex-col items-center gap-6 w-80 shadow-2xl border border-white/10">

        {/* Avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping scale-125" />
          <img
            src={avatar || "/avatar.png"}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 relative z-10"
          />
        </div>

        {/* Name + dots animation */}
        <div className="text-center">
          <p className="text-white text-xl font-semibold">{displayName}</p>
          <p className="text-gray-400 text-sm mt-1">
            Calling
            <span className="inline-flex gap-1 ml-1">
              {[0,1,2].map(i => (
                <span
                  key={i}
                  className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </p>
        </div>

        {/* Cancel button */}
        <button
          onClick={cancelCall}
          className="flex flex-col items-center gap-2 group mt-2"
        >
          <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center
                          transition-all duration-200 shadow-lg shadow-red-500/30 group-hover:scale-110">
            <PhoneOff className="text-white w-6 h-6" />
          </div>
          <span className="text-gray-400 text-xs">Cancel</span>
        </button>

      </div>
    </div>
  );
}