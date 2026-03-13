import User from "../Models/user.model.js"
import Message from "../Models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId } from "../lib/socket.io.js"
import { io } from "../lib/socket.io.js"
import { getConversationContext, generateAiResponse } from "./Aicontroller.js"
import { emitToUser } from "../lib/socket.io.js"


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
        const AI_ID = process.env.AI_AGENT_ID

        const orConditions = [
            // Normal messages
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
        ];

        if (AI_ID) {
            orConditions.push(
                // ✅ All AI messages always have receiverId = myId now
                // Works for personal chat AND @dogeshbhai in friend's chat
                { senderId: myId, receiverId: AI_ID },
                { senderId: AI_ID, receiverId: myId, isAiResponse: true },
            );
        }

        const messages = await Message.find({ $or: orConditions })
            .sort({ createdAt: 1 });



        // const orConditions = [
        //     { senderId: myId, receiverId: userToChatId },
        //     { senderId: userToChatId, receiverId: myId },
        // ];

        // if (AI_ID) {
        //     orConditions.push(
        //         // Personal AI chat replies
        //         { senderId: AI_ID, receiverId: myId, isAiResponse: true },
        //         // ✅ Key fix: also fetch AI replies where receiverId is the other person
        //         // (when @dogeshbhai is triggered in someone else's chat)
        //         { senderId: AI_ID, receiverId: userToChatId, isAiResponse: true },
        //     );
        // }

        // const messages = await Message.find({ $or: orConditions })
        //     .sort({ createdAt: 1 });

        res.status(200).json(messages)


    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

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
        emitToUser(receiverId.toString(), "newMessage", newMessage);
        emitToUser(senderId.toString(), "newMessage", newMessage);

        const isPersonalAIChat = receiverId.toString() === process.env.AI_AGENT_ID;
        const isOtherChat = text && /@dogeshbhai\b/i.test(text);

        if (isPersonalAIChat || isOtherChat) {
            if (senderId.toString() === process.env.AI_AGENT_ID) {
                return res.status(201).json(newMessage);
            }

            const cleanText = isOtherChat
                ? text.replace(/@dogeshbhai\b/gi, '').trim()
                : text;

            if (cleanText) {
                const context = await getConversationContext(senderId, receiverId);
                const aiResponseText = await generateAiResponse(cleanText, context);

                if (isPersonalAIChat) {
                    // Personal chat: one message, receiver = sender
                    const dogeshMessage = new Message({
                        senderId: process.env.AI_AGENT_ID,
                        receiverId: senderId.toString(),
                        text: aiResponseText,
                        isAiResponse: true,
                    });
                    await dogeshMessage.save();
                    emitToUser(senderId.toString(), "newMessage", dogeshMessage);

                } else {
                    // ✅ Friend chat: save TWO messages so both A and B can fetch on reload
                    const dogeshForA = new Message({
                        senderId: process.env.AI_AGENT_ID,
                        receiverId: senderId.toString(),   // A gets their own copy
                        text: aiResponseText,
                        isAiResponse: true,
                    });
                    await dogeshForA.save();

                    const dogeshForB = new Message({
                        senderId: process.env.AI_AGENT_ID,
                        receiverId: receiverId.toString(), // B gets their own copy
                        text: aiResponseText,
                        isAiResponse: true,
                    });
                    await dogeshForB.save();

                    emitToUser(senderId.toString(), "newMessage", dogeshForA);
                    emitToUser(receiverId.toString(), "newMessage", dogeshForB);
                }
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
                    read: false 
                });

                if (!lastMsg) return null;

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