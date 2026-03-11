// lib/livekit.js - FIXED
import { AccessToken } from 'livekit-server-sdk';

export const createLivekitToken = (userId, roomName) => {
  const at = new AccessToken(
    process.env.LK_API_KEY,
    process.env.LK_API_SECRET,
    { identity: userId.toString() }
  );

  // ✅ FULL PERMISSIONS - FIXES trackID: undefined
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,        // ✅ Camera/mic
    canPublishSources: ["camera", "mic", "screen_share"], // ✅ Screenshare
    canSubscribe: true,
    canUpdateOwnMetadata: true
  });

  return at.toJwt();
};
