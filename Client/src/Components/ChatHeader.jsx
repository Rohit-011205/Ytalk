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
import { X, Video, Phone } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import react from "../assets/react.svg";
import { useAuthStore } from '../Store/useAuthStore.js';
import { useVideoCallStore } from '../Store/useVideoCall.js';
import { useState } from 'react';
import OutgoingCallScreen from './OutgoingCallScreen.jsx';


// const ChatHeader = () => {
//     const { selectedUser, setSelectedUser } = useMessageStore();
//     if (!selectedUser) return null;

//     return (
//         <div className="px-6 py-4 bg-[#050208]/80 backdrop-blur-xl border-b border-purple-900/10">
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <div className="size-10 rounded-full border border-purple-500/20 overflow-hidden bg-zinc-900">
//                         <img src={selectedUser.profilePic || react} alt="profile" className="w-full h-full object-cover" />
//                     </div>
//                     <div>
//                         <h3 className="text-sm font-semibold text-purple-50">{selectedUser.Fullname}</h3>
//                         <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Secure Session</p>
//                     </div>
//                 </div>
//                 <button 
//                     onClick={() => setSelectedUser(null)}
//                     className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
//                 >
//                     <X size={20} />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ChatHeader;

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useMessageStore();
    const { onlineUsers } = useAuthStore();
    const { startCall } = useVideoCallStore();
    const navigate = useNavigate();
    const [isOutgoingCall, setIsOutgoingCall] = useState(false);

    if (!selectedUser) return null;

    const isOnline = onlineUsers.includes(selectedUser._id);
    // const { initiateCall } = useVideoCallStore();
    const { initiateCall } = useVideoCallStore();
    // const { selectedUser } = useMessageStore();

    const handleVideoCall = () => {
        // FIX: positional args, not object
        // FIX: removed local OutgoingCallScreen — App.jsx handles it globally
        initiateCall(
            "direct",
            selectedUser._id,
            null,
            {
                _id: selectedUser._id,
                Fullname: selectedUser.Fullname,
                profilePic: selectedUser.profilePic,
            }
        );
    };
    const handleAudioCall = async () => {
        // For now, same as video call (you can add audio-only later)
        handleVideoCall();
    };

    const handleCancelCall = () => {
        setIsOutgoingCall(false);
    };

    return (
        <>
            {/* Outgoing Call Screen Overlay */}
            {isOutgoingCall && (
                <OutgoingCallScreen
                    receiverName={selectedUser.Fullname}
                    receiverAvatar={selectedUser.profilePic}
                    onCancel={handleCancelCall}
                />
            )}

            <div className="px-6 py-4 bg-[#050208]/80 backdrop-blur-xl border-b border-purple-900/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative size-10 rounded-full border border-purple-500/20 overflow-hidden bg-zinc-900">
                            <img
                                src={selectedUser.profilePic || react}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                            {/* Online Indicator */}
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-[#050208]" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-purple-50">
                                {selectedUser.Fullname}
                            </h3>
                            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">
                                {isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    {/* Call Buttons */}
                    <button
                        onClick={handleVideoCall}
                        disabled={isOutgoingCall}
                        className="p-2 rounded-full hover:bg-purple-500/20 bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-all disabled:opacity-50 flex items-center gap-1"
                        title="Video Call"
                    >
                        <Video size={18} />
                    </button>

                    {/* Audio Call Button */}
                    <button
                        onClick={() => initiateCall("group", null, selectedGroup._id, null)}
                        className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                        title="Group Video Call"
                    >
                        <Video className="w-5 h-5 text-gray-300" />
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors ml-2"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

        </>
    );
};

export default ChatHeader;