import { AccessToken,TrackSource } from "livekit-server-sdk";
import VideoCall from "../Models/video-call.model.js";
import { v4 as uuidv4 } from "uuid";
import Group from "../Models/group.model.js";
import { emitToUser } from "../lib/socket.io.js";

const generateLiveKitToken = async (roomName, participant, identity) => {
    const at = new AccessToken(process.env.LK_API_KEY, process.env.LK_API_SECRET, {
        identity: identity.toString(),
        name: participant.Fullname,
    })

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
    //    canPublishSources: ["camera", "microphone", "screen_share"],
    // canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE],
    })

    return await at.toJwt();
}


export const initiateCall = async (req, res) => {
    try {
        const { receiverId, groupId, callType } = req.body;
        const createdBy = req.user._id;
        const callerName = req.user.Fullname;
        const callerProfilePic = req.user.profilePic;
        const callerId = req.user._id;

        console.log("📥 req.body:", req.body);  // Add this
        console.log("👤 req.user:", req.user._id);  // Add this
        console.log("🌐 Env LK_API_KEY:", !!process.env.LK_API_KEY);

        if (!receiverId && !groupId) {
            return res.status(400).json({
                message: "Must specify either receiverId or groupId"
            })
        }

        if (!callType) {
            return res.status(400).json({
                message: "Must specify call type"
            })
        }
        if (callType === "direct" && !receiverId) {
            return res.status(400).json({ message: "receiverId required for direct call" });
        }
        if (callType === "group" && !groupId) {
            return res.status(400).json({ message: "groupId required for group call" });
        }

        let roomName;
        if (callType === "direct") {
            const sorted = [createdBy.toString(), receiverId].sort();
            roomName = `direct_${sorted[0]}_${sorted[1]}_${Date.now()}`;
        }
        else {
            roomName = `group_${groupId}_${Date.now()}`;
        }


        let alreadyActive;

        if (callType === "direct") {
            alreadyActive = await VideoCall.findOne({
                status: { $in: ["ringing", "active"] },
                initiatedBy: { $in: [callerId, receiverId] },
                receiverId: { $in: [callerId, receiverId] },
            });
        } else { // group
            alreadyActive = await VideoCall.findOne({
                status: { $in: ["ringing", "active"] },
                groupId,
                initiatedBy: callerId,
            });
        }

        if (alreadyActive) {
            return res.status(400).json({ message: "A call is already in progress with these participants" });
        }


        const newCall = await VideoCall.create({
            roomName,
            callType,
            initiatedBy: createdBy,
            receiverId: callType === "direct" ? receiverId : null,
            groupId: callType === "group" ? groupId : null,
            participants: [createdBy],
            status: "ringing",
        })

        const callerToken = await generateLiveKitToken(roomName, req.user, callerId.toString());

        const callerInfo = {
            userId: createdBy,
            Fullname: callerName,
            profilePic: callerProfilePic,
        }

        if (callType === "direct") {
            emitToUser(receiverId, "incomingCall", {
                callId: newCall._id,
                roomName,
                callType: "direct",
                caller: callerInfo,
            })
        }
        else {
            const group = await Group.findById(groupId).populate("members", "_id");

            if (!group) {
                return res.status(404).json({ message: "Group not found" });
            }

            for (const member of group.members) {
                if (member._id.toString() === createdBy.toString()) {
                    continue;
                }
                emitToUser(member._id, "incomingGroupCall", {
                    callId: newCall._id,
                    roomName,
                    callType: "group",
                    groupId,
                    groupName: group.name,
                    caller: callerInfo,
                })
            }
        }
        res.status(201).json({
            callId: newCall._id,
            roomName,
            token: callerToken,
            wsUrl: process.env.LK_WS_URL,
        });
    } catch (error) {
        console.error('Error initiating call Controller:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/////
// controllers/call.controller.js - ADD THIS EXPORT
export const testToken = async (req, res) => {
    try {
        const testRoom = `test_${Date.now()}`;
        const token = await generateLiveKitToken(testRoom, req.user, req.user._id);

        console.log("✅ LK_API_KEY exists:", !!process.env.LK_API_KEY);
        console.log("✅ LK_API_SECRET exists:", !!process.env.LK_API_SECRET);
        console.log("✅ Generated token:", token.substring(0, 50) + "...");

        res.json({
            token,
            room: testRoom,
            wsUrl: process.env.LK_WS_URL,
            envCheck: {
                apiKey: !!process.env.LK_API_KEY,
                apiSecret: !!process.env.LK_API_SECRET,
                wsUrl: !!process.env.LK_WS_URL
            }
        });
    } catch (error) {
        console.error("Token test error:", error);
        res.status(500).json({ error: error.message });
    }
};


export const acceptCall = async (req, res) => {
    try {
        const { callId } = req.body;
        const userId = req.user._id;
        const username = req.user.Fullname;

        const call = await VideoCall.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" })
        }

        if (["ended", "rejected", "cancelled", "missed"].includes(call.status)) {
            return res.status(400).json({ message: "Call is no longer active" })
        }


        call.status = "active";
        call.startedAt = new Date();

        const alreadyParticipant = call.participants.some(p => p.toString() === userId.toString());

        if (!alreadyParticipant) {
            call.participants.push(userId);
        }

        await call.save();


        const token = await generateLiveKitToken(call.roomName, req.user, userId.toString());

        emitToUser(call.initiatedBy, "callAccepted", {
            callId: call._id,
            roomName: call.roomName,
            acceptedBy: {
                userId,
                Fullname: username,
            },

        })

        res.status(200).json({
            callId: call._id,
            roomName: call.roomName,
            token,
            wsUrl: process.env.LK_WS_URL,
        })
    } catch (error) {
        console.error("Error in acceptCall controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const declineCall = async (req, res) => {
    try {
        const { callId } = req.body;
        const userId = req.user._id;
        const username = req.user.Fullname;

        const call = await VideoCall.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" })
        }

        call.status = "declined";
        call.endedAt = new Date();
        await call.save();

        emitToUser(call.initiatedBy, "callDeclined", {
            callId,
            declinedBy: {
                _id: userId,
                Fullname: username,
            },
        });

        res.status(200).json({ message: "Call declined" });
    } catch (error) {
        console.error("Error declining call controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const cancelCall = async (req, res) => {
    try {
        const { callId } = req.body;
        const userId = req.user._id;

        const call = await VideoCall.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" })
        }

        if (call.initiatedBy.toString() !== userId.toString() && call.callType !== "direct") {
            return res.status(403).json({ message: "Only the caller can cancel" });
        }

        call.status = "cancelled";
        call.endedAt = new Date();
        await call.save();

        if (call.callType === "direct") {
            emitToUser(call.receiverId, "callCancelled", { callId });

        } else {
            const group = await Group.findById(call.groupId).populate("members", "_id");
            if (group) {
                for (const member of group.members) {
                    if (member._id.toString() === userId.toString()) continue;
                    emitToUser(member._id, "callCancelled", { callId });
                }
            }
        }
        res.status(200).json({ message: "Call cancelled" });

    } catch (error) {
        console.error("Error cancelling call controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const endCall = async (req, res) => {
    try {
        // const { roomId } = req.params;
        const { callId } = req.body;
        const userId = req.user._id;
        const username = req.user.Fullname;

        const call = await VideoCall.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" })
        }

        call.status = "ended";
        call.endedAt = new Date();
        await call.save();

        for (const participantId of call.participants) {
            if (participantId.toString() === userId.toString()) continue;
            emitToUser(participantId, "callEnded", {
                callId: call._id,
                endedBy: { _id: userId, Fullname: username },
            });
        }

        res.status(200).json({ message: "Call ended successfully" });

    } catch (error) {
        console.error("Error ending call controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getCallHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const calls = await VideoCall.find({
            $or: [
                { initiatedBy: userId },
                { receiverId: userId },
                { participants: userId },
            ],
        })
            .populate("initiatedBy", "Fullname profilePic")
            .populate("receiverId", "Fullname profilePic")
            .populate("groupId", "name groupPic")
            .sort({ createdAt: -1 })
            .limit(100);

        // Tag each call with direction from this user's perspective
        const result = calls.map((call) => {
            const obj = call.toObject();
            const isCaller = call.initiatedBy._id.toString() === userId.toString();
            obj.direction = isCaller ? "outgoing" : "incoming";
            return obj;
        });

        res.status(200).json(result);

    } catch (error) {
        console.error("Error in getCallHistory controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};