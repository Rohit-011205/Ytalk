// // import React from 'react'
// // import NavBar from './NavBar.jsx';
// // import { useMessageStore } from '../Store/UseMessageStore.js';
// // import { Sidebar } from 'lucide-react';
// // import Sidebars from '../Components/Sidebar.jsx';
// // import ChatBox from '../Components/ChatBox.jsx';

// // const HomePage = () => {
// //     const { selectedUser } = useMessageStore();

// //     return (
// //         <div className="h-screen bg-base-200">
// //             <div className="flex items-center justify-center pt-20 px-4">
// //                 <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
// //                     <div className="flex h-full rounded-lg overflow-hidden">
// //                         <Sidebars />
// //                          {selectedUser ? <ChatBox /> : <div className="flex-1 flex-col overflow-auto text-red-500 flex items-center justify-center">No user selected</div>}

// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     )
// // }

// // export default HomePage


// import React from 'react';
// import NavBar from './NavBar.jsx';
// import { useMessageStore } from '../Store/UseMessageStore.js';
// import { Sidebar } from 'lucide-react';
// import Sidebars from '../Components/Sidebar.jsx';
// import ChatBox from '../Components/ChatBox.jsx';
// import { useGroupStore } from '../Store/useGroupStore.js';
// import { useEffect } from 'react';
// import GroupChat from '../Components/GroupChat.jsx';

// const HomePage = () => {
//     const { selectedUser } = useMessageStore();

//     const { activeGroup } = useGroupStore();

//     useEffect(() => {
//         console.log("Active group changed:", activeGroup);
//     }, [activeGroup]);

//     return (
//         /* This container is the key. 
//            h-screen + flex-col + overflow-hidden 
//            locks the NavBar at the top. 
//         */
//         <div className="h-screen w-full bg-[#050208] flex flex-col overflow-hidden">

//             {/* 1. NavBar stays here, naturally at the top */}
//             <NavBar />

//             {/* 2. This area fills the rest of the screen */}
//             <div className="flex flex-1 overflow-hidden">

//                 {/* Sidebar stays locked to the left */}
//                 <div className="h-full border-r border-white/5 flex-shrink-0">
//                     <Sidebars />
//                 </div>

//                 {/* Main Chat Area. 
//                    We use flex-1 and overflow-hidden here too 
//                    so the ChatBox header doesn't scroll away. 
//                 */}
//                 <main className="flex-1 flex flex-col h-full bg-[#050208] min-w-0 overflow-hidden">
//                     {selectedUser ? (
//                         <ChatBox />
//                     ) : activeGroup ? (
//                         <GroupChat />
//                     ) : (
//                         <div className="flex-1 flex flex-col items-center justify-center">
//                             <p className="text-zinc-500">Select a chat</p>
//                         </div>
//                     )}

//                 </main>
//             </div>
//         </div>
//     );
// }

// export default HomePage;



// HomePage.jsx
import React from 'react';
import NavBar from './NavBar.jsx';
import { useMessageStore } from '../Store/UseMessageStore.js';
import Sidebars from '../Components/Sidebar.jsx';
import ChatBox from '../Components/ChatBox.jsx';
import { useGroupStore } from '../Store/useGroupStore.js';
import GroupChat from '../Components/GroupChat.jsx';

const HomePage = () => {
    const { selectedUser } = useMessageStore();
    const { activeGroup } = useGroupStore();

    // Check if any chat is currently active
    const isChatOpen = !!(selectedUser || activeGroup);

    return (
        <div className="h-screen w-full bg-[#050208] flex flex-col overflow-hidden">
            <NavBar />

            <div className="flex flex-1 overflow-hidden relative">
                
                {/* SIDEBAR CONTAINER 
                    Logic: If a chat is open on mobile, we hide the sidebar container entirely.
                */}
                <div className={`h-full border-r border-white/5 flex-shrink-0 w-full lg:w-auto 
                    ${isChatOpen ? "hidden lg:block" : "block"}`}>
                    <Sidebars />
                </div>

                {/* MAIN CHAT AREA 
                    Logic: If NO chat is open on mobile, we hide the main area so only sidebar shows.
                */}
                <main className={`flex-1 flex flex-col h-full bg-[#050208] min-w-0 overflow-hidden
                    ${!isChatOpen ? "hidden lg:flex" : "flex"}`}>
                    
                    {selectedUser ? (
                        <ChatBox />
                    ) : activeGroup ? (
                        <GroupChat />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <p className="text-zinc-500">Select a chat to start messaging</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default HomePage;