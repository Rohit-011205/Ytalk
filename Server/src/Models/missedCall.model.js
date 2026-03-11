import mongoose from "mongoose";

const missedCallSchema = new mongoose.Schema({

    callId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoCall',
        required: true,
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    callerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['1-on-1', 'group'],
    },
    notifiedAt: {
        type: Date,
        default: null,
    },
    viewed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const MissedCall = mongoose.model('MissedCall', missedCallSchema);
export default MissedCall;