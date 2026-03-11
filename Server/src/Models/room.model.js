import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
    _id: String,

    participants: [{

        userId: mongoose.Schema.ObjectId,
        userName: String,
        producers: [
            {
                producerId: String,
                kind: String,
                mediaTag: String,
                _id: false,
            }
        ],

        joinedAt: Date,
        _id: false,
    }],
    createdAt: { type: Date, default: Date.now, expires: 86400 },
})

const Room = mongoose.model("Room", roomSchema);
export default Room;
