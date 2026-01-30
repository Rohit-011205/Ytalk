// import React from 'react'
// import { useEffect } from 'react';
// import ChatHeader from './ChatHeader.jsx';
// import MessageInput from './MessageInput';
// import { useMessageStore } from '../Store/UseMessageStore.js';
// import MessageStructure from './MessageStructure.jsx';
// import { useAuthStore } from '../Store/useAuthStore.js';
// import react from "../assets/react.svg";

//     const ChatBox = () => {

//         const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();

//         const { authUser } = useAuthStore();

//         if (!authUser) return null;


//         useEffect(() => {
//             if (!selectedUser) return;

//             getMessages(selectedUser._id);

//             subscribeToMessages();

//             return () => {
//                 unsubscribeFromMessages();
//             }
//         }, [selectedUser, getMessages]);

//         if (!selectedUser) {
//             return (
//                 <div className="flex-1 flex items-center justify-center text-zinc-400">
//                     Select a conversation to start chatting
//                 </div>
//             );
//         }

//         if (isMessagesLoading) {
//             return <div className="flex-1 flex flex-col overflow-auto">
//                 <ChatHeader />
//                 <MessageStructure />
//                 <MessageInput />
//             </div>
//         }



//         return (
//             <div className='flex flex-1 flex-col overflow-auto'>

//                 <ChatHeader />

//                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                     {messages.map((message) => (
//                         <div
//                             key={message._id}

//                             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}

//                         //  ref={messageEndRef}
//                         >
//                             <div className="chat-image avatar">
//                                 <div className="size-1 rounded-full">
//                                     <img
//                                         src={message.senderId === authUser._id ? authUser.profilePic || react : selectedUser?.profilePic || react}

//                                         alt='profilePic'
//                                     />

//                                 </div>

//                             </div>

//                             <div className="chat-header mb-1">
//                                 <time className='text-xs opacity-50 ml-1'>
//                                     {message.createdAt}
//                                 </time>
//                             </div>
//                             <div className="chat-bubble flex flex-col">
//                                 {message.image && (
//                                     <img
//                                         src={message.image}
//                                         alt="message attachment"
//                                         className='sm:max-w-[200px] rounded-md mb-2'

//                                     />
//                                 )}
//                                 {message.text && <p>{message.text}</p>}
//                             </div>
//                         </div>
//                     ))}
//                     <MessageInput />
//                 </div>
//             </div>
//         )
//     }

// export default ChatBox


import React, { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput";
import { useMessageStore } from "../Store/UseMessageStore.js";
import { useAuthStore } from "../Store/useAuthStore.js";

const ChatBox = () => {
    const { messages, getMessages, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
    const { authUser } = useAuthStore();
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!selectedUser?._id) return;

        getMessages(selectedUser._id);

        subscribeToMessages();

        return () => {
            unsubscribeFromMessages();
        }
    }, [selectedUser, getMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-1 flex-col h-full overflow-hidden">
            <ChatHeader />

            {/* Independent Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-8 custom-scrollbar bg-[#050208]">
                {messages.map((message) => {
                    const isMe = message.senderId === authUser._id;
                    return (
                        <div key={message._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`flex flex-col max-w-[80%] lg:max-w-[450px] ${isMe ? "items-end" : "items-start"}`}>
                                {message.image && (
                                    <img src={message.image} className="rounded-2xl border border-white/5 shadow-2xl mb-2 max-w-[280px]" alt="attachment" />
                                )}
                                {message.text && (
                                    <div className={`px-4 py-2 rounded-2xl text-[14px] leading-relaxed shadow-sm
                    ${isMe ? "bg-purple-600 text-white rounded-tr-none" : "bg-[#110c18] border border-white/5 text-purple-50 rounded-tl-none"}
                  `}>
                                        {message.text}
                                    </div>
                                )}
                                <span className="mt-1 text-[9px] text-zinc-600 uppercase tracking-widest font-medium">
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="px-4 py-4 bg-[#050208]">
                <MessageInput />
            </div>
        </div>
    );
};

export default ChatBox;