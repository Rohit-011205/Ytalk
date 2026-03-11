import mongoose from "mongoose"

const videoCallSchema = new mongoose.Schema({

    roomName: {
        type: String,
        required: true,
        // unique: true,
    },
    callType: {
        type: String,
        enum: ['direct', 'group'],
        required: true,
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        default: null,
    },
    participants: [{
        // userId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User",
        // },
        // joinedAt: {
        //     type: Date,
        //     default: Date.now(),
        // },
        // leftAt: {
        //     type: Date,
        //     default: null,
        // },
        // hasVideo: {
        //     type: Boolean,
        //     default: null,
        // },
        // hasAudio: {
        //     type: Boolean,
        //     default: null,
        // },
        // isScreenSharing: {
        //     type: Boolean, default: false,
        // }
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    status: {
        type: String,
        enum: ["ringing", "active", "ended", "declined", "missed", "cancelled"],
        default: "ringing",
    },


    endedAt: {
        type: Date,
        default: null,
    },
    startedAt: {
        type: Date,
        default: null,
    },


}, { timestamps: true })

const VideoCall = mongoose.model("VideoCall", videoCallSchema);
export default VideoCall;
