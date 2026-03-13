import React from 'react';
import { useAuthStore } from '../Store/useAuthStore.js';
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";

const NavBar = () => {
    const { logout, authUser } = useAuthStore();

    const handleLogout = () => {
        // High-visibility console warning for developer tracking
        console.warn("%c[Ytalk System]: Termination of session initiated.", "color: #ef4444; font-weight: bold; font-size: 12px;");
        
        const confirmed = window.confirm("Are you sure you want to log out from Ytalk?");
        if (confirmed) {
            logout();
        } else {
            console.log("%c[Ytalk System]: Logout aborted.", "color: #10b981; font-weight: bold;");
        }
    };

    return (
        <header className="h-16 border-b border-white/5 bg-[#0A0510] shrink-0 z-20 px-8">
            <div className="flex items-center justify-between h-full w-full">
                
                {/* LOGO SECTION - Matches your new visual identity */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-3 group transition-all">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-[#1a1625] to-[#08070B] 
                                      border border-violet-500/20 flex items-center justify-center 
                                      shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]
                                      group-hover:border-violet-500/40 transition-colors">
                            <span className="text-violet-200 font-light text-xl tracking-tighter">Y</span>
                        </div>
                        <h1 className="text-xs font-bold text-violet-100 tracking-[0.3em] uppercase">
                            Ytalk
                        </h1>
                    </Link>
                </div>

                {/* ACTIONS SECTION */}
                <div className="flex items-center gap-3">
                    {authUser && (
                        <>
                            {/* Profile Link - Subtle and Clean */}
                            <Link 
                                to="/profile" 
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-violet-300/60 
                                           hover:text-violet-100 hover:bg-white/5 transition-all"
                            >
                                <User size={18} />
                                <span className="hidden sm:block text-[11px] font-medium tracking-wide uppercase">Account</span>
                            </Link>

                            {/* Divider */}
                            <div className="h-4 w-[1px] bg-white/10 mx-1" />

                            {/* Logout - Redesigned as a Premium Action */}
                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-2 px-4 py-1.5 rounded-lg 
                                           border border-transparent hover:border-red-500/20 
                                           hover:bg-red-500/5 transition-all duration-300"
                                title="Exit Session"
                            >
                                <span className="hidden sm:block text-[10px] font-bold text-zinc-500 
                                               group-hover:text-red-400 tracking-widest uppercase transition-colors">
                                    Logout
                                </span>
                                <div className="p-1 rounded-md text-zinc-500 group-hover:text-red-400 
                                              group-hover:bg-red-400/10 transition-all">
                                    <LogOut size={16} />
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default NavBar;