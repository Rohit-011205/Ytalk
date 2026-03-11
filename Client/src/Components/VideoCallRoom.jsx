// import React from "react";
// import {
//   LiveKitRoom,
//   GridLayout,
//   ParticipantTile,
//   RoomAudioRenderer,
//   ControlBar,
//   useTracks,
// } from "@livekit/components-react";
// import "@livekit/components-styles";
// import { Track } from "livekit-client";
// import { useVideoCallStore } from "../Store/useVideoCall.js";
// import { PhoneOff } from "lucide-react";

// // Inner component — has access to LiveKit room context
// function CallLayout({ onLeave }) {
//   const tracks = useTracks(
//     [
//       { source: Track.Source.Camera,      withPlaceholder: true },
//       { source: Track.Source.ScreenShare, withPlaceholder: false },
//     ],
//     { onlySubscribed: false }
//   );

//   return (
//     <div className="flex flex-col h-full">
      
//       {/* Video Grid — fills available space */}
//       <div className="flex-1 overflow-hidden">
//         <GridLayout
//           tracks={tracks}
//           style={{ height: "100%" }}
//         >
//           <ParticipantTile />
//         </GridLayout>
//       </div>

//       {/* Audio (invisible — just renders audio) */}
//       <RoomAudioRenderer />

//       {/* Controls bar at bottom */}
//       <div className="relative">
//         {/* LiveKit's built-in controls: mic, camera, screen share */}
//         <ControlBar
//           variation="minimal"
//           controls={{
//             microphone:  true,
//             camera:      true,
//             screenShare: true,
//             leave:       false, // We handle leave ourselves
//           }}
//         />
        
//         {/* Custom Leave/End button */}
//         <div className="flex justify-center pb-4">
//           <button
//             onClick={onLeave}
//             className="flex items-center gap-2 bg-red-500 hover:bg-red-600 
//                        text-white px-6 py-3 rounded-full font-medium
//                        transition-all duration-200 shadow-lg shadow-red-500/30
//                        hover:scale-105 mt-2"
//           >
//             <PhoneOff className="w-5 h-5" />
//             Leave Call
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// }

// // Outer wrapper — connects to LiveKit
// export default function VideoCallRoom() {
//   const { activeCall, outgoingCall, endCall } = useVideoCallStore();

//   // Only show room when call is active AND we have token
//   // outgoingCall still exists while waiting — we show both
//   // Once other person joins, outgoingCall becomes null
//   if (!activeCall) return null;

//   const { token, wsUrl } = activeCall;

//   const handleLeave = async () => {
//     await endCall();
//   };

//   return (
//     <div className="fixed inset-0 z-40 bg-gray-950">
//       <LiveKitRoom
//         token={token}
//         serverUrl={wsUrl}
//         connect={true}
//         video={true}
//         audio={true}
//         onDisconnected={handleLeave}
//         style={{ height: "100vh" }}
//     //      options={{
//     //     // Forces direct connection, skips region routing that causes the 401
//     //     publishDefaults: {
//     //         simulcast: false,  // simpler for localhost testing
//     //     },
//     //     adaptiveStream: false,
//     // }}
//       >
//         {/* Show waiting overlay on top of room while outgoing */}
//         {outgoingCall && (
//           <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/90">
//             <div className="text-center text-white">
//               <p className="text-lg">Waiting for others to join...</p>
//               <p className="text-gray-400 text-sm mt-1">You can start your camera while waiting</p>
//             </div>
//           </div>
//         )}

//         <CallLayout onLeave={handleLeave} />
//       </LiveKitRoom>
//     </div>
//   );
// }

import React from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useVideoCallStore } from "../Store/useVideoCall.js";
import { PhoneOff } from "lucide-react";

function CallLayout({ onLeave, isWaiting }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera,      withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  
  return (
    <div className="flex flex-col h-full bg-gray-950">

      {/* Small waiting banner — does NOT block anything */}
      {isWaiting && (
        <div className="flex items-center justify-center gap-2 py-2 bg-blue-900/40 border-b border-blue-500/20">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <p className="text-white text-sm">Waiting for others to join...</p>
        </div>
      )}

      {/* Video grid — always fully visible */}
      <div className="flex-1 overflow-hidden">
        <GridLayout tracks={tracks} style={{ height: "100%" }}>
          <ParticipantTile />
        </GridLayout>
      </div>

      <RoomAudioRenderer />

      {/* Controls — always at bottom, never blocked */}
      {/* Controls — Fixed at the bottom */}
<footer className="bg-gray-900 border-t border-white/10 py-4 px-6 z-50000 position-relative">
  <div className="max-w-screen-md mx-auto">
    <ControlBar
      variation="minimal"
      controls={{
        microphone: true,
        camera: true,
        screenShare: true,
        leave: false,
      }}
    />
    <div className="flex justify-center mt-4">
      <button
        onClick={onLeave}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 
                   text-white px-8 py-2.5 rounded-full font-semibold 
                   transition-all shadow-lg active:scale-95"
      >
        <PhoneOff className="w-5 h-5" />
        End Call
      </button>
    </div>
  </div>
</footer>

    </div>
  );
}

export default function VideoCallRoom() {
  const { activeCall, outgoingCall, endCall } = useVideoCallStore();

  if (!activeCall) return null;

  const { token, wsUrl } = activeCall;

  return (
    <div className="fixed inset-0 z-40 bg-gray-950">
      <LiveKitRoom
        token={token}
        serverUrl={wsUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={async () => await endCall()}
        style={{ height: "100vh" }}
        options={{
          publishDefaults: { simulcast: false,
            videoCodec: 'vp8',
           },
          adaptiveStream:  false,
          // reconnectPolicy: { maxRetries: 3 },
        }}
      >
        <CallLayout
          onLeave={async () => await endCall()}
          isWaiting={!!outgoingCall}
        />
      </LiveKitRoom>
    </div>
  );
}