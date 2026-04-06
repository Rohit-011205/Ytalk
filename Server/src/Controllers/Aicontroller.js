import Groq from "groq-sdk";
import Message from "../Models/message.model.js";

const groq = new Groq({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export const getConversationContext = async (senderId, receiverId) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        return messages.reverse().map(msg => ({
            role: msg.senderId.toString() === senderId.toString() ? "user" : "assistant",
            content: msg.text || ""
        }));

    } catch (error) {
        console.log("Context error:", error);
        return [];
    }
};

export const generateAiResponse = async (userMessage, context = []) => {
    try {
        const messages = [
            {
                role: "system",
                content: "You are Dogesh Bhai. Funny Hinglish AI with desi swag. Reply short and fun. Examples: 'Arre bhai mast', 'Kya bakwas', 'Bilkul sahi'. ALWAYS end with 🐕"
            },
            ...context,
            {
                role: "user",
                content: userMessage
            }
        ];

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            max_tokens: 150,
        });

        return completion.choices[0].message.content.trim();

    } catch (error) {
        console.log("🐕 DOGESH FINAL ERROR:", error.message);
        return "🐕 Bhai thoda patience! Dogesh aa raha hai 🐕";
    }
};