import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // receiverId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User",
        //     required: true,
        // },
        // groupId:{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Group",
        // },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: function () {
                return !this.groupId; // required only for 1-to-1 chats
            }
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: function () {
                return !this.receiverId; // required only for group chats
            }
        },

        text: {
            type: String,
        },
        image: {
            type: String,
        },
        isAiResponse: {
            type: Boolean,
            default: false
        }

    },

    { timestamps: true }
)
const Message = mongoose.model("Message", messageSchema)

export default Message