// import React from 'react'
// import { useAuthStore } from '../Store/useAuthStore.js'
// import { useMessageStore } from '../Store/UseMessageStore.js';
// import { X } from "lucide-react";
// import react from "../assets/react.svg";
// import { useEffect } from 'react';


// const ChatHeader = () => {

//     const { selectedUser, setSelectedUser } = useMessageStore();
//     // const { onlineUsers } = useAuthStore();
//     if (!selectedUser) return null;

//     useEffect(() => {
//         console.log("ChatHeader selectedUser:", selectedUser);
//     }, [selectedUser]);

//     return (
//         <div className="p-2.5 border-b border-base-300">
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     {/* Avatar */}
//                     <div className="avatar">
//                         <div className="size-10 rounded-full relative">
//                             <img
//                                 src={selectedUser.profilePic || react}
//                                 alt={selectedUser.Fullname}
//                             />
//                         </div>
//                     </div>

//                     {/* User info */}
//                     <div>
//                         <h3 className="font-medium">{selectedUser.Fullname}</h3>
//                         {/* <p className="text-sm text-base-content/70">
//                             {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
//                         </p> */}
//                     </div>
//                 </div>

//                 {/* Close button */}
//                 <button onClick={() => setSelectedUser(null)}>
//                     <X />
//                 </button>
//             </div>
//         </div>
//     )
// }

// export default ChatHeader

import React from 'react';
import { useMessageStore } from '../Store/UseMessageStore.js';
import { useAuthStore } from '../Store/useAuthStore.js';
import { useVideoCallStore } from '../Store/useVideoCall.js';
import { X, Video } from "lucide-react";
import react from "../assets/react.svg";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useMessageStore();
    const { onlineUsers } = useAuthStore();
    const { initiateCall } = useVideoCallStore();

    if (!selectedUser) return null;

    const isOnline = onlineUsers.includes(selectedUser._id);

    const handleVideoCall = () => {
        initiateCall("direct", selectedUser._id, null, {
            _id: selectedUser._id,
            Fullname: selectedUser.Fullname,
            profilePic: selectedUser.profilePic,
        });
    };

    return (
        <div className="px-5 py-2.5 bg-[#08040d]/40 backdrop-blur-md border-b border-white/[0.05] flex items-center justify-between">
            {/* User Info Section */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="size-8 rounded-full border border-purple-500/20 overflow-hidden bg-zinc-900">
                        <img
                            src={selectedUser.profilePic || react}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-emerald-500 rounded-full border-2 border-[#08040d]" />
                    )}
                </div>

                <div className="flex flex-col">
                    <h3 className="text-xs font-semibold text-white/90 leading-tight tracking-tight">
                        {selectedUser.Fullname}
                    </h3>
                    <span className={`text-[9px] uppercase tracking-tighter font-bold ${isOnline ? 'text-emerald-500/80' : 'text-white/20'}`}>
                        {isOnline ? 'Active' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Action Section */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleVideoCall}
                    className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-400/80 hover:text-purple-300 transition-all active:scale-95"
                    title="Start Video Call"
                >
                    <Video size={18} strokeWidth={2} />
                </button>

                <div className="w-[1px] h-4 bg-white/5 mx-1" />

                <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white/60 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;