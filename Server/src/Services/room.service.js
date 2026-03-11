import Room from "../Models/room.model.js";

class RoomService {
    async addUserToRoom(roomId, userId, username) {

        let room = await Room.findById(roomId)

        if (!room) {
            room = new Room({
                _id: roomId,
                participants: [{ userId, username, producers: [], joinedAt: new Date() }]
            })
        }
        else {
            const existingParticipant = room.participants.find(
                (p) => p.userId.toString() === userId.toString()
            )
      
            if (!existingParticipant) {
                room.participants.push({
                    userId,
                    username,
                    producers: [],
                    joinedAt: new Date(),
                });
            }
        }

    }
}