import mongoose from 'mongoose';

export const groupSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        profilePic: {
            type: String,
            default: "https://ui-avatars.com/api/?name=Group&background=667eea",
        },
        description: {
            type: String,
            default: "",
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        lastMessage: {
            // type: Date,
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",   // ✅ FIX
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: null,
        },



    },
    { timestamps: true }
)

groupSchema.pre("save", function (next) {
    if (this.isNew) {
        if (!this.admins.some(id => id.equals(this.createdBy))) {
            this.admins.push(this.createdBy);
        }
        if (!this.members.some(id => id.equals(this.createdBy))) {
            this.members.push(this.createdBy);
        }
    }
    // next();
})

const Group = mongoose.model("Group", groupSchema);
export default Group;