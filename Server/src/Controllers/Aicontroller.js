import { GoogleGenerativeAI } from '@google/generative-ai';
import Message from '../Models/message.model.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

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
            role: msg.senderId.toString() === senderId.toString() ? 'user' : 'model',
            parts: [{ text: msg.text || "" }]
        }));
    } catch (error) {
        console.log("Context error:", error);
        return [];
    }
};

export const generateAiResponse = async (userMessage, context = []) => {
    try {
        // ✅ CORRECT SDK USAGE - Simple strings only!
       const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
        
        // Build conversation as PLAIN TEXT (Gemini SDK format)
        let fullPrompt = "You are Dogesh Bhai. Funny Hinglish AI with desi swag. Reply short and fun. Examples: 'Arre bhai mast', 'Kya bakwas', 'Bilkul sahi'. ALWAYS end with 🐕\n\n";
        
        // Add context as simple text
        if (context.length > 0) {
            fullPrompt += "Recent chat:\n";
            context.slice(-4).forEach((msg, i) => {
                fullPrompt += `${i % 2 === 0 ? 'User' : 'Dogesh'}: ${msg.parts[0].text}\n`;
            });
            fullPrompt += "\n";
        }
        
        fullPrompt += `User: ${userMessage}\nDogesh Bhai:`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        
        return response.text().trim();
        
    } catch (error) {
        console.log("🐕 DOGESH FINAL ERROR:", error.message);
        return "🐕 Bhai thoda patience! Dogesh aa raha hai 🐕";
    }
};

