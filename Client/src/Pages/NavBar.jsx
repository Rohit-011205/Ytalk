import React from 'react';
import { useAuthStore } from '../Store/useAuthStore.js';
import { Link } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const NavBar = () => {
    const { logout, authUser } = useAuthStore();

    return (
        <header className="h-16 border-b border-white/5 bg-[#0A0510] shrink-0 z-20 px-6">
            <div className="flex items-center justify-between h-full w-full">
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
  <div className="size-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
    <MessageSquare className="w-4 h-4 text-white" />
  </div>
  {/* Apply the font-logo class here */}
  <h1 className="text-sm font-logo font-bold text-purple-50 uppercase">Ytalk</h1>
</Link>
                </div>

                <div className="flex items-center gap-1 sm:gap-4">
                    <Link to="/settings" className="p-2 text-zinc-400 hover:text-purple-400 transition-colors">
                        <Settings size={18} />
                    </Link>

                    {authUser && (
                        <>
                            <Link to="/profile" className="p-2 text-zinc-400 hover:text-purple-400 transition-colors">
                                <User size={18} />
                            </Link>
                            <button
                                onClick={logout}
                                className="ml-2 p-2 text-zinc-500 hover:text-red-400 transition-colors border-l border-white/10 pl-4"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default NavBar;