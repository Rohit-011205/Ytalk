import Producer from "../Models/producer.model";

class ProducerService {

    async saveProducer(roomId, userId, producerId, kind, mediaTag) {
        const producer = new Producer({
            roomId,
            userId,
            producerId,
            kind,
            appData: {
                mediaTag,
            },

        })

        await producer.save()
        return producer
    }

    async getProducerByRoom(roomId) {
        return await Producer.find(
            { roomId, status: "active" }
        )
            .select("userId producerId kind appData")
            .populate("userId Fullname profilePic");
    }

    async getUserProducers(roomId, userId) {
        return await Producer.find({ roomId, userId, status: "active" });
    }

    async closeProducer(userId) {
        return await Producer.findOneAndUpdate(
            { producerId },
            { status: "closed" },
            { new: true }
        );
    }

    async closeAllUserProducers(userId, roomId) {
        return await Producer.updateMany(
            { userId, roomId, status: "active" },
            { status: "closed" }
        );
    }

    async getExistingProducer(roomId,excludeUserId){
        return await Producer.find({
            roomId,
            userID:{$ne: excludeUserId},
            status: "active"
        }).populate("userID","Fullname,profilePic")
    }

}

export default new ProducerService()