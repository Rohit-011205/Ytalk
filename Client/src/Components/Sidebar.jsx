import React from 'react'
import { useEffect, useState } from 'react'
import { useMessageStore } from '../Store/UseMessageStore.js'
import { useAuthStore } from '../Store/useAuthStore.js';
import { Users } from 'lucide-react';
import react from "../assets/react.svg";

// const Sidebars = () => {
//     const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useMessageStore();

//     const { onlineUsers } = useAuthStore();

//     const [showOnlineOnly, setShowOnlineOnly] = useState(false);


//     useEffect(() => {
//         getUsers();
//     }, [getUsers])

//     useEffect(() => {
//         console.log("Sidebar selectedUser:", selectedUser);
//     }, [selectedUser]);


//     const filteredUsers = showOnlineOnly ? users.filter((users) => onlineUsers.includes(users._id)) : users;

//     return (
//         <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
//             <div className="border-b border-base-300 w-full p-5">
//                 <div className="flex items-center gap-2">
//                     <Users className="size-6" />
//                     <span className="font-medium hidden lg:block">Contacts</span>
//                 </div>

//                 {/* TODO: Online filter toggle */}
//                 <div className="mt-3 hidden lg:flex items-center gap-2">
//                     <label className="cursor-pointer flex items-center gap-2">
//                         <input
//                             type="checkbox"
//                             checked={showOnlineOnly}
//                             onChange={(e) => setShowOnlineOnly(e.target.checked)}
//                             className="checkbox checkbox-sm"
//                         />
//                         <span className="text-sm">Show online only</span>
//                     </label>
//                     {/* <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span> */}
//                 </div>
//             </div>

//             <div className="overflow-y-auto w-full py-3">
//                 {filteredUsers.map((user) => (
//                     <button
//                         key={user._id}
//                         onClick={() => {
//                             console.log("clicked:", user);
//                             setSelectedUser(user)
//                         }}
//                         className={`
//               w-full p-3 flex items-center gap-3
//               hover:bg-base-300 transition-colors
//               ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
//             `}
//                     >
//                         <div className="relative mx-auto lg:mx-0">
//                             <img
//                                 src={user.profilePic || react}
//                                 alt={user.name}
//                                 className="size-12 object-cover rounded-full"
//                             />
//                             {onlineUsers.includes(user._id) && (
//                                 <span
//                                     className="absolute bottom-0 right-0 size-3 bg-green-500 
// rounded-full ring-2 ring-zinc-900"
//                                 />
//                             )}
//                         </div>

//                         {/* User info - only visible on larger screens */}
//                         <div className="hidden lg:block text-left min-w-0">
//                             <div className="font-medium truncate">{user.Fullname}</div>
//                             <div className="text-sm text-zinc-400">
//                                 {/* {onlineUsers.includes(user._id) ? "Online" : "Offline"} */}
//                             </div>
//                         </div>
//                     </button>
//                 ))}

//                 {filteredUsers.length === 0 && (
//                     <div className="text-center text-zinc-500 py-4">No online users</div>
//                 )}
//             </div>
//         </aside>
//     )
// }

const Sidebars = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useMessageStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => { getUsers(); }, [getUsers]);

  const filteredUsers = showOnlineOnly ? users.filter((u) => onlineUsers.includes(u._id)) : users;

  return (
    <aside className="h-full w-20 lg:w-72 bg-[#0A0510] border-r border-purple-900/20 flex flex-col transition-all">
      <div className="p-6 border-b border-purple-900/10">
        <div className="flex items-center justify-between">
          <h2 className="text-purple-100 font-semibold tracking-wide hidden lg:block">Messages</h2>
          <Users className="size-5 text-purple-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-4 flex items-center gap-4 transition-all duration-300
              ${selectedUser?._id === user._id 
                ? "bg-purple-600/10 border-r-2 border-purple-500 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]" 
                : "hover:bg-white/5"}
            `}
          >
            <div className="relative">
              <img src={user.profilePic || react} className="size-12 rounded-full object-cover border border-purple-500/20" />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-[#0A0510]" />
              )}
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-medium text-purple-50">{user.Fullname}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-tighter">
                {onlineUsers.includes(user._id) ? "Active Now" : "Recently Active"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebars
