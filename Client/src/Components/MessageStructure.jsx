// import React from 'react';




// const MessageStructure = () => {
//     // Create an array of 6 items for skeleton messages
//     const skeletonMessages = Array(6).fill(null);

//     return (
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {skeletonMessages.map((_, idx) => (
//                 <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
//                     <div className="chat-image avatar">
//                         <div className="size-10 rounded-full">
//                             <div className="skeleton w-full h-full rounded-full" />
//                         </div>
//                     </div>

//                     <div className="chat-header mb-1">
//                         <div className="skeleton h-4 w-16" />
//                     </div>

//                     <div className="chat-bubble bg-transparent p-0">
//                         <div className="skeleton h-16 w-[200px]" />
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default MessageStructure;

import React from 'react';

const MessageStructure = () => {
    const skeletonMessages = Array(6).fill(null);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
            {skeletonMessages.map((_, idx) => {
                const isEven = idx % 2 === 0;
                return (
                    <div 
                        key={idx} 
                        className={`flex ${isEven ? "justify-start" : "justify-end"} items-end gap-3`}
                    >
                        {/* Avatar Skeleton */}
                        {isEven && (
                            <div className="size-8 rounded-full bg-[#1A1422] animate-pulse" />
                        )}

                        <div className={`flex flex-col gap-2 max-w-[70%] ${isEven ? "items-start" : "items-end"}`}>
                            {/* Name/Time Header Skeleton */}
                            <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />

                            {/* Message Bubble Skeleton */}
                            <div className={`
                                h-12 w-[180px] sm:w-[240px] rounded-2xl
                                ${isEven 
                                    ? "bg-[#130C1A] rounded-tl-none border border-purple-900/10" 
                                    : "bg-purple-900/20 rounded-tr-none"} 
                                animate-pulse shadow-sm
                            `} />
                        </div>

                        {!isEven && (
                            <div className="size-8 rounded-full bg-[#1A1422] animate-pulse" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MessageStructure;