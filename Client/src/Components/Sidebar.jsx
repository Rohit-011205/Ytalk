// import React, { useEffect, useState } from 'react';
// import { useMessageStore } from '../Store/UseMessageStore.js';
// import { useAuthStore } from '../Store/useAuthStore.js';
// import { useGroupStore } from '../Store/useGroupStore.js';
// import { useVideoCallStore } from '../Store/useVideoCall.js';
// import { Users, Plus, Phone } from 'lucide-react';
// import react from '../assets/react.svg';
// import CreateGroupModal from './GroupModel.jsx';
// import CallHistoryModal from './CallHistoryModal.jsx';

// const Sidebar = () => {
//   const { getUsers, users, selectedUser, setSelectedUser } = useMessageStore();
//   const { groups, fetchGroups, setActiveGroup } = useGroupStore();
//   const { onlineUsers } = useAuthStore();
//   const { callHistory, getCallHistory } = useVideoCallStore();

//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showCallHistory, setShowCallHistory] = useState(false);

//   const [userMessages,setuserMessages] = ({});

//   useEffect(() => {
//     getUsers();
//     fetchGroups();
//     getCallHistory(); // load call history for missed call badge
//   }, []);

//   useEffect(() => {
//     const handleNewMessage = (message) => {
//       const currentSelectedUser = useMessageStore.getState().selectedUser
//       const senderId = message.senderId;

//       if(!currentSelectedUser || currentSelectedUser._id !== senderId){
//         selectedUser(prev => {
//           ...
//         })
//       }
//     }
//   })

//   // Count missed calls from history
//   const missedCallCount = (callHistory || []).filter(
//     call => call.status === "missed" && call.direction === "incoming"
//   ).length;

//   return (
//     <>
//       <aside className="h-full w-20 lg:w-72 bg-[#0A0510] border-r border-purple-900/20 flex flex-col">

//         {/* HEADER */}
//         <div className="p-5 border-b border-purple-900/10 flex items-center justify-between">
//           <h2 className="hidden lg:block text-purple-100 font-semibold">
//             Chats
//           </h2>

//           <div className="flex items-center gap-2">

//             {/* Call History Button with missed badge */}
//             <button
//               onClick={() => setShowCallHistory(true)}
//               className="relative p-2 rounded-full hover:bg-purple-500/10 text-purple-400"
//               title="Call History"
//             >
//               <Phone size={18} />
//               {missedCallCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px]
//                                   font-bold rounded-full w-5 h-5 flex items-center justify-center
//                                   animate-pulse">
//                   {missedCallCount}
//                 </span>
//               )}
//             </button>

//             {/* Create Group Button */}
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="p-2 rounded-full hover:bg-purple-500/10 text-purple-400"
//               title="Create Group"
//             >
//               <Plus size={18} />
//             </button>
//           </div>
//         </div>

//         {/* GROUPS */}
//         <div className="px-2 py-3">
//           <p className="hidden lg:block text-xs text-purple-400 mb-2">GROUPS</p>
//           {groups.map(group => (
//             <button
//               key={group._id}
//               onClick={() => setActiveGroup(group._id)}
//               className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition"
//             >
//               <img
//                 src={group.groupPic || react}
//                 className="size-10 rounded-full object-cover"
//                 alt={group.name}
//               />
//               <span className="hidden lg:block text-purple-100 truncate">
//                 {group.name}
//               </span>
//             </button>
//           ))}
//         </div>

//         {/* USERS */}
//         <div className="flex-1 overflow-y-auto px-2">
//           <p className="hidden lg:block text-xs text-purple-400 my-2">DIRECT MESSAGES</p>
//           {users.map(user => (
//             <button
//               key={user._id}
//               onClick={() => setSelectedUser(user)}
//               className={`w-full flex items-center gap-3 p-3 rounded-lg transition
//                   ${selectedUser?._id === user._id ? "bg-purple-600/10" : "hover:bg-white/5"}`}
//             >
//               <div className="relative">
//                 <img
//                   src={user.profilePic || react}
//                   className="size-10 rounded-full object-cover"
//                   alt={user.Fullname}
//                 />
//                 {onlineUsers.includes(user._id) && (
//                   <span className="absolute bottom-0 right-0 size-2.5 bg-green-500
//                                     rounded-full ring-2 ring-[#0A0510]" />
//                 )}
//               </div>
//               <span className="hidden lg:block text-purple-100 truncate">
//                 {user.Fullname}
//               </span>
//             </button>
//           ))}
//         </div>

//       </aside>

//       {/* Modals */}
//       <CreateGroupModal
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//       />

//       <CallHistoryModal
//         isOpen={showCallHistory}
//         onClose={() => setShowCallHistory(false)}
//       />
//     </>
//   );
// };

// export default Sidebar;



import React, { useEffect, useState, useMemo } from 'react';
import { useMessageStore } from '../Store/UseMessageStore.js';
import { useAuthStore } from '../Store/useAuthStore.js';
import { useGroupStore } from '../Store/useGroupStore.js';
import { useVideoCallStore } from '../Store/useVideoCall.js';
import { Users, Plus, Phone } from 'lucide-react';
import react from '../assets/react.svg';
import CreateGroupModal from './GroupModel.jsx';
import CallHistoryModal from './CallHistoryModal.jsx';

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, messages, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
  const { groups, fetchGroups, setActiveGroup } = useGroupStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { callHistory, getCallHistory } = useVideoCallStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);

  // Track unread counts and last message per user
  const [userMeta, setUserMeta] = useState({}); 
  // userMeta[userId] = { unread: number, lastMessage: string, lastTime: Date }

  useEffect(() => {
    getUsers();
    fetchGroups();
    getCallHistory();
  }, []);

  // Subscribe to incoming messages globally to update sidebar badges
  useEffect(() => {
    const handleNewMessage = (message) => {
      const currentSelectedUser = useMessageStore.getState().selectedUser;
      const senderId = message.senderId;

      // Only count as unread if the chat is not currently open
      if (!currentSelectedUser || currentSelectedUser._id !== senderId) {
        setUserMeta(prev => ({
          ...prev,
          [senderId]: {
            unread: (prev[senderId]?.unread || 0) + 1,
            lastMessage: message.text || (message.image ? '📷 Photo' : ''),
            lastTime: new Date(message.createdAt || Date.now()),
          }
        }));
      } else {
        // Chat is open — just update last message/time, no unread bump
        setUserMeta(prev => ({
          ...prev,
          [senderId]: {
            unread: 0,
            lastMessage: message.text || (message.image ? '📷 Photo' : ''),
            lastTime: new Date(message.createdAt || Date.now()),
          }
        }));
      }
    };

    // Subscribe using socket from the store
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.on('newMessage', handleNewMessage);
    }

    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
      }
    };
  }, []);

  // Clear unread when a user is selected
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserMeta(prev => ({
      ...prev,
      [user._id]: {
        ...prev[user._id],
        unread: 0,
      }
    }));
  };

  // Sort users: those with recent messages come first, then rest alphabetically
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const timeA = userMeta[a._id]?.lastTime || new Date(0);
      const timeB = userMeta[b._id]?.lastTime || new Date(0);
      return timeB - timeA; // Most recent first
    });
  }, [users, userMeta]);

  // Count missed calls from history
  const missedCallCount = (callHistory || []).filter(
    call => call.status === "missed" && call.direction === "incoming"
  ).length;

  // Format last message time
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <aside className="h-full w-20 lg:w-72 bg-[#0A0510] border-r border-purple-900/20 flex flex-col">

        {/* HEADER */}
        <div className="p-5 border-b border-purple-900/10 flex items-center justify-between">
          <h2 className="hidden lg:block text-purple-100 font-semibold">
            Chats
          </h2>

          <div className="flex items-center gap-2">

            {/* Call History Button with missed badge */}
            <button
              onClick={() => setShowCallHistory(true)}
              className="relative p-2 rounded-full hover:bg-purple-500/10 text-purple-400"
              title="Call History"
            >
              <Phone size={18} />
              {missedCallCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px]
                                  font-bold rounded-full w-5 h-5 flex items-center justify-center
                                  animate-pulse">
                  {missedCallCount}
                </span>
              )}
            </button>

            {/* Create Group Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-full hover:bg-purple-500/10 text-purple-400"
              title="Create Group"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* GROUPS */}
        <div className="px-2 py-3">
          <p className="hidden lg:block text-xs text-purple-400 mb-2">GROUPS</p>
          {groups.map(group => (
            <button
              key={group._id}
              onClick={() => setActiveGroup(group._id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition"
            >
              <img
                src={group.groupPic || react}
                className="size-10 rounded-full object-cover"
                alt={group.name}
              />
              <span className="hidden lg:block text-purple-100 truncate">
                {group.name}
              </span>
            </button>
          ))}
        </div>

        {/* USERS */}
        <div className="flex-1 overflow-y-auto px-2">
          <p className="hidden lg:block text-xs text-purple-400 my-2">DIRECT MESSAGES</p>

          {sortedUsers.map(user => {
            const meta = userMeta[user._id];
            const unread = meta?.unread || 0;
            const lastMessage = meta?.lastMessage || '';
            const lastTime = meta?.lastTime;
            const isSelected = selectedUser?._id === user._id;

            return (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${isSelected ? "bg-purple-600/10" : "hover:bg-white/5"}`}
              >
                {/* Avatar + Online dot */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePic || react}
                    className="size-10 rounded-full object-cover"
                    alt={user.Fullname}
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-2.5 bg-green-500
                                      rounded-full ring-2 ring-[#0A0510]" />
                  )}
                </div>

                {/* Name + last message preview (lg only) */}
                <div className="hidden lg:flex flex-col flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${unread > 0 ? 'text-white font-semibold' : 'text-purple-100'}`}>
                      {user.Fullname}
                    </span>
                    {lastTime && (
                      <span className={`text-[10px] flex-shrink-0 ml-1 ${unread > 0 ? 'text-purple-400' : 'text-purple-600'}`}>
                        {formatTime(lastTime)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <span className={`text-xs truncate ${unread > 0 ? 'text-purple-300' : 'text-purple-500'}`}>
                      {lastMessage || '\u00A0'}
                    </span>

                    {/* Unread badge */}
                    {unread > 0 && (
                      <span className="flex-shrink-0 ml-2 min-w-[18px] h-[18px] px-1
                                        bg-purple-500 text-white text-[10px] font-bold
                                        rounded-full flex items-center justify-center
                                        animate-[pop_0.2s_ease-out]">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile: just show unread dot */}
                {unread > 0 && (
                  <span className="lg:hidden absolute top-1 right-1 size-2.5 bg-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

      </aside>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <CallHistoryModal
        isOpen={showCallHistory}
        onClose={() => setShowCallHistory(false)}
      />

      {/* Pop animation keyframe */}
      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;