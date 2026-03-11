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
        if (text && /@dogeshbhai\b/i.test(text)) {
            console.log("🐕 Dogesh Bhai activated!");
            
            // Clean prompt (remove @dogeshbhai)
            const cleanText = text.replace(/@dogeshbhai\b/gi, '').trim();
            if (cleanText) {
                // Get context
                const context = await getConversationContext(senderId, receiverId);
                
                // Generate Dogesh response
                const aiResponseText = await generateAiResponse(cleanText);

                // Save Dogesh message
                const dogeshMessage = new Message({
                    senderId: process.env.AI_AGENT_ID,
                    receiverId: senderId.toString(), // Dogesh replies to sender
                    text: aiResponseText,
                    isAiResponse: true // Add this field to your Message model if not already
                });
                await dogeshMessage.save();

                // Emit to sender (main recipient)
                const senderSocketId = getReceiverSocketId(senderId.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit("newMessage", dogeshMessage);
                }
                
                // Also emit to receiver if they're in chat
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", dogeshMessage);
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