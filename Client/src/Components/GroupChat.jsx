import React, { useEffect, useRef, useState } from "react"; // 1. Added useState
import { useGroupStore } from "../Store/useGroupStore.js";
import { useAuthStore } from "../Store/useAuthStore.js";
import { useVideoCallStore } from "../Store/useVideoCall.js";
import reactLogo from "../assets/react.svg";
import { Video, Info } from "lucide-react"; // 2. Added Info icon
import GroupSettingModal from "./GroupSettingModal"; // 3. Import the modal

const GroupChat = () => {
    const {
        activeGroup,
        groupMessages,
        fetchGroupMessages,
        sendGroupMessage,
        subscribeToGroupMessages,
        unsubscribeFromGroupMessages,
    } = useGroupStore();

    const { authUser } = useAuthStore();
    const bottomRef = useRef(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 4. Modal state

    const { initiateCall, activeCall } = useVideoCallStore();

    const handleGroupVideoCall = () => {
        if (!activeGroup?._id) return;
        initiateCall("group", null, activeGroup._id, {
            _id: activeGroup._id,
            Fullname: activeGroup.name,
            profilePic: null,
            isGroup: true,
            memberCount: activeGroup.members?.length,
        });
    };

    useEffect(() => {
        if (activeGroup?._id) {
            fetchGroupMessages(activeGroup._id);
        }
    }, [activeGroup, fetchGroupMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [groupMessages]);

    useEffect(() => {
        subscribeToGroupMessages();
        return () => {
            unsubscribeFromGroupMessages();
        };
    }, [activeGroup]);

    if (!activeGroup) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-500 bg-[#050208]">
                Select a group to start communicating
            </div>
        );
    }

    const handleSendMessage = (e) => {
        e.preventDefault();
        const text = e.target.message.value;
        if (!text.trim()) return;
        sendGroupMessage(activeGroup._id, text);
        e.target.reset();
    };

    return (
        <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#050208]">
            {/* GROUP HEADER */}
            <div className="border-b border-white/5 px-6 py-4 bg-[#050208]/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/20 text-purple-400 font-bold">
                        {activeGroup.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-white font-semibold tracking-tight">
                            {activeGroup.name}
                        </h2>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                            {activeGroup.members?.length || 0} Members
                        </p>
                    </div>

                    {/* Header Actions Container */}
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={handleGroupVideoCall}
                            disabled={!!activeCall}
                            title={activeCall ? "Already in a call" : "Start group video call"}
                            className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 
                                       border border-purple-500/20 text-purple-400 
                                       hover:text-purple-300 transition-all
                                       disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Video className="size-5" />
                        </button>

                        {/* 5. SETTINGS TRIGGER BUTTON */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 
                                       border border-white/10 text-zinc-400 
                                       hover:text-white transition-all"
                        >
                            <Info className="size-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6 custom-scrollbar">
                {groupMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-20">
                        <p className="text-white text-sm italic">Beginning of the conversation</p>
                    </div>
                ) : (
                    groupMessages.map((msg) => {
                        const isMe = msg.senderId?._id === authUser._id;
                        return (
                            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`flex gap-3 max-w-[85%] lg:max-w-[500px] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className="flex-shrink-0">
                                        <img
                                            src={msg.senderId?.profilePic || reactLogo}
                                            alt="avatar"
                                            className="size-8 rounded-full border border-white/10 object-cover"
                                        />
                                    </div>
                                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        {!isMe && (
                                            <span className="text-[11px] font-medium text-purple-400 mb-1 ml-1">
                                                {msg.senderId?.Fullname || "Unknown User"}
                                            </span>
                                        )}
                                        <div className={`px-4 py-2 rounded-2xl text-[14px] leading-relaxed shadow-sm
                                            ${isMe
                                                ? "bg-purple-600 text-white rounded-tr-none"
                                                : "bg-[#110c18] border border-white/5 text-purple-50 rounded-tl-none"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="mt-1 text-[9px] text-zinc-600 uppercase tracking-widest font-medium">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* INPUT AREA */}
            <div className="px-4 py-6 bg-[#050208] border-t border-white/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        name="message"
                        placeholder={`Message ${activeGroup.name}...`}
                        className="flex-1 bg-[#110c18] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* 6. RENDER THE SETTINGS MODAL */}
            <GroupSettingModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
};

export default GroupChat;