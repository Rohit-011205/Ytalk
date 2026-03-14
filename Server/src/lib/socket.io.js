import { Server } from "socket.io"
import http from "http"
import express from "express"
// import videoCallManager from "./videoCallManager.js"
import VideoCall from "../Models/video-call.model.js"

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", process.env.CLIENT_URL],
        credentials: true,
    }
})

const userSocketMap = {};

// export function getReceiverSocketId(userId) {
//     return userSocketMap[userId]
// }

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
        ? Array.from(userSocketMap[userId])
        : [];
}
export const emitToUser = (userId, event, data) => {
    const socketIds = getReceiverSocketId(userId);
    if (socketIds.length > 0) {
        socketIds.forEach(socketId => {
            io.to(socketId).emit(event, data);
        });
        console.log(`📤 Emitted ${event} to user ${userId} (${socketIds.length} sockets)`);
    } else {
        console.log(`⚠️ No sockets found for user ${userId}`);
    }
};


io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    const userId = socket.handshake.query.userId;

    // if (userId) {
    //     userSocketMap[userId] = socket.id;
    // }
    if (userId) {
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = new Set();
        }
        userSocketMap[userId].add(socket.id);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("joinGroup", (groupId) => {
        socket.join(`group-${groupId}`)
        console.log(`User joined group ${groupId}`);

        io.to(`group-${groupId}`).emit("userJoinedGroup", { userId });
    })

    socket.on("leaveGroup", (groupId) => {
        socket.leave(`group-${groupId}`);
        console.log(`User left group ${groupId}`);
        io.to(`group-${groupId}`).emit("userLeftGroup", { userId });
    })

    //MISSED CALL TIMER

    socket.on("startMissedCallTimer", ({ callId, callType, receiverId, groupId }) => {
        setTimeout(async () => {
            try {
                const call = await VideoCall.findById(callId);
                if (call && call.status === "ringing") {
                    call.status = "missed";
                    call.endedAt = new Date();
                    await call.save();

                    emitToUser(call.initiatedBy, "callMissed", { callId });

                    if (callType === "direct") {
                        emitToUser(receiverId, "callMissed", { callId });
                    } else {
                        const group = await Group.findById(groupId).populate("members", "_id");
                        if (group) {
                            group.members.forEach(m => {
                                if (m._id.toString() !== call.initiatedBy.toString()) {
                                    emitToUser(m._id, "callMissed", { callId });
                                }
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Missed call timer error:", err.message);
            }
        }, 30000);
    });


    socket.on("disconnect", async () => {
        console.log("❌ Disconnected:", socket.id);

        if (userId && userSocketMap[userId]) {
            userSocketMap[userId].delete(socket.id);

            if (userSocketMap[userId].size === 0) {
                delete userSocketMap[userId];

                // Auto-cancel ringing calls if caller disconnects
                try {
                    const activeCalls = await VideoCall.find({
                        initiatedBy: userId,
                        status: "ringing",
                    });
                    for (const call of activeCalls) {
                        call.status = "cancelled";
                        call.endedAt = new Date();
                        await call.save();
                        if (call.callType === "direct" && call.receiverId) {
                            emitToUser(call.receiverId, "callCancelled", { callId: call._id });
                        }
                    }
                } catch (err) {
                    console.error("Disconnect cleanup error:", err.message);
                }
            }
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });



})



export { io, server, app }