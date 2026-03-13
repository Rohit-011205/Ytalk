import User from "../Models/user.model.js"
import Message from "../Models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId } from "../lib/socket.io.js"
import { io } from "../lib/socket.io.js"
import { getConversationContext, generateAiResponse } from "./Aicontroller.js"


export const getUserForSidebar = async (req, res) => {

    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json(filteredUsers)

    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { receiverId: myId, senderId: userToChatId },

            ],
        })
        res.status(200).json(messages)


    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// export const sendMessage = async (req, res) => {
//     try {
//         const { text, image } = req.body;
//         const { id: receiverId } = req.params

//         const senderId = req.user._id

//         let imageUrl;
//         if (image) {
//             const uploadRespone = await cloudinary.uploader.upload(image);
//             imageUrl = uploadRespone.secure_url
//         }

//         const newMessage = new Message({
//             senderId,
//             receiverId,
//             text,
//             image: imageUrl,
//         });

//         await newMessage.save();

//         const receiverSocketId = getReceiverSocketId(receiverId);
//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit("newMessage", newMessage);
//         }

//         if (text && /@dogeshbhai\b/i.test(text)) {
//             const cleanText = text.replace(/@dogeshbhai\b/gi, '').trim();
//             const context = await getConversationContext(senderId, receiverId);
//             const aiResponseText = await generateAiResponse(cleanText, context);

//             const aiMessage = new Message({
//                 senderId: process.env.AI_AGENT_ID, // Ensure this is in your .env
//                 receiverId: senderId, // Dogesh replies back to the sender
//                 text: aiResponseText,
//             });

//             await aiMessage.save();

//             const senderSocketId = getReceiverSocketId(senderId);

//             if (senderSocketId) io.to(senderSocketId).emit("newMessage", aiMessage);
//             if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", aiMessage);

//         }
//             res.status(201).json(newMessage);
//         }
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Save user's message
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        await newMessage.save();

        // Emit to receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // ✅ DOGESH BHAI TRIGGER

        const isPersonalAIChat = receiverId.toString() === process.env.AI_AGENT_ID

        const isOtherChat = text && /@dogeshbhai\b/i.test(text)

        if (isPersonalAIChat || isOtherChat) {

            if (senderId.toString() === process.env.AI_AGENT_ID) {
                return res.status(201).json(newMessage)
            }

            console.log("🐕 Dogesh Bhai activated!");

            // Clean prompt (remove @dogeshbhai)
            const cleanText = isOtherChat ? text.replace(/@dogeshbhai\b/gi, '').trim() : text;
            if (cleanText) {
                // Get context
                const context = await getConversationContext(senderId, receiverId);

                // Generate Dogesh response
                const aiResponseText = await generateAiResponse(cleanText, context);


                // Save Dogesh message
                const dogeshMessage = new Message({
                    senderId: process.env.AI_AGENT_ID,
                    receiverId: isPersonalAIChat? senderId.toString() : receiverId.toString(),
                    text: aiResponseText,
                    isAiResponse: true 
                });
                await dogeshMessage.save();

                // Emit to sender (main recipient)
                const senderSocketId = getReceiverSocketId(senderId.toString());
                if (isPersonalAIChat) {
                    // Personal chat: only sender needs to see the reply
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("newMessage", dogeshMessage);
                    }
                } else {
                    // Other chat: both people in that chat see Dogesh's reply
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("newMessage", dogeshMessage);
                    }
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit("newMessage", dogeshMessage);
                    }
                    //  io.to(senderId).emit("newMessage", dogeshMessage);
                    //   io.to(receiverSocketId).emit("newMessage", dogeshMessage);
                }

                console.log("🐕 Dogesh replied:", aiResponseText.substring(0, 50) + "...");
            }
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getLastMessages = async (req, res) => {
    try {
        const myId = req.user._id;

        // Get all users except me
        const users = await User.find({ _id: { $ne: myId } }).select("_id");

        const lastMessages = await Promise.all(
            users.map(async (user) => {
                // Get the last message between me and this user
                const lastMsg = await Message.findOne({
                    $or: [
                        { senderId: myId, receiverId: user._id },
                        { senderId: user._id, receiverId: myId },
                    ]
                }).sort({ createdAt: -1 }); // newest first

                // Count unread messages (they sent, I haven't read)
                const unreadCount = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: myId,
                    read: false // only if you have a read field
                });

                if (!lastMsg) return null; // no conversation yet

                return {
                    userId: user._id,
                    lastMessage: lastMsg.text || (lastMsg.image ? '📷 Photo' : ''),
                    lastTime: lastMsg.createdAt,
                    unread: unreadCount,
                };
            })
        );

        // Remove nulls (users with no messages)
        const filtered = lastMessages.filter(Boolean);

        res.status(200).json(filtered);

    } catch (error) {
        console.error("Error in getLastMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}