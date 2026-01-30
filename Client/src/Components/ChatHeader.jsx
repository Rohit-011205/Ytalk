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
import { X } from "lucide-react";
import react from "../assets/react.svg";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useMessageStore();
    if (!selectedUser) return null;

    return (
        <div className="px-6 py-4 bg-[#050208]/80 backdrop-blur-xl border-b border-purple-900/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full border border-purple-500/20 overflow-hidden bg-zinc-900">
                        <img src={selectedUser.profilePic || react} alt="profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-purple-50">{selectedUser.Fullname}</h3>
                        <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Secure Session</p>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;