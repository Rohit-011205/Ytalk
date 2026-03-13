import React, { useState } from "react";
import { useGroupStore } from "../Store/useGroupStore";
import { useAuthStore } from "../Store/useAuthStore";
import { X, UserPlus, UserMinus, ShieldCheck, Trash2 } from "lucide-react";

const GroupSettingsModal = ({ isOpen, onClose }) => {
    const { activeGroup, allUsers, addMembers, removeMember, deleteGroup, fetchAllUsers } = useGroupStore();
    const { authUser } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);

    if (!isOpen || !activeGroup) return null;

    // Check if current user is an admin based on your Group Model
    const isAdmin = activeGroup.admins?.some(id => 
        (typeof id === 'string' ? id : id._id) === authUser._id
    );

    const isCreator = (activeGroup.createdBy?._id || activeGroup.createdBy) === authUser._id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0b0712] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)]">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-white font-bold text-lg">Group Intelligence</h3>
                        <p className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold">Management Console</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <X size={20}/>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Visual Branding */}
                    <div className="flex flex-col items-center text-center">
                        <div className="size-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-900 p-[1px] shadow-lg mb-4">
                            <div className="w-full h-full bg-[#0b0712] rounded-[15px] flex items-center justify-center text-3xl font-black text-white">
                                {activeGroup.name.charAt(0)}
                            </div>
                        </div>
                        <h2 className="text-2xl text-white font-bold tracking-tight">{activeGroup.name}</h2>
                        <p className="text-zinc-500 text-sm mt-1">{activeGroup.description || "No description provided"}</p>
                    </div>

                    {/* Member Management */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Current Operatives ({activeGroup.members?.length})</h4>
                            {isAdmin && (
                                <button 
                                    onClick={() => { setIsAdding(!isAdding); fetchAllUsers(); }}
                                    className="px-3 py-1 rounded-full bg-purple-600/10 text-purple-400 text-[11px] font-bold border border-purple-600/20 hover:bg-purple-600/20 transition-all flex items-center gap-1"
                                >
                                    <UserPlus size={12}/> Recruit
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                            {activeGroup.members?.map((member) => {
                                const memberId = member._id || member;
                                const isMemberAdmin = activeGroup.admins?.some(a => (a._id || a) === memberId);

                                return (
                                    <div key={memberId} className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={member.profilePic || "/avatar.png"} className="size-9 rounded-xl object-cover border border-white/10" />
                                                {isMemberAdmin && <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-0.5 border border-[#0b0712]"><ShieldCheck size={10} className="text-white"/></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm text-zinc-200 font-medium">{member.Fullname}</p>
                                                <p className="text-[10px] text-zinc-500">{isMemberAdmin ? "Administrator" : "Member"}</p>
                                            </div>
                                        </div>
                                        
                                        {isAdmin && memberId !== authUser._id && (
                                            <button 
                                                onClick={() => removeMember(activeGroup._id, memberId)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                            >
                                                <UserMinus size={16}/>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Add Member Section */}
                    {isAdding && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 p-4 bg-purple-600/5 border border-purple-500/20 rounded-2xl">
                            <p className="text-[10px] font-bold text-purple-400 uppercase mb-3">Available for Recruitment</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                {allUsers
                                    .filter(u => !activeGroup.members.some(m => (m._id || m) === u._id))
                                    .map(user => (
                                        <div key={user._id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-xl">
                                            <span className="text-sm text-zinc-300">{user.Fullname}</span>
                                            <button onClick={() => addMembers(activeGroup._id, user._id)} className="text-purple-400 hover:scale-110 transition-transform"><UserPlus size={18}/></button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    {(isCreator || isAdmin) && (
                        <div className="pt-4 border-t border-white/5">
                            <button 
                                onClick={() => { if(window.confirm("Terminate this group?")) deleteGroup(activeGroup._id); }}
                                className="w-full py-3 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14}/> TERMINATE GROUP
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupSettingsModal;