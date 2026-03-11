// import express from "express"
// import { protectRoute } from "../Middlewares/auth.middleware.js"
// import {
//     startCall,
//     endCall,
//     answerCall,
//     leaveCall,
//     rejectCall,
//     getCallDetails,
//     getMissedCalls,
//     getActiveCalls,
//     markMissedCallViewed,
//     getCallHistory,
// } from "../Controllers/videoCall.controller.js"

// const router = express.Router();

// router.post('/start', protectRoute, startCall);
// router.patch('/missed/:missedCallId/viewed', protectRoute, markMissedCallViewed);
// router.post('/answer/:callId', protectRoute, answerCall);
// router.post('/end/:roomId', protectRoute, endCall);
// router.post('/reject/:callId', protectRoute, rejectCall);
// router.get('/missed', protectRoute, getMissedCalls);
// router.get('/active', protectRoute, getActiveCalls);
// router.post('/leave/:roomId', protectRoute, leaveCall);
// router.get('/details/:roomId', protectRoute, getCallDetails);
// router.get('/history', protectRoute, getCallHistory);

// export default router

// import express from "express"
// import { protectRoute } from "../Middlewares/auth.middleware.js"

// import {
//     initiateCall,
//     endCall, acceptCall, declineCall, cancelCall, getCallHistory,
// } from "../Controllers/videoCall.controller.js"


// const router = express.Router();

// router.post("/initiate", protectRoute, initiateCall);
// router.post("/accept/:callId", protectRoute, acceptCall);
// router.post("/decline/:callId", protectRoute, declineCall);
// router.post("/end/:roomId", protectRoute, endCall);
// router.post("/cancel/:callId", protectRoute, cancelCall);
// router.get("/history", protectRoute, getCallHistory);

// export default router


import express from "express";
import { protectRoute } from "../Middlewares/auth.middleware.js";
import {
  initiateCall, acceptCall, declineCall,
  cancelCall, endCall, getCallHistory,testToken
} from "../Controllers/videoCall.controller.js";

const router = express.Router();

router.post("/initiate", protectRoute, initiateCall);
router.post("/accept",   protectRoute, acceptCall);    // NO :callId
router.post("/decline",  protectRoute, declineCall);   // NO :callId
router.post("/cancel",   protectRoute, cancelCall);    // NO :callId
router.post("/end",      protectRoute, endCall);       // NO :roomId
router.get("/history",   protectRoute, getCallHistory);
router.get("/test-token", protectRoute, testToken);

// routes/call.routes.js - TEMPORARY TEST


export default router;