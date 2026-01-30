// import React from 'react'
// import NavBar from './NavBar.jsx';
// import { useMessageStore } from '../Store/UseMessageStore.js';
// import { Sidebar } from 'lucide-react';
// import Sidebars from '../Components/Sidebar.jsx';
// import ChatBox from '../Components/ChatBox.jsx';

// const HomePage = () => {
//     const { selectedUser } = useMessageStore();

//     return (
//         <div className="h-screen bg-base-200">
//             <div className="flex items-center justify-center pt-20 px-4">
//                 <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
//                     <div className="flex h-full rounded-lg overflow-hidden">
//                         <Sidebars />
//                          {selectedUser ? <ChatBox /> : <div className="flex-1 flex-col overflow-auto text-red-500 flex items-center justify-center">No user selected</div>}

//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default HomePage


import React from 'react';
import NavBar from './NavBar.jsx';
import { useMessageStore } from '../Store/UseMessageStore.js';
import { Sidebar } from 'lucide-react';
import Sidebars from '../Components/Sidebar.jsx';
import ChatBox from '../Components/ChatBox.jsx';

const HomePage = () => {
    const { selectedUser } = useMessageStore();

    return (
        /* This container is the key. 
           h-screen + flex-col + overflow-hidden 
           locks the NavBar at the top. 
        */
        <div className="h-screen w-full bg-[#050208] flex flex-col overflow-hidden">
            
            {/* 1. NavBar stays here, naturally at the top */}
            <NavBar />
            
            {/* 2. This area fills the rest of the screen */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar stays locked to the left */}
                <div className="h-full border-r border-white/5 flex-shrink-0">
                    <Sidebars />
                </div>

                {/* Main Chat Area. 
                   We use flex-1 and overflow-hidden here too 
                   so the ChatBox header doesn't scroll away. 
                */}
                <main className="flex-1 flex flex-col h-full bg-[#050208] min-w-0 overflow-hidden">
                    {selectedUser ? (
                        <ChatBox />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <div className="size-20 rounded-full border border-purple-500/10 flex items-center justify-center bg-purple-500/5">
                                <span className="text-3xl opacity-20">⚜</span>
                            </div>
                            <p className="text-sm font-medium tracking-[0.3em] text-zinc-500 uppercase">
                                Select a Contact
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default HomePage;